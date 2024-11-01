'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus, Search } from 'lucide-react'
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

  // Load clergy data when component mounts
  useEffect(() => {
    try {
      const storedParishes = JSON.parse(localStorage.getItem('parishes') || '[]')
      
      // Extract all clergy from all parishes
      const allClergy = storedParishes.reduce((acc: any[], parish: any) => {
        if (parish.assignedClergy && Array.isArray(parish.assignedClergy)) {
          parish.assignedClergy.forEach((clergy: any) => {
            // Only add if not already in the array and is a Dean
            if (!acc.some(c => c.id === clergy.id) && clergy.role === 'Dean') {
              // Use the same preview format as AddClergyForm
              const [title, ...nameParts] = clergy.name.split(' ')
              const name = nameParts.join(' ')
              const titleAbbrev = title === 'Priest' ? 'Fr.' : 
                                title === 'Deacon' ? 'Dcn.' : 
                                title === 'Bishop' ? 'Bp.' : 
                                title
              
              acc.push({
                ...clergy,
                displayName: `${titleAbbrev} ${name}`.trim()
              })
            }
          })
        }
        return acc
      }, [])
      
      setClergy(allClergy)
      setParishes(storedParishes)
    } catch (error) {
      console.error('Error loading data:', error)
      setClergy([])
      setParishes([])
    }
  }, [initialData])

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
    <div className="space-y-2 relative w-full">
      <Label>Parishes ({selectedParishes.length} selected)</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            {selectedParishes.length > 0
              ? `${selectedParishes.length} parish${selectedParishes.length === 1 ? '' : 'es'} selected`
              : "Select parishes..."}
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
                placeholder="Search parishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto bg-white">
              {parishes.length === 0 ? (
                <div className="py-6 text-center text-sm">No parishes found.</div>
              ) : (
                <div className="p-1">
                  {parishes
                    .filter(parish => 
                      parish.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((parish) => (
                      <div
                        key={parish.id}
                        className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded-sm"
                      >
                        <input
                          type="checkbox"
                          id={`parish-${parish.id}`}
                          checked={selectedParishes.includes(parish.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedParishes([...selectedParishes, parish.id]);
                              setFormData({
                                ...formData,
                                parishes: [...formData.parishes, parish.id]
                              });
                            } else {
                              setSelectedParishes(selectedParishes.filter(id => id !== parish.id));
                              setFormData({
                                ...formData,
                                parishes: formData.parishes.filter(id => id !== parish.id)
                              });
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label 
                          htmlFor={`parish-${parish.id}`}
                          className="flex-1 text-sm cursor-pointer"
                        >
                          <div className="font-medium">{parish.name}</div>
                          {parish.priestName && (
                            <div className="text-xs text-gray-500">
                              Priest: {parish.priestName}
                            </div>
                          )}
                        </label>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {selectedParishes.length > 0 && (
        <div className="mt-2 p-2 border rounded-md bg-slate-50">
          <div className="flex flex-wrap gap-2">
            {selectedParishes.map(id => {
              const parish = parishes.find(p => p.id === id);
              return parish ? (
                <div 
                  key={id}
                  className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-sm border shadow-sm"
                >
                  <span>{parish.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedParishes(selectedParishes.filter(pId => pId !== id));
                      setFormData({
                        ...formData,
                        parishes: formData.parishes.filter(pId => pId !== id)
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
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