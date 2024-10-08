import { createClient } from '@/utils/supabase/server'
import TipoAtendimento from '@/components/TipoAtendimento'

export default async function CadastroTipoAtendimento() {
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
      <TipoAtendimento />
    </div>
  )
}