// ========================================
// 📋 ADAPTACIONES PARA AUTORIZACIÓN NOTARIAL DE SALIDA DE VEHÍCULO
// ========================================

// ===== ESTADO GLOBAL ACTUALIZADO =====
const systemState = {
    formFields: [
        'ciudadCarta', 'fechaCarta',
        'nombresInvitante', 'nacionalidadInvitante', 'runInvitante', 'domicilioInvitante', 'ocupacionInvitante', 'telefonoInvitante',
        'nombresInvitado', 'nacionalidadInvitado', 'rutRepresentante',
        'tipoVehiculo', 'anioVehiculo', 'marcaVehiculo', 'modeloVehiculo', 'numeroChasis', 'colorVehiculo', 'patenteVehiculo',
        'razonSocialEmpresa', 'rutEmpresa', 'duracionEstancia', 'fechaInicioArriendo', 'observacionesAdicionales'
    ],
    
    firmasDigitales: {
        invitante: false
    },
    
    fotosCarnet: {
        invitante: {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        }
    },
    
    initialized: {
        core: false,
        signatures: false,
        photos: false,
        theme: false
    }
};

// ===== CLASE PRINCIPAL ACTUALIZADA =====
class CartaInvitacionSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Autorización Notarial de Salida de Vehículo...');
        
        try {
            await this.waitForDOM();
            const elementsReady = await this.ensureCriticalElements();
            
            if (!elementsReady) {
                throw new Error('Elementos críticos no disponibles después de múltiples intentos');
            }

            await this.initializeCore();
            await this.initializeSpecialSystems();
            await this.initializeTheme();
            
            systemState.initialized.core = true;
            
            console.log('✅ Sistema inicializado correctamente');
            this.showNotification('Sistema cargado y listo para usar', 'success');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema:', error);
            this.handleInitializationError(error);
        }
    }

    async waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                const checkReady = () => {
                    if (document.readyState === 'complete') {
                        resolve();
                    } else {
                        setTimeout(checkReady, 100);
                    }
                };
                checkReady();
            }
        });
    }

    async ensureCriticalElements() {
        const criticalElements = [
            'firmaModalOverlay', 'photoModalOverlay',
            'firmaInvitante', 'photoInvitante',
            'progressFill', 'progressText', 'themeToggle'
        ];

        for (let attempt = 1; attempt <= this.maxInitializationAttempts; attempt++) {
            console.log(`🔍 Verificando elementos críticos (intento ${attempt}/${this.maxInitializationAttempts})`);
            
            const missingElements = criticalElements.filter(id => !document.getElementById(id));
            
            if (missingElements.length === 0) {
                console.log('✅ Todos los elementos críticos encontrados');
                return true;
            }
            
            console.log(`⚠️ Elementos faltantes:`, missingElements);
            
            if (attempt < this.maxInitializationAttempts) {
                await this.delay(this.initializationDelay);
            }
        }
        
        console.error('❌ No se pudieron encontrar todos los elementos críticos');
        return false;
    }

    async initializeCore() {
        console.log('🔧 Inicializando núcleo del sistema...');
        
        this.setupEventListeners();
        this.initializeFormFields();
        this.restoreFormState();
        this.updatePreview();
        this.startAutoSave();
        
        console.log('✅ Núcleo del sistema inicializado');
    }

    setupEventListeners() {
        console.log('🎧 Configurando event listeners...');
        
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('input', ConfigUtils.debounce(() => {
                    this.updatePreview();
                    this.saveFormState();
                }, CONFIG.PERFORMANCE.debounce_delay));
                
                element.addEventListener('change', () => {
                    this.updatePreview();
                    this.saveFormState();
                });
            }
        });

        this.setupSpecialFieldListeners();
        
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });

        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = CONFIG.MESSAGES.warning.unsaved_changes;
            }
        });

        console.log('✅ Event listeners configurados');
    }

    setupSpecialFieldListeners() {
        // Validación RUT Autorizante
        const runInvitante = document.getElementById('runInvitante');
        if (runInvitante) {
            runInvitante.addEventListener('input', (e) => {
                this.handleRutInput(e, 'runInvitante');
            });
        }

        // Validación RUT Autorizado
        const rutRepresentante = document.getElementById('rutRepresentante');
        if (rutRepresentante) {
            rutRepresentante.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutRepresentante');
            });
        }

        // Auto-llenar fecha actual
        const fechaCarta = document.getElementById('fechaCarta');
        if (fechaCarta && !fechaCarta.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaCarta.value = today;
        }

        // Formatear patente
        const patenteVehiculo = document.getElementById('patenteVehiculo');
        if (patenteVehiculo) {
            patenteVehiculo.addEventListener('input', (e) => {
                let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                if (value.length > 4) {
                    value = value.slice(0, 4) + '-' + value.slice(4, 6);
                }
                e.target.value = value;
                this.updatePreview();
            });
        }

        // Formatear número de chasis
        const numeroChasis = document.getElementById('numeroChasis');
        if (numeroChasis) {
            numeroChasis.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
                this.updatePreview();
            });
        }

        // Mostrar/ocultar sección de observaciones
        const observacionesAdicionales = document.getElementById('observacionesAdicionales');
        if (observacionesAdicionales) {
            observacionesAdicionales.addEventListener('input', () => {
                this.toggleObservationsSection();
            });
        }
    }

    handleRutInput(event, fieldId) {
        const formatted = ConfigUtils.formatRUT(event.target.value);
        event.target.value = formatted;
        
        if (formatted.length > 8) {
            const isValid = ConfigUtils.validateRUT(formatted);
            event.target.classList.toggle('rut-valid', isValid);
            event.target.classList.toggle('rut-invalid', !isValid);
        } else {
            event.target.classList.remove('rut-valid', 'rut-invalid');
        }
        
        this.updatePreview();
    }

    updatePreview() {
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            const preview = document.getElementById('prev_' + field);
            if (element && preview) {
                let value = element.value || '';
                preview.textContent = value || this.getPlaceholderText(field);
            }
        });

        this.updateDuplicateReferences();
        this.updateDatePreview();
        this.updateSignatureNames();
        this.toggleObservationsSection();
        this.updateProgress();
    }

    updateDuplicateReferences() {
        const nombresInvitante = document.getElementById('nombresInvitante').value;
        const runInvitante = document.getElementById('runInvitante').value;
        
        const prev_runInvitante2 = document.getElementById('prev_runInvitante2');
        
        if (prev_runInvitante2) prev_runInvitante2.textContent = runInvitante || '___________';
    }

    updateDatePreview() {
        const fechaCarta = document.getElementById('fechaCarta').value;
        
        if (fechaCarta && ConfigUtils.validateDate(fechaCarta)) {
            const date = new Date(fechaCarta);
            
            const prev_dia = document.getElementById('prev_dia');
            const prev_mes = document.getElementById('prev_mes');
            const prev_anio = document.getElementById('prev_anio');
            
            // Formato dd/mm/yyyy para la autorización
            if (prev_dia) prev_dia.textContent = String(date.getDate()).padStart(2, '0');
            if (prev_mes) prev_mes.textContent = String(date.getMonth() + 1).padStart(2, '0');
            if (prev_anio) prev_anio.textContent = date.getFullYear();
        } else {
            const prev_dia = document.getElementById('prev_dia');
            const prev_mes = document.getElementById('prev_mes');
            const prev_anio = document.getElementById('prev_anio');
            
            if (prev_dia) prev_dia.textContent = '__';
            if (prev_mes) prev_mes.textContent = '__';
            if (prev_anio) prev_anio.textContent = '____';
        }
    }

    updateSignatureNames() {
        const nombresInvitante = document.getElementById('nombresInvitante').value;
        const firmaInvitante = document.getElementById('prev_firmaInvitante');
        
        if (firmaInvitante) {
            firmaInvitante.textContent = nombresInvitante || '_______________';
        }
    }

    toggleObservationsSection() {
        const observacionesAdicionales = document.getElementById('observacionesAdicionales').value;
        const observationsSection = document.getElementById('observaciones-section');
        
        if (observationsSection) {
            if (observacionesAdicionales.trim()) {
                observationsSection.style.display = 'block';
            } else {
                observationsSection.style.display = 'none';
            }
        }
    }

    getPlaceholderText(field) {
        const placeholders = {
            'ciudadCarta': 'Santiago',
            'nombresInvitante': '_________________________',
            'nombresInvitado': '_________________________',
            'nacionalidadInvitante': 'Chilena',
            'nacionalidadInvitado': 'Chilena',
            'runInvitante': '___________',
            'rutRepresentante': '___________',
            'domicilioInvitante': '_________________________',
            'ocupacionInvitante': '___________',
            'telefonoInvitante': '___________',
            'razonSocialEmpresa': '___________',
            'rutEmpresa': 'viaje y posteriormente regrese a Chile',
            'tipoVehiculo': '___________',
            'anioVehiculo': '___________',
            'marcaVehiculo': '___________',
            'modeloVehiculo': '___________',
            'numeroChasis': '___________',
            'colorVehiculo': '___________',
            'patenteVehiculo': '___________',
            'duracionEstancia': '___________',
            'observacionesAdicionales': '________________________'
        };
        
        return placeholders[field] || '___________';
    }

    updateProgress() {
        const totalFields = systemState.formFields.length;
        let filledFields = 0;
        
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            if (element && element.value.trim() !== '') {
                filledFields++;
            }
        });
        
        let bonusScore = 0;
        
        if (systemState.firmasDigitales.invitante) bonusScore += 0.5;
        if (systemState.fotosCarnet.invitante.completed) bonusScore += 0.5;
        
        const progress = ((filledFields + bonusScore) / (totalFields + 1)) * 100;
        
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) {
            progressFill.style.width = Math.min(100, progress) + '%';
        }
        
        if (progressText) {
            progressText.textContent = `Completado: ${Math.round(Math.min(100, progress))}%`;
        }
    }

    // ===== GENERACIÓN DE PDF PARA AUTORIZACIÓN NOTARIAL =====
    async generatePDF() {
        const btn = document.querySelector('.btn-primary');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Generando PDF...</span>';
        btn.disabled = true;

        try {
            const validation = this.validateFormWithSignatures();
            
            if (!validation.valid) {
                this.showNotification(`Antes de generar el PDF: ${validation.issues.join('. ')}`, 'error');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'letter');

            this.setupPDFDocument(doc);
            await this.addPDFContent(doc);
            
            const fileName = this.generateFileName();
            
            setTimeout(() => {
                doc.save(fileName);
                this.showNotification('PDF de Autorización Notarial generado exitosamente', 'success');
            }, 1500);
            
        } catch (error) {
            console.error('❌ Error generando PDF:', error);
            this.showNotification('Error al generar el PDF. Intente nuevamente.', 'error');
        } finally {
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 1500);
        }
    }

    setupPDFDocument(doc) {
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
    }

    async addPDFContent(doc) {
        let y = 40;
        const pageWidth = 190;
        const margin = 20;

        // Título centrado
        doc.setFont('times', 'bold');
        doc.setFontSize(18);
        doc.text('AUTORIZACIÓN NOTARIAL DE SALIDA DE VEHÍCULO', 105, y, { align: 'center' });
        y += 40;

        // Contenido principal
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        
        const nombresInvitante = document.getElementById('nombresInvitante').value;
        const runInvitante = document.getElementById('runInvitante').value;
        const domicilioInvitante = document.getElementById('domicilioInvitante').value;
        const ocupacionInvitante = document.getElementById('ocupacionInvitante').value;
        const telefonoInvitante = document.getElementById('telefonoInvitante').value;
        
        const nombresInvitado = document.getElementById('nombresInvitado').value;
        const rutRepresentante = document.getElementById('rutRepresentante').value;
        const razonSocialEmpresa = document.getElementById('razonSocialEmpresa').value;
        const rutEmpresa = document.getElementById('rutEmpresa').value;

        // Párrafo principal
        const parrafo1 = `Por el presente instrumento yo, ${nombresInvitante}, Cédula Nacional de Identidad N° ${runInvitante}, domiciliado en ${domicilioInvitante}, comuna de ${ocupacionInvitante}, región ${telefonoInvitante}, autorizo a don ${nombresInvitado} Cédula Nacional de Identidad N° ${rutRepresentante} para que ${rutEmpresa} a ${razonSocialEmpresa}, en el siguiente vehículo de mi propiedad:`;
        
        doc.text(parrafo1, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, parrafo1, pageWidth - 2 * margin) + 20;

        // Datos del vehículo
        const tipoVehiculo = document.getElementById('tipoVehiculo').value;
        const marcaVehiculo = document.getElementById('marcaVehiculo').value;
        const modeloVehiculo = document.getElementById('modeloVehiculo').value;
        const numeroChasis = document.getElementById('numeroChasis').value;
        const colorVehiculo = document.getElementById('colorVehiculo').value;
        const anioVehiculo = document.getElementById('anioVehiculo').value;
        const patenteVehiculo = document.getElementById('patenteVehiculo').value;

        y += 10;
        doc.setFont('times', 'bold');
        doc.text('TIPO:', margin + 10, y);
        doc.setFont('times', 'normal');
        doc.text(tipoVehiculo, margin + 35, y);
        y += 8;

        doc.setFont('times', 'bold');
        doc.text('MARCA:', margin + 10, y);
        doc.setFont('times', 'normal');
        doc.text(marcaVehiculo, margin + 35, y);
        y += 8;

        doc.setFont('times', 'bold');
        doc.text('MODELO:', margin + 10, y);
        doc.setFont('times', 'normal');
        doc.text(modeloVehiculo, margin + 35, y);
        y += 8;

        doc.setFont('times', 'bold');
        doc.text('CHASIS N°:', margin + 10, y);
        doc.setFont('times', 'normal');
        doc.text(numeroChasis, margin + 45, y);
        y += 8;

        doc.setFont('times', 'bold');
        doc.text('COLOR:', margin + 10, y);
        doc.setFont('times', 'normal');
        doc.text(colorVehiculo, margin + 35, y);
        y += 8;

        doc.setFont('times', 'bold');
        doc.text('AÑO:', margin + 10, y);
        doc.setFont('times', 'normal');
        doc.text(anioVehiculo, y);
        y += 8;

        doc.setFont('times', 'bold');
        doc.text('PATENTE:', margin + 10, y);
        doc.setFont('times', 'normal');
        doc.text(patenteVehiculo, margin + 40, y);
        y += 20;

        // Vigencia
        const duracionEstancia = document.getElementById('duracionEstancia').value;
        const fechaCarta = document.getElementById('fechaCarta').value;

        let fechaTexto = '__/__/____';
        if (fechaCarta && ConfigUtils.validateDate(fechaCarta)) {
            const date = new Date(fechaCarta);
            const dia = String(date.getDate()).padStart(2, '0');
            const mes = String(date.getMonth() + 1).padStart(2, '0');
            const anio = date.getFullYear();
            fechaTexto = `${dia}/${mes}/${anio}`;
        }

        const parrafo2 = `La presente autorización la otorgo por ${duracionEstancia} a contar de esta fecha ${fechaTexto}.`;
        
        doc.setFont('times', 'normal');
        doc.text(parrafo2, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, parrafo2, pageWidth - 2 * margin) + 20;

        // Observaciones
        const observacionesAdicionales = document.getElementById('observacionesAdicionales').value;
        if (observacionesAdicionales.trim()) {
            const observaciones = `Observaciones: ${observacionesAdicionales}`;
            doc.text(observaciones, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, observaciones, pageWidth - 2 * margin) + 20;
        }

        // Sección de firma
        y += 30;
        this.addSignatureSection(doc, y);
        
        this.addDigitalWatermark(doc);
    }

    addSignatureSection(doc, y) {
        console.log('📄 Agregando sección de firma al PDF...');
        
        // Firma centrada
        const centerX = 105;
        
        // Línea de firma
        doc.line(centerX - 40, y, centerX + 40, y);
        y += 8;
        
        // Nombre
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        const nombresInvitante = document.getElementById('nombresInvitante').value;
        doc.text(nombresInvitante, centerX, y, { align: 'center' });
        y += 6;
        
        // Rol
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('AUTORIZANTE', centerX, y, { align: 'center' });
        y += 8;
        
        // Información adicional
        const runInvitante = document.getElementById('runInvitante').value;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.text(`C.I. N° ${runInvitante}`, centerX, y, { align: 'center' });
        
        // Agregar firma digital si existe
        if (window.firmaProcessor) {
            try {
                const firmaInvitante = window.firmaProcessor.getSignatureForPDF('invitante');
                
                if (firmaInvitante) {
                    doc.addImage(firmaInvitante, 'PNG', centerX - 40, y - 30, 80, 20);
                    console.log('✅ Firma del autorizante agregada al PDF');
                    
                    doc.setFont('times', 'italic');
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text('Documento con firma digital aplicada', centerX, y + 15, { align: 'center' });
                    doc.setTextColor(0, 0, 0);
                }
            } catch (error) {
                console.error('❌ Error agregando firma digital al PDF:', error);
            }
        }
    }

    addDigitalWatermark(doc) {
        doc.setFont('times', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Documento firmado digitalmente - Notaría Digital Chile', 105, 260, { align: 'center' });
        doc.text(`Generado el ${new Date().toLocaleString('es-CL')}`, 105, 265, { align: 'center' });
        doc.setTextColor(0, 0, 0);
    }

    calculateTextHeight(doc, text, maxWidth) {
        const lines = doc.splitTextToSize(text, maxWidth);
        return lines.length * 5; // Aproximadamente 5mm por línea
    }

    generateFileName() {
        const nombresInvitante = document.getElementById('nombresInvitante').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const nombresInvitado = document.getElementById('nombresInvitado').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const timestamp = new Date().toISOString().slice(0, 10);
        return `Autorizacion_Notarial_${nombresInvitante}_${nombresInvitado}_${timestamp}.pdf`;
    }

    validateFormWithSignatures() {
        const emptyFields = [];
        
        // Campos mínimos requeridos para autorización notarial
        const requiredFields = [
            'ciudadCarta', 'fechaCarta',
            'nombresInvitante', 'runInvitante', 'domicilioInvitante', 'ocupacionInvitante', 'telefonoInvitante',
            'nombresInvitado', 'rutRepresentante',
            'tipoVehiculo', 'marcaVehiculo', 'modeloVehiculo', 'patenteVehiculo', 'numeroChasis', 'colorVehiculo', 'anioVehiculo',
            'razonSocialEmpresa', 'rutEmpresa', 'duracionEstancia'
        ];
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element || !element.value.trim()) {
                emptyFields.push(field);
            }
        });
        
        const issues = [];
        
        if (emptyFields.length > 0) {
            issues.push(`Complete ${emptyFields.length} campos faltantes`);
        }
        
        // Validaciones específicas
        const runInvitante = document.getElementById('runInvitante').value;
        const rutRepresentante = document.getElementById('rutRepresentante').value;
        
        if (runInvitante && !ConfigUtils.validateRUT(runInvitante)) {
            issues.push('RUT del autorizante inválido');
        }
        
        if (rutRepresentante && !ConfigUtils.validateRUT(rutRepresentante)) {
            issues.push('RUT del autorizado inválido');
        }
        
        // Validar fechas
        const fechaCarta = document.getElementById('fechaCarta').value;
        if (fechaCarta && !ConfigUtils.validateDate(fechaCarta)) {
            issues.push('Fecha del documento inválida');
        }
        
        if (!systemState.firmasDigitales.invitante) {
            issues.push('Falta firma digital del autorizante');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }

    // === TODAS LAS DEMÁS FUNCIONES SE MANTIENEN IGUAL ===
    // (Copio solo las firmas de los métodos que no cambian)
    
    async initializeSpecialSystems() { /* IGUAL QUE ANTES */ }
    async initializeTheme() { /* IGUAL QUE ANTES */ }
    async initializeSignatureSystemSafe() { /* IGUAL QUE ANTES */ }
    async initializePhotoSystemSafe() { /* IGUAL QUE ANTES */ }
    openSignatureModalSafe(type) { /* IGUAL QUE ANTES */ }
    openPhotoModalSafe(type) { /* IGUAL QUE ANTES */ }
    toggleTheme() { /* IGUAL QUE ANTES */ }
    applyTheme(theme) { /* IGUAL QUE ANTES */ }
    startAutoSave() { /* IGUAL QUE ANTES */ }
    saveFormState() { /* IGUAL QUE ANTES */ }
    restoreFormState() { /* IGUAL QUE ANTES */ }
    clearForm() { /* IGUAL QUE ANTES */ }
    initializeFormFields() { /* IGUAL QUE ANTES */ }
    showNotification(message, type) { /* IGUAL QUE ANTES */ }
    showConfirmDialog(title, message, onConfirm) { /* IGUAL QUE ANTES */ }
    delay(ms) { /* IGUAL QUE ANTES */ }
    /* ... RESTO DE MÉTODOS IGUALES ... */
}

// ===== TODAS LAS DEMÁS CLASES Y FUNCIONES SE MANTIENEN IGUALES =====
// (FirmaDigitalProcessor, PhotoCarnetDualProcessor, funciones globales, etc.)