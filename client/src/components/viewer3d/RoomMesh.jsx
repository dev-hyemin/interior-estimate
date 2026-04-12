import { useMemo } from 'react'
import * as THREE from 'three'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

function MaterialMesh({ material, color }) {
  // 텍스처가 있으면 로드, 없으면 단색 사용
  // TextureLoader는 조건부로 사용할 수 없으므로 별도 컴포넌트로 분리
  return null
}

function WallMesh({ position, rotation, args, color, textureUrl }) {
  const texture = textureUrl
    ? useLoader(TextureLoader, textureUrl)
    : null

  const material = useMemo(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(args[0] / 2, args[1] / 2)
      return <meshStandardMaterial map={texture} />
    }
    return <meshStandardMaterial color={color || '#E8E4DC'} />
  }, [texture, color, args])

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={args} />
      {material}
    </mesh>
  )
}

export default function RoomMesh({ dimensions, materials }) {
  const { width = 4.5, length = 6.0, height = 2.4 } = dimensions

  const floorMat = materials?.floor
  const wallMat = materials?.wall
  const ceilingMat = materials?.ceiling

  const floorTexture = floorMat?.textureUrl ? useLoader(TextureLoader, floorMat.textureUrl) : null
  const wallTexture = wallMat?.textureUrl ? useLoader(TextureLoader, wallMat.textureUrl) : null
  const ceilingTexture = ceilingMat?.textureUrl ? useLoader(TextureLoader, ceilingMat.textureUrl) : null

  useMemo(() => {
    if (floorTexture) {
      floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping
      floorTexture.repeat.set(width / 1.5, length / 1.5)
    }
    if (wallTexture) {
      wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping
    }
    if (ceilingTexture) {
      ceilingTexture.wrapS = ceilingTexture.wrapT = THREE.RepeatWrapping
      ceilingTexture.repeat.set(width / 2, length / 2)
    }
  }, [floorTexture, wallTexture, ceilingTexture, width, length])

  return (
    <group>
      {/* 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        {floorTexture ? (
          <meshStandardMaterial map={floorTexture} />
        ) : (
          <meshStandardMaterial color={floorMat?.color || '#C8A882'} />
        )}
      </mesh>

      {/* 천장 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
        <planeGeometry args={[width, length]} />
        {ceilingTexture ? (
          <meshStandardMaterial map={ceilingTexture} side={THREE.BackSide} />
        ) : (
          <meshStandardMaterial color={ceilingMat?.color || '#FFFFFF'} side={THREE.BackSide} />
        )}
      </mesh>

      {/* 앞벽 */}
      <mesh position={[0, height / 2, -length / 2]}>
        <planeGeometry args={[width, height]} />
        {wallTexture ? (
          <meshStandardMaterial map={wallTexture} />
        ) : (
          <meshStandardMaterial color={wallMat?.color || '#F5F0E8'} />
        )}
      </mesh>

      {/* 뒷벽 */}
      <mesh position={[0, height / 2, length / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, height]} />
        {wallTexture ? (
          <meshStandardMaterial map={wallTexture} />
        ) : (
          <meshStandardMaterial color={wallMat?.color || '#F5F0E8'} />
        )}
      </mesh>

      {/* 왼쪽 벽 */}
      <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[length, height]} />
        {wallTexture ? (
          <meshStandardMaterial map={wallTexture} />
        ) : (
          <meshStandardMaterial color={wallMat?.color || '#F5F0E8'} />
        )}
      </mesh>

      {/* 오른쪽 벽 */}
      <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[length, height]} />
        {wallTexture ? (
          <meshStandardMaterial map={wallTexture} />
        ) : (
          <meshStandardMaterial color={wallMat?.color || '#F5F0E8'} />
        )}
      </mesh>
    </group>
  )
}
