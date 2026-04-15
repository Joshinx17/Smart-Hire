// app/api/applications/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "../../lib/prisma"
import { authOptions } from "../../lib/auth"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { name, jobId, skills, resumeUrl } = body

    if (!name || !jobId || !resumeUrl)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })

    // Prevent duplicate applications
    const existing = await prisma.application.findFirst({
      where: { jobId, seekerId: session.user.id },
    })
    if (existing)
      return NextResponse.json({ error: "Already applied to this job" }, { status: 409 })

    const application = await prisma.application.create({
      data: {
        name,
        jobId,
        skills: skills ?? [],
        resumeUrl,
        seekerId: session.user.id,
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// GET — seeker's own applications
// In GET handler, support ?jobId= for seeker check
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get("jobId")

  try {
    // ✅ 1. Check if user applied to a job
    if (jobId) {
      const existing = await prisma.application.findFirst({
        where: { jobId, seekerId: session.user.id },
      })
      return NextResponse.json({ applied: !!existing })
    }

    // ✅ 2. RETURN SEEKER'S APPLICATIONS (THIS WAS MISSING)
    const applications = await prisma.application.findMany({
      where: { seekerId: session.user.id },
      select: {
        id: true,
        jobId: true,
        createdAt: true,
      },
    })

    return NextResponse.json(applications)

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}