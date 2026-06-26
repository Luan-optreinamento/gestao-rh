type Props = {
  label: string
  value: string
  sub?: string
  color?: 'default' | 'red' | 'green'
}

const colors = {
  default: 'text-gray-900',
  red: 'text-red-600',
  green: 'text-green-700',
}

export default function Metric({ label, value, sub, color = 'default' }: Props) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-xs font-medium text-gray-400 mb-1.5">{label}</div>
      <div className={`text-2xl font-semibold ${colors[color]}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}