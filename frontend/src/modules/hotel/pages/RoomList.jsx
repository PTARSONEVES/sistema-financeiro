import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import ThemeToggle from '../../../components/ThemeToggle';

export default function RoomList() {
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        room_number: '',
        floor: '',
        room_type_id: '',
        observations: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [roomsRes, typesRes] = await Promise.all([
                api.get('/hotel/rooms'),
                api.get('/hotel/room-types')
            ]);
            setRooms(roomsRes.data);
            setRoomTypes(typesRes.data);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRoom) {
                await api.put(`/hotel/rooms/${editingRoom.id}`, formData);
            } else {
                await api.post('/hotel/rooms', formData);
            }
            loadData();
            setShowForm(false);
            setEditingRoom(null);
            setFormData({ room_number: '', floor: '', room_type_id: '', observations: '' });
        } catch (error) {
            alert(error.response?.data?.error || 'Erro ao salvar');
        }
    };

    const handleEdit = (room) => {
        setEditingRoom(room);
        setFormData({
            room_number: room.room_number,
            floor: room.floor,
            room_type_id: room.type_id,
            observations: room.observations || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Tem certeza que deseja excluir este apartamento?')) {
            try {
                await api.delete(`/hotel/rooms/${id}`);
                loadData();
            } catch (error) {
                alert(error.response?.data?.error || 'Erro ao excluir');
            }
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
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Gerenciar Apartamentos
                    </h1>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Novo Apartamento
                    </button>
                </div>

                {/* Tabela de Apartamentos */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Número
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Andar
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Diária
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {rooms.map(room => (
                                <tr key={room.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                                        {room.room_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {room.floor}º
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {room.room_type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            room.status === 'disponivel' ? 'bg-green-100 text-green-800' :
                                            room.status === 'ocupado' ? 'bg-red-100 text-red-800' :
                                            room.status === 'manutencao' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {room.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        R$ {room.base_price}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(room)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(room.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Formulário */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
                        <h3 className="text-xl font-bold mb-4">
                            {editingRoom ? 'Editar' : 'Novo'} Apartamento
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Número (ex: 101)"
                                className="w-full mb-3 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                value={formData.room_number}
                                onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Andar"
                                className="w-full mb-3 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                value={formData.floor}
                                onChange={(e) => setFormData({...formData, floor: e.target.value})}
                                required
                            />
                            <select
                                className="w-full mb-3 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                value={formData.room_type_id}
                                onChange={(e) => setFormData({...formData, room_type_id: e.target.value})}
                                required
                            >
                                <option value="">Selecione o tipo</option>
                                {roomTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name} - R$ {type.base_price}
                                    </option>
                                ))}
                            </select>
                            <textarea
                                placeholder="Observações (opcional)"
                                className="w-full mb-3 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                rows="3"
                                value={formData.observations}
                                onChange={(e) => setFormData({...formData, observations: e.target.value})}
                            />
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Salvar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingRoom(null);
                                        setFormData({ room_number: '', floor: '', room_type_id: '', observations: '' });
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
        </div>
    );
}