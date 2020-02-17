const { Pool } = require('pg')

const postgres = new Pool({
  host: process.env.PG_HOST || 'localhost',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
  database: process.env.PG_DB || 'postgres',
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

module.exports = postgres