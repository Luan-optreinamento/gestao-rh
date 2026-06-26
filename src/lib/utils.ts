export function uid() {
  return crypto.randomUUID()
}

export function fmt(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function fmtData(data: string) {
  if (!data) return '—'
  const [y, m, d] = data.split('-')
  return `${d}/${m}/${y}`
}

export function diasAteVencimento(vencimento: string) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(vencimento + 'T00:00:00')
  return Math.round((venc.getTime() - hoje.getTime()) / 86400000)
}

export function mesNome(mes: string) {
  const nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const [y, m] = mes.split('-')
  return `${nomes[parseInt(m) - 1]} ${y}`
}