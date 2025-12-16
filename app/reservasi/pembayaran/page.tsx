'use client';

import { useState } from 'react';

interface PaymentData {
  className: string;
  classPrice: number;
  senderName: string;
  email: string;
  phone: string;
  paymentMethod: string;
  bankName?: string;
  accountNumber?: string;
}

// Data kelas yang tersedia
const availableClasses = [
  { id: 1, name: 'Kelas Reguler', price: 500000, description: 'Kelas standar dengan fasilitas lengkap' },
  { id: 2, name: 'Kelas VIP', price: 1000000, description: 'Kelas premium dengan instruktur pribadi' },
  { id: 3, name: 'Kelas Grup', price: 750000, description: 'Kelas untuk 4-6 orang' },
  { id: 4, name: 'Kelas Private', price: 1500000, description: 'Kelas eksklusif one-on-one' },
];

const paymentMethods = {
  bank: [
    { id: 'bca', name: 'Bank BCA', account: '1234567890', accountName: 'PT Website Reservasi', logo: '🏦' },
    { id: 'mandiri', name: 'Bank Mandiri', account: '0987654321', accountName: 'PT Website Reservasi', logo: '🏦' },
    { id: 'bni', name: 'Bank BNI', account: '5556667778', accountName: 'PT Website Reservasi', logo: '🏦' },
    { id: 'bri', name: 'Bank BRI', account: '4443332221', accountName: 'PT Website Reservasi', logo: '🏦' },
  ],
  ewallet: [
    { id: 'gopay', name: 'GoPay', account: '081234567890', accountName: 'Website Reservasi', logo: '💳' },
    { id: 'ovo', name: 'OVO', account: '081234567890', accountName: 'Website Reservasi', logo: '💳' },
    { id: 'dana', name: 'DANA', account: '081234567890', accountName: 'Website Reservasi', logo: '💳' },
    { id: 'shopeepay', name: 'ShopeePay', account: '081234567890', accountName: 'Website Reservasi', logo: '💳' },
  ]
};

export default function PembayaranPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PaymentData>({
    className: '',
    classPrice: 0,
    senderName: '',
    email: '',
    phone: '',
    paymentMethod: '',
    bankName: '',
    accountNumber: ''
  });
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'bank' | 'ewallet' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClass = availableClasses.find(cls => cls.name === e.target.value);
    setFormData(prev => ({
      ...prev,
      className: e.target.value,
      classPrice: selectedClass?.price || 0
    }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSelectPayment = (type: 'bank' | 'ewallet', methodId: string) => {
    const method = paymentMethods[type].find(m => m.id === methodId);
    if (method) {
      setSelectedMethod(methodId);
      setSelectedType(type);
    }
  };

  const handleConfirmPayment = () => {
    if (selectedMethod && selectedType) {
      const method = paymentMethods[selectedType].find(m => m.id === selectedMethod);
      if (method) {
        setFormData(prev => ({
          ...prev,
          paymentMethod: method.name,
          bankName: method.name,
          accountNumber: method.account
        }));
        setStep(3);
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      console.log('Data pembayaran:', formData);
    }, 2000);
  };

  const selectedMethodData = selectedType && selectedMethod 
    ? paymentMethods[selectedType].find(m => m.id === selectedMethod)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pembayaran Reservasi
          </h1>
          <p className="text-gray-600">
            Lengkapi form di bawah untuk menyelesaikan pembayaran Anda
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-gray-100 px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step {step} dari 3</span>
              <span className="text-sm text-gray-600">
                {step === 1 && 'Data Peserta'}
                {step === 2 && 'Metode Pembayaran'}
                {step === 3 && 'Konfirmasi'}
              </span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-6">
            {/* Step 1: Form Data Peserta */}
            {step === 1 && !isSuccess && (
              <form onSubmit={handleNextStep} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kelas *</label>
                  <select
                    name="className"
                    required
                    value={formData.className}
                    onChange={handleClassChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {availableClasses.map(cls => (
                      <option key={cls.id} value={cls.name}>
                        {cls.name} - {formatCurrency(cls.price)}
                      </option>
                    ))}
                  </select>
                  {formData.className && (
                    <p className="mt-2 text-sm text-gray-600">
                      {availableClasses.find(c => c.name === formData.className)?.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
                  <input
                    type="text"
                    name="senderName"
                    required
                    value={formData.senderName}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama sesuai rekening"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {formData.classPrice > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total Pembayaran:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(formData.classPrice)}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
                >
                  Lanjut ke Pembayaran
                </button>
              </form>
            )}

            {/* Step 2: Pilih Metode Pembayaran */}
            {step === 2 && !isSuccess && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Pilih Metode Pembayaran</h3>
                  <p className="text-sm text-gray-600">
                    Total yang harus dibayar: <span className="font-bold text-blue-600">{formatCurrency(formData.classPrice)}</span>
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Transfer Bank */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="text-xl mr-2">🏦</span>Transfer Bank
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {paymentMethods.bank.map(method => (
                        <button
                          key={method.id}
                          onClick={() => handleSelectPayment('bank', method.id)}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            selectedMethod === method.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-800">{method.name}</p>
                              <p className="text-xs text-gray-500 mt-1">Transfer Bank</p>
                            </div>
                            {selectedMethod === method.id && (
                              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* E-Wallet */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="text-xl mr-2">💳</span>E-Wallet / QRIS
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {paymentMethods.ewallet.map(method => (
                        <button
                          key={method.id}
                          onClick={() => handleSelectPayment('ewallet', method.id)}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            selectedMethod === method.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-800">{method.name}</p>
                              <p className="text-xs text-gray-500 mt-1">E-Wallet</p>
                            </div>
                            {selectedMethod === method.id && (
                              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedMethodData && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Informasi Pembayaran
                      </h4>
                      <div className="space-y-3 bg-white p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-gray-600">Metode:</span>
                          <span className="font-semibold text-gray-800 text-right">{selectedMethodData.name}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-gray-600">
                            {selectedType === 'bank' ? 'No. Rekening:' : 'No. Telepon:'}
                          </span>
                          <span className="font-mono font-semibold text-gray-800 text-right">
                            {selectedMethodData.account}
                          </span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-gray-600">Atas Nama:</span>
                          <span className="font-semibold text-gray-800 text-right">
                            {selectedMethodData.accountName}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleBack}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition duration-200"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={!selectedMethod}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition duration-200 ${
                      selectedMethod ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Konfirmasi Metode
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Konfirmasi */}
            {step === 3 && !isSuccess && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Konfirmasi Pembayaran</h3>
                  <p className="text-sm text-gray-600">Periksa kembali detail pembayaran Anda</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="pb-4 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3">Informasi Kelas</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Kelas:</span>
                        <span className="font-semibold text-gray-800">{formData.className}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Harga:</span>
                        <span className="font-semibold text-blue-600">{formatCurrency(formData.classPrice)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pb-4 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3">Data Peserta</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Nama:</span>
                        <span className="font-semibold text-gray-800">{formData.senderName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="font-semibold text-gray-800 text-right break-all">{formData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Telepon:</span>
                        <span className="font-semibold text-gray-800">{formData.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pb-4 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3">Metode Pembayaran</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Metode:</span>
                        <span className="font-semibold text-gray-800">{formData.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Nomor:</span>
                        <span className="font-mono font-semibold text-gray-800">{formData.accountNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Total:</span>
                      <span className="text-2xl font-bold text-blue-600">{formatCurrency(formData.classPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center"
                  >
                    {isSubmitting ? 'Memproses...' : 'Konfirmasi & Bayar'}
                  </button>
                </div>
              </div>
            )}

            {/* Success Page */}
            {isSuccess && (
              <div className="text-center space-y-6 py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Konfirmasi Berhasil! 🎉</h3>
                  <p className="text-gray-600">Pesanan Anda telah kami terima</p>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg max-w-md mx-auto">
                  <h4 className="font-semibold text-gray-800 mb-4">Detail Pesanan</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kelas:</span>
                      <span className="font-semibold text-gray-800">{formData.className}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nama:</span>
                      <span className="font-semibold text-gray-800">{formData.senderName}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-bold text-blue-600">{formatCurrency(formData.classPrice)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Kembali ke Beranda
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}