import Link from "next/link";
import { createClient } from '@/utils/supabase/server';
import dynamic from 'next/dynamic';

const ThemeToggle = dynamic(() => import('@/components/ThemeToggle'), { ssr: false });

export default async function Home() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <div className="container mx-auto px-4 h-screen flex flex-col justify-between">
      <div className="relative py-4">
        <h1 className="text-3xl font-bold text-gray-700 capitalize dark:text-white text-center">
          CE Joana D&apos;Arc
        </h1>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <ThemeToggle />
        </div>
      </div>


      {session ? (
        <div className="flex flex-col justify-center items-center flex-grow">
          <div className="grid grid-cols-1 gap-4 w-64 text-center">
            <Link href="/cadastro-pessoa">
              <button className="button dark:bg-gray-700 dark:text-white w-full">Pessoas</button>
            </Link>
            <Link href="/cadastro-atendente">
              <button className="button dark:bg-gray-700 dark:text-white w-full">Atendentes</button>
            </Link>
            <Link href="/tipo-atendimento">
              <button className="button dark:bg-gray-700 dark:text-white w-full">Tipo Atendimento</button>
            </Link>
            <Link href="/atendimento">
              <button className="button dark:bg-gray-700 dark:text-white w-full">Atendimentos</button>
            </Link>
            <Link href="/cadastro-usuario">
              <button className="button dark:bg-gray-700 dark:text-white w-full">Usuários</button>
            </Link>
            <Link href="/account">
              <button className="button dark:bg-gray-700 dark:text-white w-full">Minha Conta</button>
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="px-5 py-2 font-semibold leading-6 text-white w-full block text-center bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center flex-grow">
          <Link href="/login">
            <button className="button dark:bg-gray-700 dark:text-white">Logar</button>
          </Link>
        </div>
      )}
    </div>
  );

}