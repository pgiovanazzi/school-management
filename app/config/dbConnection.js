'use strict'

const { Pool, Client } = require('pg')
const de = require('dotenv')

de.config()

const client = new Client({
   connectionString: process.env.DATABASE_URL
})

client.connect()
   .then(() => console.log('Connected'))
   .catch(err => console.error('connection error', err.stack))

module.exports = client