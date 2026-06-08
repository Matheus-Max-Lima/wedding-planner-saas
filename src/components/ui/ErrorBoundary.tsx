'use client';

import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            gap: '1rem',
            padding: '2rem',
          }}
        >
          <span style={{ fontSize: '3rem' }}>😕</span>
          <h2 style={{ color: '#1a1a2e', fontWeight: 700, margin: 0 }}>Algo deu errado</h2>
          {this.state.error && (
            <p style={{ color: '#6b7280', margin: 0, textAlign: 'center' }}>
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
