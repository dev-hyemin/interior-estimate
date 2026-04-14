import { formatKRW } from '../../utils/costCalculator'
import { calcAreas } from '../../utils/roomGeometry'
import useEstimateStore from '../../store/useEstimateStore'

const LABELS = {
  floor: '바닥재',
  wall: '벽지',
  ceiling: '천장재',
  baseboard: '걸레받이',
  partition: '가벽',
  lighting: '조명',
  tile: '타일',
  film: '필름',
}

const AREA_UNITS = {
  floor: 'm²', wall: 'm²', ceiling: 'm²', baseboard: 'm',
  partition: 'm²', lighting: '개/세트/m', tile: 'm²', film: 'm²',
}

const QUANTITY_CATEGORIES = ['partition', 'lighting', 'tile', 'film']

export default function EstimateTable({ selectedMaterials, costs, dimensions, editable = false }) {
  const areas = calcAreas(dimensions)
  const { quantities, setQuantity, priceOverrides, setPriceOverride, getEffectiveMaterials } = useEstimateStore()
  const effectiveMaterials = getEffectiveMaterials()

  const categories = Object.keys(LABELS).filter((cat) => selectedMaterials[cat])

  function getArea(cat) {
    if (QUANTITY_CATEGORIES.includes(cat)) return quantities[cat] ?? 0
    return areas[cat] ?? 0
  }

  function getUnitPrice(cat) {
    const mat = effectiveMaterials[cat]
    return mat?.unitPrice ?? 0
  }

  function getLaborRate(cat) {
    const mat = effectiveMaterials[cat]
    return mat?.laborRate ?? 0
  }

  if (categories.length === 0) return null

  return (
    <div className="overflow-x-auto">
      {editable && (
        <p className="text-xs text-blue-600 px-4 py-2 bg-blue-50 border-b border-blue-100">
          단가·시공률·수량을 직접 수정할 수 있습니다. 변경 즉시 합계에 반영됩니다.
        </p>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left py-3 px-3 font-semibold text-gray-700">구분</th>
            <th className="text-left py-3 px-3 font-semibold text-gray-700">자재명</th>
            <th className="text-right py-3 px-3 font-semibold text-gray-700">수량</th>
            <th className="text-right py-3 px-3 font-semibold text-gray-700">단가(원)</th>
            <th className="text-right py-3 px-3 font-semibold text-gray-700">시공률</th>
            <th className="text-right py-3 px-3 font-semibold text-gray-700">자재비</th>
            <th className="text-right py-3 px-3 font-semibold text-gray-700">시공비</th>
            <th className="text-right py-3 px-3 font-semibold text-gray-700">소계</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => {
            const mat = selectedMaterials[cat]
            const cost = costs[cat]
            const area = getArea(cat)
            const unitPrice = getUnitPrice(cat)
            const laborRate = getLaborRate(cat)
            const override = priceOverrides[mat.id] || {}

            return (
              <tr key={cat} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-3 font-medium text-gray-700 whitespace-nowrap">{LABELS[cat]}</td>
                <td className="py-2 px-3 text-gray-600 whitespace-nowrap">{mat.name}</td>

                {/* 수량 */}
                <td className="py-2 px-3 text-right">
                  {editable && QUANTITY_CATEGORIES.includes(cat) ? (
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={quantities[cat] ?? 0}
                      onChange={(e) => setQuantity(cat, e.target.value)}
                      className="w-20 text-right border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-gray-600">{area.toFixed(1)} {AREA_UNITS[cat]}</span>
                  )}
                </td>

                {/* 단가 */}
                <td className="py-2 px-3 text-right">
                  {editable ? (
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={override.unitPrice ?? mat.unitPrice}
                      onChange={(e) => setPriceOverride(mat.id, 'unitPrice', e.target.value)}
                      className="w-24 text-right border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-gray-600">{unitPrice.toLocaleString()}</span>
                  )}
                </td>

                {/* 시공률 */}
                <td className="py-2 px-3 text-right">
                  {editable ? (
                    <input
                      type="number"
                      min="0"
                      max="2"
                      step="0.01"
                      value={override.laborRate ?? mat.laborRate}
                      onChange={(e) => setPriceOverride(mat.id, 'laborRate', e.target.value)}
                      className="w-16 text-right border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-gray-600">{(laborRate * 100).toFixed(0)}%</span>
                  )}
                </td>

                <td className="py-2 px-3 text-right text-gray-700">{formatKRW(cost.material)}</td>
                <td className="py-2 px-3 text-right text-gray-700">{formatKRW(cost.labor)}</td>
                <td className="py-2 px-3 text-right font-semibold text-gray-800">
                  {formatKRW(cost.material + cost.labor)}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 border-t-2 border-gray-200">
            <td colSpan={7} className="py-3 px-3 font-semibold text-gray-700">소계</td>
            <td className="py-3 px-3 text-right font-semibold text-gray-800">{formatKRW(costs.subtotal)}</td>
          </tr>
          <tr className="bg-gray-50">
            <td colSpan={7} className="py-3 px-3 text-gray-600">부가세 (10%)</td>
            <td className="py-3 px-3 text-right text-gray-700">{formatKRW(costs.vat)}</td>
          </tr>
          <tr className="bg-blue-50">
            <td colSpan={7} className="py-3 px-3 font-bold text-blue-900 text-base">최종 합계</td>
            <td className="py-3 px-3 text-right font-bold text-blue-600 text-base">{formatKRW(costs.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
