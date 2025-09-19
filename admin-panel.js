/* ============================================
   ADMIN PANEL JAVASCRIPT - SISTEMA REPARADO
   ✅ AHORA LEE VENTAS DESDE localStorage
   ============================================ */

// ============================================
// DATOS DE VENTAS - LEE DESDE localStorage
// ============================================
let salesData = []; // Se llena desde localStorage
let filteredData = [];
let currentPage = 1;
const recordsPerPage = 10;

// ============================================
// AUTO-ACCESS Y LOGIN
// ============================================
function checkAutoAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const autoAccess = urlParams.get('admin');
    const directAccess = urlParams.get('direct');
    
    if (autoAccess === 'true' || directAccess === 'access') {
        // Auto login
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        initializeDashboard();
        
        showNotification('🎯 Acceso Automático Activado - Sistema en Vivo', 'success');
        return true;
    }
    return false;
}

// Add hidden quick access button
function addQuickAccessButton() {
    const quickAccessBtn = document.createElement('button');
    quickAccessBtn.innerHTML = '⚡ Acceso Rápido Admin';
    quickAccessBtn.className = 'quick-access-btn';
    quickAccessBtn.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
        color: white;
        border: none;
        padding: 15px 25px;
        border-radius: 30px;
        cursor: pointer;
        font-weight: 700;
        font-size: 1rem;
        box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
        transition: all 0.4s ease;
        z-index: 1000;
        opacity: 0.8;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
    `;
    
    quickAccessBtn.onmouseover = () => {
        quickAccessBtn.style.opacity = '1';
        quickAccessBtn.style.transform = 'translateY(-3px)';
        quickAccessBtn.style.boxShadow = '0 12px 35px rgba(255, 107, 107, 0.6)';
    };
    
    quickAccessBtn.onmouseout = () => {
        quickAccessBtn.style.opacity = '0.8';
        quickAccessBtn.style.transform = 'translateY(0)';
        quickAccessBtn.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.4)';
    };
    
    quickAccessBtn.onclick = () => {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        initializeDashboard();
        showNotification('🚀 Panel de Administración Activado - Modo En Vivo', 'success');
        quickAccessBtn.remove();
    };
    
    document.body.appendChild(quickAccessBtn);
}

// ============================================
// LOGIN FUNCTIONALITY
// ============================================
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginText = document.getElementById('loginText');
    const loginLoading = document.getElementById('loginLoading');
    const errorMessage = document.getElementById('errorMessage');
    
    // Show loading state
    loginText.style.display = 'none';
    loginLoading.style.display = 'inline';
    
    // Simulate login process
    setTimeout(() => {
        if (username === 'admin' && password === 'notaria2025') {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            initializeDashboard();
            showNotification('✅ Bienvenido - Sistema de Monitoreo Activado', 'success');
        } else {
            errorMessage.style.display = 'block';
            loginText.style.display = 'inline';
            loginLoading.style.display = 'none';
            showNotification('❌ Credenciales incorrectas', 'error');
        }
    }, 1500);
});

function logout() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('loginSection').style.display = 'flex';
        document.getElementById('loginForm').reset();
        document.getElementById('errorMessage').style.display = 'none';
        showNotification('👋 Sesión cerrada - Sistema desconectado', 'info');
    }
}

// ============================================
// ✅ FUNCIÓN PRINCIPAL REPARADA: CARGAR VENTAS
// ============================================
function loadVentasFromLocalStorage() {
    try {
        // Cargar ventas desde localStorage
        const ventasGuardadas = localStorage.getItem('adminVentas');
        
        if (ventasGuardadas) {
            const ventasArray = JSON.parse(ventasGuardadas);
            
            if (Array.isArray(ventasArray) && ventasArray.length > 0) {
                salesData = ventasArray;
                filteredData = [...salesData];
                
                console.log(`💾 ✅ ${salesData.length} ventas cargadas desde localStorage`);
                return true;
            }
        }
        
        console.log('📭 No hay ventas guardadas en localStorage');
        salesData = [];
        filteredData = [];
        return false;
        
    } catch (error) {
        console.error('❌ Error al cargar ventas desde localStorage:', error);
        salesData = [];
        filteredData = [];
        return false;
    }
}

// ============================================
// ✅ FUNCIÓN NUEVA: MONITOREO AUTOMÁTICO
// ============================================
function startVentasMonitoring() {
    // Monitorear cada 2 segundos si hay nuevas ventas
    setInterval(() => {
        const currentCount = salesData.length;
        loadVentasFromLocalStorage();
        
        if (salesData.length > currentCount) {
            const newSales = salesData.length - currentCount;
            console.log(`🆕 ${newSales} nueva(s) venta(s) detectada(s)`);
            
            // Actualizar interfaz
            updateStatistics();
            renderSalesTable();
            updateSystemStatus();
            
            // Notificación
            showNotification(`🆕 ${newSales} nueva(s) venta(s) registrada(s)`, 'success');
        }
    }, 2000);
    
    console.log('👁️ Monitoreo automático de ventas iniciado (cada 2 segundos)');
}

// ============================================
// FUNCIÓN MANUAL: REGISTRAR VENTA (PARA PRUEBAS)
// ============================================
function addNewSale(saleData) {
    console.log('💰 REGISTRO MANUAL - Agregando venta:', saleData);
    
    // Validar que tenga datos mínimos
    if (!saleData || !saleData.notary || !saleData.client) {
        console.error('❌ Datos de venta incompletos:', saleData);
        return;
    }
    
    // Crear registro completo de venta
    const ventaCompleta = {
        venta_id: generateVentaId(),
        fecha_pago: new Date().toLocaleString('es-CL', {
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }),
        notaria: saleData.notary,
        notario: extractNotarioName(saleData.notary),
        cliente: saleData.client,
        email: saleData.email || 'No proporcionado',
        telefono: saleData.phone || 'No proporcionado',
        servicio: saleData.service,
        monto: saleData.amount,
        metodo_pago: determinePaymentMethod(saleData),
        estado: 'PAGADO',
        timestamp: Date.now()
    };
    
    // Agregar al localStorage
    const existingVentas = JSON.parse(localStorage.getItem('adminVentas') || '[]');
    existingVentas.unshift(ventaCompleta);
    localStorage.setItem('adminVentas', JSON.stringify(existingVentas));
    
    // Recargar datos
    loadVentasFromLocalStorage();
    
    // Actualizar interfaz
    updateStatistics();
    renderSalesTable();
    updateSystemStatus();
    
    // Notificación
    showNotification(`✅ Venta registrada: ${ventaCompleta.cliente} - $${ventaCompleta.monto}`, 'success');
    
    console.log('📦 Registro de venta creado:', ventaCompleta);
    
    return ventaCompleta;
}

// Generar ID único para la venta
function generateVentaId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `TXN-${timestamp.toString().slice(-6)}-${random}`;
}

// Extraer nombre del notario de la información de notaría
function extractNotarioName(notaryName) {
    const notaryMap = {
        'Novena Notaría de Concepción - San Pedro de la Paz': 'Rodrigo Rojas Castillo',
        'Primera Notaría de Concepción': 'Ricardo Salgado Sepúlveda',
        'Segunda Notaría de Concepción': 'Pedro Hidalgo Sarzosa',
        'Tercera Notaría de Concepción': 'Juan Espinosa Bancalari',
        'Primera Notaría de Talcahuano': 'Omar Retamal Becerra',
        'Segunda Notaría de Talcahuano': 'Gastón Santibáñez Torres',
        'Primera Notaría de Coronel': 'Gonzalo Camiruaga Pizarro'
    };
    
    return notaryMap[notaryName] || 'Notario no especificado';
}

// Determinar método de pago
function determinePaymentMethod(saleData) {
    if (saleData.client?.includes('DEMO') || saleData.service?.includes('DEMO')) {
        return 'Demo/Prueba';
    }
    return saleData.paymentMethod || 'Tarjeta de Crédito';
}

// ============================================
// ✅ INICIALIZACIÓN REPARADA DEL PANEL + MODAL
// ============================================
function initializeDashboard() {
    console.log('🚀 Inicializando Panel de Administración con Sistema de Modal...');
    
    // ✅ CARGAR VENTAS DESDE localStorage
    loadVentasFromLocalStorage();
    
    // ✅ CREAR MODAL SI NO EXISTE
    createModalIfNotExists();
    
    // ✅ INICIAR MONITOREO AUTOMÁTICO
    startVentasMonitoring();
    
    updateStatistics();
    renderSalesTable();
    setupDateFilters();
    setupGlobalSearch();
    
    // Mostrar estado inicial
    updateSystemStatus();
    
    console.log('✅ Panel listo - Monitoreando localStorage["adminVentas"]');
    console.log('🖱️ Sistema de modal activado - Haz clic en cualquier fila para ver detalles');
}

// ============================================
// ✅ CREAR MODAL SI NO EXISTE
// ============================================
function createModalIfNotExists() {
    if (document.getElementById('saleDetailsModal')) {
        console.log('📋 Modal ya existe, reutilizando...');
        return;
    }
    
    console.log('📋 Creando modal de detalles...');
    
    const modal = document.createElement('div');
    modal.id = 'saleDetailsModal';
    modal.className = 'sale-details-modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">
                    <span class="icon">📋</span>
                    <span>Detalles Completos de la Venta</span>
                </div>
                <button class="modal-close" onclick="closeSaleDetailsModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="detail-section">
                    <div class="section-title">
                        <span>👤</span>
                        Información del Cliente
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Nombre Completo</div>
                        <div class="detail-value highlight" id="modalClientName">-</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Email de Contacto</div>
                        <div class="detail-value" id="modalClientEmail">-</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Teléfono</div>
                        <div class="detail-value" id="modalClientPhone">-</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">RUT/Identificación</div>
                        <div class="detail-value" id="modalClientRut">-</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <div class="section-title">
                        <span>🏛️</span>
                        Información de la Notaría
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Notaría</div>
                        <div class="detail-value notary-detail" id="modalNotaryName">-</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Notario a Cargo</div>
                        <div class="detail-value" id="modalNotaryOwner">-</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <div class="section-title">
                        <span>📄</span>
                        Información del Trámite
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Servicio Solicitado</div>
                        <div class="detail-value service-detail" id="modalService">-</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">ID de Transacción</div>
                        <div class="detail-value" id="modalTransactionId">-</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Fecha y Hora Completa</div>
                        <div class="detail-value" id="modalDateTime">-</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <div class="section-title">
                        <span>💳</span>
                        Información de Pago
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Monto Total Pagado</div>
                        <div class="detail-value amount" id="modalAmount">-</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Método de Pago</div>
                        <div class="detail-value payment-detail" id="modalPaymentMethod">-</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Estado del Pago</div>
                        <div class="detail-value" id="modalPaymentStatus">-</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    console.log('✅ Modal de detalles creado correctamente');
}

function updateSystemStatus() {
    const statusElement = document.getElementById('systemStatus');
    if (!statusElement) return;
    
    if (salesData.length > 0) {
        statusElement.innerHTML = `🟢 Sistema activo - ${salesData.length} ventas registradas`;
    } else {
        statusElement.innerHTML = '🟡 Esperando pagos de usuarios...';
    }
}

// ============================================
// ESTADÍSTICAS SIMPLIFICADAS
// ============================================
function updateStatistics() {
    const totalSales = salesData.reduce((sum, venta) => sum + venta.monto, 0);
    const totalTransactions = salesData.length;
    const today = new Date().toLocaleDateString('es-CL');
    const todaySales = salesData
        .filter(venta => venta.fecha_pago.includes(today.split('-').reverse().join('/')))
        .reduce((sum, venta) => sum + venta.monto, 0);
    
    // Update main stats
    updateElementText('totalSales', `$${totalSales.toLocaleString()}`);
    updateElementText('totalTransactions', totalTransactions);
    updateElementText('todaySales', `$${todaySales.toLocaleString()}`);
    
    // Update quick stats
    updateElementText('todayEarnings', `$${todaySales}`);
    updateElementText('weekEarnings', `$${totalSales}`);
    updateElementText('completedTx', totalTransactions);
    updateElementText('pendingTx', 0);
    updateElementText('topNotary', salesData.length > 0 ? 'San Pedro' : '-');
    updateElementText('avgPerNotary', `$${Math.round(totalSales / Math.max(1, totalTransactions))}`);
    updateElementText('hourlyAvg', `$${Math.round(todaySales / 24)}`);
    updateElementText('bestService', salesData.length > 0 ? 'Declaraciones' : '-');
}

// ============================================
// ✅ RENDERIZADO DE TABLA SIMPLIFICADO CON CLICKS
// ============================================
function renderSalesTable() {
    const tbody = document.getElementById('salesTableBody');
    const emptyState = document.getElementById('emptyState');
    const tableContainer = document.getElementById('tableContainer');
    const pagination = document.getElementById('pagination');
    
    if (filteredData.length === 0) {
        // Mostrar estado vacío
        emptyState.style.display = 'block';
        tableContainer.style.display = 'none';
        pagination.style.display = 'none';
        return;
    }
    
    // Mostrar tabla
    emptyState.style.display = 'none';
    tableContainer.style.display = 'block';
    pagination.style.display = 'flex';
    
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);

    tbody.innerHTML = pageData.map((venta, index) => `
        <tr onclick="openSaleDetailsModal(${startIndex + index})" class="sale-row" data-sale-index="${startIndex + index}">
            <td><strong>${venta.venta_id}</strong></td>
            <td>${venta.fecha_pago}</td>
            <td><span class="notary-badge">${truncateText(venta.notaria, 20)}</span></td>
            <td>${truncateText(venta.notario, 15)}</td>
            <td class="client-info">${truncateText(venta.cliente, 20)}</td>
            <td>${truncateText(venta.email, 25)}</td>
            <td>${truncateText(venta.telefono, 15)}</td>
            <td>-</td>
            <td>${truncateText(venta.servicio, 20)}</td>
            <td class="amount">${venta.monto.toLocaleString()}</td>
            <td><span class="payment-method">${truncateText(venta.metodo_pago, 12)}</span></td>
            <td><span class="status-badge status-completed">✅ ${venta.estado}</span></td>
        </tr>
    `).join('');

    renderPagination();
    
    // Agregar hint de click si hay datos
    if (pageData.length > 0) {
        addClickHint();
    }
}

// ============================================
// ✅ FUNCIÓN PARA TRUNCAR TEXTO
// ============================================
function truncateText(text, maxLength) {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ============================================
// ✅ AGREGAR HINT DE CLICK
// ============================================
function addClickHint() {
    const tableContainer = document.getElementById('tableContainer');
    
    // Remover hint existente
    const existingHint = document.querySelector('.click-hint');
    if (existingHint) {
        existingHint.remove();
    }
    
    // Agregar nuevo hint
    const hint = document.createElement('div');
    hint.className = 'click-hint';
    hint.textContent = '👆 Haz clic en cualquier fila para ver detalles completos';
    
    tableContainer.style.position = 'relative';
    tableContainer.appendChild(hint);
    
    // Remover hint después de 10 segundos
    setTimeout(() => {
        if (hint.parentElement) {
            hint.remove();
        }
    }, 10000);
}

// ============================================
// ✅ ABRIR MODAL DE DETALLES
// ============================================
function openSaleDetailsModal(saleIndex) {
    const venta = filteredData[saleIndex];
    if (!venta) return;
    
    // Crear modal si no existe
    if (!document.getElementById('saleDetailsModal')) {
        createSaleDetailsModal();
    }
    
    // Llenar modal con datos
    populateSaleDetailsModal(venta);
    
    // Mostrar modal
    const modal = document.getElementById('saleDetailsModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    console.log('📋 Mostrando detalles de venta:', venta.venta_id);
}

// ============================================
// ✅ CREAR ESTRUCTURA DEL MODAL
// ============================================
function createSaleDetailsModal() {
    const modal = document.createElement('div');
    modal.id = 'saleDetailsModal';
    modal.className = 'sale-details-modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">
                    <span class="icon">📋</span>
                    <span>Detalles de la Venta</span>
                </div>
                <button class="modal-close" onclick="closeSaleDetailsModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="detail-section">
                    <div class="section-title">
                        <span>👤</span>
                        Información del Cliente
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Nombre Completo</div>
                        <div class="detail-value highlight" id="modalClientName">-</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Email</div>
                        <div class="detail-value" id="modalClientEmail">-</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Teléfono</div>
                        <div class="detail-value" id="modalClientPhone">-</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">RUT</div>
                        <div class="detail-value" id="modalClientRut">-</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <div class="section-title">
                        <span>🏛️</span>
                        Información de la Notaría
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Notaría</div>
                        <div class="detail-value notary-detail" id="modalNotaryName">-</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Notario</div>
                        <div class="detail-value" id="modalNotaryOwner">-</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <div class="section-title">
                        <span>📄</span>
                        Información del Trámite
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Servicio Solicitado</div>
                        <div class="detail-value service-detail" id="modalService">-</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">ID de Transacción</div>
                        <div class="detail-value" id="modalTransactionId">-</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Fecha y Hora</div>
                        <div class="detail-value" id="modalDateTime">-</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <div class="section-title">
                        <span>💳</span>
                        Información de Pago
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Monto Total</div>
                        <div class="detail-value amount" id="modalAmount">-</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Método de Pago</div>
                        <div class="detail-value payment-detail" id="modalPaymentMethod">-</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Estado del Pago</div>
                        <div class="detail-value" id="modalPaymentStatus">-</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeSaleDetailsModal();
        }
    });
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeSaleDetailsModal();
        }
    });
}

// ============================================
// ✅ LLENAR MODAL CON DATOS
// ============================================
function populateSaleDetailsModal(venta) {
    // Información del cliente
    document.getElementById('modalClientName').textContent = venta.cliente || 'No especificado';
    document.getElementById('modalClientEmail').textContent = venta.email || 'No especificado';
    document.getElementById('modalClientPhone').textContent = venta.telefono || 'No especificado';
    document.getElementById('modalClientRut').textContent = 'No especificado'; // Agregar si tienes este campo
    
    // Información de la notaría
    document.getElementById('modalNotaryName').textContent = venta.notaria || 'No especificado';
    document.getElementById('modalNotaryOwner').textContent = venta.notario || 'No especificado';
    
    // Información del trámite
    document.getElementById('modalService').textContent = venta.servicio || 'No especificado';
    document.getElementById('modalTransactionId').textContent = venta.venta_id || 'No especificado';
    document.getElementById('modalDateTime').textContent = venta.fecha_pago || 'No especificado';
    
    // Información de pago
    document.getElementById('modalAmount').textContent = `${venta.monto ? venta.monto.toLocaleString() : '0'}`;
    document.getElementById('modalPaymentMethod').textContent = venta.metodo_pago || 'No especificado';
    
    // Estado del pago
    const statusElement = document.getElementById('modalPaymentStatus');
    statusElement.innerHTML = `<span class="status-detail ${venta.estado === 'PAGADO' ? 'completed' : 'demo'}">${venta.estado || 'PENDIENTE'}</span>`;
}

// ============================================
// ✅ CERRAR MODAL DE DETALLES
// ============================================
function closeSaleDetailsModal() {
    const modal = document.getElementById('saleDetailsModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    console.log('📋 Modal de detalles cerrado');
}

function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / recordsPerPage);
    const paginationContainer = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'flex';
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button onclick="changePage(${currentPage - 1})">‹ Anterior</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
            paginationHTML += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += `<button disabled>...</button>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="changePage(${currentPage + 1})">Siguiente ›</button>`;
    }
    
    paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    renderSalesTable();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// BÚSQUEDA GLOBAL SIMPLIFICADA
// ============================================
function setupGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    let searchTimeout;
    
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            
            if (searchTerm === '') {
                filteredData = [...salesData];
            } else {
                filteredData = salesData.filter(venta => 
                    venta.venta_id.toLowerCase().includes(searchTerm) ||
                    venta.cliente.toLowerCase().includes(searchTerm) ||
                    venta.email.toLowerCase().includes(searchTerm) ||
                    venta.telefono.includes(searchTerm) ||
                    venta.notaria.toLowerCase().includes(searchTerm) ||
                    venta.servicio.toLowerCase().includes(searchTerm)
                );
            }
            
            currentPage = 1;
            renderSalesTable();
            
            if (searchTerm !== '') {
                showNotification(`🔍 ${filteredData.length} resultados encontrados`, 'info');
            }
        }, 300);
    });
}

function applyFilters() {
    const notaryFilter = document.getElementById('notaryFilter').value;
    const serviceFilter = document.getElementById('serviceFilter').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;

    filteredData = salesData.filter(venta => {
        let match = true;

        if (notaryFilter && !venta.notaria.toLowerCase().includes(notaryFilter)) {
            match = false;
        }

        if (serviceFilter && !venta.servicio.toLowerCase().includes(serviceFilter)) {
            match = false;
        }

        if (dateFrom && venta.fecha_pago < dateFrom) {
            match = false;
        }

        if (dateTo && venta.fecha_pago > dateTo) {
            match = false;
        }

        return match;
    });

    currentPage = 1;
    renderSalesTable();
    
    const resultCount = filteredData.length;
    showNotification(`🔍 Filtros aplicados - ${resultCount} resultados encontrados`, 'success');
}

function clearFilters() {
    document.getElementById('notaryFilter').value = '';
    document.getElementById('serviceFilter').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    document.getElementById('globalSearch').value = '';
    
    filteredData = [...salesData];
    currentPage = 1;
    renderSalesTable();
    
    showNotification('🧹 Filtros limpiados - Mostrando todas las ventas', 'info');
}

function refreshData() {
    const refreshIcon = document.getElementById('refreshIcon');
    refreshIcon.innerHTML = '<span class="loading-spinner"></span>';
    
    showNotification('🔄 Actualizando panel...', 'info');
    
    // ✅ RECARGAR DESDE localStorage
    setTimeout(() => {
        loadVentasFromLocalStorage();
        updateStatistics();
        renderSalesTable();
        updateSystemStatus();
        
        refreshIcon.innerHTML = '🔄';
        showNotification(`✅ Panel actualizado - ${salesData.length} ventas totales`, 'success');
    }, 1500);
}

// ============================================
// EXPORTACIÓN SIMPLIFICADA
// ============================================
function exportData() {
    if (filteredData.length === 0) {
        showNotification('⚠️ No hay ventas para exportar', 'warning');
        return;
    }
    
    showNotification('📊 Preparando exportación...', 'info');
    
    setTimeout(() => {
        const headers = [
            'ID Venta',
            'Fecha Pago',
            'Notaría',
            'Notario',
            'Cliente',
            'Email',
            'Teléfono',
            'Servicio',
            'Monto ($)',
            'Método Pago',
            'Estado'
        ];
        
        const csvContent = [
            headers.join(','),
            ...filteredData.map(venta => [
                venta.venta_id,
                venta.fecha_pago,
                `"${venta.notaria}"`,
                `"${venta.notario}"`,
                `"${venta.cliente}"`,
                venta.email,
                venta.telefono,
                `"${venta.servicio}"`,
                venta.monto,
                `"${venta.metodo_pago}"`,
                venta.estado
            ].join(','))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const filename = `ventas_notarias_${new Date().toISOString().split('T')[0]}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showNotification(`📥 Reporte descargado - ${filteredData.length} ventas exportadas`, 'success');
    }, 1500);
}

// ============================================
// FUNCIÓN DE PRUEBA
// ============================================
function createTestTransaction() {
    const testSale = {
        notary: 'Novena Notaría de Concepción - San Pedro de la Paz',
        client: 'Cliente de Prueba',
        email: 'prueba@notariadigital.com',
        phone: '+56 9 1234 5678',
        service: 'Declaraciones Juradas (PRUEBA)',
        amount: 15,
        paymentMethod: 'Tarjeta de Crédito'
    };
    
    addNewSale(testSale);
    showNotification('🧪 Pago de prueba registrado exitosamente', 'warning');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

function setupDateFilters() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateTo').value = today;
    
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    document.getElementById('dateFrom').value = lastWeek.toISOString().split('T')[0];
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    const bgColor = type === 'success' ? 'rgba(40, 167, 69, 0.9)' : 
                   type === 'error' ? 'rgba(220, 53, 69, 0.9)' : 
                   type === 'warning' ? 'rgba(255, 193, 7, 0.9)' : 'rgba(23, 162, 184, 0.9)';
    
    notification.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        background: ${bgColor};
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        box-shadow: 0 15px 35px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 420px;
        font-family: 'Century Gothic', sans-serif;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 15px;
    `;
    
    if (!document.querySelector('#notification-animations')) {
        const style = document.createElement('style');
        style.id = 'notification-animations';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 15px;
                width: 100%;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.3s ease;
            }
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        default: return 'ℹ️';
    }
}

// ============================================
// ✅ FUNCIONES GLOBALES PARA MODAL
// ============================================
// Hacer funciones disponibles globalmente
window.openSaleDetailsModal = function(saleIndex) {
    const venta = filteredData[saleIndex];
    if (!venta) return;
    
    // Llenar modal con datos
    populateSaleDetailsModal(venta);
    
    // Mostrar modal
    const modal = document.getElementById('saleDetailsModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    console.log('📋 Mostrando detalles de venta:', venta.venta_id);
};

window.closeSaleDetailsModal = function() {
    const modal = document.getElementById('saleDetailsModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    console.log('📋 Modal de detalles cerrado');
};

window.populateSaleDetailsModal = function(venta) {
    // Información del cliente
    document.getElementById('modalClientName').textContent = venta.cliente || 'No especificado';
    document.getElementById('modalClientEmail').textContent = venta.email || 'No especificado';
    document.getElementById('modalClientPhone').textContent = venta.telefono || 'No especificado';
    document.getElementById('modalClientRut').textContent = venta.rut || 'No especificado';
    
    // Información de la notaría
    document.getElementById('modalNotaryName').textContent = venta.notaria || 'No especificado';
    document.getElementById('modalNotaryOwner').textContent = venta.notario || 'No especificado';
    
    // Información del trámite
    document.getElementById('modalService').textContent = venta.servicio || 'No especificado';
    document.getElementById('modalTransactionId').textContent = venta.venta_id || 'No especificado';
    document.getElementById('modalDateTime').textContent = venta.fecha_pago || 'No especificado';
    
    // Información de pago
    document.getElementById('modalAmount').textContent = `${venta.monto ? venta.monto.toLocaleString() : '0'}`;
    document.getElementById('modalPaymentMethod').textContent = venta.metodo_pago || 'No especificado';
    
    // Estado del pago
    const statusElement = document.getElementById('modalPaymentStatus');
    const isDemo = venta.cliente?.includes('DEMO') || venta.servicio?.includes('DEMO');
    statusElement.innerHTML = `<span class="status-detail ${venta.estado === 'PAGADO' ? (isDemo ? 'demo' : 'completed') : 'demo'}">${venta.estado || 'PENDIENTE'}</span>`;
};
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugAdmin = {
        showVentas: () => {
            console.log('📊 Ventas registradas:', salesData);
            return salesData;
        },
        addTestPago: () => {
            const testPago = {
                notary: 'Novena Notaría de Concepción - San Pedro de la Paz',
                client: 'Cliente DEBUG',
                email: 'debug@test.com',
                phone: '+56 9 9999 9999',
                service: 'Servicio DEBUG',
                amount: 99
            };
            addNewSale(testPago);
            return testPago;
        },
        clearVentas: () => {
            if (confirm('¿Limpiar todas las ventas?')) {
                localStorage.removeItem('adminVentas');
                salesData = [];
                filteredData = [];
                updateStatistics();
                renderSalesTable();
                showNotification('🧹 Ventas limpiadas', 'warning');
            }
        },
        // ✅ NUEVAS FUNCIONES DE DEBUG
        verLocalStorage: () => {
            const ventas = localStorage.getItem('adminVentas');
            console.log('📦 localStorage["adminVentas"]:', ventas);
            if (ventas) {
                const parsed = JSON.parse(ventas);
                console.table(parsed);
                return parsed;
            }
            return null;
        },
        crearVentaPrueba: () => {
            const ventaTest = {
                venta_id: "TXN-123456-ABC",
                fecha_pago: "08/02/2025 14:30",
                notaria: "San Pedro de la Paz",
                notario: "Rodrigo Rojas Castillo",
                cliente: "Juan Pérez DEBUG",
                email: "juan@email.com",
                telefono: "+56 9 1234 5678",
                servicio: "Declaraciones Juradas",
                monto: 15,
                metodo_pago: "Tarjeta de Crédito",
                estado: "PAGADO"
            };
            
            const ventas = JSON.parse(localStorage.getItem('adminVentas') || '[]');
            ventas.unshift(ventaTest);
            localStorage.setItem('adminVentas', JSON.stringify(ventas));
            
            loadVentasFromLocalStorage();
            updateStatistics();
            renderSalesTable();
            
            console.log('🧪 Venta de prueba creada:', ventaTest);
            return ventaTest;
        }
    };
    
    console.log('🔧 Debug disponible: window.debugAdmin');
}

// ============================================
// ✅ ESCUCHA EVENTOS DE NUEVAS VENTAS
// ============================================
window.addEventListener('nuevaVenta', function(event) {
    console.log('🆕 Nueva venta detectada via evento:', event.detail);
    
    // Recargar datos
    loadVentasFromLocalStorage();
    updateStatistics();
    renderSalesTable();
    updateSystemStatus();
    
    // Notificación
    showNotification(`🆕 Nueva venta: ${event.detail.cliente} - $${event.detail.monto}`, 'success');
});

// ============================================
// ✅ EVENTOS GLOBALES PARA MODAL
// ============================================
// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(e) {
    const modal = document.getElementById('saleDetailsModal');
    if (e.target === modal && modal?.classList.contains('active')) {
        closeSaleDetailsModal();
    }
});

// Cerrar modal con ESC
document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('saleDetailsModal');
    if (e.key === 'Escape' && modal?.classList.contains('active')) {
        closeSaleDetailsModal();
    }
});

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAutoAccess()) {
        addQuickAccessButton();
    }
    
    console.log('✅ Admin Panel REPARADO - Lee localStorage["adminVentas"]');
});

// ============================================
// INICIALIZACIÓN FINAL
// ============================================
console.log('🏛️ Admin Panel REPARADO cargado correctamente');
console.log('💾 Sistema lee ventas desde localStorage["adminVentas"]');
console.log('👁️ Monitoreo automático cada 2 segundos');
console.log('🔗 Compatible con sistema de trámites virtuales');

// CSS adicional para efectos
if (!document.querySelector('#admin-reparado-effects')) {
    const style = document.createElement('style');
    style.id = 'admin-reparado-effects';
    style.textContent = `
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.02); opacity: 0.9; }
        }
        
        .loading-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}