import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import ThemeToggle from '../../../components/ThemeToggle';

export default function GuestList() {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingGuest, setEditingGuest] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        document: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: 'Brasil'
    });

    useEffect(() => {
        loadGuests();
    }, []);

    const loadGuests = async () => {
        try {
            const response = await api.get('/hotel/guests');
            setGuests(response.data);
        } catch (error) {
            console.error('Erro ao carregar hóspedes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingGuest) {
                await api.put(`/hotel/guests/${editingGuest.id}`, formData);
            } else {
                await api.post('/hotel/guests', formData);
            }
            loadGuests();
            setShowForm(false);
            resetForm();
        } catch (error) {
            alert(error.response?.data?.error || 'Erro ao salvar');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            document: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            country: 'Brasil'
        });
        setEditingGuest(null);
    };

    const handleEdit = (guest) => {
        setEditingGuest(guest);
        setFormData(guest);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Tem certeza que deseja excluir este hóspede?')) {
            try {
                await api.delete(`/hotel/guests/${id}`);
                loadGuests();
            } catch (error) {
                alert(error.response?.data?.error || 'Erro ao excluir');
            }
        }
    };

    const filteredGuests = guests.filter(guest =>
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.document.includes(searchTerm) ||
        guest.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        Hóspedes
                    </h1>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Novo Hóspede
                    </button>
                </div>

                {/* Busca */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Buscar por nome, documento ou email..."
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Lista */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contato</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cidade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reservas</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredGuests.map(guest => (
                                <tr key={guest.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                                        {guest.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {guest.document}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>{guest.email}</div>
                                        <div className="text-sm text-gray-500">{guest.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {guest.city}/{guest.state}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                            {guest.total_bookings || 0} reservas
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(guest)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(guest.id)}
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            {editingGuest ? 'Editar' : 'Novo'} Hóspede
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Nome completo *"
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                            <input
                                type="text"
                                placeholder="CPF/RG/Passaporte *"
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                value={formData.document}
                                onChange={(e) => setFormData({...formData, document: e.target.value})}
                                required
                                disabled={editingGuest}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                            <input
                                type="text"
                                placeholder="Telefone"
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                            <input
                                type="text"
                                placeholder="Endereço"
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    placeholder="Cidade"
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    value={formData.city}
                                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                                />
                                <input
                                    type="text"
                                    placeholder="UF"
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    value={formData.state}
                                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                                    maxLength="2"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="País"
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                value={formData.country}
                                onChange={(e) => setFormData({...formData, country: e.target.value})}
                            />
                            
                            <div className="flex space-x-3 pt-4">
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
        </div>
    );
}