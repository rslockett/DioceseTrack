'use client'
import { useState } from 'react'
import { X, Plus, Trash } from 'lucide-react'
import { DeleteDialog } from './DeleteDialog'

interface PersonData {
  name: string;
  birthday?: string; // MM/DD format
  patronSaintDay?: {
    date: string; // MM/DD format
    saint: string;
  };
}

interface ClergyFormData {
  id?: string;
  name: string;
  role: 'Bishop' | 'Priest' | 'Deacon';
  ordained: string;
  status: 'Active' | 'Inactive' | 'Retired';
  currentAssignment: string;
  email: string;
  phone: string;
  initials: string;
  nameDay: string;
  patronSaintDay?: {
    date: string;
    saint: string;
  };
  spouse?: {
    name: string;
    birthday?: string;
    patronSaintDay?: {
      date: string;
      saint: string;
    };
  };
  children?: Array<{
    name: string;
    birthday?: string;
    patronSaintDay?: {
      date: string;
      saint: string;
    };
  }>;
}

interface AddClergyFormProps {
  initialData?: ClergyFormData;
  onClose: () => void;
  onSave: (data: ClergyFormData) => void;
  onDelete?: (id: string) => void;
}

export function AddClergyForm({ initialData, onClose, onSave, onDelete }: AddClergyFormProps) {
  console.log('Form initialData:', initialData);

  const [formData, setFormData] = useState<ClergyFormData>(() => {
    console.log('Setting initial form data:', initialData);
    if (initialData) {
      return {
        ...initialData,
        spouse: initialData.spouse ? {
          ...initialData.spouse,
          patronSaintDay: initialData.spouse.patronSaintDay || undefined,
          birthday: initialData.spouse.birthday || ''
        } : undefined,
        children: initialData.children?.map(child => ({
          ...child,
          patronSaintDay: child.patronSaintDay || undefined,
          birthday: child.birthday || ''
        })) || []
      };
    }
    
    return {
      name: '',
      role: 'Priest',
      ordained: '',
      status: 'Active',
      currentAssignment: '',
      email: '',
      phone: '',
      initials: '',
      nameDay: '',
      patronSaintDay: undefined,
      spouse: undefined,
      children: []
    };
  });

  const [showSpouse, setShowSpouse] = useState(!!initialData?.spouse);
  const [showChildren, setShowChildren] = useState(!!initialData?.children?.length);
  const [children, setChildren] = useState(initialData?.children || []);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate initials from name
    const names = formData.name.split(' ');
    const initials = names.map(n => n[0]).join('');
    
    // Prepare spouse data with correct title
    let spouseData;
    if (showSpouse && formData.spouse) {
      const spouseTitle = formData.role === 'Deacon' ? 'Sh.' : 'Kh.';
      spouseData = {
        ...formData.spouse,
        name: `${spouseTitle} ${formData.spouse.name}`
      };
    }
    
    // Filter out any empty children entries
    const validChildren = showChildren 
      ? children.filter(child => child.name.trim() !== '' && child.birthday !== '')
      : undefined;
    
    const dataToSave = {
      ...formData,
      initials,
      spouse: spouseData,
      children: validChildren
    };
    
    onSave(dataToSave);
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
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Patron Saint Day (MM/DD)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="MM/DD"
                  value={formData.patronSaintDay?.date || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/.test(value)) {
                      setFormData(prev => ({
                        ...prev,
                        patronSaintDay: {
                          ...prev.patronSaintDay,
                          date: value,
                          saint: prev.patronSaintDay?.saint || ''
                        }
                      }));
                    }
                  }}
                  className="w-1/3 px-3 py-2 border rounded-lg"
                />
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
                  className="w-2/3 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => {
                  const newRole = e.target.value as ClergyFormData['role'];
                  if (newRole === 'Bishop') {
                    // Remove spouse data and hide spouse section if Bishop is selected
                    setShowSpouse(false);
                    setFormData(prev => ({
                      ...prev,
                      role: newRole,
                      spouse: undefined
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      role: newRole
                    }));
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="Bishop">Bishop</option>
                <option value="Priest">Priest</option>
                <option value="Deacon">Deacon</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Ordained Date</label>
              <input
                type="date"
                value={formData.ordained}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  ordained: e.target.value
                }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
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
                  status: e.target.value as ClergyFormData['status']
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
              <label className="block text-sm font-medium mb-1">Current Assignment</label>
              <input
                type="text"
                value={formData.currentAssignment}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  currentAssignment: e.target.value
                }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                address: e.target.value
              }))}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  phone: e.target.value
                }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
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
                if (formData.role === 'Bishop') return; // Prevent clicking if Bishop
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
              disabled={formData.role === 'Bishop'}
              className={`px-4 py-2 text-sm font-medium rounded-lg
                ${formData.role === 'Bishop' 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
              {formData.role === 'Bishop' 
                ? 'Not Available for Bishops'
                : showSpouse ? 'Remove Spouse' : 'Add Spouse'
              }
            </button>
          </div>

          {showSpouse && formData.role !== 'Bishop' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
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
                  className="w-full px-3 py-2 border rounded-lg"
                  required={showSpouse}
                />
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
                <label className="block text-sm font-medium mb-1">Spouse's Patron Saint Day (MM/DD)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="MM/DD"
                    value={formData.spouse?.patronSaintDay?.date || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/.test(value)) {
                        setFormData(prev => ({
                          ...prev,
                          spouse: {
                            ...prev.spouse!,
                            patronSaintDay: {
                              ...prev.spouse?.patronSaintDay,
                              date: value,
                              saint: prev.spouse?.patronSaintDay?.saint || ''
                            }
                          }
                        }));
                      }
                    }}
                    className="w-1/3 px-3 py-2 border rounded-lg"
                  />
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
                    className="w-2/3 px-3 py-2 border rounded-lg"
                  />
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

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Child's Patron Saint Day (MM/DD)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="MM/DD"
                          value={child.patronSaintDay?.date || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/.test(value)) {
                              const newChildren = [...children];
                              newChildren[index] = {
                                ...newChildren[index],
                                patronSaintDay: {
                                  ...newChildren[index].patronSaintDay,
                                  date: value,
                                  saint: newChildren[index].patronSaintDay?.saint || ''
                                }
                              };
                              setChildren(newChildren);
                            }
                          }}
                          className="w-1/3 px-3 py-2 border rounded-lg"
                        />
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
                          className="w-2/3 px-3 py-2 border rounded-lg"
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
    </div>
  );
} 