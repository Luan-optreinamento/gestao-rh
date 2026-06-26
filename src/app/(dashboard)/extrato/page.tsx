'use client'
import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import UploadOFX from '@/components/features/UploadOFX'
import ModalConciliacao from '@/components/features/ModalConciliacao'
import type { Transacao, CentroCusto } from '@/lib/types'
import { fmt, fmtData } from '@/lib/utils'

export default function ExtratoPage() {
  const [txs, setTxs] = useState<Transacao[]>([])
  const [centros, setCentros] = useState<CentroCusto[]>([])
  const [aba, setAba] = useState<'upload' | 'historico'>('upload')
  const [modal, setModal] = useState(false)
  const [selecionada, setSelecionada] = useState<Transacao | null>(null)

  const [filtroDe, setFiltroDe] = useState('')
  const [filtroAte, setFiltroAte] = useState('')
  const [filtroConta, setFiltroConta] = useState('')
  const [filtroCC, setFiltroCC] = useState('')

  const carregar = useCallback(async () => {
    const [rt, rc] = await Promise.all([fetch('/api/transacoes'), fetch('/api/centros')])
    setTxs(await rt.json())
    setCentros(await rc.json())
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function importar(transacoes: object[]) {
    const res = await fetch('/api/transacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transacoes }),
    })
    const data = await res.json()
    carregar()
    return data
  }

  async function conciliar(id: string, descricao: string, centroCustoId: string) {
    await fetch(`/api/transacoes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descricao, centroCustoId, conciliada: true }),
    })
    carregar()
  }

  async function ignorar(id: string) {
    if (!confirm('Ignorar esta transação?')) return
    await fetch(`/api/transacoes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descricao: '(ignorada)', conciliada: true }),
    })
    carregar()
  }

  const pendentes = txs.filter(t => !t.conciliada)

  const conciliadas = txs.filter(t => {
    if (!t.conciliada || t.descricao === '(ignorada)') return false
    if (filtroDe && t.data < filtroDe) return false
    if (filtroAte && t.data > filtroAte) return false
    if (filtroConta && t.conta !== filtroConta) return false
    if (filtroCC && t.centroCustoId !== filtroCC) return false
    return true
  }).sort((a, b) => b.data.localeCompare(a.data))

  const totalConciliadas = conciliadas.reduce((s, t) => s + parseFloat(t.valor), 0)

  return (
    <div>
      <Header title="Extrato & Conciliação" subtitle="Importe o OFX. Transações duplicadas são ignoradas automaticamente." />

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-5">
        {(['upload', 'historico'] as const).map(a => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${aba === a ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {a === 'upload' ? `Upload${pendentes.length > 0 ? ` (${pendentes.length} pendente(s))` : ''}` : 'Histórico'}
          </button>
        ))}
      </div>

      {aba === 'upload' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <Card title="Importar Extrato OFX">
              <UploadOFX onImportar={importar} />
            </Card>
            <Card title="Regras de Importação">
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Extrato mínimo: <strong>últimas 48 horas</strong></li>
                <li>• Duplicatas ignoradas por ID único (FITID)</li>
                <li>• Débitos e créditos identificados automaticamente</li>
                <li>• Atribua descrição e centro de custo após importar</li>
              </ul>
            </Card>
          </div>
          {pendentes.length > 0 && (
            <Card title={`Transações para Conciliar (${pendentes.length})`}>
              {pendentes.map(t => (
                <div key={t.id} className="border border-gray-200 rounded-lg p-3 mb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm font-medium">{t.memo || '(sem descrição)'}</div>
                      <div className="text-xs text-gray-400">{fmtData(t.data)} • {t.conta === 'conta01' ? 'Conta 01' : 'Conta 02'}</div>
                    </div>
                    <div className={`text-sm font-semibold ${parseFloat(t.valor) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {fmt(parseFloat(t.valor))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" onClick={() => { setSelecionada(t); setModal(true) }}>Atribuir</Button>
                    <Button size="sm" variant="danger" onClick={() => ignorar(t.id)}>Ignorar</Button>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {aba === 'historico' && (
        <div className="space-y-5">
          <Card title="Filtros">
            <div className="grid grid-cols-4 gap-3">
              <Input label="De" type="date" value={filtroDe} onChange={e => setFiltroDe(e.target.value)} />
              <Input label="Até" type="date" value={filtroAte} onChange={e => setFiltroAte(e.target.value)} />
              <Select
                label="Conta"
                value={filtroConta}
                onChange={e => setFiltroConta(e.target.value)}
                placeholder="Todas"
                options={[{ value: 'conta01', label: 'Conta 01' }, { value: 'conta02', label: 'Conta 02' }]}
              />
              <Select
                label="Centro de Custo"
                value={filtroCC}
                onChange={e => setFiltroCC(e.target.value)}
                placeholder="Todos"
                options={centros.map(c => ({ value: c.id, label: c.nome }))}
              />
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-400">{conciliadas.length} transação(ões) encontrada(s)</span>
              <div className="flex items-center gap-4">
                <span className={`text-sm font-semibold ${totalConciliadas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Saldo: {fmt(totalConciliadas)}
                </span>
                <Button size="sm" onClick={() => { setFiltroDe(''); setFiltroAte(''); setFiltroConta(''); setFiltroCC('') }}>
                  Limpar filtros
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Transações Conciliadas">
            {!conciliadas.length
              ? <p className="text-sm text-gray-400 text-center py-6">Nenhuma transação encontrada.</p>
              : <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Data', 'Banco', 'Valor', 'Descrição', 'Centro de Custo', 'Conta'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {conciliadas.map(t => {
                      const cc = centros.find(c => c.id === t.centroCustoId)
                      return (
                        <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-2.5 whitespace-nowrap">{fmtData(t.data)}</td>
                          <td className="px-3 py-2.5 text-gray-400 max-w-[160px] truncate">{t.memo}</td>
                          <td className={`px-3 py-2.5 font-semibold whitespace-nowrap ${parseFloat(t.valor) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {fmt(parseFloat(t.valor))}
                          </td>
                          <td className="px-3 py-2.5">{t.descricao}</td>
                          <td className="px-3 py-2.5">
                            {cc
                              ? <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium px-2 py-0.5 rounded-full">{cc.nome}</span>
                              : <span className="text-gray-300">—</span>
                            }
                          </td>
                          <td className="px-3 py-2.5">{t.conta === 'conta01' ? 'Conta 01' : 'Conta 02'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
            }
          </Card>
        </div>
      )}

      <ModalConciliacao
        open={modal}
        onClose={() => setModal(false)}
        transacao={selecionada}
        centros={centros}
        onSalvar={conciliar}
      />
    </div>
  )
}