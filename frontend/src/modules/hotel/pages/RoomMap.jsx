import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

export default function RoomMap() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('📌 RoomMap montado');
        loadData();
    }, []);

    const loadData = async () => {
        try {
            console.log('📌 Fazendo requisição...');
            const response = await api.get('/hotel/rooms/map');
            console.log('📌 Resposta:', response.data);
            setData(response.data);
        } catch (err) {
            console.error('❌ Erro detalhado:', err);
            console.error('❌ Response:', err.response);
            console.error('❌ Status:', err.response?.status);
            console.error('❌ Data:', err.response?.data);
            
            if (err.response?.status === 401) {
                setError('Erro de autenticação');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando...</div>;
    if (error) return <div className="p-8 text-center text-red-600">Erro: {error}</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Mapa de Ocupação - TESTE</h1>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}