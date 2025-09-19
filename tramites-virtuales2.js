/* ============================================
   SISTEMA DE PAGO CON DEMO - FUNCIONES PRINCIPALES
   ============================================ */

function openPaymentModal(serviceType, amount, redirectUrl) {
    currentPayment = {
        service: serviceType,
        amount: amount,
        redirectUrl: redirectUrl
    };
    
    // Actualizar información del servicio en el modal
    document.getElementById('serviceName').textContent = getServiceInfo(serviceType).name;
    document.getElementById('servicePrice').textContent = `$${amount}`;
    document.getElementById('subtotal').textContent = `$${amount}`;
    document.getElementById('totalAmount').textContent = `$${amount}`;
    document.querySelector('.pay-text').textContent = `Pagar $${amount}`;
    
    // Mostrar modal
    const modal = document.getElementById('paymentModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus en el primer input
    setTimeout(() => {
        document.getElementById('cardNumber').focus();
    }, 300);
    
    // Inicializar formateo de inputs
    initializePaymentInputs();
    
    console.log('💳 Modal de pago abierto:', serviceType, amount);
    
    // NUEVO: Log de notaría asociada
    if (selectedNotaryInfo) {
        console.log('🏛️ Pago asociado a notaría:', selectedNotaryInfo.name);
    }
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Limpiar formulario
    clearPaymentForm();
    
    console.log('💳 Modal de pago cerrado');
}

/* ============================================
   NUEVA FUNCIÓN DEMO - SALTAR PAGO
   ============================================ */
function continueDemo() {
    showNotification('🎯 ¡Modo Demo activado! Continuando sin pago...', 'warning');
    
    // Mostrar tracking especial para demo
    trackDemoSkip(currentPayment.service);
    
    // NUEVO: Generar datos de cliente demo
    generateDemoClientData();
    
    // Cerrar modal después de un momento corto
    setTimeout(() => {
        closePaymentModal();
        
        // NUEVO: Registrar venta demo en admin panel
        registerDemoSale();
        
        // Redirigir al siguiente paso
        if (currentPayment.redirectUrl) {
            showNotification('🚀 Redirigiendo a la plataforma...', 'info');
            setTimeout(() => {
                window.location.href = currentPayment.redirectUrl;
            }, 1500);
        }
    }, 1500);
    
    console.log('🎯 Demo mode activated for:', currentPayment.service);
}

// ============================================
// FUNCIÓN NUEVA: GENERAR DATOS DEMO
// ============================================
function generateDemoClientData() {
    const demoNames = [
        'Carlos Alberto Mendoza Torres',
        'María Elena González Castro',
        'Roberto Silva Martínez López',
        'Ana Lucía Ramírez Torres',
        'Fernando José López Silva',
        'Patricia Isabel Ruiz Morales',
        'Manuel Antonio Soto González'
    ];
    
    const randomName = demoNames[Math.floor(Math.random() * demoNames.length)];
    const firstName = randomName.split(' ')[0].toLowerCase();
    const lastName = randomName.split(' ')[1].toLowerCase();
    
    clientData = {
        name: randomName,
        email: `${firstName}.${lastName}@email.com`,
        phone: `+56 9 ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`,
        rut: generateRandomRut()
    };
    
    console.log('👤 Datos de cliente demo generados:', clientData);
}

function generateRandomRut() {
    const numbers = Math.floor(Math.random() * 99999999) + 10000000;
    const dv = calculateRutDV(numbers);
    return `${numbers}-${dv}`;
}

function calculateRutDV(rut) {
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = rut.toString().length - 1; i >= 0; i--) {
        suma += parseInt(rut.toString().charAt(i)) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const dv = 11 - (suma % 11);
    return dv === 11 ? '0' : dv === 10 ? 'K' : dv.toString();
}

/* ============================================
   PAGO MODIFICADO - SIEMPRE EXITOSO + REGISTRO
   ============================================ */
function processPayment() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // ============================================
    // NUEVA FUNCIONALIDAD - PAGAR EN CAJA
    // ============================================
    if (selectedMethod === 'caja') {
        procesarPagoEnCaja();
        return;
    }
    
    const payButton = document.getElementById('payButton');
    const payText = payButton.querySelector('.pay-text');
    const payLoading = payButton.querySelector('.pay-loading');
    
    // Validación SUAVE - permite campos vacíos para demo
    if (!validatePaymentFormDemo()) {
        showNotification('💡 Tip: Puedes usar datos de prueba o usar "Continuar Demo"', 'warning');
        return;
    }
    
    // NUEVO: Capturar datos del cliente del formulario
    captureClientDataFromForm();
    
    // Mostrar loading
    payText.style.display = 'none';
    payLoading.style.display = 'flex';
    payButton.disabled = true;
    
    // Simular procesamiento del pago - SIEMPRE EXITOSO
    setTimeout(() => {
        // GARANTIZAR ÉXITO
        handlePaymentSuccess();
        
        // Restaurar botón
        payText.style.display = 'block';
        payLoading.style.display = 'none';
        payButton.disabled = false;
        
    }, 3000); // 3 segundos de simulación realista
}

// ============================================
// FUNCIÓN NUEVA: CAPTURAR DATOS DEL CLIENTE
// ============================================
function captureClientDataFromForm() {
    const cardName = document.getElementById('cardName').value.trim();
    
    if (cardName) {
        // Usar datos del formulario
        clientData = {
            name: cardName,
            email: generateEmailFromName(cardName),
            phone: `+56 9 ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`,
            rut: generateRandomRut()
        };
    } else {
        // Generar datos demo
        generateDemoClientData();
    }
    
    console.log('👤 Datos del cliente capturados:', clientData);
}

function generateEmailFromName(fullName) {
    const parts = fullName.toLowerCase().split(' ');
    const email = parts.length >= 2 
        ? `${parts[0]}.${parts[1]}@email.com`
        : `${parts[0]}@email.com`;
    return email.replace(/[^a-z0-9.@]/g, '');
}

// ============================================
// FUNCIÓN NUEVA: MANEJAR PAGO EXITOSO + REGISTRO
// ============================================
function handlePaymentSuccess() {
    // Mostrar éxito
    showNotification('✅ ¡Pago procesado exitosamente! Registrando venta...', 'success');
    
    // NUEVO: Registrar venta en admin panel
    registerSuccessfulSale();
    
    // Cerrar modal después de un momento
    setTimeout(() => {
        closePaymentModal();
        
        // Redirigir al siguiente paso
        if (currentPayment.redirectUrl) {
            showNotification('🚀 Venta registrada - Redirigiendo a la plataforma...', 'info');
            setTimeout(() => {
                window.location.href = currentPayment.redirectUrl;
            }, 1500);
        }
    }, 2000);
    
    // Tracking del pago exitoso
    trackPaymentSuccess(currentPayment.service, currentPayment.amount);
}

// ============================================
// FUNCIÓN REPARADA: REGISTRAR VENTA EXITOSA
// ============================================
function registerSuccessfulSale() {
    if (!selectedNotaryInfo || !clientData) {
        console.warn('⚠️ Faltan datos para registrar la venta');
        return;
    }
    
    const saleData = {
        notary: selectedNotaryInfo.name,
        client: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        service: getServiceInfo(currentPayment.service).name,
        amount: currentPayment.amount
    };
    
    // ✅ REPARACIÓN: Guardar INMEDIATAMENTE en localStorage
    saveVentaToAdminSystem(saleData);
    
    console.log('💰 Venta registrada:', saleData);
}

// ============================================
// FUNCIÓN REPARADA: REGISTRAR VENTA DEMO
// ============================================
function registerDemoSale() {
    if (!selectedNotaryInfo || !clientData) {
        console.warn('⚠️ Faltan datos para registrar la venta demo');
        return;
    }
    
    const saleData = {
        notary: selectedNotaryInfo.name,
        client: clientData.name + ' (DEMO)',
        email: clientData.email,
        phone: clientData.phone,
        service: getServiceInfo(currentPayment.service).name + ' (DEMO)',
        amount: currentPayment.amount
    };
    
    // ✅ REPARACIÓN: Guardar INMEDIATAMENTE en localStorage
    saveVentaToAdminSystem(saleData);
    
    console.log('🎯 Venta demo registrada:', saleData);
}

// ============================================
// ✅ FUNCIÓN COMPLETAMENTE NUEVA Y REPARADA
// ============================================
function saveVentaToAdminSystem(saleData) {
    try {
        // 1. Generar venta completa con todos los campos requeridos
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
        
        // 2. Guardar en localStorage con clave especial para admin
        const existingVentas = JSON.parse(localStorage.getItem('adminVentas') || '[]');
        existingVentas.unshift(ventaCompleta); // Agregar al inicio
        localStorage.setItem('adminVentas', JSON.stringify(existingVentas));
        
        // 3. Crear evento para notificar al admin si está abierto
        window.dispatchEvent(new CustomEvent('nuevaVenta', { 
            detail: ventaCompleta 
        }));
        
        // 4. Guardar timestamp de la última venta
        localStorage.setItem('ultimaVenta', Date.now().toString());
        
        console.log('💾 ✅ Venta guardada en sistema admin:', ventaCompleta);
        
        // 5. Verificar que se guardó correctamente
        const verificacion = JSON.parse(localStorage.getItem('adminVentas') || '[]');
        console.log(`🔍 Verificación: ${verificacion.length} ventas en sistema`);
        
        return ventaCompleta;
        
    } catch (error) {
        console.error('❌ Error al guardar venta en admin:', error);
        
        // Fallback: guardar de forma más simple
        try {
            const simpleVenta = {
                id: Date.now(),
                cliente: saleData.client,
                monto: saleData.amount,
                fecha: new Date().toLocaleString(),
                notaria: saleData.notary
            };
            
            localStorage.setItem('ultimaVentaSimple', JSON.stringify(simpleVenta));
            console.log('💾 ⚠️ Venta guardada en modo simple:', simpleVenta);
            
        } catch (fallbackError) {
            console.error('❌ Error total al guardar venta:', fallbackError);
        }
    }
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

function handlePaymentError() {
    // Esta función ya no se usa, pero la mantenemos por compatibilidad
    showNotification('❌ Error al procesar el pago. Intenta nuevamente.', 'error');
    trackPaymentError(currentPayment.service, currentPayment.amount);
}

/* ============================================
   VALIDACIÓN MODIFICADA - MÁS PERMISIVA PARA DEMO
   ============================================ */

function initializePaymentInputs() {
    const cardNumber = document.getElementById('cardNumber');
    const cardExpiry = document.getElementById('cardExpiry');
    const cardCvv = document.getElementById('cardCvv');
    const cardName = document.getElementById('cardName');
    
    // Formateo del número de tarjeta
    cardNumber.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });
    
    // Formateo de fecha de vencimiento
    cardExpiry.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });
    
    // Solo números en CVV
    cardCvv.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9]/gi, '');
    });
    
    // Solo letras en nombre
    cardName.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    });
    
    // Manejar métodos de pago
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            // Actualizar estilos visuales
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
            this.closest('.payment-method').classList.add('active');
            
            // Mostrar/ocultar formulario de tarjeta
            const cardForm = document.getElementById('cardForm');
            if (this.value === 'card') {
                cardForm.style.display = 'block';
                ocultarInfoPagoCaja();
            } else if (this.value === 'caja') {
                cardForm.style.display = 'none';
                mostrarInfoPagoCaja();
            } else {
                cardForm.style.display = 'none';
                ocultarInfoPagoCaja();
                showNotification(`💳 ${this.value === 'paypal' ? 'PayPal' : 'MercadoPago'} seleccionado - En modo demo, todos los pagos son exitosos`, 'info');
            }
        });
    });
}

function validatePaymentFormDemo() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    if (selectedMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCvv = document.getElementById('cardCvv').value;
        const cardName = document.getElementById('cardName').value.trim();
        
        // VALIDACIÓN DEMO - MÁS PERMISIVA
        // Si hay datos, validar formato; si no hay datos, permitir continuar
        if (cardNumber.length > 0 && (cardNumber.length < 13 || cardNumber.length > 19)) {
            highlightError('cardNumber');
            return false;
        }
        
        if (cardExpiry.length > 0 && !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
            highlightError('cardExpiry');
            return false;
        }
        
        if (cardCvv.length > 0 && (cardCvv.length < 3 || cardCvv.length > 4)) {
            highlightError('cardCvv');
            return false;
        }
        
        // PERMITIR NOMBRES VACÍOS EN DEMO
        if (cardName.length > 0 && cardName.length < 2) {
            highlightError('cardName');
            return false;
        }
        
        // VALIDAR FECHA SOLO SI SE PROPORCIONA
        if (cardExpiry.length > 0) {
            const [month, year] = cardExpiry.split('/');
            const now = new Date();
            const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
            
            if (expiry <= now) {
                highlightError('cardExpiry');
                return false;
            }
        }
        
        return true;
    }
    
    // Para otros métodos de pago, siempre permitir
    return true;
}

function highlightError(fieldId) {
    const field = document.getElementById(fieldId);
    field.style.borderColor = '#ef4444';
    field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    
    setTimeout(() => {
        field.style.borderColor = '';
        field.style.boxShadow = '';
    }, 3000);
}

function clearPaymentForm() {
    document.getElementById('cardNumber').value = '';
    document.getElementById('cardExpiry').value = '';
    document.getElementById('cardCvv').value = '';
    document.getElementById('cardName').value = '';
    
    // Resetear método de pago a tarjeta
    document.querySelector('input[value="card"]').checked = true;
    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
    document.querySelector('input[value="card"]').closest('.payment-method').classList.add('active');
    document.getElementById('cardForm').style.display = 'block';
}

/* ============================================
   SISTEMA PAGO EN CAJA - FUNCIONES PRINCIPALES
   ============================================ */

function mostrarInfoPagoCaja() {
    // Verificar si ya existe la información, si no, crearla
    let infoCaja = document.querySelector('.pago-caja-info');
    
    if (!infoCaja) {
        infoCaja = document.createElement('div');
        infoCaja.className = 'pago-caja-info';
        infoCaja.innerHTML = `
            <h4>🏪 Información de Pago en Caja</h4>
            <p>Al seleccionar esta opción, generaremos un comprobante con toda la información necesaria para realizar el pago en efectivo en la notaría.</p>
            <ul>
                <li>📋 Recibirás un <span class="highlight">número de servicio único</span></li>
                <li>🏛️ Información completa de la notaría</li>
                <li>🔐 Código de acceso que se libera tras el pago</li>
                <li>📍 Dirección y horarios de atención</li>
            </ul>
            <p><strong>Importante:</strong> El pago debe realizarse dentro de 48 horas para mantener la reserva del servicio.</p>
        `;
        
        // Insertar después del resumen del servicio
        const serviceSummary = document.querySelector('.service-summary');
        serviceSummary.parentNode.insertBefore(infoCaja, serviceSummary.nextSibling);
    }
    
    infoCaja.classList.add('visible');
}

function ocultarInfoPagoCaja() {
    const infoCaja = document.querySelector('.pago-caja-info');
    if (infoCaja) {
        infoCaja.classList.remove('visible');
    }
}

function procesarPagoEnCaja() {
    if (!selectedNotaryInfo) {
        showNotification('❌ Error: No hay notaría seleccionada', 'error');
        return;
    }
    
    // Generar información del pago en caja
    generarPagoEnCaja();
    
    // Mostrar efectos de procesamiento
    mostrarEfectosProcesamiento();
    
    // Cerrar modal de pago y mostrar comprobante
    setTimeout(() => {
        closePaymentModal();
        mostrarComprobantePago();
        
        // Guardar en localStorage para persistencia
        guardarPagoPendiente();
        
        // Registrar para analytics
        trackPagoEnCaja();
        
    }, 2000);
}

function generarPagoEnCaja() {
    const timestamp = Date.now();
    
    pagoEnCaja = {
        numeroServicio: generarNumeroServicio(),
        codigoAcceso: generarCodigoAcceso(),
        fechaGeneracion: new Date().toLocaleString('es-CL'),
        timestamp: timestamp,
        notariaInfo: {
            nombre: selectedNotaryInfo.name,
            notario: extractNotarioName(selectedNotaryInfo.name),
            direccion: getDireccionNotaria(selectedNotaryInfo.name),
            telefono: getTelefonoNotaria(selectedNotaryInfo.name),
            horarios: getHorariosNotaria()
        },
        servicioInfo: {
            nombre: getServiceInfo(currentPayment.service).name,
            descripcion: getServiceInfo(currentPayment.service).description,
            tipo: currentPayment.service
        },
        monto: currentPayment.amount,
        moneda: 'USD',
        estado: 'pendiente',
        validoHasta: new Date(timestamp + 48 * 60 * 60 * 1000).toLocaleString('es-CL'), // 48 horas
        clienteInfo: clientData || generarClienteDemo()
    };
    
    console.log('🏪 Pago en caja generado:', pagoEnCaja);
}

function generarNumeroServicio() {
    const fecha = new Date();
    const year = fecha.getFullYear().toString().slice(-2);
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const day = fecha.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    return `SRV-${year}${month}${day}-${random}`;
}

function generarCodigoAcceso() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function getDireccionNotaria(nombreNotaria) {
    const direcciones = {
        'Novena Notaría de Concepción - San Pedro de la Paz': 'Av. Pedro de Valdivia 1234, San Pedro de la Paz',
        'Primera Notaría de Concepción': 'Barros Arana 567, Centro, Concepción',
        'Segunda Notaría de Concepción': 'Caupolicán 890, Centro, Concepción',
        'Tercera Notaría de Concepción': 'O\'Higgins 432, Centro, Concepción',
        'Primera Notaría de Talcahuano': 'Colón 234, Centro, Talcahuano',
        'Segunda Notaría de Talcahuano': 'Blanco Encalada 567, Centro, Talcahuano',
        'Primera Notaría de Coronel': 'Pedro Aguirre Cerda 123, Centro, Coronel'
    };
    
    return direcciones[nombreNotaria] || 'Dirección a confirmar';
}

function getTelefonoNotaria(nombreNotaria) {
    const telefonos = {
        'Novena Notaría de Concepción - San Pedro de la Paz': '+56 41 234 5678',
        'Primera Notaría de Concepción': '+56 41 234 5679',
        'Segunda Notaría de Concepción': '+56 41 234 5680',
        'Tercera Notaría de Concepción': '+56 41 234 5681',
        'Primera Notaría de Talcahuano': '+56 41 234 5682',
        'Segunda Notaría de Talcahuano': '+56 41 234 5683',
        'Primera Notaría de Coronel': '+56 41 234 5684'
    };
    
    return telefonos[nombreNotaria] || '+56 41 000 0000';
}

function getHorariosNotaria() {
    return {
        lunAVie: '9:00 - 18:00',
        sabado: '9:00 - 13:00',
        domingo: 'Cerrado'
    };
}

function generarClienteDemo() {
    if (!clientData || !clientData.name) {
        generateDemoClientData();
    }
    return clientData;
}

function mostrarEfectosProcesamiento() {
    showNotification('🏪 Generando comprobante de pago en caja...', 'info');
    
    // Efecto visual en el modal
    const paymentContainer = document.querySelector('.payment-container');
    if (paymentContainer) {
        paymentContainer.style.opacity = '0.7';
        paymentContainer.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
            paymentContainer.style.opacity = '1';
            paymentContainer.style.transform = 'scale(1)';
        }, 1500);
    }
}

function mostrarComprobantePago() {
    const modal = document.getElementById('comprobanteModal');
    
    // Llenar información en el comprobante
    document.getElementById('comprobanteServicio').textContent = pagoEnCaja.servicioInfo.nombre;
    document.getElementById('comprobanteNotaria').textContent = pagoEnCaja.notariaInfo.nombre;
    document.getElementById('comprobanteMonto').textContent = `$${pagoEnCaja.monto}`;
    document.getElementById('comprobanteNumero').textContent = pagoEnCaja.numeroServicio;
    document.getElementById('comprobanteDireccion').textContent = pagoEnCaja.notariaInfo.direccion;
    
    // Mostrar código bloqueado inicialmente
    const codigoDisplay = document.getElementById('codigoDisplay');
    codigoDisplay.classList.add('bloqueado');
    codigoDisplay.classList.remove('liberado');
    
    // Mostrar modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Efecto de entrada
    setTimeout(() => {
        modal.querySelector('.comprobante-container').classList.add('bounce-in');
    }, 100);
    
    // Notificación de éxito
    showNotification('✅ ¡Comprobante generado! Ve a la notaría para realizar el pago.', 'success');
    
    console.log('🧾 Comprobante mostrado:', pagoEnCaja);
}

function closeComprobanteModal() {
    const modal = document.getElementById('comprobanteModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    console.log('🧾 Comprobante cerrado');
}

/* ============================================
   UTILIDADES DEL SISTEMA DE PAGO (sin modificar)
   ============================================ */

function detectCardType(cardNumber) {
    const patterns = {
        visa: /^4/,
        mastercard: /^5[1-5]/,
        amex: /^3[47]/,
        discover: /^6(?:011|5)/
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.test(cardNumber)) {
            return type;
        }
    }
    return 'unknown';
}

function updateCardIcon(cardType) {
    const cardIcons = document.querySelector('.card-icons');
    const icons = {
        visa: '💳',
        mastercard: '💳',
        amex: '💳',
        discover: '💳',
        unknown: '💳'
    };
    
    cardIcons.innerHTML = `<span>${icons[cardType] || icons.unknown}</span>`;
}

/* ============================================
   MANEJO DE EVENTOS GLOBALES DEL MODAL (sin modificar)
   ============================================ */

// Prevenir el cierre del modal al hacer clic dentro del contenedor
document.addEventListener('DOMContentLoaded', function() {
    const paymentContainer = document.querySelector('.payment-container');
    if (paymentContainer) {
        paymentContainer.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
});

function trackPagoEnCaja() {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'pago_caja_generado', {
            'event_category': 'Payment',
            'event_label': currentPayment.service,
            'value': currentPayment.amount
        });
    }
    
    console.log('📊 Tracking: Pago en caja generado', {
        servicio: currentPayment.service,
        monto: currentPayment.amount,
        numero: pagoEnCaja.numeroServicio
    });
}

function guardarPagoPendiente() {
    try {
        const pagosPendientes = JSON.parse(localStorage.getItem('pagosPendientes') || '[]');
        pagosPendientes.push(pagoEnCaja);
        localStorage.setItem('pagosPendientes', JSON.stringify(pagosPendientes));
        
        console.log('💾 Pago pendiente guardado:', pagoEnCaja.numeroServicio);
    } catch (error) {
        console.error('❌ Error al guardar pago pendiente:', error);
    }
}