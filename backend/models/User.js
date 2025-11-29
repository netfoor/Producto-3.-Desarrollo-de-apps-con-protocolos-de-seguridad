const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * Modelo de Usuario
 * Gestiona la estructura de datos de usuarios
 */

class User {
    constructor(username, email, password) {
        this.id = uuidv4();
        this.username = username;
        this.email = email;
        this.passwordHash = this.hashPassword(password);
        this.createdAt = new Date().toISOString();
        this.hasCertificate = false;
        this.hasKeyPair = false;
    }

    /**
     * Hashea la contraseña usando bcrypt
     * Protocolo de seguridad: Almacenamiento seguro de contraseñas
     */
    hashPassword(password) {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }

    /**
     * Verifica si una contraseña coincide con el hash almacenado
     */
    verifyPassword(password) {
        return bcrypt.compareSync(password, this.passwordHash);
    }

    /**
     * Convierte el usuario a formato JSON (sin contraseña)
     */
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            createdAt: this.createdAt,
            hasCertificate: this.hasCertificate,
            hasKeyPair: this.hasKeyPair
        };
    }
}

module.exports = User;
