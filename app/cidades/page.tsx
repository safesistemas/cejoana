
import { createClient } from '@/utils/supabase/server'
import Cidades from '@/components/Cidades'

export default async function CadastroCidades() {
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
      <Cidades />
    </div>
  )
}