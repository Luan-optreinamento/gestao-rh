'use client'
import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { fmt, fmtData } from '@/lib/utils'
import type { Transacao, CentroCusto } from '@/lib/types'

type Props = {
  open: boolean
  onClose: () => void
  transacao: Transacao | null
  centros: CentroCusto[]
  onSalvar: (id: string, desc: string, ccId: string) => void
  modoEdicao?: boolean
}

export default function ModalConciliacao({ open, onClose, transacao, centros, onSalvar, modoEdicao = false }: Props) {
  const [desc, setDesc] = useState('')
  const [ccId, setCcId] = useState('')

  useEffect(() => {
    if (transacao) {
      setDesc(modoEdicao ? transacao.descricao || '' : '')
      setCcId(modoEdicao ? transacao.centroCustoId || '' : '')
    }
  }, [transacao, modoEdicao, open])

  function handleSalvar() {
    if (!desc.trim()) return alert('Informe a descrição.')
    onSalvar(transacao!.id, desc, ccId)
  }

  const val = parseFloat(transacao?.valor || '0')
  const futura = transacao ? transacao.data > new Date().toISOString().split('T')[0] : false

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modoEdicao ? 'Editar Transação' : 'Conciliar Transação'}
      onConfirm={handleSalvar}
      confirmLabel={modoEdicao ? 'Salvar' : 'Conciliar'}
    >
      {transacao && (
        <div className={`rounded-lg p-3 mb-4 text-sm ${futura ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
          <div className="font-medium">{transacao.memo || '(sem descrição)'}</div>
          <div className="text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
            <span>{fmtData(transacao.data)}</span>
            <span>•</span>
            <span className={val >= 0 ? 'text-green-600' : 'text-red-600'}>{fmt(val)}</span>
            <span>•</span>
            <span>{transacao.conta === 'conta01' ? 'Conta 01' : 'Conta 02'}</span>
            {futura && <span className="text-amber-600 font-medium">⏳ Data futura — agendado pelo banco</span>}
          </div>
        </div>
      )}
      <div className="space-y-3">
        <Input
          label="Descrição (finalidade)"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Para que serviu?"
        />
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