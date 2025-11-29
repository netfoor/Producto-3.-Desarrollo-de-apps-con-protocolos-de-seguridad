/**
 * app.js - Lógica principal del dashboard
 * Gestiona documentos, firmas y visualización
 */

// Usar la variable global API_URL de auth.js si existe, sino definirla
if (typeof API_URL === 'undefined') {
    var API_URL = 'http://localhost:3000/api';
}

// Verificar autenticación al cargar
if (!requireAuth()) {
    // Si no está autenticado, requireAuth redirige
}

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadDocuments();
    loadStats();
    loadCertificate();
    
    // Recargar blockchain cuando se muestre el tab
    document.querySelector('[data-bs-target="#blockchain"]').addEventListener('click', loadBlockchain);
});

/**
 * Carga las estadísticas del dashboard
 */
async function loadStats() {
    try {
        const [docsResponse, blockchainResponse] = await Promise.all([
            authFetch(`${API_URL}/documents`),
            authFetch(`${API_URL}/blockchain/stats`)
        ]);

        const docsData = await docsResponse.json();
        const blockchainData = await blockchainResponse.json();

        if (docsData.success) {
            const docs = docsData.data;
            document.getElementById('totalDocs').textContent = docs.length;
            document.getElementById('signedDocs').textContent = docs.filter(d => d.signed).length;
            document.getElementById('blockchainDocs').textContent = docs.filter(d => d.registeredInBlockchain).length;
        }

        if (blockchainData.success) {
            document.getElementById('totalBlocks').textContent = blockchainData.data.totalBlocks;
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

/**
 * Carga la lista de documentos
 */
async function loadDocuments() {
    const container = document.getElementById('documentsContainer');
    
    try {
        const response = await authFetch(`${API_URL}/documents`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        const documents = data.data;

        if (documents.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-inbox" style="font-size: 4rem; color: #ccc;"></i>
                    <p class="mt-3 text-muted">No tienes documentos aún. ¡Sube tu primer documento!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = documents.map(doc => createDocumentCard(doc)).join('');
    } catch (error) {
        console.error('Error al cargar documentos:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                Error al cargar documentos: ${error.message}
            </div>
        `;
    }
}

/**
 * Crea una tarjeta de documento
 */
function createDocumentCard(doc) {
    const statusBadges = [];
    
    if (doc.encrypted) {
        statusBadges.push('<span class="badge bg-warning"><i class="bi bi-lock"></i> Cifrado</span>');
    }
    
    if (doc.signed) {
        statusBadges.push('<span class="badge bg-success"><i class="bi bi-pen"></i> Firmado</span>');
    }
    
    if (doc.registeredInBlockchain) {
        statusBadges.push('<span class="badge bg-primary"><i class="bi bi-diagram-3"></i> Blockchain</span>');
    }

    return `
        <div class="document-item fade-in">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h6 class="mb-1">
                        <i class="bi bi-file-earmark-text text-primary"></i>
                        ${doc.originalName}
                    </h6>
                    <small class="text-muted">
                        Subido: ${new Date(doc.uploadedAt).toLocaleString()}
                    </small>
                    <div class="mt-2">
                        ${statusBadges.join(' ')}
                    </div>
                    <div class="mt-2">
                        <small class="text-muted">Hash: <code>${doc.hash.substring(0, 16)}...</code></small>
                    </div>
                </div>
                <div class="btn-group-vertical">
                    ${!doc.signed ? `
                        <button class="btn btn-sm btn-success btn-action" onclick="signDocument('${doc.id}')">
                            <i class="bi bi-pen"></i> Firmar
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-info btn-action" onclick="verifyDocument('${doc.id}')">
                            <i class="bi bi-check-circle"></i> Verificar
                        </button>
                    `}
                    ${doc.signed && !doc.registeredInBlockchain ? `
                        <button class="btn btn-sm btn-primary btn-action" onclick="registerInBlockchain('${doc.id}')">
                            <i class="bi bi-diagram-3"></i> A Blockchain
                        </button>
                    ` : ''}
                    ${doc.registeredInBlockchain ? `
                        <button class="btn btn-sm btn-secondary btn-action" onclick="viewBlockchainHistory('${doc.id}')">
                            <i class="bi bi-clock-history"></i> Historial
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="downloadDocument('${doc.id}', '${doc.originalName}')">
                        <i class="bi bi-download"></i> Descargar
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Sube un documento
 */
async function uploadDocument() {
    const fileInput = document.getElementById('fileInput');
    const encryptFile = document.getElementById('encryptFile').checked;
    
    if (!fileInput.files.length) {
        alert('Por favor selecciona un archivo');
        return;
    }

    const formData = new FormData();
    formData.append('document', fileInput.files[0]);
    formData.append('encrypt', encryptFile);

    try {
        const token = getToken();
        const response = await fetch(`${API_URL}/documents/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
        modal.hide();

        // Limpiar formulario
        fileInput.value = '';
        document.getElementById('encryptFile').checked = false;

        // Recargar documentos y estadísticas
        await loadDocuments();
        await loadStats();

        showAlert('Documento subido exitosamente', 'success');
    } catch (error) {
        console.error('Error al subir documento:', error);
        showAlert(error.message, 'danger');
    }
}

/**
 * Firma un documento
 */
async function signDocument(documentId) {
    if (!confirm('¿Deseas firmar este documento digitalmente?')) {
        return;
    }

    try {
        const response = await authFetch(`${API_URL}/documents/${documentId}/sign`, {
            method: 'POST'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        showAlert('Documento firmado exitosamente', 'success');
        await loadDocuments();
        await loadStats();
    } catch (error) {
        console.error('Error al firmar documento:', error);
        showAlert(error.message, 'danger');
    }
}

/**
 * Verifica un documento
 */
async function verifyDocument(documentId) {
    try {
        const response = await authFetch(`${API_URL}/documents/${documentId}/verify`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        const result = data.data;
        const isValid = result.verified;

        const message = `
            <strong>Resultado de Verificación:</strong><br>
            Firma: ${result.signatureValid ? '✅ Válida' : '❌ Inválida'}<br>
            Integridad: ${result.hashValid ? '✅ Íntegra' : '❌ Alterada'}<br>
            Estado: ${isValid ? '✅ Documento Verificado' : '❌ Documento No Válido'}<br>
            Firmado por: ${result.signedBy}<br>
            Fecha: ${new Date(result.signedAt).toLocaleString()}
        `;

        showAlert(message, isValid ? 'success' : 'danger');
    } catch (error) {
        console.error('Error al verificar documento:', error);
        showAlert(error.message, 'danger');
    }
}

/**
 * Registra un documento en blockchain
 */
async function registerInBlockchain(documentId) {
    if (!confirm('¿Deseas registrar este documento en la blockchain? Esta acción es irreversible.')) {
        return;
    }

    try {
        const response = await authFetch(`${API_URL}/blockchain/register`, {
            method: 'POST',
            body: JSON.stringify({ documentId })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        showAlert(`Documento registrado en blockchain (Bloque #${data.data.blockIndex})`, 'success');
        await loadDocuments();
        await loadStats();
    } catch (error) {
        console.error('Error al registrar en blockchain:', error);
        showAlert(error.message, 'danger');
    }
}

/**
 * Ver historial de blockchain de un documento
 */
async function viewBlockchainHistory(documentId) {
    try {
        const response = await authFetch(`${API_URL}/blockchain/document/${documentId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        const transactions = data.data;
        
        const historyHTML = transactions.map(tx => `
            <div class="block-item">
                <strong>Bloque #${tx.blockIndex}</strong><br>
                Tipo: ${tx.type}<br>
                Fecha: ${new Date(tx.timestamp).toLocaleString()}<br>
                Hash del Bloque: <code>${tx.blockHash}</code>
            </div>
        `).join('');

        showAlert(`<strong>Historial en Blockchain:</strong><br>${historyHTML}`, 'info');
    } catch (error) {
        console.error('Error al obtener historial:', error);
        showAlert(error.message, 'danger');
    }
}

/**
 * Descarga un documento
 */
async function downloadDocument(documentId, filename) {
    try {
        const token = getToken();
        const response = await fetch(`${API_URL}/documents/${documentId}/download`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al descargar documento');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error al descargar:', error);
        showAlert(error.message, 'danger');
    }
}

/**
 * Carga el certificado del usuario
 */
async function loadCertificate() {
    const container = document.getElementById('certificateContainer');
    
    try {
        const response = await authFetch(`${API_URL}/users/certificate`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        const cert = data.data.certificate;
        const isValid = data.data.valid;

        container.innerHTML = `
            <div class="certificate-info">
                <div class="text-center mb-4">
                    <i class="bi bi-award ${isValid ? 'certificate-valid' : 'certificate-invalid'}" 
                       style="font-size: 5rem;"></i>
                    <h4 class="mt-3">${isValid ? 'Certificado Válido' : 'Certificado Inválido'}</h4>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <h6>Información del Titular</h6>
                        <p><strong>Usuario:</strong> ${cert.subject.username}</p>
                        <p><strong>Email:</strong> ${cert.subject.email}</p>
                        <p><strong>ID:</strong> <code>${cert.subject.userId}</code></p>
                        <p><strong>Organización:</strong> ${cert.subject.organization}</p>
                    </div>
                    
                    <div class="col-md-6">
                        <h6>Información del Certificado</h6>
                        <p><strong>Serial:</strong> <code>${cert.serialNumber.substring(0, 16)}...</code></p>
                        <p><strong>Válido desde:</strong> ${new Date(cert.validity.notBefore).toLocaleDateString()}</p>
                        <p><strong>Válido hasta:</strong> ${new Date(cert.validity.notAfter).toLocaleDateString()}</p>
                        <p><strong>Emisor:</strong> ${cert.issuer.commonName}</p>
                    </div>
                </div>
                
                <div class="mt-3">
                    <h6><strong>Clave Publica (RSA 2048)</strong></h6>
                    <div class="hash-display" style="max-height: 150px; overflow-y: auto; background: #ffffff; color: #1a202c;">
                        ${cert.publicKey}
                    </div>
                </div>
                
                <div class="mt-3">
                    <h6><strong>Firma del Certificado</strong></h6>
                    <div class="hash-display" style="background: #ffffff; color: #1a202c;">
                        ${cert.signature}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error al cargar certificado:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                Error al cargar certificado: ${error.message}
            </div>
        `;
    }
}

function showAlert(message, type = 'info') {
    // Crear un contenedor temporal si no existe
    let alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alertContainer';
        alertContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
        document.body.appendChild(alertContainer);
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}
