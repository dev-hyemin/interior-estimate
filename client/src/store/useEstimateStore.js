import { create } from 'zustand'
import { calculateCosts } from '../utils/costCalculator'

const ALL_CATEGORIES = ['floor', 'wall', 'ceiling', 'baseboard', 'partition', 'lighting', 'tile', 'film']

const emptyMaterials = () =>
  Object.fromEntries(ALL_CATEGORIES.map((c) => [c, null]))

const emptyCosts = () => ({
  ...Object.fromEntries(ALL_CATEGORIES.map((c) => [c, { material: 0, labor: 0 }])),
  subtotal: 0,
  vat: 0,
  total: 0,
})

const useEstimateStore = create((set, get) => ({
  uploadedImage: null,
  uploadedImageUrl: null,

  analysisResult: null,

  selectedMaterials: emptyMaterials(),

  // 수량 직접 입력 (partition: m², lighting: 개, tile: m², film: m²)
  quantities: {
    partition: 0,
    lighting: 0,
    tile: 0,
    film: 0,
  },

  // 단가 직접 수정 (견적서 편집용) { [materialId]: { unitPrice, laborRate } }
  priceOverrides: {},

  costs: emptyCosts(),

  customerInfo: {
    name: '',
    address: '',
    phone: '',
  },

  // Actions
  setUploadedImage: (file, url) => set({ uploadedImage: file, uploadedImageUrl: url }),

  setAnalysisResult: (result) => set({ analysisResult: result }),

  updateDimensions: (dimensions) =>
    set((state) => ({
      analysisResult: state.analysisResult
        ? { ...state.analysisResult, dimensions: { ...state.analysisResult.dimensions, ...dimensions } }
        : null,
    })),

  selectMaterial: (category, material) => {
    set((state) => {
      const newMaterials = { ...state.selectedMaterials, [category]: material }
      const dims = state.analysisResult?.dimensions
      const costs = dims ? calculateCosts(newMaterials, dims, state.quantities) : state.costs
      return { selectedMaterials: newMaterials, costs }
    })
  },

  setQuantity: (category, value) => {
    set((state) => {
      const newQty = { ...state.quantities, [category]: Number(value) || 0 }
      const dims = state.analysisResult?.dimensions
      const costs = dims ? calculateCosts(state.selectedMaterials, dims, newQty) : state.costs
      return { quantities: newQty, costs }
    })
  },

  setPriceOverride: (materialId, field, value) => {
    set((state) => {
      const newOverrides = {
        ...state.priceOverrides,
        [materialId]: { ...state.priceOverrides[materialId], [field]: Number(value) || 0 },
      }
      // 오버라이드 적용 후 비용 재계산: selectedMaterials에 override 반영
      const overriddenMaterials = Object.fromEntries(
        ALL_CATEGORIES.map((cat) => {
          const mat = state.selectedMaterials[cat]
          if (!mat) return [cat, null]
          const ov = newOverrides[mat.id]
          return [cat, ov ? { ...mat, ...ov } : mat]
        })
      )
      const dims = state.analysisResult?.dimensions
      const costs = dims ? calculateCosts(overriddenMaterials, dims, state.quantities) : state.costs
      return { priceOverrides: newOverrides, costs }
    })
  },

  // 오버라이드가 반영된 자재 반환
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
