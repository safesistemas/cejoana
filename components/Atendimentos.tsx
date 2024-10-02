// @/components/Atendimentos.tsx

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { PlusCircle, Edit2, Trash2, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function normalizeString(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

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
  const [filteredAtendimentos, setFilteredAtendimentos] = useState<Atendimento[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [atendentes, setAtendentes] = useState<Atendente[]>([]);
  const [tiposAtendimento, setTiposAtendimento] = useState<TipoAtendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Omit<Atendimento, 'id'>>({
    pessoa_id: 0,
    atendente_id: 0,
    data_atendimento: '',
    tipo_atendimento_id: 0,
    orientacao: '',
    observacao: ''
  });
  const supabase = createClient();
  const listRef = useRef<HTMLDivElement>(null);

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
      setFilteredAtendimentos(data || []);
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

  useEffect(() => {
    const normalizedSearchTerm = normalizeString(searchTerm);
    const filtered = atendimentos.filter(atendimento =>
      normalizeString(pessoas.find(p => p.id === atendimento.pessoa_id)?.nome || '').includes(normalizedSearchTerm)
    );
    setFilteredAtendimentos(filtered);
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [searchTerm, atendimentos, pessoas]);

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
      setShowForm(false);
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

  function handleEdit(id?: number) {
    if (id) {
      setSelectedIds([id]);
    }
    if (selectedIds.length !== 1 && !id) {
      toast.error('Selecione exatamente um atendimento para editar.');
      return;
    }
    const atendimentoId = id || selectedIds[0];
    const atendimento = atendimentos.find(a => a.id === atendimentoId);
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
    setShowForm(false);
    setEditingId(null);
    toast(editingId ? 'Alterações canceladas' : 'Inclusão cancelada', {
      icon: '🔔',
      style: {
        borderRadius: '10px',
        background: '#3498db',
        color: '#fff',
      },
    });
  }

  function resetForm() {
    setFormData({
      pessoa_id: 0,
      atendente_id: 0,
      data_atendimento: new Date().toISOString().slice(0, 16),
      tipo_atendimento_id: 0,
      orientacao: '',
      observacao: ''
    });
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

  function handleSearchClick() {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchTerm('');
    }
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-10">
        <div className="max-w-4xl mx-auto p-2">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
            <div className="flex items-center justify-between w-full sm:w-auto mb-2 sm:mb-0">
              <Link href="/">
                <button className="px-4 py-2 h-10 text-sm text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  Voltar
                </button>
              </Link>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mx-auto pl-4 pr-4 text-center">Atendimentos</h2>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end space-x-2 space-y-2 sm:space-y-0">
              <button
                onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
                className="flex items-center justify-center p-2 h-10 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                title="Incluir"
              >
                <PlusCircle size={20} />
                <p className="ml-2">Incluir</p>
              </button>
              <button
                onClick={() => handleEdit()}
                className="flex items-center justify-center p-2 h-10 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                title="Editar"
              >
                <Edit2 size={20} />
                <p className="ml-2">Editar</p>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center justify-center p-2 h-10 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                title="Excluir"
              >
                <Trash2 size={20} />
                <p className="ml-2">Excluir</p>
              </button>
              <button
                onClick={handleSearchClick}
                className="flex items-center justify-center p-2 h-10 text-white bg-purple-500 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                title="Pesquisar"
              >
                <Search size={20} />
                <p className="ml-2 hidden md:block">Pesquisar</p>
              </button>
            </div>
          </div>
          {showSearch && (
            <div className="flex items-center space-x-2 mt-1 mb-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por nome da pessoa..."
                className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
          )}
        </div>
      </header>
      <main className={`flex-grow ${showSearch ? 'mt-32 sm:mt-16' : 'mt-20 sm:mt-5'} p-6 bg-white rounded-md shadow-md dark:bg-gray-800 overflow-y-auto transition-all duration-300`} ref={listRef}>
        <Toaster position="bottom-center" />

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
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-gray-500 rounded-md hover:bg-gray-700 focus:outline-none focus:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-600 ml-4"
              >
                {editingId ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p>Carregando...</p>
        ) : (
          !showForm && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="text-xs font-semibold tracking-wide text-left text-gray-800 uppercase bg-gray-400 dark:bg-gray-600 dark:text-gray-400">
                    <th className="px-4 py-3"></th>
                    <th className="px-4 py-3">Pessoa</th>
                    <th className="px-4 py-3">Atendente</th>
                    <th className="px-4 py-3">Data do Atendimento</th>
                    <th className="px-4 py-3">Tipo de Atendimento</th>
                    <th className="px-4 py-3">Orientação</th>
                    <th className="px-4 py-3">Observação</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
                  {filteredAtendimentos.map((atendimento, index) => (
                    <tr
                      key={atendimento.id}
                      className={`text-gray-700 dark:text-gray-400 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer`}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.tagName.toLowerCase() !== 'input' || target.getAttribute('type') !== 'checkbox') {
                          handleEdit(atendimento.id);
                        }
                      }}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(atendimento.id)}
                          onChange={() => handleCheckboxChange(atendimento.id)}
                        />
                      </td>
                      <td className="px-4 py-3">{pessoas.find(p => p.id === atendimento.pessoa_id)?.nome}</td>
                      <td className="px-4 py-3">{atendentes.find(a => a.id === atendimento.atendente_id)?.nome}</td>
                      <td className="px-4 py-3">{formatDateToLocal(atendimento.data_atendimento)}</td>
                      <td className="px-4 py-3">{tiposAtendimento.find(t => t.id === atendimento.tipo_atendimento_id)?.descricao_atendimento}</td>
                      <td className="px-4 py-3">{atendimento.orientacao}</td>
                      <td className="px-4 py-3">{atendimento.observacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </main>
    </div>
  );
}