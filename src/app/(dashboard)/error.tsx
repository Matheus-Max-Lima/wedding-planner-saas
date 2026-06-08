'use client'
export default function Error({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
      <span style={{ fontSize: '3rem' }}>😕</span>
      <h2 style={{ color: '#1a1a2e', fontWeight: 700 }}>Algo deu errado</h2>
      <p style={{ color: '#6b7280' }}>{error.message}</p>
      <button onClick={reset} style={{ background: 'linear-gradient(135deg, #f43f5e, #fb7185)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
        Tentar novamente
      </button>
    </div>
  )
}
