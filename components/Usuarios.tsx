// @/components/Usuarios.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Edit2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Usuario {
  id: string;
  username: string | null;
  ativo: boolean;
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    username: string;
    ativo: boolean;
  }>({
    username: '',
    ativo: false
  });
  const supabase = createClient();

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, ativo')
        .order('username');

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários!');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ username: formData.username, ativo: formData.ativo })
        .eq('id', editingId);
      if (error) throw error;
      toast.success('Usuário atualizado com sucesso!');
      resetForm();
      fetchUsuarios();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast.error('Erro ao salvar usuário!');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(usuario: Usuario) {
    setEditingId(usuario.id);
    setFormData({
      username: usuario.username || '',
      ativo: usuario.ativo
    });
  }

  function handleCancel() {
    resetForm();
  }

  function resetForm() {
    setEditingId(null);
    setFormData({
      username: '',
      ativo: false
    });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  return (
    <section className="max-w-4xl p-6 mx-auto bg-white rounded-md shadow-md dark:bg-gray-800">
      <Toaster position="top-right" />
      <div className="flex justify-center items-center relative mb-6">
        <Link href="/">
          <button className="absolute top-0 left-0 px-4 py-2 text-sm text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
            Voltar
          </button>
        </Link>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mx-auto pl-10 pr-10 text-center">Usuários</h2>
      </div>

      {editingId && (
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
            <div>
              <label className="text-gray-700 dark:text-gray-200" htmlFor="username">Nome do Usuário</label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring"
              />
            </div>
            <div className="flex items-center">
              <input
                id="ativo"
                type="checkbox"
                name="ativo"
                checked={formData.ativo}
                onChange={handleInputChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <label htmlFor="ativo" className="ml-2 text-gray-700 dark:text-gray-200">Ativo</label>
            </div>
          </div>
          <div className="flex justify-end mt-6 space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Salvar Alterações
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
                <th scope="col" className="px-1 py-3">Nome do Usuário</th>
                <th scope="col" className="px-1 py-3">Ativo</th>
                <th scope="col" className="px-1 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-1 py-4">{usuario.username}</td>
                  <td className="px-1 py-4">{usuario.ativo ? 'Sim' : 'Não'}</td>
                  <td className="px-1 py-4">
                    <button
                      onClick={() => handleEdit(usuario)}
                      className="p-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                      title="Editar"
                    >
                      <Edit2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}