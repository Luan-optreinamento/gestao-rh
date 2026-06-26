'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/conta/01', label: 'Conta 01', icon: '▭' },
  { href: '/conta/02', label: 'Conta 02', icon: '▭' },
  { href: '/extrato', label: 'Extrato', icon: '≡' },
  { href: '/relatorios', label: 'Relatórios', icon: '▮' },
  { href: '/centros', label: 'Centros de Custo', icon: '⚙' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0 z-50">
      <div className="px-4 py-5 border-b border-gray-200">
        <div className="text-sm font-semibold text-gray-900 tracking-wide">GESTÃO FINANCEIRA</div>
        <div className="text-xs text-gray-400 mt-0.5">OP Treinamentos</div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {links.map(link => {
          const active = pathname === link.href || pathname.startsWith(link.href + '/')
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-base leading-none">{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 py-3 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span>↩</span> Sair
        </button>
      </div>
    </aside>
  )
}