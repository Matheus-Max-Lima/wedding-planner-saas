import { Pool } from 'pg'
import * as dotenv from 'dotenv'
dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const r = await pool.query('SELECT email, name, "createdAt" FROM "User" ORDER BY "createdAt" DESC LIMIT 10')
console.log(JSON.stringify(r.rows, null, 2))
await pool.end()
