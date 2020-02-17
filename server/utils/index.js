const setCookie = require('./setCookie')
const generateToken = require('./generateToken')
const authenticate = require('./authenticate')

const authUtil = { setCookie, generateToken, authenticate }
module.exports = { authUtil }
