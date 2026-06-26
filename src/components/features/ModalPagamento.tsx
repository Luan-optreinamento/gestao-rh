'use client'
import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'

type PagamentoForm = {
  nome: string
  valor: string
  vencimento: string
  status: string
  obs?: string | null
  conta?: string
}

type PagamentoInicial = PagamentoForm & { id?: string }

type Props = {
  open: boolean
  onClose: () => void
  onSalvar: (dados: PagamentoForm) => void | Promise<void>
  inicial?: PagamentoInicial | null
  conta: string
}

const vazio: PagamentoForm = { nome: '', valor: '', vencimento: '', obs: '', status: 'pendente' }

export default function ModalPagamento({ open, onClose, onSalvar, inicial, conta }: Props) {
  const [form, setForm] = useState<PagamentoForm>(vazio)

  useEffect(() => {
    setForm(
      inicial
        ? { nome: inicial.nome, valor: inicial.valor, vencimento: inicial.vencimento, obs: inicial.obs || '', status: inicial.status || 'pendente' }
        : vazio
    )
  }, [inicial, open])

  function set(campo: string, valor: string) {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  function handleSalvar() {
    if (!form.nome || !form.valor || !form.vencimento) {
      return alert('Preencha nome, valor e vencimento.')
    }
    onSalvar(form)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${inicial?.id ? 'Editar' : 'Novo'} Pagamento — ${conta}`}
      onConfirm={handleSalvar}
    >
      <div className="space-y-3">
        <Input
          label="Descrição / Fornecedor"
          value={form.nome}
          onChange={e => set('nome', e.target.value)}
          placeholder="Nome do pagamento"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Valor (R$)"
            type="number"
            min="0"
            step="0.01"
            value={form.valor}
            onChange={e => set('valor', e.target.value)}
          />
          <Input
            label="Vencimento"
            type="date"
            value={form.vencimento}
            onChange={e => set('vencimento', e.target.value)}
          />
        </div>
        <Input
          label="Observação"
          value={form.obs || ''}
          onChange={e => set('obs', e.target.value)}
          placeholder="Opcional..."
        />
      </div>
    </Modal>
  )
}