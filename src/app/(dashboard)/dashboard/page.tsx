import { db } from '@/lib/db'
import { pagamentos, transacoes } from '@/lib/schema'
import { fmt, fmtData, diasAteVencimento } from '@/lib/utils'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Metric from '@/components/ui/Metric'

export default async function DashboardPage() {
  const [pgs, txs] = await Promise.all([
    db.select().from(pagamentos),
    db.select().from(transacoes),
  ])

  const pendentes = pgs.filter(p => p.status !== 'lancado')
  const totalPend = pendentes.reduce((s, p) => s + parseFloat(p.valor), 0)
  const conciliadas = txs.filter(t => t.conciliada).length

  const alertas = pgs.filter(p => {
    if (p.status === 'lancado') return false
    const d = diasAteVencimento(p.vencimento)
    return d <= 10 && d >= 0
  })

  const vencidos = pgs.filter(p => {
    if (p.status === 'lancado') return false
    return diasAteVencimento(p.vencimento) < 0
  })

  const avisos = [...vencidos.map(p => ({ ...p, tipo: 'urgente' })), ...alertas.map(p => ({ ...p, tipo: 'alerta' }))]

  const r1 = pgs.filter(p => p.conta === 'conta01' && p.status !== 'lancado').reduce((s, p) => s + parseFloat(p.valor), 0)
  const r2 = pgs.filter(p => p.conta === 'conta02' && p.status !== 'lancado').reduce((s, p) => s + parseFloat(p.valor), 0)
  const n1 = pgs.filter(p => p.conta === 'conta01' && p.status !== 'lancado').length
  const n2 = pgs.filter(p => p.conta === 'conta02' && p.status !== 'lancado').length

  return (
    <div>
      <Header title="Dashboard" subtitle={new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Metric label="Pagamentos Pendentes" value={String(pendentes.length)} sub="este mês" />
        <Metric label="Total a Pagar" value={fmt(totalPend)} sub="pendentes" color="red" />
        <Metric label="Alertas Ativos" value={String(avisos.length)} sub="próximos 10 dias" />
        <Metric label="Transações Conciliadas" value={String(conciliadas)} sub="importadas" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card title="Alertas de Vencimento">
          {!avisos.length
            ? <p className="text-sm text-gray-400 text-center py-6">✅ Nenhum vencimento nos próximos 10 dias</p>
            : avisos.slice(0, 6).map(p => {
                const d = diasAteVencimento(p.vencimento)
                const label = d < 0 ? `Venceu há ${Math.abs(d)} dia(s)` : d === 0 ? 'Vence hoje!' : `Vence em ${d} dia(s)`
                const urgente = p.tipo === 'urgente'
                return (
                  <div key={p.id} className={`flex items-center gap-3 p-3 rounded-lg border mb-2 ${urgente ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${urgente ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.nome}</div>
                      <div className="text-xs text-gray-500">{p.conta === 'conta01' ? 'Conta 01' : 'Conta 02'} • {label} • {fmtData(p.vencimento)}</div>
                    </div>
                    <div className="text-sm font-semibold whitespace-nowrap">{fmt(parseFloat(p.valor))}</div>
                  </div>
                )
              })
          }
        </Card>

        <Card title="Resumo por Conta">
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Conta 01" value={fmt(r1)} sub={`${n1} pendente(s)`} color="red" />
            <Metric label="Conta 02" value={fmt(r2)} sub={`${n2} pendente(s)`} color="red" />
          </div>
        </Card>
      </div>
    </div>
  )
}