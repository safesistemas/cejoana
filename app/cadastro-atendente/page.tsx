import { createClient } from '@/utils/supabase/server'
import Atendentes from '@/components/Atendentes'

export default async function CadastroAtendente() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // Redirecionar para a página de login se não estiver autenticado
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  return (
    <div>
      <h1>Cadastro de Atendentes</h1>
      <Atendentes />
    </div>
  )
}