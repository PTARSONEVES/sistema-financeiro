import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import ThemeToggle from '../components/ThemeToggle'

export default function ChangePassword() {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (formData.newPassword.length < 6) {
            setError('A nova senha deve ter no mínimo 6 caracteres')
            return
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('As senhas não coincidem')
            return
        }

        setLoading(true)

        try {
            await api.post('/password/change', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            })
            
            setSuccess('Senha alterada com sucesso!')
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })
            
            setTimeout(() => {
                navigate('/dashboard')
            }, 2000)
            
        } catch (error) {
            setError(error.response?.data?.error || 'Erro ao alterar senha')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-20">
            <ThemeToggle />
            
            <div className="max-w-md mx-auto px-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Alterar Senha
                    </h1>

                    {error && (
                        <div className="mb-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 p-3 rounded">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Senha Atual
                            </label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                         rounded-md bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nova Senha
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                         rounded-md bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Confirmar Nova Senha
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                         rounded-md bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white"
                                required
                            />
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                                         rounded-md text-gray-700 dark:text-gray-300 
                                         hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                                         text-white rounded-md disabled:opacity-50"
                            >
                                {loading ? 'Alterando...' : 'Alterar Senha'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}