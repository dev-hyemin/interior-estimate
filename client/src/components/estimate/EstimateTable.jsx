import { formatKRW } from '../../utils/costCalculator'
import { calcAreas } from '../../utils/roomGeometry'

const LABELS = {
  floor: '바닥재',
  wall: '벽지',
  ceiling: '천장재',
  baseboard: '걸레받이',
}

export default function EstimateTable({ selectedMaterials, costs, dimensions }) {
  const areas = calcAreas(dimensions)
  const categories = ['floor', 'wall', 'ceiling', 'baseboard']
  const areaUnit = { floor: 'm²', wall: 'm²', ceiling: 'm²', baseboard: 'm' }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">구분</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">자재명</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">면적</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">단가</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">자재비</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">시공비</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">소계</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => {
            const mat = selectedMaterials[cat]
            if (!mat) return null
            const cost = costs[cat]
            const area = areas[cat]

            return (
              <tr key={cat} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700">{LABELS[cat]}</td>
                <td className="py-3 px-4 text-gray-600">{mat.name}</td>
                <td className="py-3 px-4 text-right text-gray-600">
                  {area.toFixed(1)} {areaUnit[cat]}
                </td>
                <td className="py-3 px-4 text-right text-gray-600">
                  {mat.unitPrice.toLocaleString()}원
                </td>
                <td className="py-3 px-4 text-right text-gray-700">{formatKRW(cost.material)}</td>
                <td className="py-3 px-4 text-right text-gray-700">{formatKRW(cost.labor)}</td>
                <td className="py-3 px-4 text-right font-semibold text-gray-800">
                  {formatKRW(cost.material + cost.labor)}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 border-t-2 border-gray-200">
            <td colSpan={6} className="py-3 px-4 font-semibold text-gray-700">소계</td>
            <td className="py-3 px-4 text-right font-semibold text-gray-800">{formatKRW(costs.subtotal)}</td>
          </tr>
          <tr className="bg-gray-50">
            <td colSpan={6} className="py-3 px-4 text-gray-600">부가세 (10%)</td>
            <td className="py-3 px-4 text-right text-gray-700">{formatKRW(costs.vat)}</td>
          </tr>
          <tr className="bg-blue-50">
            <td colSpan={6} className="py-3 px-4 font-bold text-blue-900 text-base">최종 합계</td>
            <td className="py-3 px-4 text-right font-bold text-blue-600 text-base">{formatKRW(costs.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
