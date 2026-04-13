# Interior Estimate — 인테리어 견적 시스템

인테리어 가게 운영자가 고객의 도면 이미지(JPG/PNG)를 업로드하면 Claude Vision API로 방 구조/치수를 자동 분석하고, 3D로 방을 시각화하며, 자재를 선택해 비용을 자동 계산한 뒤 견적서를 PDF로 출력하는 웹앱.

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 18 + Vite 6 |
| 3D 렌더링 | Three.js + @react-three/fiber + @react-three/drei |
| 전역 상태 | Zustand |
| API 상태 | @tanstack/react-query |
| PDF 생성 | @react-pdf/renderer |
| 파일 업로드 | react-dropzone |
| 스타일링 | Tailwind CSS |
| 라우팅 | react-router-dom |
| Backend | Express (Node.js) |
| AI 분석 | Claude Vision API (claude-haiku-4-5-20251001) |
| 파일 처리 | multer |
| Rate Limiting | express-rate-limit |

---

## 아키텍처

```
인테리어 견적 시스템
│
├── client/ (React + Vite, port 5173)
│   │
│   ├── 사용자 요청: /api/*
│   │       │
│   │       ▼ (Vite 프록시)
│   │
└── server/ (Express, port 3001)
        │
        ├── POST /api/analyze  → Claude Vision API
        └── GET  /api/materials → materials.json
```

### API 키 보안
`ANTHROPIC_API_KEY`는 **서버에서만** 관리 (`.env`, gitignore 처리).  
클라이언트에서 직접 API 호출 불가 — 반드시 프록시를 통해 서버 경유.

---

## 폴더 구조

```
interior-estimate/
├── client/
│   ├── public/
│   │   ├── textures/           # 자재 텍스처 이미지 (CC0)
│   │   └── fonts/              # NotoSansKR-Regular.ttf (PDF 한국어 지원)
│   └── src/
│       ├── pages/
│       │   ├── UploadPage.jsx      # 1단계: 도면 업로드
│       │   ├── ReviewPage.jsx      # 2단계: 치수 검토/수정
│       │   ├── DesignPage.jsx      # 3단계: 3D 뷰어 + 자재 선택
│       │   └── EstimatePage.jsx    # 4단계: 견적서 + PDF
│       ├── components/
│       │   ├── upload/
│       │   │   ├── ImageUploader.jsx   # 드래그&드롭 업로드 UI
│       │   │   └── DimensionEditor.jsx # 치수 수동 수정 폼
│       │   ├── viewer3d/
│       │   │   ├── RoomCanvas.jsx      # Three.js Canvas 래퍼
│       │   │   ├── RoomMesh.jsx        # 방 6면체 절차적 생성
│       │   │   └── CameraControls.jsx  # OrbitControls + 시점 제한
│       │   ├── materials/
│       │   │   ├── MaterialCatalog.jsx # 카테고리별 자재 목록
│       │   │   ├── MaterialCard.jsx    # 자재 카드 (단가, 색상)
│       │   │   └── CostSummary.jsx     # 실시간 비용 합계
│       │   └── estimate/
│       │       ├── EstimateTable.jsx   # 견적 명세 테이블
│       │       ├── PDFDownloadButton.jsx
│       │       └── EstimatePDF.jsx     # @react-pdf/renderer 템플릿
│       ├── store/
│       │   └── useEstimateStore.js     # Zustand 전역 상태
│       ├── hooks/
│       │   ├── useAnalyzeImage.js      # Claude 분석 API 훅
│       │   └── useMaterials.js         # 자재 목록 API 훅
│       └── utils/
│           ├── roomGeometry.js         # 면적 계산 (바닥/벽/천장)
│           └── costCalculator.js       # 비용 계산 로직
│
└── server/
    ├── src/
    │   ├── index.js                # Express 앱 진입점
    │   ├── routes/
    │   │   ├── analyze.js          # POST /api/analyze
    │   │   └── materials.js        # GET /api/materials
    │   ├── services/
    │   │   └── claudeService.js    # Claude Vision API 호출
    │   └── data/
    │       └── materials.json      # 자재 카탈로그
    ├── .env                        # ANTHROPIC_API_KEY (gitignore)
    └── .env.example
```

---

## 4단계 사용자 워크플로우

```
[1] 업로드      →   [2] 치수 검토    →   [3] 3D 디자인   →   [4] 견적서
JPG/PNG 도면       분석 결과 확인        자재 선택            고객 정보 입력
  업로드            치수 수정             텍스처 실시간        PDF 다운로드
  ↓                confidence < 0.7      반영
Claude Vision      경고 배너 표시        실시간 비용 계산
  분석
```

---

## 비용 계산 공식

```
자재비  = 면적 × 1.1 (10% 손실) × 단가
시공비  = 자재비 × laborRate (자재별 30~60%)
소계    = 자재비 + 시공비
최종    = 소계 × 1.1 (부가세 10%)
```

### 면적 계산
- 바닥/천장: `width × length`
- 벽: `2 × (width + length) × height`

---

## 자재 카탈로그 구조

카테고리: `floor`(바닥재), `wall`(벽지), `ceiling`(천장재), `baseboard`(걸레받이)

```json
{
  "id": "floor_001",
  "name": "강마루",
  "unitPrice": 45000,
  "laborRate": 0.4,
  "color": "#C8A882",
  "textureUrl": "/textures/floor_wood.jpg"
}
```

---

## Claude Vision 프롬프트 설계

- 모델: `claude-haiku-4-5-20251001` (Vision 지원)
- 이미지를 base64로 인코딩해 전송
- JSON만 응답하도록 강제:
  ```json
  { "roomType": "living_room", "dimensions": { "width": 4.5, "length": 6.0, "height": 2.4 }, "confidence": 0.85 }
  ```
- JSON 파싱 실패 시 → 수동 입력 fallback 제공

---

## 보안 / Rate Limiting

- Claude API: 분당 5회 제한 (`express-rate-limit`)
- 이미지 업로드: 10MB 제한 (multer)
- API 키: 서버 `.env` 전용, 클라이언트 노출 없음

---

## 실행 방법

```bash
# 의존성 설치
npm run install:all

# 개발 서버 실행 (client:5173 + server:3001 동시 기동)
npm run dev
```

서버 실행 전 `server/.env` 생성:
```
ANTHROPIC_API_KEY=your_key_here
PORT=3001
```

---

## PDF 한국어 지원

`client/public/fonts/NotoSansKR-Regular.ttf` 파일 필요.  
[Google Fonts](https://fonts.google.com/noto/specimen/Noto+Sans+KR)에서 다운로드 후 위 경로에 배치.

---

## 검증 방법

1. 실제 도면 JPG 업로드 → Claude 분석 JSON 확인
2. confidence < 0.7 이미지 → 경고 배너 + 수동 수정 동작
3. 자재 선택 → 3D 텍스처 실시간 반영 + 비용 즉시 계산
4. PDF 다운로드 → 한국어 폰트 정상 출력
5. `/api/analyze` 6번 연속 호출 → 429 응답 확인
