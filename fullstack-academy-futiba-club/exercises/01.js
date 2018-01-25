const soma = (num1, num2) => num1 + num2
const subtracao = (num1, num2) => num1 - num2
const operacao = (op, num1, num2) => op(num1, num2)

console.log('Soma', operacao(soma, 10, 20), operacao(subtracao, 30, 10))

const obj = {
  key1: 'valor1'
}
console.log(obj.key)

const arr = [1, 2, 3]
const print = num => console.log('Num: ', num)
const dobro = num => num * 2
arr.forEach(print)
arr.map(dobro).forEach(print)
console.log(arr.reduce((n1, n2) => n1 + n2, 0)) // 6