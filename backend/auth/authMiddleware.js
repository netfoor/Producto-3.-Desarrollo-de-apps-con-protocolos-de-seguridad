const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware de Autenticación JWT
 * Protocolo de seguridad: Verificación de tokens JWT
 */

/**
 * Verifica el token JWT en las peticiones
 */
function authenticateToken(req, res, next) {
    // Obtener token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token no proporcionado'
        });
    }

    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }

        // Añadir información del usuario a la petición
        req.user = user;
        next();
    });
}

/**
 * Genera un token JWT para un usuario
 */
function generateToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email
    };

    return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
}

/**
 * Verifica un token y devuelve los datos del usuario
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (error) {
        return null;
    }
}

module.exports = {
    authenticateToken,
    generateToken,
    verifyToken
};
