import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  const { path } = await params

  const { data, error } = await supabase.storage
    .from("resumes")
    .createSignedUrl(path, 60)

  if (error || !data?.signedUrl)
    return NextResponse.json({ error: "Could not generate URL" }, { status: 500 })

  return NextResponse.redirect(data.signedUrl)
}