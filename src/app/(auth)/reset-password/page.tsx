'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Token inválido. Solicite um novo link de redefinição.')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao redefinir senha. Tente novamente.')
        return
      }

      setSuccess(true)
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(false)
    }
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
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '0.75rem' }}>Senha redefinida!</h2>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Sua senha foi atualizada com sucesso. Agora você pode fazer login com sua nova senha.
              </p>
              <Link href="/login" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #f43f5e, #fb7185)', color: 'white', padding: '0.75rem 2rem', borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 700 }}>
                Ir para o login
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '0.5rem', textAlign: 'center' }}>
                Nova senha
              </h1>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.75rem' }}>
                Escolha uma nova senha para sua conta
              </p>

              {!token && (
                <div style={{ background: 'rgba(244, 63, 94, 0.06)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                  <span style={{ color: '#f43f5e', fontSize: '0.875rem' }}>⚠️ Link inválido. <Link href="/forgot-password" style={{ color: '#f43f5e' }}>Solicite um novo link</Link>.</span>
                </div>
              )}

              {error && (
                <div style={{ background: 'rgba(244, 63, 94, 0.06)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                  <span style={{ color: '#f43f5e', fontSize: '0.875rem' }}>⚠️ {error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Nova senha
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>🔒</span>
                    <input
                      type="password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); if (error) setError('') }}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1.5px solid #fce7e7', borderRadius: '0.75rem', fontSize: '0.95rem', color: '#1a1a2e', outline: 'none', background: '#fdf8f5', boxSizing: 'border-box' }}
                      onFocus={e => (e.target.style.borderColor = '#f43f5e')}
                      onBlur={e => (e.target.style.borderColor = '#fce7e7')}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Confirmar nova senha
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>🔒</span>
                    <input
                      type="password"
                      value={confirm}
                      onChange={e => { setConfirm(e.target.value); if (error) setError('') }}
                      placeholder="Repita a nova senha"
                      autoComplete="new-password"
                      style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1.5px solid #fce7e7', borderRadius: '0.75rem', fontSize: '0.95rem', color: '#1a1a2e', outline: 'none', background: '#fdf8f5', boxSizing: 'border-box' }}
                      onFocus={e => (e.target.style.borderColor = '#f43f5e')}
                      onBlur={e => (e.target.style.borderColor = '#fce7e7')}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  style={{ background: (loading || !token) ? '#fca5a5' : 'linear-gradient(135deg, #f43f5e, #fb7185)', color: 'white', padding: '0.875rem', borderRadius: '0.75rem', border: 'none', cursor: (loading || !token) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 16px rgba(244, 63, 94, 0.3)', transition: 'all 0.2s' }}
                >
                  {loading ? 'Salvando...' : 'Salvar nova senha 🔐'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fdf8f5 0%, #fff0f2 50%, #fdf8f5 100%)' }}>
        <span style={{ fontSize: '2rem' }}>💍</span>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
