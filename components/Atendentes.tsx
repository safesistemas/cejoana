// @/components/Atendentes.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Atendente {
  id: number;
  nome: string;
  telefone: string | null;
}

export default function Atendentes() {
  const [atendentes, setAtendentes] = useState<Atendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [originalAtendente, setOriginalAtendente] = useState<Atendente | null>(null);
  const supabase = createClient();

  // Use useCallback to memorize the fetchAtendentes function
  const fetchAtendentes = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('atendentes')
        .select('*')
        .order('nome');

      if (error) throw error;
      setAtendentes(data || []);
    } catch (error) {
      console.error('Erro ao buscar atendentes:', error);
      toast.error('Erro ao carregar atendentes!');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAtendentes();
  }, [fetchAtendentes]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        const { error } = await supabase
          .from('atendentes')
          .update({ nome, telefone })
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Atendente atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('atendentes')
          .insert({ nome, telefone });
        if (error) throw error;
        toast.success('Atendente adicionado com sucesso!');
      }
      resetForm();
      fetchAtendentes();
    } catch (error) {
      console.error('Erro ao salvar atendente:', error);
      toast.error('Erro ao salvar atendente!');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (selectedIds.length === 0) {
      toast.error('Selecione pelo menos um atendente para excluir.');
      return;
    }
    if (confirm(`Tem certeza que deseja excluir ${selectedIds.length} atendente(s)?`)) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('atendentes')
          .delete()
          .in('id', selectedIds);
        if (error) throw error;
        toast.success('Atendente(s) excluído(s) com sucesso!');
        setSelectedIds([]);
        fetchAtendentes();
      } catch (error) {
        console.error('Erro ao excluir atendente(s):', error);
        toast.error('Erro ao excluir atendente(s)!');
      } finally {
        setLoading(false);
      }
    }
  }

  function handleEdit() {
    if (selectedIds.length !== 1) {
      toast.error('Selecione exatamente um atendente para editar.');
      return;
    }
    const atendente = atendentes.find(a => a.id === selectedIds[0]);
    if (atendente) {
      setEditingId(atendente.id);
      setNome(atendente.nome);
      setTelefone(atendente.telefone || '');
      setOriginalAtendente(atendente);
      setShowForm(true);
    }
  }

  function handleCancel() {
    resetForm();
  }

  function resetForm() {
    setEditingId(null);
    setNome('');
    setTelefone('');
    setShowForm(false);
    setOriginalAtendente(null);
  }

  function handleCheckboxChange(id: number) {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  return (
    <section className="max-w-4xl p-6 mx-auto bg-white rounded-md shadow-md dark:bg-gray-800">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
      <Link href="/">
            <button className="px-4 py-2 text-sm text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
              Voltar
            </button>
          </Link>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mx-auto pl-10 pr-10 text-center">Atendentes</h2>
        <div className="flex space-x-2">
        <button
            onClick={() => { setShowForm(true); setEditingId(null); setNome(''); setTelefone(''); }}
            className="flex items-center justify-end p-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
            title="Incluir" 
        >
            <PlusCircle size={24} />
            <p className="ml-2 hidden md:block">Incluir</p>
        </button>
          <button
            onClick={handleEdit}
            className="flex items-center justify-end p-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="Editar"
          >
            <Edit2 size={24} />
            <p className="ml-2 hidden md:block">Editar</p>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-end p-2 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            title="Excluir"
          >
            <Trash2 size={24} />
            <p className="ml-2 hidden md:block">Excluir</p>
          </button>
        </div>
      </div>

      {showForm && (
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
          <div className="flex justify-end mt-6 space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {editingId ? 'Gravar Alterações' : 'Incluir'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                Cancelar Alterações
              </button>
            )}
          </div>
        </form>
      )}

      {loading ? (
        <p className="mt-6 text-gray-600 dark:text-gray-300">Carregando...</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-0 py-3"></th>
                <th scope="col" className="px-1 py-3">Nome</th>
                <th scope="col" className="px-1 py-3">Telefone</th>
              </tr>
            </thead>
            <tbody>
              {atendentes.map((atendente) => (
                <tr key={atendente.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-0 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(atendente.id)}
                      onChange={() => handleCheckboxChange(atendente.id)}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded "
                    />
                  </td>
                  <td className="px-1 py-4">{atendente.nome}</td>
                  <td className="px-1 py-4">{atendente.telefone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}