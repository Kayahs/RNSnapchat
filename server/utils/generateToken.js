const jwt = require('jsonwebtoken')

const generateToken = ({ id }, secret, csrfToken) => {
  const payload = {
    userID: id,
    csrfToken,
    exp: Math.floor(Date.now() / 1000) + 2 * (60 * 60),
  }
  return jwt.sign(payload, secret)
}

module.exports = generateToken
