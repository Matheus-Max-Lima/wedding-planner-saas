import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

const pulseKeyframes = `
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
`;

export default function Skeleton({ width, height, borderRadius, className }: SkeletonProps) {
  return (
    <>
      <style>{pulseKeyframes}</style>
      <div
        className={className}
        style={{
          width: width ?? '100%',
          height: height ?? '1rem',
          borderRadius: borderRadius ?? '0.375rem',
          background: '#f3e8ea',
          animation: 'skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          display: 'inline-block',
        }}
      />
    </>
  );
}
