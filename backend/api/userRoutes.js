const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../auth/authController');
const { authenticateToken } = require('../auth/authMiddleware');
const { loadCertificate, verifyCertificate } = require('../crypto/signature');

/**
 * POST /api/users/register
 * Registra un nuevo usuario
 */
router.post('/register', register);

/**
 * POST /api/users/login
 * Inicia sesión
 */
router.post('/login', login);

/**
 * GET /api/users/profile
 * Obtiene el perfil del usuario autenticado
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * GET /api/users/certificate
 * Obtiene el certificado digital del usuario autenticado
 */
router.get('/certificate', authenticateToken, (req, res) => {
    try {
        const certificate = loadCertificate(req.user.id);
        const isValid = verifyCertificate(certificate);

        res.json({
            success: true,
            data: {
                certificate,
                valid: isValid
            }
        });
    } catch (error) {
        console.error('Error al obtener certificado:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener certificado'
        });
    }
});

module.exports = router;
