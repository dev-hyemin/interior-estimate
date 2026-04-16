import useEstimateStore from '../../store/useEstimateStore'

const ROOM_TYPE_OPTIONS = [
  { value: 'living_room', label: '거실' },
  { value: 'bedroom', label: '침실' },
  { value: 'kitchen', label: '주방' },
  { value: 'bathroom', label: '욕실' },
  { value: 'office', label: '사무실' },
  { value: 'dining_room', label: '식당' },
  { value: 'study', label: '서재' },
  { value: 'hallway', label: '복도' },
  { value: 'utility', label: '다용도실' },
  { value: 'entrance', label: '현관' },
  { value: 'balcony', label: '발코니' },
]

const ROOM_LABEL_MAP = Object.fromEntries(
  ROOM_TYPE_OPTIONS.map(({ value, label }) => [value, label])
)

function ConfidenceBadge({ confidence }) {
  const pct = Math.round((confidence ?? 0) * 100)
  const isHigh = pct >= 70
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        isHigh ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
      }`}
    >
      신뢰도 {pct}%
    </span>
  )
}

function RoomCard({ room, onUpdate }) {
  const handleNum = (field, value) => {
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0) {
      if (field === 'height') onUpdate({ height: num })
      else onUpdate({ rect: { [field === 'width' ? 'w' : 'd']: num } })
    }
  }

  const handleType = (value) => {
    onUpdate({ type: value, label: ROOM_LABEL_MAP[value] ?? value })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <select
          defaultValue={room.type}
          onChange={(e) => handleType(e.target.value)}
          className="text-sm font-semibold text-gray-800 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
        >
          {ROOM_TYPE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <ConfidenceBadge confidence={room.confidence} />
      </div>

      {room.confidence < 0.7 && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-xs">
          분석 신뢰도가 낮습니다. 치수를 직접 확인하고 수정해주세요.
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'width', label: '너비 (m)', defaultVal: room.rect?.w },
          { key: 'depth', label: '길이 (m)', defaultVal: room.rect?.d },
          { key: 'height', label: '높이 (m)', defaultVal: room.height },
        ].map(({ key, label, defaultVal }) => (
          <div key={key}>
            <label className="block text-xs text-gray-500 mb-1">{label}</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              defaultValue={defaultVal}
              onChange={(e) => handleNum(key, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-center text-sm font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// 단일 방(구형) 편집 UI
function SingleRoomEditor({ analysisResult, updateDimensions }) {
  const { roomType, dimensions, confidence } = analysisResult

  const handleChange = (key, value) => {
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0) updateDimensions({ [key]: num })
  }

  const label = ROOM_LABEL_MAP[roomType] ?? roomType

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">방 종류: {label}</h2>
        <ConfidenceBadge confidence={confidence} />
      </div>

      {confidence < 0.7 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          도면 분석 신뢰도가 낮습니다. 치수를 직접 확인하고 수정해주세요.
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'width', label: '너비 (m)' },
          { key: 'length', label: '길이 (m)' },
          { key: 'height', label: '높이 (m)' },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm text-gray-600 mb-1">{label}</label>
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

export default function DimensionEditor() {
  const { analysisResult, updateDimensions, updateRoom } = useEstimateStore()
  if (!analysisResult) return null

  const rooms = analysisResult.rooms

  // 다중 방 모드
  if (rooms && rooms.length > 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">
          방 목록 ({rooms.length}개)
        </h2>
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onUpdate={(patch) => updateRoom(room.id, patch)}
          />
        ))}
        <p className="text-xs text-gray-400">
          * 치수를 수정하면 3D 뷰어와 비용 계산에 자동 반영됩니다.
        </p>
      </div>
    )
  }

  // 구형 단일 방 모드
  return <SingleRoomEditor analysisResult={analysisResult} updateDimensions={updateDimensions} />
}
