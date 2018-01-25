// this
function funcao0() {
  this.a = 10
  function funcao1() {
    console.log(this.a)
  }
  funcao1.bind({ a: 20 })()
}
funcao0() // 20

// Função pura
function funcao2() {
  const a = 10
  function funcao3(b) {
    console.log(b)
  }
  funcao3.bind({ a: 20 })(a)
}

funcao2() // 10