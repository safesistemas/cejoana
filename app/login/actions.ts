// @/app/login/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword(data)

  if (signInError) {
    redirect('/error')
  }

  // Check if the user is active
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('ativo')
    .eq('id', signInData.user.id)
    .single()

  if (profileError || !profileData) {
    redirect('/error')
  }

  if (!profileData.ativo) {
    // User is not active
    await supabase.auth.signOut()
    redirect('/inactive')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}