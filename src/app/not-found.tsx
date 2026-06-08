import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '1.25rem',
        background: '#fdf8f5',
        padding: '2rem',
        fontFamily: 'inherit',
      }}
    >
      <span style={{ fontSize: '4rem' }}>💍</span>
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
          textAlign: 'center',
        }}
      >
        404 — Página não encontrada
      </h1>
      <p style={{ color: '#6b7280', margin: 0, textAlign: 'center', maxWidth: 360 }}>
        Parece que esta página se perdeu no caminho até o altar. Vamos te levar de volta para onde importa.
      </p>
      <Link
        href="/dashboard"
        style={{
          background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
          color: 'white',
          padding: '0.75rem 1.75rem',
          borderRadius: '0.75rem',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '1rem',
          marginTop: '0.5rem',
        }}
      >
        Voltar ao Dashboard
      </Link>
    </div>
  );
}
