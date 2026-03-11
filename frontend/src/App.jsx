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
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ChangePassword from './pages/ChangePassword'
import TestPage from './pages/TestPage'
import AuthTest from './pages/AuthTest'
// Importar páginas do hotel
import RoomMap from './modules/hotel/pages/RoomMap';
import RoomList from './modules/hotel/pages/RoomList';
import GuestList from './modules/hotel/pages/GuestList';
import BookingList from './modules/hotel/pages/BookingList';
import AvailabilityCalendar from './modules/hotel/pages/AvailabilityCalendar';
import Consumption from './modules/hotel/pages/Consumption';
import Reports from './modules/hotel/pages/Reports';

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    
    console.log('🔍 PrivateRoute - user:', user);
    console.log('🔍 PrivateRoute - loading:', loading);
    console.log('🔍 PrivateRoute - token:', localStorage.getItem('token'));
    
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>;
    }
    
    if (!user) {
        console.log('❌ Usuário não logado, redirecionando...');
        return <Navigate to="/login" />;
    }
    
    console.log('✅ Usuário logado, renderizando conteúdo');
    return children;
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
                    <Route
                        path="/hotel/map"
                        element={
                            <PrivateRoute>
                                <RoomMap />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/hotel/rooms"
                        element={
                            <PrivateRoute>
                                <RoomList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/hotel/guests"
                        element={
                            <PrivateRoute>
                                <GuestList />
                            </PrivateRoute>
                        }
                    />
                    <Route 
                        path="/hotel/bookings" 
                        element={
                            <PrivateRoute>
                                <BookingList />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/hotel/calendar" 
                        element={
                            <PrivateRoute>
                                <AvailabilityCalendar />
                            </PrivateRoute>
                        } 
                    />
                    <Route path="/hotel/consumption" element={
                        <PrivateRoute>
                            <Consumption />
                        </PrivateRoute>
                    } />
                    <Route path="/hotel/reports" element={
                        <PrivateRoute>
                            <Reports />
                        </PrivateRoute>
                    } />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route
                        path="/change-password"
                        element={
                            <PrivateRoute>
                                <ChangePassword />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/test" element={<TestPage />} />
                    <Route path="/auth-test" element={<AuthTest />} />
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