"use client"

import { useState ,Suspense} from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

function ResetPasswordPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!token) {
      setMessage("Invalid reset link")
      return
    }

    setLoading(true)

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setMessage("Password updated. Redirecting to login...")
      setTimeout(() => router.push("/login"), 2000)
    } else {
      setMessage(data.error || "Something went wrong")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-6 rounded-lg w-full max-w-sm space-y-4"
      >
        <h2 className="text-lg font-semibold">Reset Password</h2>

        <input
          type="password"
          placeholder="New password"
          className="w-full p-2 rounded bg-zinc-800"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 text-black py-2 rounded"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        {message && (
          <p className="text-sm text-zinc-400 text-center">{message}</p>
        )}
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 size={28} className="text-amber-400 animate-spin" />
      </div>
    }>
      <ResetPasswordPageInner />
    </Suspense>
  )
}