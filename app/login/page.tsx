import { login, signup } from './actions'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <form>
      <div className="col-12">
        <Link href="/">
          <button className="button">Voltar</button>
        </Link>
      </div>      
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Senha:</label>
      <input id="password" name="password" type="password" required />
      <button formAction={login}>Logar</button>
      <button formAction={signup}>Criar Conta</button>
    </form>
  )
}