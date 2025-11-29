/**
 * auth.js - Módulo de autenticación
 * Maneja login, registro y gestión de tokens JWT
 */

// Variable global compartida
var API_URL = 'http://localhost:3000/api';

/**
 * Registra un nuevo usuario
 */
async function register(username, email, password) {
    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al registrar usuario');
        }

        // Guardar token
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        showAlert('¡Registro exitoso! Redirigiendo...', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);

        return data;
    } catch (error) {
        console.error('Error en registro:', error);
        showAlert(error.message, 'danger');
        throw error;
    }
}

/**
 * Inicia sesión
 */
async function login(username, password) {
    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al iniciar sesión');
        }

        // Guardar token
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        showAlert('¡Login exitoso! Redirigiendo...', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);

        return data;
    } catch (error) {
        console.error('Error en login:', error);
        showAlert(error.message, 'danger');
        throw error;
    }
}

/**
 * Cierra sesión
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

/**
 * Verifica si el usuario está autenticado
 */
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

/**
 * Obtiene el token de autenticación
 */
function getToken() {
    return localStorage.getItem('token');
}

/**
 * Obtiene información del usuario actual
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Verifica autenticación y redirige si es necesario
 */
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/**
 * Muestra una alerta
 */
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);

    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

/**
 * Realiza una petición autenticada
 */
async function authFetch(url, options = {}) {
    const token = getToken();
    
    if (!token) {
        throw new Error('No hay token de autenticación');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401 || response.status === 403) {
        // Token inválido o expirado
        logout();
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    return response;
}

// Cargar información del usuario en el navbar si existe
document.addEventListener('DOMContentLoaded', () => {
    const usernameElement = document.getElementById('username');
    if (usernameElement && isAuthenticated()) {
        const user = getCurrentUser();
        usernameElement.textContent = user.username;
    }
});
