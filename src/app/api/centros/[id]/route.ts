import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { centrosCusto } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.delete(centrosCusto).where(eq(centrosCusto.id, id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ erro: 'Erro ao excluir centro' }, { status: 500 })
  }
}