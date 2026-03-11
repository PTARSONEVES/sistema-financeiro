import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        console.log('🔍 AuthProvider montado')
        loadUserFromToken()
    }, [])

    const loadUserFromToken = async () => {
        try {
            const token = localStorage.getItem('token')
            console.log('🔍 Token encontrado:', token ? 'Sim' : 'Não')
            
            if (token) {
                // Decodificar token para pegar informações do usuário
                try {
                    const base64Url = token.split('.')[1]
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
                    const payload = JSON.parse(window.atob(base64))
                    
                    console.log('🔍 Payload do token:', payload)
                    
                    // Aqui você pode buscar mais dados do usuário se necessário
                    setUser({
                        id: payload.id,
                        email: payload.email || 'usuario@email.com',
                        name: payload.name || 'Usuário'
                    })
                    
                    console.log('✅ Usuário carregado do token:', payload.id)
                } catch (e) {
                    console.error('❌ Erro ao decodificar token:', e)
                    localStorage.removeItem('token')
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar usuário:', error)
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        try {
            console.log('🔑 Tentando login...')
            const response = await api.post('/auth/login', { email, password })
            const { token, user: userData } = response.data

            console.log('✅ Login bem-sucedido')
            localStorage.setItem('token', token)
            setUser(userData)
            return { success: true }
        } catch (error) {
            console.error('❌ Erro no login:', error)
            return { 
                success: false, 
                error: error.response?.data?.error || 'Erro ao fazer login' 
            }
        }
    }

    const register = async (name, email, password) => {
        try {
            console.log('📝 Tentando registro...')
            const response = await api.post('/auth/register', { name, email, password })
            const { token, user: userData } = response.data

            console.log('✅ Registro bem-sucedido')
            localStorage.setItem('token', token)
            setUser(userData)
            return { success: true }
        } catch (error) {
            console.error('❌ Erro no registro:', error)
            return { 
                success: false, 
                error: error.response?.data?.error || 'Erro ao registrar' 
            }
        }
    }

    const logout = () => {
        console.log('👋 Logout')
        localStorage.removeItem('token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            register, 
            logout, 
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de AuthProvider')
    }
    return context
}