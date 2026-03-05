import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            loadUser()
        } else {
            setLoading(false)
        }
    }, [])

    const loadUser = async () => {
        try {
            setLoading(true)
            // Você pode criar um endpoint /me no backend para buscar dados do usuário
            // Por enquanto, vamos usar o token para saber que está logado
            const token = localStorage.getItem('token')
            if (token) {
                // Decodificar token JWT para pegar informações básicas (opcional)
                const base64Url = token.split('.')[1]
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
                const payload = JSON.parse(window.atob(base64))
                setUser({ id: payload.id, email: payload.email })
            }
        } catch (error) {
            console.error('Erro ao carregar usuário:', error)
            logout()
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        try {
            setError(null)
            console.log('🔑 Tentando login com:', email)
            
            const response = await api.post('/auth/login', { email, password })
            console.log('✅ Login response:', response.data)
            
            const { token, user } = response.data

            // IMPORTANTE: verificar o token antes de salvar
            console.log('📌 Token recebido do backend:', token ? token.substring(0, 30) + '...' : 'Nulo')

            localStorage.setItem('token', token)
            setUser(user)
            return { success: true }
        } catch (error) {
            console.error('❌ Erro no login:', error.response?.data || error.message)
//            const errorMessage = error.response?.data?.error || 'Erro ao fazer login'
//            setError(errorMessage)
            return { success: false, error: error.response?.data?.error || 'Erro ao fazer login'  }
        }
    }

    const register = async (name, email, password) => {
        try {
            setError(null)
            console.log('📝 Tentando registro:', { name, email })
            
            const response = await api.post('/auth/register', { name, email, password })
            console.log('✅ Register response:', response.data)
            
            const { token, user } = response.data

            localStorage.setItem('token', token)
            setUser(user)
            return { success: true }
        } catch (error) {
            console.error('❌ Erro no registro:', error.response?.data || error.message)
            const errorMessage = error.response?.data?.error || 'Erro ao registrar'
            setError(errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
        console.log('👋 Logout realizado')
    }

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            register, 
            logout, 
            loading,
            error 
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}