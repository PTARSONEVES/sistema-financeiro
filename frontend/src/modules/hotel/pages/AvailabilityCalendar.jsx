import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import ThemeToggle from '../../../components/ThemeToggle';

export default function AvailabilityCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);

    // Gerar dias do mês
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const days = [];
        const startPadding = firstDay.getDay(); // 0 = domingo, 1 = segunda...
        
        // Dias do mês anterior (para preencher início)
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startPadding - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthLastDay - i),
                currentMonth: false
            });
        }
        
        // Dias do mês atual
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({
                date: new Date(year, month, i),
                currentMonth: true
            });
        }
        
        // Dias do próximo mês (para completar 42 dias - 6 semanas)
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                currentMonth: false
            });
        }
        
        return days;
    };

    useEffect(() => {
        loadData();
    }, [currentDate]);

    const loadData = async () => {
        try {
            setLoading(true);
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
            const endDate = `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
            
            const [roomsRes, bookingsRes] = await Promise.all([
                api.get('/hotel/rooms'),
                api.get(`/hotel/bookings?startDate=${startDate}&endDate=${endDate}`)
            ]);
            
            setRooms(roomsRes.data);
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const getBookingsForDay = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return bookings.filter(booking => 
            booking.check_in <= dateStr && booking.check_out > dateStr &&
            booking.status !== 'cancelado' && booking.status !== 'checkout'
        );
    };

    const getRoomStatus = (room, date) => {
        const dateStr = date.toISOString().split('T')[0];
        const booking = bookings.find(b => 
            b.room_id === room.id &&
            b.check_in <= dateStr && 
            b.check_out > dateStr &&
            b.status !== 'cancelado' && 
            b.status !== 'checkout'
        );
        
        if (booking) {
            return {
                status: booking.status,
                guest: booking.guest_name,
                booking: booking
            };
        }
        
        return { status: 'disponivel' };
    };

    const getStatusColor = (status) => {
        const colors = {
            disponivel: 'bg-green-100 hover:bg-green-200 border-green-300',
            reservado: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300',
            confirmado: 'bg-blue-100 hover:bg-blue-200 border-blue-300',
            checkin: 'bg-purple-100 hover:bg-purple-200 border-purple-300',
            ocupado: 'bg-red-100 hover:bg-red-200 border-red-300',
            manutencao: 'bg-gray-100 hover:bg-gray-200 border-gray-300'
        };
        return colors[status] || 'bg-white hover:bg-gray-50 border-gray-200';
    };

    const changeMonth = (delta) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    };

    const days = getDaysInMonth(currentDate);
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

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
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Calendário de Disponibilidade
                    </h1>
                    
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            ← Mês Anterior
                        </button>
                        <span className="text-xl font-semibold">
                            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                            onClick={() => changeMonth(1)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            Próximo Mês →
                        </button>
                    </div>
                </div>

                {/* Legenda */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
                    <div className="flex flex-wrap gap-4">
                        <span className="flex items-center">
                            <span className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></span>
                            Disponível
                        </span>
                        <span className="flex items-center">
                            <span className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded mr-2"></span>
                            Reservado
                        </span>
                        <span className="flex items-center">
                            <span className="w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-2"></span>
                            Confirmado
                        </span>
                        <span className="flex items-center">
                            <span className="w-4 h-4 bg-purple-100 border border-purple-300 rounded mr-2"></span>
                            Check-in
                        </span>
                        <span className="flex items-center">
                            <span className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></span>
                            Ocupado
                        </span>
                    </div>
                </div>

                {/* Calendário */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    {/* Cabeçalho com dias da semana */}
                    <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700 border-b">
                        {weekDays.map(day => (
                            <div key={day} className="p-4 text-center font-semibold text-gray-700 dark:text-gray-300">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Grade do calendário */}
                    <div className="grid grid-cols-7 divide-x divide-y">
                        {days.map((day, index) => {
                            const dayBookings = getBookingsForDay(day.date);
                            const isToday = day.date.toDateString() === new Date().toDateString();
                            
                            return (
                                <div
                                    key={index}
                                    className={`min-h-[150px] p-2 ${
                                        !day.currentMonth ? 'bg-gray-50 dark:bg-gray-900 opacity-50' : ''
                                    } ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
                                >
                                    <div className="text-right mb-2">
                                        <span className={`text-sm font-semibold ${
                                            !day.currentMonth ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                            {day.date.getDate()}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        {rooms.slice(0, 4).map(room => {
                                            const roomStatus = getRoomStatus(room, day.date);
                                            if (roomStatus.status === 'disponivel') return null;
                                            
                                            return (
                                                <div
                                                    key={room.id}
                                                    className={`text-xs p-1 rounded cursor-pointer ${getStatusColor(roomStatus.status)}`}
                                                    onClick={() => {
                                                        setSelectedRoom(room);
                                                        setSelectedDay(day.date);
                                                        setShowBookingModal(true);
                                                    }}
                                                    title={`${room.room_number} - ${roomStatus.guest || ''}`}
                                                >
                                                    <span className="font-bold">{room.room_number}</span>
                                                    {roomStatus.guest && (
                                                        <span className="ml-1 truncate block">
                                                            {roomStatus.guest.split(' ')[0]}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        
                                        {dayBookings.length > 4 && (
                                            <div className="text-xs text-center text-gray-500 mt-1">
                                                +{dayBookings.length - 4} mais
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Modal de Nova Reserva Rápida */}
                {showBookingModal && selectedDay && selectedRoom && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
                            <h3 className="text-xl font-bold mb-4">
                                Nova Reserva - {selectedRoom.room_number}
                            </h3>
                            
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                // Implementar criação rápida de reserva
                            }}>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Documento do hóspede"
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        required
                                    />
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="date"
                                            value={selectedDay.toISOString().split('T')[0]}
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                            required
                                        />
                                        <input
                                            type="date"
                                            value={new Date(selectedDay.getTime() + 86400000).toISOString().split('T')[0]}
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            placeholder="Adultos"
                                            min="1"
                                            defaultValue="1"
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Crianças"
                                            min="0"
                                            defaultValue="0"
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                    
                                    <textarea
                                        placeholder="Observações"
                                        rows="3"
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    ></textarea>
                                </div>
                                
                                <div className="flex space-x-3 mt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Criar Reserva
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowBookingModal(false)}
                                        className="flex-1 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}