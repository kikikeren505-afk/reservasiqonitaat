// Lokasi: app/admin/kost/[id]/edit/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface KostForm {
  nama: string;
  alamat: string;
  harga: string;
  deskripsi: string;
  fasilitas: string;
  status: string;
}

export default function EditKostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<KostForm>({
    nama: '',
    alamat: '',
    harga: '',
    deskripsi: '',
    fasilitas: '',
    status: 'tersedia',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check admin access
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
    
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      
      if (parsedUser.role !== 'admin') {
        alert('Akses ditolak.');
        router.push('/dashboard');
        return;
      }
      
      fetchKostData();
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchKostData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/kost/${params.id}`, {
        cache: 'no-store',
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const kost = data.data;
        setFormData({
          nama: kost.nama,
          alamat: kost.alamat,
          harga: kost.harga.toString(),
          deskripsi: kost.deskripsi,
          fasilitas: kost.fasilitas,
          status: kost.status,
        });
      } else {
        setError(data.message || 'Gagal memuat data kost');
      }
    } catch (error) {
      console.error('Error fetching kost:', error);
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // Validasi
      if (!formData.nama || !formData.alamat || !formData.harga || !formData.deskripsi || !formData.fasilitas) {
        setError('Semua field harus diisi');
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/admin/kost/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama: formData.nama,
          alamat: formData.alamat,
          harga: parseInt(formData.harga),
          deskripsi: formData.deskripsi,
          fasilitas: formData.fasilitas,
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Kost berhasil diupdate!');
        router.refresh();
        setTimeout(() => {
          router.push('/admin/kost');
        }, 100);
      } else {
        setError(data.message || 'Gagal mengupdate kost');
      }
    } catch (error) {
      console.error('Error updating kost:', error);
      setError('Terjadi kesalahan saat mengupdate kost');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Memuat data kost...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Edit Kost</h1>
      </div>

      <div style={styles.backLink}>
        <a href="/admin/kost" style={styles.link}>← Kembali ke Daftar Kost</a>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div style={styles.formCard}>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nama Kost *</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Contoh: Kost Pondok Qonitaat - Kelas 1"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Alamat Lengkap *</label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              placeholder="Masukkan alamat lengkap kost"
              required
              rows={3}
              style={styles.textarea}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Harga per Bulan (Rp) *</label>
            <input
              type="number"
              name="harga"
              value={formData.harga}
              onChange={handleChange}
              placeholder="Contoh: 1500000"
              required
              min="0"
              style={styles.input}
            />
            <small style={styles.hint}>Masukkan harga dalam rupiah tanpa titik atau koma</small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Deskripsi *</label>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              placeholder="Deskripsikan kost Anda..."
              required
              rows={4}
              style={styles.textarea}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Fasilitas *</label>
            <textarea
              name="fasilitas"
              value={formData.fasilitas}
              onChange={handleChange}
              placeholder="Pisahkan dengan koma. Contoh: AC, WiFi, Kamar Mandi Dalam, Kasur, Lemari"
              required
              rows={3}
              style={styles.textarea}
            />
            <small style={styles.hint}>Pisahkan setiap fasilitas dengan koma (,)</small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              style={styles.select}
            >
              <option value="tersedia">Tersedia</option>
              <option value="penuh">Penuh</option>
            </select>
          </div>

          <div style={styles.formActions}>
            <button
              type="submit"
              disabled={saving}
              style={styles.submitBtn}
            >
              {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
            </button>
            <a
              href="/admin/kost"
              style={styles.cancelBtn}
            >
              Batal
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #dc2626',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    color: '#333',
  },
  backLink: {
    marginBottom: '1.5rem',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 600,
  },
  errorAlert: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    gap: '1rem',
    color: '#991b1b',
  },
  formCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 600,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'border-color 0.3s',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    transition: 'border-color 0.3s',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  hint: {
    display: 'block',
    marginTop: '0.25rem',
    fontSize: '0.85rem',
    color: '#666',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  },
  submitBtn: {
    flex: 1,
    padding: '1rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  cancelBtn: {
    flex: 1,
    padding: '1rem',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 600,
    textAlign: 'center',
    textDecoration: 'none',
    display: 'block',
  },
};