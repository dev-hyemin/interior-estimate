import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import RoomMesh from './RoomMesh'

export default function RoomCanvas({ dimensions, materials }) {
  const { width = 4.5, length = 6.0, height = 2.4 } = dimensions

  // 카메라 초기 위치: 방 중앙에서 약간 위쪽
  const cameraPos = [width * 0.8, height * 0.8, length * 0.8]

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100">
      <Canvas
        camera={{ position: cameraPos, fov: 60, near: 0.1, far: 100 }}
        shadows
      >
        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="gray" />
            </mesh>
          }
        >
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[width / 2, height, length / 2]}
            intensity={0.8}
            castShadow
          />
          <pointLight position={[0, height * 0.8, 0]} intensity={0.4} />

          <RoomMesh dimensions={dimensions} materials={materials} />

          <OrbitControls
            target={[0, height / 2, 0]}
            minDistance={0.5}
            maxDistance={Math.max(width, length) * 2}
            maxPolarAngle={Math.PI * 0.85}
            enablePan={false}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
