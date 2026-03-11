import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import ThemeToggle from '../../../components/ThemeToggle';

export default function HotelDashboard() {
    const [stats, setStats] = useState({
        totalRooms: 0,
        occupiedRooms: 0,
        availableRooms: 0,
        maintenanceRooms: 0,
        todayCheckins: 0,
        todayCheckouts: 0,
        monthlyRevenue: 0,
        occupancyRate: 0
    });
    
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [roomsRes, bookingsRes] = await Promise.all([
                api.get('/hotel/rooms'),
                api.get('/hotel/bookings')
            ]);
            
            const rooms = roomsRes.data;
            const bookings = bookingsRes.data;
            const today = new Date().toISOString().split('T')[0];
            
            // Estatísticas
            const occupiedRooms = rooms.filter(r => r.status === 'ocupado').length;
            const availableRooms = rooms.filter(r => r.status === 'disponivel').length;
            const maintenanceRooms = rooms.filter(r => r.status === 'manutencao').length;
            
            const todayCheckins = bookings.filter(b => 
                b.check_in === today && b.status === 'reservado'
            ).length;
            
            const todayCheckouts = bookings.filter(b => 
                b.check_out === today && b.status === 'checkin'
            ).length;
            
            // Receita do mês
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            const monthlyRevenue = bookings
                .filter(b => {
                    const date = new Date(b.check_in);
                    return date.getMonth() + 1 === currentMonth && 
                           date.getFullYear() === currentYear &&
                           b.status === 'checkout';
                })
                .reduce((sum, b) => sum + parseFloat(b.total_amount), 0);
            
            setStats({
                totalRooms: rooms.length,
                occupiedRooms,
                availableRooms,
                maintenanceRooms,
                todayCheckins,
                todayCheckouts,
                monthlyRevenue,
                occupancyRate: Math.round((occupiedRooms / rooms.length) * 100) || 0
            });
            
            // Reservas recentes
            setRecentBookings(bookings.slice(0, 5));
            
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <ThemeToggle />
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-20 pb-8">
            <ThemeToggle />
            
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Dashboard do Hotel
                </h1>

                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Ocupação</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.occupancyRate}%</p>
                            </div>
                            <span className="text-4xl">🏨</span>
                        </div>
                        <div className="mt-4 text-sm">
                            <span className="text-green-600">{stats.availableRooms} livres</span>
                            <span className="mx-2">|</span>
                            <span className="text-red-600">{stats.occupiedRooms} ocupados</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Hoje</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {stats.todayCheckins} / {stats.todayCheckouts}
                                </p>
                            </div>
                            <span className="text-4xl">📅</span>
                        </div>
                        <div className="mt-4 text-sm">
                            <span className="text-blue-600">{stats.todayCheckins} check-ins</span>
                            <span className="mx-2">|</span>
                            <span className="text-orange-600">{stats.todayCheckouts} check-outs</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Receita do Mês</p>
                                <p className="text-3xl font-bold text-green-600">
                                    R$ {stats.monthlyRevenue.toFixed(2)}
                                </p>
                            </div>
                            <span className="text-4xl">💰</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Manutenção</p>
                                <p className="text-3xl font-bold text-yellow-600">
                                    {stats.maintenanceRooms}
                                </p>
                            </div>
                            <span className="text-4xl">🔧</span>
                        </div>
                        <div className="mt-4 text-sm">
                            <Link to="/hotel/rooms" className="text-blue-600 hover:underline">
                                Ver apartamentos
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Ações Rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Link to="/hotel/bookings/new" 
                          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center">
                        Nova Reserva
                    </Link>
                    <Link to="/hotel/checkin" 
                          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center">
                        Check-in Rápido
                    </Link>
                    <Link to="/hotel/calendar" 
                          className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center">
                        Ver Calendário
                    </Link>
                </div>

                {/* Reservas Recentes */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Reservas Recentes</h2>
                    <div className="space-y-3">
                        {recentBookings.map(booking => (
                            <div key={booking.id} 
                                 className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                <div>
                                    <p className="font-medium">{booking.guest_name}</p>
                                    <p className="text-sm text-gray-500">
                                        {booking.room_number} • {new Date(booking.check_in).toLocaleDateString()} 
                                        até {new Date(booking.check_out).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    booking.status === 'checkin' ? 'bg-green-100 text-green-800' :
                                    booking.status === 'reservado' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                }`}>
                                    {booking.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}