import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { uploads, transacoes } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const upload = await db.select().from(uploads).where(eq(uploads.id, id))
    if (!upload.length) {
      return NextResponse.json({ erro: 'Upload não encontrado' }, { status: 404 })
    }
    await db.delete(transacoes).where(eq(transacoes.uploadId, id))
    await db.delete(uploads).where(eq(uploads.id, id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ erro: 'Erro ao excluir upload' }, { status: 500 })
  }
}
