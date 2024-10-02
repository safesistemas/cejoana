// @/app/inactive/page.tsx

import Link from 'next/link'

export default function InactivePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold text-red-600">
          Conta Inativa
        </h1>
        <p className="mt-3 text-2xl text-gray-900 dark:text-white">
          Sua conta está atualmente inativa. Por favor, entre em contato com o administrador para ativar sua conta.
        </p>
        <Link href="/login" className="mt-6 px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          Voltar para o Login
        </Link>
      </main>
    </div>
  )
}