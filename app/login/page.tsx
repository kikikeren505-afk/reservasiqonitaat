// Lokasi: app/login/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Cek apakah user sudah login
    const userFromLocalStorage = localStorage.getItem('user');
    const userFromSessionStorage = sessionStorage.getItem('user');
    
    if (userFromLocalStorage || userFromSessionStorage) {
      // Jika sudah login, redirect ke halaman kost
      router.push('/kost');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok && data.success) {
        // PENTING: Simpan data user LENGKAP dari API response
        const userData = data.data;
        
        console.log('Saving user data:', userData);
        
        // Simpan ke localStorage atau sessionStorage
        if (formData.remember) {
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('Saved to localStorage');
        } else {
          sessionStorage.setItem('user', JSON.stringify(userData));
          console.log('Saved to sessionStorage');
        }
        
        // Redirect berdasarkan role
        if (userData.role === 'admin') {
          console.log('Redirecting to admin dashboard...');
          router.push('/admin');
        } else {
          console.log('Redirecting to kost page...');
          router.push('/kost');
        }
      } else {
        setError(data.message || 'Login gagal. Periksa kembali email dan password Anda.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Tampilkan loading saat mengecek autentikasi
  if (checkingAuth) {
    return (
      <div style={{
        ...styles.container,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem 3rem',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <div style={styles.loginHeader}>
          <h1 style={styles.title}>Selamat Datang</h1>
          <p style={styles.subtitle}>Silakan login untuk melakukan reservasi</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={styles.errorBox}>
              <p>{error}</p>
            </div>
          )}

          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Masukkan email Anda"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan password Anda"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formOptions}>
            <div style={styles.rememberMe}>
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <label htmlFor="remember" style={styles.checkboxLabel}>
                Ingat Saya
              </label>
            </div>
            <a href="/forgot-password" style={styles.forgotPassword}>
              Lupa Password?
            </a>
          </div>

          <button 
            type="submit" 
            style={styles.btnSubmit}
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>

          <div style={styles.registerLink}>
            Belum punya akun?{' '}
            <a href="/register" style={styles.registerLinkAnchor}>
              Daftar Sekarang
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 200px)',
    padding: '2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  loginBox: {
    background: 'white',
    padding: '3rem',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '450px',
    animation: 'slideUp 0.5s ease-out',
  },
  loginHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    color: '#333',
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#666',
    fontSize: '0.95rem',
  },
  errorBox: {
    background: '#fee2e2',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1.5rem',
    color: '#dc2626',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    color: '#333',
    fontWeight: 600,
    marginBottom: '0.5rem',
    fontSize: '0.95rem',
  },
  input: {
    width: '100%',
    padding: '0.875rem',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '1rem',
    transition: 'all 0.3s',
  },
  formOptions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  rememberMe: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '0.9rem',
    color: '#666',
    cursor: 'pointer',
  },
  forgotPassword: {
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  btnSubmit: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  registerLink: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#666',
    fontSize: '0.95rem',
  },
  registerLinkAnchor: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 600,
  },
};