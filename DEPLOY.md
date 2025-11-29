# Despliegue en GitHub Pages

## Instrucciones para Publicar

### 1. Inicializar Repositorio Git

```bash
git init
git add .
git commit -m "Sistema de Documentos Digitales Seguros con Blockchain"
```

### 2. Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Crea un nuevo repositorio llamado `priyec-seguridad`
3. NO inicialices con README

### 3. Conectar y Subir

```bash
git remote add origin https://github.com/TU-USUARIO/priyec-seguridad.git
git branch -M main
git push -u origin main
```

### 4. Configurar GitHub Pages

1. Ve a Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` → carpeta `/docs`
4. Guarda los cambios

### 5. Esperar Despliegue

Tu sitio estará disponible en:
```
https://TU-USUARIO.github.io/priyec-seguridad/
```

---

## IMPORTANTE: Solo Frontend

⚠️ GitHub Pages solo soporta contenido estático (HTML, CSS, JS).
El backend de Node.js NO funcionará directamente.

### Opciones para el Backend:

1. **Render.com** (Gratis):
   - Sube tu código a GitHub
   - Conecta con Render
   - Despliega el backend automáticamente

2. **Railway.app** (Gratis con límites):
   - Deploy directo desde GitHub
   - Base de datos incluida

3. **Heroku** (De pago):
   - Deploy con Git
   - Addons disponibles

4. **Vercel/Netlify** (Gratis):
   - Para funciones serverless
   - Requiere adaptación del código

### Configuración Rápida para Demo

Si solo quieres mostrar el frontend estático:
- El frontend funcionará en GitHub Pages
- Las funcionalidades requieren backend activo
- Puedes hacer un video demo o screenshots

---

## Archivos Incluidos

✅ `/docs/` - Versión estática para GitHub Pages
✅ Portada con nombres de autores
✅ Estilos optimizados y legibles
✅ README con instrucciones
