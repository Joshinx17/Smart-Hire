// app/api/applications/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "../../lib/prisma"
import { authOptions } from "../../lib/auth"

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getMatchScore(resumePath: string, jobDescription: string): Promise<number | null> {
  try {
    const { data, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(resumePath, 60)

    if (error || !data?.signedUrl) return null

    const fileRes = await fetch(data.signedUrl)
    if (!fileRes.ok) return null

    const buffer = await fileRes.arrayBuffer()
    const blob = new Blob([buffer], { type: "application/pdf" })

    const form = new FormData()
    form.append("resume", blob, "resume.pdf")
    form.append("job_description", jobDescription)

    const scoreRes = await fetch("http://localhost:8000/score", {
      method: "POST",
      body: form,
    })

    if (!scoreRes.ok) return null

    const data2 = await scoreRes.json()
    return data2.score ?? null
  } catch (err) {
    console.error("Scoring service error:", err)
    return null
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { name, jobId, skills, resumeUrl } = body

    if (!name || !jobId || !resumeUrl)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })

    const existing = await prisma.application.findFirst({
      where: { jobId, seekerId: session.user.id },
    })
    if (existing)
      return NextResponse.json({ error: "Already applied to this job" }, { status: 409 })

    // Fetch job description for scoring
    const job = await prisma.job.findUnique({
  where: { id: jobId },
  select: { description: true, skills: true },
})

// Enrich JD with skills so scorer sees the full picture
const enrichedJD = job?.description
  ? `${job.description}\n\nRequired Skills: ${(job.skills ?? []).join(", ")}`
  : null

const matchScore = enrichedJD
  ? await getMatchScore(resumeUrl, enrichedJD)
  : null


    const application = await prisma.application.create({
      data: {
        name,
        jobId,
        skills: skills ?? [],
        resumeUrl,
        seekerId: session.user.id,
        matchScore,
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get("jobId")

  try {
    if (jobId) {
      const existing = await prisma.application.findFirst({
        where: { jobId, seekerId: session.user.id },
      })
      return NextResponse.json({ applied: !!existing })
    }

    const applications = await prisma.application.findMany({
      where: { seekerId: session.user.id },
      select: {
        id: true,
        jobId: true,
        matchScore: true,  // ← include score for seeker dashboard
        createdAt: true,
      },
    })

    return NextResponse.json(applications)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}