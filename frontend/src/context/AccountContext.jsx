import React, { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api'

const AccountContext = createContext()

export function AccountProvider({ children }) {
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
    })

    // Buscar contas com filtros
    const fetchAccounts = useCallback(async (filters = {}, page = 1) => {
        try {
            setLoading(true)
            setError(null)

            const params = new URLSearchParams({
                page,
                limit: 10,
                ...filters
            })

            console.log('🔍 Buscando contas com filtros:', filters)
            const response = await api.get(`/accounts?${params}`)
            
            setAccounts(response.data.accounts)
            setPagination(response.data.pagination)
            
        } catch (error) {
            console.error('❌ Erro ao buscar contas:', error)
            setError('Erro ao carregar contas')
        } finally {
            setLoading(false)
        }
    }, [])

    // Criar nova conta
    const createAccount = async (accountData) => {
        try {
            setLoading(true)
            setError(null)

            console.log('📝 Criando conta:', accountData)
            const response = await api.post('/accounts', accountData)
            
            // Atualizar lista
            await fetchAccounts()
            
            return { success: true, data: response.data }
        } catch (error) {
            console.error('❌ Erro ao criar conta:', error)
            const message = error.response?.data?.error || 'Erro ao criar conta'
            setError(message)
            return { success: false, error: message }
        } finally {
            setLoading(false)
        }
    }

    // Atualizar conta
    const updateAccount = async (id, accountData) => {
        try {
            setLoading(true)
            setError(null)

            console.log('📝 Atualizando conta:', id, accountData)
            const response = await api.put(`/accounts/${id}`, accountData)
            
            // Atualizar lista
            await fetchAccounts()
            
            return { success: true, data: response.data }
        } catch (error) {
            console.error('❌ Erro ao atualizar conta:', error)
            const message = error.response?.data?.error || 'Erro ao atualizar conta'
            setError(message)
            return { success: false, error: message }
        } finally {
            setLoading(false)
        }
    }

    // Deletar conta
    const deleteAccount = async (id) => {
        try {
            setLoading(true)
            setError(null)

            console.log('🗑️ Deletando conta:', id)
            await api.delete(`/accounts/${id}`)
            
            // Atualizar lista
            await fetchAccounts()
            
            return { success: true }
        } catch (error) {
            console.error('❌ Erro ao deletar conta:', error)
            const message = error.response?.data?.error || 'Erro ao deletar conta'
            setError(message)
            return { success: false, error: message }
        } finally {
            setLoading(false)
        }
    }

    // Marcar como pago/recebido
    const markAsPaid = async (id) => {
        try {
            const account = accounts.find(a => a.id === id)
            if (!account) return { success: false, error: 'Conta não encontrada' }

            const updateData = {
                ...account,
                status: 'pago',
                payment_date: new Date().toISOString().split('T')[0]
            }

            return await updateAccount(id, updateData)
        } catch (error) {
            console.error('❌ Erro ao marcar como pago:', error)
            return { success: false, error: 'Erro ao marcar como pago' }
        }
    }

    return (
        <AccountContext.Provider value={{
            accounts,
            loading,
            error,
            pagination,
            fetchAccounts,
            createAccount,
            updateAccount,
            deleteAccount,
            markAsPaid
        }}>
            {children}
        </AccountContext.Provider>
    )
}

export const useAccounts = () => {
    const context = useContext(AccountContext)
    if (!context) {
        throw new Error('useAccounts must be used within an AccountProvider')
    }
    return context
}