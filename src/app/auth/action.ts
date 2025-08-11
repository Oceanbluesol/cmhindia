// app/auth/action.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)
  if (error) redirect('/error')

  // Ensure a profile exists for this user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user?.id) {
    const emailLocal = (user.email ?? '').split('@')[0] || 'user'

    // insert only if missing (so we don't overwrite admins)
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existing) {
      // role will default to 'user' per your schema
      await supabase.from('profiles').insert({
        id: user.id,
        display_name: emailLocal,
      })
    }
  }

  // Redirect by role
  let destination = '/dashboard'
  if (user?.id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') destination = '/admin'
  }

  revalidatePath('/', 'layout')
  redirect(destination)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)
  if (error) redirect('/error')

  // send them to login with verify notice
  revalidatePath('/', 'layout')
  redirect('/auth/verify')
}
