import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { AccountProvider } from './context/AccountContext'
import Navbar from './components/Navbar'  // <-- IMPORTAR NAVBAR
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import AccountForm from './pages/AccountForm'

function PrivateRoute({ children }) {
    const { user } = useAuth()
    return user ? children : <Navigate to="/login" />
}

function AppContent() {
    const { user } = useAuth()
    
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Navbar sempre visível, mas com conteúdo diferente se logado */}
            <Navbar />
            
            {/* Conteúdo com padding-top para não ficar escondido atrás da navbar */}
            <div className="pt-16"> {/* 16 = altura da navbar (h-16) */}
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/accounts"
                        element={
                            <PrivateRoute>
                                <Accounts />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/accounts/new"
                        element={
                            <PrivateRoute>
                                <AccountForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/accounts/edit/:id"
                        element={
                            <PrivateRoute>
                                <AccountForm />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </div>
        </div>
    )
}

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <AccountProvider>
                        <AppContent />
                    </AccountProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    )
}

export default App