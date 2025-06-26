import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /admin, /doctor)
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = ["/", "/auth/login", "/auth/register"]

  // Check if the path is public
  const isPublicPath = publicPaths.includes(path)

  // Get the token from cookies or localStorage (check both)
  const token = request.cookies.get("medilinka_token")?.value || ""

  // If it's a public path and user has token, allow access (don't redirect)
  if (isPublicPath && token) {
    return NextResponse.next()
  }

  // If it's not a public path and no token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.nextUrl))
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
