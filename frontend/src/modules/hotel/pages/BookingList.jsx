import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import ThemeToggle from '../../../components/ThemeToggle';

export default function BookingList() {
    const [bookings, setBookings] = useState([]);
    const [guests, setGuests] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showDetails, setShowDetails] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [filters, setFilters] = useState({
        status: '',
        startDate: '',
        endDate: ''
    });

    const [formData, setFormData] = useState({
        guest_id: '',
        guest_document: '',
        guest_name: '',
        room_id: '',
        check_in: new Date().toISOString().split('T')[0],
        check_out: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        adults: 1,
        children: 0,
        total_amount: 0,
        observations: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [bookingsRes, guestsRes, roomsRes] = await Promise.all([
                api.get('/hotel/bookings'),
                api.get('/hotel/guests'),
                api.get('/hotel/rooms')
            ]);
            setBookings(bookingsRes.data);
            setGuests(guestsRes.data);
            setRooms(roomsRes.data);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            
            const response = await api.get(`/hotel/bookings?${params}`);
            setBookings(response.data);
        } catch (error) {
            console.error('Erro ao filtrar:', error);
        }
    };

    const checkAvailability = async () => {
        if (!formData.check_in || !formData.check_out) {
            alert('Selecione as datas de check-in e check-out');
            return;
        }

        try {
            setCheckingAvailability(true);
            const params = new URLSearchParams({
                check_in: formData.check_in,
                check_out: formData.check_out
            });
            
            if (selectedRoom?.room_type_id) {
                params.append('room_type_id', selectedRoom.room_type_id);
            }
            
            const response = await api.get(`/hotel/bookings/availability?${params}`);
            setAvailableRooms(response.data);
        } catch (error) {
            console.error('Erro ao verificar disponibilidade:', error);
        } finally {
            setCheckingAvailability(false);
        }
    };

    const searchGuestByDocument = async () => {
        if (!formData.guest_document) return;
        
        try {
            const response = await api.get(`/hotel/guests/document/${formData.guest_document}`);
            setFormData(prev => ({
                ...prev,
                guest_id: response.data.id,
                guest_name: response.data.name
            }));
        } catch (error) {
            alert('Hóspede não encontrado. Cadastre-o primeiro.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.guest_id) {
            alert('Selecione um hóspede');
            return;
        }
        
        if (!formData.room_id) {
            alert('Selecione um apartamento');
            return;
        }

        try {
            const bookingData = {
                ...formData,
                total_amount: selectedRoom?.base_price * (
                    (new Date(formData.check_out) - new Date(formData.check_in)) / (86400000)
                )
            };
            
            await api.post('/hotel/bookings', bookingData);
            loadData();
            setShowForm(false);
            resetForm();
        } catch (error) {
            alert(error.response?.data?.error || 'Erro ao criar reserva');
        }
    };

    const resetForm = () => {
        setFormData({
            guest_id: '',
            guest_document: '',
            guest_name: '',
            room_id: '',
            check_in: new Date().toISOString().split('T')[0],
            check_out: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            adults: 1,
            children: 0,
            total_amount: 0,
            observations: ''
        });
        setSelectedRoom(null);
        setAvailableRooms([]);
    };

    const handleCheckIn = async (bookingId) => {
        try {
            await api.post(`/hotel/bookings/${bookingId}/checkin`);
            loadData();
        } catch (error) {
            alert('Erro ao realizar check-in');
        }
    };

    const handleCheckOut = async (bookingId) => {
        try {
            const paymentMethod = prompt('Forma de pagamento (dinheiro, cartao, pix):');
            if (!paymentMethod) return;
            
            await api.post(`/hotel/bookings/${bookingId}/checkout`, {
                payment_method: paymentMethod,
                paid_amount: prompt('Valor pago:')
            });
            loadData();
        } catch (error) {
            alert('Erro ao realizar check-out');
        }
    };

    const handleCancel = async (bookingId) => {
        if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
            try {
                await api.post(`/hotel/bookings/${bookingId}/cancel`);
                loadData();
            } catch (error) {
                alert('Erro ao cancelar reserva');
            }
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            reservado: 'bg-purple-100 text-purple-800',
            confirmado: 'bg-blue-100 text-blue-800',
            checkin: 'bg-green-100 text-green-800',
            checkout: 'bg-gray-100 text-gray-800',
            cancelado: 'bg-red-100 text-red-800',
            noshow: 'bg-yellow-100 text-yellow-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const calculateNights = (checkIn, checkOut) => {
        const diff = new Date(checkOut) - new Date(checkIn);
        return diff / (86400000);
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
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Reservas
                    </h1>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Nova Reserva
                    </button>
                </div>

                {/* Filtros */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select
                            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                        >
                            <option value="">Todos os status</option>
                            <option value="reservado">Reservado</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="checkin">Check-in</option>
                            <option value="checkout">Check-out</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                        
                        <input
                            type="date"
                            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            value={filters.startDate}
                            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                            placeholder="Data inicial"
                        />
                        
                        <input
                            type="date"
                            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            value={filters.endDate}
                            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                            placeholder="Data final"
                        />
                        
                        <button
                            onClick={applyFilters}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Filtrar
                        </button>
                    </div>
                </div>

                {/* Lista de Reservas */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hóspede</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Apartamento</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Noites</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {bookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{booking.guest_name}</div>
                                            <div className="text-sm text-gray-500">{booking.guest_document}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>{booking.room_number}</div>
                                            <div className="text-sm text-gray-500">{booking.room_type}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(booking.check_in).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(booking.check_out).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {calculateNights(booking.check_in, booking.check_out)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                            R$ {booking.total_amount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                            <button
                                                onClick={() => setShowDetails(booking)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Detalhes"
                                            >
                                                👁️
                                            </button>
                                            
                                            {booking.status === 'reservado' && (
                                                <>
                                                    <button
                                                        onClick={() => handleCheckIn(booking.id)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Check-in"
                                                    >
                                                        ✅
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancel(booking.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Cancelar"
                                                    >
                                                        ❌
                                                    </button>
                                                </>
                                            )}
                                            
                                            {booking.status === 'checkin' && (
                                                <button
                                                    onClick={() => handleCheckOut(booking.id)}
                                                    className="text-orange-600 hover:text-orange-900"
                                                    title="Check-out"
                                                >
                                                    🏁
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Nova Reserva */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Nova Reserva</h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Buscar Hóspede por Documento */}
                            <div className="grid grid-cols-3 gap-2">
                                <input
                                    type="text"
                                    placeholder="CPF do hóspede"
                                    className="col-span-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    value={formData.guest_document}
                                    onChange={(e) => setFormData({...formData, guest_document: e.target.value})}
                                />
                                <button
                                    type="button"
                                    onClick={searchGuestByDocument}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Buscar
                                </button>
                            </div>
                            
                            {formData.guest_name && (
                                <div className="p-2 bg-green-100 text-green-800 rounded">
                                    Hóspede: {formData.guest_name}
                                </div>
                            )}
                            
                            {/* Datas */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Check-in</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        value={formData.check_in}
                                        onChange={(e) => setFormData({...formData, check_in: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Check-out</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        value={formData.check_out}
                                        onChange={(e) => setFormData({...formData, check_out: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            
                            {/* Botão Verificar Disponibilidade */}
                            <button
                                type="button"
                                onClick={checkAvailability}
                                disabled={checkingAvailability}
                                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                {checkingAvailability ? 'Verificando...' : 'Verificar Disponibilidade'}
                            </button>
                            
                            {/* Lista de Apartamentos Disponíveis */}
                            {availableRooms.length > 0 && (
                                <div className="border rounded p-4">
                                    <h4 className="font-bold mb-2">Apartamentos Disponíveis:</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {availableRooms.map(room => (
                                            <div
                                                key={room.id}
                                                className={`p-3 border rounded cursor-pointer transition-all ${
                                                    selectedRoom?.id === room.id
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                                                        : 'hover:border-gray-400'
                                                }`}
                                                onClick={() => {
                                                    setSelectedRoom(room);
                                                    setFormData({...formData, room_id: room.id});
                                                }}
                                            >
                                                <div className="font-bold">{room.room_number}</div>
                                                <div className="text-sm">{room.room_type}</div>
                                                <div className="text-sm font-semibold">R$ {room.base_price}/noite</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Hóspedes */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Adultos</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        value={formData.adults}
                                        onChange={(e) => setFormData({...formData, adults: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Crianças</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        value={formData.children}
                                        onChange={(e) => setFormData({...formData, children: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                            
                            {/* Observações */}
                            <textarea
                                placeholder="Observações"
                                rows="3"
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                value={formData.observations}
                                onChange={(e) => setFormData({...formData, observations: e.target.value})}
                            />
                            
                            {/* Total */}
                            {selectedRoom && (
                                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded">
                                    <div className="flex justify-between font-bold">
                                        <span>Total:</span>
                                        <span>
                                            R$ {selectedRoom.base_price * calculateNights(formData.check_in, formData.check_out)}
                                        </span>
                                    </div>
                                </div>
                            )}
                            
                            {/* Botões */}
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    disabled={!formData.guest_id || !formData.room_id}
                                >
                                    Salvar Reserva
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        resetForm();
                                    }}
                                    className="flex-1 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detalhes da Reserva */}
            {showDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[500px]">
                        <h3 className="text-xl font-bold mb-4">Detalhes da Reserva</h3>
                        
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <span className="font-semibold">Hóspede:</span>
                                <span>{showDetails.guest_name}</span>
                                
                                <span className="font-semibold">Documento:</span>
                                <span>{showDetails.guest_document}</span>
                                
                                <span className="font-semibold">Apartamento:</span>
                                <span>{showDetails.room_number} - {showDetails.room_type}</span>
                                
                                <span className="font-semibold">Check-in:</span>
                                <span>{new Date(showDetails.check_in).toLocaleDateString()}</span>
                                
                                <span className="font-semibold">Check-out:</span>
                                <span>{new Date(showDetails.check_out).toLocaleDateString()}</span>
                                
                                <span className="font-semibold">Noites:</span>
                                <span>{calculateNights(showDetails.check_in, showDetails.check_out)}</span>
                                
                                <span className="font-semibold">Adultos:</span>
                                <span>{showDetails.adults}</span>
                                
                                <span className="font-semibold">Crianças:</span>
                                <span>{showDetails.children}</span>
                                
                                <span className="font-semibold">Valor Total:</span>
                                <span className="font-bold text-green-600">R$ {showDetails.total_amount}</span>
                                
                                <span className="font-semibold">Status:</span>
                                <span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(showDetails.status)}`}>
                                        {showDetails.status}
                                    </span>
                                </span>
                            </div>
                            
                            {showDetails.observations && (
                                <div>
                                    <span className="font-semibold">Observações:</span>
                                    <p className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                        {showDetails.observations}
                                    </p>
                                </div>
                            )}
                            
                            {showDetails.check_in_real && (
                                <div>
                                    <span className="font-semibold">Check-in realizado:</span>
                                    <p>{new Date(showDetails.check_in_real).toLocaleString()}</p>
                                </div>
                            )}
                            
                            {showDetails.check_out_real && (
                                <div>
                                    <span className="font-semibold">Check-out realizado:</span>
                                    <p>{new Date(showDetails.check_out_real).toLocaleString()}</p>
                                </div>
                            )}
                        </div>
                        
                        <button
                            onClick={() => setShowDetails(null)}
                            className="w-full mt-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}