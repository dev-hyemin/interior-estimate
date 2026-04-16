import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import RoomMesh from './RoomMesh'

export default function RoomCanvas({ dimensions, materials, rooms, floorPlanBounds }) {
  const isMultiRoom = rooms && rooms.length > 0

  // 전체 도면 크기
  const totalWidth = floorPlanBounds?.width ?? dimensions?.width ?? 4.5
  const totalDepth = floorPlanBounds?.depth ?? dimensions?.length ?? 6.0
  const primaryHeight = (isMultiRoom ? rooms[0]?.height : dimensions?.height) ?? 2.4

  // 카메라 위치: 도면 전체를 내려다보는 시점
  const camDist = Math.max(totalWidth, totalDepth)
  const cameraPos = [totalWidth * 0.6, primaryHeight * 1.8, camDist * 1.0]

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100">
      <Canvas
        camera={{ position: cameraPos, fov: 60, near: 0.1, far: 500 }}
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
            position={[totalWidth / 2, primaryHeight * 2, totalDepth / 2]}
            intensity={0.8}
            castShadow
          />
          <pointLight position={[0, primaryHeight * 0.8, 0]} intensity={0.4} />

          {isMultiRoom ? (
            rooms.map((room) => {
              const w = room.rect?.w ?? 4.5
              const d = room.rect?.d ?? 6.0
              const h = room.height ?? 2.4
              // 각 방의 중심을 도면 전체 중앙 기준으로 오프셋
              const cx = (room.rect?.x ?? 0) + w / 2 - totalWidth / 2
              const cz = (room.rect?.y ?? 0) + d / 2 - totalDepth / 2
              return (
                <group key={room.id} position={[cx, 0, cz]}>
                  <RoomMesh
                    dimensions={{ width: w, length: d, height: h }}
                    materials={materials}
                  />
                </group>
              )
            })
          ) : (
            <RoomMesh dimensions={dimensions} materials={materials} />
          )}

          <OrbitControls
            target={[0, primaryHeight / 2, 0]}
            minDistance={0.5}
            maxDistance={camDist * 4}
            maxPolarAngle={Math.PI * 0.85}
            enablePan={false}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
