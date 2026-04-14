import { useState } from 'react'
import MaterialCard from './MaterialCard'
import useEstimateStore from '../../store/useEstimateStore'

const CATEGORIES = [
  { key: 'floor', label: '바닥재', icon: '🪵' },
  { key: 'wall', label: '벽지', icon: '🎨' },
  { key: 'ceiling', label: '천장재', icon: '⬜' },
  { key: 'baseboard', label: '걸레받이', icon: '📏' },
  { key: 'partition', label: '가벽', icon: '🧱' },
  { key: 'lighting', label: '조명', icon: '💡' },
  { key: 'tile', label: '타일', icon: '🟫' },
  { key: 'film', label: '필름', icon: '🎞️' },
]

export default function MaterialCatalog({ materials }) {
  const [activeCategory, setActiveCategory] = useState('floor')
  const { selectedMaterials, selectMaterial } = useEstimateStore()

  if (!materials) return null

  const items = materials[activeCategory] || []

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* 카테고리 탭 */}
      <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex-shrink-0 px-3 py-2.5 text-xs font-medium flex flex-col items-center gap-0.5 transition-colors min-w-[60px] ${
              activeCategory === cat.key
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-sm">{cat.icon}</span>
            <span>{cat.label}</span>
            {selectedMaterials[cat.key] && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            )}
          </button>
        ))}
      </div>

      {/* 자재 목록 */}
      <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
        {items.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            isSelected={selectedMaterials[activeCategory]?.id === material.id}
            onSelect={(m) => selectMaterial(activeCategory, m)}
          />
        ))}
      </div>
    </div>
  )
}
