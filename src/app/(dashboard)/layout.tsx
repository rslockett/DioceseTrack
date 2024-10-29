'use client'

import { 
  LayoutDashboard,
  Users2,
  Church,
  Map,
  FileStack,
  Settings,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <nav className="fixed left-0 top-0 bottom-0 w-64 bg-slate-800 text-white p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold px-4">Diocese CMS</h1>
        </div>
        
        <div className="space-y-2">
          <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700">
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/clergy" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700">
            <Users2 className="h-5 w-5" />
            <span>Clergy Directory</span>
          </Link>
          <Link href="/parishes" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700">
            <Church className="h-5 w-5" />
            <span>Parishes</span>
          </Link>
          <Link href="/deaneries" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700">
            <Map className="h-5 w-5" />
            <span>Deaneries</span>
          </Link>
          <Link href="/documents" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700">
            <FileStack className="h-5 w-5" />
            <span>Documents</span>
          </Link>
          <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <Link href="/logout" className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Link>
        </div>
      </nav>
      
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
