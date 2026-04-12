import { calcAreas } from './roomGeometry'

/**
 * 자재비 계산
 * 자재비 = 면적 × 1.1(손실10%) × 단가
 * 시공비 = 자재비 × laborRate
 */
function calcItemCost(area, material) {
  if (!material) return { material: 0, labor: 0 }
  const materialCost = Math.round(area * 1.1 * material.unitPrice)
  const laborCost = Math.round(materialCost * material.laborRate)
  return { material: materialCost, labor: laborCost }
}

/**
 * 전체 비용 계산
 * @param {{ floor, wall, ceiling, baseboard }} selectedMaterials
 * @param {{ width, length, height }} dimensions
 */
export function calculateCosts(selectedMaterials, dimensions) {
  const areas = calcAreas(dimensions)

  const floor = calcItemCost(areas.floor, selectedMaterials.floor)
  const wall = calcItemCost(areas.wall, selectedMaterials.wall)
  const ceiling = calcItemCost(areas.ceiling, selectedMaterials.ceiling)
  const baseboard = calcItemCost(areas.baseboard, selectedMaterials.baseboard)

  const subtotal =
    floor.material + floor.labor +
    wall.material + wall.labor +
    ceiling.material + ceiling.labor +
    baseboard.material + baseboard.labor

  const vat = Math.round(subtotal * 0.1)
  const total = subtotal + vat

  return { floor, wall, ceiling, baseboard, subtotal, vat, total }
}

export function formatKRW(amount) {
  return amount.toLocaleString('ko-KR') + '원'
}
