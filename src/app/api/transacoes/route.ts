import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { transacoes, uploads } from '@/lib/schema'
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
    const { transacoes: lote, conta, nomeArquivo } = body
    const hoje = new Date().toISOString().slice(0, 10)

    const inseridas: (typeof transacoes.$inferInsert)[] = []
    const duplicatas: string[] = []
    let descartadas = 0

    for (const tx of lote) {
      if (tx.data > hoje) {
        descartadas++
        continue
      }

      let existe: unknown[]
      if (tx.fitid) {
        existe = await db.select().from(transacoes).where(eq(transacoes.fitid, tx.fitid))
      } else {
        existe = await db.select().from(transacoes).where(
          and(
            eq(transacoes.data, tx.data),
            eq(transacoes.valor, tx.valor),
            eq(transacoes.memo, tx.memo ?? ''),
            eq(transacoes.conta, tx.conta),
          )
        )
      }

      if (existe.length) {
        duplicatas.push(tx.fitid ?? `${tx.data}|${tx.valor}|${tx.memo}`)
        continue
      }

      inseridas.push({ id: uid(), ...tx })
    }

    const uploadId = uid()
    await db.insert(uploads).values({
      id: uploadId,
      conta,
      nomeArquivo,
      totalTransacoes: lote.length,
      inseridas: inseridas.length,
      duplicatas: duplicatas.length,
    })

    for (const tx of inseridas) {
      await db.insert(transacoes).values({ ...tx, uploadId })
    }

    return NextResponse.json({ inseridas: inseridas.length, duplicatas: duplicatas.length, descartadas, uploadId })
  } catch {
    return NextResponse.json({ erro: 'Erro ao importar transações' }, { status: 500 })
  }
}
