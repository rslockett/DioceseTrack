export * from './clergy';
export * from './parish';
export * from './deanery';

// Shared types used across multiple interfaces
export interface ContactInfo {
  email?: string;
  phone?: string;
}

export interface Address {
  street: string;
  suite?: string;
  city: string;
  state: string;
  zip: string;
}

export type Status = 'Active' | 'Inactive' | 'Retired'; 