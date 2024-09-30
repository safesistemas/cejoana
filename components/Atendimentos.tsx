'use client';

import { useState, useEffect, useCallback } from 'react'
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

  const fetchAtendimentos = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('atendimentos')
        .select('*')
        .order('data_atendimento', { ascending: false });

      if (error) throw error;
      setAtendimentos(data || []);
    } catch (error) {
      console.error('Erro ao buscar atendimentos:', error);
      alert('Erro ao carregar atendimentos!');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchPessoas = useCallback(async () => {
    const { data, error } = await supabase.from('pessoas').select('id, nome');
    if (error) console.error('Erro ao buscar pessoas:', error);
    else setPessoas(data || []);
  }, [supabase]);

  const fetchAtendentes = useCallback(async () => {
    const { data, error } = await supabase.from('atendentes').select('id, nome');
    if (error) console.error('Erro ao buscar atendentes:', error);
    else setAtendentes(data || []);
  }, [supabase]);

  const fetchTiposAtendimento = useCallback(async () => {
    const { data, error } = await supabase.from('tipo_atendimento').select('id, descricao_atendimento');
    if (error) console.error('Erro ao buscar tipos de atendimento:', error);
    else setTiposAtendimento(data || []);
  }, [supabase]);

  useEffect(() => {
    fetchAtendimentos();
    fetchPessoas();
    fetchAtendentes();
    fetchTiposAtendimento();
  }, [fetchAtendimentos, fetchPessoas, fetchAtendentes, fetchTiposAtendimento]);

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
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gerenciamento de Atendimentos</h1>
        <Link href="/">
          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
            Voltar
          </button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            name="pessoa_id"
            value={formData.pessoa_id}
            onChange={handleInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />

          <select
            name="tipo_atendimento_id"
            value={formData.tipo_atendimento_id}
            onChange={handleInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Selecione o tipo de atendimento</option>
            {tiposAtendimento.map(tipo => (
              <option key={tipo.id} value={tipo.id}>{tipo.descricao_atendimento}</option>
            ))}
          </select>
        </div>

        <textarea
          name="orientacao"
          placeholder="Orientação"
          value={formData.orientacao || ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        <textarea
          name="observacao"
          placeholder="Observação"
          value={formData.observacao || ''}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 disabled:opacity-50"
        >
          {editingId ? 'Atualizar' : 'Adicionar'} Atendimento
        </button>
      </form>

      {loading ? (
        <p className="text-center text-gray-600 dark:text-gray-300">Carregando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-200">Pessoa</th>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-200">Atendente</th>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-200">Data do Atendimento</th>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-200">Tipo de Atendimento</th>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-200">Orientação</th>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-200">Observação</th>
                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-200">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {atendimentos.map((atendimento) => (
                <tr key={atendimento.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{pessoas.find(p => p.id === atendimento.pessoa_id)?.nome}</td>
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{atendentes.find(a => a.id === atendimento.atendente_id)?.nome}</td>
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{new Date(atendimento.data_atendimento).toLocaleString()}</td>
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{tiposAtendimento.find(t => t.id === atendimento.tipo_atendimento_id)?.descricao_atendimento}</td>
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{atendimento.orientacao}</td>
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{atendimento.observacao}</td>
                  <td className="px-4 py-2">
                    <button 
                      onClick={() => handleEdit(atendimento)}
                      className="mr-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(atendimento.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}