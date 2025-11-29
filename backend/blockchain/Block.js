const crypto = require('crypto');

/**
 * Clase Block - Representa un bloque individual en la blockchain
 * Integra principios de blockchain: hash, hash previo, timestamp, nonce, proof of work
 */
class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data; // Puede contener info del documento, firma, usuario
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0; // Para Proof of Work
    }

    /**
     * Calcula el hash SHA-256 del bloque
     * Integra todos los datos del bloque para garantizar integridad
     */
    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(
                this.index +
                this.previousHash +
                this.timestamp +
                JSON.stringify(this.data) +
                this.nonce
            )
            .digest('hex');
    }

    /**
     * Proof of Work - Mina el bloque hasta encontrar un hash válido
     * @param {number} difficulty - Número de ceros al inicio del hash
     */
    mineBlock(difficulty) {
        // El hash debe comenzar con un número específico de ceros
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log(`Bloque minado: ${this.hash}`);
    }

    /**
     * Convierte el bloque a formato JSON para almacenamiento
     */
    toJSON() {
        return {
            index: this.index,
            timestamp: this.timestamp,
            data: this.data,
            previousHash: this.previousHash,
            hash: this.hash,
            nonce: this.nonce
        };
    }
}

module.exports = Block;
