const express = require('express')
const multer = require('multer')
const { analyzeRoomImage } = require('../services/claudeService')

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return cb(new Error('JPG 또는 PNG 파일만 업로드 가능합니다.'))
    }
    cb(null, true)
  },
})

router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '이미지 파일이 없습니다.' })
  }

  try {
    const result = await analyzeRoomImage(req.file.buffer, req.file.mimetype)

    if (result.error === 'parse_failed') {
      return res.status(422).json({
        message: '도면 분석에 실패했습니다. 치수를 직접 입력해주세요.',
        error: 'parse_failed',
        rawResponse: result.rawResponse,
      })
    }

    res.json(result)
  } catch (err) {
    console.error('Claude API 오류:', err.message)
    res.status(500).json({ message: 'AI 분석 중 오류가 발생했습니다.' })
  }
})

// multer 에러 처리
router.use((err, req, res, next) => {
  console.error('[multer 오류]', err.message)
  res.status(400).json({ message: err.message })
})

module.exports = router
