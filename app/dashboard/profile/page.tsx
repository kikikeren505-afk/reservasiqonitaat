// Lokasi: app/dashboard/profile/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id?: number;
  user_id?: number;
  nama?: string;
  nama_lengkap?: string;
  alamat: string;
  no_hp?: string;
  nomor_hp?: string;
  email?: string;
  role?: string;
  level_name?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nomor_hp: '',
    alamat: '',
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
    
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      console.log('User data:', parsedUser);
      setUser(parsedUser);
      
      // Initialize form data
      setFormData({
        nama_lengkap: parsedUser.nama_lengkap || parsedUser.nama || '',
        nomor_hp: parsedUser.nomor_hp || parsedUser.no_hp || '',
        alamat: parsedUser.alamat || '',
      });
      
      setLoading(false);
      setTimeout(() => setMounted(true), 100);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaveLoading(true);
    setMessage(null);

    try {
      const userId = user.id || user.user_id;
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update user data in storage and state
        const updatedUser = {
          ...user,
          nama_lengkap: formData.nama_lengkap,
          nama: formData.nama_lengkap,
          nomor_hp: formData.nomor_hp,
          no_hp: formData.nomor_hp,
          alamat: formData.alamat,
        };

        // Save to storage
        if (sessionStorage.getItem('user')) {
          sessionStorage.setItem('user', JSON.stringify(updatedUser));
        }
        if (localStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        setUser(updatedUser);
        setEditing(false);
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal memperbarui profil' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat memperbarui profil' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        nama_lengkap: user.nama_lengkap || user.nama || '',
        nomor_hp: user.nomor_hp || user.no_hp || '',
        alamat: user.alamat || '',
      });
    }
    setEditing(false);
    setMessage(null);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Memuat profil...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.nama_lengkap || user.nama || 'User';
  const displayPhone = user.nomor_hp || user.no_hp || '-';
  const displayEmail = user.email || '-';
  const displayRole = user.level_name || user.role || 'User';

  return (
    <div style={styles.container}>
      <div style={{
        ...styles.header,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.8s ease-out',
      }}>
        <h1 style={styles.title}>Profil Saya</h1>
        <p style={styles.subtitle}>Kelola informasi profil Anda</p>
      </div>

      {message && (
        <div style={{
          ...styles.messageBox,
          background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          borderColor: message.type === 'success' ? '#10b981' : '#ef4444',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          opacity: 1,
          transform: 'scale(1)',
          animation: 'popIn 0.4s ease-out',
        }}>
          <span style={styles.messageIcon}>
            {message.type === 'success' ? '✓' : '⚠️'}
          </span>
          <span>{message.text}</span>
        </div>
      )}

      <div style={{
        ...styles.profileCard,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s ease-out 0.2s',
      }}>
        {/* Avatar Section */}
        <div style={styles.avatarSection}>
          <div style={{
            ...styles.avatar,
            transform: mounted ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(-10deg)',
            transition: 'all 0.6s ease-out 0.4s',
          }}>
            <span style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 style={styles.userName}>{displayName}</h2>
          <span style={styles.roleBadge}>{displayRole}</span>
        </div>

        {/* Profile Info */}
        <div style={styles.infoSection}>
          <h3 style={styles.sectionTitle}>Informasi Pribadi</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Nama Lengkap</label>
            {editing ? (
              <input
                type="text"
                name="nama_lengkap"
                value={formData.nama_lengkap}
                onChange={handleChange}
                style={styles.input}
                placeholder="Masukkan nama lengkap"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            ) : (
              <p style={styles.value}>{displayName}</p>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <p style={styles.value}>{displayEmail}</p>
            <small style={styles.hint}>Email tidak dapat diubah</small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nomor HP</label>
            {editing ? (
              <input
                type="text"
                name="nomor_hp"
                value={formData.nomor_hp}
                onChange={handleChange}
                style={styles.input}
                placeholder="Masukkan nomor HP"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            ) : (
              <p style={styles.value}>{displayPhone}</p>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Alamat</label>
            {editing ? (
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                style={styles.textarea}
                placeholder="Masukkan alamat lengkap"
                rows={3}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            ) : (
              <p style={styles.value}>{user.alamat || '-'}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saveLoading}
                style={styles.saveBtn}
                onMouseEnter={(e) => {
                  if (!saveLoading) {
                    e.currentTarget.style.background = '#059669';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!saveLoading) {
                    e.currentTarget.style.background = '#10b981';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {saveLoading ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saveLoading}
                style={styles.cancelBtn}
                onMouseEnter={(e) => {
                  if (!saveLoading) {
                    e.currentTarget.style.background = '#4b5563';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!saveLoading) {
                    e.currentTarget.style.background = '#6b7280';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                ✕ Batal
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              style={styles.editBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1d4ed8';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2563eb';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ✏️ Edit Profil
            </button>
          )}
        </div>

        {/* Back to Dashboard */}
        <div style={styles.backLink}>
          <a 
            href="/dashboard" 
            style={styles.link}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1d4ed8';
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#2563eb';
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            ← Kembali ke Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    minHeight: '100vh',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    gap: '1rem',
    color: '#666',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    color: '#333',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666',
  },
  messageBox: {
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  messageIcon: {
    fontSize: '1.25rem',
  },
  profileCard: {
    background: 'white',
    borderRadius: '15px',
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  avatarSection: {
    textAlign: 'center',
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '2px solid #f3f4f6',
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  avatarText: {
    fontSize: '3rem',
    color: 'white',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: '1.8rem',
    color: '#333',
    marginBottom: '0.5rem',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    background: '#10b981',
    color: 'white',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  infoSection: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    color: '#333',
    marginBottom: '1.5rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #f3f4f6',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#666',
    marginBottom: '0.5rem',
  },
  value: {
    fontSize: '1.1rem',
    color: '#333',
    padding: '0.75rem',
    background: '#f9fafb',
    borderRadius: '8px',
  },
  hint: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#999',
    marginTop: '0.25rem',
  },
  input: {
    width: '100%',
    padding: '0.875rem',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '0.875rem',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none',
  },
  actionButtons: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  editBtn: {
    flex: 1,
    padding: '1rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  saveBtn: {
    flex: 1,
    padding: '1rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  cancelBtn: {
    flex: 1,
    padding: '1rem',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  backLink: {
    textAlign: 'center',
    paddingTop: '1.5rem',
    borderTop: '2px solid #f3f4f6',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    transition: 'all 0.3s ease',
  },
};