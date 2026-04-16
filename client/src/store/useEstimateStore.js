import { create } from 'zustand'
import { calculateCosts } from '../utils/costCalculator'

const ALL_CATEGORIES = ['floor', 'wall', 'ceiling', 'baseboard', 'partition', 'lighting', 'tile', 'film']

const ROOM_LABEL_MAP = {
  living_room: '거실', bedroom: '침실', kitchen: '주방', bathroom: '욕실',
  office: '사무실', dining_room: '식당', study: '서재', hallway: '복도',
  utility: '다용도실', entrance: '현관', balcony: '발코니',
}

const emptyMaterials = () => Object.fromEntries(ALL_CATEGORIES.map((c) => [c, null]))
const emptyCosts = () => ({
  ...Object.fromEntries(ALL_CATEGORIES.map((c) => [c, { material: 0, labor: 0 }])),
  subtotal: 0, vat: 0, total: 0,
})

/** 구형(단일 방) 응답을 schemaVersion 1 (rooms[]) 형식으로 정규화 */
function normalizeAnalysisResult(raw) {
  if (!raw) return null

  // 이미 새 형식
  if (raw.schemaVersion === 1 && Array.isArray(raw.rooms)) {
    const primary = raw.rooms[0]
    return {
      ...raw,
      roomType: raw.roomType ?? primary?.type,
      dimensions: raw.dimensions ?? {
        width: raw.floorPlanBounds?.width ?? primary?.rect.w ?? 4.5,
        length: raw.floorPlanBounds?.depth ?? primary?.rect.d ?? 6.0,
        height: primary?.height ?? 2.4,
      },
      confidence: raw.confidence ?? raw.overallConfidence ?? 0.5,
    }
  }

  // 구형 형식 → 변환
  if (raw.roomType && raw.dimensions) {
    const { width, length, height = 2.4 } = raw.dimensions
    return {
      schemaVersion: 1,
      floorPlanBounds: { width, depth: length },
      rooms: [{
        id: 'r1',
        type: raw.roomType,
        label: ROOM_LABEL_MAP[raw.roomType] ?? raw.roomType,
        rect: { x: 0, y: 0, w: width, d: length },
        height,
        confidence: raw.confidence ?? 0.5,
      }],
      overallConfidence: raw.confidence ?? 0.5,
      roomType: raw.roomType,
      dimensions: raw.dimensions,
      confidence: raw.confidence ?? 0.5,
    }
  }

  return raw
}

/** rooms[] 또는 단일 dimensions 중 costCalculator에 넘길 값 선택 */
function getAreasSource(analysisResult) {
  if (analysisResult?.rooms?.length > 0) return analysisResult.rooms
  return analysisResult?.dimensions ?? null
}

const useEstimateStore = create((set, get) => ({
  uploadedImage: null,
  uploadedImageUrl: null,
  analysisResult: null,
  selectedMaterials: emptyMaterials(),
  quantities: { partition: 0, lighting: 0, tile: 0, film: 0 },
  priceOverrides: {},
  costs: emptyCosts(),
  customerInfo: { name: '', address: '', phone: '' },

  // ─── Actions ─────────────────────────────────────────────────────────────

  setUploadedImage: (file, url) => set({ uploadedImage: file, uploadedImageUrl: url }),

  setAnalysisResult: (result) =>
    set({ analysisResult: normalizeAnalysisResult(result) }),

  /** 단일 방(구형 호환) or 다중 방의 첫 번째 방 치수 수정 */
  updateDimensions: (dimensions) =>
    set((state) => {
      if (!state.analysisResult) return {}
      const ar = state.analysisResult
      const rooms = ar.rooms
        ? ar.rooms.map((r, i) =>
            i === 0
              ? {
                  ...r,
                  rect: {
                    ...r.rect,
                    w: dimensions.width ?? r.rect.w,
                    d: dimensions.length ?? r.rect.d,
                  },
                  height: dimensions.height ?? r.height,
                }
              : r
          )
        : ar.rooms
      const newDimensions = { ...ar.dimensions, ...dimensions }
      return {
        analysisResult: {
          ...ar,
          rooms,
          dimensions: newDimensions,
          floorPlanBounds: ar.floorPlanBounds
            ? {
                width: dimensions.width ?? ar.floorPlanBounds.width,
                depth: dimensions.length ?? ar.floorPlanBounds.depth,
              }
            : ar.floorPlanBounds,
        },
      }
    }),

  /** rooms[] 중 특정 방의 rect / height / type / label 수정 */
  updateRoom: (roomId, patch) =>
    set((state) => {
      if (!state.analysisResult?.rooms) return {}
      const rooms = state.analysisResult.rooms.map((r) =>
        r.id === roomId ? { ...r, ...patch, rect: { ...r.rect, ...(patch.rect ?? {}) } } : r
      )
      // 첫 번째 방이 바뀌면 legacy dimensions도 갱신
      const primary = rooms[0]
      return {
        analysisResult: {
          ...state.analysisResult,
          rooms,
          roomType: primary?.type ?? state.analysisResult.roomType,
          dimensions: {
            width: state.analysisResult.floorPlanBounds?.width ?? primary?.rect.w,
            length: state.analysisResult.floorPlanBounds?.depth ?? primary?.rect.d,
            height: primary?.height ?? state.analysisResult.dimensions?.height,
          },
        },
      }
    }),

  selectMaterial: (category, material) => {
    set((state) => {
      const newMaterials = { ...state.selectedMaterials, [category]: material }
      const src = getAreasSource(state.analysisResult)
      const costs = src ? calculateCosts(newMaterials, src, state.quantities) : state.costs
      return { selectedMaterials: newMaterials, costs }
    })
  },

  setQuantity: (category, value) => {
    set((state) => {
      const newQty = { ...state.quantities, [category]: Number(value) || 0 }
      const src = getAreasSource(state.analysisResult)
      const costs = src ? calculateCosts(state.selectedMaterials, src, newQty) : state.costs
      return { quantities: newQty, costs }
    })
  },

  setPriceOverride: (materialId, field, value) => {
    set((state) => {
      const newOverrides = {
        ...state.priceOverrides,
        [materialId]: { ...state.priceOverrides[materialId], [field]: Number(value) || 0 },
      }
      const overriddenMaterials = Object.fromEntries(
        ALL_CATEGORIES.map((cat) => {
          const mat = state.selectedMaterials[cat]
          if (!mat) return [cat, null]
          const ov = newOverrides[mat.id]
          return [cat, ov ? { ...mat, ...ov } : mat]
        })
      )
      const src = getAreasSource(state.analysisResult)
      const costs = src ? calculateCosts(overriddenMaterials, src, state.quantities) : state.costs
      return { priceOverrides: newOverrides, costs }
    })
  },

  getEffectiveMaterials: () => {
    const { selectedMaterials, priceOverrides } = get()
    return Object.fromEntries(
      ALL_CATEGORIES.map((cat) => {
        const mat = selectedMaterials[cat]
        if (!mat) return [cat, null]
        const ov = priceOverrides[mat.id]
        return [cat, ov ? { ...mat, ...ov } : mat]
      })
    )
  },

  setCustomerInfo: (info) =>
    set((state) => ({ customerInfo: { ...state.customerInfo, ...info } })),

  reset: () =>
    set({
      uploadedImage: null,
      uploadedImageUrl: null,
      analysisResult: null,
      selectedMaterials: emptyMaterials(),
      quantities: { partition: 0, lighting: 0, tile: 0, film: 0 },
      priceOverrides: {},
      costs: emptyCosts(),
      customerInfo: { name: '', address: '', phone: '' },
    }),
}))

export default useEstimateStore
