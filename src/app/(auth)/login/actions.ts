'use server'

import { createClient } from '@/utils/supabase/server' // You'll need to create this helper
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        redirect('/login?error=Could not authenticate user')
    }

    redirect('/')
}

export async function logout() {
    const supabase = await createClient()

    // 1. Terminate the user session and clear auth cookies on the server
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Logout error:', error.message)
        // You can redirect to an error page or handle it as needed
    }

    // 2. Redirect back to the login page securely
    redirect('/login')
}