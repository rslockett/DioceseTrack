'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Download, MapPin, Phone, Mail, Users, Building, ChevronRight, Edit } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AddDeaneryForm } from './components/AddDeaneryForm'

// Define mock data first
const mockDeaneries = [
  {
    id: '1', // Add IDs to mock data
    name: "Metropolitan Deanery",
    region: "New York City",
    status: "Active",
    dean: "Very Rev. John Smith",
    parishCount: 12,
    email: "metro@diocese.org",
    coverage: "Manhattan, Brooklyn, Queens"
  },
  {
    id: '2',
    name: "Hudson Valley Deanery",
    region: "Hudson Valley",
    status: "Active",
    dean: "Very Rev. Michael Johnson",
    parishCount: 8,
    email: "hudsonvalley@diocese.org",
    coverage: "Westchester, Rockland, Orange Counties"
  }
];

const DeaneryCard = ({ deanery, onEdit }) => {
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
                <h3 className="font-semibold text-lg">{deanery.name}</h3>
                <p className="text-sm text-gray-600">{deanery.region}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(deanery)}
                  className="p-2 text-gray-600 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  deanery.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {deanery.status}
                </span>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>Dean: {deanery.dean}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Building className="h-4 w-4 mr-2" />
                <span>Parishes: {deanery.parishCount}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <a href={`mailto:${deanery.email}`} className="text-blue-600 hover:underline">
                  {deanery.email}
                </a>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{deanery.coverage}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <a href="#" className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                View Parishes
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const DeaneriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDeanery, setEditingDeanery] = useState(null)
  const [deaneryList, setDeaneryList] = useState(mockDeaneries)

  // Move localStorage check to useEffect
  useEffect(() => {
    const saved = localStorage.getItem('deaneries')
    if (saved) {
      setDeaneryList(JSON.parse(saved))
    }
  }, [])

  // Add filtered deaneries based on search term
  const filteredDeaneries = deaneryList.filter(deanery => {
    const searchLower = searchTerm.toLowerCase();
    return (
      deanery.name.toLowerCase().includes(searchLower) ||
      deanery.region.toLowerCase().includes(searchLower) ||
      deanery.dean.toLowerCase().includes(searchLower) ||
      deanery.coverage.toLowerCase().includes(searchLower)
    );
  });

  const handleSaveDeanery = (formData) => {
    if (formData.id) {
      // Update existing deanery
      const updatedDeaneries = deaneryList.map(deanery =>
        deanery.id === formData.id ? formData : deanery
      );
      setDeaneryList(updatedDeaneries);
      localStorage.setItem('deaneries', JSON.stringify(updatedDeaneries));
    } else {
      // Add new deanery
      const newDeanery = {
        ...formData,
        id: crypto.randomUUID()
      };
      const updatedDeaneries = [...deaneryList, newDeanery];
      setDeaneryList(updatedDeaneries);
      localStorage.setItem('deaneries', JSON.stringify(updatedDeaneries));
    }
    setShowAddForm(false);
    setEditingDeanery(null);
  };

  const handleDelete = (deaneryId) => {
    const updatedDeaneries = deaneryList.filter(deanery => deanery.id !== deaneryId);
    setDeaneryList(updatedDeaneries);
    localStorage.setItem('deaneries', JSON.stringify(updatedDeaneries));
    setShowAddForm(false);
    setEditingDeanery(null);
  };

  const handleEdit = (deanery) => {
    setEditingDeanery(deanery);
    setShowAddForm(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Deaneries</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Deanery
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
            placeholder="Search deaneries by name, region, dean, or coverage..."
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

      {/* Deaneries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDeaneries.map((deanery) => (
          <DeaneryCard 
            key={deanery.id} 
            deanery={deanery} 
            onEdit={(deanery) => {
              setEditingDeanery(deanery);
              setShowAddForm(true);
            }}
          />
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <AddDeaneryForm
              initialData={editingDeanery}
              onClose={() => {
                setShowAddForm(false);
                setEditingDeanery(null);
              }}
              onSave={handleSaveDeanery}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      {/* No Results Message */}
      {filteredDeaneries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No deaneries found matching "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  )
}

export default DeaneriesPage
