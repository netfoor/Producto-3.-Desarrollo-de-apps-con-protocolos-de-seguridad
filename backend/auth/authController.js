const User = require('../models/User');
const { generateToken } = require('./authMiddleware');
const { readDB, writeDB } = require('../data/database');
const { generateKeyPair, createCertificate } = require('../crypto/signature');

/**
 * Controlador de Autenticación
 * Maneja registro, login y gestión de usuarios
 */

/**
 * Registrar un nuevo usuario
 */
async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        // Validaciones
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        // Leer base de datos
        const db = readDB();

        // Verificar si el usuario ya existe
        const existingUser = db.users.find(
            u => u.username === username || u.email === email
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'El usuario o email ya existe'
            });
        }

        // Crear nuevo usuario
        const newUser = new User(username, email, password);

        // Generar par de claves RSA para el usuario
        try {
            generateKeyPair(newUser.id);
            newUser.hasKeyPair = true;

            // Crear certificado digital
            createCertificate(newUser.id, {
                username: newUser.username,
                email: newUser.email
            });
            newUser.hasCertificate = true;
        } catch (error) {
            console.error('Error al generar claves:', error);
        }

        // Guardar usuario en DB
        db.users.push(newUser);
        writeDB(db);

        // Generar token JWT
        const token = generateToken(newUser);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                user: newUser.toJSON(),
                token
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario'
        });
    }
}

/**
 * Iniciar sesión
 */
async function login(req, res) {
    try {
        const { username, password } = req.body;

        // Validaciones
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos'
            });
        }

        // Leer base de datos
        const db = readDB();

        // Buscar usuario
        const userObj = db.users.find(u => u.username === username);

        if (!userObj) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Recrear instancia de User para usar métodos
        const user = Object.assign(new User(), userObj);

        // Verificar contraseña
        if (!user.verifyPassword(password)) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar token JWT
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión'
        });
    }
}

/**
 * Obtener perfil del usuario autenticado
 */
async function getProfile(req, res) {
    try {
        const db = readDB();
        const user = db.users.find(u => u.id === req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                hasCertificate: user.hasCertificate,
                hasKeyPair: user.hasKeyPair
            }
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil'
        });
    }
}

module.exports = {
    register,
    login,
    getProfile
};
