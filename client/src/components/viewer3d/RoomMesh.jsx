import { Suspense, useMemo, Component } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

// --- 에러 경계: 텍스처 로드 실패 시 children 대신 fallback 렌더링 ---
class TextureErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidUpdate(prevProps) {
    // textureUrl이 바뀌면 에러 상태 초기화 (자재 재선택 시 재시도)
    if (prevProps.textureUrl !== this.props.textureUrl) {
      this.setState({ hasError: false })
    }
  }
  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

// --- 단색 폴백 컴포넌트 ---

function ColorFloor({ width, length, color }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function ColorCeiling({ width, length, height, color }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  )
}

function ColorWalls({ width, length, height, color }) {
  return (
    <group>
      <mesh position={[0, height / 2, -length / 2]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, height / 2, length / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

// 걸레받이: 4면 벽 하단에 얇은 띠로 표현
function ColorBaseboard({ width, length, color }) {
  const H = 0.07  // 70mm
  const T = 0.015 // 두께
  const y = H / 2
  return (
    <group>
      <mesh position={[0, y, -length / 2 + T / 2]}>
        <boxGeometry args={[width, H, T]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, y, length / 2 - T / 2]}>
        <boxGeometry args={[width, H, T]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-width / 2 + T / 2, y, 0]}>
        <boxGeometry args={[T, H, length]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[width / 2 - T / 2, y, 0]}>
        <boxGeometry args={[T, H, length]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

// --- 텍스처 컴포넌트 (useTexture 무조건 호출 — Hooks 규칙 준수) ---

function TexturedFloor({ width, length, textureUrl }) {
  const texture = useTexture(textureUrl)
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(width / 1.5, length / 1.5)
  }, [texture, width, length])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

function TexturedCeiling({ width, length, height, textureUrl }) {
  const texture = useTexture(textureUrl)
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(width / 2, length / 2)
  }, [texture, width, length])
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  )
}

function TexturedWalls({ width, length, height, textureUrl }) {
  const texture = useTexture(textureUrl)
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1, 1)
  }, [texture])
  return (
    <group>
      <mesh position={[0, height / 2, -length / 2]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      <mesh position={[0, height / 2, length / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </group>
  )
}

// --- 텍스처/단색 자동 선택 헬퍼 ---
// textureUrl이 있으면 텍스처 시도 → 실패 시 color로 폴백
// textureUrl이 없으면 바로 color 사용

function Floor({ width, length, mat }) {
  const color = mat?.color || '#C8A882'
  const fallback = <ColorFloor width={width} length={length} color={color} />
  if (!mat?.textureUrl) return fallback
  return (
    <TextureErrorBoundary textureUrl={mat.textureUrl} fallback={fallback}>
      <Suspense fallback={fallback}>
        <TexturedFloor width={width} length={length} textureUrl={mat.textureUrl} />
      </Suspense>
    </TextureErrorBoundary>
  )
}

function Ceiling({ width, length, height, mat }) {
  const color = mat?.color || '#FFFFFF'
  const fallback = <ColorCeiling width={width} length={length} height={height} color={color} />
  if (!mat?.textureUrl) return fallback
  return (
    <TextureErrorBoundary textureUrl={mat.textureUrl} fallback={fallback}>
      <Suspense fallback={fallback}>
        <TexturedCeiling width={width} length={length} height={height} textureUrl={mat.textureUrl} />
      </Suspense>
    </TextureErrorBoundary>
  )
}

function Walls({ width, length, height, mat }) {
  const color = mat?.color || '#F5F0E8'
  const fallback = <ColorWalls width={width} length={length} height={height} color={color} />
  if (!mat?.textureUrl) return fallback
  return (
    <TextureErrorBoundary textureUrl={mat.textureUrl} fallback={fallback}>
      <Suspense fallback={fallback}>
        <TexturedWalls width={width} length={length} height={height} textureUrl={mat.textureUrl} />
      </Suspense>
    </TextureErrorBoundary>
  )
}

// --- Baseboard (걸레받이) ---
function Baseboard({ width, length, mat }) {
  const color = mat?.color || '#E8E0D8'
  return <ColorBaseboard width={width} length={length} color={color} />
}

// --- 가벽 (Partition) ---
function PartitionMesh({ width, length, height, mat }) {
  if (!mat) return null
  return (
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[width * 0.6, height, 0.15]} />
      <meshStandardMaterial color={mat.color || '#CCCCCC'} transparent opacity={0.6} />
    </mesh>
  )
}

// --- 메인 컴포넌트 ---

export default function RoomMesh({ dimensions, materials }) {
  const { width = 4.5, length = 6.0, height = 2.4 } = dimensions

  // 타일 선택 시 바닥재 대신 타일 사용, 필름 선택 시 벽지 대신 필름 사용
  const floorMat = materials?.tile ?? materials?.floor
  const wallMat = materials?.film ?? materials?.wall

  return (
    <group>
      <Floor width={width} length={length} mat={floorMat} />
      <Ceiling width={width} length={length} height={height} mat={materials?.ceiling} />
      <Walls width={width} length={length} height={height} mat={wallMat} />
      <Baseboard width={width} length={length} mat={materials?.baseboard} />
      <PartitionMesh width={width} length={length} height={height} mat={materials?.partition} />
    </group>
  )
}
