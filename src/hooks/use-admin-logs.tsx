"use client"

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface AdminLog {
  id: string
  admin_username: string
  admin_nombre: string
  action: string
  description: string | null
  resource_type: string | null
  resource_id: string | null
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface LogFilters {
  admin_id?: string
  action?: string
  limit?: number
  offset?: number
}

export function useAdminLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchLogs = useCallback(async (filters: LogFilters = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      // Consulta directa con join a administradores
      let query = supabase
        .from('admin_logs')
        .select(`
          id,
          action,
          description,
          resource_type,
          resource_id,
          ip_address,
          user_agent,
          metadata,
          created_at,
          administradores!inner(username, nombre)
        `)
        .order('created_at', { ascending: false })
        .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) - 1)
      
      // Aplicar filtros
      if (filters.admin_id) {
        query = query.eq('admin_id', filters.admin_id)
      }
      if (filters.action) {
        query = query.eq('action', filters.action)
      }
      
      const result = await query
      
      if (result.error) {
        throw result.error
      }

      const transformedData = result.data?.map(log => ({
        id: log.id,
        admin_username: log.administradores?.[0]?.username,
        admin_nombre: log.administradores?.[0]?.nombre,
        action: log.action,
        description: log.description,
        resource_type: log.resource_type,
        resource_id: log.resource_id,
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        metadata: log.metadata,
        created_at: log.created_at
      })) || []

      setLogs(transformedData)
      
      // Obtener conteo total
      let countQuery = supabase
        .from('admin_logs')
        .select('*', { count: 'exact', head: true })
      
      if (filters.admin_id) {
        countQuery = countQuery.eq('admin_id', filters.admin_id)
      }
      if (filters.action) {
        countQuery = countQuery.eq('action', filters.action)
      }
      
      const { count, error: countError } = await countQuery
      
      if (countError) {
        console.warn('Count error:', countError)
        setTotalCount(transformedData.length)
      } else {
        setTotalCount(count || 0)
      }
      
    } catch (err) {
      console.error('Error fetching admin logs:', err)
      setError(`Error al cargar los logs: ${err instanceof Error ? err.message : 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logAction = useCallback(async (
    adminId: string,
    action: string,
    description?: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: Record<string, unknown>
  ) => {
    try {
      // Obtener información del navegador
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : null
      
      const { error: logError } = await supabase
        .rpc('registrar_admin_log', {
          p_admin_id: adminId,
          p_action: action,
          p_description: description || null,
          p_resource_type: resourceType || null,
          p_resource_id: resourceId || null,
          p_ip_address: null, // Se puede obtener del servidor si es necesario
          p_user_agent: userAgent,
          p_metadata: metadata || null
        })

      if (logError) {
        console.error('Error logging admin action:', logError)
      }
    } catch (err) {
      console.error('Error logging admin action:', err)
    }
  }, [])

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return '🔐'
      case 'logout':
        return '🚪'
      case 'create_producto':
        return '➕'
      case 'update_producto':
        return '✏️'
      case 'delete_producto':
        return '🗑️'
      case 'create_admin':
        return '👤'
      case 'update_admin':
        return '👤✏️'
      case 'delete_admin':
        return '👤🗑️'
      case 'view_logs':
        return '📋'
      case 'export_data':
        return '📤'
      default:
        return '📝'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login':
        return 'text-green-600 bg-green-50'
      case 'logout':
        return 'text-gray-600 bg-gray-50'
      case 'create_producto':
        return 'text-blue-600 bg-blue-50'
      case 'update_producto':
        return 'text-yellow-600 bg-yellow-50'
      case 'delete_producto':
        return 'text-red-600 bg-red-50'
      case 'create_admin':
        return 'text-purple-600 bg-purple-50'
      case 'update_admin':
        return 'text-purple-600 bg-purple-50'
      case 'delete_admin':
        return 'text-red-600 bg-red-50'
      case 'view_logs':
        return 'text-indigo-600 bg-indigo-50'
      case 'export_data':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return {
    logs,
    isLoading,
    error,
    totalCount,
    fetchLogs,
    logAction,
    getActionIcon,
    getActionColor,
    formatDate
  }
}
