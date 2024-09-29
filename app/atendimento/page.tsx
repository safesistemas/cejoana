import { createClient } from '@/utils/supabase/server'
import Atendimentos from '@/components/Atendimentos'

export default async function CadastroAtendimento() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  return (
    <div>
      <h1>Cadastro de Atendimentos</h1>
      <Atendimentos />
    </div>
  )
}