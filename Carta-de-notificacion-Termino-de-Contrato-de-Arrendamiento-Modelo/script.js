// ===== CONFIGURACIÓN INICIAL =====
const formFields = [
    'nombreArrendador', 'rutArrendador',
    'nombreArrendatario', 'rutArrendatario', 'direccionArrendatario', 'comunaArrendatario',
    'direccionInmueble', 'comunaInmueble', 'regionInmueble',
    'fechaContratoOriginal', 'fechaVencimiento', 'fechaCarta'
];

const mesesEspanol = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

// ===== ESTADO DE FIRMAS DIGITALES =====
const firmasEstado = {
    arrendador: false,
    arrendatario: false
};

// ===== FUNCIONES PRINCIPALES =====

/**
 * Actualiza la vista previa del documento en tiempo real
 */
function updatePreview() {
    // Actualizar campos básicos
    formFields.forEach(field => {
        const element = document.getElementById(field);
        const preview = document.getElementById('prev_' + field);
        if (element && preview) {
            preview.textContent = element.value || '_____________';
        }
    });

    // Campos especiales que aparecen múltiples veces
    const nombreArrendatario = document.getElementById('nombreArrendatario').value;
    const prev_nombreArrendatario2 = document.getElementById('prev_nombreArrendatario2');
    if (prev_nombreArrendatario2) {
        prev_nombreArrendatario2.textContent = nombreArrendatario || '_____________';
    }

    // Actualizar campos de firma
    const nombreArrendadorFirma = document.getElementById('prev_nombreArrendadorFirma');
    const rutArrendadorFirma = document.getElementById('prev_rutArrendadorFirma');
    if (nombreArrendadorFirma) {
        nombreArrendadorFirma.textContent = document.getElementById('nombreArrendador').value || '_______________';
    }
    if (rutArrendadorFirma) {
        rutArrendadorFirma.textContent = document.getElementById('rutArrendador').value || '_______________';
    }

    // Actualizar fecha de la carta con formato español
    updateDatePreview();
    
    // Actualizar fecha de vencimiento
    updateVencimientoPreview();
    
    // Actualizar barra de progreso
    updateProgress();
}

/**
 * Actualiza la vista previa de la fecha de la carta en formato legal chileno
 */
function updateDatePreview() {
    const fechaCarta = document.getElementById('fechaCarta').value;
    
    if (fechaCarta) {
        const date = new Date(fechaCarta);
        
        document.getElementById('prev_dia').textContent = date.getDate();
        document.getElementById('prev_mes').textContent = mesesEspanol[date.getMonth()];
        document.getElementById('prev_anio').textContent = date.getFullYear();
    } else {
        document.getElementById('prev_dia').textContent = '__';
        document.getElementById('prev_mes').textContent = '_____';
        document.getElementById('prev_anio').textContent = '____';
    }
}

/**
 * Actualiza la vista previa de la fecha de vencimiento
 */
function updateVencimientoPreview() {
    const fechaVencimiento = document.getElementById('fechaVencimiento').value;
    
    if (fechaVencimiento) {
        const date = new Date(fechaVencimiento);
        
        document.getElementById('prev_diaVencimiento').textContent = date.getDate();
        document.getElementById('prev_mesVencimiento').textContent = mesesEspanol[date.getMonth()];
        document.getElementById('prev_anioVencimiento').textContent = date.getFullYear();
    } else {
        document.getElementById('prev_diaVencimiento').textContent = '__';
        document.getElementById('prev_mesVencimiento').textContent = '_____';
        document.getElementById('prev_anioVencimiento').textContent = '____';
    }
}

/**
 * Actualiza la barra de progreso basada en campos completados
 */
function updateProgress() {
    const totalFields = formFields.length;
    let filledFields = 0;
    
    formFields.forEach(field => {
        const element = document.getElementById(field);
        if (element && element.value.trim() !== '') {
            filledFields++;
        }
    });
    
    // Considerar firma digital en el progreso (solo arrendador)
    const signatureStatus = getSignatureStatus();
    let signatureBonus = 0;
    if (signatureStatus.arrendadorFirmado) signatureBonus += 1;
    
    const progress = ((filledFields + signatureBonus) / (totalFields + 1)) * 100;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
    
    if (progressText) {
        progressText.textContent = `Completado: ${Math.round(progress)}%`;
    }
}

/**
 * Valida que todos los campos estén completados
 * @returns {Array} Array de campos vacíos
 */
function validateForm() {
    const emptyFields = [];
    
    formFields.forEach(field => {
        const element = document.getElementById(field);
        if (!element || !element.value.trim()) {
            emptyFields.push(field);
        }
    });
    
    return emptyFields;
}

/**
 * Limpia todos los campos del formulario
 */
function clearForm() {
    showConfirmDialog(
        '¿Está seguro de que desea limpiar todos los campos?',
        'Esta acción también removerá las firmas digitales y no se puede deshacer.',
        () => {
            formFields.forEach(field => {
                const element = document.getElementById(field);
                if (element) {
                    element.value = '';
                    element.classList.remove('rut-valid', 'rut-invalid');
                }
            });
            
            // Resetear firmas
            resetSignatures();
            
            updatePreview();
            showNotification('Formulario y firmas limpiados correctamente', 'info');
        }
    );
}

/**
 * Genera y descarga el PDF con todos los datos del formulario
 */
function generatePDF() {
    // Mostrar indicador de carga
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Generando PDF...</span>';
    btn.disabled = true;

    // Validar formulario y firmas
    const validation = validateFormWithSignatures();
    
    if (!validation.valid) {
        showNotification(`Antes de generar el PDF: ${validation.issues.join('. ')}`, 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
        return;
    }

    try {
        // Crear instancia de jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Configurar documento
        setupPDFDocument(doc);
        
        // Agregar contenido al PDF
        addPDFContent(doc);
        
        // Generar nombre de archivo único
        const fileName = generateFileName();
        
        // Simular tiempo de procesamiento para mejor UX
        setTimeout(() => {
            // Descargar PDF
            doc.save(fileName);
            
            // Mostrar mensaje de éxito
            showNotification('¡PDF con firma digital generado exitosamente!', 'success');
            
            // Restaurar botón
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 1500);
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        showNotification('Error al generar el PDF. Por favor intente nuevamente.', 'error');
        
        // Restaurar botón
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

/**
 * Configura las propiedades básicas del documento PDF
 * @param {jsPDF} doc - Instancia del documento PDF
 */
function setupPDFDocument(doc) {
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
}

/**
 * Agrega todo el contenido al documento PDF
 * @param {jsPDF} doc - Instancia del documento PDF
 */
function addPDFContent(doc) {
    let y = 30;
    const pageWidth = 190;
    const margin = 20;

    // Fecha y lugar
    const fechaCarta = new Date(document.getElementById('fechaCarta').value);
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.text(`Santiago, ${fechaCarta.getDate()} de ${mesesEspanol[fechaCarta.getMonth()]} de ${fechaCarta.getFullYear()}`, margin, y);
    y += 20;

    // Destinatario
    doc.setFont('times', 'bold');
    doc.text(`Nombre de Arrendatario: ${document.getElementById('nombreArrendatario').value}`, margin, y);
    y += 8;
    doc.setFont('times', 'normal');
    doc.text(`Dirección Arrendatario: ${document.getElementById('direccionArrendatario').value}`, margin, y);
    y += 8;
    doc.text(`Comuna: ${document.getElementById('comunaArrendatario').value}`, margin, y);
    y += 8;
    doc.setFont('times', 'bold');
    doc.text('PRESENTE', margin, y);
    y += 25;

    // Título del documento
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text('CARTA DE NO RENOVACIÓN DE CONTRATO DE ARRENDAMIENTO', 105, y, { align: 'center' });
    y += 25;

    // Contenido principal
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    
    const fechaContrato = document.getElementById('fechaContratoOriginal').value;
    const fechaVencimiento = new Date(document.getElementById('fechaVencimiento').value);
    
    const contenidoPrincipal = `Nombre Arrendador: ${document.getElementById('nombreArrendador').value}, chilena, cédula nacional de identidad N° ${document.getElementById('rutArrendador').value} en su calidad de arrendadora respecto del inmueble de su propiedad, ubicado en ${document.getElementById('direccionInmueble').value}, comuna de ${document.getElementById('comunaInmueble').value}, Región ${document.getElementById('regionInmueble').value}, según consta en Contrato de Arrendamiento de fecha ${fechaContrato}, suscrito con don Arrendatario ${document.getElementById('nombreArrendatario').value}, cédula nacional de identidad N° ${document.getElementById('rutArrendatario').value}, en calidad de arrendatario, venimos en comunicar lo siguiente:`;
    
    const splitPrincipal = doc.splitTextToSize(contenidoPrincipal, pageWidth - 2 * margin);
    doc.text(splitPrincipal, margin, y);
    y += splitPrincipal.length * 5 + 15;

    // Párrafo de no renovación
    const parrafoNoRenovacion = `Que, en virtud de lo establecido en la Cláusula Tercera del Contrato de Arrendamiento referido, manifestamos al arrendatario, y con la anticipación establecida en ella, nuestra intención expresa de no renovar, automática y tácitamente, dicho Contrato para el período siguiente de un año. Por lo anterior, el arrendatario deberá restituir el inmueble en los términos estipulados en la Cláusula Duodécima, en la fecha acordada como término del Contrato, es decir, en el plazo que vence el día ${fechaVencimiento.getDate()} de ${mesesEspanol[fechaVencimiento.getMonth()]} del año ${fechaVencimiento.getFullYear()}.`;
    
    const splitNoRenovacion = doc.splitTextToSize(parrafoNoRenovacion, pageWidth - 2 * margin);
    doc.text(splitNoRenovacion, margin, y);
    y += splitNoRenovacion.length * 5 + 15;

    // Párrafo de visitas
    const parrafoVisitas = 'Asimismo, se comunica que, previa coordinación entre las partes, se deberá permitir el ingreso a la PARTE ARRENDADORA al menos una vez a la semana para efectos de proceder a mostrar el inmueble por motivos de venta.';
    
    const splitVisitas = doc.splitTextToSize(parrafoVisitas, pageWidth - 2 * margin);
    doc.text(splitVisitas, margin, y);
    y += splitVisitas.length * 5 + 50;

    // Sección de firma
    addSignatureSection(doc, y);
    
    // Marca de agua digital
    addDigitalWatermark(doc);
}

/**
 * Agrega las líneas de firma al PDF
 */
function addSignatureSection(doc, y) {
    // Línea de firma del arrendador (centrada)
    doc.line(50, y, 150, y);
    y += 8;
    
    // Nombre con nueva posición centrada
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text(document.getElementById('nombreArrendador').value, 100, y, { align: 'center' });
    y += 6;
    
    // RUT
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.text(`RUT: ${document.getElementById('rutArrendador').value}`, 100, y, { align: 'center' });
    
    // Agregar firma digital si está disponible
    if (window.firmaProcessor) {
        try {
            const firmaArrendador = window.firmaProcessor.getSignatureForPDF('arrendador');
            
            console.log('🔍 Estado firmas:', {
                arrendador: !!firmaArrendador
            });
            
            // Agregar firma del arrendador centrada
            if (firmaArrendador) {
                doc.addImage(firmaArrendador, 'PNG', 50, y - 35, 100, 25);
                console.log('✅ Firma del arrendador agregada al PDF');
            }
            
            if (firmaArrendador) {
                // Agregar nota de firma digital
                doc.setFont('times', 'italic');
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text('Documento con firma digital aplicada', 105, y + 15, { align: 'center' });
                doc.setTextColor(0, 0, 0);
                console.log('✅ Nota de firma digital agregada');
            }
        } catch (error) {
            console.error('❌ Error agregando firma digital al PDF:', error);
        }
    }
    
    // Agregar indicador de firma digital si está firmado (fallback)
    const signatureStatus = getSignatureStatus();
    if (signatureStatus.arrendadorFirmado) {
        y += 10;
        doc.setFont('times', 'italic');
        doc.setFontSize(8);
        doc.text('Firmado Digitalmente', 100, y, { align: 'center' });
    }
}

/**
 * Agrega marca de agua digital al PDF
 */
function addDigitalWatermark(doc) {
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Documento firmado digitalmente - Notaría Online Chile', 105, 280, { align: 'center' });
    doc.text(`Generado el ${new Date().toLocaleString('es-CL')}`, 105, 285, { align: 'center' });
    doc.setTextColor(0, 0, 0);
}

/**
 * Genera un nombre único para el archivo PDF
 */
function generateFileName() {
    const nombreArrendador = document.getElementById('nombreArrendador').value
        .replace(/\s+/g, '_')
        .replace(/[^\w\-]/g, '');
    const timestamp = new Date().toISOString().slice(0, 10);
    return `Carta_No_Renovacion_${nombreArrendador}_${timestamp}.pdf`;
}

// ===== FUNCIONALIDAD FIRMA DIGITAL =====

/**
 * Inicializa los event listeners para los botones de firma digital
 */
function initializeDigitalSignature() {
    const btnFirmaArrendador = document.getElementById('firmaArrendador');
    
    if (btnFirmaArrendador) {
        btnFirmaArrendador.addEventListener('click', () => {
            toggleDigitalSignature('arrendador');
        });
    }
}

/**
 * Alterna el estado de firma digital
 * @param {string} tipo - 'arrendador' o 'arrendatario'
 */
function toggleDigitalSignature(tipo) {
    const button = document.getElementById(`firma${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    const nombreField = document.getElementById(`nombre${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    
    if (!button || !nombreField) return;
    
    // Verificar que el nombre esté completado
    if (!nombreField.value.trim()) {
        showNotification('Complete el nombre antes de firmar digitalmente', 'warning');
        return;
    }
    
    // Alternar estado
    firmasEstado[tipo] = !firmasEstado[tipo];
    
    if (firmasEstado[tipo]) {
        // Marcar como firmado
        button.classList.add('signed');
        button.querySelector('.signature-text').textContent = 'FIRMADO DIGITALMENTE';
        showNotification(`Firma digital de ${tipo} aplicada correctamente`, 'success');
    } else {
        // Marcar como no firmado
        button.classList.remove('signed');
        button.querySelector('.signature-text').textContent = 'FIRMA DIGITAL';
        showNotification(`Firma digital de ${tipo} removida`, 'info');
    }
    
    // Actualizar progreso
    updateProgress();
}

/**
 * Obtiene el estado de las firmas para validación
 * @returns {Object} Estado actual de las firmas
 */
function getSignatureStatus() {
    return {
        arrendadorFirmado: firmasEstado.arrendador,
        arrendatarioFirmado: false, // No se requiere para este documento
        todasFirmadas: firmasEstado.arrendador // Solo se requiere firma del arrendador
    };
}

/**
 * Resetea el estado de las firmas
 */
function resetSignatures() {
    firmasEstado.arrendador = false;
    firmasEstado.arrendatario = false;
    
    const btnArrendador = document.getElementById('firmaArrendador');
    
    if (btnArrendador) {
        btnArrendador.classList.remove('signed');
        btnArrendador.querySelector('.signature-text').textContent = 'FIRMA DIGITAL';
    }
}

/**
 * Modifica la validación para incluir firmas digitales
 */
function validateFormWithSignatures() {
    const emptyFields = validateForm();
    const signatureStatus = getSignatureStatus();
    
    const issues = [];
    
    if (emptyFields.length > 0) {
        issues.push(`Complete ${emptyFields.length} campos faltantes`);
    }
    
    if (!signatureStatus.arrendadorFirmado) {
        issues.push('Falta firma digital del Arrendador');
    }
    
    return {
        valid: issues.length === 0,
        issues: issues
    };
}

/**
 * Muestra notificaciones elegantes al usuario
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">${getNotificationIcon(type)}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    // Estilos elegantes
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '20px',
        borderRadius: '16px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: '9999',
        opacity: '0',
        transform: 'translateX(400px)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        minWidth: '300px',
        maxWidth: '400px'
    });
    
    // Colores según el tipo
    const backgrounds = {
        success: 'linear-gradient(135deg, #48bb78, #38a169)',
        error: 'linear-gradient(135deg, #f56565, #e53e3e)',
        info: 'linear-gradient(135deg, #4299e1, #3182ce)',
        warning: 'linear-gradient(135deg, #ed8936, #dd6b20)'
    };
    
    notification.style.background = backgrounds[type] || backgrounds.info;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, 4000);
}

/**
 * Obtiene el icono para las notificaciones
 */
function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    return icons[type] || icons.info;
}

/**
 * Muestra un diálogo de confirmación elegante
 */
function showConfirmDialog(title, message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    overlay.innerHTML = `
        <div class="dialog-content">
            <div class="dialog-header">
                <h3>${title}</h3>
            </div>
            <div class="dialog-body">
                <p>${message}</p>
            </div>
            <div class="dialog-actions">
                <button class="dialog-btn dialog-btn-cancel">Cancelar</button>
                <button class="dialog-btn dialog-btn-confirm">Confirmar</button>
            </div>
        </div>
    `;
    
    // Estilos del overlay
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '10000',
        opacity: '0',
        transition: 'opacity 0.3s ease',
        backdropFilter: 'blur(10px)'
    });
    
    // Agregar estilos CSS para el diálogo
    const style = document.createElement('style');
    style.textContent = `
        .dialog-content {
            background: linear-gradient(135deg, #2d3748, #4a5568);
            border-radius: 16px;
            padding: 32px;
            max-width: 400px;
            width: 90%;
            color: white;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        .dialog-overlay[data-visible="true"] .dialog-content {
            transform: scale(1);
        }
        .dialog-header h3 {
            margin: 0 0 16px 0;
            font-size: 1.25rem;
            font-weight: 600;
        }
        .dialog-body p {
            margin: 0 0 24px 0;
            color: #cbd5e0;
            line-height: 1.5;
        }
        .dialog-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }
        .dialog-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .dialog-btn-cancel {
            background: #718096;
            color: white;
        }
        .dialog-btn-cancel:hover {
            background: #4a5568;
        }
        .dialog-btn-confirm {
            background: linear-gradient(135deg, #3182ce, #4299e1);
            color: white;
        }
        .dialog-btn-confirm:hover {
            background: linear-gradient(135deg, #2c5282, #3182ce);
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(overlay);
    
    // Animar entrada
    setTimeout(() => {
        overlay.style.opacity = '1';
        overlay.setAttribute('data-visible', 'true');
    }, 10);
    
    // Event listeners
    overlay.querySelector('.dialog-btn-cancel').addEventListener('click', () => {
        closeDialog();
    });
    
    overlay.querySelector('.dialog-btn-confirm').addEventListener('click', () => {
        onConfirm();
        closeDialog();
    });
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeDialog();
        }
    });
    
    function closeDialog() {
        overlay.style.opacity = '0';
        overlay.removeAttribute('data-visible');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
                document.head.removeChild(style);
            }
        }, 300);
    }
}

/**
 * Formatea el RUT chileno automáticamente
 */
function formatRUT(rut) {
    rut = rut.replace(/[^0-9kK]/g, '');
    
    if (rut.length < 2) return rut;
    
    const dv = rut.slice(-1);
    const numbers = rut.slice(0, -1);
    const formattedNumbers = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${formattedNumbers}-${dv}`;
}

/**
 * Valida formato de RUT chileno
 */
function validateRUT(rut) {
    const cleanRUT = rut.replace(/[^0-9kK]/g, '');
    
    if (cleanRUT.length < 8 || cleanRUT.length > 9) return false;
    
    const dv = cleanRUT.slice(-1).toLowerCase();
    const numbers = cleanRUT.slice(0, -1);
    
    let sum = 0;
    let multiplier = 2;
    
    for (let i = numbers.length - 1; i >= 0; i--) {
        sum += parseInt(numbers[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    
    const expectedDV = 11 - (sum % 11);
    const finalDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'k' : expectedDV.toString();
    
    return dv === finalDV;
}

/**
 * Guarda el estado del formulario automáticamente
 */
function saveFormState() {
    const data = {};
    formFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            data[field] = element.value;
        }
    });
    
    // Incluir estado de firmas
    data.firmasEstado = firmasEstado;
    
    try {
        localStorage.setItem('notariaOnlineForm', JSON.stringify(data));
    } catch (error) {
        console.warn('No se pudo guardar el formulario automáticamente');
    }
}

/**
 * Restaura el estado del formulario
 */
function restoreFormState() {
    try {
        const savedData = localStorage.getItem('notariaOnlineForm');
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(field => {
                if (field === 'firmasEstado') {
                    // Restaurar estado de firmas
                    if (data.firmasEstado) {
                        firmasEstado.arrendador = data.firmasEstado.arrendador || false;
                        
                        // Actualizar botones de firma
                        updateSignatureButtons();
                    }
                } else {
                    const element = document.getElementById(field);
                    if (element && data[field]) {
                        element.value = data[field];
                    }
                }
            });
            updatePreview();
            showNotification('Formulario restaurado desde guardado automático', 'info');
        }
    } catch (error) {
        console.warn('No se pudo restaurar el formulario automático');
    }
}

/**
 * Actualiza la apariencia de los botones de firma según el estado
 */
function updateSignatureButtons() {
    const btnArrendador = document.getElementById('firmaArrendador');
    
    if (btnArrendador) {
        if (firmasEstado.arrendador) {
            btnArrendador.classList.add('signed');
            btnArrendador.querySelector('.signature-text').textContent = 'FIRMADO DIGITALMENTE';
        } else {
            btnArrendador.classList.remove('signed');
            btnArrendador.querySelector('.signature-text').textContent = 'FIRMA DIGITAL';
        }
    }
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners para actualizar vista previa
    formFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', updatePreview);
            element.addEventListener('change', updatePreview);
        }
    });
    
    // Event listeners para campos de RUT
    const rutFields = ['rutArrendador', 'rutArrendatario'];
    rutFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', function(e) {
                const formatted = formatRUT(e.target.value);
                e.target.value = formatted;
                
                if (formatted.length > 8) {
                    const isValid = validateRUT(formatted);
                    e.target.classList.toggle('rut-valid', isValid);
                    e.target.classList.toggle('rut-invalid', !isValid);
                } else {
                    e.target.classList.remove('rut-valid', 'rut-invalid');
                }
                
                updatePreview();
            });
        }
    });
    
    // Inicializar firma digital
    initializeDigitalSignature();
    
    // Auto-save cada 30 segundos
    setInterval(saveFormState, 30000);
    
    // Prevenir envío del formulario con Enter
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    });
    
    // Establecer fecha actual por defecto en fecha de carta
    const fechaCartaField = document.getElementById('fechaCarta');
    if (fechaCartaField && !fechaCartaField.value) {
        const today = new Date();
        fechaCartaField.value = today.toISOString().split('T')[0];
    }
    
    // Inicializar vista previa
    updatePreview();
    
    // Restaurar formulario guardado
    restoreFormState();
    
    console.log('Sistema de Carta de No Renovación con Firma Digital inicializado correctamente');
});