import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { uploads } from '@/lib/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const data = await db.select().from(uploads).orderBy(desc(uploads.createdAt))
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ erro: 'Erro ao buscar uploads' }, { status: 500 })
  }
}
