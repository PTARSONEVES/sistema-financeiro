import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import ThemeToggle from '../../../components/ThemeToggle';

export default function Consumption() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBooking, setSelectedBooking] = useState('');
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchBooking, setSearchBooking] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsRes, categoriesRes, bookingsRes] = await Promise.all([
                api.get('/hotel/products'),
                api.get('/hotel/categories'),
                api.get('/hotel/bookings?status=checkin')
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => 
        (!selectedCategory || p.category_id === parseInt(selectedCategory)) &&
        p.active
    );

    const addToCart = (product) => {
        const existing = cart.find(item => item.product_id === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.product_id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                product_id: product.id,
                name: product.name,
                unit_price: product.unit_price,
                quantity: 1,
                total: product.unit_price
            }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product_id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            setCart(cart.map(item =>
                item.product_id === productId
                    ? { ...item, quantity, total: item.unit_price * quantity }
                    : item
            ));
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

    const handleCheckout = async () => {
        if (!selectedBooking) {
            alert('Selecione uma reserva');
            return;
        }

        if (cart.length === 0) {
            alert('Adicione itens ao consumo');
            return;
        }

        try {
            for (const item of cart) {
                await api.post('/hotel/consumption', {
                    booking_id: selectedBooking,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price
                });
            }
            
            alert('Consumo registrado com sucesso!');
            setCart([]);
            setSelectedBooking('');
        } catch (error) {
            alert('Erro ao registrar consumo');
        }
    };

    const filteredBookings = bookings.filter(b => 
        b.guest_name.toLowerCase().includes(searchBooking.toLowerCase()) ||
        b.room_number.includes(searchBooking)
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Controle de Consumo
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna da Esquerda - Produtos */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Produtos</h2>
                                <select
                                    className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="">Todas as categorias</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {filteredProducts.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        className="p-3 border rounded-lg cursor-pointer hover:shadow-md 
                                                 transition-shadow bg-gray-50 dark:bg-gray-700"
                                    >
                                        <div className="font-medium">{product.name}</div>
                                        <div className="text-sm text-gray-500">{product.category_name}</div>
                                        <div className="text-lg font-bold text-blue-600 mt-2">
                                            R$ {product.unit_price}
                                        </div>
                                        {product.stock_quantity !== null && (
                                            <div className="text-xs text-gray-500">
                                                Estoque: {product.stock_quantity} {product.unit}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Coluna da Direita - Carrinho */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-4">Carrinho</h2>

                            {/* Seleção de Reserva */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Buscar hóspede ou apto..."
                                    className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:border-gray-600"
                                    value={searchBooking}
                                    onChange={(e) => setSearchBooking(e.target.value)}
                                />
                                <select
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    value={selectedBooking}
                                    onChange={(e) => setSelectedBooking(e.target.value)}
                                >
                                    <option value="">Selecione a reserva</option>
                                    {filteredBookings.map(booking => (
                                        <option key={booking.id} value={booking.id}>
                                            {booking.room_number} - {booking.guest_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Itens do Carrinho */}
                            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                                {cart.map(item => (
                                    <div key={item.product_id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{item.name}</div>
                                            <div className="text-xs text-gray-500">R$ {item.unit_price}</div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                className="w-6 h-6 bg-gray-200 rounded-full"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                className="w-6 h-6 bg-gray-200 rounded-full"
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() => removeFromCart(item.product_id)}
                                                className="text-red-500 ml-2"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {cart.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">
                                        Carrinho vazio
                                    </p>
                                )}
                            </div>

                            {/* Total e Checkout */}
                            {cart.length > 0 && (
                                <>
                                    <div className="border-t pt-4 mb-4">
                                        <div className="flex justify-between font-bold">
                                            <span>Total:</span>
                                            <span className="text-lg text-blue-600">
                                                R$ {cartTotal.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        disabled={!selectedBooking}
                                        className="w-full py-3 bg-green-600 text-white rounded-lg 
                                                 hover:bg-green-700 disabled:opacity-50"
                                    >
                                        Registrar Consumo
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}