export type Pagamento = {
  id: string
  nome: string
  valor: string
  vencimento: string
  status: string
  obs?: string | null
  conta?: string
}

export type Transacao = {
  id: string
  fitid?: string
  memo?: string | null
  data: string
  valor: string
  conta: string
  descricao?: string | null
  centroCustoId?: string | null
  conciliada: boolean
}

export type CentroCusto = {
  id: string
  nome: string
  descricao?: string | null
}

export type Upload = {
  id: string
  conta: string
  nomeArquivo: string
  totalTransacoes: number
  inseridas: number
  duplicatas: number
  createdAt: string
}
