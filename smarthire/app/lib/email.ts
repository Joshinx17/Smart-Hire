import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family:sans-serif;">
        <h2>Password Reset</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" 
           style="display:inline-block;padding:10px 16px;background:#f59e0b;color:black;text-decoration:none;border-radius:6px;">
           Reset Password
        </a>
        <p>This link expires in 15 minutes.</p>
      </div>
    `,
  })
}