// middleware.ts — place at project root, next to next.config.ts
import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = req.nextUrl

  // ── DEBUG: log every middleware call so you can see what's happening ────
  console.log("MIDDLEWARE →", { pathname, role: token?.role, hasToken: !!token })

  // ── Not logged in → redirect to login ──────────────────────────────────
  if (!token) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = token.role as string | undefined

  // ── /dashboard → redirect to role-specific dashboard ───────────────────
  if (pathname === "/dashboard") {
    const dest =
      role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/seeker"
    console.log("MIDDLEWARE → redirecting /dashboard to", dest)
    return NextResponse.redirect(new URL(dest, req.url))
  }

  // ── Seeker trying to access recruiter dashboard ─────────────────────────
  if (pathname.startsWith("/dashboard/recruiter") && role !== "recruiter") {
    console.log("MIDDLEWARE → seeker blocked from recruiter, redirecting to /dashboard/seeker")
    return NextResponse.redirect(new URL("/dashboard/seeker", req.url))
  }

  // ── Recruiter trying to access seeker dashboard ─────────────────────────
  if (pathname.startsWith("/dashboard/seeker") && role !== "seeker") {
    console.log("MIDDLEWARE → recruiter blocked from seeker, redirecting to /dashboard/recruiter")
    return NextResponse.redirect(new URL("/dashboard/recruiter", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
}