// app/api/recruiter/jobs/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"

// GET /api/recruiter/jobs  →  jobs posted by the logged-in recruiter
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "recruiter") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const jobs = await prisma.job.findMany({
    where: { recruiterId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(jobs)
}

// POST /api/recruiter/jobs  →  create a new job posting
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "recruiter") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { title, company, location, type, description, salary, skills } = body

  if (!title || !company || !location || !type || !description) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    )
  }

  const job = await prisma.job.create({
    data: {
      title,
      company,
      location,
      type,
      description,
      salary: salary ?? null,
      skills: skills ?? [],
      recruiterId: session.user.id,
    },
  })

  return NextResponse.json(job, { status: 201 })
}