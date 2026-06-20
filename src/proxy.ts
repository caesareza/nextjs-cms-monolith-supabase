import { createServerClient } from '@supabase/ssr'
import { NextResponse, NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                },
            },
        }
    )

    // Secure verification method to read user login sessions safely from cookies
    const { data: { user } } = await supabase.auth.getUser()
    const pathname = request.nextUrl.pathname

    console.log('[Proxy Guard] Active Session Identity:', user?.email || 'Guest')
    console.log('[Proxy Guard] Request Route Pathname:', pathname)

    const isLoginPage = pathname === '/login'

    // 1. Core Shield: If user is not logged in and attempts to access ANY page except /login, force redirect
    if (!user && !isLoginPage) {
        console.log('→ Anonymous traffic intercepted. Forcing login redirect.')
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. Reverse Shield: If a logged-in user tries to visit /login, redirect them back to the workspace root
    if (user && isLoginPage) {
        console.log('→ Active session detected on login screen. Redirecting to home root.')
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}

export const config = {
    // This matcher automatically captures all application page routes while bypassing static media assets
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}