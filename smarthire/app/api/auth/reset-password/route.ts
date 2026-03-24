import { prisma } from "@/app/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { token, password } = await req.json()

  if (!token || !password) {
    return NextResponse.json(
      { error: "Token and password required" },
      { status: 400 }
    )
  }

  // 🔥 hash incoming token (VERY IMPORTANT)
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex")

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  })

  if (!user) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  })

  return NextResponse.json({ message: "Password updated successfully" })
}