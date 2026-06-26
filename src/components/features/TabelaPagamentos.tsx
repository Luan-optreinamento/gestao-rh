'use client'
import { diasAteVencimento, fmt, fmtData } from '@/lib/utils'
import Pill from '@/components/ui/Pill'
import Button from '@/components/ui/Button'

type Pagamento = {
  id: string
  nome: string
  valor: string
  vencimento: string
  status: string
  obs?: string | null
}

type Props = {
  pagamentos: Pagamento[]
  onEditar: (p: Pagamento) => void
  onExcluir: (id: string) => void
  onMarcarLancado: (id: string) => void
  onReabrir: (id: string) => void
}

function getPill(status: string, vencimento: string) {
  if (status === 'lancado') return 'lancado'
  const d = diasAteVencimento(vencimento)
  if (d < 0) return 'vencido'
  if (d <= 10) return 'alerta'
  return 'pendente'
}

export default function TabelaPagamentos({ pagamentos, onEditar, onExcluir, onMarcarLancado, onReabrir }: Props) {
  if (!pagamentos.length) {
    return <p className="text-sm text-gray-400 text-center py-10">Nenhum pagamento cadastrado.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            {['Descrição','Valor','Vencimento','Status','Obs','Ações'].map(h => (
              <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pagamentos.map(p => (
            <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2.5 font-medium">{p.nome}</td>
              <td className="px-3 py-2.5">{fmt(parseFloat(p.valor))}</td>
              <td className="px-3 py-2.5">{fmtData(p.vencimento)}</td>
              <td className="px-3 py-2.5"><Pill variant={getPill(p.status, p.vencimento)} /></td>
              <td className="px-3 py-2.5 text-gray-400">{p.obs || '—'}</td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  {p.status !== 'lancado'
                    ? <Button size="sm" onClick={() => onMarcarLancado(p.id)}>Lançado</Button>
                    : <Button size="sm" onClick={() => onReabrir(p.id)}>Reabrir</Button>
                  }
                  <Button size="sm" onClick={() => onEditar(p)}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => onExcluir(p.id)}>×</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}