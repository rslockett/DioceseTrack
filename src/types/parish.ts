export interface ParishAddress {
  street: string;
  suite?: string;
  city: string;
  state: string;
  zip: string;
}

export interface Parish {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  location?: string;
  deaneryId?: string;
  deaneryName?: string;
  clergyId?: string;
  clergyName?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: ParishAddress;
  additionalInfo?: string;
} 