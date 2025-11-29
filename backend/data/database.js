const fs = require('fs');
const path = require('path');

/**
 * Base de datos simple basada en JSON
 * Almacena usuarios y documentos
 */

const DB_PATH = path.join(__dirname, 'db.json');

/**
 * Inicializa la base de datos si no existe
 */
function initDB() {
    if (!fs.existsSync(DB_PATH)) {
        const initialData = {
            users: [],
            documents: []
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    }
}

/**
 * Lee los datos de la base de datos
 */
function readDB() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al leer DB:', error);
        return { users: [], documents: [] };
    }
}

/**
 * Escribe datos en la base de datos
 */
function writeDB(data) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error al escribir DB:', error);
        return false;
    }
}

// Inicializar DB al cargar el módulo
initDB();

module.exports = {
    readDB,
    writeDB,
    initDB
};
