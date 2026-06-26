import jwt from 'jsonwebtoken'
import * as argon2 from 'argon2'

const SECRET = process.env.JWT_SECRET!

export async function hashSenha(senha: string) {
  return argon2.hash(senha)
}

export async function verificarSenha(hash: string, senha: string) {
  return argon2.verify(hash, senha)
}

export function gerarToken(payload: { id: string; nome: string; email: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' })
}

export function verificarToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as { id: string; nome: string; email: string }
  } catch {
    return null
  }
}