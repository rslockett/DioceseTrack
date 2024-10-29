'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Download, MapPin, Phone, Mail, Users, Building, Edit } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AddParishForm } from './components/AddParishForm'

// Define mock data first
const mockParishes = [
  {
    id: '1',
    name: "St. Mary's Orthodox Cathedral",
    location: "New York, NY",
    status: "Active",
    clergy: "Fr. John Smith",
    email: "office@stmarys.org",
    phone: "(555) 123-4567",
    address: "123 Main St, New York, NY 10001"
  },
  {
    id: '2',
    name: "St. Nicholas Orthodox Church",
    location: "Brooklyn, NY",
    status: "Active",
    clergy: "Fr. Michael Johnson",
    email: "info@stnicholaschurch.org",
    phone: "(555) 234-5678",
    address: "456 Church Ave, Brooklyn, NY 11215"
  }
];

const ParishCard = ({ parish, onEdit }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{parish.name}</h3>
                <p className="text-sm text-gray-600">{parish.location}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(parish)}
                  className="p-2 text-gray-600 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  parish.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {parish.status}
                </span>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>Clergy: {parish.clergy}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <a href={`mailto:${parish.email}`} className="text-blue-600 hover:underline">
                  {parish.email}
                </a>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{parish.phone}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{parish.address}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const ParishesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingParish, setEditingParish] = useState(null)
  const [parishList, setParishList] = useState(mockParishes)

  // Move localStorage check to useEffect
  useEffect(() => {
    const saved = localStorage.getItem('parishes')
    if (saved) {
      setParishList(JSON.parse(saved))
    }
  }, [])

  const handleSaveParish = (formData) => {
    if (formData.id) {
      // Update existing parish
      const updatedParishes = parishList.map(parish =>
        parish.id === formData.id ? formData : parish
      );
      setParishList(updatedParishes);
      localStorage.setItem('parishes', JSON.stringify(updatedParishes));
    } else {
      // Add new parish
      const newParish = {
        ...formData,
        id: crypto.randomUUID()
      };
      const updatedParishes = [...parishList, newParish];
      setParishList(updatedParishes);
      localStorage.setItem('parishes', JSON.stringify(updatedParishes));
    }
    setShowAddForm(false);
    setEditingParish(null);
  };

  const handleDelete = (parishId) => {
    const updatedParishes = parishList.filter(parish => parish.id !== parishId);
    setParishList(updatedParishes);
    localStorage.setItem('parishes', JSON.stringify(updatedParishes));
    setShowAddForm(false);
    setEditingParish(null);
  };

  // Filter parishes based on search term
  const filteredParishes = parishList.filter(parish => {
    const searchLower = searchTerm.toLowerCase();
    return (
      parish.name.toLowerCase().includes(searchLower) ||
      parish.location.toLowerCase().includes(searchLower) ||
      parish.clergy.toLowerCase().includes(searchLower) ||
      parish.address.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Parishes</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Parish
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search parishes by name, location, clergy, or address..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Parishes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredParishes.map((parish) => (
          <ParishCard 
            key={parish.id} 
            parish={parish}
            onEdit={(parish) => {
              setEditingParish(parish);
              setShowAddForm(true);
            }}
          />
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <AddParishForm
              initialData={editingParish}
              onClose={() => {
                setShowAddForm(false);
                setEditingParish(null);
              }}
              onSave={handleSaveParish}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      {/* No Results Message */}
      {filteredParishes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No parishes found matching "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
};

export default ParishesPage;
