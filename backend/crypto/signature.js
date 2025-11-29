const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Módulo de Firmas Digitales - Implementa firmas RSA
 * Firmas y certificados digitales: Generación, firma y verificación
 */

const KEYS_DIR = path.join(__dirname, '../../keys');

// Crear directorio de claves si no existe
if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
}

/**
 * Genera un par de claves RSA (pública y privada)
 * @param {string} userId - ID del usuario para nombrar las claves
 * @returns {Object} Par de claves { publicKey, privateKey }
 */
function generateKeyPair(userId) {
    try {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });

        // Guardar claves en archivos
        const publicKeyPath = path.join(KEYS_DIR, `${userId}_public.pem`);
        const privateKeyPath = path.join(KEYS_DIR, `${userId}_private.pem`);

        fs.writeFileSync(publicKeyPath, publicKey);
        fs.writeFileSync(privateKeyPath, privateKey);

        console.log(`Claves generadas para usuario: ${userId}`);

        return {
            publicKey,
            privateKey,
            publicKeyPath,
            privateKeyPath
        };
    } catch (error) {
        throw new Error(`Error al generar par de claves: ${error.message}`);
    }
}

/**
 * Carga la clave privada de un usuario
 * @param {string} userId - ID del usuario
 * @returns {string} Clave privada en formato PEM
 */
function loadPrivateKey(userId) {
    try {
        const privateKeyPath = path.join(KEYS_DIR, `${userId}_private.pem`);
        
        if (!fs.existsSync(privateKeyPath)) {
            throw new Error(`Clave privada no encontrada para usuario: ${userId}`);
        }
        
        return fs.readFileSync(privateKeyPath, 'utf8');
    } catch (error) {
        throw new Error(`Error al cargar clave privada: ${error.message}`);
    }
}

/**
 * Carga la clave pública de un usuario
 * @param {string} userId - ID del usuario
 * @returns {string} Clave pública en formato PEM
 */
function loadPublicKey(userId) {
    try {
        const publicKeyPath = path.join(KEYS_DIR, `${userId}_public.pem`);
        
        if (!fs.existsSync(publicKeyPath)) {
            throw new Error(`Clave pública no encontrada para usuario: ${userId}`);
        }
        
        return fs.readFileSync(publicKeyPath, 'utf8');
    } catch (error) {
        throw new Error(`Error al cargar clave pública: ${error.message}`);
    }
}

/**
 * Firma un documento con la clave privada del usuario
 * @param {string|Buffer} data - Datos del documento a firmar
 * @param {string} userId - ID del usuario que firma
 * @returns {string} Firma digital en base64
 */
function signDocument(data, userId) {
    try {
        const privateKey = loadPrivateKey(userId);
        
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(data);
        sign.end();
        
        const signature = sign.sign(privateKey, 'base64');
        
        console.log(`Documento firmado por usuario: ${userId}`);
        
        return signature;
    } catch (error) {
        throw new Error(`Error al firmar documento: ${error.message}`);
    }
}

/**
 * Verifica la firma digital de un documento
 * @param {string|Buffer} data - Datos originales del documento
 * @param {string} signature - Firma a verificar (base64)
 * @param {string} userId - ID del usuario que firmó
 * @returns {boolean} true si la firma es válida
 */
function verifySignature(data, signature, userId) {
    try {
        const publicKey = loadPublicKey(userId);
        
        const verify = crypto.createVerify('RSA-SHA256');
        verify.update(data);
        verify.end();
        
        const isValid = verify.verify(publicKey, signature, 'base64');
        
        console.log(`Verificación de firma: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);
        
        return isValid;
    } catch (error) {
        throw new Error(`Error al verificar firma: ${error.message}`);
    }
}

/**
 * Crea un certificado digital simple para un usuario
 * @param {string} userId - ID del usuario
 * @param {Object} userInfo - Información del usuario
 * @returns {Object} Certificado digital
 */
function createCertificate(userId, userInfo) {
    try {
        let publicKey;
        
        // Verificar si ya existe clave pública
        try {
            publicKey = loadPublicKey(userId);
        } catch (error) {
            // Si no existe, generar nuevo par de claves
            const keyPair = generateKeyPair(userId);
            publicKey = keyPair.publicKey;
        }
        
        const certificate = {
            version: '1.0',
            serialNumber: crypto.randomBytes(16).toString('hex'),
            subject: {
                userId: userId,
                username: userInfo.username || userId,
                email: userInfo.email || '',
                organization: 'PRIYEC Seguridad'
            },
            issuer: {
                commonName: 'PRIYEC CA',
                organization: 'PRIYEC Seguridad',
                country: 'ES'
            },
            validity: {
                notBefore: new Date().toISOString(),
                notAfter: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 año
            },
            publicKey: publicKey,
            signature: null
        };
        
        // Firmar el certificado (auto-firmado en este caso)
        const certData = JSON.stringify({
            subject: certificate.subject,
            validity: certificate.validity,
            publicKey: certificate.publicKey
        });
        
        certificate.signature = crypto
            .createHash('sha256')
            .update(certData)
            .digest('hex');
        
        // Guardar certificado
        const certPath = path.join(KEYS_DIR, `${userId}_certificate.json`);
        fs.writeFileSync(certPath, JSON.stringify(certificate, null, 2));
        
        console.log(`Certificado creado para usuario: ${userId}`);
        
        return certificate;
    } catch (error) {
        throw new Error(`Error al crear certificado: ${error.message}`);
    }
}

/**
 * Verifica un certificado digital
 * @param {Object} certificate - Certificado a verificar
 * @returns {boolean} true si el certificado es válido
 */
function verifyCertificate(certificate) {
    try {
        // Verificar que no haya expirado
        const now = new Date();
        const notBefore = new Date(certificate.validity.notBefore);
        const notAfter = new Date(certificate.validity.notAfter);
        
        if (now < notBefore || now > notAfter) {
            console.log('Certificado expirado o no válido aún');
            return false;
        }
        
        // Verificar firma del certificado
        const certData = JSON.stringify({
            subject: certificate.subject,
            validity: certificate.validity,
            publicKey: certificate.publicKey
        });
        
        const expectedSignature = crypto
            .createHash('sha256')
            .update(certData)
            .digest('hex');
        
        if (certificate.signature !== expectedSignature) {
            console.log('Firma del certificado inválida');
            return false;
        }
        
        console.log('Certificado válido');
        return true;
    } catch (error) {
        throw new Error(`Error al verificar certificado: ${error.message}`);
    }
}

/**
 * Carga un certificado desde archivo
 * @param {string} userId - ID del usuario
 * @returns {Object} Certificado
 */
function loadCertificate(userId) {
    try {
        const certPath = path.join(KEYS_DIR, `${userId}_certificate.json`);
        
        if (!fs.existsSync(certPath)) {
            throw new Error(`Certificado no encontrado para usuario: ${userId}`);
        }
        
        const certData = fs.readFileSync(certPath, 'utf8');
        return JSON.parse(certData);
    } catch (error) {
        throw new Error(`Error al cargar certificado: ${error.message}`);
    }
}

module.exports = {
    generateKeyPair,
    loadPrivateKey,
    loadPublicKey,
    signDocument,
    verifySignature,
    createCertificate,
    verifyCertificate,
    loadCertificate
};
