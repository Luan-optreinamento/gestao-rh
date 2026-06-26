import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pagamentos } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { uid } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const conta = req.nextUrl.searchParams.get('conta')
    const query = conta
      ? db.select().from(pagamentos).where(eq(pagamentos.conta, conta))
      : db.select().from(pagamentos)
    const data = await query
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ erro: 'Erro ao buscar pagamentos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const novo = { id: uid(), ...body }
    await db.insert(pagamentos).values(novo)
    return NextResponse.json(novo, { status: 201 })
  } catch {
    return NextResponse.json({ erro: 'Erro ao criar pagamento' }, { status: 500 })
  }
}