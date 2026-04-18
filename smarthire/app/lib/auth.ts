import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

// 🔁 retry helper (handles cold DB / transient failures)
async function getUserWithRetry(email: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (user) return user
    } catch (err) {
      console.error("DB ERROR (retry):", err)
    }

    // wait before retry
    await new Promise((res) => setTimeout(res, 500))
  }
  return null
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("MISSING_CREDENTIALS")
          }

          const email = credentials.email.toLowerCase()

          // 🔁 use retry instead of single call
          const user = await getUserWithRetry(email)

          if (!user) {
            throw new Error("USER_NOT_FOUND")
          }

          if (!user.password) {
            throw new Error("NO_PASSWORD_SET")
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isValid) {
            throw new Error("INVALID_PASSWORD")
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }

        } catch (err) {
          console.error("AUTH ERROR:", err)

          // ⚠️ Important:
          // return null ONLY for real auth failures
          return null
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          const existing = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!existing) {
            await prisma.user.create({
              data: {
                name: user.name ?? "Google User",
                email: user.email!,
                role: "seeker",
              },
            })
          }
        }

        return true
      } catch (err) {
        console.error("SIGNIN ERROR:", err)
        return false
      }
    },

    async jwt({ token }) {
      try {
        if (token.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { id: true, role: true },
          })

          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
          }
        }
      } catch (err) {
        console.error("JWT ERROR:", err)
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
  },
}