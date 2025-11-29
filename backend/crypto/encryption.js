const crypto = require('crypto');

/**
 * Módulo de Cifrado - Implementa cifrado simétrico AES-256
 * Protocolos de seguridad: Cifrado de datos sensibles
 */

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits

/**
 * Genera una clave de cifrado desde una contraseña
 * @param {string} password - Contraseña base
 * @param {string} salt - Salt para derivación
 */
function generateKey(password, salt = 'priyec-salt-2025') {
    return crypto.scryptSync(password, salt, KEY_LENGTH);
}

/**
 * Cifra datos usando AES-256-CBC
 * @param {string} text - Texto a cifrar
 * @param {string} password - Contraseña para generar clave
 * @returns {string} Datos cifrados en formato hex
 */
function encrypt(text, password) {
    try {
        const key = generateKey(password);
        const iv = crypto.randomBytes(IV_LENGTH);
        
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Retornar IV + datos cifrados
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        throw new Error(`Error al cifrar: ${error.message}`);
    }
}

/**
 * Descifra datos cifrados con AES-256-CBC
 * @param {string} encryptedData - Datos cifrados (IV:data)
 * @param {string} password - Contraseña para generar clave
 * @returns {string} Texto descifrado
 */
function decrypt(encryptedData, password) {
    try {
        const key = generateKey(password);
        
        // Separar IV y datos cifrados
        const parts = encryptedData.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        throw new Error(`Error al descifrar: ${error.message}`);
    }
}

/**
 * Genera un hash SHA-256 de un archivo o texto
 * Útil para verificar integridad
 * @param {string|Buffer} data - Datos a hashear
 * @returns {string} Hash en formato hex
 */
function hash(data) {
    return crypto
        .createHash('sha256')
        .update(data)
        .digest('hex');
}

/**
 * Genera un hash SHA-256 de un archivo
 * @param {Buffer} fileBuffer - Buffer del archivo
 * @returns {string} Hash del archivo
 */
function hashFile(fileBuffer) {
    return crypto
        .createHash('sha256')
        .update(fileBuffer)
        .digest('hex');
}

/**
 * Verifica si un hash coincide con los datos originales
 * @param {string|Buffer} data - Datos originales
 * @param {string} expectedHash - Hash esperado
 * @returns {boolean}
 */
function verifyHash(data, expectedHash) {
    const actualHash = hash(data);
    return actualHash === expectedHash;
}

/**
 * Genera una clave aleatoria para uso general
 * @param {number} length - Longitud en bytes
 * @returns {string} Clave aleatoria en hex
 */
function generateRandomKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

module.exports = {
    encrypt,
    decrypt,
    hash,
    hashFile,
    verifyHash,
    generateKey,
    generateRandomKey
};
