'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Metric from '@/components/ui/Metric'
import Button from '@/components/ui/Button'
import TabelaPagamentos from '@/components/features/TabelaPagamentos'
import ModalPagamento from '@/components/features/ModalPagamento'
import type { Pagamento } from '@/lib/types'
import { fmt } from '@/lib/utils'

export default function ContaPage() {
  const { id } = useParams<{ id: string }>()
  const conta = `conta${id}`
  const label = id === '01' ? 'Conta 01' : 'Conta 02'

  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<Pagamento | null>(null)

  const carregar = useCallback(async () => {
    const res = await fetch(`/api/pagamentos?conta=${conta}`)
    setPagamentos(await res.json())
  }, [conta])

  useEffect(() => { carregar() }, [carregar])

  async function salvar(dados: Omit<Pagamento, 'id'>) {
    if (editando) {
      await fetch(`/api/pagamentos/${editando.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      })
    } else {
      await fetch('/api/pagamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dados, conta }),
      })
    }
    setEditando(null)
    carregar()
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este pagamento?')) return
    await fetch(`/api/pagamentos/${id}`, { method: 'DELETE' })
    carregar()
  }

  async function atualizarStatus(id: string, status: string) {
    await fetch(`/api/pagamentos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    carregar()
  }

  const pendentes = pagamentos.filter(p => p.status !== 'lancado')
  const totalPend = pendentes.reduce((s, p) => s + parseFloat(p.valor), 0)
  const totalLanc = pagamentos.filter(p => p.status === 'lancado').reduce((s, p) => s + parseFloat(p.valor), 0)

  return (
    <div>
      <Header
        title={label}
        subtitle={`${pagamentos.length} pagamento(s) cadastrado(s)`}
        actions={
          <Button variant="primary" onClick={() => { setEditando(null); setModal(true) }}>
            + Novo Pagamento
          </Button>
        }
      />
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Metric label="Pendentes" value={String(pendentes.length)} />
        <Metric label="Total Pendente" value={fmt(totalPend)} color="red" />
        <Metric label="Total Lançado" value={fmt(totalLanc)} color="green" />
      </div>
      <Card title="Pagamentos do Mês">
        <TabelaPagamentos
          pagamentos={pagamentos}
          onEditar={p => { setEditando(p); setModal(true) }}
          onExcluir={excluir}
          onMarcarLancado={id => atualizarStatus(id, 'lancado')}
          onReabrir={id => atualizarStatus(id, 'pendente')}
        />
      </Card>
      <ModalPagamento
        open={modal}
        onClose={() => { setModal(false); setEditando(null) }}
        onSalvar={salvar}
        inicial={editando}
        conta={label}
      />
    </div>
  )
}