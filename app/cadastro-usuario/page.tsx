import { createClient } from '@/utils/supabase/server'
import Usuarios from '@/components/Usuarios'

export default async function CadastroUsuario() {
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
      <Usuarios />
    </div>
  )
}