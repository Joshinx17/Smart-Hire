"use client"

import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      setMessage(data.message || "If email exists, link sent")
    } catch (err) {
      setMessage("Something went wrong")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-6 rounded-lg w-full max-w-sm space-y-4"
      >
        <h2 className="text-lg font-semibold cursor-pointer">Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-2 rounded bg-zinc-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 text-black py-2 rounded cursor-pointer hover:bg-amber-600"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {message && (
          <p className="text-sm text-zinc-400 text-center">{message}</p>
        )}
      </form>
    </div>
  )
}