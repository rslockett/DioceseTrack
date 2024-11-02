'use client'
import { useState, useEffect } from 'react'
import type { Clergy, ClergySpouse, ClergyChild } from '@/types/clergy'
import { X, Plus, Trash, Users2, Edit, Trash2, Building, Mail, Phone } from 'lucide-react'
import { DeleteDialog } from './DeleteDialog'
import { Label } from '@/components/ui/label'
import { cn } from "@/lib/utils"
import { ImageCropper } from './ImageCropper'

interface AddClergyFormProps {
  initialData?: Clergy;
  onClose: () => void;
  onSave: (data: Clergy) => void;
  onDelete?: (id: string) => void;
}

const CLERGY_TYPES = [
  { value: 'Priest', title: 'Fr.', spouseTitle: 'Kh.' },
  { value: 'Deacon', title: 'Dcn.', spouseTitle: 'Sh.' },
  { value: 'Bishop', title: 'Bp.', spouseTitle: null }
] as const;

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
] as const;

const getDaysInMonth = (month: string) => {
  if (!month) return [];
  
  const thirtyDays = ['04', '06', '09', '11'];
  const thirtyOneDays = ['01', '03', '05', '07', '08', '10', '12'];
  let days = [];
  
  let maxDays = 31;
  if (thirtyDays.includes(month)) {
    maxDays = 30;
  } else if (month === '02') {
    maxDays = 29; // Accounting for leap years
  }
  
  for (let i = 1; i <= maxDays; i++) {
    const value = i.toString().padStart(2, '0');
    days.push({ value, label: i.toString() });
  }
  
  return days;
};

type AssignmentType = 'Parish' | 'Other';

interface Deanery {
  id: string;
  name: string;
}

interface Parish {
  id: string;
  name: string;
  deaneryId: string;
}

const STATE_ABBREVIATIONS = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
] as const;

const validateEmail = (email: string) => {
  if (!email) return ''; // Return empty string if no email (optional field)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? '' : 'Please enter a valid email address';
};

const validatePhone = (phone: string) => {
  if (!phone) return ''; // Empty is valid (optional field)
  
  // Remove all non-numeric characters for validation
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if we have exactly 10 digits
  if (cleanPhone.length !== 10) {
    return 'Phone number must be 10 digits';
  }
  
  // Check if it matches the format we want
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, '')) 
    ? '' 
    : 'Please enter a valid phone number (e.g., (123) 456-7890)';
};

export function AddClergyForm({ initialData, onClose, onSave, onDelete }: AddClergyFormProps) {
  console.log('Form initialData:', initialData);

  const [formData, setFormData] = useState<Clergy>(() => ({
    id: initialData?.id || crypto.randomUUID(),
    name: initialData?.name || '',
    type: initialData?.type || 'Priest',
    status: initialData?.status || 'Active',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    currentAssignment: initialData?.currentAssignment || '',
    deaneryId: initialData?.deaneryId || '',
    deaneryName: initialData?.deaneryName || '',
    ordinationDate: initialData?.ordinationDate || '',
    birthday: initialData?.birthday || '',
    nameDay: initialData?.nameDay || '',
    patronSaintDay: initialData?.patronSaintDay || { date: '', saint: '' },
    spouse: initialData?.spouse || null,
    children: initialData?.children || [],
    profileImage: initialData?.profileImage || '',
    role: initialData?.role || '',
    dateCreated: initialData?.dateCreated || new Date().toISOString(),
  }));

  const [profileImage, setProfileImage] = useState(initialData?.profileImage || '');
  const [children, setChildren] = useState(initialData?.children || []);
  const [showSpouse, setShowSpouse] = useState(!!initialData?.spouse);
  const [showChildren, setShowChildren] = useState(!!initialData?.children?.length);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [assignmentType, setAssignmentType] = useState<AssignmentType>(
    initialData?.currentAssignment ? 'Parish' : 'Other'
  );
  const [selectedDeaneryId, setSelectedDeaneryId] = useState(initialData?.deaneryId || '');
  const [deaneries, setDeaneries] = useState<Array<{ id: string; name: string }>>([]);
  const [parishes, setParishes] = useState<Array<{ id: string; name: string; deaneryId: string }>>([]);

  const [errors, setErrors] = useState({
    email: '',
    phone: ''
  });

  const [roles, setRoles] = useState<string[]>([]);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRole, setNewRole] = useState('');

  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string>('');

  useEffect(() => {
    try {
      const storedDeaneries = JSON.parse(localStorage.getItem('deaneries') || '[]');
      const storedParishes = JSON.parse(localStorage.getItem('parishes') || '[]');
      setDeaneries(storedDeaneries);
      setParishes(storedParishes);
    } catch (error) {
      console.error('Error loading deaneries/parishes:', error);
      setDeaneries([]);
      setParishes([]);
    }
  }, []);

  useEffect(() => {
    if (!selectedDeaneryId) {
      setParishes([]);
      return;
    }
    
    // Get parishes from localStorage instead of API
    const allParishes = JSON.parse(localStorage.getItem('parishes') || '[]');
    const deaneryParishes = allParishes.filter(
      parish => parish.deaneryId === selectedDeaneryId
    );
    setParishes(deaneryParishes);
  }, [selectedDeaneryId]);

  useEffect(() => {
    const storedRoles = JSON.parse(localStorage.getItem('clergyRoles') || '["Pastor", "Assistant Pastor", "Youth Director"]');
    setRoles(storedRoles);
  }, []);

  useEffect(() => {
    if (initialData) {
      console.log('Loading initial data into form:', initialData);
      
      // Set all form states
      setFormData({
        ...initialData,
        type: initialData.type || 'Priest', // Ensure type is preserved
      });
      
      // Set other state values
      setProfileImage(initialData.profileImage || '');
      setSelectedDeaneryId(initialData.deaneryId || '');
      setShowSpouse(!!initialData.spouse);
      setChildren(initialData.children || []);
      setShowChildren(!!initialData.children?.length);
    }
  }, [initialData]);

  // Add this debug effect
  useEffect(() => {
    console.log('Current form data:', formData);
    console.log('Current profile image:', profileImage);
  }, [formData, profileImage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const completeData: Clergy = {
      ...formData,
      type: formData.type, // Preserve clergy type
      profileImage, // Preserve profile image
      children: showChildren ? children : [],
      spouse: showSpouse ? formData.spouse : null,
      lastUpdated: new Date().toISOString(),
      assignmentType: assignmentType
    };

    // Save to localStorage directly to ensure persistence
    const existingClergy = JSON.parse(localStorage.getItem('clergy') || '[]');
    const updatedClergy = completeData.id
      ? existingClergy.map(c => c.id === completeData.id ? completeData : c)
      : [...existingClergy, completeData];
    
    localStorage.setItem('clergy', JSON.stringify(updatedClergy));

    // Call the parent's onSave
    onSave(completeData);
  };

  const addChild = () => {
    setChildren([...children, { name: '', birthday: '' }]);
  };

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const handleDelete = () => {
    if (initialData?.id) {
      onDelete(initialData.id);
    }
  };

  const handleAddRole = () => {
    if (newRole.trim() && !roles.includes(newRole.trim())) {
      const updatedRoles = [...roles, newRole.trim()];
      setRoles(updatedRoles);
      localStorage.setItem('clergyRoles', JSON.stringify(updatedRoles));
      setNewRole('');
      setIsAddingRole(false);
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    const updatedRoles = roles.filter(role => role !== roleToRemove);
    setRoles(updatedRoles);
    localStorage.setItem('clergyRoles', JSON.stringify(updatedRoles));
    
    // If the current form has this role selected, clear it
    if (formData.role === roleToRemove) {
      setFormData(prev => ({ ...prev, role: '' }));
    }
  };

  // Add this function to handle assignment changes
  const handleAssignmentChange = (deaneryId: string, parishName: string) => {
    // First get the deanery details
    const deaneries = JSON.parse(localStorage.getItem('deaneries') || '[]');
    const selectedDeanery = deaneries.find(d => d.id === deaneryId);
    
    setFormData(prev => ({
      ...prev,
      currentAssignment: parishName,
      deaneryId: deaneryId,
      deaneryName: selectedDeanery?.name || ''
    }));
  };

  // Update form data when deanery is selected
  const handleDeaneryChange = (deaneryId: string) => {
    console.log('Deanery selected:', deaneryId);
    setSelectedDeaneryId(deaneryId);
    
    const selectedDeanery = deaneries.find(d => d.id === deaneryId);
    setFormData(prev => ({
      ...prev,
      deaneryId: deaneryId,
      deaneryName: selectedDeanery?.name || '',
      currentAssignment: '' // Clear parish when deanery changes
    }));
  };

  // Update form data when parish is selected
  const handleParishChange = (parishName: string) => {
    console.log('Parish selected:', parishName);
    setFormData(prev => ({
      ...prev,
      currentAssignment: parishName
    }));
  };

  // Update the handleImageUpload function
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setTempImage(base64String);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add handler for crop completion
  const handleCropComplete = (croppedImage: string) => {
    setProfileImage(croppedImage);
    setFormData(prev => ({
      ...prev,
      profileImage: croppedImage
    }));
    setShowCropper(false);
    setTempImage('');
  };

  // Add this helper function at the top of your component
  const getTitleAbbreviation = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'priest':
        return 'Fr.';
      case 'deacon':
        return 'Dcn.';
      case 'bishop':
        return 'Bp.';
      default:
        return '';
    }
  };

  // Handle type change
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      type: e.target.value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {initialData ? 'Edit Clergy' : 'Add New Clergy'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Add the profile image upload section here, right at the start of the form */}
        <div className="mb-8">
          <label className="block text-lg font-medium mb-4">Profile Picture</label>
          <div className="flex items-start gap-8">
            {/* Larger image container - increased to 56 (224px) */}
            <div className="relative w-56 h-56 rounded-full overflow-hidden border-2 border-gray-200 shadow-md">
              {profileImage ? (
                <>
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all 
                                flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer"
                    onClick={() => {
                      setTempImage(profileImage);
                      setShowCropper(true);
                    }}
                  >
                    <span className="text-white bg-black bg-opacity-50 px-3 py-1.5 rounded-full text-sm">
                      Edit Photo
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <Users2 className="w-20 h-20 text-blue-300" />
                </div>
              )}
            </div>
            
            {/* Controls section with smaller buttons */}
            <div className="flex flex-col gap-1.5 py-1">
              <label 
                className="px-3 py-1.5 bg-white border border-blue-600 text-blue-600 rounded-md 
                         cursor-pointer hover:bg-blue-50 transition-colors duration-200 
                         inline-flex items-center justify-center gap-1.5 text-xs font-medium w-32"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Plus className="w-3 h-3" />
                {profileImage ? 'Change Photo' : 'Upload Photo'}
              </label>
              
              {profileImage && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setTempImage(profileImage);
                      setShowCropper(true);
                    }}
                    className="px-3 py-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-50 
                             border border-gray-300 rounded-md transition-colors duration-200
                             inline-flex items-center justify-center gap-1.5 text-xs w-32"
                  >
                    <Edit className="w-3 h-3" />
                    Adjust Crop
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to remove this photo?')) {
                        setProfileImage('');
                        setFormData(prev => ({
                          ...prev,
                          profileImage: ''
                        }));
                      }
                    }}
                    className="px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50
                             border border-red-200 rounded-md transition-colors duration-200
                             inline-flex items-center justify-center gap-1.5 text-xs w-32"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove Photo
                  </button>
                </>
              )}
              
              <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                <p className="font-medium">Photo requirements:</p>
                <ul className="list-disc list-inside pl-2 space-y-0.5 text-[11px]">
                  <li>Square image recommended</li>
                  <li>At least 400x400 pixels</li>
                  <li>Maximum size of 5MB</li>
                  <li>JPG, PNG, or GIF format</li>
                </ul>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="flex-1 border rounded-lg p-4 bg-white shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Card Preview</h4>
              <div className="border rounded-lg p-6 bg-white">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt={formData.name || 'Preview'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {formData.name ? formData.name.split(' ').map(n => n[0]).join('') : 'AB'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {formData.type ? (
                            <>
                              {getTitleAbbreviation(formData.type)} {formData.name || 'Clergy Name'}
                            </>
                          ) : (
                            formData.name || 'Clergy Name'
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formData.role || 'Role'}
                        </p>
                        {formData.ordinationDate && (
                          <p className="text-sm text-gray-500">
                            Ordained {new Date(formData.ordinationDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      {formData.currentAssignment && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="h-4 w-4 mr-2" />
                          <span>{formData.currentAssignment}</span>
                        </div>
                      )}
                      {formData.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{formData.email}</span>
                        </div>
                      )}
                      {formData.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{formData.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                This is how the clergy card will appear in the directory
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Clergy Type</label>
              <select
                value={formData.type}
                onChange={handleTypeChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                {CLERGY_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <div className="space-y-2">
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    role: e.target.value
                  }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                
                <button
                  type="button"
                  onClick={() => setIsAddingRole(true)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" /> Add Role
                </button>
              </div>

              {/* Role Management UI */}
              {isAddingRole && (
                <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                      placeholder="Enter new role"
                    />
                    <button
                      type="button"
                      onClick={handleAddRole}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingRole(false);
                        setNewRole('');
                      }}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-600">Current Roles:</div>
                    <div className="flex flex-wrap gap-2">
                      {roles.map(role => (
                        <div
                          key={role}
                          className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border"
                        >
                          <span className="text-sm">{role}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRole(role)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <div className="flex items-center gap-4">
              <div className="flex gap-2 w-[400px]">
                <div className="w-20">
                  <input
                    type="text"
                    value={CLERGY_TYPES.find(t => t.value === formData.type)?.title || ''}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                    disabled
                  />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  className="flex-1 px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="w-[300px] text-base text-gray-600 font-bold text-center">
                {formData.name && (
                  <div>
                    <div className="whitespace-nowrap">
                      {CLERGY_TYPES.find(t => t.value === formData.type)?.title} {formData.name}
                    </div>
                    {formData.role && (
                      <div className="text-sm text-gray-500 mt-1">{formData.role}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Patron Saint Day</label>
            <div className="flex gap-4">
              <div className="w-[140px]">
                <select
                  value={formData.patronSaintDay?.date?.split('/')[0] || ''}
                  onChange={(e) => {
                    const month = e.target.value;
                    const currentDay = formData.patronSaintDay?.date?.split('/')[1] || '';
                    const daysInMonth = getDaysInMonth(month);
                    
                    const isValidDay = daysInMonth.some(day => day.value === currentDay);
                    const newDay = isValidDay ? currentDay : '';
                    
                    setFormData(prev => ({
                      ...prev,
                      patronSaintDay: {
                        ...prev.patronSaintDay,
                        date: month ? `${month}/${newDay}` : '',
                        saint: prev.patronSaintDay?.saint || ''
                      }
                    }));
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Month</option>
                  {MONTHS.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-[90px]">
                <select
                  value={formData.patronSaintDay?.date?.split('/')[1] || ''}
                  onChange={(e) => {
                    const month = formData.patronSaintDay?.date?.split('/')[0] || '';
                    const day = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      patronSaintDay: {
                        ...prev.patronSaintDay,
                        date: month ? `${month}/${day}` : '',
                        saint: prev.patronSaintDay?.saint || ''
                      }
                    }));
                  }}
                  disabled={!formData.patronSaintDay?.date?.split('/')[0]}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                >
                  <option value="">Day</option>
                  {getDaysInMonth(formData.patronSaintDay?.date?.split('/')[0] || '').map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-[80px]">
                <input
                  type="text"
                  value={formData.patronSaintDay?.date || ''}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                  placeholder="MM/DD"
                  disabled
                />
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Saint Name"
                  value={formData.patronSaintDay?.saint || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    patronSaintDay: {
                      ...prev.patronSaintDay,
                      date: prev.patronSaintDay?.date || '',
                      saint: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Birthday</label>
              <input
                type="date"
                value={formData.birthday ? formData.birthday.split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  birthday: e.target.value
                }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ordination Date</label>
              <input
                type="date"
                value={formData.ordinationDate ? formData.ordinationDate.split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  ordinationDate: e.target.value
                }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  status: e.target.value as Clergy['status']
                }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Assignment Type</label>
              <select
                value={assignmentType}
                onChange={(e) => {
                  const newType = e.target.value as AssignmentType;
                  setAssignmentType(newType);
                  setFormData(prev => ({
                    ...prev,
                    currentAssignment: ''
                  }));
                  setSelectedDeaneryId('');
                }}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="Parish">Parish</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Current Assignment</label>
            {assignmentType === 'Other' ? (
              <input
                type="text"
                value={formData.currentAssignment}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  currentAssignment: e.target.value
                }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter assignment"
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedDeaneryId}
                  onChange={(e) => handleDeaneryChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Deanery</option>
                  {deaneries.map(deanery => (
                    <option key={deanery.id} value={deanery.id}>
                      {deanery.name}
                    </option>
                  ))}
                </select>

                <select
                  value={formData.currentAssignment || ''}
                  onChange={(e) => handleParishChange(e.target.value)}
                  disabled={!selectedDeaneryId}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                  required
                >
                  <option value="">Select Parish</option>
                  {parishes.map(parish => (
                    <option key={parish.id} value={parish.name}>
                      {parish.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Contact Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <input
                id="contactEmail"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                }}
                onBlur={(e) => {
                  const emailError = validateEmail(e.target.value);
                  setErrors(prev => ({ ...prev, email: emailError }));
                }}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg transition-colors",
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
                value={formData.phone}
                onChange={(e) => {
                  // Format the phone number as they type
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 6) {
                    value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6,10)}`;
                  } else if (value.length >= 3) {
                    value = `(${value.slice(0,3)}) ${value.slice(3)}`;
                  }
                  setFormData(prev => ({ ...prev, phone: value }));
                }}
                onBlur={(e) => {
                  const phoneError = validatePhone(e.target.value);
                  setErrors(prev => ({ ...prev, phone: phoneError }));
                }}
                placeholder="(123) 456-7890"
                className={cn(
                  "w-full px-3 py-2 border rounded-lg transition-colors",
                  errors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                )}
                maxLength={14} // (XXX) XXX-XXXX = 14 characters
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label>Address (Optional)</Label>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3">
                    <Label htmlFor="street" className="text-sm text-gray-600">Street</Label>
                    <input
                      id="street"
                      type="text"
                      value={formData.address?.street || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          street: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Street address"
                    />
                  </div>

                  <div className="col-span-1">
                    <Label htmlFor="suite" className="text-sm text-gray-600">Suite/Apt/Unit</Label>
                    <input
                      id="suite"
                      type="text"
                      value={formData.address?.suite || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          suite: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Suite"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <Label htmlFor="city" className="text-sm text-gray-600">City</Label>
                    <input
                      id="city"
                      type="text"
                      value={formData.address?.city || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          city: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-sm text-gray-600">State</Label>
                    <select
                      id="state"
                      value={formData.address?.state || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          state: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select State</option>
                      {STATE_ABBREVIATIONS.map(state => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="zip" className="text-sm text-gray-600">ZIP Code</Label>
                    <input
                      id="zip"
                      type="text"
                      value={formData.address?.zip || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                        setFormData(prev => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            zip: value
                          }
                        }));
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="ZIP"
                      maxLength={5}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spouse Information */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-lg font-semibold">Spouse Information</h3>
            <button
              type="button"
              onClick={() => {
                if (formData.type === 'Bishop') return; // Prevent clicking if Bishop
                setShowSpouse(!showSpouse);
                if (!showSpouse) {
                  setFormData(prev => ({
                    ...prev,
                    spouse: {
                      name: '',
                      email: '',
                      nameDay: ''
                    }
                  }));
                } else {
                  setFormData(prev => ({
                    ...prev,
                    spouse: undefined
                  }));
                }
              }}
              disabled={formData.type === 'Bishop'}
              className={`px-4 py-2 text-sm font-medium rounded-lg
                ${formData.type === 'Bishop' 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
              {formData.type === 'Bishop' 
                ? 'Not Available for Bishops'
                : showSpouse ? 'Remove Spouse' : 'Add Spouse'
              }
            </button>
          </div>

          {showSpouse && formData.type !== 'Bishop' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <div className="flex gap-2">
                  <div className="w-20">
                    <input
                      type="text"
                      value={CLERGY_TYPES.find(t => t.value === formData.type)?.spouseTitle || ''}
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                      disabled
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.spouse?.name || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      spouse: {
                        ...prev.spouse!,
                        name: e.target.value
                      }
                    }))}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    required={showSpouse}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.spouse?.email || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      spouse: {
                        ...prev.spouse!,
                        email: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Birthday</label>
                  <input
                    type="date"
                    value={formData.spouse?.birthday || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      spouse: {
                        ...prev.spouse!,
                        birthday: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="text-sm text-gray-500 mt-2">
                <p>Title will be automatically set based on clergy role:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Priest's wife: Khoria (Kh.)</li>
                  <li>Deacon's wife: Shamassy (Sh.)</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Spouse's Patron Saint Day</label>
                <div className="flex gap-4">
                  <div className="w-[140px]">
                    <select
                      value={formData.spouse?.patronSaintDay?.date?.split('/')[0] || ''}
                      onChange={(e) => {
                        const month = e.target.value;
                        const currentDay = formData.spouse?.patronSaintDay?.date?.split('/')[1] || '';
                        const daysInMonth = getDaysInMonth(month);
                        
                        const isValidDay = daysInMonth.some(day => day.value === currentDay);
                        const newDay = isValidDay ? currentDay : '';
                        
                        setFormData(prev => ({
                          ...prev,
                          spouse: {
                            ...prev.spouse!,
                            patronSaintDay: {
                              ...prev.spouse?.patronSaintDay,
                              date: month ? `${month}/${newDay}` : '',
                              saint: prev.spouse?.patronSaintDay?.saint || ''
                            }
                          }
                        }));
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Month</option>
                      {MONTHS.map(month => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-[90px]">
                    <select
                      value={formData.spouse?.patronSaintDay?.date?.split('/')[1] || ''}
                      onChange={(e) => {
                        const month = formData.spouse?.patronSaintDay?.date?.split('/')[0] || '';
                        const day = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          spouse: {
                            ...prev.spouse!,
                            patronSaintDay: {
                              ...prev.spouse?.patronSaintDay,
                              date: month ? `${month}/${day}` : '',
                              saint: prev.spouse?.patronSaintDay?.saint || ''
                            }
                          }
                        }));
                      }}
                      disabled={!formData.spouse?.patronSaintDay?.date?.split('/')[0]}
                      className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                    >
                      <option value="">Day</option>
                      {getDaysInMonth(formData.spouse?.patronSaintDay?.date?.split('/')[0] || '').map(day => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-[80px]">
                    <input
                      type="text"
                      value={formData.spouse?.patronSaintDay?.date || ''}
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                      placeholder="MM/DD"
                      disabled
                    />
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Saint Name"
                      value={formData.spouse?.patronSaintDay?.saint || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        spouse: {
                          ...prev.spouse!,
                          patronSaintDay: {
                            ...prev.spouse?.patronSaintDay,
                            date: prev.spouse?.patronSaintDay?.date || '',
                            saint: e.target.value
                          }
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Children Information */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-lg font-semibold">Children</h3>
            <button
              type="button"
              onClick={() => {
                setShowChildren(!showChildren);
                if (!showChildren) {
                  setChildren([{ name: '', birthday: '' }]);
                } else {
                  setChildren([]);
                }
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {showChildren ? 'Remove Children' : 'Add Children'}
            </button>
          </div>

          {showChildren && (
            <div className="space-y-4">
              {children.map((child, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Child {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeChild(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        value={child.name}
                        onChange={(e) => {
                          const newChildren = [...children];
                          newChildren[index] = {
                            ...newChildren[index],
                            name: e.target.value
                          };
                          setChildren(newChildren);
                        }}
                        className="w-full px-3 py-2 border rounded-lg"
                        required={showChildren}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Birthday</label>
                      <input
                        type="date"
                        value={child.birthday}
                        onChange={(e) => {
                          const newChildren = [...children];
                          newChildren[index] = {
                            ...newChildren[index],
                            birthday: e.target.value
                          };
                          setChildren(newChildren);
                        }}
                        className="w-full px-3 py-2 border rounded-lg"
                        required={showChildren}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Child's Patron Saint Day</label>
                    <div className="flex gap-4">
                      <div className="w-[140px]">
                        <select
                          value={child.patronSaintDay?.date?.split('/')[0] || ''}
                          onChange={(e) => {
                            const month = e.target.value;
                            const currentDay = child.patronSaintDay?.date?.split('/')[1] || '';
                            const daysInMonth = getDaysInMonth(month);
                            
                            const isValidDay = daysInMonth.some(day => day.value === currentDay);
                            const newDay = isValidDay ? currentDay : '';
                            
                            const newChildren = [...children];
                            newChildren[index] = {
                              ...newChildren[index],
                              patronSaintDay: {
                                ...newChildren[index].patronSaintDay,
                                date: month ? `${month}/${newDay}` : '',
                                saint: newChildren[index].patronSaintDay?.saint || ''
                              }
                            };
                            setChildren(newChildren);
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="">Month</option>
                          {MONTHS.map(month => (
                            <option key={month.value} value={month.value}>
                              {month.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="w-[90px]">
                        <select
                          value={child.patronSaintDay?.date?.split('/')[1] || ''}
                          onChange={(e) => {
                            const month = child.patronSaintDay?.date?.split('/')[0] || '';
                            const day = e.target.value;
                            const newChildren = [...children];
                            newChildren[index] = {
                              ...newChildren[index],
                              patronSaintDay: {
                                ...newChildren[index].patronSaintDay,
                                date: month ? `${month}/${day}` : '',
                                saint: newChildren[index].patronSaintDay?.saint || ''
                              }
                            };
                            setChildren(newChildren);
                          }}
                          disabled={!child.patronSaintDay?.date?.split('/')[0]}
                          className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                        >
                          <option value="">Day</option>
                          {getDaysInMonth(child.patronSaintDay?.date?.split('/')[0] || '').map(day => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-[80px]">
                        <input
                          type="text"
                          value={child.patronSaintDay?.date || ''}
                          className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                          placeholder="MM/DD"
                          disabled
                        />
                      </div>

                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Saint Name"
                          value={child.patronSaintDay?.saint || ''}
                          onChange={(e) => {
                            const newChildren = [...children];
                            newChildren[index] = {
                              ...newChildren[index],
                              patronSaintDay: {
                                ...newChildren[index].patronSaintDay,
                                date: newChildren[index].patronSaintDay?.date || '',
                                saint: e.target.value
                              }
                            };
                            setChildren(newChildren);
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setChildren([...children, { name: '', birthday: '' }])}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Child
              </button>
            </div>
          )}
        </div>

        <div className="text-gray-600 mt-2">
          Preview: {formData.initials} {formData.name}
          {formData.role && (
            <div className="text-sm text-gray-500 ml-12">
              {formData.role}
              {formData.patronSaintDay && (
                <div className="text-sm">
                  Patron Saint: {formData.patronSaintDay.saint} ({formData.patronSaintDay.date})
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-6">
          {initialData && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${initialData.name}?`)) {
                  onDelete(initialData.id);
                }
              }}
              className="px-4 py-2 text-red-600 hover:text-red-700"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>

      <DeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        clergyName={initialData?.name || ''}
      />

      {showCropper && (
        <ImageCropper
          image={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setTempImage('');
          }}
        />
      )}
    </div>
  );
} 