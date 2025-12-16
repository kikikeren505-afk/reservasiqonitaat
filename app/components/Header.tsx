'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Sembunyikan header di halaman dashboard dan admin
  const isDashboardPage = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  useEffect(() => {
    // Cek status login dari localStorage atau sessionStorage
    const userFromLocalStorage = localStorage.getItem('user');
    const userFromSessionStorage = sessionStorage.getItem('user');
    
    if (userFromLocalStorage || userFromSessionStorage) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(userFromLocalStorage || userFromSessionStorage || '{}');
        setUserEmail(userData.email || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
      setUserEmail('');
    }
  }, [pathname]); // Re-check setiap kali pathname berubah

  const handleLogout = () => {
    // Hapus data login
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserEmail('');
    
    // Redirect ke beranda
    router.push('/');
  };

  // Jangan tampilkan header di halaman dashboard
  if (isDashboardPage) {
    return null;
  }

  return (
    <header>
      <div className="header-container">
        <a href="/" className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z"/>
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z"/>
          </svg>
          Kost Pondok Qonitaat
        </a>
        <nav>
          <a href="/">Beranda</a>
          <a href="/fitur">Fitur</a>
          {/* ✅ MENU DASHBOARD - HANYA MUNCUL SETELAH LOGIN */}
          {isLoggedIn && (
            <a 
              href="/dashboard" 
              style={{
                color: pathname === '/dashboard' ? '#2563eb' : 'inherit',
                fontWeight: pathname === '/dashboard' ? '600' : '500'
              }}
            >
              Dashboard
            </a>
          )}
          <a href="/kontak">Kontak</a>
          <div className="nav-buttons">
            {isLoggedIn ? (
              <>
                <span className="user-email" style={{
                  color: '#2563eb',
                  fontWeight: 600,
                  marginRight: '1rem',
                  fontSize: '0.95rem'
                }}>
                  {userEmail}
                </span>
                <button 
                  onClick={handleLogout}
                  className="btn-login"
                  style={{
                    background: '#dc2626',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="btn-login">Login</a>
                <a href="/register" className="btn-daftar">Daftar</a>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}