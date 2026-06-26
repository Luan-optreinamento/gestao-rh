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

type FiltroContas = 'ambas' | 'conta01' | 'conta02'

export default function RelatoriosPage() {
  const [txs, setTxs] = useState<Transacao[]>([])
  const [centros, setCentros] = useState<CentroCusto[]>([])
  const [de, setDe] = useState('')
  const [ate, setAte] = useState('')
  const [filtroContas, setFiltroContas] = useState<FiltroContas>('ambas')

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

  const txsFiltradas = txs.filter(t => {
    if (filtroContas === 'ambas') return true
    return t.conta === filtroContas
  })

  const debitos = txsFiltradas.filter(t => parseFloat(t.valor) < 0)
  const creditos = txsFiltradas.filter(t => parseFloat(t.valor) >= 0)
  const totalDeb = debitos.reduce((s, t) => s + Math.abs(parseFloat(t.valor)), 0)
  const totalCre = creditos.reduce((s, t) => s + parseFloat(t.valor), 0)
  const saldo = totalCre - totalDeb

  function ResumoContas({ conta }: { conta: 'conta01' | 'conta02' }) {
    const label = conta === 'conta01' ? 'Conta 01' : 'Conta 02'
    const txsConta = txs.filter(t => t.conta === conta)
    const deb = txsConta.filter(t => parseFloat(t.valor) < 0).reduce((s, t) => s + Math.abs(parseFloat(t.valor)), 0)
    const cre = txsConta.filter(t => parseFloat(t.valor) >= 0).reduce((s, t) => s + parseFloat(t.valor), 0)
    const cor = conta === 'conta01' ? '#1A4F8A' : '#1D7A4A'
    const pct = totalDeb > 0 ? (deb / totalDeb * 100).toFixed(1) : '0.0'
    return (
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: cor }} />
            <span className="text-sm font-semibold">{label}</span>
          </div>
          <div className="flex gap-5 text-xs text-gray-500">
            <span>Entradas: <strong className="text-green-600">{fmt(cre)}</strong></span>
            <span>Saídas: <strong className="text-red-600">{fmt(deb)}</strong></span>
            <span>Saldo: <strong style={{ color: cre - deb >= 0 ? '#1D7A4A' : '#9B2020' }}>{fmt(cre - deb)}</strong></span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cor }} />
          </div>
          <span className="text-xs text-gray-400 w-10">{pct}% das saídas</span>
        </div>
      </div>
    )
  }

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

      {/* SELETOR DE CONTA */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        {([
          { value: 'ambas', label: 'Ambas as contas' },
          { value: 'conta01', label: 'Conta 01' },
          { value: 'conta02', label: 'Conta 02' },
        ] as { value: FiltroContas; label: string }[]).map(op => (
          <button
            key={op.value}
            onClick={() => setFiltroContas(op.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filtroContas === op.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {op.label}
          </button>
        ))}
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Metric label="Total de Saídas" value={fmt(totalDeb)} sub={`${debitos.length} transação(ões)`} color="red" />
        <Metric label="Total de Entradas" value={fmt(totalCre)} sub={`${creditos.length} transação(ões)`} color="green" />
        <Metric label="Saldo do Período" value={fmt(saldo)} sub={`${txsFiltradas.length} transação(ões)`} color={saldo >= 0 ? 'green' : 'red'} />
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <Card title="Saídas por Centro de Custo">
          <RelatorioCC transacoes={txsFiltradas} centros={centros} />
        </Card>

        <Card title="Resumo por Conta">
          {filtroContas === 'ambas' ? (
            <>
              <ResumoContas conta="conta01" />
              <ResumoContas conta="conta02" />
            </>
          ) : (
            <ResumoContas conta={filtroContas} />
          )}
        </Card>
      </div>

      {/* ENTRADAS */}
      <Card title="Entradas" className="mb-5">
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

      {/* SAÍDAS DETALHADAS */}
      <Card title="Saídas Detalhadas">
        {!debitos.length
          ? <p className="text-sm text-gray-400 text-center py-6">Nenhuma saída no período.</p>
          : <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Data', 'Banco', 'Descrição', 'Centro de Custo', 'Conta', 'Valor'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {debitos.map(t => {
                  const cc = centros.find(c => c.id === t.centroCustoId)
                  return (
                    <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2.5">{fmtData(t.data)}</td>
                      <td className="px-3 py-2.5 text-gray-400 max-w-[140px] truncate">{t.memo}</td>
                      <td className="px-3 py-2.5">{t.descricao}</td>
                      <td className="px-3 py-2.5">
                        {cc
                          ? <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium px-2 py-0.5 rounded-full">{cc.nome}</span>
                          : <span className="text-gray-300">—</span>
                        }
                      </td>
                      <td className="px-3 py-2.5">{t.conta === 'conta01' ? 'Conta 01' : 'Conta 02'}</td>
                      <td className="px-3 py-2.5 font-semibold text-red-600">{fmt(parseFloat(t.valor))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
        }
      </Card>
    </div>
  )
}