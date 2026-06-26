'use client'
import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { fmt, fmtData } from '@/lib/utils'

type Transacao = {
  id: string
  memo?: string | null
  data: string
  valor: string
  conta: string
}

type CC = { id: string; nome: string }

type Props = {
  open: boolean
  onClose: () => void
  transacao: Transacao | null
  centros: CC[]
  onSalvar: (id: string, desc: string, ccId: string) => void
}

export default function ModalConciliacao({ open, onClose, transacao, centros, onSalvar }: Props) {
  const [desc, setDesc] = useState('')
  const [ccId, setCcId] = useState('')

  useEffect(() => { setDesc(''); setCcId('') }, [transacao])

  function handleSalvar() {
    if (!desc.trim()) return alert('Informe a descrição.')
    onSalvar(transacao!.id, desc, ccId)
    onClose()
  }

  const val = parseFloat(transacao?.valor || '0')

  return (
    <Modal open={open} onClose={onClose} title="Conciliar Transação" onConfirm={handleSalvar} confirmLabel="Conciliar">
      {transacao && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
          <div className="font-medium">{transacao.memo || '(sem descrição)'}</div>
          <div className="text-gray-500 mt-0.5">
            {fmtData(transacao.data)} •{' '}
            <span className={val >= 0 ? 'text-green-600' : 'text-red-600'}>{fmt(val)}</span>
            {' '}• {transacao.conta === 'conta01' ? 'Conta 01' : 'Conta 02'}
          </div>
        </div>
      )}
      <div className="space-y-3">
        <Input label="Descrição (finalidade)" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Para que serviu?" />
        <Select
          label="Centro de Custo"
          value={ccId}
          onChange={e => setCcId(e.target.value)}
          placeholder="— Selecione —"
          options={centros.map(c => ({ value: c.id, label: c.nome }))}
        />
      </div>
    </Modal>
  )
}