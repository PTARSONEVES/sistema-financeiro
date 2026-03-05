import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import ThemeToggle from '../components/ThemeToggle'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const response = await api.post('/password/forgot', { email })
            setMessage(response.data.message)
            setSent(true)
        } catch (error) {
            setError(error.response?.data?.error || 'Erro ao solicitar recuperação')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4">
            <ThemeToggle />
            
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Recuperar Senha
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Digite seu email para receber instruções
                    </p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 p-3 rounded">
                        {message}
                    </div>
                )}

                {!sent ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                         rounded-md bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 
                                     text-white font-medium rounded-md disabled:opacity-50"
                        >
                            {loading ? 'Enviando...' : 'Enviar instruções'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <Link
                            to="/login"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Voltar para o login
                        </Link>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 
                                 dark:hover:text-white transition-colors"
                    >
                        ← Voltar ao login
                    </Link>
                </div>
            </div>
        </div>
    )
}