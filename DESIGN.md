# 인테리어 견적 시스템 — 추가 설계 과제

> 작성일: 2026-04-15  
> 현재 브랜치: `claude/check-work-progress-SIfXt`

---

## 목차

1. [도면 기반 3D 토폴로지](#1-도면-기반-3d-토폴로지)
2. [신규 자재 카테고리 3D 적용](#2-신규-자재-카테고리-3d-적용)
3. [API 비용 분석](#3-api-비용-분석)
4. [구현 순서 권장](#4-구현-순서-권장)

---

## 1. 도면 기반 3D 토폴로지

### 현재 상태

Claude Vision이 반환하는 데이터:
```json
{ "roomType": "living_room", "dimensions": { "width": 11.3, "length": 7.6, "height": 2.8 }, "confidence": 0.75 }
```

3D 렌더러는 이 단일 직사각형 치수로 4면 벽 + 바닥 + 천장을 그림.  
방 구분, 문 위치, 창문 등 실제 도면 구조가 반영되지 않음.

---

### 1단계 — 다중 방 추출 (직사각형 기반)

**목표**: 도면 내 방들을 개별 직사각형으로 추출해 각각 3D로 배치

#### 새 Vision 출력 스키마

```json
{
  "schemaVersion": 1,
  "floorPlanBounds": { "width": 11.3, "depth": 7.6 },
  "rooms": [
    {
      "id": "r1",
      "type": "living_room",
      "label": "거실",
      "rect": { "x": 0, "y": 0, "w": 5.5, "d": 7.6 },
      "height": 2.8,
      "confidence": 0.88
    },
    {
      "id": "r2",
      "type": "bedroom",
      "label": "침실",
      "rect": { "x": 5.5, "y": 0, "w": 3.5, "d": 4.8 },
      "height": 2.8,
      "confidence": 0.82
    }
  ],
  "overallConfidence": 0.85
}
```

> 좌표계: 도면 좌하단이 원점 (0,0). X = 오른쪽, Y = 위쪽(깊이 방향). 단위: 미터.

#### 3D 렌더링

- 각 room을 별도 `RoomBox` 컴포넌트로 렌더링
- `rect.x`, `rect.y`를 Three.js 월드 좌표 X/Z 오프셋으로 사용
- 방 사이 경계는 공유 벽으로 표현 (두 방이 맞닿은 면 생략)
- 카메라는 `floorPlanBounds`에 맞게 자동 프레임

#### 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `server/src/services/claudeService.js` | 새 시스템 프롬프트 (schemaVersion 1), `max_tokens` → 1024 |
| `server/src/routes/analyze.js` | `rooms[]` 배열 유효성 검사 추가 |
| `client/src/store/useEstimateStore.js` | `analysisResult` 스키마 변경, `updateRoom(roomId, patch)` 액션 추가, 호환 셀렉터 `getPrimaryRoom()` 추가 |
| `client/src/utils/roomGeometry.js` | `calcMultiRoomAreas(rooms[])` 추가 |
| `client/src/utils/costCalculator.js` | `calcMultiRoomAreas` 사용으로 전환 |
| `client/src/components/viewer3d/RoomMesh.jsx` | `RoomBox.jsx`로 리네임, 4면 벽 플레인 제거 (벽은 WallMesh에서 처리) |
| `client/src/components/viewer3d/RoomCanvas.jsx` | `rooms[]` 순회해 `<RoomBox>` 렌더링, 카메라 자동 프레임 |
| `client/src/components/upload/DimensionEditor.jsx` | 다중 방 목록 편집 UI (방별 치수 + 방 유형 선택) |
| `client/src/pages/ReviewPage.jsx` | 다중 방 표시 및 수동 편집 지원 |
| `client/src/pages/DesignPage.jsx` | `rooms` 배열을 RoomCanvas에 전달 |

---

### 2단계 — 벽 좌표 + 문 개구부

**목표**: 실제 벽 선분과 문 위치를 추출해 3D에 문이 뚫린 형태로 렌더링

#### 추가 스키마 (schemaVersion 2)

```json
{
  "schemaVersion": 2,
  "floorPlanBounds": { "width": 11.3, "depth": 7.6 },
  "rooms": [ /* 1단계와 동일 */ ],
  "walls": [
    {
      "id": "w1",
      "start": { "x": 5.5, "y": 0 },
      "end":   { "x": 5.5, "y": 4.8 },
      "thickness": 0.15,
      "separates": ["r1", "r2"]
    },
    {
      "id": "w_ext_south",
      "start": { "x": 0, "y": 0 },
      "end":   { "x": 11.3, "y": 0 },
      "thickness": 0.25,
      "separates": ["r1", "exterior"]
    }
  ],
  "doors": [
    {
      "id": "d1",
      "wallId": "w1",
      "offsetFromStart": 1.2,
      "width": 0.9,
      "height": 2.1,
      "type": "hinged"
    }
  ],
  "windows": [
    {
      "id": "win1",
      "wallId": "w_ext_south",
      "offsetFromStart": 0.5,
      "width": 1.2,
      "height": 1.0,
      "sillHeight": 0.9
    }
  ],
  "overallConfidence": 0.82
}
```

#### 3D 렌더링 — 문 개구부 알고리즘

CSG 라이브러리 불필요. Three.js 내장 `Shape` + `ExtrudeGeometry`로 처리:

```
1. 벽 길이 L = Math.hypot(end.x - start.x, end.y - start.y)
2. THREE.Shape 생성: (0, 0) → (L, height) 직사각형
3. 해당 벽의 doors 각각에 대해:
     THREE.Path(hole): (offsetFromStart, 0) → (offsetFromStart + width, doorHeight)
     shape.holes.push(hole)
4. ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false })
5. mesh를 start 좌표에 배치, Math.atan2(dz, dx)로 벽 방향 회전
```

> windows는 sillHeight부터 시작하는 hole로 동일하게 처리

#### 추가 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `server/src/services/claudeService.js` | schemaVersion 2 프롬프트, `max_tokens` → 2048 |
| `client/src/store/useEstimateStore.js` | `walls[]`, `doors[]`, `windows[]` 상태 추가, CRUD 액션 |
| `client/src/utils/roomGeometry.js` | `calcWallAreas(walls[], height)` — 개구부 면적 차감 |
| `client/src/components/viewer3d/WallWithOpenings.jsx` | **신규**: ExtrudeGeometry + Shape holes 구현 |
| `client/src/components/viewer3d/RoomCanvas.jsx` | WallWithOpenings 렌더링 |
| `client/src/components/viewer3d/FloorPlanMinimap.jsx` | **신규**: SVG 2D 미니맵 (방/벽/문 위치 확인용) |
| `client/src/pages/ReviewPage.jsx` | 벽·문·창문 편집 패널 추가 |

---

## 2. 신규 자재 카테고리 3D 적용

가벽·조명·타일·필름은 현재 선택 및 비용 계산은 되지만 3D에 시각적으로 반영되지 않음.

### 카테고리별 3D 표현 전략

| 카테고리 | 3D 표현 방식 | 구현 방법 |
|----------|-------------|-----------|
| **타일** | 바닥 색상·텍스처 오버라이드 | `tile` 선택 시 `floor` 표면에 타일 색상 적용 (타일 > 바닥재 우선) |
| **필름** | 벽 색상 오버라이드 | `film` 선택 시 `wall` 표면에 필름 색상 적용 (필름 > 벽지 우선) |
| **가벽** | 반투명 박스 mesh | 방 중앙에 반투명 회색 판넬로 표시, 위치는 추후 편집 UI에서 지정 |
| **조명** | Point Light 색온도 변경 | LED 다운라이트=6500K(차가운 흰색), 간접조명=3000K(따뜻한 황색), 샹들리에=2700K |

### RoomMesh 오버라이드 로직

```js
// RoomMesh 내부에서 effective material 결정
const floorMat  = materials.tile     ?? materials.floor    // 타일 우선
const wallMat   = materials.film     ?? materials.wall     // 필름 우선
const lightTemp = getLightColor(materials.lighting)        // 조명 색온도

function getLightColor(lightMat) {
  if (!lightMat) return '#FFFFFF'
  if (lightMat.id === 'lighting_003') return '#FFD080'  // 간접조명 (3000K)
  if (lightMat.id === 'lighting_004') return '#FFF0C0'  // 샹들리에 (2700K)
  return '#F0F8FF'                                       // LED (6500K)
}
```

### 가벽(Partition) 3D 컴포넌트

```jsx
// PartitionMesh.jsx
function PartitionMesh({ width, length, height, mat }) {
  if (!mat) return null
  return (
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[width * 0.6, height, 0.15]} />
      <meshStandardMaterial
        color={mat.color}
        transparent
        opacity={0.6}
      />
    </mesh>
  )
}
```

### 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `client/src/components/viewer3d/RoomMesh.jsx` | `floorMat`, `wallMat` 오버라이드 로직, `PartitionMesh` 추가 |
| `client/src/components/viewer3d/RoomCanvas.jsx` | `ambientLight`, `pointLight`에 조명 색온도 반영 |

---

## 3. API 비용 분석

**모델**: `claude-haiku-4-5-20251001`  
**요금**: 입력 $0.80/M 토큰, 출력 $4.00/M 토큰

### 토큰 수 추정

| 구성 요소 | 현재 | 1단계 | 2단계 |
|-----------|------|-------|-------|
| 이미지 | ~1,200 | ~1,200 | ~1,200 |
| 시스템 프롬프트 | ~180 | ~350 | ~800 |
| 사용자 메시지 | ~15 | ~15 | ~15 |
| **입력 합계** | **~1,395** | **~1,565** | **~2,015** |
| 출력 (JSON) | ~80 | ~250 | ~600 |

### 호출당 비용

| | 현재 | 1단계 | 2단계 |
|-|------|-------|-------|
| 비용 | $0.00143 | $0.00221 | $0.00401 |
| 현재 대비 | 1.0× | **1.5×** | **2.8×** |
| 1,000회 비용 | $1.43 | $2.21 | $4.01 |

> 이미지 토큰(~1,200개)이 전체 입력 비용의 85%를 차지하므로 프롬프트 확장의 실제 추가 비용은 크지 않음.  
> 월 100회 기준: 현재 $0.14 → 2단계 $0.40 (차이 $0.26/월)

### 비용 절감 옵션 — Prompt Caching

`@anthropic-ai/sdk`에서 지원. 시스템 프롬프트는 모든 호출에서 동일하므로 캐싱 적용 가능.

```js
// claudeService.js 적용 예시
const message = await client.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 2048,
  system: [
    {
      type: 'text',
      text: SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' },  // 추가
    }
  ],
  messages: [ /* ... */ ],
})
```

캐시 적중 시 프롬프트 토큰 비용 **90% 절감** ($0.80 → $0.08/M).  
캐시 TTL: 5분 (같은 프롬프트로 5분 이내 재호출 시 적용).

---

## 4. 구현 순서 권장

```
[현재 완료]
 ✅ 신규 자재 카테고리 추가 (가벽·조명·타일·필름)
 ✅ CostSummary 신규 카테고리 비용 표시
 ✅ 3D 걸레받이 mesh
 ✅ 3D 천장 투명 수정 (DoubleSide)
 ✅ 견적서 단가 인라인 편집
 ✅ 1단계 — 다중 방 추출 (Vision 프롬프트 + 다중 RoomBox 렌더링 + DimensionEditor 방별 편집)
 ✅ 신규 카테고리 3D 적용 (타일→바닥 오버라이드, 필름→벽 오버라이드, 가벽 반투명 mesh, 조명 색온도)

[다음 작업 순서]
 → Step 2: 2단계 — 벽 좌표 + 문 개구부 (ExtrudeGeometry)
            1단계 안정화 후 진행. 도면 품질에 따라 신뢰도 편차 큼 → fallback 필수

[비용 최적화]
 → Prompt Caching 적용 (claudeService.js 1줄 수정, 프롬프트 비용 90% 절감)
```

---

## 참고 — 핵심 파일 경로

```
server/src/services/claudeService.js   ← Vision 프롬프트 및 API 호출
client/src/store/useEstimateStore.js   ← 전역 상태 (analysisResult 스키마)
client/src/utils/roomGeometry.js       ← 면적 계산
client/src/components/viewer3d/
  ├── RoomMesh.jsx                     ← 3D 방 렌더러
  ├── RoomCanvas.jsx                   ← Three.js Canvas 래퍼
  ├── WallWithOpenings.jsx             ← (2단계 신규) 문 개구부 벽
  └── FloorPlanMinimap.jsx            ← (2단계 신규) SVG 2D 미니맵
client/src/pages/ReviewPage.jsx        ← 치수/방 편집 페이지
```
