const express = require('express');
const router = express.Router();
const Blockchain = require('../blockchain/Blockchain');
const { authenticateToken } = require('../auth/authMiddleware');
const { readDB, writeDB } = require('../data/database');

// Instancia global de blockchain
let blockchainInstance = null;

/**
 * Obtiene o crea la instancia de blockchain
 */
function getBlockchain() {
    if (!blockchainInstance) {
        blockchainInstance = new Blockchain();
    }
    return blockchainInstance;
}

/**
 * GET /api/blockchain
 * Obtiene la blockchain completa
 */
router.get('/', authenticateToken, (req, res) => {
    try {
        const blockchain = getBlockchain();
        
        res.json({
            success: true,
            data: blockchain.toJSON()
        });
    } catch (error) {
        console.error('Error al obtener blockchain:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener blockchain'
        });
    }
});

/**
 * POST /api/blockchain/register
 * Registra un documento en la blockchain
 */
router.post('/register', authenticateToken, (req, res) => {
    try {
        const { documentId } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere documentId'
            });
        }

        // Buscar documento
        const db = readDB();
        const docIndex = db.documents.findIndex(d => d.id === documentId);

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
                message: 'No tienes permiso para registrar este documento'
            });
        }

        // Verificar que el documento esté firmado
        if (!document.signed) {
            return res.status(400).json({
                success: false,
                message: 'El documento debe estar firmado antes de registrarlo en blockchain'
            });
        }

        // Verificar si ya está registrado
        if (document.registeredInBlockchain) {
            return res.status(400).json({
                success: false,
                message: 'El documento ya está registrado en blockchain'
            });
        }

        // Crear transacción para blockchain
        const transaction = {
            type: 'document_registration',
            documentId: document.id,
            documentName: document.originalName,
            documentHash: document.hash,
            userId: document.userId,
            signature: document.signature,
            timestamp: new Date().toISOString()
        };

        // Añadir bloque a blockchain
        const blockchain = getBlockchain();
        const newBlock = blockchain.addBlock(transaction);

        // Actualizar documento
        document.registeredInBlockchain = true;
        document.blockchainIndex = newBlock.index;

        db.documents[docIndex] = document;
        writeDB(db);

        res.json({
            success: true,
            message: 'Documento registrado en blockchain',
            data: {
                blockIndex: newBlock.index,
                blockHash: newBlock.hash,
                document: document
            }
        });
    } catch (error) {
        console.error('Error al registrar en blockchain:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al registrar en blockchain'
        });
    }
});

/**
 * GET /api/blockchain/validate
 * Valida la integridad de toda la blockchain
 */
router.get('/validate', authenticateToken, (req, res) => {
    try {
        const blockchain = getBlockchain();
        const isValid = blockchain.isChainValid();

        res.json({
            success: true,
            data: {
                valid: isValid,
                message: isValid 
                    ? 'La blockchain es válida e íntegra' 
                    : 'La blockchain ha sido alterada'
            }
        });
    } catch (error) {
        console.error('Error al validar blockchain:', error);
        res.status(500).json({
            success: false,
            message: 'Error al validar blockchain'
        });
    }
});

/**
 * GET /api/blockchain/document/:documentId
 * Obtiene el historial de un documento en la blockchain
 */
router.get('/document/:documentId', authenticateToken, (req, res) => {
    try {
        const { documentId } = req.params;
        const blockchain = getBlockchain();

        const transactions = blockchain.getTransactionsByDocumentId(documentId);

        if (transactions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron registros del documento en blockchain'
            });
        }

        res.json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('Error al buscar en blockchain:', error);
        res.status(500).json({
            success: false,
            message: 'Error al buscar en blockchain'
        });
    }
});

/**
 * GET /api/blockchain/stats
 * Obtiene estadísticas de la blockchain
 */
router.get('/stats', authenticateToken, (req, res) => {
    try {
        const blockchain = getBlockchain();
        const stats = blockchain.getStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
});

/**
 * POST /api/blockchain/mine
 * Mina bloques pendientes (si hay transacciones pendientes)
 */
router.post('/mine', authenticateToken, (req, res) => {
    try {
        const blockchain = getBlockchain();
        const minedTransactions = blockchain.minePendingTransactions();

        if (!minedTransactions) {
            return res.status(400).json({
                success: false,
                message: 'No hay transacciones pendientes para minar'
            });
        }

        res.json({
            success: true,
            message: 'Bloque minado exitosamente',
            data: {
                transactionsCount: minedTransactions.length,
                transactions: minedTransactions
            }
        });
    } catch (error) {
        console.error('Error al minar bloque:', error);
        res.status(500).json({
            success: false,
            message: 'Error al minar bloque'
        });
    }
});

/**
 * GET /api/blockchain/block/:index
 * Obtiene un bloque específico por su índice
 */
router.get('/block/:index', authenticateToken, (req, res) => {
    try {
        const { index } = req.params;
        const blockchain = getBlockchain();

        const blockIndex = parseInt(index);
        
        if (isNaN(blockIndex) || blockIndex < 0 || blockIndex >= blockchain.chain.length) {
            return res.status(404).json({
                success: false,
                message: 'Bloque no encontrado'
            });
        }

        const block = blockchain.chain[blockIndex];

        res.json({
            success: true,
            data: block.toJSON()
        });
    } catch (error) {
        console.error('Error al obtener bloque:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener bloque'
        });
    }
});

module.exports = router;
