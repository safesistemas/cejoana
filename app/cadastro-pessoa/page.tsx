import { createClient } from '@/utils/supabase/server'
import Pessoas from '@/components/Pessoas'

export default async function CadastroPessoa() {
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
      <Pessoas />
    </div>
  )
}