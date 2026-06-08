import React from 'react';
import Skeleton from './Skeleton';

export default function DashboardSkeleton() {
  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Skeleton width={240} height={32} borderRadius="0.5rem" />
        <div style={{ marginTop: '0.5rem' }}>
          <Skeleton width={180} height={20} borderRadius="0.375rem" />
        </div>
      </div>

      {/* Countdown card */}
      <div
        style={{
          background: '#fff',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <Skeleton width={160} height={24} borderRadius="0.375rem" />
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ textAlign: 'center', flex: 1 }}>
              <Skeleton height={56} borderRadius="0.75rem" />
              <div style={{ marginTop: '0.5rem' }}>
                <Skeleton width="60%" height={14} borderRadius="0.25rem" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              borderRadius: '1rem',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <Skeleton width={40} height={40} borderRadius="0.75rem" />
            <div style={{ marginTop: '0.75rem' }}>
              <Skeleton width="70%" height={22} borderRadius="0.375rem" />
            </div>
            <div style={{ marginTop: '0.4rem' }}>
              <Skeleton width="50%" height={16} borderRadius="0.25rem" />
            </div>
          </div>
        ))}
      </div>

      {/* Activity feed */}
      <div
        style={{
          background: '#fff',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <Skeleton width={140} height={22} borderRadius="0.375rem" />
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Skeleton width={36} height={36} borderRadius="50%" />
              <div style={{ flex: 1 }}>
                <Skeleton width="80%" height={16} borderRadius="0.25rem" />
                <div style={{ marginTop: '0.3rem' }}>
                  <Skeleton width="40%" height={13} borderRadius="0.25rem" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
