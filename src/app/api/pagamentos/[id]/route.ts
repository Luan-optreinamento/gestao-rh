import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pagamentos } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    await db.update(pagamentos).set(body).where(eq(pagamentos.id, id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ erro: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.delete(pagamentos).where(eq(pagamentos.id, id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ erro: 'Erro ao excluir' }, { status: 500 })
  }
}