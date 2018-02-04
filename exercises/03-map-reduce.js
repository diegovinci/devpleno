// map-reduce
const products = [
  {
    id: 1,
    name: 'Bicicleta',
    price: 105.90,
    amount: 3
  },
  {
    id: 2,
    name: 'Capacete',
    price: 55.90,
    amount: 2
  }
]

// Usando map para retornar um array apenas com os prices 
console.log(produtos.map( produto => produto.price )) // [ 105.9, 55.9 ]

// Usando map e multiplicando price por amount de cada product
console.log(produtos.map( prod => prod.price * prod.amount)) // [ 317.70000000000005, 111.8 ]

// Reduce para obter subtotal retornado em um valor numérico
console.log(produtos.map( prod => prod.price * prod.amount)
  .reduce((n1, n2) => n1 + n2, 0)) // 429.50000000000006