const express = require('express')
const app = express.Router()

const crypto = require('./crypto')

const init = connection => {

  app.get('/', async (req, res) => {
    const query =
      `select
      groups.id,
      groups.name,
      sum(guessings.score) as score
        from groups
        left join guessings
          on guessings.group_id = groups.id
      group by guessings.group_id
      order by score DESC
      limit 3`
    const [rows] = await connection.execute(query)
    res.render('home', { groups: rows, error: false })
  })

  app.get('/logout', (req, res) => {
    req.session.destroy(err => {
      res.redirect('/')
    })
  })

  app.get('/login', (req, res) => {
    res.render('login', { error: false })
  })

  app.post('/login', async (req, res) => {
    const [rows, fields] = await connection.execute(
      'select * from users where email = ?', [req.body.email]
    )

    if (rows.length === 0) {
      res.render('login', { error: 'Usuário e/ou senha inválidos' })
    } else {
      if (rows[0].passwd === crypto.encrypt(req.body.passwd)) {
        const userDb = rows[0]
        const user = {
          id: userDb.id,
          name: userDb.name,
          role: userDb.role
        }
        // Logando usuário na sessão
        req.session.user = user
        res.redirect('/')
      } else {
        res.render('login', { error: 'Usuário e/ou senha inválidos' })
      }
    }
  })

  app.get('/new-account', (req, res) => {
    res.render('new-account', { error: false })
  })

  app.post('/new-account', async (req, res) => {
    const [rows, fields] = await connection.execute(
      'select * from users where email = ?', [req.body.email]
    )
    if (rows.length === 0) {
      const { name, email, passwd } = req.body
      // Inserindo usuário no banco de dados
      const [inserted, insertFields] = await connection.execute(
        'insert into users (name, email, passwd, role) values(?, ?, ?, ?)', [
          name,
          email,
          crypto.encrypt(passwd),
          'user'
        ]
      )
      // Logando usuário após cadastro
      const user = {
        id: inserted.insertId,
        name: name,
        role: 'user'
      }
      req.session.user = user
      res.redirect('/')
    } else {
      res.render('new-account', { error: 'Usuário já existente' })
    }
  })
  
  return app
}

module.exports = init // Exportando função