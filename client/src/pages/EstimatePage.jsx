import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import EstimateTable from '../components/estimate/EstimateTable'
import PDFDownloadButton from '../components/estimate/PDFDownloadButton'
import useEstimateStore from '../store/useEstimateStore'

export default function EstimatePage() {
  const navigate = useNavigate()
  const { analysisResult, selectedMaterials, costs, customerInfo, setCustomerInfo } = useEstimateStore()

  if (!analysisResult) {
    navigate('/')
    return null
  }

  const hasMaterials = Object.values(selectedMaterials).some(Boolean)

  return (
    <Layout>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">견적서</h2>
        <p className="text-gray-500">고객 정보를 입력하고 PDF 견적서를 다운로드하세요.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 견적 명세 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">견적 명세</h3>
            </div>
            {hasMaterials ? (
              <EstimateTable
                selectedMaterials={selectedMaterials}
                costs={costs}
                dimensions={analysisResult.dimensions}
              />
            ) : (
              <div className="p-8 text-center text-gray-400">
                선택된 자재가 없습니다.{' '}
                <button
                  onClick={() => navigate('/design')}
                  className="text-blue-500 underline"
                >
                  자재 선택하러 가기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 고객 정보 + 다운로드 */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">고객 정보</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">고객명</label>
                <input
                  type="text"
                  placeholder="홍길동"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">주소</label>
                <input
                  type="text"
                  placeholder="서울시 강남구..."
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">연락처</label>
                <input
                  type="tel"
                  placeholder="010-0000-0000"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {hasMaterials && (
            <PDFDownloadButton
              customerInfo={customerInfo}
              analysisResult={analysisResult}
              selectedMaterials={selectedMaterials}
              costs={costs}
            />
          )}

          <button
            onClick={() => navigate('/design')}
            className="w-full py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            ← 디자인 수정
          </button>
        </div>
      </div>
    </Layout>
  )
}
