import Link from "next/link";
import { createClient } from '@/utils/supabase/server';
import dynamic from 'next/dynamic';

const ThemeToggle = dynamic(() => import('@/components/ThemeToggle'), { ssr: false });

export default async function Home() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center py-4">
        <h1 className="text-3xl font-bold text-gray-700 capitalize dark:text-white">CE Joana D&apos;Arc</h1>
        <ThemeToggle />
      </div>

      {session ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-10">
          <Link href="/cadastro-pessoa" className="w-full">
            <button className="button dark:bg-gray-700 dark:text-white">Pessoas</button>
          </Link>
          <Link href="/cadastro-atendente" className="w-full">
            <button className="button dark:bg-gray-700 dark:text-white">Atendentes</button>
          </Link>
          <Link href="/tipo-atendimento" className="w-full">
            <button className="button dark:bg-gray-700 dark:text-white">Tipo Atendimento</button>
          </Link>
          <Link href="/atendimento" className="w-full">
            <button className="button dark:bg-gray-700 dark:text-white">Atendimentos</button>
          </Link>
          <Link href="/cadastro-usuario" className="w-full">
            <button className="button dark:bg-gray-700 dark:text-white">Usuários</button>
          </Link>
          <Link href="/account" className="w-full">
            <button className="button dark:bg-gray-700 dark:text-white">Minha Conta</button>
          </Link>
          <form action="/auth/signout" method="post">
              <button type="submit" className="px-5 py-2 font-semibold leading-6 text-white w-full block text-center bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                Sair
              </button>
            </form>

        </div>
      ) : (
        <div className="text-center py-10">
          <Link href="/login" className="inline-block">
            <button className="button dark:bg-gray-700 dark:text-white">Logar</button>
          </Link>
        </div>
      )}
    </div>
  );
}