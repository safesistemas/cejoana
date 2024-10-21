'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Cidade {
  id: number;
  nome: string;
  uf: string;
}

export default function Cidades() {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [uf, setUf] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const supabase = createClient();

  const fetchCidades = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cidades')
        .select('*')
        .order('nome');

      if (error) throw error;
      setCidades(data || []);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      toast.error('Erro ao carregar cidades!');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCidades();
  }, [fetchCidades]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        const { error } = await supabase
          .from('cidades')
          .update({ nome, uf })
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Cidade atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('cidades')
          .insert({ nome, uf });
        if (error) throw error;
        toast.success('Cidade adicionada com sucesso!');
      }
      resetForm();
      fetchCidades();
    } catch (error) {
      console.error('Erro ao salvar cidade:', error);
      toast.error('Erro ao salvar cidade!');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (selectedIds.length === 0) {
      toast.error('Selecione pelo menos uma cidade para excluir.');
      return;
    }
    if (confirm(`Tem certeza que deseja excluir ${selectedIds.length} cidade(s)?`)) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('cidades')
          .delete()
          .in('id', selectedIds);
        if (error) throw error;
        toast.success('Cidade(s) excluída(s) com sucesso!');
        setSelectedIds([]);
        fetchCidades();
      } catch (error) {
        console.error('Erro ao excluir cidade(s):', error);
        toast.error('Erro ao excluir cidade(s)!');
      } finally {
        setLoading(false);
      }
    }
  }

  function handleEdit() {
    if (selectedIds.length !== 1) {
      toast.error('Selecione exatamente uma cidade para editar.');
      return;
    }
    const cidade = cidades.find(c => c.id === selectedIds[0]);
    if (cidade) {
      setEditingId(cidade.id);
      setNome(cidade.nome);
      setUf(cidade.uf);
      setShowForm(true);
    }
  }

  function handleCancel() {
    resetForm();
  }

  function resetForm() {
    setEditingId(null);
    setNome('');
    setUf('');
    setShowForm(false);
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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mx-auto pl-10 pr-10 text-center">Cadastro de Cidades</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setNome(''); setUf(''); }}
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
              <label className="text-gray-700 dark:text-gray-200" htmlFor="nome">Nome da Cidade</label>
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
              <label className="text-gray-700 dark:text-gray-200" htmlFor="uf">UF</label>
              <input
                id="uf"
                type="text"
                value={uf}
                onChange={(e) => setUf(e.target.value)}
                required
                maxLength={2}
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
                <th scope="col" className="px-1 py-3">Nome da Cidade</th>
                <th scope="col" className="px-1 py-3">UF</th>
              </tr>
            </thead>
            <tbody>
              {cidades.map((cidade, index) => (
                <tr 
                  key={cidade.id} 
                  className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700`}
                >
                  <td className="px-0 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(cidade.id)}
                      onChange={() => handleCheckboxChange(cidade.id)}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded"
                    />
                  </td>
                  <td className="px-1 py-4">{cidade.nome}</td>
                  <td className="px-1 py-4">{cidade.uf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}