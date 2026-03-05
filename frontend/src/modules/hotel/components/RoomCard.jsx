import React from 'react';

export default function RoomCard({ room, onClick }) {
    const getStatusColor = (status) => {
        const colors = {
            disponivel: 'bg-green-100 border-green-500 text-green-700 hover:bg-green-200',
            ocupado: 'bg-red-100 border-red-500 text-red-700 hover:bg-red-200',
            manutencao: 'bg-yellow-100 border-yellow-500 text-yellow-700 hover:bg-yellow-200',
            limpeza: 'bg-blue-100 border-blue-500 text-blue-700 hover:bg-blue-200',
            reservado: 'bg-purple-100 border-purple-500 text-purple-700 hover:bg-purple-200'
        };
        return colors[status] || 'bg-gray-100 border-gray-500 text-gray-700 hover:bg-gray-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            disponivel: '✓',
            ocupado: '👤',
            manutencao: '🔧',
            limpeza: '🧹',
            reservado: '📅'
        };
        return icons[status] || '•';
    };

    return (
        <div
            onClick={() => onClick(room)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all
                       hover:shadow-lg transform hover:-translate-y-1
                       ${getStatusColor(room.status)}`}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-2xl font-bold">#{room.number}</span>
                <span className="text-xl">{getStatusIcon(room.status)}</span>
            </div>
            
            <div className="text-sm mb-2">
                <div>{room.type}</div>
                <div className="font-semibold">R$ {room.price}</div>
            </div>
            
            {room.guest && (
                <div className="text-xs mt-2 pt-2 border-t border-current">
                    <div className="font-semibold truncate">{room.guest}</div>
                    {room.checkout && (
                        <div className="opacity-75">
                            Saída: {new Date(room.checkout).toLocaleDateString()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}