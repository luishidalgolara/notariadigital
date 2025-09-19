/* ============================================
   SISTEMA DE VERIFICACIÓN DE CÓDIGOS
   ============================================ */

function mostrarVerificacionCodigo() {
    if (!pagoEnCaja.numeroServicio) {
        showNotification('❌ No hay información de servicio disponible', 'error');
        return;
    }
    
    // Llenar información en el modal de verificación
    document.getElementById('recordatorioNumero').textContent = pagoEnCaja.numeroServicio;
    document.getElementById('recordatorioServicio').textContent = pagoEnCaja.servicioInfo.nombre;
    
    // Mostrar modal
    const modal = document.getElementById('verificacionModal');
    modal.classList.add('active');
    
    // Focus en el input
    setTimeout(() => {
        document.getElementById('codigoInput').focus();
    }, 300);
    
    console.log('🔐 Modal de verificación abierto');
}

function closeVerificacionModal() {
    const modal = document.getElementById('verificacionModal');
    modal.classList.remove('active');
    
    // Limpiar input
    document.getElementById('codigoInput').value = '';
    
    console.log('🔐 Modal de verificación cerrado');
}

function verificarCodigo() {
    const codigoIngresado = document.getElementById('codigoInput').value.trim();
    
    if (!codigoIngresado) {
        mostrarErrorCodigo('Por favor ingresa un código');
        return;
    }
    
    if (codigoIngresado.length !== 4) {
        mostrarErrorCodigo('El código debe tener 4 dígitos');
        return;
    }
    
    if (!/^\d{4}$/.test(codigoIngresado)) {
        mostrarErrorCodigo('El código debe contener solo números');
        return;
    }
    
    // Mostrar estado de verificación
    mostrarEstadoVerificando();
    
    // Simular verificación (en sistema real sería consulta al servidor)
    setTimeout(() => {
        if (verificarCodigoValido(codigoIngresado)) {
            manejarCodigoValido();
        } else {
            manejarCodigoInvalido();
        }
    }, 2000);
}

function verificarCodigoValido(codigo) {
    // En modo demo, simular algunos códigos válidos
    const codigosDemo = ['1234', '5678', '9999', pagoEnCaja.codigoAcceso];
    
    // También aceptar el código real generado
    return codigosDemo.includes(codigo) || codigo === pagoEnCaja.codigoAcceso;
}

function mostrarErrorCodigo(mensaje) {
    const input = document.getElementById('codigoInput');
    input.classList.add('shake');
    input.style.borderColor = '#ef4444';
    
    showNotification(`❌ ${mensaje}`, 'error');
    
    setTimeout(() => {
        input.classList.remove('shake');
        input.style.borderColor = '';
    }, 500);
}

function mostrarEstadoVerificando() {
    const container = document.querySelector('.verificacion-container');
    const button = document.querySelector('.btn-verificar-codigo');
    
    container.classList.add('verificando');
    button.textContent = '🔍 Verificando...';
    
    showNotification('🔍 Verificando código con la notaría...', 'info');
}

function manejarCodigoValido() {
    // Quitar estado de verificación
    const container = document.querySelector('.verificacion-container');
    const button = document.querySelector('.btn-verificar-codigo');
    
    container.classList.remove('verificando');
    button.innerHTML = '<span>✓ Verificado</span>';
    button.style.background = 'linear-gradient(135deg, var(--virtual-green) 0%, #059669 100%)';
    
    // Liberar código en el comprobante
    liberarCodigoAcceso();
    
    // Marcar como pagado
    pagoEnCaja.estado = 'pagado';
    actualizarPagoPendiente();
    
    // Registrar pago exitoso
    registrarPagoExitoso();
    
    // Notificación de éxito
    showNotification('✅ ¡Código verificado! Pago confirmado. Redirigiendo...', 'success');
    
    // Cerrar modales y redirigir
    setTimeout(() => {
        closeVerificacionModal();
        closeComprobanteModal();
        
        if (currentPayment.redirectUrl) {
            showNotification('🚀 Acceso liberado - Redirigiendo a la plataforma...', 'info');
            setTimeout(() => {
                window.location.href = currentPayment.redirectUrl;
            }, 1500);
        }
    }, 2000);
}

function manejarCodigoInvalido() {
    const container = document.querySelector('.verificacion-container');
    const button = document.querySelector('.btn-verificar-codigo');
    const input = document.getElementById('codigoInput');
    
    container.classList.remove('verificando');
    button.innerHTML = '<span>✓ Verificar</span>';
    button.style.background = '';
    
    // Efecto visual de error
    input.classList.add('shake');
    input.style.borderColor = '#ef4444';
    input.value = '';
    
    showNotification('❌ Código incorrecto. Verifica que hayas realizado el pago.', 'error');
    
    setTimeout(() => {
        input.classList.remove('shake');
        input.style.borderColor = '';
        input.focus();
    }, 500);
}

function liberarCodigoAcceso() {
    const codigoDisplay = document.getElementById('codigoDisplay');
    const codigoTexto = codigoDisplay.querySelector('.codigo-texto');
    const codigoEstado = codigoDisplay.querySelector('.codigo-estado');
    
    // Cambiar visual
    codigoDisplay.classList.remove('bloqueado');
    codigoDisplay.classList.add('liberado');
    
    codigoTexto.textContent = pagoEnCaja.codigoAcceso;
    codigoEstado.textContent = 'LIBERADO';
    
    // Efecto de éxito
    codigoDisplay.classList.add('codigo-success');
    
    setTimeout(() => {
        codigoDisplay.classList.remove('codigo-success');
    }, 600);
    
    console.log('🔓 Código liberado:', pagoEnCaja.codigoAcceso);
}

function imprimirComprobante() {
    // Crear ventana de impresión
    const ventanaImpresion = window.open('', '_blank');
    
    const contenidoImpresion = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Comprobante de Pago - ${pagoEnCaja.numeroServicio}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 5px 0; border-bottom: 1px dotted #ccc; }
                .codigo-section { border: 2px solid #000; padding: 15px; margin: 20px 0; text-align: center; }
                .instrucciones { margin-top: 20px; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>🧾 COMPROBANTE DE PAGO EN CAJA</h2>
                <p><strong>${pagoEnCaja.notariaInfo.nombre}</strong></p>
            </div>
            
            <div class="info-row">
                <strong>📋 Servicio:</strong>
                <span>${pagoEnCaja.servicioInfo.nombre}</span>
            </div>
            <div class="info-row">
                <strong>🏛️ Notaría:</strong>
                <span>${pagoEnCaja.notariaInfo.nombre}</span>
            </div>
            <div class="info-row">
                <strong>💰 Monto:</strong>
                <span style="font-weight: bold; font-size: 18px;">$${pagoEnCaja.monto}</span>
            </div>
            <div class="info-row">
                <strong>🔢 N° de Servicio:</strong>
                <span style="font-family: monospace; font-weight: bold;">${pagoEnCaja.numeroServicio}</span>
            </div>
            <div class="info-row">
                <strong>📍 Dirección:</strong>
                <span>${pagoEnCaja.notariaInfo.direccion}</span>
            </div>
            <div class="info-row">
                <strong>📞 Teléfono:</strong>
                <span>${pagoEnCaja.notariaInfo.telefono}</span>
            </div>
            <div class="info-row">
                <strong>⏰ Válido hasta:</strong>
                <span>${pagoEnCaja.validoHasta}</span>
            </div>
            
            <div class="codigo-section">
                <h3>🔐 CÓDIGO DE ACCESO</h3>
                <p style="font-size: 24px; font-family: monospace; font-weight: bold; margin: 10px 0;">
                    ${pagoEnCaja.estado === 'pagado' ? pagoEnCaja.codigoAcceso : '****'}
                </p>
                <p style="color: ${pagoEnCaja.estado === 'pagado' ? 'green' : 'red'}; font-weight: bold;">
                    ${pagoEnCaja.estado === 'pagado' ? 'LIBERADO' : 'SE LIBERA TRAS EL PAGO'}
                </p>
            </div>
            
            <div class="instrucciones">
                <h4>📝 INSTRUCCIONES:</h4>
                <ol>
                    <li>Dirígete a la notaría en la dirección indicada</li>
                    <li>Presenta este comprobante y tu N° de Servicio</li>
                    <li>Paga el monto exacto en efectivo</li>
                    <li>El código se liberará automáticamente</li>
                    <li>Regresa al sitio web e ingresa el código</li>
                </ol>
            </div>
            
            <div class="footer">
                <p>Generado el: ${pagoEnCaja.fechaGeneracion}</p>
                <p>© 2025 Notaría Digital - Trámites Virtuales</p>
            </div>
        </body>
        </html>
    `;
    
    ventanaImpresion.document.write(contenidoImpresion);
    ventanaImpresion.document.close();
    
    // Imprimir automáticamente
    setTimeout(() => {
        ventanaImpresion.print();
    }, 500);
    
    showNotification('🖨️ Abriendo vista de impresión...', 'info');
    
    console.log('🖨️ Comprobante enviado a impresión');
}

function actualizarPagoPendiente() {
    try {
        const pagosPendientes = JSON.parse(localStorage.getItem('pagosPendientes') || '[]');
        const index = pagosPendientes.findIndex(p => p.numeroServicio === pagoEnCaja.numeroServicio);
        
        if (index !== -1) {
            pagosPendientes[index] = pagoEnCaja;
            localStorage.setItem('pagosPendientes', JSON.stringify(pagosPendientes));
            
            console.log('💾 Pago actualizado:', pagoEnCaja.numeroServicio);
        }
    } catch (error) {
        console.error('❌ Error al actualizar pago:', error);
    }
}

function registrarPagoExitoso() {
    if (!selectedNotaryInfo || !pagoEnCaja) {
        console.warn('⚠️ Faltan datos para registrar pago en caja');
        return;
    }
    
    const saleData = {
        notary: pagoEnCaja.notariaInfo.nombre,
        client: pagoEnCaja.clienteInfo.name + ' (PAGO EN CAJA)',
        email: pagoEnCaja.clienteInfo.email,
        phone: pagoEnCaja.clienteInfo.phone,
        service: pagoEnCaja.servicioInfo.nombre + ' (PAGO EN CAJA)',
        amount: pagoEnCaja.monto,
        numeroServicio: pagoEnCaja.numeroServicio,
        codigoAcceso: pagoEnCaja.codigoAcceso,
        paymentMethod: 'Efectivo en Caja'
    };
    
    // Guardar en sistema admin
    saveVentaToAdminSystem(saleData);
    
    console.log('💰 Pago en caja registrado:', saleData);
}

/* ============================================
   SISTEMA DE VISTA TOGGLE - COMPLETAMENTE REPARADO
   ============================================ */

// Estado de la vista actual
let currentViewMode = 'grid'; // 'grid', 'list', o 'compact'

// ✅ FUNCIÓN PRINCIPAL CORREGIDA: Ahora busca TODAS las grids de TODAS las secciones
function setViewMode(mode) {
    currentViewMode = mode;
    
    // ✅ CORRECCIÓN: Buscar TODAS las grids, no solo la primera
    const allVirtualGrids = document.querySelectorAll('.virtual-grid');
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    
    if (allVirtualGrids.length === 0) {
        console.warn('⚠️ No se encontraron grids virtuales');
        return;
    }
    
    console.log(`🔍 Encontradas ${allVirtualGrids.length} grids para procesar`);
    
    // ✅ APLICAR CAMBIOS A TODAS LAS GRIDS
    allVirtualGrids.forEach((virtualGrid, index) => {
        console.log(`📦 Procesando grid ${index + 1}/${allVirtualGrids.length}`);
        
        // Quitar todas las clases de vista primero
        virtualGrid.classList.remove('list-view', 'compact-view');
        
        // Aplicar la clase correcta según el modo
        if (mode === 'list') {
            virtualGrid.classList.add('list-view');
            restructureCardsForList(virtualGrid);
        } else if (mode === 'compact') {
            virtualGrid.classList.add('compact-view');
            restructureCardsForCompact(virtualGrid);
        } else {
            // Modo 'grid' - restaurar estructura original
            restoreCardsToGrid(virtualGrid);
        }
    });
    
    // Actualizar botones activos
    toggleButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-view') === mode) {
            btn.classList.add('active');
        }
    });
    
    // Guardar preferencia en localStorage
    localStorage.setItem('viewMode', mode);
    
    // Logging mejorado
    const modeNames = {
        'grid': 'Tarjetas',
        'list': 'Lista',
        'compact': 'Compacta'
    };
    
    console.log(`✅ Vista cambiada a: ${modeNames[mode] || mode} en ${allVirtualGrids.length} secciones`);
    
    // Notificación
    showNotification(
        `✅ Vista ${modeNames[mode] || mode} aplicada a todas las secciones`, 
        'info'
    );
}

// ✅ FUNCIÓN CORREGIDA: Recibe el grid específico como parámetro
function restructureCardsForCompact(virtualGrid) {
    const cards = virtualGrid.querySelectorAll('.virtual-card');
    
    cards.forEach(card => {
        // La vista compacta usa solo CSS, no necesita reestructuración HTML
        card.style.transition = 'all 0.3s ease';
    });
    
    console.log(`📦 Vista compacta aplicada a ${cards.length} cards`);
}

// ✅ FUNCIÓN COMPLETAMENTE REPARADA: Ahora funciona con el grid específico
function restructureCardsForList(virtualGrid) {
    const cards = virtualGrid.querySelectorAll('.virtual-card');
    console.log(`🔄 Reestructurando ${cards.length} cards para vista lista`);
    
    cards.forEach((card, index) => {
        // Verificar si ya está reestructurada
        if (card.querySelector('.list-title')) {
            console.log(`⚠️ Card ${index} ya está reestructurada`);
            return;
        }
        
        // Obtener elementos existentes
        const header = card.querySelector('.virtual-header');
        const title = card.querySelector('h3');
        const description = card.querySelector('p');
        const pricing = card.querySelector('.virtual-pricing');
        const button = card.querySelector('.virtual-cta');
        
        if (!header || !title || !description || !pricing || !button) {
            console.warn(`⚠️ Elementos faltantes en card ${index}:`, {
                header: !!header,
                title: !!title,
                description: !!description,
                pricing: !!pricing,
                button: !!button
            });
            return;
        }
        
        // Crear contenedores individuales para título y descripción
        const titleContainer = document.createElement('div');
        titleContainer.className = 'list-title';
        const titleClone = title.cloneNode(true);
        titleClone.style.display = 'block';
        titleClone.style.visibility = 'visible';
        titleContainer.appendChild(titleClone);
        
        const descriptionContainer = document.createElement('div');
        descriptionContainer.className = 'list-description';
        const descriptionClone = description.cloneNode(true);
        descriptionClone.style.display = 'block';
        descriptionClone.style.visibility = 'visible';
        descriptionContainer.appendChild(descriptionClone);
        
        // Limpiar card y reconstruir con el orden correcto
        card.innerHTML = '';
        
        // Agregar elementos en el orden: SÍMBOLO - TÍTULO - DESCRIPCIÓN - VALOR - BOTÓN
        card.appendChild(header);              // 1. SÍMBOLO
        card.appendChild(titleContainer);      // 2. TÍTULO
        card.appendChild(descriptionContainer); // 3. DESCRIPCIÓN
        card.appendChild(pricing);             // 4. VALOR
        card.appendChild(button);              // 5. BOTÓN
        
        // Verificar que los elementos sean visibles
        titleContainer.style.display = 'flex';
        descriptionContainer.style.display = 'flex';
        
        console.log(`✅ Card ${index} reestructurada: "${titleClone.textContent.substring(0, 30)}..."`);
    });
    
    console.log('🎯 Vista lista aplicada - SÍMBOLO - TÍTULO - DESCRIPCIÓN - VALOR - BOTÓN');
}

// ✅ FUNCIÓN REPARADA: Recibe el grid específico como parámetro
function restoreCardsToGrid(virtualGrid) {
    const cards = virtualGrid.querySelectorAll('.virtual-card');
    
    cards.forEach(card => {
        const listTitle = card.querySelector('.list-title');
        const listDescription = card.querySelector('.list-description');
        
        // Solo reestructurar si tiene estructura de lista
        if (!listTitle || !listDescription) {
            // Ya está en estructura grid, solo limpiar estilos
            card.style.transition = '';
            return;
        }
        
        // Obtener elementos
        const header = card.querySelector('.virtual-header');
        const title = listTitle.querySelector('h3');
        const description = listDescription.querySelector('p');
        const pricing = card.querySelector('.virtual-pricing');
        const button = card.querySelector('.virtual-cta');
        
        // Restaurar estructura original de grid
        card.innerHTML = '';
        if (header) card.appendChild(header);
        if (title) card.appendChild(title.cloneNode(true));
        if (description) card.appendChild(description.cloneNode(true));
        
        // Recrear elementos que podrían faltar
        const features = document.createElement('div');
        features.className = 'virtual-features';
        card.appendChild(features);
        
        if (pricing) card.appendChild(pricing);
        if (button) card.appendChild(button);
    });
    
    console.log(`📋 Vista grid restaurada en ${cards.length} cards`);
}

// Cargar preferencia de vista al inicializar
function loadViewPreference() {
    const savedView = localStorage.getItem('viewMode');
    if (savedView && savedView !== currentViewMode) {
        setViewMode(savedView);
    }
}

// ✅ INICIALIZACIÓN MEJORADA
function initializeApp() {
    // Inicializar vista toggle
    loadViewPreference();
    
    console.log('🔄 Sistema de Vista Toggle inicializado para todas las secciones');
}

// ✅ ASEGURAR ACTIVACIÓN AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM cargado - Iniciando sistema de vistas');
    
    // Esperar un momento para que el DOM esté completamente listo
    setTimeout(() => {
        loadViewPreference();
        
        // Verificar que los botones toggle existan
        const toggleButtons = document.querySelectorAll('.toggle-btn');
        const virtualGrids = document.querySelectorAll('.virtual-grid');
        
        console.log(`🔍 Elementos encontrados: ${toggleButtons.length} botones, ${virtualGrids.length} grids`);
        
        if (toggleButtons.length === 0) {
            console.warn('⚠️ No se encontraron botones toggle');
        }
        
        if (virtualGrids.length === 0) {
            console.warn('⚠️ No se encontraron grids virtuales');
        }
    }, 100);
});

/* ============================================
   ASISTENTE INTELIGENTE - AGREGAR AL FINAL DEL JS
   ============================================ */

// Estado del asistente
let asistenteState = {
    isOpen: false,
    currentStep: 0,
    userAnswers: [],
    conversation: [],
    recommendations: []
};

// Base de conocimiento del asistente
const asistenteKnowledge = {
    questions: [
        {
            id: 'category',
            text: '¿Qué tipo de documento necesitas?',
            options: [
                { value: 'laboral', text: '👔 Documentos Laborales', next: 'laboral' },
                { value: 'inmobiliario', text: '🏠 Documentos Inmobiliarios', next: 'inmobiliario' },
                { value: 'personal', text: '📋 Declaraciones y Poderes', next: 'personal' },
                { value: 'mudanza', text: '📦 Mudanza & Residencia', next: 'mudanza' },
                { value: 'vehicular', text: '🚗 Documentos Vehiculares', next: 'vehicular' },
                { value: 'no_se', text: '🤔 No estoy seguro', next: 'help' }
            ]
        },
        {
            id: 'laboral',
            text: '¿Qué necesitas en el ámbito laboral?',
            options: [
                { value: 'contratar', text: '🤝 Voy a contratar a alguien', next: 'tipo_contrato' },
                { value: 'trabajo', text: '💼 Busco trabajo', next: 'trabajo_docs' },
                { value: 'terminar', text: '✋ Terminar relación laboral', next: 'terminar_laboral' },
                { value: 'servicios', text: '⚙️ Servicios profesionales', next: 'servicios_docs' }
            ]
        },
        {
            id: 'inmobiliario',
            text: '¿Qué necesitas en el ámbito inmobiliario?',
            options: [
                { value: 'arrendar', text: '🏠 Arrendar una propiedad', next: 'arrendar_docs' },
                { value: 'vender', text: '🤝 Vender/Comprar propiedad', next: 'venta_docs' },
                { value: 'administrar', text: '🏢 Administrar propiedades', next: 'admin_docs' },
                { value: 'autorizar', text: '📝 Autorizaciones especiales', next: 'autorizacion_docs' }
            ]
        },
        {
            id: 'personal',
            text: '¿Qué tipo de documento personal necesitas?',
            options: [
                { value: 'declaracion', text: '📋 Declaración Jurada', next: 'declaracion_tipo' },
                { value: 'poder', text: '⚖️ Poder Notarial', next: 'poder_tipo' },
                { value: 'autorizacion', text: '✈️ Autorización de viaje', next: 'autorizacion_tipo' },
                { value: 'otros', text: '📜 Otros documentos', next: 'otros_docs' }
            ]
        },
        {
            id: 'mudanza',
            text: '¿Qué necesitas para tu mudanza o cambio de residencia?',
            options: [
                { value: 'contrato_mudanza', text: '📦 Contrato de Mudanza', next: 'mudanza_contratos' },
                { value: 'cambio_domicilio', text: '🏠 Cambio de Domicilio', next: 'mudanza_domicilio' },
                { value: 'residencia_temporal', text: '🗂️ Residencia Temporal', next: 'mudanza_residencia' },
                { value: 'almacenamiento', text: '📋 Almacenamiento y Custodia', next: 'mudanza_almacen' }
            ]
        },
        {
            id: 'vehicular',
            text: '¿Qué tipo de trámite vehicular necesitas?',
            options: [
                { value: 'compraventa', text: '💰 Comprar/Vender Vehículo', next: 'vehicular_compraventa' },
                { value: 'arriendo_vehiculo', text: '🚗 Arriendo de Vehículo', next: 'vehicular_arriendo' },
                { value: 'autorizacion_vehicular', text: '🛣️ Autorización de Salida', next: 'vehicular_autorizacion' },
                { value: 'tramites_vehiculares', text: '📋 Trámites y Mandatos', next: 'vehicular_tramites' }
            ]
        }
    ],
    
    // Mapeo de documentos por categoría
    documentMapping: {
        // Laborales - Contratar
        'contratar-indefinido': ['modelo-contrato-trabajo-indefinido'],
        'contratar-plazo': ['modelo-contrato-plazo-fijo'],
        'contratar-trato': ['modelo-contrato-trabajo-trato'],
        'contratar-domestico': ['contrato-casa-particular-adentro', 'contrato-casa-particular-afuera'],
        'contratar-practicas': ['convenio-practica-profesional'],
        'contratar-extranjero': ['oferta-laboral-extranjeros'],
        
        // Laborales - Terminar
        'terminar-aviso': ['aviso-termino-contrato'],
        'terminar-finiquito': ['finiquito-laboral-final'],
        'terminar-renuncia': ['renuncia-voluntaria'],
        
        // Servicios profesionales
        'servicios-honorarios': ['contrato-prestacion-servicios-honorarios'],
        'servicios-oferta': ['carta-oferta-laboral'],
        'servicios-menor': ['permiso-trabajo-menor-edad'],
        
        // Inmobiliarios - Arriendo
        'arrendar-contrato': ['contrato-arriendo'],
        'arrendar-anexo': ['anexo-arriendo'],
        'arrendar-termino': ['notificacion-termino'],
        'arrendar-cesion': ['cesion-arriendo'],
        'arrendar-comercial': ['arriendo-direccion-comercial'],
        
        // Inmobiliarios - Venta
        'venta-promesa': ['promesa-compraventa'],
        'venta-rescision': ['resciliacion-promesa'],
        
        // Inmobiliarios - Administración
        'admin-mandato': ['mandato-administracion'],
        'admin-autorizacion': ['autorizacion-comercial'],
        
        // Declaraciones
        'declaracion-solteria': ['declaracion-solteria'],
        'declaracion-convivencia': ['declaracion-convivencia'],
        'declaracion-ingresos': ['declaracion-ingresos'],
        'declaracion-expensas': ['declaracion-expensas'],
        'declaracion-allegamiento': ['declaracion-allegamiento'],
        'declaracion-parentesco': ['declaracion-no-parentesco'],
        
        // Poderes
        'poder-simple': ['poder-simple'],
        'poder-contador': ['poder-contador-sii'],
        'poder-pagare': ['mandato-pagare'],
        
        // Autorizaciones
        'autorizacion-viaje': ['autorizacion-salida-menor'],
        'autorizacion-muro': ['autorizacion-muro'],
        
        // Otros
        'otros-invitacion': ['carta-invitacion'],
        'otros-testamento': ['testamento-abierto'],
        'otros-fundacion': ['estatuto-fundacion'],
        'otros-pagare': ['pagare-modelo'],
        'otros-compra': ['formato-orden-compra'],
        
        // ✅ NUEVOS: Mudanza & Residencia
        'mudanza-contrato': ['contrato-servicio-mudanza'],
        'mudanza-cambio': ['declaracion-cambio-domicilio'],
        'mudanza-residencia': ['autorizacion-residencia-temporal'],
        'mudanza-invitacion': ['carta-invitacion-residencia'],
        'mudanza-almacenamiento': ['contrato-almacenamiento-temporal'],
        'mudanza-entrega': ['certificado-entrega-vivienda'],
        'mudanza-inventario': ['inventario-bienes-mudanza'],
        'mudanza-mandato': ['mandato-cambio-direccion'],
        
        // ✅ NUEVOS: Vehiculares
        'vehicular-arriendo': ['contrato-arriendo-tipo-vehiculo'],
        'vehicular-autorizacion': ['modelo-autorizacion-notarial-salida-vehiculo'],
        'vehicular-promesa': ['modelo-promesa-compraventa-vehiculo'],
        'vehicular-compraventa': ['vehiculo-compraventa-modelo'],
        'vehicular-compraventa-alt': ['vehiculo-compraventa-modelo-alternativo'],
        'vehicular-mandato': ['mandato-tramites-vehiculares'],
        'vehicular-declaracion': ['declaracion-jurada-vehiculo'],
        'vehicular-cesion': ['cesion-derechos-vehiculares']
    }
};

// Función para abrir asistente
function openAsistente() {
    asistenteState.isOpen = true;
    const modal = document.getElementById('asistenteModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Inicializar conversación
    initializeConversation();
    
    console.log('🤖 Asistente abierto');
}

// Función para cerrar asistente
function closeAsistente() {
    asistenteState.isOpen = false;
    const modal = document.getElementById('asistenteModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    console.log('🤖 Asistente cerrado');
}

// Inicializar conversación
function initializeConversation() {
    asistenteState.currentStep = 0;
    asistenteState.userAnswers = [];
    asistenteState.conversation = [];
    asistenteState.recommendations = [];
    
    const conversationArea = document.getElementById('conversationArea');
    const questionArea = document.getElementById('questionArea');
    const actionArea = document.getElementById('actionArea');
    
    // Limpiar áreas
    conversationArea.innerHTML = '';
    questionArea.innerHTML = '';
    actionArea.innerHTML = '<button class="btn-restart" onclick="restartAsistente()" style="display: none;">🔄 Empezar de Nuevo</button>';
    
    // Mensaje de bienvenida
    addMessage('bot', '¡Hola! 👋 Soy tu asistente virtual. Te ayudo a encontrar el documento notarial que necesitas.', true);
    
    setTimeout(() => {
        showFirstQuestion();
    }, 1000);
}

// Mostrar primera pregunta
function showFirstQuestion() {
    addMessage('bot', 'Para comenzar, necesito saber qué tipo de documento estás buscando.', true);
    
    setTimeout(() => {
        showQuestion('category');
    }, 800);
}

// Agregar mensaje a la conversación
function addMessage(sender, text, animate = false) {
    const conversationArea = document.getElementById('conversationArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = sender === 'bot' ? '🤖' : '👤';
    const time = new Date().toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <p class="message-text">${text}</p>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    if (animate) {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
    }
    
    conversationArea.appendChild(messageDiv);
    
    if (animate) {
        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
            messageDiv.style.transition = 'all 0.4s ease';
        }, 100);
    }
    
    // Scroll al final
    conversationArea.scrollTop = conversationArea.scrollHeight;
    
    // Guardar en historial
    asistenteState.conversation.push({ sender, text, time });
}

// Mostrar indicador de escritura
function showTypingIndicator() {
    const conversationArea = document.getElementById('conversationArea');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="typing-indicator">
                <span>Escribiendo</span>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        </div>
    `;
    
    conversationArea.appendChild(typingDiv);
    conversationArea.scrollTop = conversationArea.scrollHeight;
}

// Quitar indicador de escritura
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Mostrar pregunta
function showQuestion(questionId) {
    const question = asistenteKnowledge.questions.find(q => q.id === questionId);
    if (!question) return;
    
    const questionArea = document.getElementById('questionArea');
    
    questionArea.innerHTML = `
        <div class="question-title">${question.text}</div>
        <div class="question-options">
            ${question.options.map(option => 
                `<button class="question-option" onclick="handleAnswer('${questionId}', '${option.value}', '${option.text}', '${option.next}')">
                    ${option.text}
                </button>`
            ).join('')}
        </div>
    `;
}

// Manejar respuesta del usuario
function handleAnswer(questionId, value, text, next) {
    // Agregar respuesta del usuario
    addMessage('user', text, true);
    
    // Guardar respuesta
    asistenteState.userAnswers.push({ questionId, value, text, next });
    asistenteState.currentStep++;
    
    // Limpiar área de preguntas
    document.getElementById('questionArea').innerHTML = '';
    
    // Mostrar indicador de escritura
    showTypingIndicator();
    
    setTimeout(() => {
        hideTypingIndicator();
        processAnswer(next, value);
    }, 1500);
}

// Procesar respuesta y continuar flujo
function processAnswer(next, value) {
    switch (next) {
        case 'tipo_contrato':
            showContractTypeQuestion();
            break;
        case 'trabajo_docs':
            showWorkDocumentsOptions();
            break;
        case 'terminar_laboral':
            showTerminationOptions();
            break;
        case 'servicios_docs':
            showServicesOptions();
            break;
        case 'arrendar_docs':
            showRentalOptions();
            break;
        case 'venta_docs':
            showSaleOptions();
            break;
        case 'admin_docs':
            showAdminOptions();
            break;
        case 'autorizacion_docs':
            showAuthorizationOptions();
            break;
        case 'declaracion_tipo':
            showDeclarationOptions();
            break;
        case 'poder_tipo':
            showPowerOptions();
            break;
        case 'autorizacion_tipo':
            showTravelAuthOptions();
            break;
        case 'otros_docs':
            showOtherDocsOptions();
            break;
        case 'mudanza_contratos':
            showMudanzaContractOptions();
            break;
        case 'mudanza_domicilio':
            showMudanzaDomicilioOptions();
            break;
        case 'mudanza_residencia':
            showMudanzaResidenciaOptions();
            break;
        case 'mudanza_almacen':
            showMudanzaAlmacenOptions();
            break;
        case 'vehicular_compraventa':
            showVehicularCompraventaOptions();
            break;
        case 'vehicular_arriendo':
            showVehicularArriendoOptions();
            break;
        case 'vehicular_autorizacion':
            showVehicularAutorizacionOptions();
            break;
        case 'vehicular_tramites':
            showVehicularTramitesOptions();
            break;
        case 'help':
            showHelpMessage();
            break;
        default:
            checkForRecommendations(next);
            break;
    }
}

// Funciones específicas para cada tipo de pregunta
function showContractTypeQuestion() {
    addMessage('bot', 'Perfecto. ¿Qué tipo de contrato de trabajo necesitas?', true);
    
    setTimeout(() => {
        const questionArea = document.getElementById('questionArea');
        questionArea.innerHTML = `
            <div class="question-title">Selecciona el tipo de contrato:</div>
            <div class="question-options">
                <button class="question-option" onclick="showRecommendations(['modelo-contrato-trabajo-indefinido'])">👔 Contrato Indefinido</button>
                <button class="question-option" onclick="showRecommendations(['modelo-contrato-plazo-fijo'])">⏰ Contrato a Plazo Fijo</button>
                <button class="question-option" onclick="showRecommendations(['modelo-contrato-trabajo-trato'])">🔨 Contrato por Obra/Trato</button>
                <button class="question-option" onclick="showRecommendations(['contrato-casa-particular-adentro', 'contrato-casa-particular-afuera'])">🏠 Trabajador Doméstico</button>
                <button class="question-option" onclick="showRecommendations(['convenio-practica-profesional'])">🎓 Prácticas Profesionales</button>
                <button class="question-option" onclick="showRecommendations(['oferta-laboral-extranjeros'])">🌍 Trabajador Extranjero</button>
            </div>
        `;
    }, 800);
}

function showTerminationOptions() {
    addMessage('bot', '¿Qué documento necesitas para terminar la relación laboral?', true);
    
    setTimeout(() => {
        const questionArea = document.getElementById('questionArea');
        questionArea.innerHTML = `
            <div class="question-title">Documentos de término laboral:</div>
            <div class="question-options">
                <button class="question-option" onclick="showRecommendations(['aviso-termino-contrato'])">📋 Aviso de Término</button>
                <button class="question-option" onclick="showRecommendations(['finiquito-laboral-final'])">💼 Finiquito Laboral</button>
                <button class="question-option" onclick="showRecommendations(['renuncia-voluntaria'])">✋ Carta de Renuncia</button>
            </div>
        `;
    }, 800);
}

function showDeclarationOptions() {
    addMessage('bot', '¿Qué tipo de declaración jurada necesitas?', true);
    
    setTimeout(() => {
        const questionArea = document.getElementById('questionArea');
        questionArea.innerHTML = `
            <div class="question-title">Tipos de declaraciones juradas:</div>
            <div class="question-options">
                <button class="question-option" onclick="showRecommendations(['declaracion-solteria'])">💍 Estado Civil Soltero</button>
                <button class="question-option" onclick="showRecommendations(['declaracion-convivencia'])">👥 Convivencia/Unión de Hecho</button>
                <button class="question-option" onclick="showRecommendations(['declaracion-ingresos'])">📊 Declaración de Ingresos</button>
                <button class="question-option" onclick="showRecommendations(['declaracion-expensas'])">💰 Declaración de Expensas</button>
                <button class="question-option" onclick="showRecommendations(['declaracion-allegamiento'])">🏠 Allegamiento/Residencia</button>
                <button class="question-option" onclick="showRecommendations(['declaracion-no-parentesco'])">⚖️ No Parentesco</button>
            </div>
        `;
    }, 800);
}

function showRentalOptions() {
    addMessage('bot', '¿Qué documento necesitas para el arriendo?', true);
    
    setTimeout(() => {
        const questionArea = document.getElementById('questionArea');
        questionArea.innerHTML = `
            <div class="question-title">Documentos de arriendo:</div>
            <div class="question-options">
                <button class="question-option" onclick="showRecommendations(['contrato-arriendo'])">🏠 Contrato de Arriendo</button>
                <button class="question-option" onclick="showRecommendations(['anexo-arriendo'])">📄 Anexo al Contrato</button>
                <button class="question-option" onclick="showRecommendations(['notificacion-termino'])">📮 Notificación de Término</button>
                <button class="question-option" onclick="showRecommendations(['cesion-arriendo'])">🔄 Cesión de Arriendo</button>
                <button class="question-option" onclick="showRecommendations(['arriendo-direccion-comercial'])">🏬 Arriendo Comercial</button>
            </div>
        `;
    }, 800);
}

function showOtherDocsOptions() {
    addMessage('bot', 'Aquí tienes otros documentos útiles:', true);
    
    setTimeout(() => {
        const questionArea = document.getElementById('questionArea');
        questionArea.innerHTML = `
            <div class="question-title">Otros documentos:</div>
            <div class="question-options">
                <button class="question-option" onclick="showRecommendations(['carta-invitacion'])">📧 Carta de Invitación</button>
                <button class="question-option" onclick="showRecommendations(['testamento-abierto'])">📜 Testamento</button>
                <button class="question-option" onclick="showRecommendations(['estatuto-fundacion'])">🏛️ Estatuto Fundación</button>
                <button class="question-option" onclick="showRecommendations(['pagare-modelo'])">💳 Pagaré</button>
                <button class="question-option" onclick="showRecommendations(['formato-orden-compra'])">🛒 Orden de Compra</button>
            </div>
        `;
    }, 800);
}

// ✅ NUEVAS FUNCIONES: Mudanza & Residencia
function showMudanzaContractOptions() {
    addMessage('bot', '¿Qué tipo de contrato de mudanza necesitas?', true);
    
    setTimeout(() => {
        const questionArea = document.getElementById('questionArea');
        questionArea.innerHTML = `
            <div class="question-title">Contratos de mudanza:</div>
            <div class="question-options">
                <button class="question-option" onclick="showRecommendations(['contrato-servicio-mudanza'])">📦 Contrato de Servicio de Mudanza</button>
                <button class="question-option" onclick="showRecommendations(['contrato-almacenamiento-temporal'])">📋 Contrato de Almacenamiento Temporal</button>
                <button class="question-option" onclick="showRecommendations(['inventario-bienes-mudanza'])">📝 Inventario de Bienes para Mudanza</button>
            </div>
        `;
    }, 800);
}

function showMudanzaDomicilioOptions() {
    addMessage('bot', '¿Qué documentos necesitas para el cambio de domicilio?', true);
    
    setTimeout(() => {
        const questionArea = document.getElementById('questionArea');
        questionArea.innerHTML = `
            <div class="question-title">Cambio de domicilio:</div>
            <div class="question-options">
                <button class="question-option" onclick="showRecommendations(['declaracion-cambio-domicilio'])">🏠 Declaración Jurada de Cambio de Domicilio</button>
                <button class="question-option" onclick="showRecommendations(['mandato-cambio-direccion'])">📍 Mandato para Cambio de Dirección</button>
                <button class="question-option" onclick="showRecommendations(['certificado-entrega-vivienda'])">🔑 Certificado de Entrega de Vivienda</button>
            </div>
        `;
    }, 800);
}

function showMudanzaResidenciaOptions() {
    addMessage('bot', '¿Qué tipo de documento de residencia temporal necesitas?', true);
    
    setTimeout(() => {
        const questionArea = document.getElementById('questionArea');
        questionArea.innerHTML = `
            <div class="question-title">Residencia temporal:</div>
            <div class="question-options">
                <button class="question-option" onclick="showRecommendations(['autorizacion-residencia-temporal'])">🗂️ Autorización de Residencia Temporal</button>
                <button class="question-option" onclick="showRecommendations(['carta-invitacion-residencia'])">✉️ Carta de Invitación para Residencia</button>
            </div>
        `;
    }, 800);
}

function showMudanzaAlmacenOptions() {
    addMessage('bot', '¿Qué documentos necesitas para almacenamiento?', true);
    
    setTimeout(() => {
        const questionArea = document.getElementById('questionArea');
        questionArea.innerHTML = `
            <div class="question-title">Almacenamiento y custodia:</div>
            <div class="question-options">
                <button class="question-option" onclick="showRecommendations(['contrato-almacenamiento-temporal'])">📋 Contrato de Almacenamiento Temporal</button>
                <button class="question-option" onclick="showRecommendations(['inventario-bienes-mudanza'])">📝 Inventario de Bienes para Mudanza</button>
            </div>
        `;
    }, 800);
}

// ✅ NUEVAS FUNCIONES: Vehicular
function showVehicularCompraventaOptions() {
    addMessage('bot', '¿Qué tipo de documento de compraventa vehicular necesitas?', true);
    
    setTimeout(() => {
        const questionArea = document.getElementById('questionArea');
        questionArea.innerHTML = `
            <div class="question-title">Compraventa de vehículos:</div>
            <div class="question-options">
                <button class="question-option" onclick="showRecommendations(['vehiculo-compraventa-modelo'])">💰 Vehículo Compraventa Modelo</button>
                <button class="question-option" onclick="showRecommendations(['vehiculo-compraventa-modelo-alternativo'])">🔄 Vehículo Compraventa Modelo Alternativo</button>
                <button class="question-option" onclick="showRecommendations(['modelo-promesa-compraventa-vehiculo'])">🤝 Modelo Promesa de Compraventa Vehículo</button>
                <button class="question-option" onclick="showRecommendations(['cesion-derechos-vehiculares'])">🔀 Cesión de Derechos Vehiculares</button>
            </div>
        `;
    }, 800);
}

function showVehicularArriendoOptions() {
    addMessage('bot', 'Documentos para arriendo de vehículos:', true);
    
    setTimeout(() => {
        const questionArea = document.getElementById('questionArea');
        questionArea.innerHTML = `
            <div class="question-title">Arriendo de vehículos:</div>
            <div class="question-options">
                <button class="question-option" onclick="showRecommendations(['contrato-arriendo-tipo-vehiculo'])">🚗 Contrato de Arriendo TIPO Vehículo</button>
            </div>
        `;
    }, 800);
}

function showVehicularAutorizacionOptions() {
    addMessage('bot', '¿Qué tipo de autorización vehicular necesitas?', true);
    
    setTimeout(() => {
        const questionArea = document.getElementById('questionArea');
        questionArea.innerHTML = `
            <div class="question-title">Autorizaciones vehiculares:</div>
            <div class="question-options">
                <button class="question-option" onclick="showRecommendations(['modelo-autorizacion-notarial-salida-vehiculo'])">🛣️ Modelo Autorización Notarial Salida Vehículo</button>
                <button class="question-option" onclick="showRecommendations(['declaracion-jurada-vehiculo'])">⚖️ Declaración Jurada de Vehículo</button>
            </div>
        `;
    }, 800);
}

function showVehicularTramitesOptions() {
    addMessage('bot', '¿Qué trámites vehiculares necesitas realizar?', true);
    
    setTimeout(() => {
        const questionArea = document.getElementById('questionArea');
        questionArea.innerHTML = `
            <div class="question-title">Trámites y mandatos vehiculares:</div>
            <div class="question-options">
                <button class="question-option" onclick="showRecommendations(['mandato-tramites-vehiculares'])">📋 Mandato para Trámites Vehiculares</button>
                <button class="question-option" onclick="showRecommendations(['declaracion-jurada-vehiculo'])">⚖️ Declaración Jurada de Vehículo</button>
                <button class="question-option" onclick="showRecommendations(['cesion-derechos-vehiculares'])">🔀 Cesión de Derechos Vehiculares</button>
            </div>
        `;
    }, 800);
}

// Mostrar recomendaciones finales
function showRecommendations(documentIds) {
    addMessage('user', 'Ver recomendaciones', true);
    
    showTypingIndicator();
    
    setTimeout(() => {
        hideTypingIndicator();
        
        const documents = documentIds.map(id => {
            const card = document.querySelector(`[data-service="${id}"]`);
            if (card) {
                const title = card.querySelector('h3').textContent;
                const price = card.querySelector('.price-main').textContent;
                return { id, title, price };
            }
            return null;
        }).filter(doc => doc !== null);
        
        if (documents.length > 0) {
            addMessage('bot', `¡Perfecto! Basándome en tus respuestas, te recomiendo ${documents.length === 1 ? 'este documento' : 'estos documentos'}:`, true);
            
            setTimeout(() => {
                highlightRecommendedDocuments(documentIds);
                showRecommendationsList(documents);
                showRestartButton();
            }, 1000);
        } else {
            addMessage('bot', 'Lo siento, no encontré documentos específicos para tu consulta. Te recomiendo revisar todas nuestras opciones disponibles.', true);
            showRestartButton();
        }
    }, 1500);
}

// Mostrar lista de recomendaciones
function showRecommendationsList(documents) {
    const questionArea = document.getElementById('questionArea');
    
    const documentsHtml = documents.map(doc => `
        <div class="recommendation-item" onclick="scrollToDocument('${doc.id}')">
            <div class="rec-info">
                <div class="rec-title">${doc.title}</div>
                <div class="rec-price">${doc.price}</div>
            </div>
            <div class="rec-arrow">→</div>
        </div>
    `).join('');
    
    questionArea.innerHTML = `
        <div class="question-title">📋 Documentos Recomendados:</div>
        <div class="recommendations-list">
            ${documentsHtml}
        </div>
    `;
    
    // Agregar estilos para recomendaciones si no existen
    addRecommendationStyles();
}

// Agregar estilos para recomendaciones
function addRecommendationStyles() {
    if (document.querySelector('#recommendation-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'recommendation-styles';
    style.textContent = `
        .recommendations-list {
            display: flex;
            flex-direction: column;
            gap: 0.8rem;
        }
        
        .recommendation-item {
            background: rgba(16, 185, 129, 0.1);
            border: 2px solid rgba(16, 185, 129, 0.3);
            border-radius: 15px;
            padding: 1rem 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .recommendation-item:hover {
            background: rgba(16, 185, 129, 0.2);
            border-color: rgba(16, 185, 129, 0.5);
            transform: translateX(8px);
        }
        
        .rec-info {
            flex: 1;
        }
        
        .rec-title {
            color: var(--white);
            font-weight: 600;
            font-size: 1rem;
            margin-bottom: 0.3rem;
        }
        
        .rec-price {
            color: var(--virtual-green);
            font-weight: 700;
            font-size: 1.2rem;
        }
        
        .rec-arrow {
            color: var(--virtual-green);
            font-size: 1.5rem;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
}

// Resaltar documentos recomendados
function highlightRecommendedDocuments(documentIds) {
    // Quitar destacados previos
    document.querySelectorAll('.virtual-card').forEach(card => {
        card.classList.remove('assistant-recommended');
    });
    
    // Resaltar documentos recomendados
    documentIds.forEach(id => {
        const card = document.querySelector(`[data-service="${id}"]`);
        if (card) {
            card.classList.add('assistant-recommended');
        }
    });
    
    // Agregar estilos de recomendación si no existen
    addRecommendationHighlightStyles();
    
    // Scroll al primer documento
    if (documentIds.length > 0) {
        setTimeout(() => {
            scrollToDocument(documentIds[0]);
        }, 500);
    }
}

// Agregar estilos de destacado
function addRecommendationHighlightStyles() {
    if (document.querySelector('#assistant-highlight-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'assistant-highlight-styles';
    style.textContent = `
        .virtual-card.assistant-recommended {
            border: 3px solid var(--virtual-green) !important;
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.4) !important;
            animation: recommendedPulse 2s infinite;
            position: relative;
        }
        
        .virtual-card.assistant-recommended::before {
            content: '🤖 Recomendado';
            position: absolute;
            top: -10px;
            right: -5px;
            background: var(--virtual-green);
            color: var(--white);
            padding: 0.3rem 0.8rem;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            z-index: 5;
        }
        
        @keyframes recommendedPulse {
            0%, 100% {
                box-shadow: 0 0 30px rgba(16, 185, 129, 0.4);
            }
            50% {
                box-shadow: 0 0 40px rgba(16, 185, 129, 0.6);
            }
        }
    `;
    document.head.appendChild(style);
}

// Scroll a documento específico
function scrollToDocument(documentId) {
    closeAsistente();
    
    setTimeout(() => {
        const card = document.querySelector(`[data-service="${documentId}"]`);
        if (card) {
            card.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Efecto adicional de destaque
            card.style.transform = 'scale(1.05)';
            setTimeout(() => {
                card.style.transform = '';
            }, 1000);
        }
    }, 300);
}

// Mostrar botón de reiniciar
function showRestartButton() {
    const actionArea = document.getElementById('actionArea');
    const restartBtn = actionArea.querySelector('.btn-restart');
    if (restartBtn) {
        restartBtn.style.display = 'block';
    }
}

// Reiniciar asistente
function restartAsistente() {
    addMessage('bot', '¡Perfecto! Vamos a empezar de nuevo. 🔄', true);
    
    setTimeout(() => {
        initializeConversation();
    }, 1000);
}

// Mensaje de ayuda
function showHelpMessage() {
    addMessage('bot', 'No te preocupes, te ayudo a encontrar lo que necesitas. Puedes explorar todas nuestras categorías:', true);
    
    setTimeout(() => {
        const questionArea = document.getElementById('questionArea');
        questionArea.innerHTML = `
            <div class="question-title">Explora por categorías:</div>
            <div class="question-options">
                <button class="question-option" onclick="filterByCategory('laboral')">👔 Ver Documentos Laborales</button>
                <button class="question-option" onclick="filterByCategory('inmobiliario')">🏠 Ver Documentos Inmobiliarios</button>
                <button class="question-option" onclick="filterByCategory('personal')">📋 Ver Declaraciones y Poderes</button>
                <button class="question-option" onclick="filterByCategory('mudanza')">📦 Ver Mudanza & Residencia</button>
                <button class="question-option" onclick="filterByCategory('vehicular')">🚗 Ver Documentos Vehiculares</button>
                <button class="question-option" onclick="closeAsistente()">🔍 Explorar Todos los Documentos</button>
            </div>
        `;
    }, 800);
}

// Filtrar por categoría
function filterByCategory(category) {
    closeAsistente();
    
    setTimeout(() => {
        // Scroll a la sección correspondiente
        const sections = document.querySelectorAll('.services-category-title');
        let targetSection = null;
        
        sections.forEach(section => {
            const text = section.textContent.toLowerCase();
            if (
                (category === 'laboral' && text.includes('laboral')) ||
                (category === 'inmobiliario' && text.includes('inmobiliario')) ||
                (category === 'personal' && text.includes('declaraciones')) ||
                (category === 'mudanza' && text.includes('mudanza')) ||
                (category === 'vehicular' && text.includes('vehicular'))
            ) {
                targetSection = section;
            }
        });
        
        if (targetSection) {
            targetSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            
            // Efecto visual para destacar la sección
            targetSection.style.color = '#10b981';
            targetSection.style.textShadow = '0 0 20px rgba(16, 185, 129, 0.8)';
            setTimeout(() => {
                targetSection.style.color = '';
                targetSection.style.textShadow = '';
            }, 3000);
        }
    }, 300);
}