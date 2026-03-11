import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from './ThemeToggle'  // <-- IMPORTANDO O THEME TOGGLE

export default function Navbar() {
    const { user, logout } = useAuth()
    const { darkMode } = useTheme()
    const location = useLocation()
    const navigate = useNavigate()

    const isActive = (path) => {
        return location.pathname === path
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-lg fixed top-0 left-0 right-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo e Links Principais */}
                    <div className="flex">
                        {/* Logo / Home */}
                        <Link
                            to="/dashboard"
                            className="flex items-center space-x-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold text-xl">Financeiro</span>
                        </Link>

                        {/* Links de Navegação - só aparece se logado */}
                        {user && (
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                                <Link
                                    to="/dashboard"
                                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                                        ${isActive('/dashboard')
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Dashboard
                                </Link>

                                <Link
                                    to="/accounts"
                                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                                        ${isActive('/accounts')
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Contas
                                </Link>

                                <Link
                                    to="/accounts/new"
                                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                                        ${isActive('/accounts/new')
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                              d="M12 4v16m8-8H4" />
                                    </svg>
                                    Nova Conta
                                </Link>
                                <Link
                                    to="/change-password"
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium 
                                            text-gray-700 dark:text-gray-300 hover:text-blue-600 
                                            dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 
                                            rounded-md transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                    <span className="hidden md:inline">Alterar Senha</span>
                                </Link>
                                <Link to="/hotel/dashboard" className="...">Dashboard Hotel</Link>
                                <Link to="/hotel/map" className="...">Mapa</Link>
                                <Link to="/hotel/calendar" className="...">Calendário</Link>
                                <Link to="/hotel/bookings" className="...">Reservas</Link>
                                <Link to="/hotel/guests" className="...">Hóspedes</Link>
                            </div>
                        )}
                    </div>

                    {/* Área do usuário, tema e logout */}
                    <div className="flex items-center space-x-3">
                        {/* BOTÃO DO TEMA - AQUI É O LUGAR CORRETO */}
                        <ThemeToggle />
                        
                        {user ? (
                            <>
                                <span className="text-sm text-gray-700 dark:text-gray-300 hidden md:block">
                                    Olá, <span className="font-semibold">{user.name || user.email}</span>
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium 
                                             text-red-600 dark:text-red-400 hover:text-red-800 
                                             dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 
                                             rounded-md transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span className="hidden md:inline">Sair</span>
                                </button>
                            </>
                        ) : (
                            <div className="space-x-2">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium 
                                             text-blue-600 dark:text-blue-400 hover:text-blue-800 
                                             dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 
                                             rounded-md transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium 
                                             bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                >
                                    Registrar
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Breadcrumb - Mostra onde o usuário está */}
            {user && (
                <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">
                                Início
                            </Link>
                            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-gray-900 dark:text-white font-medium">
                                {location.pathname === '/dashboard' && 'Dashboard'}
                                {location.pathname === '/accounts' && 'Contas'}
                                {location.pathname === '/accounts/new' && 'Nova Conta'}
                                {location.pathname.startsWith('/accounts/edit/') && 'Editar Conta'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}