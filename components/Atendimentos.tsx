'use client';

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface Atendimento {
  id: number
  pessoa_id: number
  atendente_id: number
  data_atendimento: string
  tipo_atendimento_id: number
  orientacao: string | null
  observacao: string | null
}

interface Pessoa {
  id: number
  nome: string
}

interface Atendente {
  id: number
  nome: string
}

interface TipoAtendimento {
  id: number
  descricao_atendimento: string
}

export default function Atendimentos() {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([])
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [atendentes, setAtendentes] = useState<Atendente[]>([])
  const [tiposAtendimento, setTiposAtendimento] = useState<TipoAtendimento[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Omit<Atendimento, 'id'>>({
    pessoa_id: 0,
    atendente_id: 0,
    data_atendimento: '',
    tipo_atendimento_id: 0,
    orientacao: '',
    observacao: ''
  })
  const supabase = createClient()

  useEffect(() => {
    fetchAtendimentos()
    fetchPessoas()
    fetchAtendentes()
    fetchTiposAtendimento()
  }, [])

  async function fetchAtendimentos() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('atendimentos')
        .select('*')
        .order('data_atendimento', { ascending: false })

      if (error) throw error
      setAtendimentos(data || [])
    } catch (error) {
      console.error('Erro ao buscar atendimentos:', error)
      alert('Erro ao carregar atendimentos!')
    } finally {
      setLoading(false)
    }
  }

  async function fetchPessoas() {
    const { data, error } = await supabase.from('pessoas').select('id, nome')
    if (error) console.error('Erro ao buscar pessoas:', error)
    else setPessoas(data || [])
  }

  async function fetchAtendentes() {
    const { data, error } = await supabase.from('atendentes').select('id, nome')
    if (error) console.error('Erro ao buscar atendentes:', error)
    else setAtendentes(data || [])
  }

  async function fetchTiposAtendimento() {
    const { data, error } = await supabase.from('tipo_atendimento').select('id, descricao_atendimento')
    if (error) console.error('Erro ao buscar tipos de atendimento:', error)
    else setTiposAtendimento(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      if (editingId) {
        const { error } = await supabase
          .from('atendimentos')
          .update(formData)
          .eq('id', editingId)
        if (error) throw error
        alert('Atendimento atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('atendimentos')
          .insert(formData)
        if (error) throw error
        alert('Atendimento adicionado com sucesso!')
      }
      setEditingId(null)
      setFormData({
        pessoa_id: 0,
        atendente_id: 0,
        data_atendimento: '',
        tipo_atendimento_id: 0,
        orientacao: '',
        observacao: ''
      })
      fetchAtendimentos()
    } catch (error) {
      console.error('Erro ao salvar atendimento:', error)
      alert('Erro ao salvar atendimento!')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    if (confirm('Tem certeza que deseja excluir este atendimento?')) {
      try {
        setLoading(true)
        const { error } = await supabase
          .from('atendimentos')
          .delete()
          .eq('id', id)
        if (error) throw error
        alert('Atendimento excluído com sucesso!')
        fetchAtendimentos()
      } catch (error) {
        console.error('Erro ao excluir atendimento:', error)
        alert('Erro ao excluir atendimento!')
      } finally {
        setLoading(false)
      }
    }
  }

  function handleEdit(atendimento: Atendimento) {
    setEditingId(atendimento.id)
    setFormData({
      pessoa_id: atendimento.pessoa_id,
      atendente_id: atendimento.atendente_id,
      data_atendimento: atendimento.data_atendimento,
      tipo_atendimento_id: atendimento.tipo_atendimento_id,
      orientacao: atendimento.orientacao || '',
      observacao: atendimento.observacao || ''
    })
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ['pessoa_id', 'atendente_id', 'tipo_atendimento_id'].includes(name) ? Number(value) : value
    }))
  }

  return (
    <div>
      <Link href="/">
        <button>Voltar</button>
      </Link>

      <form onSubmit={handleSubmit}>
        <select
          name="pessoa_id"
          value={formData.pessoa_id}
          onChange={handleInputChange}
          required
        >
          <option value="">Selecione a pessoa</option>
          {pessoas.map(pessoa => (
            <option key={pessoa.id} value={pessoa.id}>{pessoa.nome}</option>
          ))}
        </select>

        <select
          name="atendente_id"
          value={formData.atendente_id}
          onChange={handleInputChange}
          required
        >
          <option value="">Selecione o atendente</option>
          {atendentes.map(atendente => (
            <option key={atendente.id} value={atendente.id}>{atendente.nome}</option>
          ))}
        </select>

        <input
          type="datetime-local"
          name="data_atendimento"
          value={formData.data_atendimento}
          onChange={handleInputChange}
          required
        />

        <select
          name="tipo_atendimento_id"
          value={formData.tipo_atendimento_id}
          onChange={handleInputChange}
          required
        >
          <option value="">Selecione o tipo de atendimento</option>
          {tiposAtendimento.map(tipo => (
            <option key={tipo.id} value={tipo.id}>{tipo.descricao_atendimento}</option>
          ))}
        </select>

        <textarea
          name="orientacao"
          placeholder="Orientação"
          value={formData.orientacao || ''}
          onChange={handleInputChange}
        />

        <textarea
          name="observacao"
          placeholder="Observação"
          value={formData.observacao || ''}
          onChange={handleInputChange}
        />

        <button type="submit" disabled={loading}>
          {editingId ? 'Atualizar' : 'Adicionar'} Atendimento
        </button>
      </form>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Pessoa</th>
              <th>Atendente</th>
              <th>Data do Atendimento</th>
              <th>Tipo de Atendimento</th>
              <th>Orientação</th>
              <th>Observação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {atendimentos.map((atendimento) => (
              <tr key={atendimento.id}>
                <td>{pessoas.find(p => p.id === atendimento.pessoa_id)?.nome}</td>
                <td>{atendentes.find(a => a.id === atendimento.atendente_id)?.nome}</td>
                <td>{new Date(atendimento.data_atendimento).toLocaleString()}</td>
                <td>{tiposAtendimento.find(t => t.id === atendimento.tipo_atendimento_id)?.descricao_atendimento}</td>
                <td>{atendimento.orientacao}</td>
                <td>{atendimento.observacao}</td>
                <td>
                  <button onClick={() => handleEdit(atendimento)}>Editar</button>
                  <button onClick={() => handleDelete(atendimento.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}