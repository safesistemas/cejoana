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
    <section className="max-w-4xl p-6 mx-auto bg-white rounded-md shadow-md dark:bg-gray-800">
      <h2 className="text-xl font-semibold text-gray-700 capitalize dark:text-white">Atendentes</h2>
      <Link href="/">
        <button className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
          Voltar
        </button>
      </Link>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
          <div>
            <label className="text-gray-700 dark:text-gray-200" htmlFor="nome">Nome</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
            />
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-200" htmlFor="telefone">Telefone</label>
            <input
              id="telefone"
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
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
            {editingId ? 'Atualizar' : 'Adicionar'} Atendente
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
                <th scope="col" className="px-6 py-3">Nome</th>
                <th scope="col" className="px-6 py-3">Telefone</th>
                <th scope="col" className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {atendentes.map((atendente) => (
                <tr key={atendente.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4">{atendente.nome}</td>
                  <td className="px-6 py-4">{atendente.telefone}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(atendente)}
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(atendente.id)}
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