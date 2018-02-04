const express = require('express')
const app = express()
const mysql = require('mysql2/promise')
const bodyParser = require('body-parser')
const session = require('express-session')

const account = require('./account')
const admin = require('./admin')
const groups = require('./groups')
const classification = require('./classification')
const contact = require('./contact')

// Declaração dos Middlewares
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  secret: 'futiba-club-secret-session',
  saveUninitialized: true,
  resave: true
}))
app.set('view engine', 'ejs')

const init = async () => {
  // Conexão com o MySQL
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'futiba-club'
  })
  // Middleware para disponibilizar os dados do usuário logado na sessão
  app.use((req, res, next) => {
    // Verificando se o usuário existe na sessão
    if (req.session.user) {
      res.locals.user = req.session.user
    } else {
      res.locals.user = false
    }
    next()
  })
  // Carregando a função retornada pelo módulo account injetando a connection   
  app.use(account(connection))
  // Definindo router para as rota
  app.use('/admin', admin(connection))
  app.use('/groups', groups(connection))
  app.use('/classification', classification(connection))
  app.use('/contact', contact())

  const PORT = 3000
  app.listen(PORT, err => {
    console.log(`Futiba Club server is running on port ${PORT}`)
  })

}

init()
