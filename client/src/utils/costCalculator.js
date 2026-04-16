import { calcAreas, calcMultiRoomAreas } from './roomGeometry'

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
 * @param {object} selectedMaterials
 * @param {object|Array} dimensionsOrRooms - 단일 방 dimensions 또는 rooms[] 배열
 * @param {object} quantities
 */
export function calculateCosts(selectedMaterials, dimensionsOrRooms, quantities = {}) {
  const areas = Array.isArray(dimensionsOrRooms)
    ? calcMultiRoomAreas(dimensionsOrRooms)
    : calcAreas(dimensionsOrRooms)

  const floor = calcItemCost(areas.floor, selectedMaterials.floor)
  const wall = calcItemCost(areas.wall, selectedMaterials.wall)
  const ceiling = calcItemCost(areas.ceiling, selectedMaterials.ceiling)
  const baseboard = calcItemCost(areas.baseboard, selectedMaterials.baseboard)
  // 수량 직접 입력 카테고리 (partition, lighting은 견적서에서 수량 입력)
  const partitionQty = quantities.partition ?? areas.partition
  const lightingQty = quantities.lighting ?? areas.lighting
  const tileQty = quantities.tile ?? areas.tile
  const filmQty = quantities.film ?? areas.film
  const partition = calcItemCost(partitionQty, selectedMaterials.partition)
  const lighting = calcItemCost(lightingQty, selectedMaterials.lighting)
  const tile = calcItemCost(tileQty, selectedMaterials.tile)
  const film = calcItemCost(filmQty, selectedMaterials.film)

  const subtotal =
    floor.material + floor.labor +
    wall.material + wall.labor +
    ceiling.material + ceiling.labor +
    baseboard.material + baseboard.labor +
    partition.material + partition.labor +
    lighting.material + lighting.labor +
    tile.material + tile.labor +
    film.material + film.labor

  const vat = Math.round(subtotal * 0.1)
  const total = subtotal + vat

  return { floor, wall, ceiling, baseboard, partition, lighting, tile, film, subtotal, vat, total }
}

export function formatKRW(amount) {
  return amount.toLocaleString('ko-KR') + '원'
}
