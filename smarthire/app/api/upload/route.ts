import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`

  const { error } = await supabase.storage
    .from("resumes")
    .upload(filename, buffer, { contentType: "application/pdf" })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ url: filename })
}