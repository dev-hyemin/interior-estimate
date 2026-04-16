const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ROOM_LABEL_MAP = {
  living_room: '거실', bedroom: '침실', kitchen: '주방', bathroom: '욕실',
  office: '사무실', dining_room: '식당', study: '서재', hallway: '복도',
  utility: '다용도실', entrance: '현관', balcony: '발코니',
}

const SYSTEM_PROMPT = `You are a floor plan analysis expert for Korean interior estimation.
Analyze the uploaded floor plan image and extract ALL visible rooms.
Respond ONLY with a single valid JSON object. No other text, no markdown, no code fences.

COORDINATE SYSTEM:
- Origin (0,0) at bottom-left corner of the entire floor plan bounding box
- X increases rightward, Y increases upward (depth direction)
- All measurements in meters
- Use dimension annotations visible in the image when available

OUTPUT FORMAT (schemaVersion 1):
{
  "schemaVersion": 1,
  "floorPlanBounds": { "width": <total width m>, "depth": <total depth m> },
  "rooms": [
    {
      "id": "r1",
      "type": "<room type>",
      "label": "<Korean room name from image, e.g. 거실>",
      "rect": { "x": <left edge m>, "y": <bottom edge m>, "w": <width m>, "d": <depth m> },
      "height": <ceiling height m, default 2.4>,
      "confidence": <0.0-1.0>
    }
  ],
  "overallConfidence": <average of room confidences>
}

ROOM TYPES: living_room, bedroom, kitchen, bathroom, office, dining_room, study, hallway, utility, entrance, balcony

RULES:
- Include ALL labeled rooms visible in the floor plan (including 발코니, 현관, 화장실)
- rect must fit within floorPlanBounds; rooms should not overlap
- height: use 2.4m if not shown; Korean apartment standard is 2.3-2.8m
- If dimension annotations are visible (e.g. "3,600" mm), convert to meters (3.6)
- confidence reflects how clearly that room's boundary and type can be determined`

/**
 * analysisResult를 schemaVersion 1 (다중 방) 형식으로 정규화
 * - 구형 단일 방 응답도 rooms[] 로 변환
 * - legacy 필드(roomType, dimensions, confidence) 항상 포함
 */
function normalize(raw) {
  // 새 형식: rooms[] 있음
  if (raw.schemaVersion === 1 && Array.isArray(raw.rooms) && raw.rooms.length > 0) {
    const primary = raw.rooms[0]
    return {
      ...raw,
      // legacy — 기존 코드(DimensionEditor, costCalculator 등)에서 dimensions 접근 가능
      roomType: raw.roomType ?? primary.type,
      dimensions: raw.dimensions ?? {
        width: raw.floorPlanBounds?.width ?? primary.rect.w,
        length: raw.floorPlanBounds?.depth ?? primary.rect.d,
        height: primary.height ?? 2.4,
      },
      confidence: raw.confidence ?? raw.overallConfidence,
    }
  }

  // 구형 형식: roomType + dimensions → rooms[] 로 변환
  if (raw.roomType && raw.dimensions) {
    const { width, length, height = 2.4 } = raw.dimensions
    return {
      schemaVersion: 1,
      floorPlanBounds: { width, depth: length },
      rooms: [{
        id: 'r1',
        type: raw.roomType,
        label: ROOM_LABEL_MAP[raw.roomType] ?? raw.roomType,
        rect: { x: 0, y: 0, w: width, d: length },
        height,
        confidence: raw.confidence ?? 0.5,
      }],
      overallConfidence: raw.confidence ?? 0.5,
      roomType: raw.roomType,
      dimensions: raw.dimensions,
      confidence: raw.confidence ?? 0.5,
    }
  }

  return raw
}

/**
 * 이미지 버퍼를 Claude Vision API로 분석
 * @param {Buffer} imageBuffer
 * @param {string} mimeType - 'image/jpeg' | 'image/png'
 */
async function analyzeRoomImage(imageBuffer, mimeType) {
  const base64 = imageBuffer.toString('base64')

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: base64 },
          },
          {
            type: 'text',
            text: '이 도면을 분석하여 모든 방을 JSON 형식으로 응답해주세요.',
          },
        ],
      },
    ],
  })

  const text = message.content[0]?.text || ''

  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('JSON not found')
    const parsed = JSON.parse(match[0])
    return normalize(parsed)
  } catch {
    return { error: 'parse_failed', rawResponse: text }
  }
}

module.exports = { analyzeRoomImage }
