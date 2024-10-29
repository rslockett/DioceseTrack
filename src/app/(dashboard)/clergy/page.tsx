'use client'

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  Users2,
  Church,
  Map,
  FileStack,
  Settings,
  LogOut,
  Search,
  Filter,
  Mail,
  Phone,
  Building,
  Plus,
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
  Users,
  MapPin,
  Edit
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AddClergyForm } from './components/AddClergyForm';

const MapLink = ({ address }) => {
  const [mapUrl, setMapUrl] = useState('');
  
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const encodedAddress = encodeURIComponent(address);
    if (isIOS) {
      setMapUrl(`maps://maps.apple.com/?q=${encodedAddress}`);
    } else {
      setMapUrl(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
    }
  }, [address]);

  return (
    <a 
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center text-blue-600 hover:text-blue-700"
    >
      <MapPin className="h-4 w-4 mr-1" />
      <span>View on Map</span>
    </a>
  );
};

const ClergyCard = ({ clergy, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSpouseTitle = (role) => {
    switch (role.toLowerCase()) {
      case 'priest':
        return 'Khoria';
      case 'deacon':
        return 'Shamassy';
      default:
        return '';
    }
  };

  const spouseTitle = getSpouseTitle(clergy.role);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">{clergy.initials}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{clergy.name}</h3>
                <p className="text-sm text-gray-600">{clergy.role}</p>
                <p className="text-sm text-gray-500">Ordained {clergy.ordained}</p>
              </div>
              <button
                onClick={() => onEdit(clergy)}
                className="p-2 text-gray-600 hover:text-blue-600"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  <span>{clergy.currentAssignment}</span>
                </div>
                {clergy.address && (
                  <MapLink address={`${clergy.currentAssignment}, ${clergy.address}`} />
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
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Name Day: {clergy.nameDay}</span>
              </div>
              {clergy.birthday && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Birthday: {clergy.birthday}</span>
                </div>
              )}
              {clergy.patronSaintDay && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Patron Saint Day: {clergy.patronSaintDay}</span>
                  {clergy.patronSaint && (
                    <span className="ml-1 text-blue-600">({clergy.patronSaint})</span>
                  )}
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
                    <h4 className="text-sm font-semibold text-gray-700">{spouseTitle}</h4>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm">{clergy.spouse.name}</p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-3 w-3 mr-2" />
                        <a href={`mailto:${clergy.spouse.email}`} className="text-blue-600 hover:underline">
                          {clergy.spouse.email}
                        </a>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-3 w-3 mr-2" />
                        <span>Name Day: {clergy.spouse.nameDay}</span>
                      </div>
                    </div>
                  </div>
                )}

                {clergy.children && clergy.children.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700">Children</h4>
                    <div className="mt-2 space-y-3">
                      {clergy.children.map((child, index) => (
                        <div key={index} className="text-sm">
                          <p>{child.name}</p>
                          <p className="text-gray-600">Birthday: {child.birthday}</p>
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClergy, setEditingClergy] = useState(null);
  const [clergyList, setClergyList] = useState(mockClergy);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle edit clergy
  const handleEdit = (clergy) => {
    setEditingClergy(clergy);
    setShowAddForm(true);
  };

  // Handle close form
  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingClergy(null);
  };

  // Handle save clergy
  const handleSaveClergy = (formData) => {
    if (editingClergy) {
      setClergyList(prevList => 
        prevList.map(c => c.id === editingClergy.id ? { ...formData, id: c.id } : c)
      );
    } else {
      setClergyList(prevList => [...prevList, { ...formData, id: crypto.randomUUID() }]);
    }
    handleCloseForm();
  };

  const filteredClergy = clergyList.filter(clergy => 
    clergy.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Clergy Directory</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Clergy
          </button>
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
            onEdit={handleEdit}
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

const mockClergy = [
  {
    id: '1',
    name: 'Fr. John Smith',
    role: 'Priest',
    ordained: '2010',
    status: 'Active',
    currentAssignment: "St. Mary's Cathedral",
    address: "123 Main St, New York, NY 10001",
    email: 'john.smith@diocese.org',
    phone: '(555) 123-4567',
    initials: 'JS',
    nameDay: 'June 24',
    birthday: 'March 15, 1975',
    patronSaint: 'St. John the Baptist',
    patronSaintDay: 'June 24',
    spouse: {
      name: 'Kh. Sarah Smith',
      email: 'sarah.smith@diocese.org',
      nameDay: 'January 12',
      birthday: 'April 20, 1977',
      patronSaint: 'St. Sarah',
      patronSaintDay: 'January 12'
    },
    children: [
      { 
        name: 'James Smith', 
        birthday: 'March 15, 2012',
        patronSaint: 'St. James',
        patronSaintDay: 'October 23'
      },
      { 
        name: 'Anna Smith', 
        birthday: 'July 23, 2014',
        patronSaint: 'St. Anna',
        patronSaintDay: 'July 25'
      }
    ]
  },
  {
    id: '2',
    name: 'Dcn. Michael Johnson',
    role: 'Deacon',
    ordained: '2015',
    status: 'Active',
    currentAssignment: "St. Nicholas Orthodox Church",
    address: "456 Church Ave, Brooklyn, NY 11215",
    email: 'michael.johnson@diocese.org',
    phone: '(555) 234-5678',
    initials: 'MJ',
    nameDay: 'November 8',
    birthday: 'September 29, 1980',
    patronSaint: 'St. Michael the Archangel',
    patronSaintDay: 'November 8',
    spouse: {
      name: 'Sh. Rachel Johnson',
      email: 'rachel.johnson@diocese.org',
      nameDay: 'August 5',
      birthday: 'May 15, 1982',
      patronSaint: 'St. Rachel',
      patronSaintDay: 'August 5'
    },
    children: [
      { 
        name: 'Peter Johnson', 
        birthday: 'April 10, 2016',
        patronSaint: 'St. Peter',
        patronSaintDay: 'June 29'
      },
      { 
        name: 'Maria Johnson', 
        birthday: 'September 2, 2018',
        patronSaint: 'St. Mary',
        patronSaintDay: 'August 15'
      }
    ]
  }
];
