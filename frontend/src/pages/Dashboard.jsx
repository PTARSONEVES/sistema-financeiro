import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'
import api from '../services/api'

export default function Dashboard() {
    const { user, logout } = useAuth()
    const { darkMode } = useTheme()
    const [dashboardData, setDashboardData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            console.log('📊 Carregando dados do dashboard...')
            
            const response = await api.get('/accounts/dashboard')
            console.log('✅ Dados recebidos:', response.data)
            
            setDashboardData(response.data)
            setError('')
        } catch (error) {
            console.error('❌ Erro ao carregar dashboard:', error)
            setError('Erro ao carregar dados. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0)
    }

    const calculateBalance = () => {
        const toReceive = dashboardData?.toReceive?.pending || 0
        const toPay = dashboardData?.toPay?.pending || 0
        return toReceive - toPay
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <ThemeToggle />

            {/* Conteúdo */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg">
                        {error}
                        <button 
                            onClick={loadDashboardData}
                            className="ml-4 underline"
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                {/* Cards de resumo */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">Contas a Pagar</h3>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(dashboardData?.toPay?.pending)}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">Contas a Receber</h3>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(dashboardData?.toReceive?.pending)}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">Saldo Previsto</h3>
                        <p className={`text-2xl font-bold ${
                            calculateBalance() >= 0 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-red-600 dark:text-red-400'
                        }`}>
                            {formatCurrency(calculateBalance())}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total de Contas</h3>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {dashboardData?.recentAccounts?.length || 0}
                        </p>
                    </div>
                </div>

                {/* Próximos vencimentos */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Próximos Vencimentos
                    </h2>
                    
                    {dashboardData?.upcoming?.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            Nenhuma conta próxima do vencimento
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {dashboardData?.upcoming?.map(account => (
                                <div key={account.id} 
                                     className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {account.title}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Vence: {new Date(account.due_date).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(account.amount)}
                                        </p>
                                        <span className={`text-sm px-2 py-1 rounded ${
                                            account.type === 'pagar' 
                                                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200' 
                                                : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                                        }`}>
                                            {account.type === 'pagar' ? 'A Pagar' : 'A Receber'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}