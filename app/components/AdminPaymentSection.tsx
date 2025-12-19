// components/AdminPaymentSection.tsx
'use client';

import { useState, useEffect } from 'react';

interface Payment {
  id: string;
  userId: string;
  userName: string;
  kostName: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'rejected';
  buktiTransfer?: string;
  bookingDate: string;
  createdAt: string;
  duration: number; // dalam bulan
}

export default function AdminPaymentSection() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch data pembayaran dari API
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payments');
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update status pembayaran
  const updatePaymentStatus = async (paymentId: string, status: 'confirmed' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Update state lokal
        setPayments(prev =>
          prev.map(p => p.id === paymentId ? { ...p, status } : p)
        );
        setShowModal(false);
        alert(`Pembayaran berhasil ${status === 'confirmed' ? 'dikonfirmasi' : 'ditolak'}!`);
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Gagal mengupdate pembayaran');
    }
  };

  // Filter pembayaran
  const filteredPayments = payments.filter(p => 
    filter === 'all' ? true : p.status === filter
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">💰 Pembayaran Masuk</h2>
        
        {/* Filter Status */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semua ({payments.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pending ({payments.filter(p => p.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'confirmed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Dikonfirmasi ({payments.filter(p => p.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Ditolak ({payments.filter(p => p.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pembayaran...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Tidak ada pembayaran {filter !== 'all' ? filter : ''}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Penyewa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.userName}</div>
                    <div className="text-sm text-gray-500">ID: {payment.userId}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {payment.kostName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.duration} bulan
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status === 'pending' ? 'Menunggu' : payment.status === 'confirmed' ? 'Dikonfirmasi' : 'Ditolak'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detail Pembayaran */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Detail Pembayaran</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nama Penyewa</p>
                    <p className="font-semibold text-gray-900">{selectedPayment.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nama Kost</p>
                    <p className="font-semibold text-gray-900">{selectedPayment.kostName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Booking</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedPayment.bookingDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Durasi Sewa</p>
                    <p className="font-semibold text-gray-900">{selectedPayment.duration} bulan</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Metode Pembayaran</p>
                    <p className="font-semibold text-gray-900">{selectedPayment.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Pembayaran</p>
                    <p className="font-semibold text-green-600 text-lg">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                </div>

                {/* Bukti Transfer */}
                {selectedPayment.buktiTransfer && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Bukti Transfer</p>
                    <img
                      src={selectedPayment.buktiTransfer}
                      alt="Bukti Transfer"
                      className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500">Status:</p>
                  <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status === 'pending' ? 'Menunggu Konfirmasi' : selectedPayment.status === 'confirmed' ? 'Dikonfirmasi' : 'Ditolak'}
                  </span>
                </div>

                {/* Action Buttons - hanya tampil jika status pending */}
                {selectedPayment.status === 'pending' && (
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => updatePaymentStatus(selectedPayment.id, 'confirmed')}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      ✓ Konfirmasi Pembayaran
                    </button>
                    <button
                      onClick={() => updatePaymentStatus(selectedPayment.id, 'rejected')}
                      className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      ✗ Tolak Pembayaran
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}