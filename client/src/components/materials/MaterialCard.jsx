export default function MaterialCard({ material, isSelected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(material)}
      className={`w-full text-left rounded-lg border-2 p-3 transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* 색상 미리보기 */}
        <div
          className="w-10 h-10 rounded-md flex-shrink-0 border border-gray-200"
          style={{ backgroundColor: material.color }}
        />
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm truncate ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
            {material.name}
          </p>
          <p className="text-xs text-gray-500 truncate">{material.description}</p>
          <p className="text-xs font-semibold text-gray-700 mt-0.5">
            {material.unitPrice.toLocaleString()}원/m²
          </p>
        </div>
        {isSelected && (
          <div className="text-blue-500 flex-shrink-0">✓</div>
        )}
      </div>
    </button>
  )
}
