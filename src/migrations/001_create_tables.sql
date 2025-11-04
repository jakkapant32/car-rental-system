-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  plate_number VARCHAR(20) UNIQUE NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  category VARCHAR(50),
  seats INT,
  transmission VARCHAR(20) CHECK (transmission IN ('manual', 'automatic')),
  fuel_type VARCHAR(20),
  mileage INT DEFAULT 0,
  daily_price NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'rented', 'maintenance')),
  qr_code_id INT,
  images JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create qr_tags table
CREATE TABLE IF NOT EXISTS qr_tags (
  id SERIAL PRIMARY KEY,
  vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  qr_code_value VARCHAR(255) UNIQUE NOT NULL,
  qr_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pickup_location VARCHAR(255),
  return_location VARCHAR(255),
  total_price NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CHECK (end_date >= start_date)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id VARCHAR(255),
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create rental_contracts table
CREATE TABLE IF NOT EXISTS rental_contracts (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  contract_pdf_url TEXT,
  signed_by_customer BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create qr_logs table
CREATE TABLE IF NOT EXISTS qr_logs (
  id SERIAL PRIMARY KEY,
  qr_tag_id INT NOT NULL REFERENCES qr_tags(id) ON DELETE CASCADE,
  scanned_by INT REFERENCES users(id),
  scan_type VARCHAR(20) NOT NULL CHECK (scan_type IN ('check-in', 'check-out')),
  scan_location JSONB,
  note TEXT,
  booking_id INT REFERENCES bookings(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  payload JSONB,
  status VARCHAR(20) DEFAULT 'unread',
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  actor_id INT REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  object_type VARCHAR(50),
  object_id INT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_qr_tags_value ON qr_tags(qr_code_value);
CREATE INDEX IF NOT EXISTS idx_qr_logs_qr_tag_id ON qr_logs(qr_tag_id);
CREATE INDEX IF NOT EXISTS idx_qr_logs_created_at ON qr_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Add foreign key for vehicles.qr_code_id (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_vehicles_qr_code'
    ) THEN
        ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_qr_code 
        FOREIGN KEY (qr_code_id) REFERENCES qr_tags(id) ON DELETE SET NULL;
    END IF;
END $$;

