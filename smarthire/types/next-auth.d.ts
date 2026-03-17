// types/next-auth.d.ts
// Extend the default NextAuth session types to include id and role

import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string // "seeker" | "recruiter"
    }
  }
}