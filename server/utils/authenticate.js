const { AuthenticationError } = require('apollo-server')
const jwt = require('jsonwebtoken')

const authenticate = (app, req) => {
  if (app.get('SKIP_AUTH')) {
    return 1
  }
  const cookieName = app.get('JWT_COOKIE_NAME')
  const jwtCookie = req.cookies[cookieName]
  const secret = app.get('JWT_SECRET')
  try {
    const { userID, csrfToken, exp } = jwt.verify(jwtCookie, secret)

    const headerCSRFToken = req.get('authorization').replace('Bearer ', '')
    const isValidCSRF = headerCSRFToken === csrfToken || exp < Math.floor(Date.now() / 1000)

    if (!isValidCSRF) {
      throw new AuthenticationError('Unauthorized')
    }

    return userID
  } catch (e) {
    throw new AuthenticationError('Unauthorized')
  }
}

module.exports = authenticate
