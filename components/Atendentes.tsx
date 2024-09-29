'use client';

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface Atendente {
  id: number
  nome: string
  telefone: string | null
}

export default function Atendentes() {
  const [atendentes, setAtendentes] = useState<Atendente[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchAtendentes()
  }, [])

  async function fetchAtendentes() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('atendentes')
        .select('*')
        .order('nome')

      if (error) throw error
      setAtendentes(data || [])
    } catch (error) {
      console.error('Erro ao buscar atendentes:', error)
      alert('Erro ao carregar atendentes!')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      if (editingId) {
        const { error } = await supabase
          .from('atendentes')
          .update({ nome, telefone })
          .eq('id', editingId)
        if (error) throw error
        alert('Atendente atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('atendentes')
          .insert({ nome, telefone })
        if (error) throw error
        alert('Atendente adicionado com sucesso!')
      }
      setEditingId(null)
      setNome('')
      setTelefone('')
      fetchAtendentes()
    } catch (error) {
      console.error('Erro ao salvar atendente:', error)
      alert('Erro ao salvar atendente!')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    if (confirm('Tem certeza que deseja excluir este atendente?')) {
      try {
        setLoading(true)
        const { error } = await supabase
          .from('atendentes')
          .delete()
          .eq('id', id)
        if (error) throw error
        alert('Atendente excluído com sucesso!')
        fetchAtendentes()
      } catch (error) {
        console.error('Erro ao excluir atendente:', error)
        alert('Erro ao excluir atendente!')
      } finally {
        setLoading(false)
      }
    }
  }

  function handleEdit(atendente: Atendente) {
    setEditingId(atendente.id)
    setNome(atendente.nome)
    setTelefone(atendente.telefone || '')
  }

  return (
    <div>
      <h1>Gerenciar Atendentes</h1>
      <Link href="/">
        <button>Voltar</button>
      </Link>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {editingId ? 'Atualizar' : 'Adicionar'} Atendente
        </button>
      </form>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {atendentes.map((atendente) => (
              <tr key={atendente.id}>
                <td>{atendente.nome}</td>
                <td>{atendente.telefone}</td>
                <td>
                  <button onClick={() => handleEdit(atendente)}>Editar</button>
                  <button onClick={() => handleDelete(atendente.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}