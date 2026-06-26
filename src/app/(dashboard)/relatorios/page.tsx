'use client'
import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Metric from '@/components/ui/Metric'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import RelatorioCC from '@/components/features/RelatorioCC'
import type { Transacao, CentroCusto } from '@/lib/types'
import { fmt, fmtData } from '@/lib/utils'

export default function RelatoriosPage() {
  const [txs, setTxs] = useState<Transacao[]>([])
  const [centros, setCentros] = useState<CentroCusto[]>([])
  const [de, setDe] = useState('')
  const [ate, setAte] = useState('')

  const carregar = useCallback(async () => {
    const params = new URLSearchParams()
    if (de) params.set('de', de)
    if (ate) params.set('ate', ate)
    const [rt, rc] = await Promise.all([
      fetch(`/api/transacoes?${params}`),
      fetch('/api/centros'),
    ])
    const todasTxs: Transacao[] = await rt.json()
    setTxs(todasTxs.filter(t => t.conciliada && t.descricao !== '(ignorada)'))
    setCentros(await rc.json())
  }, [de, ate])

  useEffect(() => { carregar() }, [carregar])

  const debitos = txs.filter(t => parseFloat(t.valor) < 0)
  const creditos = txs.filter(t => parseFloat(t.valor) >= 0)
  const totalDeb = debitos.reduce((s, t) => s + Math.abs(parseFloat(t.valor)), 0)
  const totalCre = creditos.reduce((s, t) => s + parseFloat(t.valor), 0)
  const saldo = totalCre - totalDeb

  return (
    <div>
      <Header
        title="Relatórios"
        subtitle="Análise das transações conciliadas por centro de custo e por conta."
        actions={
          <div className="flex items-end gap-2">
            <Input label="De" type="date" value={de} onChange={e => setDe(e.target.value)} className="w-36" />
            <Input label="Até" type="date" value={ate} onChange={e => setAte(e.target.value)} className="w-36" />
            <Button variant="primary" onClick={carregar}>Filtrar</Button>
            <Button onClick={() => { setDe(''); setAte('') }}>Todos</Button>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Metric label="Total de Saídas" value={fmt(totalDeb)} sub={`${debitos.length} transação(ões)`} color="red" />
        <Metric label="Total de Entradas" value={fmt(totalCre)} sub={`${creditos.length} transação(ões)`} color="green" />
        <Metric label="Saldo do Período" value={fmt(saldo)} sub={`${txs.length} transação(ões)`} color={saldo >= 0 ? 'green' : 'red'} />
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <Card title="Saídas por Centro de Custo">
          <RelatorioCC transacoes={txs} centros={centros} />
        </Card>
        <Card title="Saídas por Conta">
          {(['conta01', 'conta02'] as const).map((c, i) => {
            const deb = debitos.filter(t => t.conta === c).reduce((s, t) => s + Math.abs(parseFloat(t.valor)), 0)
            const cre = creditos.filter(t => t.conta === c).reduce((s, t) => s + parseFloat(t.valor), 0)
            const pct = totalDeb > 0 ? (deb / totalDeb * 100).toFixed(1) : '0.0'
            const cor = i === 0 ? '#1A4F8A' : '#1D7A4A'
            return (
              <div key={c} className="mb-4">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{c === 'conta01' ? 'Conta 01' : 'Conta 02'}</span>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Entradas: <strong className="text-green-600">{fmt(cre)}</strong></span>
                    <span>Saídas: <strong className="text-red-600">{fmt(deb)}</strong></span>
                    <span>Saldo: <strong style={{ color: cre - deb >= 0 ? '#1D7A4A' : '#9B2020' }}>{fmt(cre - deb)}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cor }} />
                  </div>
                  <span className="text-xs text-gray-400 w-10">{pct}%</span>
                </div>
              </div>
            )
          })}
        </Card>
      </div>

      <Card title="Entradas">
        {!creditos.length
          ? <p className="text-sm text-gray-400 text-center py-6">Nenhuma entrada no período.</p>
          : <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Data', 'Banco', 'Descrição', 'Conta', 'Valor'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {creditos.map(t => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2.5">{fmtData(t.data)}</td>
                    <td className="px-3 py-2.5 text-gray-400 max-w-[160px] truncate">{t.memo}</td>
                    <td className="px-3 py-2.5">{t.descricao}</td>
                    <td className="px-3 py-2.5">{t.conta === 'conta01' ? 'Conta 01' : 'Conta 02'}</td>
                    <td className="px-3 py-2.5 font-semibold text-green-600">{fmt(parseFloat(t.valor))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </Card>
    </div>
  )
}