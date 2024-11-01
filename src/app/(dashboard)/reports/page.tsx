'use client'

import React, { useState, useEffect } from 'react'
import { Download, Users2, Church, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('clergy')
  const [clergy, setClergy] = useState([])
  const [parishes, setParishes] = useState([])
  const [deaneries, setDeaneries] = useState([])
  const [filters, setFilters] = useState({
    clergy: {
      role: '',
      deanery: '',
      status: ''
    },
    parishes: {
      deanery: '',
      status: ''
    },
    deaneries: {
      status: ''
    }
  })

  useEffect(() => {
    // Load data from localStorage
    const loadedClergy = JSON.parse(localStorage.getItem('clergy') || '[]')
    const loadedParishes = JSON.parse(localStorage.getItem('parishes') || '[]')
    const loadedDeaneries = JSON.parse(localStorage.getItem('deaneries') || '[]')

    setClergy(loadedClergy)
    setParishes(loadedParishes)
    setDeaneries(loadedDeaneries)
  }, [])

  const getFilteredData = () => {
    switch (activeTab) {
      case 'clergy':
        return clergy.filter(person => {
          return (!filters.clergy.role || person.role === filters.clergy.role) &&
                 (!filters.clergy.deanery || person.deanery === filters.clergy.deanery) &&
                 (!filters.clergy.status || person.status === filters.clergy.status)
        })
      case 'parishes':
        return parishes.filter(parish => {
          return (!filters.parishes.deanery || parish.deanery === filters.parishes.deanery) &&
                 (!filters.parishes.status || parish.status === filters.parishes.status)
        })
      case 'deaneries':
        return deaneries.filter(deanery => {
          return (!filters.deaneries.status || deanery.status === filters.deaneries.status)
        })
      default:
        return []
    }
  }

  const handleExport = () => {
    const filteredData = getFilteredData()
    const csv = convertToCSV(filteredData)
    downloadCSV(csv, `${activeTab}-report.csv`)
  }

  const convertToCSV = (data) => {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const rows = data.map(item => 
      headers.map(header => 
        JSON.stringify(item[header] || '')
      ).join(',')
    )
    
    return [
      headers.join(','),
      ...rows
    ].join('\n')
  }

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={activeTab === 'clergy' ? 'default' : 'outline'}
          onClick={() => setActiveTab('clergy')}
          className="flex items-center gap-2"
        >
          <Users2 className="h-4 w-4" />
          Clergy Directory
        </Button>
        <Button
          variant={activeTab === 'parishes' ? 'default' : 'outline'}
          onClick={() => setActiveTab('parishes')}
          className="flex items-center gap-2"
        >
          <Church className="h-4 w-4" />
          Parish Directory
        </Button>
        <Button
          variant={activeTab === 'deaneries' ? 'default' : 'outline'}
          onClick={() => setActiveTab('deaneries')}
          className="flex items-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          Deanery Directory
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="font-medium">Filters:</span>
            
            {activeTab === 'clergy' && (
              <>
                <select
                  className="border rounded-md px-3 py-2"
                  value={filters.clergy.role}
                  onChange={(e) => 
                    setFilters(prev => ({
                      ...prev,
                      clergy: { ...prev.clergy, role: e.target.value }
                    }))
                  }
                >
                  <option value="">All Roles</option>
                  <option value="Priest">Priest</option>
                  <option value="Deacon">Deacon</option>
                </select>

                <select
                  className="border rounded-md px-3 py-2"
                  value={filters.clergy.deanery}
                  onChange={(e) =>
                    setFilters(prev => ({
                      ...prev,
                      clergy: { ...prev.clergy, deanery: e.target.value }
                    }))
                  }
                >
                  <option value="">All Deaneries</option>
                  {deaneries.map(deanery => (
                    <option key={deanery.id} value={deanery.name}>
                      {deanery.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            {activeTab === 'parishes' && (
              <select
                className="border rounded-md px-3 py-2"
                value={filters.parishes.deanery}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    parishes: { ...prev.parishes, deanery: e.target.value }
                  }))
                }
              >
                <option value="">All Deaneries</option>
                {deaneries.map(deanery => (
                  <option key={deanery.id} value={deanery.name}>
                    {deanery.name}
                  </option>
                ))}
              </select>
            )}

            <select
              className="border rounded-md px-3 py-2"
              value={filters[activeTab].status}
              onChange={(e) =>
                setFilters(prev => ({
                  ...prev,
                  [activeTab]: { ...prev[activeTab], status: e.target.value }
                }))
              }
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {getFilteredData().map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              {activeTab === 'clergy' && (
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.role}</p>
                    <p className="text-sm text-gray-600">{item.email}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{item.currentAssignment}</p>
                    <p>{item.phone}</p>
                  </div>
                </div>
              )}

              {activeTab === 'parishes' && (
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.address}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{item.deanery}</p>
                    <p>{item.phone}</p>
                  </div>
                </div>
              )}

              {activeTab === 'deaneries' && (
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">Dean: {item.deanName}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Parishes: {item.parishes?.length || 0}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ReportsPage 