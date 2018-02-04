/* Generator, parecido com async/await, é possível simular um async/await 
utilizando * no lugar do async e yield usando uma biblioteca como o co para 
executar o generator ao invés do await em casos em que o ambiente do node não 
suporta as mais novas features do ES */ 

const co = require('co')
const fs = require('fs')

const lerArquivo = arquivo => new Promise(resolve => {
  fs.readFile(arquivo, (err, conteudo) => {
    resolve(conteudo)
  })
})

function * opa() {
  const conteudo = yield lerArquivo('02-async.js')
  console.log(String(conteudo))
}

co(opa)