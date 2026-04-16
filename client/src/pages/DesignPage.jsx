import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import RoomCanvas from '../components/viewer3d/RoomCanvas'
import MaterialCatalog from '../components/materials/MaterialCatalog'
import CostSummary from '../components/materials/CostSummary'
import useEstimateStore from '../store/useEstimateStore'
import { useMaterials } from '../hooks/useMaterials'

export default function DesignPage() {
  const navigate = useNavigate()
  const { analysisResult, selectedMaterials, costs } = useEstimateStore()
  const { data: materials, isLoading } = useMaterials()

  if (!analysisResult) {
    navigate('/')
    return null
  }

  const { dimensions, rooms, floorPlanBounds } = analysisResult

  return (
    <Layout>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">3D 디자인</h2>
        <p className="text-gray-500">자재를 선택해 실시간으로 방을 꾸며보세요.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D 뷰어 */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-xl" style={{ height: '420px' }}>
            <RoomCanvas
              dimensions={dimensions}
              materials={selectedMaterials}
              rooms={rooms}
              floorPlanBounds={floorPlanBounds}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            마우스로 드래그하여 시점을 변경할 수 있습니다.
          </p>
        </div>

        {/* 사이드바: 자재 선택 + 비용 */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              자재 목록 불러오는 중...
            </div>
          ) : (
            <MaterialCatalog materials={materials} />
          )}
          <CostSummary costs={costs} selectedMaterials={selectedMaterials} />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => navigate('/review')}
          className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          ← 치수 수정
        </button>
        <button
          onClick={() => navigate('/estimate')}
          className="flex-2 flex-grow py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          견적서 생성 →
        </button>
      </div>
    </Layout>
  )
}
