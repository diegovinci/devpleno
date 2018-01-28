const express = require('express')
const app = express.Router()

const init = connection => {

  // Middleware para controle de acesso à rota /groups
  app.use((req, res, next) => {
    if (!req.session.user) {
      res.redirect('/')
    } else {
      next()
    }
  })

  app.get('/', async (req, res) => {
    // Selecionando grupos e roles dos usuários
    const [groups, fields] = await connection.execute(
      `select
        groups.*,
        groups_users.role
      from groups 
      left join groups_users
        on groups.id = groups_users.group_id
        and groups_users.user_id = ?`, [
        req.session.user.id
      ]
    )
    res.render('groups', { groups })
  })

  app.get('/:id', async (req, res) => {
    // Consulta para checar as roles dos usuários de um grupo
    const [group] = await connection.execute(
      `select
        groups.*,
        groups_users.role
      from groups
      left join groups_users
        on groups_users.group_id = groups.id
        and groups_users.user_id = ?
      where groups.id = ?`, [
        req.session.user.id,
        req.params.id
      ]
    )
    // Selecionando usuários com aprovação pendente
    const [pendings] = await connection.execute(
      `select
        groups_users.*,
        users.name
      from groups_users
      inner join users 
        on groups_users.user_id = users.id
        and groups_users.group_id = ?
        and groups_users.role like 'pending'`, [
        req.params.id
      ]
    )
    // Listando jogos
    const [games] = await connection.execute(
      `select
        games.*, 
        guessings.result_a as guess_a, 
        guessings.result_b as guess_b,
        guessings.score 
      from games
      left join guessings 
        on games.id = guessings.game_id 
        and guessings.user_id = ? 
        and guessings.group_id = ?`, [
        req.session.user.id,
        req.params.id
      ]
    )
    res.render('group', { pendings, group: group[0], games })
  })

  app.get('/:id/pending/:idGU/:op', async (req, res) => {
    // Mapeando usuários pendentes com id de user e de groups_users
    const [group] = await connection.execute(
      `select *
      from groups
      left join groups_users
        on groups_users.group_id = groups.id
        and groups_users.user_id = ?
      where groups.id = ?`, [
        req.session.user.id,
        req.params.id
      ]
    )
    // Checando privilégios de owner
    if (group.length === 0 || group[0].role !== 'owner') {
      res.redirect(`/groups/${req.params.id}`)
    } else {
      if (req.params.op === 'yes') {
        await connection.execute(
          'update groups_users set role = "user" where id = ? limit 1', [
            req.params.idGU
          ]
        )
        res.redirect(`/groups/${req.params.id}`)
      } else {
        await connection.execute(
          'delete from groups_users where id = ? limit 1', [
            req.params.idGU
          ]
        )
        res.redirect(`/groups/${req.params.id}`)
      }
    }
  })

  app.get('/:id/join', async (req, res) => {
    // Selecionando relação/role do usuário logado com o grupo
    const [rows, fields] = await connection.execute(
      'select * from groups_users where user_id = ? and group_id = ?', [
        req.session.user.id,
        req.params.id
      ]
    )
    // Validando se usuário atual já tem relacionamento com o grupo 
    if (rows.length > 0) {
      res.redirect('/groups')
    } else {
      await connection.execute(
        'insert into groups_users (user_id, group_id, role) values(?, ?, ?)', [
          req.session.user.id,
          req.params.id,
          'pending'
        ]
      )
      res.redirect('/groups')
    }
  })

  app.post('/:id', async (req, res) => {
    // Definindo array no qual os palpites serão armazenados 
    const guessings = []
    // Retornando as chaves para que se possa fazer a iteração com forEach
    Object.keys(req.body).forEach(team => {
      const parts = team.split('_')
      const game = {
        game_id: parts[1],
        result_a: req.body[team].a,
        result_b: req.body[team].b
      }
      guessings.push(game)
    })

    /* Inserts em lote - para cada palpite, é retornada uma promisse, 
    resultando em um array de promisses dentro de batch */
    const batch = guessings.map(guess => {
      return connection.execute(
        `insert into guessings (result_a, result_b, game_id, group_id, user_id)
        values(?, ?, ?, ?, ?)`, [
          guess.result_a,
          guess.result_b,
          guess.game_id,
          req.params.id,
          req.session.user.id
        ]
      )
    })
    // Retornando promisse que só será resolvida após as que estão em batch
    await Promise.all(batch)

    res.redirect(`/groups/${req.params.id}`)
  })

  app.post('/', async (req, res) => {
    const [insertedId, insertedFields] = await connection.execute(
      'insert into groups (name) values(?)', [
        req.body.name
      ]
    )
    // Definindo o usuário como owner após a criação do novo grupo
    await connection.execute(
      'insert into groups_users (user_id, group_id, role) values(?, ?, ?)', [
        req.session.user.id,
        insertedId.insertId,
        'owner'
      ]
    )
    res.redirect('/groups')
  })

  return app
}

module.exports = init