import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ImageUploader from '../components/upload/ImageUploader'
import useEstimateStore from '../store/useEstimateStore'
import { useAnalyzeImage } from '../hooks/useAnalyzeImage'

export default function UploadPage() {
  const navigate = useNavigate()
  const { setUploadedImage, setAnalysisResult } = useEstimateStore()
  const { mutate: analyze, isPending, error } = useAnalyzeImage()

  const handleFileSelect = (file) => {
    const url = URL.createObjectURL(file)
    setUploadedImage(file, url)

    analyze(file, {
      onSuccess: (result) => {
        if (result.error === 'parse_failed') {
          // 수동 입력 fallback: 기본값으로 설정
          setAnalysisResult({
            roomType: 'living_room',
            dimensions: { width: 4.5, length: 6.0, height: 2.4 },
            confidence: 0,
          })
        } else {
          setAnalysisResult(result)
        }
        navigate('/review')
      },
    })
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">도면 업로드</h2>
          <p className="text-gray-500">고객의 도면 이미지를 업로드하면 AI가 자동으로 방 구조를 분석합니다.</p>
        </div>

        <ImageUploader onFileSelect={handleFileSelect} isLoading={isPending} />

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error.message}
          </div>
        )}

        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm text-gray-500">
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="text-2xl mb-2">🤖</div>
            <p>Claude AI 자동 분석</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="text-2xl mb-2">📐</div>
            <p>치수 자동 추출</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="text-2xl mb-2">🎨</div>
            <p>3D 시각화</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
