'use client';

import { login, signup } from './actions'
import Link from 'next/link'
import { useTransition, useState, useEffect, useRef } from 'react'

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const emailInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus()
    }
  }, [])

  const handleAction = (action: typeof login | typeof signup) => {
    setIsLoading(true)
    startTransition(() => {
      action(new FormData(document.querySelector('form') as HTMLFormElement))
        .finally(() => setIsLoading(false))
    })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleAction(login)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <div className="p-4">
        <Link href="/">
          <button type="button" className="px-4 py-2 text-sm leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600">
            Voltar
          </button>
        </Link>
      </div>
      
      <section className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md dark:bg-gray-800 p-6">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-white text-center mb-6">
            <span className="block">Entre com usuário ou,</span>
            <span className="block">crie uma nova conta</span>
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="email">Email</label>
                <input
                  ref={emailInputRef}
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                            focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="password">Senha</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                            focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Carregando...' : 'Entrar'}
              </button>
              <button
                type="button"
                onClick={() => handleAction(signup)}
                disabled={isLoading}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Carregando...' : 'Criar Conta'}
              </button>
            </div>
          </form>
        </div>
      </section>
      
      {isPending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md">
            <p>Aguarde...</p>
          </div>
        </div>
      )}
    </div>
  )
}