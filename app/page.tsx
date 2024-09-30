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
        <h1 className="text-3xl font-bold text-gray-700 capitalize dark:text-white">Centro Espírita Joana D&apos;Arc</h1>
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
          <Link href="/account" className="w-full">
            <button className="button dark:bg-gray-700 dark:text-white">Minha Conta</button>
          </Link>
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