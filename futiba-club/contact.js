const express = require('express')
const app = express.Router()

const init = connection => {

  app.get('/', async (req, res) => {
    res.render('contact')
  })
  
  return app
}

module.exports = init