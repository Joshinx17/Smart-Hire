// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("resume") as File

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })
  if (file.type !== "application/pdf")
    return NextResponse.json({ error: "Only PDF allowed" }, { status: 400 })
  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json({ error: "Max 5MB" }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = path.join(process.cwd(), "public", "resumes")
  await mkdir(uploadDir, { recursive: true })

  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`
  await writeFile(path.join(uploadDir, filename), buffer)

  return NextResponse.json({ url: `/resumes/${filename}` })
}