export type NoticeTag = 'general' | 'emergency_water_shutdown' | 'agm_meeting' | 'pest_control';
export type DueStatus = 'pending' | 'paid';
export type ComplaintCategory =
  | 'plumbing'
  | 'electrical'
  | 'housekeeping'
  | 'security'
  | 'lift'
  | 'parking'
  | 'other';
export type ComplaintStatus = 'open' | 'in_progress' | 'resolved';

export type Amenity = 'clubhouse' | 'party_lawn';
export type BookingSlot = 'morning' | 'afternoon' | 'evening';

export interface AmenityBooking {
  id: string;
  amenity: Amenity;
  booking_date: string;
  slot: BookingSlot;
  resident_name: string;
  flat_number: string;
  purpose: string;
  guest_count: number;
  created_at: string;
}

export interface Resident {
  id: string;
  full_name: string;
  flat_number: string;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  tag: NoticeTag;
  pinned: boolean;
  created_at: string;
}

export interface MaintenanceDue {
  id: string;
  resident_id: string;
  billing_month: string;
  amount: number;
  status: DueStatus;
  paid_at: string | null;
  created_at: string;
}

export interface Complaint {
  id: string;
  flat_number: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  created_at: string;
  resolved_at: string | null;
}
