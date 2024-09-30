'use client';

import { useState, useEffect, useCallback } from 'react'
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

  const fetchTiposAtendimento = useCallback(async () => {    
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
  }, [supabase]);

  useEffect(() => {
    fetchTiposAtendimento()
  }, [fetchTiposAtendimento])

  
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
    <section className="max-w-4xl p-6 mx-auto bg-white rounded-md shadow-md dark:bg-gray-800">
      <h2 className="text-xl font-semibold text-gray-700 capitalize dark:text-white">Tipos de Atendimento</h2>
      <Link href="/">
        <button className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
          Voltar
        </button>
      </Link>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-1 gap-6 mt-4">
          <div>
            <label className="text-gray-700 dark:text-gray-200" htmlFor="descricao_atendimento">Descrição do Atendimento</label>
            <input
              id="descricao_atendimento"
              type="text"
              value={descricaoAtendimento}
              onChange={(e) => setDescricaoAtendimento(e.target.value)}
              required
              className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
          >
            {editingId ? 'Atualizar' : 'Adicionar'} Tipo de Atendimento
          </button>
        </div>
      </form>

      {loading ? (
        <p className="mt-6 text-gray-600 dark:text-gray-300">Carregando...</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Descrição do Atendimento</th>
                <th scope="col" className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tiposAtendimento.map((tipo) => (
                <tr key={tipo.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4">{tipo.descricao_atendimento}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(tipo)}
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(tipo.id)}
                      className="font-medium text-red-600 dark:text-red-500 hover:underline"
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
    </section>
  )
}