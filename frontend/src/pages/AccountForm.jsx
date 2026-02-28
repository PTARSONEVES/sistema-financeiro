import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { useAccounts } from '../context/AccountContext'
import ThemeToggle from '../components/ThemeToggle'

export default function AccountForm() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { createAccount, updateAccount, accounts } = useAccounts()
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amount: '',
        type: 'pagar',
        due_date: new Date().toISOString().split('T')[0],
        status: 'pendente'
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Se for edição, carregar dados da conta
    useEffect(() => {
        if (id) {
            const account = accounts.find(a => a.id === parseInt(id))
            if (account) {
                setFormData({
                    title: account.title,
                    description: account.description || '',
                    amount: account.amount,
                    type: account.type,
                    due_date: account.due_date.split('T')[0],
                    status: account.status
                })
            }
        }
    }, [id, accounts])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Validações
        if (!formData.title || !formData.amount || !formData.due_date) {
            setError('Preencha todos os campos obrigatórios')
            setLoading(false)
            return
        }

        const amount = parseFloat(formData.amount)
        if (isNaN(amount) || amount <= 0) {
            setError('Valor inválido')
            setLoading(false)
            return
        }

        const dataToSend = {
            ...formData,
            amount: amount
        }

        let result
        if (id) {
            result = await updateAccount(parseInt(id), dataToSend)
        } else {
            result = await createAccount(dataToSend)
        }

        if (result.success) {
            navigate('/accounts')
        } else {
            setError(result.error)
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <ThemeToggle />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        {id ? 'Editar Conta' : 'Nova Conta'}
                    </h1>

                    {error && (
                        <div className="mb-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Título *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                         rounded-md bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white"
                                placeholder="Ex: Conta de Luz"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Descrição
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                         rounded-md bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white"
                                placeholder="Descrição detalhada (opcional)"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tipo *
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                             rounded-md bg-white dark:bg-gray-700 
                                             text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="pagar">A Pagar</option>
                                    <option value="receber">A Receber</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status *
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                             rounded-md bg-white dark:bg-gray-700 
                                             text-gray-900 dark:text-white"
                                    required
                                >
                                    <option value="pendente">Pendente</option>
                                    <option value="pago">Pago</option>
                                    <option value="vencido">Vencido</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Valor (R$) *
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                             rounded-md bg-white dark:bg-gray-700 
                                             text-gray-900 dark:text-white"
                                    placeholder="0,00"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Data de Vencimento *
                                </label>
                                <input
                                    type="date"
                                    name="due_date"
                                    value={formData.due_date}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                             rounded-md bg-white dark:bg-gray-700 
                                             text-gray-900 dark:text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/accounts')}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                                         rounded-md text-gray-700 dark:text-gray-300 
                                         hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                                         rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Salvando...' : (id ? 'Atualizar' : 'Salvar')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}