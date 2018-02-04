const crypto = require('crypto')

const algorithm = 'sha256'
const secret = '5ae9b7f211e23aac3df5f2b8f3b8eada'
const encoding = 'hex'

exports.encrypt = function (text) {
  const hash = crypto.createHmac(algorithm, secret)
    .update(text)
    .digest(encoding)
  return hash
}