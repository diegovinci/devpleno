// Execução assíncrona
console.log('inicio')

setTimeout(() => {
  console.log('Olá!')
}, 1000)
// lerSync

console.log('fim')

// File System
const fs = require('fs')

const lerArquivo = arquivo => {
  return new Promise((resolve, reject) => {
    fs.readFile(arquivo, (err, conteudo) => {
      if (err) {
        reject() // Caso a promise dê erro
      } else {
        resolve(conteudo)
      }
    })
  })
}

/* lerArquivo('01.js',)
  .then(conteudo => {
    console.log(String(conteudo))
  })
  .catch( err => console.log(err)) */

// async / await
const executa = async () => {
  try {
    const conteudo = await lerArquivo('011.js')
    console.log('legal')
  } catch (err) {
    console.log(err)
  }
}

// O async/await também é uma prómise
executa().then(() => console.log('terminou'))


/* fs.readFile('01.js', (err, conteudo) => {
  if (err) { // truthy ou falsy
    console.log('Não foi possível ler o arquivo')
  } else {
    setTimeout(() => {
      console.log('Olá!')
    })
    console.log(String(conteudo))
  }
}) */