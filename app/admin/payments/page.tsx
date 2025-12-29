// app/admin/payments/page.tsx - WITH IMAGE PREVIEW

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Payment {
  id: number;
  reservasi_id: number;
  jumlah: number;
  metode_pembayaran: string;
  status: 'pending' | 'verified' | 'rejected';
  bukti_pembayaran?: string;
  nama_pengirim?: string;
  nama_rekening?: string;
  tanggal_transfer?: string;
  keterangan?: string;
  created_at: string;
  user_nama?: string;
  kost_nama?: string;
  reservasi_durasi?: number;
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [actionType, setActionType] = useState<'verify' | 'reject'>('verify');
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAdminAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPayments();
      const interval = setInterval(() => {
        fetchPayments();
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    let filtered = payments;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.user_nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.kost_nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toString().includes(searchQuery)
      );
    }
    setFilteredPayments(filtered);
  }, [payments, filterStatus, searchQuery]);

  const checkAdminAuth = () => {
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin' && parsedUser.level_name !== 'Admin' && parsedUser.level_id !== 1) {
        alert('❌ Akses ditolak! Anda bukan admin.');
        router.push('/dashboard');
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payments', {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const result = await response.json();
      if (result.success && result.data) {
        setPayments(result.data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewImage = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowImageModal(true);
  };

  const handleVerifyClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setActionType('verify');
    setRejectReason('');
    setShowModal(true);
  };

  const handleRejectClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setActionType('reject');
    setRejectReason('');
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedPayment) return;
    if (actionType === 'reject' && !rejectReason.trim()) {
      alert('Mohon masukkan alasan penolakan');
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: selectedPayment.id,
          status: actionType === 'verify' ? 'verified' : 'rejected',
          keterangan: actionType === 'reject' ? rejectReason : 'Pembayaran diverifikasi'
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert(
          actionType === 'verify' 
            ? '✅ Pembayaran berhasil diverifikasi!' 
            : '❌ Pembayaran ditolak'
        );
        fetchPayments();
        setShowModal(false);
        setSelectedPayment(null);
      } else {
        throw new Error(data.message || 'Gagal memproses pembayaran');
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      alert('❌ Gagal memproses: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    router.push('/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    verified: payments.filter(p => p.status === 'verified').length,
    rejected: payments.filter(p => p.status === 'rejected').length
  };

  if (loading && payments.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Memuat data pembayaran...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.dashboardContainer}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.sidebarTitle}>Admin Panel</h2>
          </div>
          <nav style={styles.sidebarNav}>
            <a href="/admin" style={styles.navLink}>🏠 Dashboard</a>
            <a href="/admin/kost" style={styles.navLink}>🏘️ Kelola Kost</a>
            <a href="/admin/reservasi" style={styles.navLink}>📋 Kelola Reservasi</a>
            <a href="/admin/users" style={styles.navLink}>👥 Kelola User</a>
            <a href="/admin/payments" style={{...styles.navLink, ...styles.navLinkActive}}>💰 Pembayaran</a>
            <button onClick={handleLogout} style={styles.logoutBtn}>🚪 Logout</button>
          </nav>
        </aside>

        <main style={styles.mainContent}>
          <div style={styles.welcomeCard}>
            <h1 style={styles.welcomeTitle}>💳 Verifikasi Pembayaran</h1>
            <p style={styles.welcomeText}>Kelola dan verifikasi pembayaran reservasi kost</p>
            <div style={styles.autoRefreshBadge}>🔄 Auto-refresh setiap 15 detik</div>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, background: '#fed7aa'}}>📊</div>
              <div>
                <p style={styles.statLabel}>Total Pembayaran</p>
                <h3 style={styles.statValue}>{stats.total}</h3>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, background: '#fef3c7'}}>⏳</div>
              <div>
                <p style={styles.statLabel}>Menunggu Verifikasi</p>
                <h3 style={styles.statValue}>{stats.pending}</h3>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, background: '#d1fae5'}}>✅</div>
              <div>
                <p style={styles.statLabel}>Terverifikasi</p>
                <h3 style={styles.statValue}>{stats.verified}</h3>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, background: '#fecaca'}}>❌</div>
              <div>
                <p style={styles.statLabel}>Ditolak</p>
                <h3 style={styles.statValue}>{stats.rejected}</h3>
              </div>
            </div>
          </div>

          <div style={styles.filterBar}>
            <div style={styles.searchBox}>
              <input
                type="text"
                placeholder="🔍 Cari pembayaran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <div style={styles.filterButtons}>
              {(['all', 'pending', 'verified', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  style={{
                    ...styles.filterBtn,
                    ...(filterStatus === status ? styles.filterBtnActive : {})
                  }}
                >
                  {status === 'all' ? 'Semua' :
                   status === 'pending' ? 'Pending' :
                   status === 'verified' ? 'Verified' : 'Rejected'}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.tableContainer}>
            {filteredPayments.length === 0 ? (
              <div style={styles.emptyState}>
                <p>Tidak ada pembayaran yang ditemukan</p>
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Penyewa</th>
                    <th style={styles.th}>Kost</th>
                    <th style={styles.th}>Jumlah</th>
                    <th style={styles.th}>Metode</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Tanggal</th>
                    <th style={styles.th}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} style={styles.tableRow}>
                      <td style={styles.td}>#{payment.id}</td>
                      <td style={styles.td}>
                        <strong>{payment.user_nama || payment.nama_pengirim || 'N/A'}</strong>
                      </td>
                      <td style={styles.td}>
                        <div>
                          <strong>{payment.kost_nama || 'N/A'}</strong>
                          {payment.reservasi_durasi && (
                            <div style={styles.smallText}>{payment.reservasi_durasi} bulan</div>
                          )}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <strong style={styles.priceText}>{formatCurrency(payment.jumlah)}</strong>
                      </td>
                      <td style={styles.td}>
                        {payment.metode_pembayaran === 'transfer' ? '🏦 Transfer' : '💵 Cash'}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: payment.status === 'pending' ? '#fef3c7' :
                                     payment.status === 'verified' ? '#d1fae5' : '#fecaca',
                          color: payment.status === 'pending' ? '#92400e' :
                                 payment.status === 'verified' ? '#065f46' : '#991b1b'
                        }}>
                          {payment.status === 'pending' ? '⏳ Pending' :
                           payment.status === 'verified' ? '✅ Verified' : '❌ Rejected'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <small>{formatDate(payment.created_at)}</small>
                      </td>
                      <td style={styles.td}>
                        {payment.status === 'pending' ? (
                          <div style={styles.actionButtons}>
                            <button
                              onClick={() => handleVerifyClick(payment)}
                              style={{...styles.actionBtn, ...styles.verifyBtn}}
                              title="Verifikasi"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleRejectClick(payment)}
                              style={{...styles.actionBtn, ...styles.rejectBtn}}
                              title="Tolak"
                            >
                              ✕
                            </button>
                            {payment.bukti_pembayaran && payment.metode_pembayaran === 'transfer' && (
                              <button
                                onClick={() => handleViewImage(payment)}
                                style={{...styles.actionBtn, ...styles.viewBtn}}
                                title="Lihat Bukti"
                              >
                                👁️
                              </button>
                            )}
                          </div>
                        ) : (
                          <span style={styles.noAction}>
                            {payment.status === 'verified' ? 'Selesai' : 'Ditolak'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* Image Preview Modal */}
      {showImageModal && selectedPayment && selectedPayment.bukti_pembayaran && (
        <div style={styles.modalOverlay} onClick={() => setShowImageModal(false)}>
          <div style={styles.imageModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.imageModalHeader}>
              <h3>Bukti Pembayaran #{selectedPayment.id}</h3>
              <button onClick={() => setShowImageModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.imageModalBody}>
              <img 
                src={selectedPayment.bukti_pembayaran} 
                alt="Bukti Pembayaran"
                style={styles.previewImage}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML += '<p style="color: #ef4444; text-align: center;">❌ Gagal memuat gambar</p>';
                }}
              />
              <div style={styles.imageInfo}>
                <p><strong>Pengirim:</strong> {selectedPayment.nama_pengirim || 'N/A'}</p>
                <p><strong>Tanggal Transfer:</strong> {selectedPayment.tanggal_transfer || 'N/A'}</p>
                <p><strong>Jumlah:</strong> {formatCurrency(selectedPayment.jumlah)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && selectedPayment && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>
                {actionType === 'verify' 
                  ? '✅ Verifikasi Pembayaran' 
                  : '❌ Tolak Pembayaran'
                }
              </h3>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.paymentDetail}>
                <p><strong>Penyewa:</strong> {selectedPayment.user_nama || selectedPayment.nama_pengirim}</p>
                <p><strong>Kost:</strong> {selectedPayment.kost_nama}</p>
                <p><strong>Jumlah:</strong> {formatCurrency(selectedPayment.jumlah)}</p>
                <p><strong>Metode:</strong> {selectedPayment.metode_pembayaran}</p>
                {selectedPayment.nama_pengirim && (
                  <p><strong>Pengirim:</strong> {selectedPayment.nama_pengirim}</p>
                )}
              </div>

              {actionType === 'reject' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Alasan Penolakan *</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={styles.textarea}
                    placeholder="Masukkan alasan penolakan pembayaran..."
                    rows={4}
                    required
                  />
                </div>
              )}

              {actionType === 'verify' && (
                <div style={styles.confirmMessage}>
                  <p>Apakah Anda yakin ingin memverifikasi pembayaran ini?</p>
                  <p style={styles.warning}>⚠️ Tindakan ini tidak dapat dibatalkan!</p>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowModal(false)}
                style={styles.cancelBtn}
                disabled={processing}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAction}
                style={{
                  ...styles.confirmBtn,
                  background: actionType === 'verify' ? '#10b981' : '#ef4444',
                  opacity: processing ? 0.6 : 1
                }}
                disabled={processing}
              >
                {processing ? '⏳ Memproses...' : 
                 actionType === 'verify' ? '✓ Verifikasi' : '✕ Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { minHeight: '100vh', background: '#f5f5f5' },
  loadingContainer: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: '1rem' },
  spinner: { width: '50px', height: '50px', border: '5px solid #e5e7eb', borderTop: '5px solid #dc2626', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  dashboardContainer: { display: 'flex', minHeight: '100vh' },
  sidebar: { width: '280px', background: 'white', borderRight: '1px solid #e5e7eb', padding: '2rem 0', position: 'sticky', top: 0, height: '100vh' },
  sidebarHeader: { padding: '0 1.5rem', marginBottom: '2rem' },
  sidebarTitle: { fontSize: '1.5rem', color: '#dc2626', fontWeight: 'bold' },
  sidebarNav: { display: 'flex', flexDirection: 'column' },
  navLink: { padding: '1rem 1.5rem', color: '#666', textDecoration: 'none', transition: 'all 0.3s', borderLeft: '3px solid transparent', cursor: 'pointer' },
  navLinkActive: { background: '#fef2f2', color: '#dc2626', borderLeftColor: '#dc2626', fontWeight: 600 },
  logoutBtn: { margin: '1rem 1.5rem', padding: '0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' },
  mainContent: { flex: 1, padding: '2rem', overflowY: 'auto' },
  welcomeCard: { background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', color: 'white', padding: '2rem', borderRadius: '15px', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)', position: 'relative' },
  welcomeTitle: { fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 'bold' },
  welcomeText: { fontSize: '1rem', opacity: 0.9 },
  autoRefreshBadge: { position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255, 255, 255, 0.2)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  statCard: { background: 'white', padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  statIcon: { fontSize: '2.5rem', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' },
  statLabel: { color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' },
  statValue: { fontSize: '2rem', fontWeight: 'bold', color: '#333', margin: 0 },
  filterBar: { background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  searchBox: { flex: 1, minWidth: '250px' },
  searchInput: { width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem' },
  filterButtons: { display: 'flex', gap: '0.5rem' },
  filterBtn: { padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' },
  filterBtnActive: { background: '#dc2626', color: 'white', borderColor: '#dc2626' },
  tableContainer: { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { background: '#f9fafb', borderBottom: '2px solid #e5e7eb' },
  th: { padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#333', fontSize: '0.9rem' },
  tableRow: { borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s' },
  td: { padding: '1rem', fontSize: '0.9rem', color: '#666' },
  smallText: { color: '#9ca3af', fontSize: '0.85rem' },
  priceText: { color: '#10b981', fontSize: '1.1rem' },
  badge: { padding: '0.375rem 0.75rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-block' },
  actionButtons: { display: 'flex', gap: '0.5rem' },
  actionBtn: { width: '36px', height: '36px', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  verifyBtn: { background: '#10b981', color: 'white' },
  rejectBtn: { background: '#ef4444', color: 'white' },
  viewBtn: { background: '#3b82f6', color: 'white' },
  noAction: { color: '#9ca3af', fontSize: '0.85rem' },
  emptyState: { padding: '3rem', textAlign: 'center', color: '#666' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '2rem' },
  modal: { background: 'white', borderRadius: '15px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto' },
  imageModal: { background: 'white', borderRadius: '15px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #e5e7eb' },
  imageModalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' },
  modalBody: { padding: '1.5rem' },
  imageModalBody: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  previewImage: { width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e5e7eb' },
  imageInfo: { padding: '1rem', background: '#f9fafb', borderRadius: '8px' },
  paymentDetail: { background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontWeight: 600, color: '#333' },
  textarea: { padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' },
  confirmMessage: { padding: '1rem', background: '#eff6ff', borderRadius: '8px' },
  warning: { color: '#f59e0b', fontWeight: 600, marginTop: '0.5rem' },
  modalFooter: { display: 'flex', gap: '1rem', padding: '1.5rem', borderTop: '1px solid #e5e7eb' },
  cancelBtn: { flex: 1, padding: '0.875rem', background: '#e5e7eb', color: '#333', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
  confirmBtn: { flex: 1, padding: '0.875rem', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
};