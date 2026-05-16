-- BAIC ARCFOX Test Drive Booking System
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ============================================================
-- TABLE: bookings
-- ============================================================
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_code TEXT UNIQUE NOT NULL,

  -- Customer data
  nama TEXT NOT NULL,
  nomor_wa TEXT NOT NULL,
  domisili TEXT NOT NULL,
  kendaraan_saat_ini TEXT NOT NULL,

  -- Booking detail
  model_id TEXT NOT NULL,
  model_nama TEXT NOT NULL,
  tanggal DATE NOT NULL,
  slot_waktu TIME NOT NULL,

  -- Status
  status TEXT DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'reminded', 'completed', 'cancelled', 'no_show')),

  -- Notification
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'microsite'
);

-- Unique constraint: 1 booking per slot per unit per hari
CREATE UNIQUE INDEX bookings_slot_unique
  ON bookings (model_id, tanggal, slot_waktu)
  WHERE status != 'cancelled';

-- Indexes for common queries
CREATE INDEX idx_bookings_tanggal ON bookings (tanggal);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_bookings_model_id ON bookings (model_id);
CREATE INDEX idx_bookings_reminder ON bookings (tanggal, slot_waktu, reminder_sent, status);

-- ============================================================
-- TABLE: car_models
-- ============================================================
CREATE TABLE car_models (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  variant TEXT NOT NULL,
  warna TEXT NOT NULL,
  deskripsi TEXT,
  spesifikasi JSONB,
  gambar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  urutan INT
);

-- ============================================================
-- TABLE: blocked_slots
-- ============================================================
CREATE TABLE blocked_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id TEXT NOT NULL,
  tanggal DATE NOT NULL,
  slot_waktu TIME NOT NULL,
  alasan TEXT,
  blocked_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX blocked_slots_unique ON blocked_slots (model_id, tanggal, slot_waktu);

-- ============================================================
-- TABLE: dashboard_users
-- ============================================================
CREATE TABLE dashboard_users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('wtm_admin', 'baic_admin', 'sales_view')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_users ENABLE ROW LEVEL SECURITY;

-- bookings: public INSERT (customer booking)
CREATE POLICY "Public dapat insert booking"
  ON bookings FOR INSERT TO anon WITH CHECK (true);

-- bookings: public SELECT hanya untuk slot availability check (minimal fields)
CREATE POLICY "Public dapat baca slot_waktu untuk availability"
  ON bookings FOR SELECT TO anon
  USING (true);

-- bookings: authenticated (dashboard) dapat baca semua
CREATE POLICY "Dashboard user dapat baca semua booking"
  ON bookings FOR SELECT TO authenticated USING (true);

-- bookings: update status hanya wtm_admin / baic_admin
CREATE POLICY "Admin dapat update status booking"
  ON bookings FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dashboard_users
      WHERE id = auth.uid()
      AND role IN ('wtm_admin', 'baic_admin')
    )
  );

-- car_models: public read
CREATE POLICY "Public dapat baca car_models"
  ON car_models FOR SELECT TO anon USING (true);

-- blocked_slots: public read (untuk availability check)
CREATE POLICY "Public dapat baca blocked_slots"
  ON blocked_slots FOR SELECT TO anon USING (true);

-- dashboard_users: hanya authenticated
CREATE POLICY "Dashboard user dapat baca data sendiri"
  ON dashboard_users FOR SELECT TO authenticated
  USING (id = auth.uid());

-- ============================================================
-- FUNCTION: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED: car_models data
-- ============================================================
INSERT INTO car_models (id, nama, variant, warna, deskripsi, spesifikasi, gambar_url, is_active, urutan) VALUES
  ('bj40plus', 'BJ40 Plus', 'CKD', 'Phantom Black',
   'SUV off-road legendaris dengan powertrain terbaru. Kombinasi diesel dan bensin, transmisi 8AT, 4WD part-time.',
   '{"Dimensi": "4630 × 1925 × 1871 mm", "Wheelbase": "2745 mm", "Mesin": "2.0T Gasoline / 2.0D Diesel", "Tenaga": "165 kW (2.0T) / 120 kW (2.0D)", "Torsi": "380 N·m", "Transmisi": "8AT"}',
   '/models/bj40plus.jpg', true, 1),

  ('bj30hev-awd', 'BJ30 HEV AWD', 'HEV + Roof Tent', 'Matte Grey',
   'HEV AWD dengan roof tent — siap untuk eksplorasi tanpa batas. Magic Core Hybrid Drive dengan 11+ mode berkendara.',
   '{"Dimensi": "4730 × 1910 × 1790 mm", "Wheelbase": "2820 mm", "Mesin": "1.5T + Dual Motor HEV", "Tenaga": "115 + 130 + 55 kW", "Torsi": "230 + 315 + 145 N·m", "Transmisi": "DHT"}',
   '/models/bj30hev-awd.jpg', true, 2),

  ('bj30hev-fwd', 'BJ30 HEV FWD', 'HEV + Rear Box', 'Apple Green',
   'HEV FWD dengan rear box transparan. Efisien, cerdas, dan siap untuk segala kondisi jalan Indonesia.',
   '{"Dimensi": "4730 × 1910 × 1790 mm", "Wheelbase": "2820 mm", "Mesin": "1.5T + Single Motor HEV", "Tenaga": "115 + 130 kW", "Torsi": "230 + 315 N·m", "Transmisi": "2DHT"}',
   '/models/bj30hev-fwd.jpg', true, 3),

  ('x55ii', 'X55 II Prime', 'Prime — Black', 'Midnight Black',
   'SUV urban premium dengan VGT engine, 99.9% antibacterial cabin, dan first-class seat experience.',
   '{"Dimensi": "4620 × 1836 × 1680 mm", "Wheelbase": "2735 mm", "Mesin": "1.5T VGT", "Tenaga": "138–150 kW", "Torsi": "305 N·m", "Transmisi": "7DCT"}',
   '/models/x55ii.jpg', true, 4);
