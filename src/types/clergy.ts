export interface ClergySpouse {
  name: string;
  email?: string;
  nameDay?: string;
  birthday?: string;
  patronSaintDay?: {
    date: string;
    saint: string;
  };
}

export interface ClergyChild {
  name: string;
  birthday?: string;
  patronSaintDay?: {
    date: string;
    saint: string;
  };
}

export interface ClergyAddress {
  street: string;
  suite?: string;
  city: string;
  state: string;
  zip: string;
}

export interface Clergy {
  id: string;
  name: string;
  type: 'Priest' | 'Deacon' | 'Bishop';
  role: string;
  ordained?: string;
  status: 'Active' | 'Inactive' | 'Retired';
  currentAssignment?: string; // Parish name
  deaneryId?: string;
  deaneryName?: string;
  email?: string;
  phone?: string;
  initials?: string;
  nameDay?: string;
  patronSaintDay?: {
    date: string;
    saint: string;
  };
  spouse?: ClergySpouse;
  children?: ClergyChild[];
  address?: ClergyAddress;
  profileImage?: string;
} 