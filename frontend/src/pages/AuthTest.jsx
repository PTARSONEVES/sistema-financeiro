import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthTest() {
    const { user, loading } = useAuth();

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Teste de Autenticação</h1>
            
            <div className="bg-gray-100 p-4 rounded">
                <h2 className="font-bold mb-2">Token:</h2>
                <p className="text-sm break-all">{localStorage.getItem('token') || 'Nenhum'}</p>
                
                <h2 className="font-bold mt-4 mb-2">Usuário:</h2>
                <pre className="bg-white p-2 rounded">
                    {JSON.stringify(user, null, 2)}
                </pre>
            </div>
        </div>
    );
}