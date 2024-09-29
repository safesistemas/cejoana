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
      
      <div className="col-12">
        {session ? (
          <Link href="/account">
            <button>Minha Conta</button>
          </Link>
        ) : (
          <Link href="/login">
            <button>Logar</button>
          </Link>
        )}
      </div>

      <nav>
        <ul>
          <li><Link href="/cadastro-pessoa">Pessoas</Link></li>
          <li><Link href="/cadastro-atendente">Atendentes</Link></li>
          <li><Link href="/tipo_atendimento">Tipo Atendimento</Link></li>
          <li><Link href="/atendimento">Atendimentos</Link></li>
        </ul>
      </nav>
    </div>
  )
}