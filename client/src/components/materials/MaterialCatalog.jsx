import { useState } from 'react'
import MaterialCard from './MaterialCard'
import useEstimateStore from '../../store/useEstimateStore'

const CATEGORIES = [
  { key: 'floor', label: '바닥재', icon: '🪵' },
  { key: 'wall', label: '벽지', icon: '🎨' },
  { key: 'ceiling', label: '천장재', icon: '⬜' },
  { key: 'baseboard', label: '걸레받이', icon: '📏' },
]

export default function MaterialCatalog({ materials }) {
  const [activeCategory, setActiveCategory] = useState('floor')
  const { selectedMaterials, selectMaterial } = useEstimateStore()

  if (!materials) return null

  const items = materials[activeCategory] || []

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* 카테고리 탭 */}
      <div className="flex border-b border-gray-200">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 transition-colors ${
              activeCategory === cat.key
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-base">{cat.icon}</span>
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
