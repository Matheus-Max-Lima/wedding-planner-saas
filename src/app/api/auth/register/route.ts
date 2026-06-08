import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, partnerName, weddingDate } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    if (typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nome deve ter pelo menos 2 caracteres' }, { status: 400 })
    }

    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter no mínimo 6 caracteres' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (existing) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        wedding: {
          create: {
            brideName: name.trim(),
            groomName: partnerName ? partnerName.trim() : 'A definir',
            weddingDate: weddingDate ? new Date(weddingDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            totalBudget: 0,
          },
        },
      },
    })

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'Até o Altar <noreply@ateoaltar.com.br>',
          to: user.email!,
          subject: 'Bem-vinda ao Até o Altar! 💍',
          html: `
            <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
              <div style="text-align: center; margin-bottom: 2rem;">
                <span style="font-size: 2.5rem;">💍</span>
                <h1 style="font-size: 1.5rem; font-weight: 800; background: linear-gradient(135deg, #f43f5e, #d4af37); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0.5rem 0 0;">
                  Até o Altar
                </h1>
              </div>
              <h2 style="color: #1a1a2e; font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">
                Bem-vinda, ${user.name}! 🎉
              </h2>
              <p style="color: #6b7280; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem;">
                Sua conta foi criada com sucesso. Estamos muito felizes em fazer parte do planejamento do seu dia especial!
              </p>
              <div style="text-align: center; margin: 2rem 0;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #f43f5e, #fb7185); color: white; padding: 0.875rem 2rem; border-radius: 0.75rem; text-decoration: none; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 16px rgba(244, 63, 94, 0.3);">
                  Começar a planejar
                </a>
              </div>
              <p style="color: #9ca3af; font-size: 0.8rem; text-align: center; margin-top: 1.5rem;">
                Com amor, equipe Até o Altar 💕
              </p>
            </div>
          `,
        })
      } catch (emailErr) {
        console.error('[register] Error sending welcome email:', emailErr)
      }
    }

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    console.error('[register] Error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
