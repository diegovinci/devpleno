const express = require('express')
const app = express.Router()

const init = connection => {

  // Middleware para controle de acesso à rota /admin
  app.use((req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'root') {
      res.redirect('/')
    } else {
      next()
    }
  })

  app.get('/', (req, res) => {
    res.send('Olá admin')
  })

  app.get('/games', async (req, res) => {
    const [rows, fields] = await connection.execute('select * from games')
    res.render('admin/games', { games: rows })
  })

  app.post('/games', async (req, res) => {
    const { team_a, team_b } = req.body
    console.log(req.body)
    await connection.execute('insert into games (team_a, team_b) values(?, ?)', [
      team_a,
      team_b
    ])
    res.redirect('/admin/games')
  })

  app.post('/games/results', async (req, res) => {
    // Definindo array no qual os resultados dos jogos serão armazenados 
    const games = []
    // Retornando as chaves para que se possa fazer a iteração com forEach
    Object.keys(req.body).forEach(team => {
      const parts = team.split('_')
      const game = {
        game_id: parseInt(parts[1]),
        result_a: parseInt(req.body[team].a),
        result_b: parseInt(req.body[team].b)
      }
      games.push(game)
    })

    // Utilizando for ao invés do forEach para possibilitar o uso do async/await
    for (let i = 0; i < games.length; i++) {
      const game = games[i]
      const [guessings] = await connection.execute(
        `select * from guessings where game_id = ?`, [
          game.game_id
        ])

      /* Updates em lote - para cada palpite, é retornada uma promisse, 
      resultando em um array de promisses dentro de batch */
      const batch = guessings.map(guess => {
        let score = 0
        console.log(game, guess)
        // Validando se usuário acertou 100% do palpite
        if (guess.result_a === game.result_a &&
          guess.result_b === game.result_b) {
          score = 100
        } else {
          // Verificando se usuário acertou um dos resultados
          if (guess.result_a === game.result_a ||
            guess.result_b === game.result_b) {
            score += 25
            // Verificando qual foi o time vencedor
            if (guess.result_a < guess.result_b &&
              game.result_a < game.result_b) {
              score += 25
            }
            if (guess.result_a > guess.result_b &&
              game.result_a > game.result_b) {
              score += 25
            }
          }
        }
        
        return connection.execute(
          'update guessings set score = ? where id = ?', [
            score,
            guess.id
          ]
        )
      })
      console.log(guessings)
      // Retornando promisse que só será resolvida após as que estão em batch
      await Promise.all(batch)
    }
    res.redirect('/admin/games')
  })

  app.get('/games/delete/:id', async (req, res) => {
    await connection.execute('delete from games where id = ? limit 1', [
      req.params.id
    ])
    res.redirect('/admin/games')
  })

  return app
}

module.exports = init
