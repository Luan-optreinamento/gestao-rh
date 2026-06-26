'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { CentroCusto } from '@/lib/types'

export default function CentrosPage() {
  const [centros, setCentros] = useState<CentroCusto[]>([])
  const [nome, setNome] = useState('')
  const [desc, setDesc] = useState('')

  async function carregar() {
    const res = await fetch('/api/centros')
    setCentros(await res.json())
  }

  useEffect(() => { carregar() }, [])

  async function adicionar() {
    if (!nome.trim()) return alert('Informe o nome.')
    if (centros.find(c => c.nome.toLowerCase() === nome.toLowerCase())) return alert('Já existe.')
    await fetch('/api/centros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, descricao: desc }),
    })
    setNome('')
    setDesc('')
    carregar()
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este centro de custo?')) return
    await fetch(`/api/centros/${id}`, { method: 'DELETE' })
    carregar()
  }

  return (
    <div>
      <Header title="Centros de Custo" subtitle="Cadastre os centros para categorizar as transações do extrato." />
      <div className="grid grid-cols-2 gap-5 items-start">
        <Card title="Novo Centro de Custo">
          <div className="space-y-3">
            <Input label="Nome" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Salários, Aluguel..." />
            <Input label="Descrição (opcional)" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Breve descrição" />
            <Button variant="primary" onClick={adicionar}>Adicionar</Button>
          </div>
        </Card>
        <Card title="Centros Cadastrados">
          {!centros.length
            ? <p className="text-sm text-gray-400 text-center py-6">Nenhum centro cadastrado.</p>
            : centros.map(cc => (
                <div key={cc.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium">{cc.nome}</div>
                    {cc.descricao && <div className="text-xs text-gray-400">{cc.descricao}</div>}
                  </div>
                  <Button size="sm" variant="danger" onClick={() => excluir(cc.id)}>Excluir</Button>
                </div>
              ))
          }
        </Card>
      </div>
    </div>
  )
}