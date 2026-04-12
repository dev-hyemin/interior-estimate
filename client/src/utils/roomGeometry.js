/**
 * 방 각 면의 면적(m²)을 계산합니다.
 * @param {{ width: number, length: number, height: number }} dimensions
 * @returns {{ floor, ceiling, wall, baseboard }}
 */
export function calcAreas(dimensions) {
  const { width = 0, length = 0, height = 0 } = dimensions

  const floor = width * length
  const ceiling = width * length
  const wall = 2 * (width + length) * height
  // 걸레받이: 방 둘레 (m 단위, 단가는 m당)
  const baseboard = 2 * (width + length)

  return { floor, ceiling, wall, baseboard }
}
