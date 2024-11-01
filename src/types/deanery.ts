export interface Deanery {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  deanId?: string;
  deanName?: string;
  contactEmail?: string;
  contactPhone?: string;
  parishes: string[]; // Array of parish IDs
  additionalInfo?: string;
} 