import Link from "next/link";

export default function Home() {
  return (
    <div className="row">
      <h1 className="header">Centro Espírita Joana D&apos;Arc</h1>
      <div>
        <p>Rondonópolis-MT</p>
      </div>
      
      <div className="col-12">
        <form action="/login" method="post">
          <button type="submit">Logar</button>
        </form>
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
