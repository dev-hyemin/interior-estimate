const express = require('express')
const materials = require('../data/materials.json')

const router = express.Router()

router.get('/', (req, res) => {
  res.json(materials)
})

module.exports = router
