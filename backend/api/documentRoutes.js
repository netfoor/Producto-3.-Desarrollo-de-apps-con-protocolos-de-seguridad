const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const { authenticateToken } = require('../auth/authMiddleware');
const { readDB, writeDB } = require('../data/database');
const { encrypt, decrypt, hashFile } = require('../crypto/encryption');
const { signDocument, verifySignature, loadCertificate } = require('../crypto/signature');

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo
    fileFilter: (req, file, cb) => {
        // Permitir varios tipos de archivos
        const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Tipo de archivo no permitido'));
    }
});

/**
 * POST /api/documents/upload
 * Sube un documento
 */
router.post('/upload', authenticateToken, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionó ningún archivo'
            });
        }

        const { encrypt: shouldEncrypt } = req.body;
        const fileBuffer = fs.readFileSync(req.file.path);

        // Opcional: cifrar el archivo
        let encrypted = false;
        if (shouldEncrypt === 'true') {
            const encryptedData = encrypt(fileBuffer.toString('base64'), req.user.id);
            fs.writeFileSync(req.file.path, encryptedData);
            encrypted = true;
        }

        // Crear documento
        const document = new Document(
            req.file.filename,
            req.file.originalname,
            req.user.id,
            fileBuffer,
            encrypted
        );

        // Guardar en DB
        const db = readDB();
        db.documents.push(document.toJSON());
        writeDB(db);

        res.status(201).json({
            success: true,
            message: 'Documento subido exitosamente',
            data: document.toJSON()
        });
    } catch (error) {
        console.error('Error al subir documento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al subir documento'
        });
    }
});

/**
 * POST /api/documents/:id/sign
 * Firma un documento digitalmente
 */
router.post('/:id/sign', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = readDB();

        // Buscar documento
        const docIndex = db.documents.findIndex(d => d.id === id);
        if (docIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }

        const document = db.documents[docIndex];

        // Verificar que el usuario sea el dueño
        if (document.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para firmar este documento'
            });
        }

        // Leer archivo
        const filePath = path.join(__dirname, '../../uploads', document.filename);
        const fileBuffer = fs.readFileSync(filePath);

        // Firmar documento
        const signature = signDocument(fileBuffer, req.user.id);

        // Actualizar documento
        document.signed = true;
        document.signature = signature;
        document.signedAt = new Date().toISOString();

        db.documents[docIndex] = document;
        writeDB(db);

        res.json({
            success: true,
            message: 'Documento firmado exitosamente',
            data: {
                documentId: document.id,
                signature: signature,
                signedAt: document.signedAt
            }
        });
    } catch (error) {
        console.error('Error al firmar documento:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al firmar documento'
        });
    }
});

/**
 * GET /api/documents/:id/verify
 * Verifica la firma de un documento
 */
router.get('/:id/verify', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = readDB();

        // Buscar documento
        const document = db.documents.find(d => d.id === id);
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }

        if (!document.signed) {
            return res.status(400).json({
                success: false,
                message: 'El documento no está firmado'
            });
        }

        // Leer archivo
        const filePath = path.join(__dirname, '../../uploads', document.filename);
        const fileBuffer = fs.readFileSync(filePath);

        // Verificar firma
        const isValid = verifySignature(fileBuffer, document.signature, document.userId);

        // Verificar hash (integridad del archivo)
        const currentHash = hashFile(fileBuffer);
        const hashValid = currentHash === document.hash;

        res.json({
            success: true,
            data: {
                documentId: document.id,
                signatureValid: isValid,
                hashValid: hashValid,
                verified: isValid && hashValid,
                signedBy: document.userId,
                signedAt: document.signedAt
            }
        });
    } catch (error) {
        console.error('Error al verificar firma:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al verificar firma'
        });
    }
});

/**
 * GET /api/documents
 * Lista todos los documentos del usuario autenticado
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const db = readDB();
        const userDocuments = db.documents.filter(d => d.userId === req.user.id);

        res.json({
            success: true,
            data: userDocuments
        });
    } catch (error) {
        console.error('Error al obtener documentos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener documentos'
        });
    }
});

/**
 * GET /api/documents/:id
 * Obtiene información de un documento específico
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = readDB();

        const document = db.documents.find(d => d.id === id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }

        res.json({
            success: true,
            data: document
        });
    } catch (error) {
        console.error('Error al obtener documento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener documento'
        });
    }
});

/**
 * GET /api/documents/:id/download
 * Descarga un documento
 */
router.get('/:id/download', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = readDB();

        const document = db.documents.find(d => d.id === id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }

        if (document.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para descargar este documento'
            });
        }

        const filePath = path.join(__dirname, '../../uploads', document.filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Archivo no encontrado'
            });
        }

        res.download(filePath, document.originalName);
    } catch (error) {
        console.error('Error al descargar documento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al descargar documento'
        });
    }
});

/**
 * GET /api/documents/:id/certificate
 * Obtiene el certificado del usuario que firmó el documento
 */
router.get('/:id/certificate', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = readDB();

        const document = db.documents.find(d => d.id === id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }

        if (!document.signed) {
            return res.status(400).json({
                success: false,
                message: 'El documento no está firmado'
            });
        }

        // Obtener certificado del firmante
        const certificate = loadCertificate(document.userId);

        res.json({
            success: true,
            data: certificate
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
