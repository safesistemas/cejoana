// @/components/Pessoas.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { PlusCircle, Edit2, Trash2, Search, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Pessoa {
  id: number;
  nome: string;
  telefone: string | null;
  idade: number | null;
  sexo: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade_id: number | null;
}

interface Cidade {
  id: number;
  nome: string;
}

export default function Pessoas() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [filteredPessoas, setFilteredPessoas] = useState<Pessoa[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Omit<Pessoa, 'id'>>({
    nome: '',
    telefone: '',
    idade: null,
    sexo: '',
    endereco: '',
    bairro: '',
    cidade_id: null
  });
  const supabase = createClient();

  const fetchPessoas = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pessoas')
        .select('*')
        .order('nome');

      if (error) throw error;
      setPessoas(data || []);
      setFilteredPessoas(data || []);
    } catch (error) {
      console.error('Erro ao buscar pessoas:', error);
      toast.error('Erro ao carregar pessoas!');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchCidades = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('cidades')
        .select('*')
        .order('nome');

      if (error) throw error;
      setCidades(data || []);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      toast.error('Erro ao carregar cidades!');
    }
  }, [supabase]);

  useEffect(() => {
    fetchPessoas();
    fetchCidades();
  }, [fetchPessoas, fetchCidades]);

  useEffect(() => {
    const filtered = pessoas.filter(pessoa =>
      pessoa.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPessoas(filtered);
  }, [searchTerm, pessoas]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      const dataToSubmit = {
        ...formData,
        nome: formData.nome.toUpperCase()
      };
      if (editingId) {
        const { error } = await supabase
          .from('pessoas')
          .update(dataToSubmit)
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Pessoa atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('pessoas')
          .insert(dataToSubmit);
        if (error) throw error;
        toast.success('Pessoa adicionada com sucesso!');
      }
      resetForm();
      fetchPessoas();
    } catch (error) {
      console.error('Erro ao salvar pessoa:', error);
      toast.error('Erro ao salvar pessoa!');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (selectedIds.length === 0) {
      toast.error('Selecione pelo menos uma pessoa para excluir.');
      return;
    }
    if (confirm(`Tem certeza que deseja excluir ${selectedIds.length} pessoa(s)?`)) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('pessoas')
          .delete()
          .in('id', selectedIds);
        if (error) throw error;
        toast.success('Pessoa(s) excluída(s) com sucesso!');
        setSelectedIds([]);
        fetchPessoas();
      } catch (error) {
        console.error('Erro ao excluir pessoa(s):', error);
        toast.error('Erro ao excluir pessoa(s)!');
      } finally {
        setLoading(false);
      }
    }
  }

  function handleEdit() {
    if (selectedIds.length !== 1) {
      toast.error('Selecione exatamente uma pessoa para editar.');
      return;
    }
    const pessoa = pessoas.find(p => p.id === selectedIds[0]);
    if (pessoa) {
      setEditingId(pessoa.id);
      setFormData({
        nome: pessoa.nome,
        telefone: pessoa.telefone || '',
        idade: pessoa.idade,
        sexo: pessoa.sexo || '',
        endereco: pessoa.endereco || '',
        bairro: pessoa.bairro || '',
        cidade_id: pessoa.cidade_id
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
      nome: '',
      telefone: '',
      idade: null,
      sexo: '',
      endereco: '',
      bairro: '',
      cidade_id: null
    });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'nome'
        ? value.toUpperCase()
        : name === 'idade' || name === 'cidade_id'
          ? (value ? Number(value) : null)
          : value
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
  }

  function handleSearchConfirm() {
    toast.success('Pesquisa realizada!');
  }

  function handleSearchClear() {
    setSearchTerm('');
    setShowSearch(false);
    setFilteredPessoas(pessoas);
    toast.success('Pesquisa limpa!');
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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mx-auto pl-10 pr-10 text-center">Pessoas</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
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
          <button
            onClick={handleSearchClick}
            className="flex items-center justify-end p-2 text-white bg-purple-500 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
            title="Pesquisar"
          >
            <Search size={24} />
            <p className="ml-2 hidden md:block">Pesquisar</p>
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome..."
            className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          {/* <button
            onClick={handleSearchConfirm}
            className="p-2 text-white bg-purple-500 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <Search size={20} />
          </button> */}
          <button
            onClick={handleSearchClear}
            className="p-2 text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
            <div>
              <label className="text-gray-700 dark:text-gray-200" htmlFor="nome">Nome</label>
              <input
                id="nome"
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-200" htmlFor="telefone">Telefone</label>
              <input
                id="telefone"
                type="tel"
                name="telefone"
                value={formData.telefone || ''}
                onChange={handleInputChange}
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-200" htmlFor="idade">Idade</label>
              <input
                id="idade"
                type="number"
                name="idade"
                value={formData.idade || ''}
                onChange={handleInputChange}
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-200" htmlFor="sexo">Sexo</label>
              <select
                id="sexo"
                name="sexo"
                value={formData.sexo || ''}
                onChange={handleInputChange}
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
              >
                <option value="">Selecione o sexo</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-200" htmlFor="endereco">Endereço</label>
              <input
                id="endereco"
                type="text"
                name="endereco"
                value={formData.endereco || ''}
                onChange={handleInputChange}
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-200" htmlFor="bairro">Bairro</label>
              <input
                id="bairro"
                type="text"
                name="bairro"
                value={formData.bairro || ''}
                onChange={handleInputChange}
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-200" htmlFor="cidade_id">Cidade</label>
              <select
                id="cidade_id"
                name="cidade_id"
                value={formData.cidade_id || ''}
                onChange={handleInputChange}
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
              >
                <option value="">Selecione a cidade</option>
                {cidades.map(cidade => (
                  <option key={cidade.id} value={cidade.id}>{cidade.nome}</option>
                ))}
              </select>
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
              {editingId ? 'Cancelar Alterações' : 'Cancelar Inclusão'}
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
                <th scope="col" className="px-1 py-3">Nome</th>
                <th scope="col" className="px-1 py-3">Telefone</th>
                <th scope="col" className="px-1 py-3">Idade</th>
                <th scope="col" className="px-1 py-3">Sexo</th>
                <th scope="col" className="px-1 py-3">Endereço</th>
                <th scope="col" className="px-1 py-3">Bairro</th>
                <th scope="col" className="px-1 py-3">Cidade</th>
              </tr>
            </thead>
            <tbody>
              {filteredPessoas.map((pessoa) => (
                <tr key={pessoa.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-0 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(pessoa.id)}
                      onChange={() => handleCheckboxChange(pessoa.id)}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded"
                    />
                  </td>
                  <td className="px-1 py-4">{pessoa.nome.toUpperCase()}</td>
                  <td className="px-1 py-4">{pessoa.telefone}</td>
                  <td className="px-1 py-4">{pessoa.idade}</td>
                  <td className="px-1 py-4">{pessoa.sexo}</td>
                  <td className="px-1 py-4">{pessoa.endereco}</td>
                  <td className="px-1 py-4">{pessoa.bairro}</td>
                  <td className="px-1 py-4">{cidades.find(c => c.id === pessoa.cidade_id)?.nome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}