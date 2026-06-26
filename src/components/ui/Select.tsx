type Option = { value: string; label: string }

type Props = {
  label?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: Option[]
  placeholder?: string
  className?: string
}

export default function Select({
  label, value, onChange, options, placeholder, className = '',
}: Props) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition-colors bg-white"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}