// utils/supabase/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // NOTE: Using createServerClient here is correct for middleware context
  // as it handles the specific request/response cookie interaction.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Method to get a cookie
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        // Method to set a cookie
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is updated, update the request for the current path
          request.cookies.set({ name, value, ...options })
          // Also update the response to send the updated cookie to the client
          supabaseResponse = NextResponse.next({ request })
          supabaseResponse.cookies.set({ name, value, ...options })
        },
        // Method to delete a cookie
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the request for the current path
          request.cookies.set({ name, value: '', ...options })
          // Also update the response to send the deleted cookie to the client
          supabaseResponse = NextResponse.next({ request })
          supabaseResponse.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const { data: { user } } = await supabase.auth.getUser();

  // --- Optional: Route Protection ---
  // Uncomment and adjust this logic if you want middleware-based route protection
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') && // Allow access to login page
    !request.nextUrl.pathname.startsWith('/auth') &&// Allow access to auth callback routes
    !request.nextUrl.pathname.startsWith('/dashboard') &&  // Allow access to dashboard page DEVELOPMENT ONLY
    !request.nextUrl.pathname.startsWith('/')
    // Add any other public routes here (e.g., pricing, about)
    // !request.nextUrl.pathname.startsWith('/pricing')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  // --- End Optional: Route Protection ---


  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you want to modify the response, make sure to copy over the cookies from supabaseResponse
  return supabaseResponse
}