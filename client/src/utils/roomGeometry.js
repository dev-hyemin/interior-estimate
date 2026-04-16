/**
 * 방 각 면의 면적(m²)을 계산합니다.
 * @param {{ width: number, length: number, height: number }} dimensions
 * @returns {{ floor, ceiling, wall, baseboard, partition, lighting, tile, film }}
 */
export function calcAreas(dimensions) {
  const { width = 0, length = 0, height = 0 } = dimensions

  const floor = width * length
  const ceiling = width * length
  const wall = 2 * (width + length) * height
  // 걸레받이: 방 둘레 (m 단위, 단가는 m당)
  const baseboard = 2 * (width + length)
  // 가벽: 기본 산출량 없음, 견적서에서 수량 직접 입력
  const partition = 0
  // 조명: 기본 수량 없음, 견적서에서 수량 직접 입력
  const lighting = 0
  // 타일: 바닥 면적 기준
  const tile = floor
  // 필름: 벽 면적 기준
  const film = wall

  return { floor, ceiling, wall, baseboard, partition, lighting, tile, film }
}

/**
 * schemaVersion 1의 rooms[] 배열에서 전체 면적 합산
 * @param {Array} rooms - { rect: { w, d }, height }[] 형태
 * @returns {{ floor, ceiling, wall, baseboard, partition, lighting, tile, film }}
 */
export function calcMultiRoomAreas(rooms) {
  const totals = { floor: 0, ceiling: 0, wall: 0, baseboard: 0, partition: 0, lighting: 0, tile: 0, film: 0 }
  for (const room of rooms) {
    const width = room.rect?.w ?? 0
    const length = room.rect?.d ?? 0
    const height = room.height ?? 2.4
    const areas = calcAreas({ width, length, height })
    for (const key of Object.keys(totals)) {
      totals[key] += areas[key]
    }
  }
  return totals
}
