'use client'
import { useState } from 'react'
import { X } from 'lucide-react'

interface DeaneryFormData {
  id?: string;
  name: string;
  region: string;
  status: 'Active' | 'Inactive';
  dean: string;
  parishCount: number;
  email: string;
  coverage: string;
}

interface AddDeaneryFormProps {
  initialData?: DeaneryFormData;
  onClose: () => void;
  onSave: (data: DeaneryFormData) => void;
  onDelete?: (id: string) => void;
}

export function AddDeaneryForm({ initialData, onClose, onSave, onDelete }: AddDeaneryFormProps) {
  const [formData, setFormData] = useState<DeaneryFormData>(() => {
    if (initialData) return initialData;
    
    return {
      name: '',
      region: '',
      status: 'Active',
      dean: '',
      parishCount: 0,
      email: '',
      coverage: ''
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
          {initialData ? 'Edit Deanery' : 'Add New Deanery'}
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
              <label className="block text-sm font-medium mb-1">Deanery Name</label>
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
              <label className="block text-sm font-medium mb-1">Region</label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  region: e.target.value
                }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Dean</label>
              <input
                type="text"
                value={formData.dean}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dean: e.target.value
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
              <label className="block text-sm font-medium mb-1">Number of Parishes</label>
              <input
                type="number"
                value={formData.parishCount}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  parishCount: parseInt(e.target.value) || 0
                }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Coverage Area</label>
            <textarea
              value={formData.coverage}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                coverage: e.target.value
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