'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface KostFormData {
  nama: string;
  alamat: string;
  harga: string;
  status: string;
  deskripsi: string;
  jumlahKamar: string;
  kamarTersedia: string;
  fasilitas: string;
}

export default function TambahKost() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<KostFormData>({
    nama: '',
    alamat: '',
    harga: '',
    status: 'Tersedia',
    deskripsi: '',
    jumlahKamar: '',
    kamarTersedia: '',
    fasilitas: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/kost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          harga: parseFloat(formData.harga),
          jumlahKamar: formData.jumlahKamar ? parseInt(formData.jumlahKamar) : undefined,
          kamarTersedia: formData.kamarTersedia ? parseInt(formData.kamarTersedia) : undefined,
          fasilitas: formData.fasilitas.split(',').map(f => f.trim()).filter(f => f),
        }),
      });

      if (response.ok) {
        alert('Data kost berhasil ditambahkan!');
        router.push('/admin/kost');
      } else {
        throw new Error('Failed to create kost');
      }
    } catch (error) {
      console.error('Error creating kost:', error);
      alert('Gagal menambahkan data kost');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Back Button */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link 
            href="/admin/kost" 
            style={{ 
              color: '#3b82f6', 
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            ← Kembali ke Dashboard
          </Link>
        </div>

        {/* Form Container */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '2rem'
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '2rem'
          }}>
            Tambah Kost Baru
          </h1>

          <form onSubmit={handleSubmit}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Nama Kost */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Nama Kost *
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Kost Pondok Qonitaat - Kelas 1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* Harga */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Harga per Bulan (Rp) *
                </label>
                <input
                  type="number"
                  name="harga"
                  value={formData.harga}
                  onChange={handleChange}
                  required
                  placeholder="1500000"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* Alamat - Full Width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Alamat *
                </label>
                <input
                  type="text"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  required
                  placeholder="Jl. Gatot Subroto No. 123, Medan"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* Status */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="Tersedia">Tersedia</option>
                  <option value="Penuh">Penuh</option>
                </select>
              </div>

              {/* Jumlah Kamar */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Jumlah Kamar
                </label>
                <input
                  type="number"
                  name="jumlahKamar"
                  value={formData.jumlahKamar}
                  onChange={handleChange}
                  placeholder="10"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* Kamar Tersedia */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Kamar Tersedia
                </label>
                <input
                  type="number"
                  name="kamarTersedia"
                  value={formData.kamarTersedia}
                  onChange={handleChange}
                  placeholder="5"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* Deskripsi - Full Width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Deskripsi
                </label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Deskripsi kost..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Fasilitas - Full Width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Fasilitas (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  name="fasilitas"
                  value={formData.fasilitas}
                  onChange={handleChange}
                  placeholder="WiFi, AC, Kamar Mandi Dalam, Kasur, Lemari"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: submitting ? '#9ca3af' : '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.backgroundColor = '#059669';
                  }
                }}
                onMouseOut={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.backgroundColor = '#10b981';
                  }
                }}
              >
                {submitting ? 'Menyimpan...' : 'Tambah Kost'}
              </button>
              
              <Link
                href="/admin/kost"
                style={{
                  backgroundColor: '#e5e7eb',
                  color: '#1f2937',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'inline-block',
                  transition: 'background-color 0.2s'
                }}
              >
                Batal
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}