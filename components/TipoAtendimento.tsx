'use client';

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface TipoAtendimento {
  id: number
  descricao_atendimento: string
}

export default function TipoAtendimento() {
  const [tiposAtendimento, setTiposAtendimento] = useState<TipoAtendimento[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [descricaoAtendimento, setDescricaoAtendimento] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchTiposAtendimento()
  }, [])

  async function fetchTiposAtendimento() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tipo_atendimento')
        .select('*')
        .order('descricao_atendimento')

      if (error) throw error
      setTiposAtendimento(data || [])
    } catch (error) {
      console.error('Erro ao buscar tipos de atendimento:', error)
      alert('Erro ao carregar tipos de atendimento!')
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
          .from('tipo_atendimento')
          .update({ descricao_atendimento: descricaoAtendimento })
          .eq('id', editingId)
        if (error) throw error
        alert('Tipo de atendimento atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('tipo_atendimento')
          .insert({ descricao_atendimento: descricaoAtendimento })
        if (error) throw error
        alert('Tipo de atendimento adicionado com sucesso!')
      }
      setEditingId(null)
      setDescricaoAtendimento('')
      fetchTiposAtendimento()
    } catch (error) {
      console.error('Erro ao salvar tipo de atendimento:', error)
      alert('Erro ao salvar tipo de atendimento!')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    if (confirm('Tem certeza que deseja excluir este tipo de atendimento?')) {
      try {
        setLoading(true)
        const { error } = await supabase
          .from('tipo_atendimento')
          .delete()
          .eq('id', id)
        if (error) throw error
        alert('Tipo de atendimento excluído com sucesso!')
        fetchTiposAtendimento()
      } catch (error) {
        console.error('Erro ao excluir tipo de atendimento:', error)
        alert('Erro ao excluir tipo de atendimento!')
      } finally {
        setLoading(false)
      }
    }
  }

  function handleEdit(tipoAtendimento: TipoAtendimento) {
    setEditingId(tipoAtendimento.id)
    setDescricaoAtendimento(tipoAtendimento.descricao_atendimento)
  }

  return (
    <div>
      <Link href="/">
        <button>Voltar</button>
      </Link>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Descrição do Atendimento"
          value={descricaoAtendimento}
          onChange={(e) => setDescricaoAtendimento(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {editingId ? 'Atualizar' : 'Adicionar'} Tipo de Atendimento
        </button>
      </form>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Descrição do Atendimento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {tiposAtendimento.map((tipo) => (
              <tr key={tipo.id}>
                <td>{tipo.descricao_atendimento}</td>
                <td>
                  <button onClick={() => handleEdit(tipo)}>Editar</button>
                  <button onClick={() => handleDelete(tipo.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}