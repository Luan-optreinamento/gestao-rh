import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { transacoes, uploads } from '../src/lib/schema'

if (!process.env.DATABASE_URL) {
  try {
    for (const line of readFileSync('.env', 'utf-8').split('\n')) {
      const eq = line.indexOf('=')
      if (eq > 0) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
    }
  } catch {}
}

const db = drizzle(neon(process.env.DATABASE_URL!))

async function main() {
  console.log('Limpando transações e uploads...')
  await db.delete(transacoes)
  console.log('transacoes excluídas.')
  await db.delete(uploads)
  console.log('uploads excluídos.')
  console.log('Concluído.')
}

main().catch(err => { console.error(err); process.exit(1) })
