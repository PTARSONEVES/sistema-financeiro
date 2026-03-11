import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function TestPage() {
    const { user } = useAuth();
    
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Página de Teste</h1>
            <p>Usuário: {user ? JSON.stringify(user) : 'Não logado'}</p>
            <p>Token: {localStorage.getItem('token') ? 'Presente' : 'Ausente'}</p>
        </div>
    );
}