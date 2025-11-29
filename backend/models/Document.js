const { v4: uuidv4 } = require('uuid');
const { hashFile } = require('../crypto/encryption');

/**
 * Modelo de Documento
 * Gestiona la estructura de datos de documentos
 */

class Document {
    constructor(filename, originalName, userId, fileBuffer, encrypted = false) {
        this.id = uuidv4();
        this.filename = filename;
        this.originalName = originalName;
        this.userId = userId;
        this.hash = hashFile(fileBuffer); // Hash del archivo para integridad
        this.size = fileBuffer.length;
        this.uploadedAt = new Date().toISOString();
        this.encrypted = encrypted;
        this.signed = false;
        this.signature = null;
        this.signedAt = null;
        this.registeredInBlockchain = false;
        this.blockchainIndex = null;
    }

    /**
     * Marca el documento como firmado
     */
    sign(signature) {
        this.signed = true;
        this.signature = signature;
        this.signedAt = new Date().toISOString();
    }

    /**
     * Marca el documento como registrado en blockchain
     */
    registerInBlockchain(blockIndex) {
        this.registeredInBlockchain = true;
        this.blockchainIndex = blockIndex;
    }

    /**
     * Convierte el documento a formato JSON
     */
    toJSON() {
        return {
            id: this.id,
            filename: this.filename,
            originalName: this.originalName,
            userId: this.userId,
            hash: this.hash,
            size: this.size,
            uploadedAt: this.uploadedAt,
            encrypted: this.encrypted,
            signed: this.signed,
            signature: this.signature,
            signedAt: this.signedAt,
            registeredInBlockchain: this.registeredInBlockchain,
            blockchainIndex: this.blockchainIndex
        };
    }
}

module.exports = Document;
