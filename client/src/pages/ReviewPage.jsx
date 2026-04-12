import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import DimensionEditor from '../components/upload/DimensionEditor'
import useEstimateStore from '../store/useEstimateStore'

export default function ReviewPage() {
  const navigate = useNavigate()
  const { uploadedImageUrl, analysisResult } = useEstimateStore()

  if (!analysisResult) {
    navigate('/')
    return null
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">치수 검토</h2>
          <p className="text-gray-500">AI가 분석한 치수를 확인하고 필요시 수정해주세요.</p>
        </div>

        {/* 업로드된 이미지 미리보기 */}
        {uploadedImageUrl && (
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 bg-white">
            <img
              src={uploadedImageUrl}
              alt="업로드된 도면"
              className="w-full max-h-64 object-contain p-4"
            />
          </div>
        )}

        <DimensionEditor />

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            다시 업로드
          </button>
          <button
            onClick={() => navigate('/design')}
            className="flex-2 flex-grow py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            3D 디자인으로 →
          </button>
        </div>
      </div>
    </Layout>
  )
}
