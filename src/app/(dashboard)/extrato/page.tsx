'use client'
import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import UploadOFX from '@/components/features/UploadOFX'
import ModalConciliacao from '@/components/features/ModalConciliacao'
import type { Transacao, CentroCusto, Upload } from '@/lib/types'
import { fmt, fmtData } from '@/lib/utils'

const hoje = new Date().toISOString().split('T')[0]

export default function ExtratoPage() {
  const [txs, setTxs] = useState<Transacao[]>([])
  const [centros, setCentros] = useState<CentroCusto[]>([])
  const [uploads, setUploads] = useState<Upload[]>([])
  const [aba, setAba] = useState<'upload' | 'agendados' | 'importacoes' | 'historico'>('upload')
  const [modal, setModal] = useState(false)
  const [selecionada, setSelecionada] = useState<Transacao | null>(null)
  const [modoEdicao, setModoEdicao] = useState(false)

  const [filtroDe, setFiltroDe] = useState('')
  const [filtroAte, setFiltroAte] = useState('')
  const [filtroConta, setFiltroConta] = useState('')
  const [filtroCC, setFiltroCC] = useState('')

  const carregar = useCallback(async () => {
    const [rt, rc] = await Promise.all([fetch('/api/transacoes'), fetch('/api/centros')])
    setTxs(await rt.json())
    setCentros(await rc.json())
  }, [])

  const carregarUploads = useCallback(async () => {
    const res = await fetch('/api/uploads')
    setUploads(await res.json())
  }, [])

  useEffect(() => { carregar() }, [carregar])

  useEffect(() => {
    if (aba === 'importacoes') carregarUploads()
  }, [aba, carregarUploads])

  async function importar(transacoes: object[], conta: string, nomeArquivo: string) {
    const res = await fetch('/api/transacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transacoes, conta, nomeArquivo }),
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
    setModal(false)
    setSelecionada(null)
    setModoEdicao(false)
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

  async function excluirUpload(u: Upload) {
    if (!confirm(`Isso vai excluir ${u.inseridas} transação(ões) vinculadas a este upload. Deseja continuar?`)) return
    await fetch(`/api/uploads/${u.id}`, { method: 'DELETE' })
    carregarUploads()
    carregar()
  }

  function abrirEdicao(t: Transacao) {
    setSelecionada(t)
    setModoEdicao(true)
    setModal(true)
  }

  function abrirConciliacao(t: Transacao) {
    setSelecionada(t)
    setModoEdicao(false)
    setModal(true)
  }

  const filaConciliacao = txs.filter(t => !t.conciliada && (!t.futura || t.data <= hoje))
  const agendados = txs.filter(t => !t.conciliada && t.futura && t.data > hoje)

  const conciliadas = txs.filter(t => {
    if (!t.conciliada || t.descricao === '(ignorada)') return false
    if (filtroDe && t.data < filtroDe) return false
    if (filtroAte && t.data > filtroAte) return false
    if (filtroConta && t.conta !== filtroConta) return false
    if (filtroCC && t.centroCustoId !== filtroCC) return false
    return true
  }).sort((a, b) => b.data.localeCompare(a.data))

  const totalConciliadas = conciliadas.reduce((s, t) => s + parseFloat(t.valor), 0)

  const tabs = [
    { key: 'upload' as const, label: `Upload${filaConciliacao.length > 0 ? ` (${filaConciliacao.length})` : ''}` },
    { key: 'agendados' as const, label: `Agendados${agendados.length > 0 ? ` (${agendados.length})` : ''}` },
    { key: 'importacoes' as const, label: 'Importações' },
    { key: 'historico' as const, label: 'Histórico' },
  ]

  return (
    <div>
      <Header title="Extrato & Conciliação" subtitle="Importe o OFX. Transações duplicadas são ignoradas automaticamente." />

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-5">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setAba(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${aba === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
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
                <li>• Transações com data futura aparecem na aba Agendados</li>
              </ul>
            </Card>
          </div>
          {filaConciliacao.length > 0 && (
            <Card title={`Fila de Conciliação (${filaConciliacao.length})`}>
              {filaConciliacao.map(t => (
                <div key={t.id} className="border border-gray-200 rounded-lg p-3 mb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm font-medium">{t.memo || '(sem descrição)'}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {fmtData(t.data)} • {t.conta === 'conta01' ? 'Conta 01' : 'Conta 02'}
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${parseFloat(t.valor) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {fmt(parseFloat(t.valor))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" onClick={() => abrirConciliacao(t)}>Atribuir</Button>
                    <Button size="sm" variant="danger" onClick={() => ignorar(t.id)}>Ignorar</Button>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {aba === 'agendados' && (
        <div className="space-y-5">
          {agendados.length === 0
            ? <Card title="Agendados"><p className="text-sm text-gray-400 text-center py-6">Nenhuma transação agendada.</p></Card>
            : (
              <Card title={`Agendados pelo Banco (${agendados.length})`}>
                <p className="text-xs text-gray-400 mb-4">Lançamentos com data futura importados do OFX. Serão movidos para a fila de conciliação quando a data chegar.</p>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Data', 'Banco', 'Valor', 'Conta', 'Status'].map((h, i) => (
                        <th key={i} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {agendados.sort((a, b) => a.data.localeCompare(b.data)).map(t => (
                      <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2.5 whitespace-nowrap">{fmtData(t.data)}</td>
                        <td className="px-3 py-2.5 text-gray-600 max-w-[200px] truncate">{t.memo || '(sem descrição)'}</td>
                        <td className={`px-3 py-2.5 font-semibold whitespace-nowrap ${parseFloat(t.valor) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {fmt(parseFloat(t.valor))}
                        </td>
                        <td className="px-3 py-2.5">{t.conta === 'conta01' ? 'Conta 01' : 'Conta 02'}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300 px-2 py-0.5 rounded-full">
                            Agendado
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )
          }
        </div>
      )}

      {aba === 'importacoes' && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <span className="text-amber-500 text-lg leading-none mt-0.5">⚠</span>
            <p className="text-sm text-amber-800">
              Excluir um upload remove permanentemente todas as transações vinculadas a ele, incluindo as já conciliadas.
            </p>
          </div>

          <Card title="Histórico de Importações">
            {uploads.length === 0
              ? <p className="text-sm text-gray-400 text-center py-6">Nenhuma importação registrada.</p>
              : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Data da importação', 'Conta', 'Arquivo', 'Importadas', 'Duplicatas ignoradas', 'Ações'].map((h, i) => (
                        <th key={i} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uploads.map(u => (
                      <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {u.createdAt ? fmtData(u.createdAt.slice(0, 10)) : '—'}
                        </td>
                        <td className="px-3 py-2.5">{u.conta === 'conta01' ? 'Conta 01' : 'Conta 02'}</td>
                        <td className="px-3 py-2.5 max-w-[200px] truncate text-gray-600">{u.nomeArquivo}</td>
                        <td className="px-3 py-2.5 text-green-700 font-medium">{u.inseridas}</td>
                        <td className="px-3 py-2.5 text-gray-400">{u.duplicatas}</td>
                        <td className="px-3 py-2.5">
                          <Button size="sm" variant="danger" onClick={() => excluirUpload(u)}>Excluir</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </Card>
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
                options={[
                  { value: 'conta01', label: 'Conta 01' },
                  { value: 'conta02', label: 'Conta 02' },
                ]}
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
              : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Data', 'Banco', 'Valor', 'Descrição', 'Centro de Custo', 'Conta', ''].map((h, i) => (
                        <th key={i} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">{h}</th>
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
                          <td className="px-3 py-2.5">
                            <Button size="sm" onClick={() => abrirEdicao(t)}>Editar</Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )
            }
          </Card>
        </div>
      )}

      <ModalConciliacao
        open={modal}
        onClose={() => { setModal(false); setSelecionada(null); setModoEdicao(false) }}
        transacao={selecionada}
        centros={centros}
        onSalvar={conciliar}
        modoEdicao={modoEdicao}
      />
    </div>
  )
}
