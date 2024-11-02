'use client'
import React, { useState, useEffect } from 'react';
import type { Deanery } from '@/types/deanery';
import { Plus, Download, Mail, Phone, Users, Building, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AddDeaneryForm } from './components/AddDeaneryForm';

interface DeaneryCardProps {
  deanery: Deanery;
  onEdit: (deanery: Deanery) => void;
  onDelete: (id: string) => void;
}

const DeaneryCard = ({ deanery, onEdit, onDelete }: DeaneryCardProps) => {
  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete ${deanery.name}?`)) {
      onDelete(deanery.id);
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
                <h3 className="font-semibold text-lg">{deanery.name}</h3>
                <p className="text-sm text-gray-600">Dean: {deanery.deanName || 'Not assigned'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(deanery)}
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
                  deanery.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {deanery.status}
                </span>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="font-semibold">Assigned Parishes:</span>
                </div>
                {deanery.parishes?.length > 0 ? (
                  deanery.parishes.map(parish => (
                    <div key={parish.id} className="ml-6 text-sm text-gray-600">
                      {parish.name} {parish.status && `(${parish.status})`}
                    </div>
                  ))
                ) : (
                  <div className="ml-6 text-sm text-gray-500 italic">
                    No parishes assigned
                  </div>
                )}
              </div>

              {deanery.contactEmail && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href={`mailto:${deanery.contactEmail}`} className="text-blue-600 hover:underline">
                    {deanery.contactEmail}
                  </a>
                </div>
              )}
              {deanery.contactPhone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{deanery.contactPhone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DeaneriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDeanery, setEditingDeanery] = useState<Deanery | null>(null);
  const [deaneryList, setDeaneryList] = useState<Deanery[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('deaneries');
      if (saved) {
        setDeaneryList(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading deaneries:', error);
    }
  }, []);

  const handleSaveDeanery = (formData: Deanery) => {
    console.log('Saving deanery with data:', formData); // Debug log

    const processedData = {
      ...formData,
      id: formData.id || crypto.randomUUID(),
    };

    // Update deaneries list
    const updatedDeaneries = editingDeanery
      ? deaneryList.map(d => d.id === editingDeanery.id ? processedData : d)
      : [...deaneryList, processedData];
    
    localStorage.setItem('deaneries', JSON.stringify(updatedDeaneries));

    // Update related parishes
    const parishes = JSON.parse(localStorage.getItem('parishes') || '[]');
    const updatedParishes = parishes.map(parish => {
      // If parish is in the deanery's parish list, update it
      if (formData.parishes?.includes(parish.id)) {
        return {
          ...parish,
          deaneryId: processedData.id,
          deanery: processedData.name // Make sure this matches your field name
        };
      }
      // If parish was previously in this deanery but isn't anymore, remove the reference
      if (parish.deaneryId === processedData.id && !formData.parishes?.includes(parish.id)) {
        const { deaneryId, deanery, ...rest } = parish;
        return rest;
      }
      return parish;
    });
    localStorage.setItem('parishes', JSON.stringify(updatedParishes));

    // Update related clergy (dean)
    const clergy = JSON.parse(localStorage.getItem('clergy') || '[]');
    const updatedClergy = clergy.map(person => {
      // If this is the new/current dean
      if (person.id === formData.dean) {
        return {
          ...person,
          role: person.role.includes('Dean') ? person.role : `Dean ${person.role}`.trim(),
          deaneryId: processedData.id,
          deaneryName: processedData.name
        };
      }
      // If this person was previously the dean but isn't anymore
      if (person.deaneryId === processedData.id && person.id !== formData.dean) {
        return {
          ...person,
          role: person.role.replace(/\bDean\b/g, '').trim(),
          deaneryId: undefined,
          deaneryName: undefined
        };
      }
      return person;
    });
    localStorage.setItem('clergy', JSON.stringify(updatedClergy));

    setDeaneryList(updatedDeaneries);
    setShowAddForm(false);
    setEditingDeanery(null);
  };

  const handleDelete = (deaneryId: string) => {
    // Get current deaneries from localStorage
    const existingDeaneries = JSON.parse(localStorage.getItem('deaneries') || '[]');
    const deaneryToDelete = existingDeaneries.find(d => d.id === deaneryId);
    
    if (!deaneryToDelete) return;

    // Remove deanery
    const updatedDeaneries = existingDeaneries.filter(deanery => deanery.id !== deaneryId);
    localStorage.setItem('deaneries', JSON.stringify(updatedDeaneries));

    // Update related parishes - remove deanery references
    const parishes = JSON.parse(localStorage.getItem('parishes') || '[]');
    const updatedParishes = parishes.map(parish => {
      if (parish.deaneryId === deaneryId) {
        const { deaneryId, deanery, ...rest } = parish;
        return rest;
      }
      return parish;
    });
    localStorage.setItem('parishes', JSON.stringify(updatedParishes));

    // Update related clergy - remove dean status and references
    const clergy = JSON.parse(localStorage.getItem('clergy') || '[]');
    const updatedClergy = clergy.map(person => {
      if (person.deaneryId === deaneryId) {
        return {
          ...person,
          role: person.role.replace(/\bDean\b/g, '').trim(),
          deaneryId: undefined,
          deaneryName: undefined
        };
      }
      return person;
    });
    localStorage.setItem('clergy', JSON.stringify(updatedClergy));

    setDeaneryList(updatedDeaneries);
    setShowAddForm(false);
    setEditingDeanery(null);
  };

  // Add this utility function to help with data synchronization
  const syncDeaneryRelationships = (deaneryId: string) => {
    const deanery = deaneryList.find(d => d.id === deaneryId);
    if (!deanery) return;

    // Sync parishes
    const parishes = JSON.parse(localStorage.getItem('parishes') || '[]');
    const updatedParishes = parishes.map(parish => {
      if (deanery.parishes?.includes(parish.id)) {
        return {
          ...parish,
          deaneryId: deanery.id,
          deanery: deanery.name
        };
      }
      return parish;
    });
    localStorage.setItem('parishes', JSON.stringify(updatedParishes));

    // Sync clergy (dean)
    if (deanery.dean) {
      const clergy = JSON.parse(localStorage.getItem('clergy') || '[]');
      const updatedClergy = clergy.map(person => {
        if (person.id === deanery.dean) {
          return {
            ...person,
            role: person.role.includes('Dean') ? person.role : `Dean ${person.role}`.trim(),
            deaneryId: deanery.id,
            deaneryName: deanery.name
          };
        }
        return person;
      });
      localStorage.setItem('clergy', JSON.stringify(updatedClergy));
    }
  };

  // Filter deaneries based on search term
  const filteredDeaneries = deaneryList.filter(deanery => {
    const searchLower = searchTerm.toLowerCase();
    return (
      deanery.name.toLowerCase().includes(searchLower) ||
      (deanery.deanName || '').toLowerCase().includes(searchLower) ||
      (deanery.contactEmail || '').toLowerCase().includes(searchLower)
    );
  });

  const syncDeaneryParishes = () => {
    try {
      // Get current data
      const deaneries = JSON.parse(localStorage.getItem('deaneries') || '[]');
      const parishes = JSON.parse(localStorage.getItem('parishes') || '[]');

      // Update deaneries with their parishes
      const updatedDeaneries = deaneries.map(deanery => {
        const deaneryParishes = parishes
          .filter(parish => parish.deaneryId === deanery.id)
          .map(parish => ({
            id: parish.id,
            name: parish.name,
            status: parish.status
          }));

        return {
          ...deanery,
          parishes: deaneryParishes
        };
      });

      // Save updated deaneries
      localStorage.setItem('deaneries', JSON.stringify(updatedDeaneries));
      return updatedDeaneries;
    } catch (error) {
      console.error('Error syncing deanery parishes:', error);
      return null;
    }
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
            placeholder="Search deaneries by name, dean, or email..."
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
            onDelete={handleDelete}
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
  );
};

export default DeaneriesPage;
