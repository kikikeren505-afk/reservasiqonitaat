/* ================================
   DATABASE
================================ */
CREATE DATABASE IF NOT EXISTS kost_qonitaat;
USE kost_qonitaat;

/* ================================
   TABLE: levels
================================ */
CREATE TABLE IF NOT EXISTS levels (
  level_id INT AUTO_INCREMENT PRIMARY KEY,
  nama_level VARCHAR(50) NOT NULL UNIQUE
);

/* ================================
   TABLE: users
================================ */
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  level_id INT NOT NULL,
  password VARCHAR(255) NOT NULL,
  alamat TEXT NOT NULL,
  no_hp VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_users_level
    FOREIGN KEY (level_id) REFERENCES levels(level_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  UNIQUE KEY uk_users_nama (nama),
  UNIQUE KEY uk_users_no_hp (no_hp)
);

/* ================================
   TABLE: kost
================================ */
CREATE TABLE IF NOT EXISTS kost (
  kost_id INT AUTO_INCREMENT PRIMARY KEY,
  nama_kost VARCHAR(100) NOT NULL,
  alamat_kost TEXT NOT NULL,
  deskripsi TEXT,
  status ENUM('tersedia', 'penuh') DEFAULT 'tersedia',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* ================================
   TABLE: kategori_kamar
================================ */
CREATE TABLE IF NOT EXISTS kategori_kamar (
  kategori_id INT AUTO_INCREMENT PRIMARY KEY,
  kost_id INT NOT NULL,
  harga DECIMAL(10,2) NOT NULL,
  ukuran_kamar VARCHAR(50) NOT NULL,
  fasilitas TEXT,

  CONSTRAINT fk_kategori_kost
    FOREIGN KEY (kost_id) REFERENCES kost(kost_id)
    ON DELETE CASCADE
);

/* ================================
   TABLE: transaksi
================================ */
CREATE TABLE IF NOT EXISTS transaksi (
  transaksi_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  kategori_id INT NOT NULL,
  tanggal_mulai DATE NOT NULL,
  status ENUM('pending','aktif','selesai','dibatalkan') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_transaksi_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_transaksi_kategori
    FOREIGN KEY (kategori_id) REFERENCES kategori_kamar(kategori_id)
    ON DELETE CASCADE
);

/* ================================
   TABLE: payment_methods
   Menyimpan metode pembayaran yang tersedia
================================ */
CREATE TABLE IF NOT EXISTS payment_methods (
  method_id INT AUTO_INCREMENT PRIMARY KEY,
  method_type ENUM('bank', 'qris', 'ewallet') NOT NULL,
  method_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(100),
  account_name VARCHAR(100),
  phone_number VARCHAR(20),
  qr_code_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

/* ================================
   TABLE: payments
   Menyimpan data pembayaran user
================================ */
CREATE TABLE IF NOT EXISTS payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  transaksi_id INT,
  invoice_no VARCHAR(50) UNIQUE NOT NULL,
  period VARCHAR(50) NOT NULL,
  month_year VARCHAR(20) NOT NULL,
  payment_date DATE,
  due_date DATE,
  rent_amount DECIMAL(10,2) NOT NULL,
  electricity_amount DECIMAL(10,2) DEFAULT 0,
  water_amount DECIMAL(10,2) DEFAULT 0,
  other_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  status ENUM('pending', 'success', 'failed', 'expired') DEFAULT 'pending',
  proof_image VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  confirmed_by INT,
  confirmed_at TIMESTAMP NULL,

  CONSTRAINT fk_payments_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_payments_transaksi
    FOREIGN KEY (transaksi_id) REFERENCES transaksi(transaksi_id)
    ON DELETE SET NULL,

  CONSTRAINT fk_payments_confirmed_by
    FOREIGN KEY (confirmed_by) REFERENCES users(user_id)
    ON DELETE SET NULL
);

/* ================================
   TABLE: payment_reminders
   Menyimpan reminder pembayaran untuk user
================================ */
CREATE TABLE IF NOT EXISTS payment_reminders (
  reminder_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  payment_id INT,
  reminder_date DATE NOT NULL,
  message TEXT,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_reminders_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_reminders_payment
    FOREIGN KEY (payment_id) REFERENCES payments(payment_id)
    ON DELETE CASCADE
);

/* ================================
   DATA AWAL
================================ */
INSERT INTO levels (nama_level) VALUES
('Admin'),
('User');

/* Password: admin123 (bcrypt valid contoh) */
INSERT INTO users (nama, level_id, password, alamat, no_hp) VALUES
(
  'Admin',
  1,
  '$2b$10$CwTycUXWue0Thq9StjUM0uJ8QHk9J6G7ZKkJd7FjQ4Z1F6z5FqW1e',
  'Medan',
  '081234567890'
);

/* ================================
   DATA KOST
================================ */
INSERT INTO kost (nama_kost, alamat_kost, deskripsi) VALUES
('Kost Pondok Qonitaat Putra', 'Jl. Setia Budi No. 123, Medan', 'Kost khusus pria'),
('Kost Pondok Qonitaat Putri', 'Jl. Gatot Subroto No. 456, Medan', 'Kost khusus wanita'),
('Kost Pondok Qonitaat Campur', 'Jl. Sisingamangaraja No. 789, Medan', 'Kost campur');

/* ================================
   DATA KATEGORI KAMAR
================================ */
INSERT INTO kategori_kamar (kost_id, harga, ukuran_kamar, fasilitas) VALUES
(1, 800000, '3x3', 'Kasur, Lemari, WiFi'),
(1, 1200000, '3x4', 'AC, WiFi, KM Dalam'),
(2, 900000, '3x3', 'Kasur, Lemari, WiFi'),
(3, 850000, '3x3', 'Kasur, Lemari, WiFi');

/* ================================
   DATA PAYMENT METHODS
================================ */
INSERT INTO payment_methods (method_type, method_name, account_number, account_name) VALUES
('bank', 'Transfer Bank BCA', '1234567890', 'Kost Pondok Qonitaat'),
('bank', 'Transfer Bank Mandiri', '0987654321', 'Kost Pondok Qonitaat'),
('bank', 'Transfer Bank BRI', '5678901234', 'Kost Pondok Qonitaat'),
('qris', 'QRIS', NULL, 'Kost Pondok Qonitaat'),
('ewallet', 'E-Wallet (OVO/Dana/GoPay)', NULL, 'Kost Pondok Qonitaat');

-- Update phone number untuk e-wallet
UPDATE payment_methods 
SET phone_number = '081234567890' 
WHERE method_type = 'ewallet';

/* ================================
   INDEXES
================================ */
CREATE INDEX idx_users_level ON users(level_id);
CREATE INDEX idx_kost_status ON kost(status);
CREATE INDEX idx_kategori_kost ON kategori_kamar(kost_id);
CREATE INDEX idx_transaksi_user ON transaksi(user_id);
CREATE INDEX idx_transaksi_status ON transaksi(status);

-- Payment indexes
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_invoice ON payments(invoice_no);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_transaksi ON payments(transaksi_id);
CREATE INDEX idx_reminders_user ON payment_reminders(user_id);
CREATE INDEX idx_reminders_date ON payment_reminders(reminder_date);

/* ================================
   VIEWS - Untuk kemudahan query
================================ */

-- View untuk melihat pembayaran dengan detail user
CREATE OR REPLACE VIEW v_payment_details AS
SELECT 
  p.payment_id,
  p.invoice_no,
  p.period,
  p.month_year,
  p.payment_date,
  p.due_date,
  p.total_amount,
  p.payment_method,
  p.status,
  p.proof_image,
  u.user_id,
  u.nama AS user_nama,
  u.no_hp AS user_hp,
  u.alamat AS user_alamat,
  t.transaksi_id,
  k.nama_kost,
  kk.ukuran_kamar,
  p.created_at
FROM payments p
JOIN users u ON p.user_id = u.user_id
LEFT JOIN transaksi t ON p.transaksi_id = t.transaksi_id
LEFT JOIN kategori_kamar kk ON t.kategori_id = kk.kategori_id
LEFT JOIN kost k ON kk.kost_id = k.kost_id
ORDER BY p.created_at DESC;

-- View untuk statistik pembayaran per user
CREATE OR REPLACE VIEW v_payment_statistics AS
SELECT 
  u.user_id,
  u.nama,
  COUNT(p.payment_id) AS total_payments,
  SUM(CASE WHEN p.status = 'success' THEN 1 ELSE 0 END) AS success_payments,
  SUM(CASE WHEN p.status = 'pending' THEN 1 ELSE 0 END) AS pending_payments,
  SUM(CASE WHEN p.status = 'success' THEN p.total_amount ELSE 0 END) AS total_paid,
  MAX(p.payment_date) AS last_payment_date
FROM users u
LEFT JOIN payments p ON u.user_id = p.user_id
WHERE u.level_id = 2
GROUP BY u.user_id, u.nama;

/* ================================
   STORED PROCEDURES
================================ */

-- Procedure untuk generate invoice number otomatis
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS generate_invoice_number(
  OUT new_invoice VARCHAR(50)
)
BEGIN
  DECLARE year_str VARCHAR(4);
  DECLARE month_str VARCHAR(2);
  DECLARE sequence INT;
  
  SET year_str = YEAR(CURDATE());
  SET month_str = LPAD(MONTH(CURDATE()), 2, '0');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_no, -4) AS UNSIGNED)), 0) + 1
  INTO sequence
  FROM payments
  WHERE invoice_no LIKE CONCAT('INV/', year_str, '/', month_str, '/%');
  
  SET new_invoice = CONCAT('INV/', year_str, '/', month_str, '/', LPAD(sequence, 4, '0'));
END//

-- Procedure untuk konfirmasi pembayaran oleh admin
CREATE PROCEDURE IF NOT EXISTS confirm_payment(
  IN p_payment_id INT,
  IN p_admin_id INT,
  IN p_status VARCHAR(20)
)
BEGIN
  UPDATE payments
  SET 
    status = p_status,
    confirmed_by = p_admin_id,
    confirmed_at = NOW()
  WHERE payment_id = p_payment_id;
  
  -- Update status transaksi jika pembayaran sukses
  IF p_status = 'success' THEN
    UPDATE transaksi t
    JOIN payments p ON t.transaksi_id = p.transaksi_id
    SET t.status = 'aktif'
    WHERE p.payment_id = p_payment_id AND t.status = 'pending';
  END IF;
END//

DELIMITER ;

/* ================================
   TRIGGERS
================================ */

-- Trigger untuk set due_date otomatis saat payment dibuat
DELIMITER //

CREATE TRIGGER IF NOT EXISTS before_payment_insert
BEFORE INSERT ON payments
FOR EACH ROW
BEGIN
  IF NEW.due_date IS NULL THEN
    SET NEW.due_date = DATE_ADD(CURDATE(), INTERVAL 7 DAY);
  END IF;
END//

-- Trigger untuk create payment reminder otomatis
CREATE TRIGGER IF NOT EXISTS after_payment_insert
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
  -- Buat reminder 3 hari sebelum jatuh tempo
  IF NEW.status = 'pending' THEN
    INSERT INTO payment_reminders (user_id, payment_id, reminder_date, message)
    VALUES (
      NEW.user_id,
      NEW.payment_id,
      DATE_SUB(NEW.due_date, INTERVAL 3 DAY),
      CONCAT('Pembayaran untuk periode ', NEW.period, ' akan jatuh tempo dalam 3 hari')
    );
  END IF;
END//

DELIMITER ;

/* ================================
   CONTOH QUERY UNTUK TESTING
================================ */

-- Ambil semua payment methods yang aktif
-- SELECT * FROM payment_methods WHERE is_active = TRUE;

-- Ambil history pembayaran user tertentu
-- SELECT * FROM v_payment_details WHERE user_id = 2;

-- Ambil statistik pembayaran
-- SELECT * FROM v_payment_statistics;

-- Generate invoice number baru
-- CALL generate_invoice_number(@new_invoice);
-- SELECT @new_invoice;

-- Konfirmasi pembayaran
-- CALL confirm_payment(1, 1, 'success');