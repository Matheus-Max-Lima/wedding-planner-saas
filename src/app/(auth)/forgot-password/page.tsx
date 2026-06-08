'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Por favor, informe um email válido.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch {
      // Always show success to not reveal if email exists
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf8f5 0%, #fff0f2 50%, #fdf8f5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem' }}>💍</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, background: 'linear-gradient(135deg, #f43f5e, #d4af37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Até o Altar
            </span>
          </Link>
        </div>

        <div style={{ background: 'white', borderRadius: '1.5rem', padding: '2.5rem', boxShadow: '0 20px 60px rgba(244, 63, 94, 0.1)', border: '1px solid #fce7e7' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '0.75rem' }}>Email enviado!</h2>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Se o email <strong>{email}</strong> estiver cadastrado, você receberá as instruções para redefinir sua senha.
              </p>
              <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                Verifique também sua caixa de spam.
              </p>
              <Link href="/login" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #f43f5e, #fb7185)', color: 'white', padding: '0.75rem 2rem', borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 700 }}>
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '0.5rem', textAlign: 'center' }}>
                Recuperar senha
              </h1>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.75rem' }}>
                Digite seu email e enviaremos as instruções
              </p>

              {error && (
                <div style={{ background: 'rgba(244, 63, 94, 0.06)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                  <span style={{ color: '#f43f5e', fontSize: '0.875rem' }}>⚠️ {error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>📧</span>
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); if (error) setError('') }}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1.5px solid #fce7e7', borderRadius: '0.75rem', fontSize: '0.95rem', color: '#1a1a2e', outline: 'none', background: '#fdf8f5', boxSizing: 'border-box' }}
                      onFocus={e => (e.target.style.borderColor = '#f43f5e')}
                      onBlur={e => (e.target.style.borderColor = '#fce7e7')}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ background: loading ? '#fca5a5' : 'linear-gradient(135deg, #f43f5e, #fb7185)', color: 'white', padding: '0.875rem', borderRadius: '0.75rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 16px rgba(244, 63, 94, 0.3)', transition: 'all 0.2s' }}
                >
                  {loading ? 'Enviando...' : 'Enviar instruções 📧'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <Link href="/login" style={{ color: '#f43f5e', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>
                  ← Voltar ao login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
