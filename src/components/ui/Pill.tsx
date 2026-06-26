type Variant = 'pendente' | 'lancado' | 'vencido' | 'alerta'

const styles: Record<Variant, string> = {
  pendente: 'bg-amber-50 text-amber-700 border-amber-200',
  lancado:  'bg-green-50 text-green-700 border-green-200',
  vencido:  'bg-red-50 text-red-700 border-red-200',
  alerta:   'bg-amber-50 text-amber-700 border-amber-200',
}

const labels: Record<Variant, string> = {
  pendente: 'Pendente',
  lancado:  '✓ Lançado',
  vencido:  '⚠ Vencido',
  alerta:   '⏰ Alerta',
}

export default function Pill({ variant }: { variant: Variant }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border ${styles[variant]}`}>
      {labels[variant]}
    </span>
  )
}