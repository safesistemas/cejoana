import Link from "next/link";

export default function Home() {
  return (
    <div className="row">
      <div className="col-12">
      <h1 className="header">Centro Espírita Joana D&apos;Arc</h1>
        <p>
          Rondonópolis-MT
        </p>
      </div>
      <div className="col-6 form-widget">
        <Link href="/login">Logar</Link>
      </div>
    </div>
  )
}
