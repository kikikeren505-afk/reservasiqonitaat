'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    nomor_hp: '',
    alamat: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Registrasi gagal. Silakan coba lagi.');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.registerBox}>
        <div style={styles.registerHeader}>
          <h1 style={styles.title}>Daftar Akun Baru</h1>
          <p style={styles.subtitle}>Lengkapi data diri Anda untuk mendaftar</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={styles.errorBox}>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div style={styles.successBox}>
              <p>{success}</p>
            </div>
          )}

          <div style={styles.formGroup}>
            <label htmlFor="nama_lengkap" style={styles.label}>
              Nama Lengkap *
            </label>
            <input
              type="text"
              id="nama_lengkap"
              name="nama_lengkap"
              value={formData.nama_lengkap}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap Anda"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contoh@email.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="nomor_hp" style={styles.label}>
              Nomor HP *
            </label>
            <input
              type="tel"
              id="nomor_hp"
              name="nomor_hp"
              value={formData.nomor_hp}
              onChange={handleChange}
              placeholder="08xxxxxxxxxx"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="alamat" style={styles.label}>
              Alamat *
            </label>
            <textarea
              id="alamat"
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              placeholder="Masukkan alamat lengkap Anda"
              required
              style={{...styles.input, minHeight: '80px', resize: 'vertical'}}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Konfirmasi Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Ulangi password Anda"
              required
              style={styles.input}
            />
          </div>

          <button 
            type="submit" 
            style={styles.btnSubmit}
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>

          <div style={styles.loginLink}>
            Sudah punya akun?{' '}
            <a href="/login" style={styles.loginLinkAnchor}>
              Login di sini
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
  registerBox: {
    background: 'white',
    padding: '3rem',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '500px',
    animation: 'slideUp 0.5s ease-out',
  },
  registerHeader: {
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
  successBox: {
    background: '#d1fae5',
    border: '1px solid #10b981',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1.5rem',
    color: '#059669',
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
    fontFamily: 'inherit',
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
  loginLink: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#666',
    fontSize: '0.95rem',
  },
  loginLinkAnchor: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 600,
  },
};