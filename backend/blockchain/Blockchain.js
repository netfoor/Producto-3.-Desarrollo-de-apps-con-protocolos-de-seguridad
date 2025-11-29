const Block = require('./Block');

/**
 * Clase Blockchain - Implementa una cadena de bloques inmutable
 * Principios implementados:
 * - Inmutabilidad
 * - Hash encadenado
 * - Validación de integridad
 * - Proof of Work
 */
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2; // Dificultad del PoW (número de ceros al inicio)
        this.pendingTransactions = [];
    }

    /**
     * Crea el bloque génesis (primer bloque de la cadena)
     */
    createGenesisBlock() {
        return new Block(0, Date.now(), {
            type: 'genesis',
            message: 'Bloque Génesis - Sistema de Documentos Seguros'
        }, '0');
    }

    /**
     * Obtiene el último bloque de la cadena
     */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * Añade una nueva transacción a la lista de pendientes
     * @param {Object} transaction - Datos de la transacción
     */
    addTransaction(transaction) {
        if (!transaction.documentId || !transaction.userId) {
            throw new Error('La transacción debe incluir documentId y userId');
        }
        
        this.pendingTransactions.push(transaction);
    }

    /**
     * Mina un nuevo bloque con las transacciones pendientes
     * Implementa Proof of Work
     */
    minePendingTransactions() {
        if (this.pendingTransactions.length === 0) {
            return null;
        }

        const block = new Block(
            this.chain.length,
            Date.now(),
            this.pendingTransactions,
            this.getLatestBlock().hash
        );

        block.mineBlock(this.difficulty);
        
        console.log('Bloque minado exitosamente!');
        this.chain.push(block);

        // Limpiar transacciones pendientes
        const minedTransactions = [...this.pendingTransactions];
        this.pendingTransactions = [];
        
        return minedTransactions;
    }

    /**
     * Añade un bloque directamente (para registros inmediatos)
     * @param {Object} data - Datos del documento/transacción
     */
    addBlock(data) {
        const newBlock = new Block(
            this.chain.length,
            Date.now(),
            data,
            this.getLatestBlock().hash
        );
        
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
        
        return newBlock;
    }

    /**
     * Valida la integridad de toda la blockchain
     * Verifica hashes y enlaces entre bloques
     */
    isChainValid() {
        // Verificar desde el segundo bloque (índice 1)
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Verificar que el hash del bloque actual sea correcto
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                console.log('Hash inválido en bloque:', i);
                return false;
            }

            // Verificar que el hash previo coincida
            if (currentBlock.previousHash !== previousBlock.hash) {
                console.log('Cadena rota en bloque:', i);
                return false;
            }

            // Verificar Proof of Work
            if (currentBlock.hash.substring(0, this.difficulty) !== 
                Array(this.difficulty + 1).join('0')) {
                console.log('Proof of Work inválido en bloque:', i);
                return false;
            }
        }
        
        return true;
    }

    /**
     * Busca transacciones por ID de documento
     * @param {string} documentId - ID del documento
     */
    getTransactionsByDocumentId(documentId) {
        const transactions = [];
        
        for (const block of this.chain) {
            if (block.index === 0) continue; // Saltar bloque génesis
            
            const blockData = Array.isArray(block.data) ? block.data : [block.data];
            
            for (const transaction of blockData) {
                if (transaction.documentId === documentId) {
                    transactions.push({
                        ...transaction,
                        blockIndex: block.index,
                        blockHash: block.hash,
                        timestamp: block.timestamp
                    });
                }
            }
        }
        
        return transactions;
    }

    /**
     * Obtiene estadísticas de la blockchain
     */
    getStats() {
        return {
            totalBlocks: this.chain.length,
            difficulty: this.difficulty,
            pendingTransactions: this.pendingTransactions.length,
            isValid: this.isChainValid(),
            latestBlock: this.getLatestBlock().toJSON()
        };
    }

    /**
     * Exporta la blockchain completa
     */
    toJSON() {
        return {
            chain: this.chain.map(block => block.toJSON()),
            difficulty: this.difficulty,
            pendingTransactions: this.pendingTransactions
        };
    }
}

module.exports = Blockchain;
