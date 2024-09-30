import Link from "next/link";
import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold py-2 text-center text-gray-700 capitalize dark:text-white">Centro Espírita Joana D&apos;Arc</h1>

      {session ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-10">
          <Link href="/cadastro-pessoa" className="w-full">
            <button className="button">Pessoas</button>
          </Link>
          <Link href="/cadastro-atendente" className="w-full">
            <button className="button">Atendentes</button>
          </Link>
          <Link href="/tipo-atendimento" className="w-full">
            <button className="button">Tipo Atendimento</button>
          </Link>
          <Link href="/atendimento" className="w-full">
            <button className="button">Atendimentos</button>
          </Link>
          <Link href="/account" className="w-full">
            <button className="button">Minha Conta</button>
          </Link>
        </div>
      ) : (
        <div className="text-center py-10">
          <Link href="/login" className="inline-block">
            <button className="button">Logar</button>
          </Link>
        </div>
      )}
    </div>
  );
}