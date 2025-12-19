'use client';

import { Suspense } from 'react';
import ReservasiContent from './content';

export default function ReservasiPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite',
          }}></div>
          <p style={{ color: '#64748b' }}>Memuat halaman...</p>
        </div>
      </div>
    }>
      <ReservasiContent />
    </Suspense>
  );
}