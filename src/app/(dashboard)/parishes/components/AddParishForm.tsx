'use client'
import { useState } from 'react'
import { X } from 'lucide-react'

interface ParishFormData {
  id?: string;
  name: string;
  location: string;
  status: 'Active' | 'Inactive';
  clergy: string;
  email: string;
  phone: string;
  address: string;
}

interface AddParishFormProps {
  initialData?: ParishFormData;
  onClose: () => void;
  onSave: (data: ParishFormData) => void;
  onDelete?: (id: string) => void;
}

export function AddParishForm({ initialData, onClose, onSave, onDelete }: AddParishFormProps) {
  const [formData, setFormData] = useState<ParishFormData>(() => {
    if (initialData) return initialData;
    
    return {
      name: '',
      location: '',
      status: 'Active',
      clergy: '',
      email: '',
      phone: '',
      address: ''
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {initialData ? 'Edit Parish' : 'Add New Parish'}
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
              <label className="block text-sm font-medium mb-1">Parish Name</label>
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
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: e.target.value
                }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Clergy</label>
              <input
                type="text"
                value={formData.clergy}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  clergy: e.target.value
                }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  status: e.target.value as 'Active' | 'Inactive'
                }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
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

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                address: e.target.value
              }))}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          {initialData && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(initialData.id!)}
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
    </div>
  );
} 
 