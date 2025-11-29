# 🔐 Sistema de Gestión de Documentos Digitales Seguros

Sistema completo que integra **protocolos de seguridad**, **firmas digitales** y **blockchain** para la gestión segura de documentos.

## 🎯 Características

### 1. Protocolos de Seguridad
- ✅ HTTPS/TLS para comunicaciones seguras
- ✅ JWT (JSON Web Tokens) para autenticación
- ✅ Cifrado AES-256 para documentos sensibles
- ✅ Hashing SHA-256 para integridad
- ✅ Bcrypt para contraseñas

### 2. Firmas y Certificados Digitales
- ✅ Generación de pares de claves RSA (2048 bits)
- ✅ Firma digital de documentos
- ✅ Verificación de firmas digitales
- ✅ Gestión de certificados

### 3. Blockchain
- ✅ Blockchain inmutable para registro de transacciones
- ✅ Hash encadenado (SHA-256)
- ✅ Proof of Work básico
- ✅ Validación de cadena completa

## 🛠️ Tecnologías

- **Backend:** Node.js + Express
- **Criptografía:** Crypto (Node.js nativo)
- **Autenticación:** JWT
- **Frontend:** HTML5 + CSS3 + JavaScript Vanilla

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn

## 🚀 Instalación

```bash
# Clonar el repositorio
cd priyec-seguridad

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores

# Iniciar el servidor
npm start

# O en modo desarrollo
npm run dev
```

## 📁 Estructura del Proyecto

```
priyec-seguridad/
├── backend/
│   ├── blockchain/
│   │   ├── Block.js          # Clase Block
│   │   └── Blockchain.js     # Clase Blockchain
│   ├── crypto/
│   │   ├── encryption.js     # Cifrado AES
│   │   ├── signature.js      # Firmas RSA
│   │   └── certificates.js   # Gestión de certificados
│   ├── auth/
│   │   ├── authMiddleware.js # Middleware JWT
│   │   └── authController.js # Autenticación
│   ├── api/
│   │   ├── documentRoutes.js # Rutas de documentos
│   │   ├── blockchainRoutes.js
│   │   └── userRoutes.js
│   ├── models/
│   │   ├── User.js
│   │   └── Document.js
│   ├── data/
│   │   └── db.json           # Base de datos simple
│   └── server.js             # Servidor principal
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js
│       ├── auth.js
│       └── blockchain.js
├── uploads/                   # Documentos subidos
├── keys/                      # Claves generadas
└── docs/                      # Documentación adicional
```

## 🔧 Uso

1. **Registrarse/Iniciar sesión**
2. **Subir un documento**
3. **Firmar digitalmente el documento**
4. **Registrar en blockchain**
5. **Verificar firma e integridad**
6. **Consultar historial inmutable**

## 📚 Documentación de APIs

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Documentos
- `POST /api/documents/upload` - Subir documento
- `POST /api/documents/:id/sign` - Firmar documento
- `GET /api/documents/:id/verify` - Verificar firma
- `GET /api/documents` - Listar documentos

### Blockchain
- `GET /api/blockchain` - Ver cadena completa
- `POST /api/blockchain/mine` - Minar bloque
- `GET /api/blockchain/validate` - Validar cadena

## 🔒 Seguridad

Este proyecto implementa múltiples capas de seguridad:
- Todas las contraseñas se hashean con bcrypt
- Los tokens JWT expiran en 24 horas
- Los documentos se cifran con AES-256
- Las firmas usan RSA-2048
- El blockchain es inmutable y verificable

## 📄 Licencia

MIT

## 👥 Colaboradores

Este proyecto fue desarrollado por:

- **Fortino Romero Mantilla**
- **Israel Jesus Garcia Osorio**
- **Luis Joel Gomez Herrera**

---

**Proyecto Educativo** - Noviembre 2025

Demostración práctica de integración de protocolos de seguridad, firmas digitales y blockchain.
