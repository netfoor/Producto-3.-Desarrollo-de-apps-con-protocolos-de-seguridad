# 🔐 Sistema de Gestión de Documentos Digitales Seguros

## 📖 Guía de Uso Rápido

### Instalación y Ejecución

1. **Instalar dependencias:**
```powershell
npm install
```

2. **Configurar variables de entorno:**
```powershell
cp .env.example .env
# Edita .env si es necesario
```

3. **Iniciar el servidor:**
```powershell
npm start
```

4. **Abrir en el navegador:**
```
http://localhost:3000
```

---

## 🎯 Funcionalidades Implementadas

### 1. ✅ Protocolos de Seguridad

#### Autenticación JWT
- Tokens firmados con algoritmo HS256
- Expiración configurable (24h por defecto)
- Middleware de verificación en todas las rutas protegidas
- **Archivo:** `backend/auth/authMiddleware.js`

#### Cifrado AES-256-CBC
- Cifrado simétrico de documentos
- IV aleatorio por cada operación
- Derivación de claves con scrypt
- **Archivo:** `backend/crypto/encryption.js`

#### Hash SHA-256
- Integridad de documentos
- Encadenamiento de bloques
- Verificación de firmas
- **Archivo:** `backend/crypto/encryption.js`

### 2. ✅ Firmas y Certificados Digitales

#### Generación de Claves RSA
- Par de claves (pública/privada) de 2048 bits
- Formato PEM estándar
- Almacenamiento seguro en directorio `keys/`
- **Archivo:** `backend/crypto/signature.js`

#### Firma Digital
- Algoritmo RSA-SHA256
- Firma de documentos con clave privada
- Codificación Base64 de firmas
- **Archivo:** `backend/crypto/signature.js`

#### Verificación de Firmas
- Verificación con clave pública
- Comprobación de integridad del documento
- Validación de autenticidad
- **Archivo:** `backend/crypto/signature.js`

#### Certificados Digitales
- Certificados X.509 simplificados
- Información del titular y emisor
- Validez temporal (1 año)
- Firma del certificado
- **Archivo:** `backend/crypto/signature.js`

### 3. ✅ Blockchain

#### Estructura de Bloques
- Índice, timestamp, datos, hash previo
- Nonce para Proof of Work
- Hash SHA-256 del bloque completo
- **Archivo:** `backend/blockchain/Block.js`

#### Cadena de Bloques
- Bloque génesis inicial
- Hash encadenado inmutable
- Dificultad de minado ajustable
- **Archivo:** `backend/blockchain/Blockchain.js`

#### Proof of Work
- Algoritmo de consenso básico
- Dificultad = 2 (dos ceros al inicio)
- Minado con incremento de nonce
- **Archivo:** `backend/blockchain/Block.js`

#### Validación de Cadena
- Verificación de hashes
- Validación de enlaces
- Comprobación de PoW
- **Archivo:** `backend/blockchain/Blockchain.js`

---

## 🔄 Flujo de Uso

### 1. Registro de Usuario
```
POST /api/users/register
{
  "username": "usuario",
  "email": "user@example.com",
  "password": "password123"
}
```
**Genera automáticamente:**
- Par de claves RSA
- Certificado digital X.509
- Token JWT

### 2. Iniciar Sesión
```
POST /api/users/login
{
  "username": "usuario",
  "password": "password123"
}
```
**Retorna:**
- Token JWT
- Información del usuario

### 3. Subir Documento
```
POST /api/documents/upload
Headers: Authorization: Bearer {token}
Body: FormData
  - document: archivo
  - encrypt: true/false
```
**Proceso:**
- Guardado en `/uploads`
- Cálculo de hash SHA-256
- Cifrado opcional AES-256
- Registro en base de datos

### 4. Firmar Documento
```
POST /api/documents/:id/sign
Headers: Authorization: Bearer {token}
```
**Proceso:**
- Lectura del documento
- Firma con clave privada RSA
- Algoritmo RSA-SHA256
- Actualización del registro

### 5. Verificar Firma
```
GET /api/documents/:id/verify
Headers: Authorization: Bearer {token}
```
**Verifica:**
- Validez de la firma (clave pública)
- Integridad del documento (hash)
- Autenticidad del firmante

### 6. Registrar en Blockchain
```
POST /api/blockchain/register
Headers: Authorization: Bearer {token}
Body: { "documentId": "uuid" }
```
**Proceso:**
- Creación de transacción
- Minado del bloque (PoW)
- Añadir a la cadena
- Registro inmutable

### 7. Validar Blockchain
```
GET /api/blockchain/validate
Headers: Authorization: Bearer {token}
```
**Verifica:**
- Integridad de todos los bloques
- Enlaces entre bloques
- Proof of Work válido

---

## 📂 Estructura de Archivos Clave

```
backend/
├── blockchain/
│   ├── Block.js          → Clase Block con PoW
│   └── Blockchain.js     → Cadena inmutable
├── crypto/
│   ├── encryption.js     → AES-256, SHA-256
│   └── signature.js      → RSA, certificados
├── auth/
│   ├── authMiddleware.js → Verificación JWT
│   └── authController.js → Login, registro
├── api/
│   ├── documentRoutes.js → Gestión documentos
│   ├── blockchainRoutes.js → API blockchain
│   └── userRoutes.js     → API usuarios
└── server.js             → Servidor Express

frontend/
├── index.html            → Landing page
├── login.html            → Inicio de sesión
├── register.html         → Registro
├── dashboard.html        → Panel principal
├── css/
│   └── styles.css        → Estilos personalizados
└── js/
    ├── auth.js           → Autenticación JWT
    ├── app.js            → Lógica documentos
    └── blockchain.js     → Visualización blockchain
```

---

## 🔒 Conceptos de Seguridad Implementados

### Confidencialidad
- ✅ Cifrado AES-256 de documentos
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Tokens JWT para sesiones

### Integridad
- ✅ Hash SHA-256 de documentos
- ✅ Blockchain inmutable
- ✅ Firmas digitales RSA

### Autenticidad
- ✅ Firmas digitales RSA-SHA256
- ✅ Certificados X.509
- ✅ Verificación de claves públicas

### No Repudio
- ✅ Registro en blockchain
- ✅ Firmas digitales
- ✅ Trazabilidad completa

### Disponibilidad
- ✅ API REST robusta
- ✅ Manejo de errores
- ✅ Validaciones de entrada

---

## 🧪 Pruebas Manuales

### 1. Probar Registro y Login
1. Abrir `http://localhost:3000`
2. Hacer clic en "Registrarse"
3. Crear un usuario
4. Verificar que se genera el certificado

### 2. Probar Subida de Documento
1. Login en el dashboard
2. Clic en "Subir Documento"
3. Seleccionar un archivo
4. Marcar "Cifrar documento" (opcional)
5. Subir y verificar en la lista

### 3. Probar Firma Digital
1. Clic en "Firmar" en un documento
2. Confirmar la acción
3. Ver que cambia a estado "Firmado"
4. Clic en "Verificar" para comprobar firma

### 4. Probar Blockchain
1. Firmar un documento
2. Clic en "A Blockchain"
3. Ir a tab "Blockchain"
4. Ver el nuevo bloque minado
5. Clic en "Validar Cadena"

### 5. Ver Certificado
1. Ir a tab "Mi Certificado"
2. Ver información del certificado
3. Ver clave pública RSA
4. Verificar validez temporal

---

## 📊 Demostración de Conceptos

### Protocolo de Seguridad - JWT
```javascript
// Token generado al login
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Payload decodificado
{
  "id": "uuid",
  "username": "usuario",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Firma Digital - RSA
```
Documento → Hash SHA-256 → Firma con Clave Privada → Firma Base64
Verificación: Firma Base64 → Desencriptar con Clave Pública → Hash Original
```

### Blockchain - Estructura
```
Bloque 0 (Génesis)
├─ Hash: 00abc123...
└─ Previous: 0

Bloque 1
├─ Hash: 00def456...
├─ Previous: 00abc123...
└─ Data: {documento, firma, usuario}

Bloque 2
├─ Hash: 00ghi789...
├─ Previous: 00def456...
└─ Data: {documento, firma, usuario}
```

---

## 🎓 Valor Educativo

Este proyecto demuestra la integración práctica de:

1. **Criptografía Simétrica (AES)** - Confidencialidad de datos
2. **Criptografía Asimétrica (RSA)** - Firmas digitales
3. **Funciones Hash (SHA-256)** - Integridad
4. **Autenticación (JWT)** - Control de acceso
5. **Blockchain** - Inmutabilidad y trazabilidad
6. **Certificados Digitales** - Identidad y confianza

### Casos de Uso Reales
- Sistemas de gestión documental
- Registros médicos electrónicos
- Contratos digitales
- Sistemas de votación electrónica
- Cadenas de suministro

---

## 🚀 Próximos Pasos (Mejoras Opcionales)

- [ ] Implementar HTTPS/TLS
- [ ] Agregar múltiples firmantes por documento
- [ ] Timestamp Authority (TSA)
- [ ] Revocación de certificados (CRL)
- [ ] Almacenamiento distribuido (IPFS)
- [ ] Smart contracts para validación
- [ ] Tests unitarios y de integración
- [ ] Docker containerization

---

## 📝 Notas de Seguridad

⚠️ **Este es un proyecto educativo**. Para producción:
- Usar HTTPS obligatorio
- Almacenar claves en HSM o KMS
- Implementar rate limiting
- Agregar auditoría completa
- Usar certificados de CA reconocida
- Implementar backup y recuperación
- Realizar pentesting

---

## 📧 Soporte

Para dudas o problemas:
1. Revisar logs del servidor
2. Verificar que todas las dependencias estén instaladas
3. Comprobar que el puerto 3000 esté libre
4. Verificar permisos de escritura en `/uploads` y `/keys`

---

**Desarrollado con fines educativos - 2025**
