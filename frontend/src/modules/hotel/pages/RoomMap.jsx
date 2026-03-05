import React, { useState, useEffect } from 'react';
import api from '../../../services/api';  // Mudou de core/services/api
import RoomCard from '../components/RoomCard';
import ThemeToggle from '../../../components/ThemeToggle';  // Ajustado

export default function RoomMap() {
    const [floors, setFloors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        disponivel: 0,
        ocupado: 0,
        manutencao: 0
    });


    useEffect(() => {
 
    console.log('🔍 RoomMap montado');
    console.log('🔍 Token no load:', localStorage.getItem('token'));        
 
        loadRoomMap();
    }, []);

    const loadRoomMap = async () => {
        try {
            setLoading(true);
            const response = await api.get('/hotel/rooms/map');
            setFloors(response.data);
            
            // Calcular estatísticas
            let total = 0;
            let disponivel = 0;
            let ocupado = 0;
            let manutencao = 0;
            
            response.data.forEach(floor => {
                floor.rooms.forEach(room => {
                    total++;
                    if (room.status === 'disponivel') disponivel++;
                    else if (room.status === 'ocupado') ocupado++;
                    else if (room.status === 'manutencao') manutencao++;
                });
            });
            
            setStats({ total, disponivel, ocupado, manutencao });
            
        } catch (error) {
            console.error('Erro ao carregar mapa:', error);
            if (error.response?.status === 401) {
                setError('Sessão expirada. Faça login novamente.');
            } else {
                setError('Erro ao carregar mapa de ocupação');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRoomClick = (room) => {
        setSelectedRoom(room);
    };

    const handleStatusChange = async (roomId, newStatus) => {
        try {
            await api.patch(`/hotel/rooms/${roomId}/status`, { status: newStatus });
            loadRoomMap(); // Recarregar mapa
            setSelectedRoom(null);
        } catch (error) {
            alert('Erro ao atualizar status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <ThemeToggle />
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando mapa...</p>
                </div>
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
                        Mapa de Ocupação
                    </h1>
                    
                    {/* Legenda */}
                    <div className="flex space-x-4 text-sm">
                        <span className="flex items-center">
                            <span className="w-3 h-3 bg-green-100 border border-green-500 rounded mr-1"></span>
                            Disponível
                        </span>
                        <span className="flex items-center">
                            <span className="w-3 h-3 bg-red-100 border border-red-500 rounded mr-1"></span>
                            Ocupado
                        </span>
                        <span className="flex items-center">
                            <span className="w-3 h-3 bg-yellow-100 border border-yellow-500 rounded mr-1"></span>
                            Manutenção
                        </span>
                        <span className="flex items-center">
                            <span className="w-3 h-3 bg-blue-100 border border-blue-500 rounded mr-1"></span>
                            Limpeza
                        </span>
                    </div>
                </div>

                {/* Cards de Estatística */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <div className="text-sm text-gray-500">Total</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stats.total}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <div className="text-sm text-gray-500">Disponíveis</div>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.disponivel}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <div className="text-sm text-gray-500">Ocupados</div>
                        <div className="text-2xl font-bold text-red-600">
                            {stats.ocupado}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <div className="text-sm text-gray-500">Manutenção</div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {stats.manutencao}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Mapa por Andar */}
                <div className="space-y-8">
                    {floors.map(floor => (
                        <div key={floor.floor} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                {floor.floor}º Andar
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {floor.rooms.map(room => (
                                    <RoomCard
                                        key={room.id}
                                        room={room}
                                        onClick={handleRoomClick}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de Detalhes do Apartamento */}
            {selectedRoom && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Apartamento {selectedRoom.number}
                        </h3>
                        
                        <div className="space-y-3 mb-6">
                            <p><strong>Tipo:</strong> {selectedRoom.type}</p>
                            <p><strong>Diária:</strong> R$ {selectedRoom.price}</p>
                            <p><strong>Status atual:</strong> {selectedRoom.status}</p>
                            {selectedRoom.guest && (
                                <>
                                    <p><strong>Hóspede:</strong> {selectedRoom.guest}</p>
                                    <p><strong>Saída prevista:</strong> {
                                        new Date(selectedRoom.checkout).toLocaleDateString()
                                    }</p>
                                </>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <button
                                onClick={() => handleStatusChange(selectedRoom.id, 'disponivel')}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Disponível
                            </button>
                            <button
                                onClick={() => handleStatusChange(selectedRoom.id, 'ocupado')}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Ocupado
                            </button>
                            <button
                                onClick={() => handleStatusChange(selectedRoom.id, 'manutencao')}
                                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            >
                                Manutenção
                            </button>
                            <button
                                onClick={() => handleStatusChange(selectedRoom.id, 'limpeza')}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Limpeza
                            </button>
                        </div>

                        <button
                            onClick={() => setSelectedRoom(null)}
                            className="w-full py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}