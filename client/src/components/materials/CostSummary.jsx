import { formatKRW } from '../../utils/costCalculator'

const LABELS = {
  floor: '바닥재',
  wall: '벽지',
  ceiling: '천장재',
  baseboard: '걸레받이',
}

export default function CostSummary({ costs, selectedMaterials }) {
  const categories = ['floor', 'wall', 'ceiling', 'baseboard']
  const hasMaterials = Object.values(selectedMaterials).some(Boolean)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-4">비용 요약</h3>

      {!hasMaterials ? (
        <p className="text-sm text-gray-400 text-center py-4">자재를 선택하면 비용이 계산됩니다.</p>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {categories.map((cat) => {
              const mat = selectedMaterials[cat]
              const cost = costs[cat]
              if (!mat) return null

              return (
                <div key={cat} className="text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 font-medium">{LABELS[cat]}</span>
                    <span className="text-gray-800 font-semibold">{formatKRW(cost.material + cost.labor)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5 pl-2">
                    <span>{mat.name}</span>
                    <span>자재 {formatKRW(cost.material)} + 시공 {formatKRW(cost.labor)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">소계</span>
              <span className="text-gray-800">{formatKRW(costs.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">부가세 (10%)</span>
              <span className="text-gray-800">{formatKRW(costs.vat)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-1 border-t border-gray-200 mt-1">
              <span className="text-gray-900">합계</span>
              <span className="text-blue-600">{formatKRW(costs.total)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
