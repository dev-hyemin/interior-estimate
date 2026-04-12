import { PDFDownloadLink } from '@react-pdf/renderer'
import EstimatePDF from './EstimatePDF'

export default function PDFDownloadButton({ customerInfo, analysisResult, selectedMaterials, costs }) {
  const filename = `견적서_${customerInfo.name || '고객'}_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '').replace(/ /g, '')}.pdf`

  return (
    <PDFDownloadLink
      document={
        <EstimatePDF
          customerInfo={customerInfo}
          analysisResult={analysisResult}
          selectedMaterials={selectedMaterials}
          costs={costs}
        />
      }
      fileName={filename}
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3 ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              PDF 생성 중...
            </>
          ) : (
            <>
              📄 PDF 견적서 다운로드
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  )
}
