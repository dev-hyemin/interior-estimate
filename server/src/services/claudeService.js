const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `당신은 인테리어 도면 분석 전문가입니다.
업로드된 도면 이미지를 분석하여 방의 종류와 치수를 파악하세요.
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.

{
  "roomType": "living_room",
  "dimensions": {
    "width": 4.5,
    "length": 6.0,
    "height": 2.4
  },
  "confidence": 0.85
}

roomType 가능 값: living_room, bedroom, kitchen, bathroom, office, dining_room, study, hallway
치수 단위: 미터(m)
confidence: 0.0~1.0 (분석 신뢰도, 도면이 불명확하면 낮게)
도면에서 치수를 읽을 수 없으면 한국 표준 방 크기로 추정하고 confidence를 낮게 설정하세요.`

/**
 * 이미지 버퍼를 Claude Vision API로 분석
 * @param {Buffer} imageBuffer
 * @param {string} mimeType - 'image/jpeg' | 'image/png'
 * @returns {Promise<{ roomType, dimensions, confidence } | { error: 'parse_failed' }>}
 */
async function analyzeRoomImage(imageBuffer, mimeType) {
  const base64 = imageBuffer.toString('base64')

  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: base64,
            },
          },
          {
            type: 'text',
            text: '이 도면을 분석하여 JSON 형식으로 응답해주세요.',
          },
        ],
      },
    ],
  })

  const text = message.content[0]?.text || ''

  try {
    // JSON만 추출 (텍스트가 섞여있을 경우 대비)
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('JSON not found')
    return JSON.parse(match[0])
  } catch {
    return { error: 'parse_failed', rawResponse: text }
  }
}

module.exports = { analyzeRoomImage }
