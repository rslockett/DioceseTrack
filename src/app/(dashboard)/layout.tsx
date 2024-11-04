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
  Menu,
  Moon,
  Sun,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider'

// Define menu items with role access
const ALL_MENU_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['admin', 'staff']
  },
  {
    name: 'Clergy',
    href: '/clergy',
    icon: Users2,
    roles: ['admin', 'staff', 'user']
  },
  {
    name: 'Parishes',
    href: '/parishes',
    icon: Church,
    roles: ['admin', 'staff']
  },
  {
    name: 'Deaneries',
    href: '/deaneries',
    icon: Map,
    roles: ['admin', 'staff']
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: FileText,
    roles: ['admin', 'staff']
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    roles: ['admin', 'staff']
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileStack,
    roles: ['admin', 'staff']
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['admin']
  }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    try {
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

      if (currentUser.role === 'user') {
        if (pathname !== '/clergy') {
          router.push('/clergy')
          return
        }
      } else if (currentUser.role === 'staff') {
        if (pathname === '/settings') {
          router.push('/dashboard')
          return
        }
      }

      setUser(currentUser)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/login')
    }
  }, [router, pathname])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    document.cookie = 'currentUser=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    router.push('/login')
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const menuItems = ALL_MENU_ITEMS.filter(item => item.roles.includes(user.role))

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-gray-900">
      {/* Mobile Menu Button */}
      <div className="md:hidden p-4 border-b dark:border-gray-800">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-white">Diocese Track</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-400"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`
        ${isMobileMenuOpen ? 'block' : 'hidden'} 
        md:block w-full md:w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800
      `}>
        <div className="flex flex-col h-full">
          <div className="hidden md:block p-4">
            <h2 className="text-xl font-bold">Diocese Track</h2>
            <p className="text-sm text-gray-500">{user.firstName} {user.lastName}</p>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center p-2 rounded-lg ${
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  )
}
