/**
 * blockchain.js - Visualización de blockchain
 */

// Usar la variable global API_URL de auth.js

/**
 * Carga y muestra la blockchain
 */
async function loadBlockchain() {
    const container = document.getElementById('blockchainContainer');
    
    try {
        const response = await authFetch(`${API_URL}/blockchain`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        const blockchain = data.data;
        const chain = blockchain.chain;

        container.innerHTML = `
            <div class="mb-4">
                <div class="row text-center">
                    <div class="col-md-4">
                        <div class="stat-card">
                            <i class="bi bi-stack text-primary"></i>
                            <h4>${chain.length}</h4>
                            <p class="text-muted">Bloques Totales</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <i class="bi bi-cpu text-warning"></i>
                            <h4>${blockchain.difficulty}</h4>
                            <p class="text-muted">Dificultad (PoW)</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-card">
                            <i class="bi bi-hourglass-split text-info"></i>
                            <h4>${blockchain.pendingTransactions.length}</h4>
                            <p class="text-muted">Transacciones Pendientes</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5>Cadena de Bloques</h5>
                <span class="badge ${blockchain.isValid ? 'bg-success' : 'bg-danger'}">
                    ${blockchain.isValid ? '✓ Cadena Válida' : '✗ Cadena Inválida'}
                </span>
            </div>

            ${chain.map((block, index) => createBlockCard(block, index)).join('')}
        `;
    } catch (error) {
        console.error('Error al cargar blockchain:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                Error al cargar blockchain: ${error.message}
            </div>
        `;
    }
}

/**
 * Crea una tarjeta de bloque
 */
function createBlockCard(block, index) {
    const isGenesis = index === 0;
    const blockData = Array.isArray(block.data) ? block.data : [block.data];
    
    return `
        <div class="block-item ${isGenesis ? 'genesis' : ''} fade-in">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h6>
                    ${isGenesis ? 
                        '<i class="bi bi-star-fill text-warning"></i> Bloque Génesis' : 
                        `<i class="bi bi-box text-primary"></i> Bloque #${block.index}`
                    }
                </h6>
                <span class="badge bg-secondary">Nonce: ${block.nonce}</span>
            </div>
            
            <div class="mb-2">
                <small class="text-muted">
                    <i class="bi bi-clock"></i> ${new Date(block.timestamp).toLocaleString()}
                </small>
            </div>

            <div class="mb-2">
                <strong>Hash:</strong>
                <div class="hash-display" style="background: #ffffff; color: #1a202c;">
                    ${block.hash}
                </div>
            </div>

            ${!isGenesis ? `
                <div class="mb-2">
                    <strong>Hash Anterior:</strong>
                    <div class="hash-display" style="background: #ffffff; color: #1a202c;">
                        ${block.previousHash}
                    </div>
                </div>
            ` : ''}

            <div class="mt-3">
                <strong>Datos del Bloque:</strong>
                <div class="bg-white p-2 rounded mt-2" style="max-height: 200px; overflow-y: auto;">
                    ${blockData.map(data => formatBlockData(data)).join('<hr class="my-2">')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Formatea los datos de un bloque
 */
function formatBlockData(data) {
    if (data.type === 'genesis') {
        return `
            <div class="text-center">
                <i class="bi bi-info-circle text-primary"></i>
                <p class="mb-0">${data.message}</p>
            </div>
        `;
    }

    if (data.type === 'document_registration') {
        return `
            <div>
                <p class="mb-1"><strong>Tipo:</strong> Registro de Documento</p>
                <p class="mb-1"><strong>Documento:</strong> ${data.documentName}</p>
                <p class="mb-1"><strong>ID:</strong> <code>${data.documentId}</code></p>
                <p class="mb-1"><strong>Usuario:</strong> ${data.userId}</p>
                <p class="mb-1"><strong>Hash Documento:</strong> <code>${data.documentHash.substring(0, 16)}...</code></p>
                ${data.signature ? `<p class="mb-1"><strong>Firmado:</strong> ✅ Sí</p>` : ''}
            </div>
        `;
    }

    // Formato genérico para otros tipos de datos
    return `<pre class="mb-0">${JSON.stringify(data, null, 2)}</pre>`;
}

/**
 * Valida la blockchain completa
 */
async function validateBlockchain() {
    try {
        const response = await authFetch(`${API_URL}/blockchain/validate`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        const isValid = data.data.valid;
        const message = data.data.message;

        showAlert(
            `<strong>Validación de Blockchain:</strong><br>${message}`,
            isValid ? 'success' : 'danger'
        );

        // Recargar blockchain para actualizar el indicador
        await loadBlockchain();
    } catch (error) {
        console.error('Error al validar blockchain:', error);
        showAlert(error.message, 'danger');
    }
}
