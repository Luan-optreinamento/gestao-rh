type Props = {
  children: React.ReactNode
  className?: string
  title?: string
}

export default function Card({ children, className = '', title }: Props) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 ${className}`}>
      {title && (
        <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>
      )}
      {children}
    </div>
  )
}