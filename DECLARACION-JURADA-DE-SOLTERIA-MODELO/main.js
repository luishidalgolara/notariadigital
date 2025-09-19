// ========================================
// 📋 SISTEMA PRINCIPAL DE DECLARACIÓN JURADA DE SOLTERÍA MODELO 2
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'nombreCompleto',
        'rutDeclarante',
        'profesion',
        'domicilioCompleto',
        'comuna',
        'region',
        'estadoCivil',
        'declaracionAdicional',
        'ciudadDeclaracion',
        'fechaDeclaracion',
        'paisDeclaracion',
        'nombreMinistroFe',
        'rutMinistroFe',
        'cargoMinistroFe',
        'declaracionVeracidad',
        'declaracionEstadoCivil',
        'declaracionResponsabilidad'
    ],
    
    firmasDigitales: {
        otorgante: false
    },
    
    fotosCarnet: {
        otorgante: {
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

// ===== CLASE PRINCIPAL DEL SISTEMA =====
class DeclaracionSolteriaSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Declaración Jurada de Soltería...');
        
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
            'firmaOtorgante', 'photoOtorgante',
            'progressFill', 'progressText', 'themeToggle',
            'estadoCivil', 'fechaDeclaracion'
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
        this.setupConditionalFields();
        this.restoreFormState();
        this.updatePreview();
        this.startAutoSave();
        
        console.log('✅ Núcleo del sistema inicializado');
    }

    setupEventListeners() {
        console.log('🎧 Configurando event listeners...');
        
        // Listeners para campos básicos
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
        // Validación RUT Declarante
        const rutDeclarante = document.getElementById('rutDeclarante');
        if (rutDeclarante) {
            rutDeclarante.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutDeclarante');
            });
        }

        // Validación RUT Ministro de Fe
        const rutMinistroFe = document.getElementById('rutMinistroFe');
        if (rutMinistroFe) {
            rutMinistroFe.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutMinistroFe');
            });
        }

        // Configurar fecha por defecto (hoy)
        const fechaDeclaracion = document.getElementById('fechaDeclaracion');
        if (fechaDeclaracion && !fechaDeclaracion.value) {
            const today = new Date();
            fechaDeclaracion.value = today.toISOString().split('T')[0];
        }

        // Listener especial para mostrar/ocultar sección de ministro de fe
        const nombreMinistroFe = document.getElementById('nombreMinistroFe');
        if (nombreMinistroFe) {
            nombreMinistroFe.addEventListener('input', () => {
                this.toggleMinistroFeSection();
            });
        }

        // Listener para mostrar declaración adicional
        const declaracionAdicional = document.getElementById('declaracionAdicional');
        if (declaracionAdicional) {
            declaracionAdicional.addEventListener('input', () => {
                this.toggleDeclaracionAdicionalSection();
            });
        }
    }

    setupConditionalFields() {
        console.log('🔀 Configurando campos condicionales...');
        
        // Inicializar visibilidad de secciones opcionales
        this.toggleMinistroFeSection();
        this.toggleDeclaracionAdicionalSection();
        
        console.log('✅ Campos condicionales configurados');
    }

    toggleMinistroFeSection() {
        const nombreMinistroFe = document.getElementById('nombreMinistroFe').value;
        const rutMinistroFe = document.getElementById('rutMinistroFe').value;
        const cargoMinistroFe = document.getElementById('cargoMinistroFe').value;
        
        const ministroFeSection = document.getElementById('ministroFeSection');
        
        if (ministroFeSection) {
            const hasMinistroFeData = nombreMinistroFe || rutMinistroFe || cargoMinistroFe;
            ministroFeSection.style.display = hasMinistroFeData ? 'block' : 'none';
        }
    }

    toggleDeclaracionAdicionalSection() {
        const declaracionAdicional = document.getElementById('declaracionAdicional').value;
        const declaracionAdicionalSection = document.getElementById('declaracionAdicionalSection');
        
        if (declaracionAdicionalSection) {
            declaracionAdicionalSection.style.display = declaracionAdicional ? 'block' : 'none';
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
        // Actualizar datos básicos
        this.updateBasicDataPreview();
        
        // Actualizar fechas
        this.updateDatesPreview();
        
        // Actualizar estado civil
        this.updateEstadoCivilPreview();
        
        // Actualizar datos de firma
        this.updateSignaturePreview();
        
        // Actualizar progreso
        this.updateProgress();
    }

    updateBasicDataPreview() {
        // Datos del declarante
        const nombreCompleto = document.getElementById('nombreCompleto').value;
        const rutDeclarante = document.getElementById('rutDeclarante').value;
        const profesion = document.getElementById('profesion').value;
        const domicilioCompleto = document.getElementById('domicilioCompleto').value;
        const comuna = document.getElementById('comuna').value;
        const region = document.getElementById('region').value;
        
        // Datos del ministro de fe
        const nombreMinistroFe = document.getElementById('nombreMinistroFe').value;
        const rutMinistroFe = document.getElementById('rutMinistroFe').value;
        const cargoMinistroFe = document.getElementById('cargoMinistroFe').value;
        
        // Actualizar vista previa
        const previews = [
            { id: 'prev_nombreCompleto', value: nombreCompleto },
            { id: 'prev_rutDeclarante', value: rutDeclarante },
            { id: 'prev_profesion', value: profesion },
            { id: 'prev_domicilioCompleto', value: domicilioCompleto },
            { id: 'prev_comuna', value: comuna },
            { id: 'prev_region', value: region },
            { id: 'prev_nombreCompletoFirma', value: nombreCompleto },
            { id: 'prev_rutDeclaranteFirma', value: rutDeclarante },
            { id: 'prev_nombreMinistroFeFirma', value: nombreMinistroFe },
            { id: 'prev_rutMinistroFeFirma', value: rutMinistroFe },
            { id: 'prev_cargoMinistroFeFirma', value: cargoMinistroFe }
        ];
        
        previews.forEach(preview => {
            const element = document.getElementById(preview.id);
            if (element) {
                element.textContent = preview.value || '_____________________';
            }
        });
    }

    updateDatesPreview() {
        const fechaDeclaracion = document.getElementById('fechaDeclaracion').value;
        const ciudadDeclaracion = document.getElementById('ciudadDeclaracion').value;
        const paisDeclaracion = document.getElementById('paisDeclaracion').value || 'Chile';
        
        const prevFechaDeclaracion = document.getElementById('prev_fechaDeclaracion');
        const prevCiudadDeclaracion = document.getElementById('prev_ciudadDeclaracion');
        const prevPaisDeclaracion = document.getElementById('prev_paisDeclaracion');
        
        if (prevFechaDeclaracion) {
            prevFechaDeclaracion.textContent = this.formatDateForPreview(fechaDeclaracion);
        }
        
        if (prevCiudadDeclaracion) {
            prevCiudadDeclaracion.textContent = ciudadDeclaracion || 'Santiago';
        }
        
        if (prevPaisDeclaracion) {
            prevPaisDeclaracion.textContent = paisDeclaracion;
        }
    }

    updateEstadoCivilPreview() {
        const estadoCivil = document.getElementById('estadoCivil').value;
        const declaracionAdicional = document.getElementById('declaracionAdicional').value;
        
        const prevEstadoCivil = document.getElementById('prev_estadoCivil');
        const prevDeclaracionAdicional = document.getElementById('prev_declaracionAdicional');
        
        if (prevEstadoCivil) {
            const estadosTexto = {
                'soltero': 'soltero',
                'soltera': 'soltera'
            };
            prevEstadoCivil.textContent = estadosTexto[estadoCivil] || 'soltero';
        }
        
        if (prevDeclaracionAdicional) {
            prevDeclaracionAdicional.textContent = declaracionAdicional || '_____________________';
        }

        // Actualizar visibilidad de secciones opcionales
        this.toggleMinistroFeSection();
        this.toggleDeclaracionAdicionalSection();
    }

    updateSignaturePreview() {
        // La lógica de firmas se mantiene igual, solo cambiamos las referencias
        // Ya está manejado en los métodos de actualización básica
    }

    formatDateForPreview(dateValue) {
        if (!dateValue) return '__ de _______ de ____';
        
        try {
            const date = new Date(dateValue + 'T00:00:00');
            const day = date.getDate();
            const month = this.mesesEspanol[date.getMonth()];
            const year = date.getFullYear();
            
            return `${day} de ${month} de ${year}`;
        } catch (error) {
            return '__ de _______ de ____';
        }
    }

    updateProgress() {
        let totalFields = 0;
        let filledFields = 0;
        
        // Campos básicos requeridos
        const basicFields = CONFIG.DECLARACION_SOLTERIA.validaciones_especificas.campos_requeridos;
        
        totalFields += basicFields.length;
        
        basicFields.forEach(field => {
            const element = document.getElementById(field);
            if (element && element.value && element.value.trim() !== '') {
                filledFields++;
            }
        });
        
        // Checkboxes obligatorios
        const checkboxes = CONFIG.DECLARACION_SOLTERIA.validaciones_especificas.checkboxes_obligatorios;
        totalFields += checkboxes.length;
        
        checkboxes.forEach(field => {
            const element = document.getElementById(field);
            if (element && element.checked) {
                filledFields++;
            }
        });
        
        let bonusScore = 0;
        
        // Bonus por firma digital
        if (systemState.firmasDigitales.otorgante) bonusScore += 2;
        
        // Bonus por fotos carnet
        if (systemState.fotosCarnet.otorgante.completed) bonusScore += 1;
        
        const progress = ((filledFields + bonusScore) / (totalFields + 3)) * 100;
        
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) {
            progressFill.style.width = Math.min(100, progress) + '%';
        }
        
        if (progressText) {
            progressText.textContent = `Completado: ${Math.round(Math.min(100, progress))}%`;
        }
    }

    // ===== SISTEMA DE FIRMAS DIGITALES =====
    async initializeSpecialSystems() {
        console.log('⚙️ Inicializando sistemas especiales...');
        
        try {
            await this.initializeSignatureSystemSafe();
            systemState.initialized.signatures = true;
            console.log('✅ Sistema de firmas digitales inicializado');
        } catch (error) {
            console.error('❌ Error inicializando firmas digitales:', error);
        }

        try {
            await this.initializePhotoSystemSafe();
            systemState.initialized.photos = true;
            console.log('✅ Sistema de fotos carnet inicializado');
        } catch (error) {
            console.error('❌ Error inicializando fotos carnet:', error);
        }

        if (!systemState.initialized.signatures || !systemState.initialized.photos) {
            console.log('🔄 Reintentando inicialización de sistemas...');
            await this.delay(2000);
            await this.retryFailedSystems();
        }
    }

    async initializeSignatureSystemSafe() {
        console.log('🖋️ Inicializando sistema de firmas digitales...');
        
        const requiredElements = ['firmaModalOverlay', 'firmaOtorgante'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`Elementos de firma faltantes: ${missingElements.join(', ')}`);
        }
        
        if (!window.firmaProcessor) {
            window.firmaProcessor = new FirmaDigitalProcessor();
            await this.delay(500);
            
            if (!window.firmaProcessor) {
                throw new Error('No se pudo crear el procesador de firmas');
            }
        }
        
        await this.setupSignatureButtonsSafe();
        console.log('✅ Sistema de firmas digitales inicializado correctamente');
    }

    async setupSignatureButtonsSafe() {
        console.log('🖋️ Configurando botones de firma...');
        
        const btnFirmaOtorgante = document.getElementById('firmaOtorgante');
        
        if (!btnFirmaOtorgante) {
            throw new Error('Botón de firma no encontrado');
        }
        
        btnFirmaOtorgante.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('otorgante');
        });
        
        console.log('✅ Botón de firma configurado correctamente');
    }

    openSignatureModalSafe(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        const nombreCompleto = document.getElementById('nombreCompleto').value;
        
        if (!nombreCompleto || !nombreCompleto.trim()) {
            this.showNotification('Complete el nombre completo antes de firmar', 'warning');
            return;
        }
        
        if (!window.firmaProcessor) {
            this.showNotification('Sistema de firmas no disponible. Reintentando inicialización...', 'warning');
            this.retrySignatureSystem();
            return;
        }
        
        try {
            window.firmaProcessor.openModal(type);
        } catch (error) {
            console.error('❌ Error abriendo modal de firma:', error);
            this.showNotification('Error al abrir el sistema de firmas', 'error');
        }
    }

    // ===== SISTEMA DE FOTOS CARNET =====
    async initializePhotoSystemSafe() {
        console.log('📷 Inicializando sistema de fotos carnet...');
        
        const requiredElements = ['photoModalOverlay', 'photoOtorgante'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`Elementos de fotos faltantes: ${missingElements.join(', ')}`);
        }
        
        if (!window.photoProcessor) {
            window.photoProcessor = new PhotoCarnetDualProcessor();
            await this.delay(500);
            
            if (!window.photoProcessor) {
                throw new Error('No se pudo crear el procesador de fotos');
            }
        }
        
        await this.setupPhotoButtonsSafe();
        console.log('✅ Sistema de fotos carnet inicializado correctamente');
    }

    async setupPhotoButtonsSafe() {
        console.log('📷 Configurando botones de foto...');
        
        const btnPhotoOtorgante = document.getElementById('photoOtorgante');
        
        if (!btnPhotoOtorgante) {
            throw new Error('Botón de foto no encontrado');
        }
        
        btnPhotoOtorgante.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('otorgante');
        });
        
        console.log('✅ Botón de foto configurado correctamente');
    }

    openPhotoModalSafe(type) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        const nombreCompleto = document.getElementById('nombreCompleto').value;
        
        if (!nombreCompleto || !nombreCompleto.trim()) {
            this.showNotification('Complete el nombre completo antes de tomar fotos', 'warning');
            return;
        }
        
        if (!window.photoProcessor) {
            this.showNotification('Sistema de fotos no disponible. Reintentando inicialización...', 'warning');
            this.retryPhotoSystem();
            return;
        }
        
        try {
            window.photoProcessor.openModal(type);
        } catch (error) {
            console.error('❌ Error abriendo modal de foto:', error);
            this.showNotification('Error al abrir el sistema de fotos', 'error');
        }
    }

    // ===== SISTEMA DE TEMAS =====
    async initializeTheme() {
        console.log('🎨 Inicializando sistema de temas...');
        
        try {
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', () => this.toggleTheme());
            }
            
            const savedTheme = ConfigUtils.getThemeConfig();
            this.applyTheme(savedTheme);
            
            systemState.initialized.theme = true;
            console.log('✅ Sistema de temas inicializado');
        } catch (error) {
            console.error('❌ Error inicializando temas:', error);
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        this.applyTheme(newTheme);
        ConfigUtils.saveThemeConfig(newTheme);
        
        this.showNotification(`Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 'info');
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Añadir clase para transiciones suaves
        document.body.classList.add('theme-transition');
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 300);
    }

    // ===== AUTOGUARDADO =====
    startAutoSave() {
        if (CONFIG.AUTOSAVE.enabled) {
            this.autoSaveInterval = setInterval(() => {
                this.saveFormState();
            }, CONFIG.AUTOSAVE.interval);
        }
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    saveFormState() {
        const data = {};
        
        // Campos básicos
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                if (element.type === 'checkbox') {
                    data[field] = element.checked;
                } else {
                    data[field] = element.value;
                }
            }
        });
        
        data.firmasDigitales = systemState.firmasDigitales;
        data.fotosCarnet = systemState.fotosCarnet;
        data.timestamp = new Date().toISOString();
        
        try {
            localStorage.setItem(CONFIG.AUTOSAVE.key, JSON.stringify(data));
        } catch (error) {
            console.warn('⚠️ No se pudo guardar automáticamente:', error);
        }
    }

    restoreFormState() {
        try {
            const savedData = localStorage.getItem(CONFIG.AUTOSAVE.key);
            if (savedData) {
                const data = JSON.parse(savedData);
                
                Object.keys(data).forEach(field => {
                    if (field === 'firmasDigitales') {
                        systemState.firmasDigitales = data.firmasDigitales || { otorgante: false };
                    } else if (field === 'fotosCarnet') {
                        systemState.fotosCarnet = data.fotosCarnet || systemState.fotosCarnet;
                    } else if (field !== 'timestamp') {
                        const element = document.getElementById(field);
                        if (element && data[field] !== undefined) {
                            if (element.type === 'checkbox') {
                                element.checked = data[field];
                            } else {
                                element.value = data[field];
                            }
                        }
                    }
                });
                
                this.updatePreview();
                console.log('📥 Formulario restaurado');
            }
        } catch (error) {
            console.warn('⚠️ No se pudo restaurar el formulario:', error);
        }
    }

    hasUnsavedChanges() {
        return false; // Por ahora, siempre guardamos automáticamente
    }

    // ===== FUNCIONES DE UTILIDAD =====
    initializeFormFields() {
        this.setupDefaultValues();
        console.log('📝 Campos del formulario inicializados');
    }

    setupDefaultValues() {
        // Configurar fecha actual
        const fechaDeclaracion = document.getElementById('fechaDeclaracion');
        if (fechaDeclaracion && !fechaDeclaracion.value) {
            const today = new Date();
            fechaDeclaracion.value = today.toISOString().split('T')[0];
        }
        
        // Configurar lugar por defecto
        const ciudadDeclaracion = document.getElementById('ciudadDeclaracion');
        if (ciudadDeclaracion && !ciudadDeclaracion.value) {
            ciudadDeclaracion.value = 'Santiago';
        }
        
        // Configurar país por defecto
        const paisDeclaracion = document.getElementById('paisDeclaracion');
        if (paisDeclaracion && !paisDeclaracion.value) {
            paisDeclaracion.value = 'Chile';
        }
    }

    clearForm() {
        this.showConfirmDialog(
            '¿Está seguro de que desea limpiar todos los campos?',
            'Esta acción también removerá la firma digital y las fotos de carnet.',
            () => {
                // Limpiar campos básicos
                systemState.formFields.forEach(field => {
                    const element = document.getElementById(field);
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = false;
                        } else {
                            element.value = '';
                        }
                        element.classList.remove('rut-valid', 'rut-invalid');
                    }
                });
                
                // Restaurar valores por defecto
                this.setupDefaultValues();
                
                systemState.firmasDigitales = { otorgante: false };
                systemState.fotosCarnet = {
                    otorgante: { 
                        frente: { captured: false, imageData: null, timestamp: null }, 
                        reverso: { captured: false, imageData: null, timestamp: null }, 
                        completed: false 
                    }
                };
                
                if (window.firmaProcessor) {
                    window.firmaProcessor.clearSignatures();
                }
                
                if (window.photoProcessor) {
                    window.photoProcessor.clearAllPhotos();
                }
                
                this.updatePreview();
                this.showNotification('Formulario limpiado correctamente', 'success');
            }
        );
    }

    // ===== GENERACIÓN DE PDF =====
    async generatePDF() {
        const btn = document.querySelector('.btn-primary');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Generando PDF...</span>';
        btn.disabled = true;

        try {
            const validation = this.validateFormWithSignature();
            
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
                this.showNotification('PDF de Declaración Jurada de Soltería generado exitosamente', 'success');
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
        let y = 30;
        const pageWidth = 190;
        const margin = 20;

        // Título centrado
        doc.setFont('times', 'bold');
        doc.setFontSize(18);
        doc.text('DECLARACIÓN JURADA DE SOLTERÍA', 105, y, { align: 'center' });
        y += 8;
        
        doc.setFontSize(14);
        doc.text('Modelo 2', 105, y, { align: 'center' });
        y += 25;

        // Cuerpo de la declaración
        doc.setFont('times', 'normal');
        doc.setFontSize(12);

        // Párrafo inicial
        const ciudadDeclaracion = document.getElementById('ciudadDeclaracion').value || 'Santiago';
        const paisDeclaracion = document.getElementById('paisDeclaracion').value || 'Chile';
        const fechaDeclaracion = document.getElementById('fechaDeclaracion').value;
        const fechaFormateada = this.formatDateForPreview(fechaDeclaracion);
        
        const parrafoInicial = `En ${ciudadDeclaracion}, ${paisDeclaracion}, al ${fechaFormateada}.`;
        
        const lines = doc.splitTextToSize(parrafoInicial, pageWidth - margin);
        doc.text(lines, margin, y);
        y += lines.length * 6 + 15;

        // Datos del declarante
        const nombreCompleto = document.getElementById('nombreCompleto').value || '_____________________';
        const profesion = document.getElementById('profesion').value || '_____________________';
        const rutDeclarante = document.getElementById('rutDeclarante').value || '______________';
        const domicilioCompleto = document.getElementById('domicilioCompleto').value || '_________________________________';
        const comuna = document.getElementById('comuna').value || '_____________________';
        const region = document.getElementById('region').value || '_____________________';
        
        const parrafoDeclarante = `Yo, ${nombreCompleto}, ${profesion}, cédula de identidad nacional RUT N° ${rutDeclarante}, domiciliado en ${domicilioCompleto}, comuna de ${comuna}, ${region}, mayor de edad.`;
        
        const linesDeclarante = doc.splitTextToSize(parrafoDeclarante, pageWidth - margin);
        doc.text(linesDeclarante, margin, y);
        y += linesDeclarante.length * 6 + 15;

        // Expongo
        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        doc.text('Expongo', 105, y, { align: 'center' });
        y += 15;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(12);

        // Declaración principal
        const estadoCivil = document.getElementById('estadoCivil').value || 'soltero';
        const estadoTexto = estadoCivil === 'soltera' ? 'soltera' : 'soltero';
        
        const parrafoDeclaracion = `Por la presente, vengo a declarar bajo la fe de juramento que mi estado civil actual es ${estadoTexto}.`;
        
        const linesDeclaracion = doc.splitTextToSize(parrafoDeclaracion, pageWidth - margin);
        doc.text(linesDeclaracion, margin, y);
        y += linesDeclaracion.length * 6 + 15;

        // Declaración adicional (si existe)
        const declaracionAdicional = document.getElementById('declaracionAdicional').value;
        if (declaracionAdicional) {
            const parrafoAdicional = `Adicionalmente declaro: ${declaracionAdicional}`;
            const linesAdicional = doc.splitTextToSize(parrafoAdicional, pageWidth - margin);
            doc.text(linesAdicional, margin, y);
            y += linesAdicional.length * 6 + 15;
        }

        // Párrafo final
        const parrafoFinal = `Esta declaración la realizo con pleno conocimiento de las responsabilidades legales que conlleva, siendo consciente de que una declaración falsa constituye delito sancionado por la ley.`;
        
        const linesFinal = doc.splitTextToSize(parrafoFinal, pageWidth - margin);
        doc.text(linesFinal, margin, y);
        y += linesFinal.length * 6 + 40;

        // Verificar si necesitamos nueva página para firmas
        if (y > 200) {
            doc.addPage();
            y = 40;
        }

        // Sección de firma
        this.addSignatureSection(doc, y);
        
        this.addDigitalWatermark(doc);
    }

    addSignatureSection(doc, y) {
        console.log('📄 Agregando sección de firmas al PDF...');
        
        // Verificar si necesitamos nueva página
        if (y > 180) {
            doc.addPage();
            y = 40;
        }

        const nombreCompleto = document.getElementById('nombreCompleto').value || '_____________________';
        const rutDeclarante = document.getElementById('rutDeclarante').value || '______________';
        const nombreMinistroFe = document.getElementById('nombreMinistroFe').value;
        const rutMinistroFe = document.getElementById('rutMinistroFe').value;
        const cargoMinistroFe = document.getElementById('cargoMinistroFe').value;
        
        const centerX = 105;
        const lineWidth = 60;
        
        // Línea de firma del declarante
        doc.line(centerX - lineWidth/2, y, centerX + lineWidth/2, y);
        y += 8;
        
        // Nombre del declarante
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.text(nombreCompleto, centerX, y, { align: 'center' });
        y += 6;
        
        // Roles
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('DECLARANTE', centerX, y, { align: 'center' });
        y += 6;
        
        doc.text(`RUT N° ${rutDeclarante}`, centerX, y, { align: 'center' });
        y += 30;
        
        // Ministro de Fe (si existe)
        if (nombreMinistroFe && rutMinistroFe) {
            doc.line(centerX - lineWidth/2, y, centerX + lineWidth/2, y);
            y += 8;
            
            doc.setFont('times', 'bold');
            doc.setFontSize(11);
            doc.text(nombreMinistroFe, centerX, y, { align: 'center' });
            y += 6;
            
            doc.setFont('times', 'normal');
            doc.setFontSize(10);
            doc.text('MINISTRO DE FE', centerX, y, { align: 'center' });
            y += 6;
            
            doc.text(`RUT N° ${rutMinistroFe}`, centerX, y, { align: 'center' });
            
            if (cargoMinistroFe) {
                y += 6;
                doc.text(cargoMinistroFe, centerX, y, { align: 'center' });
            }
        }
        
        // Agregar firma digital si existe
        if (window.firmaProcessor) {
            try {
                const firmaOtorgante = window.firmaProcessor.getSignatureForPDF('otorgante');
                
                if (firmaOtorgante) {
                    doc.addImage(firmaOtorgante, 'PNG', centerX - 30, y - 45, 60, 25);
                    console.log('✅ Firma del declarante agregada al PDF');
                    
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

    generateFileName() {
        const nombreCompleto = document.getElementById('nombreCompleto').value;
        let nombreArchivo = 'DeclaracionSolteria_';
        
        if (nombreCompleto) {
            nombreArchivo += nombreCompleto.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
        }
        
        const timestamp = new Date().toISOString().slice(0, 10);
        return `${nombreArchivo}_${timestamp}.pdf`;
    }

    validateFormWithSignature() {
        const emptyFields = [];
        
        // Campos básicos requeridos
        const basicRequiredFields = CONFIG.DECLARACION_SOLTERIA.validaciones_especificas.campos_requeridos;
        
        basicRequiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element || !element.value.trim()) {
                emptyFields.push(field);
            }
        });
        
        // Validar checkboxes obligatorios
        const checkboxes = CONFIG.DECLARACION_SOLTERIA.validaciones_especificas.checkboxes_obligatorios;
        
        checkboxes.forEach(checkbox => {
            const element = document.getElementById(checkbox);
            if (!element || !element.checked) {
                emptyFields.push(checkbox);
            }
        });
        
        const issues = [];
        
        if (emptyFields.length > 0) {
            issues.push(`Complete ${emptyFields.length} campos faltantes`);
        }
        
        // Validaciones específicas de RUT
        const rutsToValidate = ['rutDeclarante'];
        
        // Agregar RUT ministro de fe si está presente
        const nombreMinistroFe = document.getElementById('nombreMinistroFe').value;
        const rutMinistroFe = document.getElementById('rutMinistroFe').value;
        if (nombreMinistroFe || rutMinistroFe) {
            rutsToValidate.push('rutMinistroFe');
        }
        
        rutsToValidate.forEach(rutField => {
            const element = document.getElementById(rutField);
            if (element && element.value && !ConfigUtils.validateRUT(element.value)) {
                issues.push(`${rutField.replace('rut', 'RUT ')} inválido`);
            }
        });
        
        if (!systemState.firmasDigitales.otorgante) {
            issues.push('Falta firma digital del declarante');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }

    // ===== MÉTODOS DE RECUPERACIÓN Y UTILIDAD =====
    async retryFailedSystems() {
        if (!systemState.initialized.signatures) {
            try {
                await this.initializeSignatureSystemSafe();
                systemState.initialized.signatures = true;
                console.log('✅ Sistema de firmas digitales inicializado en reintento');
            } catch (error) {
                console.error('❌ Fallo definitivo en firmas digitales:', error);
            }
        }

        if (!systemState.initialized.photos) {
            try {
                await this.initializePhotoSystemSafe();
                systemState.initialized.photos = true;
                console.log('✅ Sistema de fotos carnet inicializado en reintento');
            } catch (error) {
                console.error('❌ Fallo definitivo en fotos carnet:', error);
            }
        }
    }

    async retrySignatureSystem() {
        try {
            await this.initializeSignatureSystemSafe();
            this.showNotification('Sistema de firmas reactivado', 'success');
        } catch (error) {
            console.error('❌ No se pudo reactivar el sistema de firmas:', error);
            this.showNotification('Sistema de firmas no disponible', 'error');
        }
    }

    async retryPhotoSystem() {
        try {
            await this.initializePhotoSystemSafe();
            this.showNotification('Sistema de fotos reactivado', 'success');
        } catch (error) {
            console.error('❌ No se pudo reactivar el sistema de fotos:', error);
            this.showNotification('Sistema de fotos no disponible', 'error');
        }
    }

    handleInitializationError(error) {
        this.initializationAttempts++;
        
        if (this.initializationAttempts < this.maxInitializationAttempts) {
            console.log(`🔄 Reintentando inicialización (${this.initializationAttempts}/${this.maxInitializationAttempts})`);
            setTimeout(() => {
                this.init();
            }, this.initializationDelay * this.initializationAttempts);
        } else {
            console.error('❌ Inicialización fallida después de múltiples intentos');
            this.showNotification('Error al cargar el sistema. Algunos componentes pueden no funcionar.', 'error');
            this.fallbackInitialization();
        }
    }

    async fallbackInitialization() {
        console.log('🆘 Intentando inicialización de respaldo...');
        
        try {
            this.setupEventListeners();
            this.initializeFormFields();
            this.setupConditionalFields();
            this.updatePreview();
            
            this.showNotification('Sistema iniciado en modo básico', 'warning');
        } catch (error) {
            console.error('❌ Falló incluso la inicialización de respaldo:', error);
            this.showNotification('Error crítico del sistema', 'error');
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== SISTEMA DE NOTIFICACIONES =====
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${CONFIG.NOTIFICATIONS.icons[type]}</div>
                <div class="notification-message">${message}</div>
            </div>
        `;
        
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
        
        const backgrounds = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)'
        };
        
        notification.style.background = backgrounds[type] || backgrounds.info;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, CONFIG.NOTIFICATIONS.duration);
    }

    showConfirmDialog(title, message, onConfirm) {
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
        
        const style = document.createElement('style');
        style.textContent = `
            .dialog-content {
                background: linear-gradient(135deg, #1e293b, #334155);
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
                background: #64748b;
                color: white;
            }
            .dialog-btn-cancel:hover {
                background: #475569;
            }
            .dialog-btn-confirm {
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
            }
            .dialog-btn-confirm:hover {
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.opacity = '1';
            overlay.setAttribute('data-visible', 'true');
        }, 10);
        
        overlay.querySelector('.dialog-btn-cancel').addEventListener('click', () => {
            this.closeDialog(overlay, style);
        });
        
        overlay.querySelector('.dialog-btn-confirm').addEventListener('click', () => {
            onConfirm();
            this.closeDialog(overlay, style);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeDialog(overlay, style);
            }
        });
    }

    closeDialog(overlay, style) {
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

// ===== PROCESADORES DE FIRMAS Y FOTOS (REUTILIZADOS) =====
class FirmaDigitalProcessor {
    constructor() {
        this.processedImageData = null;
        this.currentType = null;
        this.firmasDigitales = {
            otorgante: null
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragDrop();
        console.log('🖋️ Procesador de Firmas Digitales inicializado');
    }

    setupEventListeners() {
        document.getElementById('firmaModalClose')?.addEventListener('click', () => this.closeModal());
        document.getElementById('firmaFileInput')?.addEventListener('change', (e) => {
            if (e.target.files[0]) this.handleFile(e.target.files[0]);
        });
        
        document.getElementById('firmaModalOverlay')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal();
        });
    }

    setupDragDrop() {
        const uploadArea = document.getElementById('firmaUploadArea');
        if (!uploadArea) return;
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files[0]) this.handleFile(e.dataTransfer.files[0]);
        });
        uploadArea.addEventListener('click', () => {
            document.getElementById('firmaFileInput')?.click();
        });
    }

    openModal(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        this.currentType = type;
        this.resetModal();
        
        const modalOverlay = document.getElementById('firmaModalOverlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'flex';
            modalOverlay.classList.add('active');
            console.log('✅ Modal de firma mostrado');
        } else {
            console.error('❌ Modal de firma no encontrado');
        }
    }

    closeModal() {
        const modalOverlay = document.getElementById('firmaModalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            setTimeout(() => {
                modalOverlay.style.display = 'none';
            }, 300);
        }
    }

    resetModal() {
        this.hideAlert();
        this.hideLoading();
        const fileInput = document.getElementById('firmaFileInput');
        if (fileInput) fileInput.value = '';
    }

    handleFile(file) {
        const validation = ConfigUtils.validateImage(file);
        if (!validation.valid) {
            this.showAlert(validation.errors.join('. '), 'error');
            return;
        }

        this.showLoading();
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.processImage(e.target.result);
        };
        reader.onerror = () => {
            this.hideLoading();
            this.showAlert('Error al leer el archivo', 'error');
        };
        reader.readAsDataURL(file);
    }

    processImage(dataURL) {
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = this.removeWhiteBackground(img);
                this.processedImageData = canvas.toDataURL('image/png');
                
                this.hideLoading();
                this.applySignature();
            } catch (error) {
                console.error('❌ Error procesando imagen:', error);
                this.hideLoading();
                this.showAlert('Error procesando imagen', 'error');
            }
        };
        img.onerror = () => {
            this.hideLoading();
            this.showAlert('Error cargando la imagen', 'error');
        };
        img.src = dataURL;
    }

    removeWhiteBackground(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            
            const luminosity = 0.299 * r + 0.587 * g + 0.114 * b;
            const average = (r + g + b) / 3;
            const maxColor = Math.max(r, g, b);
            const minColor = Math.min(r, g, b);
            const colorDiff = maxColor - minColor;
            
            const isWhitish = luminosity > CONFIG.SIGNATURES.background_removal.luminosity_threshold;
            const isGrayish = average > 140 && colorDiff < CONFIG.SIGNATURES.background_removal.saturation_threshold;
            const isLightColor = minColor > CONFIG.SIGNATURES.background_removal.brightness_threshold;
            
            if (isWhitish || isGrayish || isLightColor) {
                data[i + 3] = 0;
            } else {
                const factor = CONFIG.SIGNATURES.processing.contrast_boost;
                data[i] = Math.min(255, data[i] * factor);
                data[i + 1] = Math.min(255, data[i + 1] * factor);
                data[i + 2] = Math.min(255, data[i + 2] * factor);
                data[i + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    applySignature() {
        if (this.currentType && this.processedImageData) {
            this.firmasDigitales[this.currentType] = this.processedImageData;
            
            systemState.firmasDigitales[this.currentType] = true;
            
            const buttonId = `firma${this.currentType.charAt(0).toUpperCase() + this.currentType.slice(1)}`;
            const button = document.getElementById(buttonId);
            
            if (button) {
                button.classList.add('signed');
                const textElement = button.querySelector('.signature-text');
                if (textElement) {
                    textElement.textContent = 'FIRMADO DIGITALMENTE';
                }
            }
            
            this.updateSignaturePreview(this.currentType, this.processedImageData);
            
            if (window.declaracionSolteriaSystem) {
                window.declaracionSolteriaSystem.updateProgress();
            }
            
            this.closeModal();
            
            if (window.declaracionSolteriaSystem) {
                window.declaracionSolteriaSystem.showNotification(`Firma digital del ${this.currentType} aplicada correctamente`, 'success');
            }
        }
    }

    updateSignaturePreview(type, signatureData) {
        try {
            const placeholderId = `signaturePlaceholder${type.charAt(0).toUpperCase() + type.slice(1)}`;
            const previewId = `signaturePreview${type.charAt(0).toUpperCase() + type.slice(1)}`;
            
            const placeholder = document.getElementById(placeholderId);
            const preview = document.getElementById(previewId);
            
            if (placeholder && preview) {
                placeholder.style.display = 'none';
                preview.src = signatureData;
                preview.style.display = 'block';
            }
        } catch (error) {
            console.error('❌ Error actualizando vista previa:', error);
        }
    }

    getSignatureForPDF(type) {
        return this.firmasDigitales[type];
    }

    clearSignatures() {
        this.firmasDigitales.otorgante = null;
        
        systemState.firmasDigitales = { otorgante: false };
        
        const button = document.getElementById('firmaOtorgante');
        if (button) {
            button.classList.remove('signed');
            const textElement = button.querySelector('.signature-text');
            if (textElement) {
                textElement.textContent = 'FIRMA DIGITAL';
            }
        }
        
        const placeholder = document.getElementById('signaturePlaceholderOtorgante');
        const preview = document.getElementById('signaturePreviewOtorgante');
        
        if (placeholder && preview) {
            placeholder.style.display = 'inline';
            preview.style.display = 'none';
            preview.src = '';
        }
    }

    showAlert(message, type) {
        const alert = document.getElementById('firmaAlert');
        if (alert) {
            alert.textContent = message;
            alert.className = `firma-alert ${type}`;
            alert.style.display = 'block';
            setTimeout(() => this.hideAlert(), 5000);
        }
    }

    hideAlert() {
        const alert = document.getElementById('firmaAlert');
        if (alert) alert.style.display = 'none';
    }

    showLoading() {
        const loading = document.getElementById('firmaLoading');
        if (loading) loading.classList.add('active');
    }

    hideLoading() {
        const loading = document.getElementById('firmaLoading');
        if (loading) loading.classList.remove('active');
    }
}

// ===== CLASE PROCESADOR DE FOTOS CARNET (REUTILIZADA) =====
class PhotoCarnetDualProcessor {
    constructor() {
        this.currentType = null;
        this.currentStep = 'frente';
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.context = null;
        this.isCapturing = false;
        this.tempImages = { frente: null, reverso: null };
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        console.log('📷 Procesador de Fotos Carnet Doble inicializado');
    }

    setupElements() {
        this.video = document.getElementById('cameraVideo');
        this.canvas = document.getElementById('captureCanvas');
        if (this.canvas) {
            this.context = this.canvas.getContext('2d');
        }
    }

    setupEventListeners() {
        document.getElementById('photoModalClose')?.addEventListener('click', () => this.closeModal());
        document.getElementById('captureBtn')?.addEventListener('click', () => this.capturePhoto());
        document.getElementById('retryBtn')?.addEventListener('click', () => this.retryCurrentPhoto());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('restartBtn')?.addEventListener('click', () => this.restartProcess());
        document.getElementById('confirmAllBtn')?.addEventListener('click', () => this.confirmAllPhotos());
        
        document.getElementById('photoModalOverlay')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });
    }

    async openModal(type) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        this.currentType = type;
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.resetModal();
        
        const modalOverlay = document.getElementById('photoModalOverlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'flex';
            modalOverlay.classList.add('active');
            
            setTimeout(() => {
                this.startCamera();
            }, 300);
            
            console.log('✅ Modal de foto mostrado');
        } else {
            console.error('❌ Modal de foto no encontrado');
        }
    }

    resetModal() {
        document.getElementById('photoLoading').style.display = 'block';
        document.getElementById('cameraContainer').style.display = 'none';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('photosSummary').style.display = 'none';
        
        this.updateProgressSteps();
        
        const preview = document.getElementById('photoPreview');
        if (preview) preview.src = '';
        
        this.isCapturing = false;
    }

    updateProgressSteps() {
        const stepFrente = document.getElementById('stepFrente');
        const stepReverso = document.getElementById('stepReverso');
        
        if (stepFrente && stepReverso) {
            stepFrente.classList.remove('active', 'completed', 'pending');
            stepReverso.classList.remove('active', 'completed', 'pending');
            
            if (this.currentStep === 'frente') {
                stepFrente.classList.add('active');
                stepReverso.classList.add('pending');
            } else if (this.currentStep === 'reverso') {
                stepFrente.classList.add('completed');
                stepReverso.classList.add('active');
            } else if (this.currentStep === 'completed') {
                stepFrente.classList.add('completed');
                stepReverso.classList.add('completed');
            }
        }
    }

    async startCamera() {
        try {
            this.showLoading('Iniciando cámara...', 'Solicitando permisos de acceso a la cámara');

            this.stream = await navigator.mediaDevices.getUserMedia(CONFIG.CAMERA.constraints);
            
            if (this.video) {
                this.video.srcObject = this.stream;
                
                await new Promise((resolve) => {
                    this.video.onloadedmetadata = resolve;
                });

                if (this.canvas) {
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;
                }

                this.showCamera();
            }

        } catch (error) {
            console.error('❌ Error al acceder a la cámara:', error);
            this.handleCameraError(error);
        }
    }

    showLoading(title, message) {
        const loading = document.getElementById('photoLoading');
        if (loading) {
            const h3 = loading.querySelector('h3');
            const p = loading.querySelector('p');
            if (h3) h3.textContent = title;
            if (p) p.textContent = message;
            loading.style.display = 'block';
        }
        
        document.getElementById('cameraContainer').style.display = 'none';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('photosSummary').style.display = 'none';
    }

    showCamera() {
        this.updateCameraUI();
        
        document.getElementById('photoLoading').style.display = 'none';
        document.getElementById('cameraContainer').style.display = 'block';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('photosSummary').style.display = 'none';
    }

    showPreview() {
        this.updatePreviewUI();
        
        document.getElementById('photoLoading').style.display = 'none';
        document.getElementById('cameraContainer').style.display = 'none';
        document.getElementById('previewContainer').style.display = 'block';
        document.getElementById('photosSummary').style.display = 'none';
    }

    showSummary() {
        this.updateSummaryUI();
        
        document.getElementById('photoLoading').style.display = 'none';
        document.getElementById('cameraContainer').style.display = 'none';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('photosSummary').style.display = 'block';
    }

    updateCameraUI() {
        const status = document.getElementById('photoStatus');
        const overlay = document.getElementById('cameraOverlay');
        
        if (status && overlay) {
            const h3 = status.querySelector('h3');
            const p = status.querySelector('p');
            
            if (this.currentStep === 'frente') {
                if (h3) h3.textContent = 'Posicione el FRENTE de su carnet en el recuadro';
                if (p) p.textContent = 'Debe verse la foto, nombre y RUT claramente';
                overlay.className = 'camera-overlay frente';
            } else if (this.currentStep === 'reverso') {
                if (h3) h3.textContent = 'Ahora posicione el REVERSO de su carnet';
                if (p) p.textContent = 'Debe verse la dirección y fecha de vencimiento';
                overlay.className = 'camera-overlay reverso';
            }
        }
        
        this.updateProgressSteps();
    }

    updatePreviewUI() {
        const status = document.getElementById('previewStatus');
        const nextBtn = document.getElementById('nextBtn');
        
        if (status && nextBtn) {
            const h3 = status.querySelector('h3');
            const p = status.querySelector('p');
            const span = nextBtn.querySelector('span:last-child');
            
            if (this.currentStep === 'frente') {
                if (h3) h3.textContent = 'Vista previa del FRENTE';
                if (p) p.textContent = 'Verifique que se vea la foto, nombre y RUT';
                if (span) span.textContent = 'Continuar al Reverso';
            } else if (this.currentStep === 'reverso') {
                if (h3) h3.textContent = 'Vista previa del REVERSO';
                if (p) p.textContent = 'Verifique que se vea la dirección y vencimiento';
                if (span) span.textContent = 'Finalizar Capturas';
            }
        }
    }

    updateSummaryUI() {
        const summaryFrente = document.getElementById('summaryFrente');
        const summaryReverso = document.getElementById('summaryReverso');
        
        if (summaryFrente && this.tempImages.frente) {
            summaryFrente.src = this.tempImages.frente;
        }
        
        if (summaryReverso && this.tempImages.reverso) {
            summaryReverso.src = this.tempImages.reverso;
        }
    }

    handleCameraError(error) {
        let errorTitle = 'Error de Cámara';
        let errorMessage = 'No se pudo acceder a la cámara';
        
        switch (error.name) {
            case 'NotAllowedError':
                errorTitle = '🚫 Acceso Denegado';
                errorMessage = 'Permisos de cámara denegados';
                break;
            case 'NotFoundError':
                errorTitle = '📷 Cámara No Encontrada';
                errorMessage = 'No se detectó ninguna cámara';
                break;
            case 'NotReadableError':
                errorTitle = '⚠️ Cámara Ocupada';
                errorMessage = 'La cámara está siendo usada por otra aplicación';
                break;
            default:
                errorTitle = '❌ Error de Cámara';
                errorMessage = 'Error inesperado al acceder a la cámara';
        }

        this.showLoading(errorTitle, errorMessage);
        
        if (window.declaracionSolteriaSystem) {
            window.declaracionSolteriaSystem.showNotification(errorMessage, 'error');
        }
    }

    capturePhoto() {
        if (!this.video || !this.canvas || !this.context || this.isCapturing) {
            return;
        }

        this.isCapturing = true;

        try {
            this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            const imageData = this.canvas.toDataURL(CONFIG.CAMERA.capture_format, CONFIG.CAMERA.capture_quality);
            
            this.tempImages[this.currentStep] = imageData;
            
            const preview = document.getElementById('photoPreview');
            if (preview) {
                preview.src = imageData;
            }
            
            this.showPreview();
            
            if (window.declaracionSolteriaSystem) {
                window.declaracionSolteriaSystem.showNotification(`Foto del ${this.currentStep} capturada`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            if (window.declaracionSolteriaSystem) {
                window.declaracionSolteriaSystem.showNotification('Error al capturar la foto', 'error');
            }
        }

        this.isCapturing = false;
    }

    retryCurrentPhoto() {
        this.tempImages[this.currentStep] = null;
        this.showCamera();
    }

    nextStep() {
        if (this.currentStep === 'frente' && this.tempImages.frente) {
            this.currentStep = 'reverso';
            this.showCamera();
            if (window.declaracionSolteriaSystem) {
                window.declaracionSolteriaSystem.showNotification('Ahora capture el reverso del carnet', 'info');
            }
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            this.currentStep = 'completed';
            this.showSummary();
            if (window.declaracionSolteriaSystem) {
                window.declaracionSolteriaSystem.showNotification('Ambas fotos capturadas', 'success');
            }
        }
    }

    restartProcess() {
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        if (window.declaracionSolteriaSystem) {
            window.declaracionSolteriaSystem.showNotification('Proceso reiniciado', 'info');
        }
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            if (window.declaracionSolteriaSystem) {
                window.declaracionSolteriaSystem.showNotification('Faltan fotos por capturar', 'error');
            }
            return;
        }

        try {
            const processedFrente = await this.processCarnetImage(this.tempImages.frente);
            const processedReverso = await this.processCarnetImage(this.tempImages.reverso);
            
            systemState.fotosCarnet[this.currentType] = {
                frente: {
                    captured: true,
                    imageData: processedFrente,
                    timestamp: new Date().toISOString()
                },
                reverso: {
                    captured: true,
                    imageData: processedReverso,
                    timestamp: new Date().toISOString()
                },
                completed: true
            };

            this.updateButton(this.currentType, true);
            
            if (window.declaracionSolteriaSystem) {
                window.declaracionSolteriaSystem.updateProgress();
            }

            this.closeModal();
            
            if (window.declaracionSolteriaSystem) {
                window.declaracionSolteriaSystem.showNotification(`Carnet completo del ${this.currentType} guardado`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al confirmar fotos:', error);
            if (window.declaracionSolteriaSystem) {
                window.declaracionSolteriaSystem.showNotification('Error al procesar las fotos', 'error');
            }
        }
    }

    async processCarnetImage(imageData) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                const maxWidth = CONFIG.SECURITY.max_photo_width;
                const maxHeight = CONFIG.SECURITY.max_photo_height;
                const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
                const newWidth = img.width * ratio;
                const newHeight = img.height * ratio;
                
                canvas.width = newWidth;
                canvas.height = newHeight;
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                
                resolve(canvas.toDataURL('image/jpeg', CONFIG.SECURITY.compression_quality));
            };
            
            img.onerror = () => {
                resolve(imageData);
            };
            
            img.src = imageData;
        });
    }

    updateButton(type, completed) {
        const buttonId = `photo${type.charAt(0).toUpperCase() + type.slice(1)}`;
        const button = document.getElementById(buttonId);
        
        if (button) {
            const textElement = button.querySelector('.photo-text');
            if (textElement) {
                if (completed) {
                    button.classList.add('uploaded');
                    textElement.textContent = 'FOTOS COMPLETAS';
                } else {
                    button.classList.remove('uploaded');
                    textElement.textContent = 'FOTO CARNET';
                }
            }
        }
    }

    closeModal() {
        this.stopCamera();
        
        const modalOverlay = document.getElementById('photoModalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            setTimeout(() => {
                modalOverlay.style.display = 'none';
            }, 300);
        }
        
        this.tempImages = { frente: null, reverso: null };
        this.currentType = null;
        this.currentStep = 'frente';
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
            });
            this.stream = null;
        }
    }

    clearAllPhotos() {
        systemState.fotosCarnet.otorgante = {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        };
        this.updateButton('otorgante', false);
    }
}

// ===== FUNCIONES GLOBALES =====
window.clearForm = function() {
    if (window.declaracionSolteriaSystem) {
        window.declaracionSolteriaSystem.clearForm();
    }
};

window.generatePDF = function() {
    if (window.declaracionSolteriaSystem) {
        window.declaracionSolteriaSystem.generatePDF();
    }
};

// ===== INICIALIZACIÓN DEL SISTEMA =====
let declaracionSolteriaSystem;

function initializeDeclaracionSolteriaSystem() {
    console.log('📋 Iniciando Sistema de Declaración Jurada de Soltería...');
    
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined') {
        console.warn('⚠️ jsPDF no está disponible, esperando...');
        setTimeout(initializeDeclaracionSolteriaSystem, 1000);
        return;
    }
    
    // Verificar que CONFIG esté disponible
    if (typeof CONFIG === 'undefined') {
        console.warn('⚠️ CONFIG no está disponible, esperando...');
        setTimeout(initializeDeclaracionSolteriaSystem, 1000);
        return;
    }
    
    try {
        declaracionSolteriaSystem = new DeclaracionSolteriaSystem();
        window.declaracionSolteriaSystem = declaracionSolteriaSystem;
        
        console.log('✅ Sistema completamente inicializado');
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        setTimeout(initializeDeclaracionSolteriaSystem, 2000);
    }
}

// ===== MÚLTIPLES PUNTOS DE INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDeclaracionSolteriaSystem);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initializeDeclaracionSolteriaSystem, 500);
}

window.addEventListener('load', () => {
    if (!window.declaracionSolteriaSystem) {
        console.log('🔄 Inicialización de respaldo activada');
        setTimeout(initializeDeclaracionSolteriaSystem, 1000);
    }
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', (event) => {
    console.error('❌ Error global capturado:', event.error);
    
    if (window.declaracionSolteriaSystem) {
        window.declaracionSolteriaSystem.showNotification(
            'Se detectó un error. El sistema intentará recuperarse automáticamente.', 
            'warning'
        );
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
    
    if (window.declaracionSolteriaSystem) {
        window.declaracionSolteriaSystem.showNotification(
            'Error de conectividad detectado. Algunos componentes pueden funcionar de forma limitada.', 
            'warning'
        );
    }
});

// ===== LOG FINAL =====
console.log('📜 Sistema de Declaración Jurada de Soltería - Script principal cargado correctamente');