'use client'
import React, { useState } from 'react'
import { Plus, Download, FileText, Calendar, User, Tag, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const DocumentCard = ({ document }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{document.title}</h3>
                <p className="text-sm text-gray-600">{document.type}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                document.status === 'Published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {document.status}
              </span>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span>Author: {document.author}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Last Updated: {document.lastUpdated}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Tag className="h-4 w-4 mr-2" />
                <span>Category: {document.category}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <a 
                  href={document.downloadUrl} 
                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </a>
                <button className="text-gray-500 hover:text-gray-700">
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const DocumentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const mockDocuments = [
    {
      title: "Clergy Handbook 2024",
      type: "PDF Document",
      status: "Published",
      author: "Diocese Administration",
      lastUpdated: "January 15, 2024",
      category: "Administrative",
      downloadUrl: "#"
    },
    {
      title: "Parish Council Guidelines",
      type: "Word Document",
      status: "Draft",
      author: "Fr. John Smith",
      lastUpdated: "February 1, 2024",
      category: "Governance",
      downloadUrl: "#"
    },
    {
      title: "Liturgical Calendar 2024",
      type: "PDF Document",
      status: "Published",
      author: "Liturgical Committee",
      lastUpdated: "December 20, 2023",
      category: "Liturgical",
      downloadUrl: "#"
    },
    {
      title: "Youth Ministry Manual",
      type: "PDF Document",
      status: "Published",
      author: "Youth Department",
      lastUpdated: "January 30, 2024",
      category: "Ministry",
      downloadUrl: "#"
    }
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Documents</h1>
        <div className="flex gap-4">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" />
            Upload Document
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-5 w-5 mr-2" />
            Export List
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6">
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search documents..."
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
          
          <select className="border rounded-lg px-4 py-2 text-gray-600">
            <option value="">All Categories</option>
            <option value="administrative">Administrative</option>
            <option value="liturgical">Liturgical</option>
            <option value="governance">Governance</option>
            <option value="ministry">Ministry</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockDocuments.map((document, index) => (
          <DocumentCard key={index} document={document} />
        ))}
      </div>
    </div>
  )
}

export default DocumentsPage
