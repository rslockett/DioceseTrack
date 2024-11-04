'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus, Search, X } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Deanery } from '@/types/deanery'

interface AddDeaneryFormProps {
  initialData?: Deanery;
  onClose: () => void;
  onSave: (data: Deanery) => void;
  onDelete?: (id: string) => void;
}

const CLERGY_TYPES = [
  { value: 'Priest', title: 'Fr.' },
  { value: 'Deacon', title: 'Dcn.' },
  { value: 'Bishop', title: 'Bp.' }
] as const;

// Add this utility function at the top of the file
const getTitleAbbreviation = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'priest':
      return 'Fr.';
    case 'deacon':
      return 'Dn.';
    case 'bishop':
      return 'Bp.';
    default:
      return '';
  }
};

export function AddDeaneryForm({ initialData, onClose, onSave, onDelete }: AddDeaneryFormProps) {
  const [clergy, setClergy] = useState<Array<{ id: string; name: string; displayName: string; role: string }>>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState<Deanery>(() => ({
    id: initialData?.id || '',
    name: initialData?.name || '',
    status: initialData?.status || 'Active',
    deanId: initialData?.deanId || '',
    deanName: initialData?.deanName || '',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    parishes: initialData?.parishes || [],
    additionalInfo: initialData?.additionalInfo || ''
  }))
  const [parishes, setParishes] = useState<Parish[]>([])
  const [selectedParishes, setSelectedParishes] = useState<string[]>(initialData?.parishes || [])
  const [deanComboboxOpen, setDeanComboboxOpen] = useState(false)
  const [errors, setErrors] = useState({
    email: '',
    phone: ''
  });

  // Add this effect to handle dean selection logic
  useEffect(() => {
    try {
      const allClergy = JSON.parse(localStorage.getItem('clergy') || '[]');
      console.log('Loading all clergy:', allClergy);
      
      // Filter clergy to only show those with Dean role
      const deanClergy = allClergy.filter(person => 
        person.role?.toLowerCase().includes('dean')
      ).map(person => ({
        id: person.id,
        displayName: `${getTitleAbbreviation(person.type)} ${person.name}`,
        currentAssignment: person.currentAssignment
      }));

      setClergy(deanClergy);

      // Auto-select dean if there's only one dean in the selected parishes
      if (formData.parishes?.length > 0) {
        const deansInSelectedParishes = deanClergy.filter(dean =>
          formData.parishes.some(parishId => {
            const parish = parishes.find(p => p.id === parishId);
            return parish?.name === dean.currentAssignment;
          })
        );

        if (deansInSelectedParishes.length === 1) {
          setFormData(prev => ({
            ...prev,
            dean: deansInSelectedParishes[0].id,
            deanName: deansInSelectedParishes[0].displayName
          }));
        } else if (deansInSelectedParishes.length > 1) {
          // Clear dean selection if multiple deans found
          setFormData(prev => ({
            ...prev,
            dean: '',
            deanName: ''
          }));
        }
      }
    } catch (error) {
      console.error('Error loading clergy data:', error);
    }
  }, [formData.parishes, parishes]);

  // Add this useEffect to load assigned parishes
  useEffect(() => {
    try {
      const storedParishes = JSON.parse(localStorage.getItem('parishes') || '[]');
      console.log('Loading parishes:', storedParishes);
      
      // Find parishes assigned to this deanery
      const assignedParishes = storedParishes.filter(
        parish => parish.deaneryId === initialData?.id
      );
      console.log('Assigned parishes:', assignedParishes);
      
      // Set the parishes in state
      setParishes(storedParishes);
      
      // Set the selected parishes IDs
      const assignedParishIds = assignedParishes.map(p => p.id);
      console.log('Setting selected parish IDs:', assignedParishIds);
      
      setSelectedParishes(assignedParishIds);
      setFormData(prev => ({
        ...prev,
        parishes: assignedParishIds
      }));
    } catch (error) {
      console.error('Error loading assigned parishes:', error);
    }
  }, [initialData?.id]); // Only run when the deanery ID changes

  const handleDeanSelect = (selectedClergy: any) => {
    setFormData({
      ...formData,
      deanId: selectedClergy.id,
      deanName: selectedClergy.displayName
    })
    setSearchQuery('')
  }

  const validateEmail = (email: string) => {
    if (!email) return ''; // Return empty string if no email (optional field)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? '' : 'Please enter a valid email address';
  };

  const validatePhone = (phone: string) => {
    if (!phone) return ''; // Empty is valid (optional field)
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phoneRegex.test(phone) ? '' : 'Please enter a valid phone number (e.g., (123) 456-7890)';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(formData.contactEmail);
    const phoneError = validatePhone(formData.contactPhone);
    
    setErrors({
      email: emailError,
      phone: phoneError
    });

    if (emailError || phoneError) {
      return;
    }
    
    // Update both deanery and parish records
    const existingDeaneries = JSON.parse(localStorage.getItem('deaneries') || '[]')
    const existingParishes = JSON.parse(localStorage.getItem('parishes') || '[]')

    // Filter out any invalid parish IDs before saving
    const validParishIds = selectedParishes.filter(id => 
      existingParishes.some(p => p.id === id)
    )
    
    const deaneryData: Deanery = {
      id: formData.id || crypto.randomUUID(),
      name: formData.name,
      status: 'Active',
      deanId: formData.deanId,
      deanName: formData.deanName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      parishes: validParishIds, // Use cleaned up parish list
      additionalInfo: formData.additionalInfo
    }

    // Update deanery
    const updatedDeaneries = existingDeaneries.map(d => 
      d.id === deaneryData.id ? deaneryData : d
    )
    if (!existingDeaneries.find(d => d.id === deaneryData.id)) {
      updatedDeaneries.push(deaneryData)
    }

    // Update parishes to reference this deanery
    const updatedParishes = existingParishes.map(parish => {
      if (validParishIds.includes(parish.id)) {
        return { ...parish, deaneryId: deaneryData.id }
      }
      // If parish was previously in this deanery but now isn't, remove the reference
      if (parish.deaneryId === deaneryData.id && !validParishIds.includes(parish.id)) {
        const { deaneryId, ...rest } = parish
        return rest
      }
      return parish
    })

    // Save both updates
    localStorage.setItem('deaneries', JSON.stringify(updatedDeaneries))
    localStorage.setItem('parishes', JSON.stringify(updatedParishes))

    onSave(deaneryData)
    onClose()
  }

  const deanSelection = (
    <div className="space-y-2 relative w-full">
      <Label>Dean</Label>
      <Popover open={deanComboboxOpen} onOpenChange={setDeanComboboxOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={deanComboboxOpen}
            className="w-full justify-between"
          >
            {formData.deanName
              ? formData.deanName
              : "Select dean..."}
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
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500"
                placeholder="Search clergy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto bg-white">
              {clergy.length === 0 ? (
                <div className="py-6 text-center text-sm">
                  No deans available. Please assign dean roles to clergy members first.
                </div>
              ) : (
                <div className="p-1">
                  {clergy
                    .filter(person => 
                      person.displayName.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((person) => (
                      <button
                        key={person.id}
                        onClick={() => {
                          handleDeanSelect(person)
                          setDeanComboboxOpen(false)
                        }}
                        className={cn(
                          "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 hover:text-slate-900",
                          formData.deanId === person.id && "bg-slate-100 text-slate-900"
                        )}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.deanId === person.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {person.displayName}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )

  const parishesSelection = (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium">Assigned Parishes</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Parish
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-white shadow-md border" align="end">
            <div className="p-2 border-b bg-white">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search parishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 text-sm border rounded-md bg-white"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto bg-white">
              {parishes
                .filter(parish => {
                  return !selectedParishes.includes(parish.id) &&
                    parish.name.toLowerCase().includes(searchQuery.toLowerCase());
                })
                .map((parish) => (
                  <button
                    key={parish.id}
                    type="button"
                    onClick={() => {
                      setSelectedParishes([...selectedParishes, parish.id]);
                      setFormData({
                        ...formData,
                        parishes: [...formData.parishes, parish.id]
                      });
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-medium">
                        {parish.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm">{parish.name}</span>
                  </button>
                ))}
              {parishes
                .filter(parish => {
                  return !selectedParishes.includes(parish.id) &&
                    parish.name.toLowerCase().includes(searchQuery.toLowerCase());
                }).length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No parishes available
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        {selectedParishes.map(parishId => {
          const parish = parishes.find(p => p.id === parishId);
          if (!parish) return null;
          
          return (
            <div
              key={parishId}
              className="group flex items-center justify-between p-2 rounded-md border bg-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">
                    {parish.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium">{parish.name}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedParishes(prev => prev.filter(id => id !== parishId));
                  setFormData(prev => ({
                    ...prev,
                    parishes: prev.parishes.filter(id => id !== parishId)
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
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          {initialData ? 'Edit Deanery' : 'Add New Deanery'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name">Deanery Name</Label>
          <input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded-md"
            placeholder="Enter deanery name"
            required
          />
        </div>

        {deanSelection}
        {parishesSelection}

        <div className="space-y-4">
          <h3 className="font-medium">Contact Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => {
                setFormData({ ...formData, contactEmail: e.target.value });
              }}
              onBlur={(e) => {
                const emailError = validateEmail(e.target.value);
                setErrors(prev => ({ ...prev, email: emailError }));
              }}
              className={cn(
                "w-full p-2 border rounded-md transition-colors",
                errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              )}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <input
              id="contactPhone"
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => {
                // Optional: Format the phone number as they type
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 6) {
                  value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6,10)}`;
                } else if (value.length >= 3) {
                  value = `(${value.slice(0,3)}) ${value.slice(3)}`;
                }
                setFormData({ ...formData, contactPhone: value });
              }}
              onBlur={(e) => {
                const phoneError = validatePhone(e.target.value);
                setErrors(prev => ({ ...prev, phone: phoneError }));
              }}
              placeholder="(123) 456-7890"
              className={cn(
                "w-full p-2 border rounded-md transition-colors",
                errors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              )}
              maxLength={14} // (XXX) XXX-XXXX = 14 characters
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="additionalInfo">Additional Information</Label>
          <textarea
            id="additionalInfo"
            value={formData.additionalInfo}
            onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
            className="w-full p-2 border rounded-md min-h-[100px]"
            placeholder="Enter any additional information..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Save Changes' : 'Add Deanery'}
          </Button>
        </div>
      </form>
    </div>
  )
}