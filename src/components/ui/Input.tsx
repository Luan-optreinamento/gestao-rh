type Props = {
  label?: string
  name?: string
  type?: string
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  min?: string
  step?: string
  className?: string
}

export default function Input({
  label, name, type = 'text', value, onChange,
  placeholder, required, min, step, className = '',
}: Props) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {label}
        </label>
      )}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition-colors bg-white"
      />
    </div>
  )
}