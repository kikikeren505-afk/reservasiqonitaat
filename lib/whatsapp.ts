// Lokasi: lib/whatsapp.ts
// Helper function untuk kirim WhatsApp via Fonnte

export interface WhatsAppMessage {
  to: string; // Nomor tujuan (format: 628xxx)
  message: string; // Isi pesan
}

export async function sendWhatsApp({ to, message }: WhatsAppMessage) {
  try {
    const apiToken = process.env.FONNTE_API_TOKEN;
    
    if (!apiToken) {
      console.error('❌ FONNTE_API_TOKEN not found in .env');
      return { success: false, error: 'API Token not configured' };
    }

    console.log('📤 Sending WhatsApp to:', to);

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: to,
        message: message,
        countryCode: '62', // Indonesia
      }),
    });

    const result = await response.json();

    if (response.ok && result.status) {
      console.log('✅ WhatsApp sent successfully:', result);
      return { success: true, data: result };
    } else {
      console.error('❌ Failed to send WhatsApp:', result);
      return { success: false, error: result.reason || 'Failed to send' };
    }

  } catch (error: any) {
    console.error('❌ Error sending WhatsApp:', error);
    return { success: false, error: error.message };
  }
}

// Helper: Kirim notifikasi reservasi baru ke admin
export async function notifyAdminNewReservation(data: {
  customerName: string;
  kostName: string;
  tanggalMulai: string;
  durasi: number;
  totalHarga: number;
}) {
  const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || '6282279540398';
  
  const message = `
🔔 *RESERVASI BARU*

👤 *Customer:* ${data.customerName}
🏠 *Kost:* ${data.kostName}
📅 *Tanggal Mulai:* ${new Date(data.tanggalMulai).toLocaleDateString('id-ID')}
⏱️ *Durasi:* ${data.durasi} bulan
💰 *Total:* Rp ${data.totalHarga.toLocaleString('id-ID')}

Status: ⏳ *MENUNGGU KONFIRMASI*

Silakan cek dashboard admin untuk konfirmasi.
🔗 ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/reservasi
  `.trim();

  return await sendWhatsApp({
    to: adminPhone,
    message: message,
  });
}

// Helper: Kirim notifikasi pembayaran baru ke admin
export async function notifyAdminNewPayment(data: {
  customerName: string;
  kostName: string;
  amount: number;
  paymentMethod: string;
}) {
  const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || '6282279540398';
  
  const message = `
💰 *PEMBAYARAN BARU*

👤 *Customer:* ${data.customerName}
🏠 *Kost:* ${data.kostName}
💳 *Metode:* ${data.paymentMethod}
💵 *Jumlah:* Rp ${data.amount.toLocaleString('id-ID')}

Status: ⏳ *MENUNGGU VERIFIKASI*

Silakan cek bukti transfer dan konfirmasi pembayaran.
🔗 ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/payments
  `.trim();

  return await sendWhatsApp({
    to: adminPhone,
    message: message,
  });
}

// Helper: Kirim konfirmasi ke customer setelah admin approve
export async function notifyCustomerPaymentApproved(data: {
  customerPhone: string;
  customerName: string;
  kostName: string;
  tanggalMulai: string;
}) {
  const message = `
✅ *PEMBAYARAN DIKONFIRMASI*

Halo ${data.customerName},

Pembayaran Anda untuk *${data.kostName}* telah dikonfirmasi! 🎉

📅 *Check-in:* ${new Date(data.tanggalMulai).toLocaleDateString('id-ID')}

Terima kasih telah mempercayai Kost Pondok Qonitaat.

Untuk informasi lebih lanjut, hubungi:
📞 WA: 083878515387
  `.trim();

  return await sendWhatsApp({
    to: data.customerPhone,
    message: message,
  });
}