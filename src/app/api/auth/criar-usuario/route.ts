import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { usuarios } from '@/lib/schema'
import { hashSenha } from '@/lib/auth'
import { uid } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { nome, email, senha, chave } = await req.json()

    if (chave !== process.env.JWT_SECRET) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 403 })
    }

    const hash = await hashSenha(senha)
    await db.insert(usuarios).values({ id: uid(), nome, email, senha: hash })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ erro: 'Erro ao criar usuário' }, { status: 500 })
  }
}