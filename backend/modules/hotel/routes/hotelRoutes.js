const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/auth');
const roomTypeController = require('../controllers/roomTypeController');
const roomController = require('../controllers/roomController');

// Rota de teste pública (para verificar se o módulo está carregado)
router.get('/test', (req, res) => {
    res.json({ message: 'Módulo hotel funcionando!' });
});

// Rota de teste protegida
router.get('/test-auth', authMiddleware, (req, res) => {
    res.json({ message: 'Autenticação funcionando!', userId: req.userId });
});

// Rota para debug do token
router.get('/debug-token', authMiddleware, (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    
    res.json({
        message: 'Token válido',
        userId: req.userId,
        tokenPreview: token.substring(0, 20) + '...',
        headers: req.headers
    });
});

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// =====================================================
// ROTAS DE TIPOS DE APARTAMENTO
// =====================================================
router.get('/room-types', roomTypeController.getRoomTypes);
router.post('/room-types', roomTypeController.createRoomType);
router.put('/room-types/:id', roomTypeController.updateRoomType);
router.delete('/room-types/:id', roomTypeController.deleteRoomType);

// =====================================================
// ROTAS DE APARTAMENTOS
// =====================================================
router.get('/rooms', roomController.getRooms);
router.get('/rooms/map', roomController.getRoomMap);
router.get('/rooms/:id', roomController.getRoomById);
router.post('/rooms', roomController.createRoom);
router.put('/rooms/:id', roomController.updateRoom);
router.patch('/rooms/:id/status', roomController.updateStatus);
router.delete('/rooms/:id', roomController.deleteRoom);

module.exports = router;