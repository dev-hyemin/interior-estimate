import useEstimateStore from '../../store/useEstimateStore'

const ROOM_TYPE_LABELS = {
  living_room: '거실',
  bedroom: '침실',
  kitchen: '주방',
  bathroom: '욕실',
  office: '사무실',
  dining_room: '식당',
  study: '서재',
  hallway: '복도',
}

export default function DimensionEditor() {
  const { analysisResult, updateDimensions } = useEstimateStore()
  if (!analysisResult) return null

  const { roomType, dimensions, confidence } = analysisResult

  const handleChange = (key, value) => {
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0) {
      updateDimensions({ [key]: num })
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          방 종류: {ROOM_TYPE_LABELS[roomType] || roomType}
        </h2>
        <span
          className={`text-sm px-3 py-1 rounded-full font-medium ${
            confidence >= 0.7
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          신뢰도 {Math.round(confidence * 100)}%
        </span>
      </div>

      {confidence < 0.7 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          ⚠️ 도면 분석 신뢰도가 낮습니다. 치수를 직접 확인하고 수정해주세요.
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'width', label: '너비 (m)', icon: '↔️' },
          { key: 'length', label: '길이 (m)', icon: '↕️' },
          { key: 'height', label: '높이 (m)', icon: '↑' },
        ].map(({ key, label, icon }) => (
          <div key={key}>
            <label className="block text-sm text-gray-600 mb-1">
              {icon} {label}
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              defaultValue={dimensions[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-lg font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        * 치수를 수정하면 3D 뷰어와 비용 계산에 자동 반영됩니다.
      </p>
    </div>
  )
}
