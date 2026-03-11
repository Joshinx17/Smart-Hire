import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/app/lib/prisma"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existing = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!existing) {
            await prisma.user.create({
              data: {
                name: user.name ?? "Google User",
                email: user.email!,
                role: "seeker", // default role for Google signups
              },
            })
          }
        } catch (error) {
          console.error("Error saving Google user to DB:", error)
          return false
        }
      }
      return true
    },

    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, role: true, name: true },
        })
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.role = dbUser.role
        }
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
  },
})

export { handler as GET, handler as POST }