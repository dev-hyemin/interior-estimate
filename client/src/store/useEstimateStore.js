import { create } from 'zustand'
import { calculateCosts } from '../utils/costCalculator'

const useEstimateStore = create((set, get) => ({
  // 업로드된 이미지 (File 객체)
  uploadedImage: null,
  uploadedImageUrl: null,

  // Claude Vision 분석 결과
  analysisResult: null,
  // { roomType: 'living_room', dimensions: { width, length, height }, confidence }

  // 선택된 자재
  selectedMaterials: {
    floor: null,
    wall: null,
    ceiling: null,
    baseboard: null,
  },

  // 계산된 비용
  costs: {
    floor: { material: 0, labor: 0 },
    wall: { material: 0, labor: 0 },
    ceiling: { material: 0, labor: 0 },
    baseboard: { material: 0, labor: 0 },
    subtotal: 0,
    vat: 0,
    total: 0,
  },

  // 고객 정보
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
      const costs = dims ? calculateCosts(newMaterials, dims) : state.costs
      return { selectedMaterials: newMaterials, costs }
    })
  },

  setCustomerInfo: (info) =>
    set((state) => ({ customerInfo: { ...state.customerInfo, ...info } })),

  reset: () =>
    set({
      uploadedImage: null,
      uploadedImageUrl: null,
      analysisResult: null,
      selectedMaterials: { floor: null, wall: null, ceiling: null, baseboard: null },
      costs: { floor: { material: 0, labor: 0 }, wall: { material: 0, labor: 0 }, ceiling: { material: 0, labor: 0 }, baseboard: { material: 0, labor: 0 }, subtotal: 0, vat: 0, total: 0 },
      customerInfo: { name: '', address: '', phone: '' },
    }),
}))

export default useEstimateStore
