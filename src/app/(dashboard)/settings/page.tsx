'use client'
import React, { useState, useEffect } from 'react'
import { 
  Plus,
  Trash,
  Shield,
  Key,
  Upload,
  Download,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { parse } from 'papaparse'
import UserCreateForm from '@/components/UserCreateForm'

interface UserAuth {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
  status: 'active' | 'pending' | 'inactive';
  dateCreated: Date;
  clergyId?: string;
}

const CLERGY_TYPES = [
  { value: 'Priest', title: 'Fr.' },
  { value: 'Deacon', title: 'Dcn.' },
  { value: 'Bishop', title: 'Bp.' }
] as const;

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

const SettingsPage = () => {
  const [users, setUsers] = useState<UserAuth[]>([])
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<'staff' | 'user'>('user')

  // Password change form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Add state for import status
  const [importStatus, setImportStatus] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    summary?: {
      total: number;
      created: string[];
    };
  } | null>(null);

  // Add these state declarations near the top of your component
  const [formData, setFormData] = useState({
    clergyType: 'Priest',
    firstName: '',
    lastName: '',
    email: '',
    role: 'user' as 'staff' | 'user',
    password: '',
    confirmPassword: ''
  })

  // Add these state declarations with your other useState declarations at the top
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'staff' | 'user'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all')

  // Add this near your other state declarations
  const [loginCredentials, setLoginCredentials] = useState<Array<{ email: string, userId: string }>>([])

  // Add this with your other filter states
  const [loginAccessFilter, setLoginAccessFilter] = useState<'all' | 'has-access' | 'no-access'>('all')

  // Add these new state declarations
  const [clergyTypeFilter, setClergyTypeFilter] = useState<'all' | 'Priest' | 'Deacon' | 'Bishop'>('all')
  const [deaneryFilter, setDeaneryFilter] = useState('all')
  const [deaneries, setDeaneries] = useState<Array<{ id: string, name: string }>>([])
  const [clergyData, setClergyData] = useState<Array<any>>([]) // Add proper typing based on your clergy interface

  // Add this helper function
  const getTitle = (clergyType: string) => {
    switch (clergyType) {
      case 'Priest': return 'Fr.';
      case 'Deacon': return 'Dcn.';
      case 'Bishop': return 'Bp.';
      default: return '';
    }
  }

  useEffect(() => {
    // Load users and credentials
    const loadData = () => {
      const users = JSON.parse(localStorage.getItem('userAuth') || '[]');
      const credentials = JSON.parse(localStorage.getItem('loginCredentials') || '[]');
      setUsers(users);
      setLoginCredentials(credentials);
    };

    // Only load user-related data, DO NOT touch clergy data
    loadData();
  }, []);

  // Replace the existing handleInviteUser with this new function
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userId = crypto.randomUUID();
      const newUser: UserAuth = {
        id: userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        status: 'active',
        dateCreated: new Date().toISOString()
      };

      // When creating a new user
      try {
        // Get existing clergy first to preserve it
        const existingClergy = JSON.parse(localStorage.getItem('clergy') || '[]');
        
        // Add new clergy if needed but preserve existing data
        if (formData.role === 'user') {
          const newClergy = {
            id: userId,
            name: `${formData.firstName} ${formData.lastName}`,
            type: 'Priest', // default type
            status: 'Active',
            // ... other default fields
          };
          
          // Only add if doesn't exist
          if (!existingClergy.find(c => c.id === userId)) {
            localStorage.setItem('clergy', JSON.stringify([...existingClergy, newClergy]));
          }
        }
        
        // Rest of your user creation code...
      } catch (error) {
        console.error('Error creating user:', error);
      }

      // Update userAuth
      const existingUsers = JSON.parse(localStorage.getItem('userAuth') || '[]');
      localStorage.setItem('userAuth', JSON.stringify([...existingUsers, newUser]));

      // Create Login Credentials
      const loginCredentials = {
        email: formData.email,
        password: formData.password,
        userId: userId
      };

      // Get existing records
      const existingCredentials = JSON.parse(localStorage.getItem('loginCredentials') || '[]');

      // Save user and credentials
      localStorage.setItem('loginCredentials', JSON.stringify([...existingCredentials, loginCredentials]));

      // Update state
      setUsers(prev => [...prev, newUser]);
      
      // Reset form and close modal
      setFormData({
        clergyType: 'Priest',
        firstName: '',
        lastName: '',
        email: '',
        role: 'user',
        password: '',
        confirmPassword: ''
      });
      setShowInviteForm(false);

      alert('User created successfully!');

      console.log('=== NEW USER CREATED ===');
      console.log('UserAuth:', JSON.parse(localStorage.getItem('userAuth') || '[]'));
      console.log('LoginCredentials:', JSON.parse(localStorage.getItem('loginCredentials') || '[]'));
      console.log('Clergy:', JSON.parse(localStorage.getItem('clergy') || '[]'));
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!")
      return
    }

    // TODO: Add password change logic
    console.log('Password change requested')
    
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setShowPasswordForm(false)
  }

  const handleUpdateRole = (userId: string, newRole: 'staff' | 'user') => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    )
    setUsers(updatedUsers)
    localStorage.setItem('userAuth', JSON.stringify(updatedUsers))
  }

  const handleImportClergyCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    parse(file, {
      header: true,
      complete: (results) => {
        try {
          const clergy = results.data.map((row: any) => ({
            id: crypto.randomUUID(),
            firstName: row['First Name'],
            lastName: row['Last Name'],
            title: row['Title'] || '',
            email: row['Email'],
            phone: row['Phone'] || '',
            status: row['Status'] || 'active',
            type: row['Type'] || 'Priest',
            currentAssignment: row['Current Assignment'] || '',
          }))

          // Save to localStorage
          const existingClergy = JSON.parse(localStorage.getItem('clergy') || '[]')
          const updatedClergy = [...existingClergy, ...clergy]
          localStorage.setItem('clergy', JSON.stringify(updatedClergy))

          setImportStatus({
            status: 'success',
            message: `Successfully imported ${clergy.length} clergy records`,
            summary: {
              total: clergy.length,
              created: clergy.map(c => `${c.title} ${c.firstName} ${c.lastName}`)
            }
          })
        } catch (error) {
          setImportStatus({
            status: 'error',
            message: 'Error processing file: ' + (error as Error).message
          })
        }
      },
      error: (error) => {
        setImportStatus({
          status: 'error',
          message: 'Error reading file: ' + error.message
        })
      }
    })
  }

  const handleImportParishCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    parse(file, {
      header: true,
      complete: (results) => {
        try {
          const parishes = results.data.map((row: any) => ({
            id: crypto.randomUUID(),
            name: row['Name'],
            address: row['Address'],
            city: row['City'],
            state: row['State'],
            zip: row['Zip'],
            phone: row['Phone'] || '',
            email: row['Email'] || '',
            website: row['Website'] || '',
            deanery: row['Deanery'] || '',
          }))

          // Save to localStorage
          const existingParishes = JSON.parse(localStorage.getItem('parishes') || '[]')
          const updatedParishes = [...existingParishes, ...parishes]
          localStorage.setItem('parishes', JSON.stringify(updatedParishes))

          setImportStatus({
            status: 'success',
            message: `Successfully imported ${parishes.length} parish records`,
            summary: {
              total: parishes.length,
              created: parishes.map(p => p.name)
            }
          })
        } catch (error) {
          setImportStatus({
            status: 'error',
            message: 'Error processing file: ' + (error as Error).message
          })
        }
      },
      error: (error) => {
        setImportStatus({
          status: 'error',
          message: 'Error reading file: ' + error.message
        })
      }
    })
  }

  const handleImportDeaneryCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    parse(file, {
      header: true,
      complete: (results) => {
        try {
          const deaneries = results.data.map((row: any) => ({
            id: crypto.randomUUID(),
            name: row['Name'],
            dean: row['Dean'],
            region: row['Region'] || '',
          }))

          // Save to localStorage
          const existingDeaneries = JSON.parse(localStorage.getItem('deaneries') || '[]')
          const updatedDeaneries = [...existingDeaneries, ...deaneries]
          localStorage.setItem('deaneries', JSON.stringify(updatedDeaneries))

          setImportStatus({
            status: 'success',
            message: `Successfully imported ${deaneries.length} deanery records`,
            summary: {
              total: deaneries.length,
              created: deaneries.map(d => d.name)
            }
          })
        } catch (error) {
          setImportStatus({
            status: 'error',
            message: 'Error processing file: ' + (error as Error).message
          })
        }
      },
      error: (error) => {
        setImportStatus({
          status: 'error',
          message: 'Error reading file: ' + error.message
        })
      }
    })
  }

  const downloadTemplate = (type: 'clergy' | 'parish' | 'deanery') => {
    let csvContent = ''
    
    switch(type) {
      case 'clergy':
        csvContent = [
          ['Title', 'First Name', 'Last Name', 'Email', 'Phone', 'Type', 'Current Assignment', 'Status'],
          ['Fr.', 'John', 'Doe', 'john.doe@diocese.org', '555-0123', 'Priest', 'St. Mary Parish', 'active'],
          ['Dcn.', 'James', 'Smith', 'james.smith@diocese.org', '555-0124', 'Deacon', 'St. Joseph Parish', 'active']
        ].map(row => row.join(',')).join('\n')
        break
        
      case 'parish':
        csvContent = [
          ['Name', 'Address', 'City', 'State', 'Zip', 'Phone', 'Email', 'Website', 'Deanery'],
          ['St. Mary Parish', '123 Main St', 'Anytown', 'ST', '12345', '555-0123', 'office@stmary.org', 'www.stmary.org', 'North Deanery']
        ].map(row => row.join(',')).join('\n')
        break
        
      case 'deanery':
        csvContent = [
          ['Name', 'Dean', 'Region'],
          ['North Deanery', 'Fr. John Doe', 'Northern Region']
        ].map(row => row.join(',')).join('\n')
        break
    }

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `${type}-template.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    console.log('LocalStorage - currentUser:', localStorage.getItem('currentUser'));
    console.log('Cookie - currentUser:', document.cookie);
    console.log('All Users:', localStorage.getItem('userAuth'));
    console.log('All Credentials:', localStorage.getItem('loginCredentials'));
  }, []);

  // Add near the top of your component, after your state declarations
  useEffect(() => {
    // Debug logging
    const userAuth = localStorage.getItem('userAuth');
    const loginCreds = localStorage.getItem('loginCredentials');
    const clergy = localStorage.getItem('clergy');
    
    console.log('=== DEBUG ===');
    console.log('UserAuth:', userAuth ? JSON.parse(userAuth) : 'empty');
    console.log('LoginCreds:', loginCreds ? JSON.parse(loginCreds) : 'empty');
    console.log('Clergy:', clergy ? JSON.parse(clergy) : 'empty');
    console.log('Current Users State:', users);
  }, [users]); // Add users as dependency to see when it changes

  // Add this function to handle user deletion
  const handleDeleteUser = (userId: string, email: string) => {
    if (email === 'admin@diocesetrack.com') {
      alert('Cannot delete admin account');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (confirmDelete) {
      try {
        // Remove from userAuth
        const existingUsers = JSON.parse(localStorage.getItem('userAuth') || '[]');
        const updatedUsers = existingUsers.filter(user => user.id !== userId);
        localStorage.setItem('userAuth', JSON.stringify(updatedUsers));
        
        // Remove from loginCredentials
        const existingCredentials = JSON.parse(localStorage.getItem('loginCredentials') || '[]');
        const updatedCredentials = existingCredentials.filter(cred => cred.email !== email);
        localStorage.setItem('loginCredentials', JSON.stringify(updatedCredentials));
        
        // DON'T remove from clergy - preserve clergy data
        
        // Update state
        setUsers(updatedUsers);
        setLoginCredentials(updatedCredentials);
        
        alert('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  // Add this filtering function before the return statement
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
      
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    
    const hasLoginAccess = user.email === 'admin@diocesetrack.com' || 
      loginCredentials.some(cred => cred.userId === user.id)
    const matchesLoginAccess = 
      loginAccessFilter === 'all' || 
      (loginAccessFilter === 'has-access' && hasLoginAccess) ||
      (loginAccessFilter === 'no-access' && !hasLoginAccess)

    // Add clergy type and deanery filtering
    const clergyRecord = clergyData.find(c => c.id === user.clergyId)
    const matchesClergyType = 
      clergyTypeFilter === 'all' || 
      (clergyRecord && clergyRecord.type === clergyTypeFilter)
    
    const matchesDeanery = 
      deaneryFilter === 'all' || 
      (clergyRecord && clergyRecord.deaneryId === deaneryFilter)

    return matchesSearch && matchesRole && matchesStatus && 
           matchesLoginAccess && matchesClergyType && matchesDeanery
  });

  useEffect(() => {
    const existingUsers = JSON.parse(localStorage.getItem('userAuth') || '[]')
    const existingCredentials = JSON.parse(localStorage.getItem('loginCredentials') || '[]')
    const existingDeaneries = JSON.parse(localStorage.getItem('deaneries') || '[]')
    const existingClergy = JSON.parse(localStorage.getItem('clergy') || '[]')
    
    console.log('Loaded deaneries:', existingDeaneries) // Debug log
    
    setUsers(existingUsers)
    setLoginCredentials(existingCredentials)
    setDeaneries(existingDeaneries)
    setClergyData(existingClergy)
  }, [])

  // Add this function to properly handle clergy data when updating users
  const handleUpdateUser = async (userId: string, updates: Partial<UserAuth>) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem('userAuth') || '[]');
      const existingClergy = JSON.parse(localStorage.getItem('clergy') || '[]');

      // Update user
      const updatedUsers = existingUsers.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      );

      // Don't modify clergy data when updating users
      localStorage.setItem('userAuth', JSON.stringify(updatedUsers));
      
      // Update state
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Add this debug log to see when Settings mounts
  useEffect(() => {
    console.log('Settings page mounting, current clergy data:', 
      JSON.parse(localStorage.getItem('clergy') || '[]')
    );
  }, []);

  useEffect(() => {
    // Preserve existing clergy data
    const existingClergy = localStorage.getItem('clergy');
    
    // Store it in a temporary storage
    if (existingClergy) {
      sessionStorage.setItem('tempClergy', existingClergy);
    }

    // When component unmounts, restore the clergy data
    return () => {
      const preservedClergy = sessionStorage.getItem('tempClergy');
      if (preservedClergy) {
        localStorage.setItem('clergy', preservedClergy);
        sessionStorage.removeItem('tempClergy');
      }
    };
  }, []);

  useEffect(() => {
    console.log('=== SETTINGS PAGE MOUNT ===');
    const clergyData = JSON.parse(localStorage.getItem('clergy') || '[]');
    console.log('Clergy data details:', clergyData.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      hasImage: !!c.profileImage
    })));
  }, []);

  useEffect(() => {
    return () => {
      console.log('=== SETTINGS PAGE UNMOUNT ===');
      console.log('Clergy data when leaving Settings:', JSON.parse(localStorage.getItem('clergy') || '[]'));
    };
  }, []);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your system settings, user access, and data imports.
        </p>
      </div>

      {/* Simplified Import Section */}
      <Card className="mb-8 bg-white shadow-sm">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle>Data Import</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Download Templates */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Step 1: Download Sample Templates</h3>
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant="outline"
                  onClick={() => downloadTemplate('clergy')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Clergy Template
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => downloadTemplate('parish')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Parish Template
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => downloadTemplate('deanery')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Deanery Template
                </Button>
              </div>
            </div>

            {/* Import Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Step 2: Import Your Data</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Import Clergy</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportClergyCSV}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>
                
                {/* Add Parish Import */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Import Parishes</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportParishCSV}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>
                
                {/* Add Deanery Import */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Import Deaneries</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportDeaneryCSV}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Instructions:</h4>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Download the appropriate template for your data</li>
                <li>Open the template in Excel or Google Sheets</li>
                <li>Fill in your data following the example row</li>
                <li>Save the file as CSV</li>
                <li>Upload the completed CSV file using the import button above</li>
              </ol>
            </div>
          </div>

          {/* Import Status */}
          {importStatus && (
            <div className={`mt-4 p-4 rounded-lg ${
              importStatus.status === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {importStatus.status === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <p className={`font-medium ${
                  importStatus.status === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {importStatus.message}
                </p>
              </div>

              {/* Show summary for successful imports */}
              {importStatus.status === 'success' && importStatus.summary && (
                <div className="mt-3 pl-7">
                  <p className="text-sm text-green-800 font-medium">
                    Successfully imported {importStatus.summary.total} records:
                  </p>
                  <ul className="mt-2 space-y-1">
                    {importStatus.summary.created.map((name, index) => (
                      <li key={index} className="text-sm text-green-700">
                        • {name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Clear status after 5 seconds for errors */}
          {useEffect(() => {
            if (importStatus?.status === 'error') {
              const timer = setTimeout(() => {
                setImportStatus(null);
              }, 5000);
              return () => clearTimeout(timer);
            }
          }, [importStatus])}
        </CardContent>
      </Card>

      {/* User Management Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Add this section before your user list */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg pl-10"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <div className="flex gap-4 flex-wrap">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="user">User</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>

                <select
                  value={loginAccessFilter}
                  onChange={(e) => setLoginAccessFilter(e.target.value as typeof loginAccessFilter)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">All Access</option>
                  <option value="has-access">Has Login Access</option>
                  <option value="no-access">No Login Access</option>
                </select>

                {/* Add Clergy Type filter */}
                <select
                  value={clergyTypeFilter}
                  onChange={(e) => setClergyTypeFilter(e.target.value as typeof clergyTypeFilter)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">All Clergy Types</option>
                  {CLERGY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.value}s
                    </option>
                  ))}
                </select>

                {/* Add Deanery filter */}
                <select
                  value={deaneryFilter}
                  onChange={(e) => setDeaneryFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">All Deaneries</option>
                  {deaneries.length > 0 ? (
                    deaneries.map(deanery => (
                      <option key={deanery.id} value={deanery.id}>
                        {deanery.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No deaneries found</option>
                  )}
                </select>

                <div className="ml-auto flex items-center text-sm text-gray-500">
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                </div>
              </div>
            </div>

            {/* Update your existing users.map to use filteredUsers instead */}
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                >
                  {/* User Info */}
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {user.role === 'user' ? (
                            <>
                              {/* Find matching clergy record and get their type */}
                              {(() => {
                                const clergyRecord = clergyData.find(c => c.id === user.clergyId);
                                if (clergyRecord) {
                                  const titleAbbr = getTitleAbbreviation(clergyRecord.type);
                                  return `${titleAbbr} `;
                                }
                                return '';
                              })()}
                              {user.firstName} {user.lastName}
                            </>
                          ) : (
                            <>
                              {user.firstName} {user.lastName}
                            </>
                          )}
                        </p>
                        {user.email !== 'admin@diocesetrack.com' && 
                         !loginCredentials.some(cred => cred.userId === user.id) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            No Login Access
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {user.role === 'admin' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) => {
                              const newRole = e.target.value as 'staff' | 'user'
                              const updatedUsers = users.map(u => 
                                u.id === user.id ? { ...u, role: newRole } : u
                              )
                              setUsers(updatedUsers)
                              localStorage.setItem('userAuth', JSON.stringify(updatedUsers))
                            }}
                            className={`
                              inline-flex items-center px-2 py-1 rounded text-xs font-medium
                              border border-gray-200 
                              ${user.role === 'staff' 
                                ? 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                                : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                              }
                              cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                            `}
                          >
                            <option value="staff" className="bg-white text-gray-900">Staff</option>
                            <option value="user" className="bg-white text-gray-900">User</option>
                          </select>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${user.status.toLowerCase() === 'active'
                            ? 'bg-green-100 text-green-800'
                            : user.status.toLowerCase() === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.status.charAt(0).toUpperCase() + user.status.toLowerCase().slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {user.email !== 'admin@diocesetrack.com' && 
                     !loginCredentials.some(cred => cred.userId === user.id) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowPasswordForm(true)
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Create Login
                      </Button>
                    )}
                    
                    {/* Change Password Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPasswordForm(true)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Key className="h-4 w-4" />
                    </Button>

                    {/* Delete User Button (non-admin only) */}
                    {user.role !== 'admin' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No users found matching your filters
              </div>
            )}

            {/* Add User Button */}
            <Button
              onClick={() => setShowInviteForm(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* Invite User Form */}
          {showInviteForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">Add New User</h2>
                <UserCreateForm onSuccess={() => setShowInviteForm(false)} />
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="mt-4 text-gray-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Change Password Form */}
          {showPasswordForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      // Handle password change logic here
                      setShowPasswordForm(false)
                    }}>
                      Change Password
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage
