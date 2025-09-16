"use client"

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { LogOut, Home } from 'lucide-react'
import Link from 'next/link'

export function AdminHeader() {
  const { logout, adminUser } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
              <Home className="w-5 h-5" />
              <span className="font-medium">Volver al sitio</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gray-900 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {adminUser ? getInitials(adminUser.nombre) : 'A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-700 font-medium text-sm">
                  {adminUser?.nombre || 'Administrador'}
                </span>
                <span className="text-gray-500 text-xs">
                  @{adminUser?.username || 'admin'}
                </span>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
