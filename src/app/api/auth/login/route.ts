import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { usuarios } from '@/lib/schema'
import { verificarSenha, gerarToken } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json()

    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email))

    if (!usuario || !(await verificarSenha(usuario.senha, senha))) {
      return NextResponse.json({ erro: 'Email ou senha incorretos' }, { status: 401 })
    }

    const token = gerarToken({ id: usuario.id, nome: usuario.nome, email: usuario.email })

    const res = NextResponse.json({ ok: true, nome: usuario.nome })
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })
    return res
  } catch {
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 })
  }
}