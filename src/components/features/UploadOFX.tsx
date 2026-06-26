'use client'
import { useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'

type Transacao = {
  fitid: string
  data: string
  valor: string
  memo: string
  conta: string
  conciliada: boolean
}

type Props = {
  onImportar: (transacoes: Transacao[], conta: string) => Promise<{ inseridas: number; duplicatas: number }>
}

function parseOFX(raw: string, conta: string): Transacao[] {
  const blocos = raw.split(/<STMTTRN>/i).slice(1)
  return blocos.map(bloco => {
    const g = (tag: string) => bloco.match(new RegExp(`<${tag}>([^<\r\n]+)`, 'i'))?.[1]?.trim() ?? ''
    const fitid = g('FITID')
    const dtposted = g('DTPOSTED')
    const trnamt = g('TRNAMT')
    const memo = g('MEMO') || g('NAME') || ''
    if (!fitid) return null
    const data = dtposted.length >= 8
      ? `${dtposted.slice(0,4)}-${dtposted.slice(4,6)}-${dtposted.slice(6,8)}`
      : ''
    return { fitid, data, valor: trnamt.replace(',', '.'), memo, conta, conciliada: false }
  }).filter((t): t is Transacao => t !== null)
}

export default function UploadOFX({ onImportar }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [conta, setConta] = useState('conta01')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleFile(file: File) {
    const raw = await file.text()
    const txs = parseOFX(raw, conta)
    if (!txs.length) { setStatus('Nenhuma transação encontrada no arquivo.'); return }
    setLoading(true)
    const res = await onImportar(txs, conta)
    setStatus(`✓ ${res.inseridas} importada(s). ${res.duplicatas} duplicata(s) ignorada(s).`)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const f = e.dataTransfer.files[0]
          if (f) handleFile(f)
        }}
      >
        <div className="text-3xl mb-2">📂</div>
        <div className="text-sm font-medium text-gray-500">Clique ou arraste o arquivo OFX</div>
        <div className="text-xs text-gray-400 mt-1">Gerenciador Financeiro OFX (Money 2000 em diante)</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".ofx,.OFX"
        className="hidden"
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
      />
      <div className="flex items-end gap-3">
        <Select
          label="Conta"
          value={conta}
          onChange={e => setConta(e.target.value)}
          options={[
            { value: 'conta01', label: 'Conta 01' },
            { value: 'conta02', label: 'Conta 02' },
          ]}
          className="flex-1"
        />
        <Button variant="primary" disabled={loading}>
          {loading ? 'Processando...' : 'Processar'}
        </Button>
      </div>
      {status && <p className="text-sm text-green-700 font-medium">{status}</p>}
    </div>
  )
}