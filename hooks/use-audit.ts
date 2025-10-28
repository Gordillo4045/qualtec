"use client"

import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export function useAudit() {
    const { user } = useAuth()
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const ensureUserExists = async () => {
            if (user) {
                try {
                    // Crear o obtener el usuario en nuestra tabla de usuarios
                    const { data, error } = await supabase.rpc('get_or_create_auth_user', {
                        auth_user_id: user.id,
                        auth_email: user.email || '',
                        auth_name: user.user_metadata?.full_name || user.user_metadata?.name || null
                    })

                    if (error) {
                        console.error('Error al crear/obtener usuario:', error)
                    } else {
                        setCurrentUserId(data)
                    }
                } catch (error) {
                    console.error('Error en ensureUserExists:', error)
                }
            }
        }

        ensureUserExists()
    }, [user, supabase])

    const logOperation = async (
        tableName: string,
        operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT',
        recordId: string,
        oldData?: any,
        newData?: any,
        additionalDetails?: string
    ) => {
        if (!user) {
            console.warn('No hay usuario autenticado para registrar en auditoría')
            return
        }

        try {
            const { error } = await supabase.rpc('log_operation', {
                table_name: tableName,
                operation: operation,
                record_id: recordId,
                old_data: oldData ? JSON.stringify(oldData) : null,
                new_data: newData ? JSON.stringify(newData) : null,
                additional_details: additionalDetails || 'Operación manual desde frontend'
            })

            if (error) {
                console.error('Error al registrar en auditoría:', error)
            }
        } catch (error) {
            console.error('Error en logOperation:', error)
        }
    }

    return {
        currentUserId,
        logOperation,
        isAuthenticated: !!user,
        user
    }
}
