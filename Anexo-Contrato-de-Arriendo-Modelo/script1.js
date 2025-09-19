// ========================================
// 🟢 SCRIPT 1 - FUNCIONES PRINCIPALES Y FORMULARIO
// ========================================

// ===== CONFIGURACIÓN INICIAL =====
const formFields = [
    'nombreArrendador', 'nacionalidadArrendador', 'estadoCivilArrendador', 'profesionArrendador', 
    'rutArrendador', 'ciudadArrendador', 'domicilioArrendador', 'comunaArrendador',
    'nombreArrendatario', 'nacionalidadArrendatario', 'estadoCivilArrendatario', 'profesionArrendatario',
    'rutArrendatario', 'ciudadArrendatario', 'domicilioArrendatario', 'comunaArrendatario',
    'fechaContrato', 'fechaAnexo', 'direccionInmueble', 'clausulaIncluir'
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

// ===== ESTADO DE FOTOS CARNET DOBLE =====
const fotosCarnet = {
    arrendador: {
        frente: { captured: false, imageData: null, timestamp: null },
        reverso: { captured: false, imageData: null, timestamp: null },
        completed: false
    },
    arrendatario: {
        frente: { captured: false, imageData: null, timestamp: null },
        reverso: { captured: false, imageData: null, timestamp: null },
        completed: false
    }
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

    // Actualizar fecha del anexo con formato español
    updateDatePreview();
    
    // Actualizar nombres en las firmas
    updateSignatureNames();
    
    // Actualizar barra de progreso
    updateProgress();
}

/**
 * Actualiza la vista previa de la fecha en formato legal chileno
 */
function updateDatePreview() {
    const fechaAnexo = document.getElementById('fechaAnexo').value;
    const ciudadArrendador = document.getElementById('ciudadArrendador').value;
    
    if (fechaAnexo) {
        const date = new Date(fechaAnexo);
        
        document.getElementById('prev_dia').textContent = date.getDate();
        document.getElementById('prev_mes').textContent = mesesEspanol[date.getMonth()];
        document.getElementById('prev_anio').textContent = date.getFullYear();
        document.getElementById('prev_ciudad').textContent = ciudadArrendador || '_____';
    } else {
        document.getElementById('prev_dia').textContent = '___';
        document.getElementById('prev_mes').textContent = '_____';
        document.getElementById('prev_anio').textContent = '____';
        document.getElementById('prev_ciudad').textContent = '_____';
    }
}

/**
 * Actualiza los nombres en las líneas de firma
 */
function updateSignatureNames() {
    const nombreArrendador = document.getElementById('nombreArrendador').value;
    const nombreArrendatario = document.getElementById('nombreArrendatario').value;
    
    document.getElementById('prev_firmaArrendador').textContent = 
        nombreArrendador || '_______________';
    document.getElementById('prev_firmaArrendatario').textContent = 
        nombreArrendatario || '_______________';
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
    
    // Considerar firmas digitales y fotos carnet en el progreso con verificación defensiva
    const signatureStatus = getSignatureStatus() || { arrendadorFirmado: false, arrendatarioFirmado: false };
    const photoStatus = getPhotoStatus() || { arrendadorCompleto: false, arrendatarioCompleto: false };
    let bonusScore = 0;
    
    // Firmas (0.3 cada una)
    if (signatureStatus.arrendadorFirmado) bonusScore += 0.3;
    if (signatureStatus.arrendatarioFirmado) bonusScore += 0.3;
    
    // Fotos carnet completas (0.4 cada una - más peso por ser dobles)
    if (photoStatus.arrendadorCompleto) bonusScore += 0.4;
    if (photoStatus.arrendatarioCompleto) bonusScore += 0.4;
    
    const progress = ((filledFields + bonusScore) / (totalFields + 1.4)) * 100;
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
        'Esta acción también removerá las firmas digitales y fotos de carnet, y no se puede deshacer.',
        () => {
            formFields.forEach(field => {
                const element = document.getElementById(field);
                if (element) {
                    element.value = '';
                    element.classList.remove('rut-valid', 'rut-invalid');
                }
            });
            
            // Resetear firmas y fotos
            resetSignatures();
            resetPhotoCarnet();
            
            updatePreview();
            showNotification('Formulario, firmas y fotos limpiados correctamente', 'info');
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
            showNotification('¡PDF con firmas digitales generado exitosamente!', 'success');
            
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

    // Título del documento
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.text('ANEXO DE CONTRATO', 105, y, { align: 'center' });
    y += 8;
    
    doc.setFontSize(12);
    doc.text('Documento Legal Oficial', 105, y, { align: 'center' });
    y += 20;

    // Párrafo introductorio
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    
    const introText = generateIntroText();
    const splitIntro = doc.splitTextToSize(introText, pageWidth - 2 * margin);
    doc.text(splitIntro, margin, y);
    y += splitIntro.length * 5 + 15;

    // Cláusula PRIMERO
    y = addClausePrimero(doc, y, pageWidth, margin);
    
    // Cláusula SEGUNDO
    y = addClauseSegundo(doc, y, pageWidth, margin);
    
    // Cláusula TERCERO
    y = addClauseTercero(doc, y, pageWidth, margin);
    
    // Sección de firmas
    addSignatureSection(doc, y);
    
    // Marca de agua digital
    addDigitalWatermark(doc);
}

/**
 * Genera el texto introductorio del documento
 * @returns {string} Texto introductorio completo
 */
function generateIntroText() {
    const fechaAnexo = new Date(document.getElementById('fechaAnexo').value);
    
    return `En ${document.getElementById('ciudadArrendador').value} de Chile, a ${fechaAnexo.getDate()} de ${mesesEspanol[fechaAnexo.getMonth()]} del año ${fechaAnexo.getFullYear()}, entre: don(ña) ${document.getElementById('nombreArrendador').value}, ${document.getElementById('nacionalidadArrendador').value}, ${document.getElementById('estadoCivilArrendador').value}, ${document.getElementById('profesionArrendador').value}, cédula de identidad N° ${document.getElementById('rutArrendador').value}, con domicilio en ${document.getElementById('domicilioArrendador').value}, comuna de ${document.getElementById('comunaArrendador').value}, ${document.getElementById('ciudadArrendador').value} (en adelante, el "Arrendador"); por una parte y por la otra don(ña) ${document.getElementById('nombreArrendatario').value}, ${document.getElementById('nacionalidadArrendatario').value}, ${document.getElementById('estadoCivilArrendatario').value}, ${document.getElementById('profesionArrendatario').value}, cédula de identidad N° ${document.getElementById('rutArrendatario').value}, con domicilio en ${document.getElementById('domicilioArrendatario').value}, comuna de ${document.getElementById('comunaArrendatario').value}, ${document.getElementById('ciudadArrendatario').value} (en adelante, el "Arrendatario", y conjuntamente con el Arrendador, las "Partes", e individualmente la "Parte"); exponen que han convenido el siguiente anexo de contrato conforme a las estipulaciones que a continuación se indican:`;
}

/**
 * Agrega la cláusula PRIMERO al PDF
 */
function addClausePrimero(doc, y, pageWidth, margin) {
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text('PRIMERO: Antecedentes.', margin, y);
    y += 10;
    
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    const antecedentesText = `Las Partes declaran y dejan constancia que con fecha ${document.getElementById('fechaContrato').value} celebraron un contrato de arrendamiento por el inmueble ubicado en ${document.getElementById('direccionInmueble').value} (en adelante, el "Contrato").`;
    const splitAntecedentes = doc.splitTextToSize(antecedentesText, pageWidth - 2 * margin);
    doc.text(splitAntecedentes, margin, y);
    
    return y + splitAntecedentes.length * 5 + 15;
}

/**
 * Agrega la cláusula SEGUNDO al PDF
 */
function addClauseSegundo(doc, y, pageWidth, margin) {
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text('SEGUNDO: Objeto.', margin, y);
    y += 10;
    
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.text('Por el presente acto, las Partes acuerdan incluir al Contrato la siguiente cláusula:', margin, y);
    y += 12;
    
    const clausulaText = document.getElementById('clausulaIncluir').value;
    const splitClausula = doc.splitTextToSize(clausulaText, pageWidth - 2 * margin);
    doc.text(splitClausula, margin, y);
    
    return y + splitClausula.length * 5 + 15;
}

/**
 * Agrega la cláusula TERCERO al PDF
 */
function addClauseTercero(doc, y, pageWidth, margin) {
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text('TERCERO: Otorgamiento.', margin, y);
    y += 10;
    
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.text('El presente instrumento se firma en dos ejemplares, quedando uno en poder de cada parte.', margin, y);
    
    return y + 50;
}

/**
 * ✅ FUNCIÓN ÚNICA DE FIRMAS - SIN DUPLICACIONES
 * Agrega las líneas de firma al PDF con firmas digitales
 */
function addSignatureSection(doc, y) {
    console.log('📄 Ejecutando addSignatureSection - VERSIÓN ÚNICA Y LIMPIA');
    
    // ===== LÍNEAS DE FIRMA =====
    doc.line(25, y, 100, y);
    doc.line(120, y, 195, y);
    y += 8;
    
    // ===== NOMBRES =====
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text(document.getElementById('nombreArrendador').value, 62.5, y, { align: 'center' });
    doc.text(document.getElementById('nombreArrendatario').value, 157.5, y, { align: 'center' });
    y += 6;
    
    // ===== ETIQUETAS =====
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.text('Arrendador', 62.5, y, { align: 'center' });
    doc.text('Arrendatario', 157.5, y, { align: 'center' });
    
    // ===== FIRMAS DIGITALES - UNA SOLA VEZ =====
    if (window.firmaProcessor) {
        try {
            const firmaArrendador = window.firmaProcessor.getSignatureForPDF('arrendador');
            const firmaArrendatario = window.firmaProcessor.getSignatureForPDF('arrendatario');
            
            console.log('🔍 Estado firmas para PDF:', {
                arrendador: !!firmaArrendador,
                arrendatario: !!firmaArrendatario
            });
            
            // Agregar firma del arrendador (UNA SOLA VEZ)
            if (firmaArrendador) {
                doc.addImage(firmaArrendador, 'PNG', 25, y - 45, 75, 35);
                console.log('✅ Firma del arrendador agregada al PDF');
            }
            
            // Agregar firma del arrendatario (UNA SOLA VEZ)
            if (firmaArrendatario) {
                doc.addImage(firmaArrendatario, 'PNG', 120, y - 45, 75, 35);
                console.log('✅ Firma del arrendatario agregada al PDF');
            }
            
            // Agregar nota solo si ambas firmas están presentes
            if (firmaArrendador && firmaArrendatario) {
                doc.setFont('times', 'italic');
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text('Documento con firmas digitales aplicadas', 105, y + 15, { align: 'center' });
                doc.setTextColor(0, 0, 0);
                console.log('✅ Nota de firmas digitales agregada');
            }
        } catch (error) {
            console.error('❌ Error agregando firmas digitales al PDF:', error);
        }
    } else {
        console.warn('⚠️ firmaProcessor no disponible para PDF');
        
        // ===== FALLBACK - Indicadores de firma digital tradicionales =====
        const signatureStatus = getSignatureStatus();
        if (signatureStatus.arrendadorFirmado || signatureStatus.arrendatarioFirmado) {
            y += 10;
            doc.setFont('times', 'italic');
            doc.setFontSize(8);
            
            if (signatureStatus.arrendadorFirmado) {
                doc.text('Firmado Digitalmente', 62.5, y, { align: 'center' });
            }
            if (signatureStatus.arrendatarioFirmado) {
                doc.text('Firmado Digitalmente', 157.5, y, { align: 'center' });
            }
        }
    }
    
    console.log('✅ addSignatureSection completado SIN duplicaciones');
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
    return `Anexo_Contrato_${nombreArrendador}_${timestamp}.pdf`;
}

// ===== FUNCIONALIDAD FIRMA DIGITAL =====

/**
 * Inicializa los event listeners para los botones de firma digital
 */
function initializeDigitalSignature() {
    const btnFirmaArrendador = document.getElementById('firmaArrendador');
    const btnFirmaArrendatario = document.getElementById('firmaArrendatario');
    
    if (btnFirmaArrendador) {
        btnFirmaArrendador.addEventListener('click', () => {
            toggleDigitalSignature('arrendador');
        });
    }
    
    if (btnFirmaArrendatario) {
        btnFirmaArrendatario.addEventListener('click', () => {
            toggleDigitalSignature('arrendatario');
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
    // Verificar si hay firmas digitales del procesador
    if (window.firmaProcessor) {
        const firmaArrendador = window.firmaProcessor.getSignatureForPDF('arrendador');
        const firmaArrendatario = window.firmaProcessor.getSignatureForPDF('arrendatario');
        
        return {
            arrendadorFirmado: !!firmaArrendador || firmasEstado.arrendador,
            arrendatarioFirmado: !!firmaArrendatario || firmasEstado.arrendatario,
            todasFirmadas: (!!firmaArrendador || firmasEstado.arrendador) && (!!firmaArrendatario || firmasEstado.arrendatario)
        };
    }
    
    // Fallback al estado tradicional
    return {
        arrendadorFirmado: firmasEstado.arrendador,
        arrendatarioFirmado: firmasEstado.arrendatario,
        todasFirmadas: firmasEstado.arrendador && firmasEstado.arrendatario
    };
}

/**
 * Resetea el estado de las firmas
 */
function resetSignatures() {
    firmasEstado.arrendador = false;
    firmasEstado.arrendatario = false;
    
    const btnArrendador = document.getElementById('firmaArrendador');
    const btnArrendatario = document.getElementById('firmaArrendatario');
    
    if (btnArrendador) {
        btnArrendador.classList.remove('signed');
        btnArrendador.querySelector('.signature-text').textContent = 'FIRMA DIGITAL';
    }
    
    if (btnArrendatario) {
        btnArrendatario.classList.remove('signed');
        btnArrendatario.querySelector('.signature-text').textContent = 'FIRMA DIGITAL';
    }
    
    // Limpiar firmas del procesador si existe
    if (window.firmaProcessor && typeof window.firmaProcessor.clearSignatures === 'function') {
        window.firmaProcessor.clearSignatures();
    }
}

// ===== FUNCIONALIDAD FOTO CARNET DOBLE =====

/**
 * Inicializa los botones de foto carnet
 */
function initializePhotoCarnet() {
    const btnPhotoArrendador = document.getElementById('photoArrendador');
    const btnPhotoArrendatario = document.getElementById('photoArrendatario');
    
    if (btnPhotoArrendador) {
        btnPhotoArrendador.addEventListener('click', () => {
            handlePhotoCarnet('arrendador');
        });
    }
    
    if (btnPhotoArrendatario) {
        btnPhotoArrendatario.addEventListener('click', () => {
            handlePhotoCarnet('arrendatario');
        });
    }
    
    console.log('📷 Botones de foto carnet doble inicializados');
}

/**
 * Maneja la funcionalidad de foto carnet - NUEVA VERSIÓN DOBLE
 * @param {string} tipo - 'arrendador' o 'arrendatario'
 */
function handlePhotoCarnet(tipo) {
    console.log(`📷 Iniciando captura de carnet completo para: ${tipo}`);
    
    if (window.photoProcessor) {
        window.photoProcessor.openModal(tipo);
    } else {
        showNotification('Sistema de foto carnet no disponible', 'error');
    }
}

/**
 * Obtiene el estado de las fotos carnet
 * @returns {Object} Estado actual de las fotos
 */
function getPhotoStatus() {
    // Verificación defensiva para evitar errores
    const arrendadorState = fotosCarnet.arrendador || {
        frente: { captured: false, imageData: null, timestamp: null },
        reverso: { captured: false, imageData: null, timestamp: null },
        completed: false
    };
    
    const arrendatarioState = fotosCarnet.arrendatario || {
        frente: { captured: false, imageData: null, timestamp: null },
        reverso: { captured: false, imageData: null, timestamp: null },
        completed: false
    };
    
    return {
        arrendadorCompleto: arrendadorState.completed || false,
        arrendatarioCompleto: arrendatarioState.completed || false,
        todosCompletos: (arrendadorState.completed || false) && (arrendatarioState.completed || false),
        
        // Estados parciales para información adicional
        arrendadorFrente: arrendadorState.frente?.captured || false,
        arrendadorReverso: arrendadorState.reverso?.captured || false,
        arrendatarioFrente: arrendatarioState.frente?.captured || false,
        arrendatarioReverso: arrendatarioState.reverso?.captured || false
    };
}

/**
 * Resetea el estado de las fotos (para la función clearForm)
 */
function resetPhotoCarnet() {
    if (window.photoProcessor) {
        window.photoProcessor.clearAllPhotos();
    } else {
        // Asegurar inicialización completa del estado
        fotosCarnet.arrendador = {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        };
        fotosCarnet.arrendatario = {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        };
        
        // Actualizar botones
        updatePhotoButtons();
    }
    
    console.log('📷 Estado de fotos carnet doble reseteado');
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
    
    if (!signatureStatus.todasFirmadas) {
        const firmasFaltantes = [];
        if (!signatureStatus.arrendadorFirmado) firmasFaltantes.push('Arrendador');
        if (!signatureStatus.arrendatarioFirmado) firmasFaltantes.push('Arrendatario');
        issues.push(`Falta firma digital de: ${firmasFaltantes.join(', ')}`);
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
    
    // Incluir estado de firmas y fotos con verificación defensiva
    data.firmasEstado = firmasEstado;
    
    // Asegurar que fotosCarnet esté completamente inicializado antes de guardar
    if (fotosCarnet && fotosCarnet.arrendador && fotosCarnet.arrendatario) {
        data.fotosCarnet = fotosCarnet;
    } else {
        // Inicialización por defecto si el estado está corrupto
        data.fotosCarnet = {
            arrendador: {
                frente: { captured: false, imageData: null, timestamp: null },
                reverso: { captured: false, imageData: null, timestamp: null },
                completed: false
            },
            arrendatario: {
                frente: { captured: false, imageData: null, timestamp: null },
                reverso: { captured: false, imageData: null, timestamp: null },
                completed: false
            }
        };
    }
    
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
                        firmasEstado.arrendatario = data.firmasEstado.arrendatario || false;
                        
                        // Actualizar botones de firma
                        updateSignatureButtons();
                    }
                } else if (field === 'fotosCarnet') {
                    // Restaurar estado de fotos con verificación defensiva
                    if (data.fotosCarnet) {
                        // Estructura doble actualizada con inicialización completa
                        fotosCarnet.arrendador = data.fotosCarnet.arrendador || {
                            frente: { captured: false, imageData: null, timestamp: null },
                            reverso: { captured: false, imageData: null, timestamp: null },
                            completed: false
                        };
                        fotosCarnet.arrendatario = data.fotosCarnet.arrendatario || {
                            frente: { captured: false, imageData: null, timestamp: null },
                            reverso: { captured: false, imageData: null, timestamp: null },
                            completed: false
                        };
                        
                        // Verificar estructura completa
                        if (!fotosCarnet.arrendador.frente) {
                            fotosCarnet.arrendador.frente = { captured: false, imageData: null, timestamp: null };
                        }
                        if (!fotosCarnet.arrendador.reverso) {
                            fotosCarnet.arrendador.reverso = { captured: false, imageData: null, timestamp: null };
                        }
                        if (!fotosCarnet.arrendatario.frente) {
                            fotosCarnet.arrendatario.frente = { captured: false, imageData: null, timestamp: null };
                        }
                        if (!fotosCarnet.arrendatario.reverso) {
                            fotosCarnet.arrendatario.reverso = { captured: false, imageData: null, timestamp: null };
                        }
                        
                        // Actualizar botones de foto
                        updatePhotoButtons();
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
        // Asegurar inicialización básica en caso de error
        resetPhotoCarnet();
    }
}

/**
 * Actualiza la apariencia de los botones de firma según el estado
 */
function updateSignatureButtons() {
    const btnArrendador = document.getElementById('firmaArrendador');
    const btnArrendatario = document.getElementById('firmaArrendatario');
    
    if (btnArrendador) {
        if (firmasEstado.arrendador) {
            btnArrendador.classList.add('signed');
            btnArrendador.querySelector('.signature-text').textContent = 'FIRMADO DIGITALMENTE';
        } else {
            btnArrendador.classList.remove('signed');
            btnArrendador.querySelector('.signature-text').textContent = 'FIRMA DIGITAL';
        }
    }
    
    if (btnArrendatario) {
        if (firmasEstado.arrendatario) {
            btnArrendatario.classList.add('signed');
            btnArrendatario.querySelector('.signature-text').textContent = 'FIRMADO DIGITALMENTE';
        } else {
            btnArrendatario.classList.remove('signed');
            btnArrendatario.querySelector('.signature-text').textContent = 'FIRMA DIGITAL';
        }
    }
}

/**
 * Actualiza la apariencia de los botones de foto según el estado
 */
function updatePhotoButtons() {
    const btnPhotoArrendador = document.getElementById('photoArrendador');
    const btnPhotoArrendatario = document.getElementById('photoArrendatario');
    
    // Función auxiliar para actualizar botón con verificación defensiva
    function updateButton(btn, state) {
        if (!btn) return;
        
        // Verificación defensiva del estado
        const safeState = state || {
            frente: { captured: false },
            reverso: { captured: false },
            completed: false
        };
        
        const textEl = btn.querySelector('.photo-text');
        if (!textEl) return;
        
        btn.classList.remove('uploaded');
        
        if (safeState.completed) {
            btn.classList.add('uploaded');
            textEl.textContent = 'FOTOS COMPLETAS';
        } else if (safeState.frente?.captured && !safeState.reverso?.captured) {
            textEl.textContent = '1/2 FOTOS';
        } else if (safeState.frente?.captured && safeState.reverso?.captured) {
            textEl.textContent = '2/2 FOTOS';
        } else {
            textEl.textContent = 'FOTO CARNET';
        }
    }
    
    // Actualizar botones con verificación defensiva
    updateButton(btnPhotoArrendador, fotosCarnet?.arrendador);
    updateButton(btnPhotoArrendatario, fotosCarnet?.arrendatario);
}