'use client'

import React, { useState, useEffect } from 'react';
import type { Clergy } from '@/types/clergy';
import { 
  Users2, Church, Map, FileStack, Settings, LogOut, Search,
  Filter, Mail, Phone, Building, Plus, Calendar, Download,
  ChevronDown, ChevronUp, Users, MapPin, Edit, Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AddClergyForm } from './components/AddClergyForm';
import { MapLink } from '@/components/MapLink';

interface ClergyCardProps {
  clergy: Clergy;
  onEdit: (clergy: Clergy) => void;
  onDelete: (id: string) => void;
}

const ClergyCard = ({ clergy, onEdit, onDelete }: ClergyCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const getSpouseTitle = (role) => {
    if (!role) return '';
    
    switch (role.toLowerCase()) {
      case 'priest':
        return 'Kh.';
      case 'deacon':
        return 'Sh.';
      default:
        return '';
    }
  };

  const spouseTitle = getSpouseTitle(clergy.role);

  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete ${clergy.name}?`)) {
      onDelete(clergy.id);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // Remove any duplicate T00:00:00 strings
    const cleanDate = dateString.replace(/T00:00:00T00:00:00/, 'T00:00:00');
    
    try {
      return new Date(cleanDate).toLocaleDateString();
    } catch (e) {
      console.error('Date parsing error:', e);
      return dateString;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            {clergy.profileImage ? (
              <img 
                src={clergy.profileImage} 
                alt={clergy.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">{clergy.initials}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  {getTitleAbbreviation(clergy.type)} {clergy.name}
                </h3>
                <p className="text-sm text-gray-600">{clergy.role}</p>
                {clergy.ordinationDate && (
                  <p className="text-sm text-gray-500">
                    Ordained {formatDate(clergy.ordinationDate)}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(clergy)}
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
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  <span>{clergy.currentAssignment}</span>
                </div>
                {clergy.address && (
                  <MapLink address={`${clergy.currentAssignment}, ${clergy.address.street}, ${clergy.address.city}, ${clergy.address.state} ${clergy.address.zip}`} />
                )}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <a href={`mailto:${clergy.email}`} className="text-blue-600 hover:underline">
                  {clergy.email}
                </a>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{clergy.phone}</span>
              </div>
              {clergy.nameDay && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Name Day: {clergy.nameDay.date ? clergy.nameDay.date : clergy.nameDay} 
                    {clergy.nameDay.saint && ` - ${clergy.nameDay.saint}`}
                  </span>
                </div>
              )}
              {clergy.birthday && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Birthday: {formatDate(clergy.birthday)}</span>
                </div>
              )}
              {clergy.patronSaintDay && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    Patron Saint Day: {clergy.patronSaintDay.date} - {clergy.patronSaintDay.saint}
                  </span>
                </div>
              )}
              {clergy.ordinationDate && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    Ordained: {formatDate(clergy.ordinationDate)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <Users className="h-4 w-4 mr-2" />
                <span>Family Members</span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </button>
            </div>

            {isExpanded && (
              <div className="mt-4 pl-4 border-l-2 border-blue-100">
                {clergy.spouse && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700">Spouse</h4>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm">
                        {spouseTitle} {clergy.spouse.name}
                      </p>
                      {clergy.spouse.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-3 w-3 mr-2" />
                          <a href={`mailto:${clergy.spouse.email}`} className="text-blue-600 hover:underline">
                            {clergy.spouse.email}
                          </a>
                        </div>
                      )}
                      {clergy.spouse.nameDay && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-3 w-3 mr-2" />
                          <span>Name Day: {clergy.spouse.nameDay}</span>
                        </div>
                      )}
                      {clergy.spouse.birthday && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-3 w-3 mr-2" />
                          <span>Birthday: {formatDate(clergy.spouse.birthday)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {clergy.children && clergy.children.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700">Children</h4>
                    <div className="mt-2 space-y-3">
                      {clergy.children.map((child, index) => (
                        <div key={index} className="text-sm space-y-1">
                          <p className="font-medium">{child.name}</p>
                          {child.birthday && (
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-3 w-3 mr-2" />
                              <span>Birthday: {formatDate(child.birthday)}</span>
                            </div>
                          )}
                          {child.nameDay && (
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-3 w-3 mr-2" />
                              <span>Name Day: {child.nameDay}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ClergyDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClergy, setEditingClergy] = useState<Clergy | null>(null);
  const [clergyList, setClergyList] = useState<Clergy[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    try {
      const currentUserStr = localStorage.getItem('currentUser')
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null
      
      // Get all clergy records
      const allClergy = JSON.parse(localStorage.getItem('clergy') || '[]')
      
      // Filter based on user role
      if (currentUser?.role === 'user') {
        // Clergy users only see their own record
        const userClergy = allClergy.filter(clergy => 
          clergy.email === currentUser.email
        )
        setClergyList(userClergy)
      } else {
        // Admin and staff see all records
        setClergyList(allClergy)
      }
    } catch (error) {
      console.error('Error loading clergy:', error)
    }
  }, [])

  useEffect(() => {
    // Get current user from localStorage
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }
  }, [])

  const handleEdit = (clergy) => {
    setEditingClergy(clergy);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingClergy(null);
  };

  const handleSaveClergy = async (formData: Clergy) => {
    console.log('1. Starting save process with formData:', formData);

    // Validate required fields
    if (!formData.name || !formData.type) {
      console.log('2. Validation failed');
      alert('Name and Clergy Type are required fields');
      return;
    }

    const processedData = {
      ...formData,
      id: formData.id || crypto.randomUUID(),
    };

    try {
      // Update clergy list
      const updatedClergyList = editingClergy
        ? clergyList.map(c => c.id === editingClergy.id ? processedData : c)
        : [...clergyList, processedData];

      // Handle parish assignment
      if (formData.currentAssignment && formData.assignmentType === 'Parish') {
        console.log('5. Handling parish assignment:', formData.currentAssignment);
        const parishes = JSON.parse(localStorage.getItem('parishes') || '[]');
        const updatedParishes = parishes.map(parish => {
          if (parish.name === formData.currentAssignment) {
            // Remove clergy from previous assignments if any
            const otherParishes = parishes.filter(p => p.name !== formData.currentAssignment);
            otherParishes.forEach(p => {
              if (p.assignedClergy) {
                p.assignedClergy = p.assignedClergy.filter(c => c.id !== processedData.id);
              }
            });

            // Add or update clergy in current parish
            const clergyAssignment = {
              id: processedData.id,
              name: processedData.name,
              role: processedData.role || 'Pastor',
              type: processedData.type,
              dateAssigned: new Date().toISOString()
            };

            return {
              ...parish,
              assignedClergy: parish.assignedClergy 
                ? [...parish.assignedClergy.filter(c => c.id !== processedData.id), clergyAssignment]
                : [clergyAssignment]
            };
          }
          return parish;
        });

        localStorage.setItem('parishes', JSON.stringify(updatedParishes));
      }

      // Save clergy updates
      localStorage.setItem('clergy', JSON.stringify(updatedClergyList));
      
      // Update state
      setClergyList(updatedClergyList);
      setShowAddForm(false);
      setEditingClergy(null);

    } catch (error) {
      console.error('Error saving clergy:', error);
      alert('There was an error saving the changes. Please try again.');
    }
  };

  const hasValidName = (clergy: any): clergy is { name: string } => {
    return clergy && typeof clergy.name === 'string';
  };

  const filteredClergy = clergyList.filter(clergy => 
    hasValidName(clergy) && clergy.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (clergyId) => {
    console.log('1. Starting delete process for clergyId:', clergyId);
    
    try {
      // Get current clergy and users from localStorage
      const existingClergy = JSON.parse(localStorage.getItem('clergy') || '[]');
      const existingUsers = JSON.parse(localStorage.getItem('userAuth') || '[]');
      console.log('2. Current users:', existingUsers);
      
      // Filter out the deleted clergy
      const updatedClergy = existingClergy.filter(clergy => clergy.id !== clergyId);
      
      // Filter out the associated user
      const updatedUsers = existingUsers.filter(user => user.clergyId !== clergyId);
      console.log('3. Updated users list:', updatedUsers);
      
      // Update localStorage
      localStorage.setItem('clergy', JSON.stringify(updatedClergy));
      localStorage.setItem('userAuth', JSON.stringify(updatedUsers));
      console.log('4. Storage updated successfully');
      
      // Update state
      setClergyList(updatedClergy);
      
      // Close any open forms
      setShowAddForm(false);
      setEditingClergy(null);
      
      console.log('5. Delete process completed successfully');
    } catch (error) {
      console.error('Error during delete process:', error);
      alert('There was an error deleting the record. Please try again.');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Clergy Directory</h1>
        <div className="flex gap-4">
          {(currentUser?.role === 'admin' || currentUser?.role === 'staff') && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Clergy
            </button>
          )}
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search clergy..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Clergy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClergy.map((clergy) => (
          <ClergyCard 
            key={clergy.id}
            clergy={clergy}
            onEdit={(clergy) => {
              setEditingClergy(clergy);
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
            <AddClergyForm
              initialData={editingClergy}
              onClose={handleCloseForm}
              onSave={handleSaveClergy}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClergyDirectory;
