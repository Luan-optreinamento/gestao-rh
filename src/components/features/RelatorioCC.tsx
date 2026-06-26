import { fmt } from '@/lib/utils'

type Transacao = { valor: string; centroCustoId?: string | null }
type CC = { id: string; nome: string }

type Props = {
  transacoes: Transacao[]
  centros: CC[]
}

const CORES = ['#1A4F8A','#1D7A4A','#925E0A','#7B3FA8','#C0442C','#1A7A8A','#6B5B0A','#2C5C1A']

export default function RelatorioCC({ transacoes, centros }: Props) {
  const debitos = transacoes.filter(t => parseFloat(t.valor) < 0)
  const totalDeb = debitos.reduce((s, t) => s + Math.abs(parseFloat(t.valor)), 0)

  const porCC: Record<string, number> = {}
  debitos.forEach(t => {
    const cc = centros.find(c => c.id === t.centroCustoId)
    const nome = cc?.nome ?? '(sem centro de custo)'
    porCC[nome] = (porCC[nome] ?? 0) + Math.abs(parseFloat(t.valor))
  })

  const lista = Object.entries(porCC).sort((a, b) => b[1] - a[1])

  if (!lista.length) return <p className="text-sm text-gray-400 text-center py-6">Nenhuma saída com centro de custo atribuído.</p>

  return (
    <div className="space-y-3">
      {lista.map(([nome, total], i) => {
        const pct = totalDeb > 0 ? (total / totalDeb * 100).toFixed(1) : '0.0'
        const cor = CORES[i % CORES.length]
        return (
          <div key={nome}>
            <div className="flex justify-between text-sm mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: cor }} />
                <span className="font-medium">{nome}</span>
              </div>
              <div className="flex gap-4 text-right">
                <span className="text-red-600 font-semibold">{fmt(total)}</span>
                <span className="text-gray-400 w-10">{pct}%</span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cor }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}