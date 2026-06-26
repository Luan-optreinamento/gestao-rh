import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { transacoes } from '@/lib/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { uid } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const conta = searchParams.get('conta')
    const de = searchParams.get('de')
    const ate = searchParams.get('ate')

    const filtros = []
    if (conta) filtros.push(eq(transacoes.conta, conta))
    if (de) filtros.push(gte(transacoes.data, de))
    if (ate) filtros.push(lte(transacoes.data, ate))

    const data = filtros.length
      ? await db.select().from(transacoes).where(and(...filtros))
      : await db.select().from(transacoes)

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ erro: 'Erro ao buscar transações' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const inseridas = []
    const duplicatas = []

    for (const tx of body.transacoes) {
      const existe = await db.select().from(transacoes).where(eq(transacoes.fitid, tx.fitid))
      if (existe.length) { duplicatas.push(tx.fitid); continue }
      const nova = { id: uid(), ...tx }
      await db.insert(transacoes).values(nova)
      inseridas.push(nova)
    }

    return NextResponse.json({ inseridas: inseridas.length, duplicatas: duplicatas.length })
  } catch {
    return NextResponse.json({ erro: 'Erro ao importar transações' }, { status: 500 })
  }
}