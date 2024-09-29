'use client';

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface Pessoa {
  id: number
  nome: string
  telefone: string | null
  idade: number | null
  sexo: string | null
  endereco: string | null
  bairro: string | null
  cidade_id: number | null
}

interface Cidade {
  id: number
  nome: string
}

export default function Pessoas() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Omit<Pessoa, 'id'>>({
    nome: '',
    telefone: '',
    idade: null,
    sexo: '',
    endereco: '',
    bairro: '',
    cidade_id: null
  })
  const supabase = createClient()

  useEffect(() => {
    fetchPessoas()
    fetchCidades()
  }, [])

  async function fetchPessoas() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('pessoas')
        .select('*')
        .order('nome')

      if (error) throw error
      setPessoas(data || [])
    } catch (error) {
      console.error('Erro ao buscar pessoas:', error)
      alert('Erro ao carregar pessoas!')
    } finally {
      setLoading(false)
    }
  }

  async function fetchCidades() {
    try {
      const { data, error } = await supabase
        .from('cidades')
        .select('*')
        .order('nome')

      if (error) throw error
      setCidades(data || [])
    } catch (error) {
      console.error('Erro ao buscar cidades:', error)
      alert('Erro ao carregar cidades!')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      if (editingId) {
        const { error } = await supabase
          .from('pessoas')
          .update(formData)
          .eq('id', editingId)
        if (error) throw error
        alert('Pessoa atualizada com sucesso!')
      } else {
        const { error } = await supabase
          .from('pessoas')
          .insert(formData)
        if (error) throw error
        alert('Pessoa adicionada com sucesso!')
      }
      setEditingId(null)
      setFormData({
        nome: '',
        telefone: '',
        idade: null,
        sexo: '',
        endereco: '',
        bairro: '',
        cidade_id: null
      })
      fetchPessoas()
    } catch (error) {
      console.error('Erro ao salvar pessoa:', error)
      alert('Erro ao salvar pessoa!')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    if (confirm('Tem certeza que deseja excluir esta pessoa?')) {
      try {
        setLoading(true)
        const { error } = await supabase
          .from('pessoas')
          .delete()
          .eq('id', id)
        if (error) throw error
        alert('Pessoa excluída com sucesso!')
        fetchPessoas()
      } catch (error) {
        console.error('Erro ao excluir pessoa:', error)
        alert('Erro ao excluir pessoa!')
      } finally {
        setLoading(false)
      }
    }
  }

  function handleEdit(pessoa: Pessoa) {
    setEditingId(pessoa.id)
    setFormData({
      nome: pessoa.nome,
      telefone: pessoa.telefone || '',
      idade: pessoa.idade,
      sexo: pessoa.sexo || '',
      endereco: pessoa.endereco || '',
      bairro: pessoa.bairro || '',
      cidade_id: pessoa.cidade_id
    })
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'idade' || name === 'cidade_id' ? (value ? Number(value) : null) : value
    }))
  }

  return (
    <div>
      <Link href="/">
        <button>Voltar</button>
      </Link>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome"
          placeholder="Nome"
          value={formData.nome}
          onChange={handleInputChange}
          required
        />
        <input
          type="tel"
          name="telefone"
          placeholder="Telefone"
          value={formData.telefone || ''}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="idade"
          placeholder="Idade"
          value={formData.idade || ''}
          onChange={handleInputChange}
        />
        <select
          name="sexo"
          value={formData.sexo || ''}
          onChange={handleInputChange}
        >
          <option value="">Selecione o sexo</option>
          <option value="M">Masculino</option>
          <option value="F">Feminino</option>
        </select>
        <input
          type="text"
          name="endereco"
          placeholder="Endereço"
          value={formData.endereco || ''}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="bairro"
          placeholder="Bairro"
          value={formData.bairro || ''}
          onChange={handleInputChange}
        />
        <select
          name="cidade_id"
          value={formData.cidade_id || ''}
          onChange={handleInputChange}
        >
          <option value="">Selecione a cidade</option>
          {cidades.map(cidade => (
            <option key={cidade.id} value={cidade.id}>{cidade.nome}</option>
          ))}
        </select>
        <button type="submit" disabled={loading}>
          {editingId ? 'Atualizar' : 'Adicionar'} Pessoa
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
              <th>Idade</th>
              <th>Sexo</th>
              <th>Endereço</th>
              <th>Bairro</th>
              <th>Cidade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pessoas.map((pessoa) => (
              <tr key={pessoa.id}>
                <td>{pessoa.nome}</td>
                <td>{pessoa.telefone}</td>
                <td>{pessoa.idade}</td>
                <td>{pessoa.sexo}</td>
                <td>{pessoa.endereco}</td>
                <td>{pessoa.bairro}</td>
                <td>{cidades.find(c => c.id === pessoa.cidade_id)?.nome}</td>
                <td>
                  <button onClick={() => handleEdit(pessoa)}>Editar</button>
                  <button onClick={() => handleDelete(pessoa.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}