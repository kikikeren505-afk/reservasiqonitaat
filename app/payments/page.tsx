// Lokasi: app/payments/page.tsx - FIXED VERSION WITH BETTER UI FEEDBACK

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Reservasi {
  id: number;
  user_id: number;
  kost_id: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  durasi_bulan: number;
  total_harga: number;
  status: string;
  created_at: string;
  nama_kost?: string;
  alamat_kost?: string;
  pembayaran?: Payment[];
}

interface Payment {
  id: number;
  status: 'pending' | 'verified' | 'rejected';
  metode_pembayaran: string;
  bukti_pembayaran?: string;
  keterangan?: string;
  created_at: string;
}

interface PaymentFormData {
  metodePembayaran: 'transfer' | 'cash' | '';
  namaPengirim: string;
  namaRekening: string;
  tanggalTransfer: string;
  buktiPembayaran: File | null;
}

// Toast Notification Component
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const colors = {
    success: { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: '✅' },
    error: { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', icon: '❌' },
    info: { bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', icon: 'ℹ️' }
  };

  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type].bg};
    color: white;
    padding: 1.25rem 1.75rem;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    font-weight: 600;
    font-size: 1rem;
    max-width: 400px;
  `;
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 1rem;">
      <span style="font-size: 1.5rem;">${colors[type].icon}</span>
      <div style="flex: 1;">${message}</div>
    </div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

export default function PaymentsDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reservasiList, setReservasiList] = useState<Reservasi[]>([]);
  const [selectedReservasi, setSelectedReservasi] = useState<Reservasi | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [processingCash, setProcessingCash] = useState<number | null>(null);

  const [formData, setFormData] = useState<PaymentFormData>({
    metodePembayaran: '',
    namaPengirim: '',
    namaRekening: '',
    tanggalTransfer: new Date().toISOString().split('T')[0],
    buktiPembayaran: null
  });

  // Inject animations
  useEffect(() => {
    injectAnimations();
  }, []);

  // Check user login
  useEffect(() => {
    checkUser();
  }, []);

  // Fetch reservasi list
  useEffect(() => {
    if (currentUser) {
      fetchReservasiList();
    }
  }, [currentUser]);

  // Auto-refresh setiap 10 detik
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      fetchReservasiList();
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const injectAnimations = () => {
    if (document.getElementById('payment-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'payment-animations';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      @keyframes slideUp {
        from {
          transform: translateY(50px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const checkUser = () => {
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
    
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      console.log('✅ User logged in:', parsedUser);
      setCurrentUser(parsedUser);
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      router.push('/login');
    }
  };

  const fetchReservasiList = async () => {
    try {
      if (!currentUser) return;
      
      setLoading(true);
      const userId = currentUser.id || currentUser.user_id;

      console.log('🔄 Fetching reservasi for user:', userId);

      const response = await fetch(`/api/reservasi?user_id=${userId}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reservasi');
      }

      const result = await response.json();
      console.log('📦 Reservasi data:', result);

      if (result.success && result.data) {
        setReservasiList(result.data);
      } else {
        setReservasiList([]);
      }
    } catch (error) {
      console.error('❌ Error fetching reservasi:', error);
      showToast('Gagal memuat data reservasi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPaymentMethod = (reservasi: Reservasi, method: 'transfer' | 'cash') => {
    console.log('💳 Payment method selected:', method, 'for reservasi:', reservasi.id);
    
    setSelectedReservasi(reservasi);
    setFormData(prev => ({ ...prev, metodePembayaran: method }));
    
    if (method === 'cash') {
      submitCashPayment(reservasi);
    } else {
      setShowPaymentForm(true);
    }
  };

  const submitCashPayment = async (reservasi: Reservasi) => {
    try {
      setProcessingCash(reservasi.id);
      
      console.log('🔄 Memproses pembayaran tunai untuk reservasi:', reservasi.id);
      
      // Simulasi loading minimal 1.5 detik untuk UX yang lebih baik
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const paymentData = {
        reservasi_id: reservasi.id,
        jumlah: reservasi.total_harga,
        metode_pembayaran: 'cash',
        status: 'pending',
        nama_pengirim: currentUser.nama || currentUser.email || 'User',
        keterangan: 'Pembayaran tunai - Menunggu konfirmasi admin'
      };

      console.log('📤 Sending payment data:', paymentData);

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();
      
      console.log('📦 Response dari API:', data);

      if (response.ok && data.success) {
        showToast(
          `<div>
            <div style="font-size: 1.1rem; margin-bottom: 0.25rem;">Pembayaran Berhasil Dicatat!</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">Silakan hubungi admin untuk konfirmasi</div>
          </div>`,
          'success'
        );
        
        // Refresh data
        console.log('🔄 Refreshing reservation list...');
        await fetchReservasiList();
        setSelectedReservasi(null);
      } else {
        throw new Error(data.message || 'Gagal menyimpan pembayaran');
      }
    } catch (error: any) {
      console.error('❌ Error submitting cash payment:', error);
      showToast(
        `<div>
          <div style="font-size: 1.1rem; margin-bottom: 0.25rem;">Gagal Mencatat Pembayaran</div>
          <div style="font-size: 0.9rem; opacity: 0.9;">${error.message}</div>
        </div>`,
        'error'
      );
    } finally {
      setProcessingCash(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Ukuran file maksimal 5MB', 'error');
        return;
      }

      if (!file.type.startsWith('image/')) {
        showToast('File harus berupa gambar', 'error');
        return;
      }

      setFormData(prev => ({ ...prev, buktiPembayaran: file }));
      showToast('File berhasil dipilih', 'success');
    }
  };

  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.namaPengirim || !formData.buktiPembayaran) {
      showToast('Mohon lengkapi semua field!', 'error');
      return;
    }

    if (!selectedReservasi) return;

    try {
      setUploading(true);
      setUploadStatus('📤 Mengupload bukti pembayaran...');

      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(formData.buktiPembayaran);
      
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;

          setUploadStatus('💾 Menyimpan data pembayaran...');

          const response = await fetch('/api/payments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              reservasi_id: selectedReservasi.id,
              jumlah: selectedReservasi.total_harga,
              metode_pembayaran: 'transfer',
              status: 'pending',
              bukti_pembayaran: base64Data,
              nama_pengirim: formData.namaPengirim,
              tanggal_transfer: formData.tanggalTransfer
            }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            setUploadStatus('✅ Berhasil!');
            
            showToast(
              `<div>
                <div style="font-size: 1.1rem; margin-bottom: 0.25rem;">Bukti Pembayaran Berhasil Diupload!</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">Menunggu verifikasi admin...</div>
              </div>`,
              'success'
            );

            // Reset
            await fetchReservasiList();
            setShowPaymentForm(false);
            setSelectedReservasi(null);
            setFormData({
              metodePembayaran: '',
              namaPengirim: '',
              namaRekening: '',
              tanggalTransfer: new Date().toISOString().split('T')[0],
              buktiPembayaran: null
            });
          } else {
            throw new Error(data.message || 'Gagal menyimpan pembayaran');
          }
        } catch (error: any) {
          console.error('Error uploading payment:', error);
          showToast(`Gagal upload bukti pembayaran: ${error.message}`, 'error');
          setUploadStatus('❌ Upload gagal');
        } finally {
          setUploading(false);
          setTimeout(() => setUploadStatus(''), 3000);
        }
      };

      reader.onerror = () => {
        showToast('Gagal membaca file', 'error');
        setUploading(false);
      };

    } catch (error: any) {
      console.error('Error:', error);
      showToast(`Terjadi kesalahan: ${error.message}`, 'error');
      setUploading(false);
    }
  };

  const getPaymentStatus = (reservasi: Reservasi) => {
    if (!reservasi.pembayaran || reservasi.pembayaran.length === 0) {
      return { status: 'unpaid', text: 'Belum Dibayar', color: '#ef4444' };
    }

    const latestPayment = reservasi.pembayaran[0];
    
    if (latestPayment.status === 'verified') {
      return { status: 'verified', text: 'Terverifikasi', color: '#10b981' };
    } else if (latestPayment.status === 'pending') {
      return { status: 'pending', text: 'Menunggu Verifikasi', color: '#f59e0b' };
    } else {
      return { status: 'rejected', text: 'Ditolak', color: '#ef4444' };
    }
  };

  if (loading && reservasiList.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Memuat data pembayaran...</p>
      </div>
    );
  }

  // ==================== PAYMENT FORM MODAL ====================
  if (showPaymentForm && selectedReservasi) {
    return (
      <div style={styles.modalOverlay} onClick={() => setShowPaymentForm(false)}>
        <div style={styles.modernModal} onClick={(e) => e.stopPropagation()}>
          {/* Close Button */}
          <button 
            onClick={() => setShowPaymentForm(false)}
            style={styles.modernCloseBtn}
          >
            ✕
          </button>

          {/* Header with Icon */}
          <div style={styles.modernHeader}>
            <div style={styles.iconCircle}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
              </svg>
            </div>
            <h2 style={styles.modernTitle}>Transfer ke Rekening</h2>
            <p style={styles.modernSubtitle}>Bank BCA - 1234567890</p>
            <p style={styles.modernAccountName}>a/n PT Hunian Sejahtera</p>
          </div>

          {/* Reservasi Info Box */}
          <div style={styles.infoBox}>
            <div style={styles.infoBoxRow}>
              <span>Kost:</span>
              <strong>{selectedReservasi.nama_kost || `ID: ${selectedReservasi.kost_id}`}</strong>
            </div>
            <div style={styles.infoBoxRow}>
              <span>Durasi:</span>
              <strong>{selectedReservasi.durasi_bulan} Bulan</strong>
            </div>
            <div style={{...styles.infoBoxRow, ...styles.totalRow}}>
              <span>Total Bayar:</span>
              <strong style={styles.totalAmount}>
                Rp {selectedReservasi.total_harga.toLocaleString('id-ID')}
              </strong>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitTransfer} style={styles.modernForm}>
            {/* Nama Pengirim */}
            <div style={styles.modernFormGroup}>
              <label style={styles.modernLabel}>
                Nama Pengirim <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.namaPengirim}
                onChange={(e) => setFormData(prev => ({ ...prev, namaPengirim: e.target.value }))}
                style={styles.modernInput}
                placeholder="Masukkan nama Anda"
                required
              />
            </div>

            {/* Tanggal Transfer */}
            <div style={styles.modernFormGroup}>
              <label style={styles.modernLabel}>
                Tanggal Transfer <span style={styles.required}>*</span>
              </label>
              <div style={styles.inputWithIcon}>
                <input
                  type="date"
                  value={formData.tanggalTransfer}
                  onChange={(e) => setFormData(prev => ({ ...prev, tanggalTransfer: e.target.value }))}
                  style={styles.modernInput}
                  required
                />
                <span style={styles.inputIcon}>📅</span>
              </div>
            </div>

            {/* Upload Bukti */}
            <div style={styles.modernFormGroup}>
              <label style={styles.modernLabel}>
                Bukti Pembayaran <span style={styles.required}>*</span>
              </label>
              
              <label htmlFor="file-upload" style={styles.uploadArea}>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  style={{display: 'none'}}
                  required
                />
                
                {!formData.buktiPembayaran ? (
                  <div style={styles.uploadPlaceholder}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity: 0.5}}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span style={styles.uploadText}>Pilih file JPG atau PNG</span>
                    <span style={styles.uploadSubtext}>Maksimal 5MB</span>
                  </div>
                ) : (
                  <div style={styles.uploadSuccess}>
                    <span style={styles.checkIcon}>✓</span>
                    <div>
                      <div style={styles.fileName}>{formData.buktiPembayaran.name}</div>
                      <div style={styles.fileSize}>
                        {(formData.buktiPembayaran.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Upload Status */}
            {uploading && (
              <div style={styles.uploadingStatus}>
                <div style={styles.miniSpinner}></div>
                <span>{uploadStatus}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              style={{
                ...styles.modernSubmitBtn,
                opacity: uploading ? 0.6 : 1,
                cursor: uploading ? 'not-allowed' : 'pointer'
              }}
            >
              {uploading ? '⏳ Mengupload...' : 'Upload Bukti Transfer'}
            </button>
          </form>

          {/* Info Footer */}
          <div style={styles.infoFooter}>
            <p>💡 Pastikan bukti transfer jelas dan nominal sesuai</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>💳 Pembayaran</h1>
          <p style={styles.subtitle}>Kelola pembayaran reservasi kost Anda</p>
        </div>
        
        <div style={styles.refreshInfo}>
          <span>🔄 Auto-refresh setiap 10 detik</span>
        </div>
      </div>

      {reservasiList.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <h2>Belum Ada Reservasi</h2>
          <p>Anda belum memiliki reservasi yang perlu dibayar.</p>
          <button
            onClick={() => router.push('/kost')}
            style={styles.browseBtn}
          >
            Cari Kost
          </button>
        </div>
      ) : (
        <div style={styles.reservasiGrid}>
          {reservasiList.map((reservasi) => {
            const paymentStatus = getPaymentStatus(reservasi);
            const latestPayment = reservasi.pembayaran?.[0];
            const isProcessing = processingCash === reservasi.id;

            return (
              <div key={reservasi.id} style={styles.card}>
                {/* Card Header */}
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.kostName}>
                      {reservasi.nama_kost || `Kost ID: ${reservasi.kost_id}`}
                    </h3>
                    {reservasi.alamat_kost && (
                      <p style={styles.kostAddress}>📍 {reservasi.alamat_kost}</p>
                    )}
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    background: paymentStatus.color
                  }}>
                    {paymentStatus.text}
                  </span>
                </div>

                {/* Card Body */}
                <div style={styles.cardBody}>
                  <div style={styles.infoRow}>
                    <span>Durasi:</span>
                    <strong>{reservasi.durasi_bulan} Bulan</strong>
                  </div>
                  <div style={styles.infoRow}>
                    <span>Total Harga:</span>
                    <strong style={styles.priceText}>
                      Rp {reservasi.total_harga.toLocaleString('id-ID')}
                    </strong>
                  </div>
                  <div style={styles.infoRow}>
                    <span>Tanggal Mulai:</span>
                    <strong>{new Date(reservasi.tanggal_mulai).toLocaleDateString('id-ID')}</strong>
                  </div>

                  {/* Payment Info */}
                  {latestPayment && (
                    <div style={styles.paymentInfo}>
                      <p><strong>Metode:</strong> {latestPayment.metode_pembayaran === 'transfer' ? 'Transfer Bank' : 'Tunai'}</p>
                      {latestPayment.status === 'rejected' && latestPayment.keterangan && (
                        <div style={styles.rejectionNote}>
                          <strong>Alasan Penolakan:</strong>
                          <p>{latestPayment.keterangan}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer - Action Buttons */}
                <div style={styles.cardFooter}>
                  {paymentStatus.status === 'unpaid' && (
                    <div style={styles.buttonGroup}>
                      <button
                        onClick={() => handleSelectPaymentMethod(reservasi, 'transfer')}
                        disabled={isProcessing}
                        style={{
                          ...styles.payBtn, 
                          ...styles.transferBtn,
                          opacity: isProcessing ? 0.5 : 1,
                          cursor: isProcessing ? 'not-allowed' : 'pointer'
                        }}
                      >
                        🏦 Transfer Bank
                      </button>
                      <button
                        onClick={() => handleSelectPaymentMethod(reservasi, 'cash')}
                        disabled={isProcessing}
                        style={{
                          ...styles.payBtn, 
                          ...styles.cashBtn,
                          opacity: isProcessing ? 0.5 : 1,
                          cursor: isProcessing ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        {isProcessing ? (
                          <>
                            <span style={styles.buttonSpinner}></span>
                            Memproses...
                          </>
                        ) : (
                          '💵 Bayar Tunai'
                        )}
                      </button>
                    </div>
                  )}

                  {paymentStatus.status === 'pending' && (
                    <div style={styles.pendingNote}>
                      ⏳ Menunggu verifikasi admin...
                    </div>
                  )}

                  {paymentStatus.status === 'verified' && (
                    <div style={styles.verifiedNote}>
                      ✅ Pembayaran terverifikasi
                    </div>
                  )}

                  {paymentStatus.status === 'rejected' && (
                    <div style={styles.buttonGroup}>
                      <button
                        onClick={() => handleSelectPaymentMethod(reservasi, 'transfer')}
                        style={{...styles.payBtn, ...styles.transferBtn}}
                      >
                        📤 Upload Ulang Bukti
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
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
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  refreshInfo: {
    padding: '0.75rem 1.25rem',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    fontSize: '0.9rem',
    color: '#666',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem',
    background: 'white',
    borderRadius: '15px',
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '1rem',
  },
  browseBtn: {
    marginTop: '1.5rem',
    padding: '1rem 2rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  reservasiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    background: 'white',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s',
  },
  cardHeader: {
    padding: '1.5rem',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
  },
  kostName: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.25rem',
  },
  kostAddress: {
    fontSize: '0.9rem',
    color: '#666',
  },
  statusBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  cardBody: {
    padding: '1.5rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
    color: '#666',
  },
  priceText: {
    color: '#10b981',
    fontSize: '1.1rem',
  },
  paymentInfo: {
    marginTop: '1rem',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '8px',
    fontSize: '0.9rem',
  },
  rejectionNote: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    background: '#fef2f2',
    borderRadius: '6px',
    color: '#991b1b',
  },
  cardFooter: {
    padding: '1.5rem',
    borderTop: '1px solid #e5e7eb',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
  },
  payBtn: {
    flex: 1,
    padding: '0.875rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  transferBtn: {
    background: '#2563eb',
    color: 'white',
  },
  cashBtn: {
    background: '#10b981',
    color: 'white',
  },
  pendingNote: {
    textAlign: 'center',
    padding: '1rem',
    background: '#fef3c7',
    borderRadius: '8px',
    color: '#92400e',
    fontWeight: 600,
  },
  verifiedNote: {
    textAlign: 'center',
    padding: '1rem',
    background: '#d1fae5',
    borderRadius: '8px',
    color: '#065f46',
    fontWeight: 600,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
  },
  modernModal: {
    position: 'relative',
    background: 'white',
    borderRadius: '20px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    animation: 'slideUp 0.3s ease-out',
  },
  modernCloseBtn: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'rgba(0,0,0,0.05)',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    zIndex: 10,
  },
  modernHeader: {
    textAlign: 'center',
    padding: '2.5rem 2rem 1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  iconCircle: {
    width: '64px',
    height: '64px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    color: 'white',
  },
  modernTitle: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  modernSubtitle: {
    fontSize: '0.95rem',
    opacity: 0.95,
    marginBottom: '0.25rem',
  },
  modernAccountName: {
    fontSize: '1rem',
    fontWeight: 600,
    opacity: 0.95,
  },
  infoBox: {
    margin: '1.5rem',
    padding: '1.25rem',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    borderRadius: '12px',
    border: '1px solid #bae6fd',
  },
  infoBoxRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    fontSize: '0.95rem',
    color: '#0369a1',
  },
  totalRow: {
    marginTop: '0.5rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #bae6fd',
    marginBottom: 0,
  },
  totalAmount: {
    fontSize: '1.25rem',
    color: '#0c4a6e',
  },
  modernForm: {
    padding: '1.5rem',
  },
  modernFormGroup: {
    marginBottom: '1.25rem',
  },
  modernLabel: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '0.5rem',
  },
  required: {
    color: '#ef4444',
  },
  modernInput: {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '1rem',
    transition: 'all 0.2s',
    outline: 'none',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    opacity: 0.5,
  },
  uploadArea: {
    display: 'block',
    width: '100%',
    padding: '1.5rem',
    border: '2px dashed #cbd5e1',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    background: '#f8fafc',
  },
  uploadPlaceholder: {
    textAlign: 'center',
    color: '#64748b',
  },
  uploadText: {
    display: 'block',
    fontSize: '0.95rem',
    marginTop: '0.75rem',
    fontWeight: 500,
    color: '#475569',
  },
  uploadSubtext: {
    display: 'block',
    fontSize: '0.8rem',
    marginTop: '0.25rem',
    color: '#94a3b8',
  },
  uploadSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: '#f0fdf4',
    padding: '0.5rem',
    borderRadius: '8px',
  },
  checkIcon: {
    fontSize: '2rem',
    color: '#16a34a',
  },
  fileName: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#166534',
  },
  fileSize: {
    fontSize: '0.8rem',
    color: '#15803d',
    opacity: 0.8,
  },
  uploadingStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: '#eff6ff',
    borderRadius: '10px',
    color: '#1e40af',
    fontSize: '0.9rem',
  },
  miniSpinner: {
    width: '20px',
    height: '20px',
    border: '3px solid #dbeafe',
    borderTop: '3px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  modernSubmitBtn: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
  infoFooter: {
    padding: '1rem 1.5rem 1.5rem',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#6b7280',
  },
  buttonSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};