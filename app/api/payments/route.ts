import { NextResponse } from 'next/server';

// Data dummy untuk testing - ganti dengan database sebenarnya
const dummyPayments = [
  {
    id: 'PAY001',
    reservasiId: 'RES001',
    namaKost: 'Kost Qonitaat A',
    namaPenyewa: 'M. Rizky Ramadhan',
    jumlah: 1500000,
    metodePembayaran: 'Transfer Bank BCA',
    status: 'success',
    tanggalPembayaran: '2025-01-10T10:30:00',
    buktiPembayaran: '/uploads/bukti-001.jpg'
  },
  {
    id: 'PAY002',
    reservasiId: 'RES002',
    namaKost: 'Kost Qonitaat B',
    namaPenyewa: 'Ahmad Fauzi',
    jumlah: 1200000,
    metodePembayaran: 'Transfer Bank Mandiri',
    status: 'pending',
    tanggalPembayaran: '2025-01-15T14:20:00',
    buktiPembayaran: '/uploads/bukti-002.jpg'
  },
  {
    id: 'PAY003',
    reservasiId: 'RES003',
    namaKost: 'Kost Qonitaat C',
    namaPenyewa: 'Siti Nurhaliza',
    jumlah: 1800000,
    metodePembayaran: 'E-Wallet (GoPay)',
    status: 'success',
    tanggalPembayaran: '2025-01-12T09:15:00'
  },
  {
    id: 'PAY004',
    reservasiId: 'RES004',
    namaKost: 'Kost Qonitaat D',
    namaPenyewa: 'Budi Santoso',
    jumlah: 1000000,
    metodePembayaran: 'Transfer Bank BRI',
    status: 'failed',
    tanggalPembayaran: '2025-01-08T16:45:00'
  }
];

export async function GET() {
  try {
    // Simulasi delay untuk fetching data
    await new Promise(resolve => setTimeout(resolve, 500));

    // TODO: Ganti dengan query database sebenarnya
    // Contoh dengan Prisma:
    // const payments = await prisma.payment.findMany({
    //   include: {
    //     reservasi: true,
    //     user: true
    //   },
    //   orderBy: {
    //     tanggalPembayaran: 'desc'
    //   }
    // });

    return NextResponse.json(dummyPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pembayaran' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // TODO: Validasi data dan simpan ke database
    // const newPayment = await prisma.payment.create({
    //   data: {
    //     reservasiId: body.reservasiId,
    //     jumlah: body.jumlah,
    //     metodePembayaran: body.metodePembayaran,
    //     status: 'pending',
    //     tanggalPembayaran: new Date()
    //   }
    // });

    return NextResponse.json(
      { message: 'Pembayaran berhasil dibuat', data: body },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Gagal membuat pembayaran' },
      { status: 500 }
    );
  }
}