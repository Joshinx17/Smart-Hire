// app/api/recruiter/jobs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // ✅ actually await it

  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "recruiter") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const job = await prisma.job.findUnique({ where: { id } })
  if (!job || job.recruiterId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await req.json()
  const { title, company, location, type, description, salary, skills, isOpen } = body
  const updated = await prisma.job.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(company !== undefined && { company }),
      ...(location !== undefined && { location }),
      ...(type !== undefined && { type }),
      ...(description !== undefined && { description }),
      ...(salary !== undefined && { salary }),
      ...(skills !== undefined && { skills }),
      ...(isOpen !== undefined && { isOpen }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // ✅ actually await it

  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "recruiter") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const job = await prisma.job.findUnique({ where: { id } })
  if (!job || job.recruiterId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.job.delete({ where: { id } })
  return NextResponse.json({ success: true })
}