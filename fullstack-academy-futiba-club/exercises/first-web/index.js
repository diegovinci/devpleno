const express = require('express')
const app = express()
const session = require('express-session')

app.use(session({
  secret: 'fullstackacademy', // Chave utilizada na geração do cookie
  saveUninitialized: true,
  resave: true
}))

/* Requisições são stateless e para contornar esta característica as sessões 
podem ser muito úteis */
app.get('/', (req, res) => {
  
  let i = 0  
  if (req.session.i) {
    // Caso exista i dentro da sessão, atribui valor para a variável i
    i = req.session.i
  } 
  i++ 
  // Atribui valor de i para dentro da sessão
  req.session.i = i 
  res.send('<h1>Olá Fullstack Academy ' + i + '</h1>')
})

app.get('/page1', (req, res) => {
  res.send('Olá ' + i)
})

app.listen(3000, err => {
  if (err) {
    console.log('Não foi possível iniciar.')
  } else {
    console.log('Servidor rodando...')
  }
})