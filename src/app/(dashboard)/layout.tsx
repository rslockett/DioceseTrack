'use client'
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard,
  Users2,
  Church,
  Map,
  FileStack,
  Settings,
  LogOut,
  Calendar,
  Home,
  Building,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Define menu items with role access
const ALL_MENU_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ['admin', 'staff'], // Only admin and staff can see dashboard
  },
  {
    title: "Clergy",
    href: "/clergy",
    icon: Users2,
    roles: ['admin', 'staff', 'user'], // Everyone can see clergy
  },
  {
    title: "Parishes",
    href: "/parishes",
    icon: Church,
    roles: ['admin', 'staff'], // Admin and staff only
  },
  {
    title: "Deaneries",
    href: "/deaneries",
    icon: Building,
    roles: ['admin', 'staff'],
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: Calendar,
    roles: ['admin', 'staff'],
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
    roles: ['admin', 'staff'],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileStack,
    roles: ['admin', 'staff'],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ['admin'], // Admin only
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    try {
      // Get current user from localStorage
      const userStr = localStorage.getItem('currentUser')
      if (!userStr) {
        router.push('/login')
        return
      }

      const currentUser = JSON.parse(userStr)
      if (!currentUser?.role) {
        router.push('/login')
        return
      }

      setUser(currentUser)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/login')
    }
  }, [router])

  // Show loading state while checking user
  if (!user) {
    return <div>Loading...</div>
  }

  // Filter menu items based on user role
  const menuItems = ALL_MENU_ITEMS.filter(item => item.roles.includes(user.role));

  // For regular users, modify the clergy link to point to their profile
  const getModifiedHref = (item: typeof ALL_MENU_ITEMS[0]) => {
    return item.href;
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    // Also remove the cookie
    document.cookie = 'currentUser=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <nav className="fixed left-0 top-0 bottom-0 w-64 bg-slate-800 text-white p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold px-4">Diocese CMS</h1>
        </div>
        
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.title} 
              href={getModifiedHref(item)} 
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
      
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
