'use client'
import React, { useState, useEffect } from 'react';
import type { Parish } from '@/types/parish';
import { Plus, Download, MapPin, Phone, Mail, Users, Building, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AddParishForm } from './components/AddParishForm';

interface ParishCardProps {
  parish: Parish;
  onEdit: (parish: Parish) => void;
  onDelete: (id: string) => void;
}

const ParishCard = ({ parish, onEdit, onDelete }: ParishCardProps) => {
  console.log('Rendering parish card:', parish);

  const [assignedClergy, setAssignedClergy] = useState([]);

  useEffect(() => {
    const allClergy = JSON.parse(localStorage.getItem('clergy') || '[]');
    const clergyDetails = allClergy.filter(c => 
      c.currentAssignment === parish.name && 
      c.deaneryId === parish.deaneryId
    );
    setAssignedClergy(clergyDetails);
  }, [parish.name, parish.deaneryId]);

  const getDeaneryName = () => {
    try {
      return parish.deaneryName || 'No Deanery Assigned';
    } catch (error) {
      console.error('Error getting deanery name:', error);
      return 'Error loading deanery';
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete ${parish.name}?`)) {
      onDelete(parish.id);
    }
  };

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
                <h3 className="font-semibold text-lg">{parish.name || 'Unnamed Parish'}</h3>
                <p className="text-sm text-gray-600">{parish.location || 'No location'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(parish)}
                  className="p-2 text-gray-600 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="p-2 text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  parish.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {parish.status || 'Unknown'}
                </span>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="font-semibold">Assigned Clergy:</span>
                </div>
                {assignedClergy.length > 0 ? (
                  assignedClergy.map(clergy => (
                    <div key={clergy.id} className="ml-6 text-sm text-gray-600">
                      {clergy.type} {clergy.name} - {clergy.role}
                    </div>
                  ))
                ) : (
                  <div className="ml-6 text-sm text-gray-500 italic">
                    No clergy assigned
                  </div>
                )}
              </div>
              {parish.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href={`mailto:${parish.email}`} className="text-blue-600 hover:underline">
                    {parish.email}
                  </a>
                </div>
              )}
              {parish.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{parish.phone}</span>
                </div>
              )}
              {parish.address && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{parish.address}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Building className="h-4 w-4 mr-2" />
                <span>Deanery: {getDeaneryName()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ParishesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingParish, setEditingParish] = useState<Parish | null>(null);
  const [parishList, setParishList] = useState<Parish[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('parishes');
      if (saved) {
        setParishList(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading parishes:', error);
    }
  }, []);

  const handleSaveParish = (formData: Parish) => {
    console.log('Saving parish with data:', formData);

    const processedData = {
      ...formData,
      id: formData.id || crypto.randomUUID(),
    };

    // Update parishes list
    const updatedParishes = editingParish
      ? parishList.map(p => p.id === editingParish.id ? processedData : p)
      : [...parishList, processedData];
    
    localStorage.setItem('parishes', JSON.stringify(updatedParishes));

    // Update clergy assignments
    const clergy = JSON.parse(localStorage.getItem('clergy') || '[]');
    const updatedClergy = clergy.map(person => {
      // If this clergy is assigned to this parish
      if (person.currentAssignment === processedData.name) {
        return {
          ...person,
          deaneryId: processedData.deaneryId,
          deaneryName: processedData.deaneryName
        };
      }
      return person;
    });
    localStorage.setItem('clergy', JSON.stringify(updatedClergy));

    // Update related deanery
    if (formData.deaneryId) {
      const deaneries = JSON.parse(localStorage.getItem('deaneries') || '[]');
      const updatedDeaneries = deaneries.map(deanery => {
        if (deanery.id === formData.deaneryId) {
          // Add this parish to the deanery's parish list if not already there
          const parishes = new Set(deanery.parishes || []);
          parishes.add(processedData.id);
          return {
            ...deanery,
            parishes: Array.from(parishes)
          };
        }
        // Remove this parish from any other deanery that might have it
        if (deanery.parishes?.includes(processedData.id) && deanery.id !== formData.deaneryId) {
          return {
            ...deanery,
            parishes: deanery.parishes.filter(id => id !== processedData.id)
          };
        }
        return deanery;
      });
      localStorage.setItem('deaneries', JSON.stringify(updatedDeaneries));
    }

    // If deanery was removed, clean up old deanery reference
    if (editingParish?.deaneryId && !formData.deaneryId) {
      const deaneries = JSON.parse(localStorage.getItem('deaneries') || '[]');
      const updatedDeaneries = deaneries.map(deanery => {
        if (deanery.id === editingParish.deaneryId) {
          return {
            ...deanery,
            parishes: (deanery.parishes || []).filter(id => id !== processedData.id)
          };
        }
        return deanery;
      });
      localStorage.setItem('deaneries', JSON.stringify(updatedDeaneries));
    }

    setParishList(updatedParishes);
    setShowAddForm(false);
    setEditingParish(null);
  };

  const handleDelete = (parishId: string) => {
    // Get current parishes from localStorage
    const existingParishes = JSON.parse(localStorage.getItem('parishes') || '[]');
    const parishToDelete = existingParishes.find(p => p.id === parishId);
    
    if (!parishToDelete) return;

    // Remove parish
    const updatedParishes = existingParishes.filter(parish => parish.id !== parishId);
    localStorage.setItem('parishes', JSON.stringify(updatedParishes));

    // Update related clergy - remove assignment
    if (parishToDelete.clergyId) {
      const clergy = JSON.parse(localStorage.getItem('clergy') || '[]');
      const updatedClergy = clergy.map(person => {
        if (person.id === parishToDelete.clergyId) {
          const { currentAssignment, ...rest } = person;
          return rest;
        }
        return person;
      });
      localStorage.setItem('clergy', JSON.stringify(updatedClergy));
    }

    // Update related deanery - remove parish from list
    if (parishToDelete.deaneryId) {
      const deaneries = JSON.parse(localStorage.getItem('deaneries') || '[]');
      const updatedDeaneries = deaneries.map(deanery => {
        if (deanery.id === parishToDelete.deaneryId) {
          return {
            ...deanery,
            parishes: (deanery.parishes || []).filter(id => id !== parishId)
          };
        }
        return deanery;
      });
      localStorage.setItem('deaneries', JSON.stringify(updatedDeaneries));
    }

    setParishList(updatedParishes);
    setShowAddForm(false);
    setEditingParish(null);
  };

  // Filter parishes based on search term
  const filteredParishes = parishList.filter(parish => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (parish.name || '').toLowerCase().includes(searchLower) ||
      (parish.location || '').toLowerCase().includes(searchLower) ||
      (parish.clergy || '').toLowerCase().includes(searchLower) ||
      (parish.address || '').toLowerCase().includes(searchLower)
    );
  });

  // Add this console log to debug the filtered results
  console.log('Filtered parishes:', filteredParishes);

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
        {filteredParishes.length > 0 ? (
          filteredParishes.map((parish) => (
            <ParishCard 
              key={parish.id} 
              parish={parish}
              onEdit={(parish) => {
                console.log('Editing parish:', parish);
                setEditingParish(parish);
                setShowAddForm(true);
              }}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <p className="text-gray-500">
              {searchTerm 
                ? `No parishes found matching "${searchTerm}"`
                : 'No parishes available'}
            </p>
          </div>
        )}
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
    </div>
  );
};

export default ParishesPage;
