export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'staff';
  verified_at?: Date;
  created_at: Date;
}

export interface Vehicle {
  id: number;
  plate_number: string;
  brand: string;
  model: string;
  year: number;
  category?: string;
  seats?: number;
  transmission?: 'manual' | 'automatic';
  fuel_type?: string;
  mileage: number;
  daily_price: number;
  status: 'available' | 'reserved' | 'rented' | 'maintenance';
  qr_code_id?: number;
  images: string[];
  created_at: Date;
}

export interface QRTag {
  id: number;
  vehicle_id: number;
  qr_code_value: string;
  qr_image_url?: string;
  created_at: Date;
}

export interface Booking {
  id: number;
  user_id: number;
  vehicle_id: number;
  start_date: Date;
  end_date: Date;
  pickup_location?: string;
  return_location?: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: Date;
}

export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  method?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  receipt_url?: string;
  created_at: Date;
}

export interface QRLog {
  id: number;
  qr_tag_id: number;
  scanned_by?: number;
  scan_type: 'check-in' | 'check-out';
  scan_location?: { lat: number; lng: number };
  note?: string;
  booking_id?: number;
  created_at: Date;
}

import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: User;
}

