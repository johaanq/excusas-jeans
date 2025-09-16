"use client"

import { useState, useEffect } from 'react'
import { useAdminLogs } from '@/hooks/use-admin-logs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Alert } from '@/components/ui/alert'
import { Search, Filter, RefreshCw, Download } from 'lucide-react'

export function AdminLogs() {
  const {
    logs,
    isLoading,
    error,
    totalCount,
    fetchLogs,
    getActionIcon,
    getActionColor,
    formatDate
  } = useAdminLogs()

  const [filters, setFilters] = useState({
    action: '',
    admin_id: '',
    limit: 50,
    offset: 0
  })
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchLogs(filters)
  }, [fetchLogs, filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }))
    setCurrentPage(1)
  }

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * filters.limit
    setFilters(prev => ({ ...prev, offset: newOffset }))
    setCurrentPage(newPage)
  }

  const totalPages = Math.ceil(totalCount / filters.limit)

  const exportLogs = () => {
    const csvContent = [
      ['Fecha', 'Admin', 'Acción', 'Descripción', 'Recurso', 'IP', 'User Agent'].join(','),
      ...logs.map(log => [
        formatDate(log.created_at),
        `"${log.admin_nombre} (@${log.admin_username})"`,
        `"${log.action}"`,
        `"${log.description || ''}"`,
        `"${log.resource_type || ''}"`,
        `"${log.ip_address || ''}"`,
        `"${log.user_agent || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `admin-logs-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading && logs.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Logs de Administradores</h2>
          <p className="text-gray-600 mt-1">
            Registro de todas las acciones realizadas por los administradores
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchLogs(filters)}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          <Button
            variant="outline"
            onClick={exportLogs}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por acción
            </label>
            <Input
              placeholder="Ej: login, create_producto..."
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por admin
            </label>
            <Input
              placeholder="Username del admin..."
              value={filters.admin_id}
              onChange={(e) => handleFilterChange('admin_id', e.target.value)}
            />
          </div>
          
          <div className="sm:w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Por página
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      {/* Logs */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recurso
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {log.admin_nombre}
                      </span>
                      <span className="text-xs text-gray-500">
                        @{log.admin_username}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge className={`${getActionColor(log.action)} border-0`}>
                      <span className="mr-1">{getActionIcon(log.action)}</span>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="truncate" title={log.description || ''}>
                      {log.description || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.resource_type ? (
                      <div className="flex flex-col">
                        <span className="font-medium">{log.resource_type}</span>
                        {log.resource_id && (
                          <span className="text-xs text-gray-400">
                            ID: {log.resource_id.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron logs</p>
          </div>
        )}
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            Anterior
          </Button>
          
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Estadísticas */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
            <div className="text-sm text-gray-500">Total de logs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {logs.filter(log => log.action === 'login').length}
            </div>
            <div className="text-sm text-gray-500">Logins registrados</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {new Set(logs.map(log => log.admin_username)).size}
            </div>
            <div className="text-sm text-gray-500">Admins activos</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
