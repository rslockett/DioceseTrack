'use client'
import { useState, useEffect } from 'react'
import type { Parish, ParishAddress } from '@/types/parish';
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Check, ChevronsUpDown, X, Search, UserPlus, UserMinus } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface AddParishFormProps {
  initialData?: Parish;
  onClose: () => void;
  onSave: (data: Parish) => void;
  onDelete?: (id: string) => void;
}

const US_STATES = [
  { value: 'AL', label: 'AL' }, { value: 'AK', label: 'AK' }, { value: 'AZ', label: 'AZ' },
  { value: 'AR', label: 'AR' }, { value: 'CA', label: 'CA' }, { value: 'CO', label: 'CO' },
  { value: 'CT', label: 'CT' }, { value: 'DE', label: 'DE' }, { value: 'FL', label: 'FL' },
  { value: 'GA', label: 'GA' }, { value: 'HI', label: 'HI' }, { value: 'ID', label: 'ID' },
  { value: 'IL', label: 'IL' }, { value: 'IN', label: 'IN' }, { value: 'IA', label: 'IA' },
  { value: 'KS', label: 'KS' }, { value: 'KY', label: 'KY' }, { value: 'LA', label: 'LA' },
  { value: 'ME', label: 'ME' }, { value: 'MD', label: 'MD' }, { value: 'MA', label: 'MA' },
  { value: 'MI', label: 'MI' }, { value: 'MN', label: 'MN' }, { value: 'MS', label: 'MS' },
  { value: 'MO', label: 'MO' }, { value: 'MT', label: 'MT' }, { value: 'NE', label: 'NE' },
  { value: 'NV', label: 'NV' }, { value: 'NH', label: 'NH' }, { value: 'NJ', label: 'NJ' },
  { value: 'NM', label: 'NM' }, { value: 'NY', label: 'NY' }, { value: 'NC', label: 'NC' },
  { value: 'ND', label: 'ND' }, { value: 'OH', label: 'OH' }, { value: 'OK', label: 'OK' },
  { value: 'OR', label: 'OR' }, { value: 'PA', label: 'PA' }, { value: 'RI', label: 'RI' },
  { value: 'SC', label: 'SC' }, { value: 'SD', label: 'SD' }, { value: 'TN', label: 'TN' },
  { value: 'TX', label: 'TX' }, { value: 'UT', label: 'UT' }, { value: 'VT', label: 'VT' },
  { value: 'VA', label: 'VA' }, { value: 'WA', label: 'WA' }, { value: 'WV', label: 'WV' },
  { value: 'WI', label: 'WI' }, { value: 'WY', label: 'WY' }
] as const;

export function AddParishForm({ initialData, onClose, onSave, onDelete }: AddParishFormProps) {
  const [formData, setFormData] = useState<Parish>(() => ({
    id: initialData?.id || '',
    name: initialData?.name || '',
    status: initialData?.status || 'Active',
    location: initialData?.location || '',
    deaneryId: initialData?.deaneryId || '',
    deaneryName: initialData?.deaneryName || '',
    clergyId: initialData?.clergyId || '',
    clergyName: initialData?.clergyName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    website: initialData?.website || '',
    address: initialData?.address || undefined,
    additionalInfo: initialData?.additionalInfo || '',
    assignedClergy: initialData?.assignedClergy || []
  }));
  const [deaneries, setDeaneries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deaneryComboboxOpen, setDeaneryComboboxOpen] = useState(false);
  const [clergy, setClergy] = useState([]);
  const [clergySearchQuery, setClergySearchQuery] = useState('');
  const [clergyComboboxOpen, setClergyComboboxOpen] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    zip: ''
  });

  useEffect(() => {
    try {
      const storedDeaneries = JSON.parse(localStorage.getItem('deaneries') || '[]');
      console.log('Loaded deaneries:', storedDeaneries);
      
      const storedClergy = JSON.parse(localStorage.getItem('clergy') || '[]');
      console.log('Raw clergy data:', storedClergy);
      
      setDeaneries(storedDeaneries);

      const formattedClergy = storedClergy.map(person => {
        console.log('Processing clergy member:', person);
        return {
          id: person.id,
          name: person.name || `${person.firstName} ${person.lastName}`.trim(),
          role: person.role || person.type
        };
      });
      
      console.log('Final formatted clergy:', formattedClergy);
      setClergy(formattedClergy);

      if (initialData) {
        setFormData(initialData);
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
      console.error('Error details:', {
        storedClergy: localStorage.getItem('clergy'),
        parseError: error
      });
    }
  }, [initialData]);

  useEffect(() => {
    try {
      const storedClergy = JSON.parse(localStorage.getItem('clergy') || '[]');
      console.log('Loading clergy data:', storedClergy);
      
      // Format clergy data
      const formattedClergy = storedClergy.map(person => ({
        id: person.id,
        name: person.name || `${person.firstName} ${person.lastName}`.trim(),
        type: person.type,
        role: person.role
      }));
      
      setClergy(formattedClergy);

      // Set initial assigned clergy if editing
      if (initialData?.assignedClergy) {
        console.log('Setting initial assigned clergy:', initialData.assignedClergy);
        setFormData(prev => ({
          ...prev,
          assignedClergy: initialData.assignedClergy.map(c => c.id)
        }));
      }
    } catch (error) {
      console.error('Error loading clergy data:', error);
    }
  }, [initialData]);

  const handleDeanerySelect = (selectedDeanery) => {
    setFormData({
      ...formData,
      deaneryId: selectedDeanery.id,
      deaneryName: selectedDeanery.name
    });
    setDeaneryComboboxOpen(false);
  };

  const handleClergySelect = (selectedClergy) => {
    setFormData(prev => ({
      ...prev,
      assignedClergy: prev.assignedClergy.includes(selectedClergy.id)
        ? prev.assignedClergy.filter(id => id !== selectedClergy.id)
        : [...prev.assignedClergy, selectedClergy.id]
    }));
    setClergyComboboxOpen(false);
  };

  const validateEmail = (email: string) => {
    if (!email) return ''; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? '' : 'Please enter a valid email address';
  };

  const validatePhone = (phone: string) => {
    if (!phone) return ''; // Optional field
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, '')) 
      ? '' 
      : 'Please enter a valid phone number (e.g., (123) 456-7890)';
  };

  const validateZip = (zip: string) => {
    if (!zip) return 'Zip code is required';
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip) ? '' : 'Please enter a valid zip code';
  };

  const deanerySelection = (
    <div className="space-y-2 relative w-full">
      <Label>Deanery <span className="text-red-500">*</span></Label>
      <Popover open={deaneryComboboxOpen} onOpenChange={setDeaneryComboboxOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={deaneryComboboxOpen}
            className={cn(
              "w-full justify-between",
              !formData.deaneryId && "text-muted-foreground"
            )}
          >
            {formData.deaneryId
              ? deaneries.find((d) => d.id === formData.deaneryId)?.name || "Select deanery..."
              : "Select deanery..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 bg-white shadow-md border w-[var(--radix-popover-trigger-width)]" 
          align="start"
          sideOffset={5}
        >
          <div className="border rounded-md bg-white">
            <div className="flex items-center border-b px-3 bg-white">
              <input
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500"
                placeholder="Search deaneries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto bg-white">
              {deaneries.length === 0 ? (
                <div className="py-6 text-center text-sm">No deaneries found.</div>
              ) : (
                <div className="p-1">
                  {deaneries
                    .filter(deanery => 
                      deanery.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((deanery) => (
                      <button
                        key={deanery.id}
                        onClick={() => handleDeanerySelect(deanery)}
                        className={cn(
                          "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 hover:text-slate-900",
                          formData.deaneryId === deanery.id && "bg-slate-100 text-slate-900"
                        )}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.deaneryId === deanery.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {deanery.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {deaneries.length === 0 && (
        <p className="text-sm text-yellow-600 mt-1">
          No deaneries available. Please create a deanery first.
        </p>
      )}
    </div>
  );

  const clergySelection = (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium">Assigned Clergy</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Clergy
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-white shadow-md border" align="end">
            <div className="p-2 border-b bg-white">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search clergy..."
                  value={clergySearchQuery}
                  onChange={(e) => setClergySearchQuery(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 text-sm border rounded-md bg-white"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto bg-white">
              {clergy
                .filter(person => {
                  console.log('Filtering person:', person);
                  return !formData.assignedClergy?.includes(person.id) &&
                    typeof person.name === 'string' && 
                    person.name.toLowerCase().includes(clergySearchQuery.toLowerCase());
                })
                .map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        assignedClergy: [...(formData.assignedClergy || []), person.id]
                      });
                      setClergySearchQuery('');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-medium">
                        {person.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm">{person.name}</span>
                  </button>
                ))}
              {clergy
                .filter(person => {
                  console.log('Filtering person:', person);
                  return !formData.assignedClergy?.includes(person.id) &&
                    typeof person.name === 'string' && 
                    person.name.toLowerCase().includes(clergySearchQuery.toLowerCase());
                }).length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No clergy available
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        {formData.assignedClergy?.map(clergyId => {
          const person = clergy.find(c => c.id === clergyId);
          if (!person) return null;
          
          return (
            <div
              key={clergyId}
              className="group flex items-center justify-between p-2 rounded-md border bg-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">
                    {person.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium">{person.name}</div>
                  <div className="text-xs text-gray-500">
                    {person.type} - {person.role}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    assignedClergy: prev.assignedClergy.filter(id => id !== clergyId)
                  }));
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded-full transition-opacity"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== PARISH FORM SUBMISSION ===');
    console.log('Form Data:', formData);
    console.log('Assigned Clergy IDs:', formData.assignedClergy);
    console.log('Available Clergy:', clergy);

    // Create the parish object
    const parishData = {
      ...formData,
      id: formData.id || crypto.randomUUID(),
      // Make sure we're saving the full clergy objects, not just IDs
      assignedClergy: formData.assignedClergy.map(clergyId => {
        const clergyMember = clergy.find(c => c.id === clergyId);
        return clergyMember ? {
          id: clergyMember.id,
          name: clergyMember.name,
          type: clergyMember.type,
          role: clergyMember.role
        } : null;
      }).filter(Boolean)
    };

    console.log('Final Parish Data:', parishData);
    onSave(parishData);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          {initialData ? 'Edit Parish' : 'Add New Parish'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <Label htmlFor="name">Parish Name</Label>
          <input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded-md"
            placeholder="Enter parish name"
            required
          />
        </div>

        {deanerySelection}
        {clergySelection}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="email">Parish Email</Label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
              }}
              onBlur={(e) => {
                const emailError = validateEmail(e.target.value);
                setErrors(prev => ({ ...prev, email: emailError }));
              }}
              className={cn(
                "w-full p-2 border rounded-md",
                errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              )}
              placeholder="parish@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Parish Phone</Label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                // Format the phone number as they type
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 6) {
                  value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6,10)}`;
                } else if (value.length >= 3) {
                  value = `(${value.slice(0,3)}) ${value.slice(3)}`;
                }
                setFormData({ ...formData, phone: value });
              }}
              onBlur={(e) => {
                const phoneError = validatePhone(e.target.value);
                setErrors(prev => ({ ...prev, phone: phoneError }));
              }}
              className={cn(
                "w-full p-2 border rounded-md",
                errors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              )}
              placeholder="(123) 456-7890"
              maxLength={14} // (XXX) XXX-XXXX = 14 characters
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Parish Address</h3>
            
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="123 Main St"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suite">Suite/Apt/Unit (Optional)</Label>
              <input
                id="suite"
                value={formData.suite}
                onChange={(e) => setFormData({ ...formData, suite: e.target.value })}
                className="w-full p-2 border rounded-md"
                placeholder="Suite 100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="City"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <select
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full p-2 border rounded-md bg-white"
                  required
                >
                  <option value="">Select State</option>
                  {US_STATES.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <input
                id="zip"
                value={formData.zip}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                  setFormData({ ...formData, zip: value });
                }}
                onBlur={(e) => {
                  const zipError = validateZip(e.target.value);
                  setErrors(prev => ({ ...prev, zip: zipError }));
                }}
                className={cn(
                  "w-full p-2 border rounded-md",
                  errors.zip ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                )}
                placeholder="12345"
                maxLength={5}
                required
              />
              {errors.zip && (
                <p className="text-sm text-red-500 mt-1">{errors.zip}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {initialData && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(initialData.id!)}
              className="px-4 py-2 text-red-600 hover:text-red-700"
            >
              Delete
            </button>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Save Changes' : 'Add Parish'}
          </Button>
        </div>
      </form>
    </div>
  );
} 
 