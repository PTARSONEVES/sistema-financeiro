import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import api from '../services/api'
import ThemeToggle from '../components/ThemeToggle'

export default function ResetPassword() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [validToken, setValidToken] = useState(false)
    const [checking, setChecking] = useState(true)
    
    const navigate = useNavigate()
    const location = useLocation()
    
    // Pegar token da URL
    const queryParams = new URLSearchParams(location.search)
    const token = queryParams.get('token')

    useEffect(() => {
        verifyToken()
    }, [])

    const verifyToken = async () => {
        try {
            await api.get(`/password/verify/${token}`)
            setValidToken(true)
        } catch (error) {
            setError('Link inválido ou expirado')
        } finally {
            setChecking(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres')
            return
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem')
            return
        }

        setLoading(true)

        try {
            await api.post('/password/reset', { token, password })
            setSuccess(true)
            setTimeout(() => {
                navigate('/login')
            }, 3000)
        } catch (error) {
            setError(error.response?.data?.error || 'Erro ao redefinir senha')
        } finally {
            setLoading(false)
        }
    }

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <ThemeToggle />
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Verificando link...</p>
                </div>
            </div>
        )
    }

    if (!validToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <ThemeToggle />
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <div className="text-red-600 dark:text-red-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Link Inválido
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Este link de recuperação é inválido ou já expirou.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 
                                 text-white rounded-lg"
                    >
                        Solicitar novo link
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4">
            <ThemeToggle />
            
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Redefinir Senha
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Digite sua nova senha
                    </p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded">
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="text-center">
                        <div className="mb-4 text-green-600 dark:text-green-400">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Senha alterada!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Você será redirecionado para o login...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nova Senha
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                         rounded-md bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Confirmar Nova Senha
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                         rounded-md bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 
                                     text-white font-medium rounded-md disabled:opacity-50"
                        >
                            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}