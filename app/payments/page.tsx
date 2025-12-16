// Lokasi: app/payments/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PaymentFormData {
  metodePembayaran: 'transfer' | 'cash' | '';
  namaPengirim: string;
  namaRekening: string;
  tanggalTransfer: string;
  unggahBukti: File | null;
}

interface Tagihan {
  namaPenyewa: string;
  kelasKamar: string;
  periode: string;
  totalTagihan: number;
  statusPembayaran: string;
  reservasiId?: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PaymentFormData>({
    metodePembayaran: '',
    namaPengirim: '',
    namaRekening: '',
    tanggalTransfer: '',
    unggahBukti: null,
  });
  const [previewBukti, setPreviewBukti] = useState<string>('');
  const [tagihan, setTagihan] = useState<Tagihan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTagihan();
  }, []);

  const fetchTagihan = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ambil data user dari storage
      const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.id || user.user_id;

      // Fetch data reservasi aktif user
      const response = await fetch(`/api/reservasi/user/${userId}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Gagal memuat data reservasi');
      }

      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        // Ambil reservasi pertama yang aktif atau belum lunas
        const activeReservasi = result.data.find((r: any) => 
          r.status_pembayaran === 'pending' || r.status_pembayaran === 'belum_bayar'
        ) || result.data[0];

        // Format data tagihan
        const tagihanData: Tagihan = {
          namaPenyewa: user.nama || user.nama_lengkap || 'User',
          kelasKamar: activeReservasi.nama_kost || activeReservasi.kelas_kamar || '-',
          periode: `${formatDate(activeReservasi.tanggal_mulai)} → ${formatDate(activeReservasi.tanggal_selesai)}`,
          totalTagihan: parseFloat(activeReservasi.total_biaya || activeReservasi.total_harga || 0),
          statusPembayaran: formatStatusPembayaran(activeReservasi.status_pembayaran),
          reservasiId: activeReservasi.id || activeReservasi.reservasi_id,
        };

        setTagihan(tagihanData);
      } else {
        setError('Tidak ada reservasi aktif. Silakan buat reservasi terlebih dahulu.');
      }
    } catch (err) {
      console.error('Error fetching tagihan:', err);
      setError('Gagal memuat data tagihan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\//g, '-');
  };

  const formatStatusPembayaran = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'MENUNGGU VERIFIKASI',
      'belum_bayar': 'BELUM LUNAS',
      'verified': 'LUNAS',
      'rejected': 'DITOLAK',
    };
    return statusMap[status?.toLowerCase()] || status?.toUpperCase() || 'BELUM LUNAS';
  };

  const handleMetodeChange = (metode: 'transfer' | 'cash') => {
    setFormData({ ...formData, metodePembayaran: metode });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, unggahBukti: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewBukti(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Validasi
    if (!formData.metodePembayaran) {
      alert('Pilih metode pembayaran terlebih dahulu!');
      return;
    }

    if (formData.metodePembayaran === 'transfer') {
      if (!formData.namaPengirim || !formData.namaRekening || !formData.tanggalTransfer || !formData.unggahBukti) {
        alert('Lengkapi semua data pembayaran!');
        return;
      }
    }

    try {
      // Prepare form data untuk upload
      const uploadData = new FormData();
      uploadData.append('reservasi_id', String(tagihan?.reservasiId || ''));
      uploadData.append('metode_pembayaran', formData.metodePembayaran);
      
      if (formData.metodePembayaran === 'transfer') {
        uploadData.append('nama_pengirim', formData.namaPengirim);
        uploadData.append('nama_rekening', formData.namaRekening);
        uploadData.append('tanggal_transfer', formData.tanggalTransfer);
        if (formData.unggahBukti) {
          uploadData.append('bukti_transfer', formData.unggahBukti);
        }
      }

      const response = await fetch('/api/payments/submit', {
        method: 'POST',
        body: uploadData,
      });

      const result = await response.json();

      if (result.success) {
        alert('Pembayaran berhasil disubmit! Status: Menunggu Verifikasi');
        router.push('/dashboard');
      } else {
        alert(result.error || 'Gagal submit pembayaran');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      alert('Terjadi kesalahan saat submit pembayaran');
    }
  };

  const handleReset = () => {
    setFormData({
      metodePembayaran: '',
      namaPengirim: '',
      namaRekening: '',
      tanggalTransfer: '',
      unggahBukti: null,
    });
    setPreviewBukti('');
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Memuat data tagihan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>⚠️ {error}</h2>
          <button onClick={() => router.push('/dashboard')} style={styles.backBtn}>
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!tagihan) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => router.push('/dashboard')} style={styles.backBtn}>
          ← Kembali ke Dashboard
        </button>
      </div>

      <div style={styles.contentWrapper}>
        {/* Left Side - Payment Form */}
        <div style={styles.leftSection}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Pilih Metode Pembayaran</h2>

            {/* Transfer Bank Option */}
            <div
              onClick={() => handleMetodeChange('transfer')}
              style={{
                ...styles.metodeCard,
                ...(formData.metodePembayaran === 'transfer' ? styles.metodeCardActive : {}),
              }}
            >
              <input
                type="radio"
                checked={formData.metodePembayaran === 'transfer'}
                onChange={() => handleMetodeChange('transfer')}
                style={styles.radio}
              />
              <div>
                <h3 style={styles.metodeTitle}>Transfer Bank</h3>
                <p style={styles.metodeDesc}>
                  Unggah bukti bank saat akan melakukan pembayaran
                </p>
              </div>
            </div>

            {/* Cash Option */}
            <div
              onClick={() => handleMetodeChange('cash')}
              style={{
                ...styles.metodeCard,
                ...(formData.metodePembayaran === 'cash' ? styles.metodeCardActive : {}),
              }}
            >
              <input
                type="radio"
                checked={formData.metodePembayaran === 'cash'}
                onChange={() => handleMetodeChange('cash')}
                style={styles.radio}
              />
              <div>
                <h3 style={styles.metodeTitle}>Cash (Tunai)</h3>
                <p style={styles.metodeDesc}>
                  Bayar langsung ke bendaharan, tapi kirimkan uang dulu (tidak perlu lainnya)
                </p>
              </div>
            </div>
          </div>

          {/* Rekening Tujuan - Only show for Transfer */}
          {formData.metodePembayaran === 'transfer' && (
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Rekening Tujuan</h2>
              <div style={styles.rekeningBox}>
                <p style={styles.rekeningLabel}>Bank BNI - No. Rek. 1243567890 - A/n. KOST PONDOK QONITAAT</p>
                <p style={styles.rekeningNote}>
                  Nomor transfer harus untuk jenis registrasi (bukan untuk sewa ruangan)
                </p>
              </div>

              {/* Form Transfer */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Nama Pengirim</label>
                <input
                  type="text"
                  name="namaPengirim"
                  value={formData.namaPengirim}
                  onChange={handleInputChange}
                  placeholder="Nama sesuai rekening"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nama Rekening</label>
                <input
                  type="text"
                  name="namaRekening"
                  value={formData.namaRekening}
                  onChange={handleInputChange}
                  placeholder="Nama rekening penerima"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Tanggal Transfer</label>
                <input
                  type="date"
                  name="tanggalTransfer"
                  value={formData.tanggalTransfer}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Unggah Bukti Transfer (png/jpeg)</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  style={styles.fileInput}
                />
                {previewBukti && (
                  <img src={previewBukti} alt="Preview" style={styles.preview} />
                )}
              </div>

              <div style={styles.buttonGroup}>
                <button onClick={handleSubmit} style={styles.submitBtn}>
                  Kirim Bukti
                </button>
                <button onClick={handleReset} style={styles.resetBtn}>
                  Reset
                </button>
              </div>

              <p style={styles.helpText}>
                Ada ada kesalahan, hubungi bendahara: <strong>0812-3456-7890</strong>
              </p>
            </div>
          )}

          {/* Cash Info */}
          {formData.metodePembayaran === 'cash' && (
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Pembayaran Tunai</h2>
              <div style={styles.cashInfo}>
                <p style={styles.cashText}>
                  Untuk pembayaran tunai, silakan datang langsung ke kantor kost dan lakukan pembayaran kepada bendahara.
                </p>
                <p style={styles.cashText}>
                  📍 <strong>Alamat:</strong> Jl. Pondok Qonitaat No. 123, Medan
                </p>
                <p style={styles.cashText}>
                  🕐 <strong>Jam Operasional:</strong> Senin - Jumat, 08:00 - 16:00 WIB
                </p>
                <p style={styles.cashText}>
                  📞 <strong>Kontak:</strong> 0812-3456-7890
                </p>
              </div>
              <button onClick={handleSubmit} style={styles.submitBtn}>
                Konfirmasi Pembayaran Tunai
              </button>
            </div>
          )}
        </div>

        {/* Right Side - Ringkasan Tagihan */}
        <div style={styles.rightSection}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Ringkasan Tagihan</h2>

            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Nama Penyewa</span>
              <span style={styles.summaryValue}>{tagihan.namaPenyewa}</span>
            </div>

            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Kelas Kamar</span>
              <span style={styles.summaryValue}>{tagihan.kelasKamar}</span>
            </div>

            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Periode</span>
              <span style={styles.summaryValue}>{tagihan.periode}</span>
            </div>

            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Total Tagihan</span>
              <span style={{...styles.summaryValue, ...styles.totalTagihan}}>
                {formatRupiah(tagihan.totalTagihan)}
              </span>
            </div>

            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Status Pembayaran</span>
              <span style={
                tagihan.statusPembayaran.includes('LUNAS') 
                  ? styles.statusLunas 
                  : styles.statusBelumLunas
              }>
                {tagihan.statusPembayaran}
              </span>
            </div>

            <div style={styles.catatanBox}>
              <p style={styles.catatanTitle}>Catatan:</p>
              <p style={styles.catatanText}>
                Untuk transfer, pastikan jumlah transfer sesuai dengan total tagihan di atas. Setelah melakukan transfer, unggah bukti untuk verifikasi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
    padding: '2rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '1rem',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #e5e7eb',
    borderTop: '5px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorCard: {
    background: 'white',
    padding: '3rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '2rem auto',
  },
  header: {
    marginBottom: '2rem',
  },
  backBtn: {
    padding: '0.75rem 1.5rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  contentWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  leftSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  rightSection: {
    position: 'sticky',
    top: '2rem',
    height: 'fit-content',
  },
  card: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1.5rem',
  },
  metodeCard: {
    display: 'flex',
    alignItems: 'start',
    gap: '1rem',
    padding: '1.5rem',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    marginBottom: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  metodeCardActive: {
    border: '2px solid #2563eb',
    background: '#eff6ff',
  },
  radio: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    marginTop: '0.25rem',
  },
  metodeTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.5rem',
  },
  metodeDesc: {
    fontSize: '0.9rem',
    color: '#666',
    lineHeight: '1.5',
  },
  rekeningBox: {
    background: '#fef3c7',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  rekeningLabel: {
    fontWeight: 600,
    color: '#92400e',
    marginBottom: '0.5rem',
  },
  rekeningNote: {
    fontSize: '0.85rem',
    color: '#78350f',
    fontStyle: 'italic',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontWeight: 600,
    color: '#333',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  fileInput: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  preview: {
    marginTop: '1rem',
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  submitBtn: {
    flex: 1,
    padding: '0.875rem',
    background: '#f97316',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  resetBtn: {
    flex: 1,
    padding: '0.875rem',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  helpText: {
    fontSize: '0.85rem',
    color: '#666',
    textAlign: 'center',
  },
  cashInfo: {
    background: '#eff6ff',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  cashText: {
    color: '#1e40af',
    marginBottom: '0.75rem',
    lineHeight: '1.6',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 0',
    borderBottom: '1px solid #e5e7eb',
  },
  summaryLabel: {
    color: '#666',
    fontWeight: 500,
  },
  summaryValue: {
    color: '#333',
    fontWeight: 600,
    textAlign: 'right',
  },
  totalTagihan: {
    fontSize: '1.5rem',
    color: '#2563eb',
  },
  statusBelumLunas: {
    background: '#fef2f2',
    color: '#991b1b',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  statusLunas: {
    background: '#d1fae5',
    color: '#065f46',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  catatanBox: {
    background: '#fffbeb',
    padding: '1rem',
    borderRadius: '8px',
    marginTop: '1.5rem',
  },
  catatanTitle: {
    fontWeight: 600,
    color: '#92400e',
    marginBottom: '0.5rem',
  },
  catatanText: {
    fontSize: '0.85rem',
    color: '#78350f',
    lineHeight: '1.6',
  },
};