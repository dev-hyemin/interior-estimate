const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use(morgan('[:date[iso]] :method :url :status :res[content-length] - :response-time ms'))

// Claude API rate limit: 분당 5회
const claudeRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: 'Claude API 호출 한도 초과. 1분 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const analyzeRouter = require('./routes/analyze')
const materialsRouter = require('./routes/materials')

app.use('/api/analyze', claudeRateLimiter, analyzeRouter)
app.use('/api/materials', materialsRouter)

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`)
})

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url}`, err)
  res.status(err.status || 500).json({ message: err.message || '서버 오류가 발생했습니다.' })
})
