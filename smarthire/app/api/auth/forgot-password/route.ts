import { prisma } from "@/app/lib/prisma"
import crypto from "crypto"
import { NextResponse } from "next/server"
import { sendResetEmail } from "@/app/lib/email"

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return NextResponse.json({ message: "If email exists, link sent" })
  }

  const token = crypto.randomBytes(32).toString("hex")
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry: new Date(Date.now() + 1000 * 60 * 15),
    },
  })

  console.log("Sending email to:", email)
  sendResetEmail(email, token).catch(console.error)

  return NextResponse.json({ message: "Reset link sent" })
}