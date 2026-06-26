import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { centrosCusto } from '@/lib/schema'
import { uid } from '@/lib/utils'

export async function GET() {
  try {
    const data = await db.select().from(centrosCusto)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ erro: 'Erro ao buscar centros' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const novo = { id: uid(), ...body }
    await db.insert(centrosCusto).values(novo)
    return NextResponse.json(novo, { status: 201 })
  } catch {
    return NextResponse.json({ erro: 'Erro ao criar centro' }, { status: 500 })
  }
}