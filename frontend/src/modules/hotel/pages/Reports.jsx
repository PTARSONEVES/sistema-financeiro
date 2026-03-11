import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import ThemeToggle from '../../../components/ThemeToggle';

export default function Reports() {
    const [period, setPeriod] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [reportType, setReportType] = useState('occupancy');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadReport = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/hotel/reports/${reportType}`, {
                params: period
            });
            setData(response.data);
        } catch (error) {
            console.error('Erro ao carregar relatório:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, [reportType, period]);

    const exportToCSV = () => {
        if (!data) return;
        
        let csv = '';
        if (reportType === 'occupancy' && data.daily) {
            csv = 'Data,Reservas,Ocupação,Receita\n';
            data.daily.forEach(row => {
                csv += `${row.date},${row.total_bookings},${row.occupancy_rate}%,${row.revenue}\n`;
            });
        } else if (reportType === 'consumption' && data.products) {
            csv = 'Produto,Categoria,Quantidade,Receita\n';
            data.products.forEach(row => {
                csv += `${row.product_name},${row.category},${row.total_quantity},${row.total_revenue}\n`;
            });
        }
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_${reportType}_${period.startDate}_${period.endDate}.csv`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-20 pb-8">
            <ThemeToggle />
            
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Relatórios
                </h1>

                {/* Filtros */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select
                            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <option value="occupancy">Ocupação</option>
                            <option value="consumption">Consumo</option>
                            <option value="financial">Financeiro</option>
                        </select>
                        
                        <input
                            type="date"
                            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            value={period.startDate}
                            onChange={(e) => setPeriod({...period, startDate: e.target.value})}
                        />
                        
                        <input
                            type="date"
                            className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            value={period.endDate}
                            onChange={(e) => setPeriod({...period, endDate: e.target.value})}
                        />
                        
                        <button
                            onClick={exportToCSV}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Exportar CSV
                        </button>
                    </div>
                </div>

                {/* Conteúdo do Relatório */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        {reportType === 'occupancy' && data && (
                            <>
                                <h2 className="text-xl font-bold mb-4">Relatório de Ocupação</h2>
                                
                                {/* Cards de resumo */}
                                {data.totals && (
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded">
                                            <div className="text-sm text-gray-600 dark:text-gray-300">Total Reservas</div>
                                            <div className="text-2xl font-bold">{data.totals.total_reservas}</div>
                                        </div>
                                        <div className="bg-green-50 dark:bg-green-900 p-4 rounded">
                                            <div className="text-sm text-gray-600 dark:text-gray-300">Receita Total</div>
                                            <div className="text-2xl font-bold">R$ {data.totals.receita_total?.toFixed(2)}</div>
                                        </div>
                                        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded">
                                            <div className="text-sm text-gray-600 dark:text-gray-300">Ticket Médio</div>
                                            <div className="text-2xl font-bold">R$ {data.totals.ticket_medio?.toFixed(2)}</div>
                                        </div>
                                        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded">
                                            <div className="text-sm text-gray-600 dark:text-gray-300">Hóspedes Únicos</div>
                                            <div className="text-2xl font-bold">{data.totals.hospedes_unicos}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Tabela diária */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Data</th>
                                                <th className="px-4 py-2 text-right">Reservas</th>
                                                <th className="px-4 py-2 text-right">Quartos Ocupados</th>
                                                <th className="px-4 py-2 text-right">Taxa de Ocupação</th>
                                                <th className="px-4 py-2 text-right">Receita</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.daily?.map(row => (
                                                <tr key={row.date} className="border-t">
                                                    <td className="px-4 py-2">{new Date(row.date).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2 text-right">{row.total_bookings}</td>
                                                    <td className="px-4 py-2 text-right">{row.occupied_rooms}</td>
                                                    <td className="px-4 py-2 text-right">{row.occupancy_rate}%</td>
                                                    <td className="px-4 py-2 text-right">R$ {row.revenue?.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {reportType === 'consumption' && data && (
                            <>
                                <h2 className="text-xl font-bold mb-4">Relatório de Consumo</h2>
                                
                                {/* Por categoria */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {data.byCategory?.map(cat => (
                                        <div key={cat.category} className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                                            <h3 className="font-bold text-lg mb-2">{cat.category}</h3>
                                            <div className="flex justify-between">
                                                <span>Itens: {cat.total_items}</span>
                                                <span className="font-bold text-green-600">
                                                    R$ {cat.total_revenue?.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Tabela de produtos */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Produto</th>
                                                <th className="px-4 py-2 text-left">Categoria</th>
                                                <th className="px-4 py-2 text-right">Quantidade</th>
                                                <th className="px-4 py-2 text-right">Receita</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.products?.map(row => (
                                                <tr key={row.product_name} className="border-t">
                                                    <td className="px-4 py-2">{row.product_name}</td>
                                                    <td className="px-4 py-2">{row.category}</td>
                                                    <td className="px-4 py-2 text-right">{row.total_quantity}</td>
                                                    <td className="px-4 py-2 text-right">R$ {row.total_revenue?.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {reportType === 'financial' && data && (
                            <>
                                <h2 className="text-xl font-bold mb-4">Relatório Financeiro</h2>
                                
                                {/* Resumo */}
                                {data.summary && (
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-green-50 dark:bg-green-900 p-4 rounded">
                                            <div className="text-sm text-gray-600 dark:text-gray-300">Receita Quartos</div>
                                            <div className="text-2xl font-bold">R$ {data.summary.total_room_revenue?.toFixed(2)}</div>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded">
                                            <div className="text-sm text-gray-600 dark:text-gray-300">Receita Consumo</div>
                                            <div className="text-2xl font-bold">R$ {data.summary.total_consumption?.toFixed(2)}</div>
                                        </div>
                                        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded">
                                            <div className="text-sm text-gray-600 dark:text-gray-300">Novas Reservas</div>
                                            <div className="text-2xl font-bold">{data.summary.new_bookings}</div>
                                        </div>
                                        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded">
                                            <div className="text-sm text-gray-600 dark:text-gray-300">Novos Hóspedes</div>
                                            <div className="text-2xl font-bold">{data.summary.new_guests}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Comparativo com contas a receber */}
                                {data.accounts && data.accounts.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="font-bold text-lg mb-2">Comparativo com Contas a Receber</h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left">Data</th>
                                                        <th className="px-4 py-2 text-right">Previsto</th>
                                                        <th className="px-4 py-2 text-right">Realizado</th>
                                                        <th className="px-4 py-2 text-right">Diferença</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.accounts.map(row => (
                                                        <tr key={row.date} className="border-t">
                                                            <td className="px-4 py-2">{new Date(row.date).toLocaleDateString()}</td>
                                                            <td className="px-4 py-2 text-right">R$ {row.expected?.toFixed(2)}</td>
                                                            <td className="px-4 py-2 text-right">R$ {row.received?.toFixed(2)}</td>
                                                            <td className={`px-4 py-2 text-right ${
                                                                (row.received - row.expected) >= 0 ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                R$ {(row.received - row.expected).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}