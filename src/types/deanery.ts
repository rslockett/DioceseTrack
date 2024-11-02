export interface Deanery {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  deanId?: string;
  deanName?: string;
  contactEmail?: string;
  contactPhone?: string;
  parishes?: {
    id: string;
    name: string;
    status: 'Active' | 'Inactive';
  }[];
  additionalInfo?: string;
} 