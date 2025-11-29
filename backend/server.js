const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar rutas
const userRoutes = require('./api/userRoutes');
const documentRoutes = require('./api/documentRoutes');
const blockchainRoutes = require('./api/blockchainRoutes');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta raíz - redirigir a portada
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/portada.html'));
});

// Rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/blockchain', blockchainRoutes);

// Ruta raíz - información de la API
app.get('/api', (req, res) => {
    res.json({
        name: 'Sistema de Gestión de Documentos Digitales Seguros',
        version: '1.0.0',
        description: 'API con protocolos de seguridad, firmas digitales y blockchain',
        endpoints: {
            users: {
                register: 'POST /api/users/register',
                login: 'POST /api/users/login',
                profile: 'GET /api/users/profile',
                certificate: 'GET /api/users/certificate'
            },
            documents: {
                upload: 'POST /api/documents/upload',
                list: 'GET /api/documents',
                get: 'GET /api/documents/:id',
                sign: 'POST /api/documents/:id/sign',
                verify: 'GET /api/documents/:id/verify',
                download: 'GET /api/documents/:id/download',
                certificate: 'GET /api/documents/:id/certificate'
            },
            blockchain: {
                get: 'GET /api/blockchain',
                register: 'POST /api/blockchain/register',
                validate: 'GET /api/blockchain/validate',
                stats: 'GET /api/blockchain/stats',
                mine: 'POST /api/blockchain/mine',
                block: 'GET /api/blockchain/block/:index',
                document: 'GET /api/blockchain/document/:documentId'
            }
        }
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Error interno del servidor'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🔐 Sistema de Documentos Digitales Seguros             ║
╠═══════════════════════════════════════════════════════════╣
║  ✅ Protocolos de Seguridad (JWT, AES, SHA-256)         ║
║  ✅ Firmas Digitales RSA                                 ║
║  ✅ Blockchain Inmutable                                 ║
╠═══════════════════════════════════════════════════════════╣
║  🌐 Servidor: http://localhost:${PORT}                     ║
║  📡 API: http://localhost:${PORT}/api                      ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
