import Link from "next/link";
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="row">
      <h1 className="header">Centro Espírita Joana D&apos;Arc</h1>
      <div>
        <p>Rondonópolis-MT</p>
      </div>
      
      {session ? (
        <div className="col-12">
          <Link href="/account">
            <button className="menu-button">Minha Conta</button>
          </Link>
          <nav className="button-menu">
            <Link href="/cadastro-pessoa">
              <button className="menu-button">Pessoas</button>
            </Link>
            <Link href="/cadastro-atendente">
              <button className="menu-button">Atendentes</button>
            </Link>
            <Link href="/tipo-atendimento">
              <button className="menu-button">Tipo Atendimento</button>
            </Link>
            <Link href="/atendimento">
              <button className="menu-button">Atendimentos</button>
            </Link>
          </nav>
        </div>
      ) : (
        <div className="col-12">
          <Link href="/login">
            <button className="menu-button">Logar</button>
          </Link>
        </div>
      )}
    </div>
  )
}