import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // URL do seu backend
    timeout: 10000, // 10 segundos de timeout
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('📤 Requisição com token:', config.url);
        } else {
            console.log('📤 Requisição sem token:', config.url);
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
    response => {
        console.log('📥 Resposta recebida:', response.config.url, response.status);
        return response;
    },
    error => {
        console.error('❌ Erro na requisição:', error.response?.status, error.config?.url);
        
        if (error.response?.status === 401) {
            // Token expirado ou inválido
            console.log('🚫 Token inválido, redirecionando para login...');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default api;