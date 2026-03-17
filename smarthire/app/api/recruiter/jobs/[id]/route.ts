// app/api/recruiter/jobs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"

// PATCH /api/recruiter/jobs/:id  →  toggle isOpen or update fields
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "recruiter") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const job = await prisma.job.findUnique({ where: { id: params.id } })
  if (!job || job.recruiterId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await req.json()
  const updated = await prisma.job.update({
    where: { id: params.id },
    data: body,
  })

  return NextResponse.json(updated)
}

// DELETE /api/recruiter/jobs/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "recruiter") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const job = await prisma.job.findUnique({ where: { id: params.id } })
  if (!job || job.recruiterId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.job.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}