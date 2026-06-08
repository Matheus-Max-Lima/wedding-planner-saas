import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      // Return 200 to not reveal info
      return NextResponse.json({ success: true })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (user) {
      const token = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      })

      if (process.env.RESEND_API_KEY) {
        try {
          const { Resend } = await import('resend')
          const resend = new Resend(process.env.RESEND_API_KEY)
          const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

          await resend.emails.send({
            from: 'Até o Altar <noreply@ateoaltar.com.br>',
            to: user.email!,
            subject: 'Redefinição de senha — Até o Altar',
            html: `
              <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
                <div style="text-align: center; margin-bottom: 2rem;">
                  <span style="font-size: 2.5rem;">💍</span>
                  <h1 style="font-size: 1.5rem; font-weight: 800; background: linear-gradient(135deg, #f43f5e, #d4af37); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0.5rem 0 0;">
                    Até o Altar
                  </h1>
                </div>
                <h2 style="color: #1a1a2e; font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">Redefinir sua senha</h2>
                <p style="color: #6b7280; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem;">
                  Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.
                </p>
                <div style="text-align: center; margin: 2rem 0;">
                  <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #f43f5e, #fb7185); color: white; padding: 0.875rem 2rem; border-radius: 0.75rem; text-decoration: none; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 16px rgba(244, 63, 94, 0.3);">
                    Redefinir minha senha
                  </a>
                </div>
                <p style="color: #9ca3af; font-size: 0.8rem; text-align: center; margin-top: 1.5rem;">
                  Este link expira em 1 hora. Se você não solicitou a redefinição, ignore este email.
                </p>
                <hr style="border: none; border-top: 1px solid #fce7e7; margin: 1.5rem 0;" />
                <p style="color: #d1d5db; font-size: 0.75rem; text-align: center;">
                  Ou copie e cole este link no navegador:<br/>
                  <span style="color: #f43f5e;">${resetUrl}</span>
                </p>
              </div>
            `,
          })
        } catch (emailErr) {
          console.error('[forgot-password] Error sending email:', emailErr)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[forgot-password] Error:', error)
    return NextResponse.json({ success: true })
  }
}
