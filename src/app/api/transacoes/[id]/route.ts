import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { transacoes } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    await db.update(transacoes).set(body).where(eq(transacoes.id, id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ erro: 'Erro ao atualizar transação' }, { status: 500 })
  }
}