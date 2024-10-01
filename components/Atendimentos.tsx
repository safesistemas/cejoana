// @/components/Atendimentos.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';


interface Atendimento {
  id: number;
  pessoa_id: number;
  atendente_id: number;
  data_atendimento: string;
  tipo_atendimento_id: number;
  orientacao: string | null;
  observacao: string | null;
}

interface Pessoa {
  id: number;
  nome: string;
}

interface Atendente {
  id: number;
  nome: string;
}

interface TipoAtendimento {
  id: number;
  descricao_atendimento: string;
}

export default function Atendimentos() {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [atendentes, setAtendentes] = useState<Atendente[]>([]);
  const [tiposAtendimento, setTiposAtendimento] = useState<TipoAtendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [formData, setFormData] = useState<Omit<Atendimento, 'id'>>({
    pessoa_id: 0,
    atendente_id: 0,
    data_atendimento: '',
    tipo_atendimento_id: 0,
    orientacao: '',
    observacao: ''
  });
  const supabase = createClient();

  function formatDateToLocal(dateString: string) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

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
      toast.error('Erro ao carregar atendimentos!');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchPessoas = useCallback(async () => {
    const { data, error } = await supabase.from('pessoas').select('id, nome').order('nome');
    if (error) console.error('Erro ao buscar pessoas:', error);
    else setPessoas(data || []);
  }, [supabase]);

  const fetchAtendentes = useCallback(async () => {
    const { data, error } = await supabase.from('atendentes').select('id, nome').order('nome');
    if (error) console.error('Erro ao buscar atendentes:', error);
    else setAtendentes(data || []);
  }, [supabase]);

  const fetchTiposAtendimento = useCallback(async () => {
    const { data, error } = await supabase.from('tipo_atendimento').select('id, descricao_atendimento').order('descricao_atendimento');
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
    e.preventDefault();
    try {
      setLoading(true);
      const dataToSend = {
        ...formData,
        data_atendimento: new Date(formData.data_atendimento).toISOString()
      };
      if (editingId) {
        const { error } = await supabase
          .from('atendimentos')
          .update(dataToSend)
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Atendimento atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('atendimentos')
          .insert(dataToSend);
        if (error) throw error;
        toast.success('Atendimento adicionado com sucesso!');
      }
      resetForm();
      fetchAtendimentos();
    } catch (error) {
      console.error('Erro ao salvar atendimento:', error);
      toast.error('Erro ao salvar atendimento!');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (selectedIds.length === 0) {
      toast.error('Selecione pelo menos um atendimento para excluir.');
      return;
    }
    if (confirm(`Tem certeza que deseja excluir ${selectedIds.length} atendimento(s)?`)) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('atendimentos')
          .delete()
          .in('id', selectedIds);
        if (error) throw error;
        toast.success('Atendimento(s) excluído(s) com sucesso!');
        setSelectedIds([]);
        fetchAtendimentos();
      } catch (error) {
        console.error('Erro ao excluir atendimento(s):', error);
        toast.error('Erro ao excluir atendimento(s)!');
      } finally {
        setLoading(false);
      }
    }
  }

  function handleEdit() {
    if (selectedIds.length !== 1) {
      toast.error('Selecione exatamente um atendimento para editar.');
      return;
    }
    const atendimento = atendimentos.find(a => a.id === selectedIds[0]);
    if (atendimento) {
      setEditingId(atendimento.id);
      setFormData({
        pessoa_id: atendimento.pessoa_id,
        atendente_id: atendimento.atendente_id,
        data_atendimento: new Date(atendimento.data_atendimento).toISOString().slice(0, 16),
        tipo_atendimento_id: atendimento.tipo_atendimento_id,
        orientacao: atendimento.orientacao || '',
        observacao: atendimento.observacao || ''
      });
      setShowForm(true);
    }
  }

  function handleCancel() {
    resetForm();
  }

  function resetForm() {
    setEditingId(null);
    setFormData({
      pessoa_id: 0,
      atendente_id: 0,
      data_atendimento: new Date().toISOString().slice(0, 16), // Formato YYYY-MM-DDTHH:mm
      tipo_atendimento_id: 0,
      orientacao: '',
      observacao: ''
    });
    setShowForm(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['pessoa_id', 'atendente_id', 'tipo_atendimento_id'].includes(name) ? Number(value) : value
    }));
  }

  function handleCheckboxChange(id: number) {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  function handleIncluir() {
    setEditingId(null);
    resetForm();
    setShowForm(true);
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
        <h2 className="text-lg font-semibold text-gray-700 capitalize dark:text-white">Atendimentos</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleIncluir}
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
              <label className="text-gray-700 dark:text-gray-200" htmlFor="pessoa_id">Pessoa</label>
              <select
                id="pessoa_id"
                name="pessoa_id"
                value={formData.pessoa_id}
                onChange={handleInputChange}
                required
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
              >
                <option value="">Selecione a pessoa</option>
                {pessoas.map(pessoa => (
                  <option key={pessoa.id} value={pessoa.id}>{pessoa.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-200" htmlFor="atendente_id">Atendente</label>
              <select
                id="atendente_id"
                name="atendente_id"
                value={formData.atendente_id}
                onChange={handleInputChange}
                required
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
              >
                <option value="">Selecione o atendente</option>
                {atendentes.map(atendente => (
                  <option key={atendente.id} value={atendente.id}>{atendente.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-200" htmlFor="data_atendimento">Data do Atendimento</label>
              <input
                id="data_atendimento"
                type="datetime-local"
                name="data_atendimento"
                value={formData.data_atendimento}
                onChange={handleInputChange}
                required
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-200" htmlFor="tipo_atendimento_id">Tipo de Atendimento</label>
              <select
                id="tipo_atendimento_id"
                name="tipo_atendimento_id"
                value={formData.tipo_atendimento_id}
                onChange={handleInputChange}
                required
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
              >
                <option value="">Selecione o tipo de atendimento</option>
                {tiposAtendimento.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>{tipo.descricao_atendimento}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-700 dark:text-gray-200" htmlFor="orientacao">Orientação</label>
              <textarea
                id="orientacao"
                name="orientacao"
                value={formData.orientacao || ''}
                onChange={handleInputChange}
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
              />
            </div>
            <div className="sm:col-span-2">
            <label className="text-gray-700 dark:text-gray-200" htmlFor="observacao">Observação</label>
              <textarea
                id="observacao"
                name="observacao"
                value={formData.observacao || ''}
                onChange={handleInputChange}
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
            <button
              type="button"
              onClick={handleCancel}
              className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Cancelar
            </button>
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
                <th scope="col" className="px-1 py-3">Pessoa</th>
                <th scope="col" className="px-1 py-3">Atendente</th>
                <th scope="col" className="px-1 py-3">Data do Atendimento</th>
                <th scope="col" className="px-1 py-3">Tipo de Atendimento</th>
                <th scope="col" className="px-1 py-3">Orientação</th>
                <th scope="col" className="px-1 py-3">Observação</th>
              </tr>
            </thead>
            <tbody>
              {atendimentos.map((atendimento) => (
                <tr key={atendimento.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-0 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(atendimento.id)}
                      onChange={() => handleCheckboxChange(atendimento.id)}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded"
                    />
                  </td>
                  <td className="px-1 py-4">{pessoas.find(p => p.id === atendimento.pessoa_id)?.nome}</td>
                  <td className="px-1 py-4">{atendentes.find(a => a.id === atendimento.atendente_id)?.nome}</td>
                  <td className="px-1 py-4">{formatDateToLocal(atendimento.data_atendimento)}</td>                  
                  <td className="px-1 py-4">{tiposAtendimento.find(t => t.id === atendimento.tipo_atendimento_id)?.descricao_atendimento}</td>
                  <td className="px-1 py-4">{atendimento.orientacao}</td>
                  <td className="px-1 py-4">{atendimento.observacao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}              