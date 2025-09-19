// ========================================
// 📋 SISTEMA PRINCIPAL DE DECLARACIÓN JURADA DE CONVIVENCIA
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'ciudadAutorizacion', 'fechaAutorizacion',
        'nombreAutorizante', 'rutAutorizante', 'domicilioAutorizante', 'comunaAutorizante', 'nacionalidadMenor', 'relacionMenor', 'viajaConPasaporte', 'telefonoAcompanante',
        'nombreMenor', 'rutMenor', 'paisDestino', 'motivoViaje', 'duracionViaje', 'edadMenor',
        'nombreAcompanante', 'ciudadDestino', 'rutAcompanante', 'relacionAcompanante', 'fechaNacimientoMenor',
        'domicilioMenor', 'comunaMenor'
    ],
    
    firmasDigitales: {
        autorizante: false,
        acompanante: false
    },
    
    fotosCarnet: {
        autorizante: {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        },
        acompanante: {
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
class DeclaracionConvivenciaSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Declaración Jurada de Convivencia...');
        
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
            'firmaAutorizante', 'photoAutorizante', 'photoAcompanante',
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
        // Validación RUT primera persona
        const rutPrimera = document.getElementById('rutAutorizante');
        if (rutPrimera) {
            rutPrimera.addEventListener('input', (e) => {
                this.handleDocumentInput(e, 'rutAutorizante');
            });
        }

        // Validación RUT segunda persona
        const rutSegunda = document.getElementById('rutMenor');
        if (rutSegunda) {
            rutSegunda.addEventListener('input', (e) => {
                this.handleDocumentInput(e, 'rutMenor');
            });
        }

        // Validar tiempo de convivencia
        const tiempoConvivencia = document.getElementById('nombreAcompanante');
        if (tiempoConvivencia) {
            tiempoConvivencia.addEventListener('input', () => {
                this.validateTimePeriod(tiempoConvivencia);
            });
        }

        // Auto-llenar fecha actual
        const fechaDeclaracion = document.getElementById('fechaAutorizacion');
        if (fechaDeclaracion) {
            fechaDeclaracion.addEventListener('change', () => {
                this.updatePreview();
            });
        }

        // Control coherencia de domicilios
        const domicilioPrimera = document.getElementById('domicilioAutorizante');
        const domicilioSegunda = document.getElementById('domicilioMenor');
        
        if (domicilioPrimera) {
            domicilioPrimera.addEventListener('input', () => {
                this.checkAddressCoherence();
            });
        }
        
        if (domicilioSegunda) {
            domicilioSegunda.addEventListener('input', () => {
                this.checkAddressCoherence();
            });
        }

        // Validar checkbox legal
        const checkboxLegal = document.getElementById('fechaNacimientoMenor');
        if (checkboxLegal) {
            checkboxLegal.addEventListener('change', () => {
                this.validateLegalAcceptance();
            });
        }

        // Validar coherencia de tiempo
        const unidadTiempo = document.getElementById('ciudadDestino');
        if (unidadTiempo) {
            unidadTiempo.addEventListener('change', () => {
                this.validateTimeCoherence();
            });
        }
    }

    handleDocumentInput(event, fieldId) {
        let value = event.target.value;
        
        // Detectar si es RUT chileno o documento extranjero
        if (this.isChileanRUT(value)) {
            const formatted = ConfigUtils.formatRUT(value);
            event.target.value = formatted;
            
            if (formatted.length > 8) {
                const isValid = ConfigUtils.validateRUT(formatted);
                event.target.classList.toggle('rut-valid', isValid);
                event.target.classList.toggle('rut-invalid', !isValid);
            } else {
                event.target.classList.remove('rut-valid', 'rut-invalid');
            }
        } else {
            // Es documento extranjero, validar formato básico
            event.target.classList.toggle('rut-valid', value.length >= 5);
            event.target.classList.toggle('rut-invalid', value.length > 0 && value.length < 5);
        }
        
        this.updatePreview();
        this.checkForDuplicateDocuments();
    }

    isChileanRUT(value) {
        // Detectar si el valor parece ser un RUT chileno
        return /^[0-9]+[-|‐]{0,1}[0-9kK]{0,1}$/.test(value.replace(/\./g, ''));
    }

    validateTimePeriod(timeField) {
        const time = parseInt(timeField.value);
        if (!isNaN(time) && ConfigUtils.validateTimePeriod(time)) {
            timeField.classList.add('rut-valid');
            timeField.classList.remove('rut-invalid');
        } else if (timeField.value) {
            timeField.classList.add('rut-invalid');
            timeField.classList.remove('rut-valid');
        } else {
            timeField.classList.remove('rut-valid', 'rut-invalid');
        }
        this.updatePreview();
        this.validateTimeCoherence();
    }

    checkForDuplicateDocuments() {
        const rutPrimera = document.getElementById('rutAutorizante').value;
        const rutSegunda = document.getElementById('rutMenor').value;
        
        const documents = [rutPrimera, rutSegunda]
            .filter(doc => doc && doc.length > 5);
        
        const uniqueDocuments = [...new Set(documents)];
        
        if (documents.length !== uniqueDocuments.length) {
            this.showNotification('Los documentos de identidad no pueden ser duplicados', 'warning');
        }
    }

    checkAddressCoherence() {
        const domicilioPrimera = document.getElementById('domicilioAutorizante').value.trim().toLowerCase();
        const domicilioSegunda = document.getElementById('domicilioMenor').value.trim().toLowerCase();
        
        if (domicilioPrimera && domicilioSegunda && domicilioPrimera !== domicilioSegunda) {
            this.showNotification('Los domicilios deben ser iguales para ambos declarantes', 'warning');
        }
    }

    validateLegalAcceptance() {
        const checkbox = document.getElementById('fechaNacimientoMenor');
        if (checkbox && checkbox.checked) {
            this.showNotification('Declaración legal aceptada', 'success');
        }
        this.updateProgress();
    }

    validateTimeCoherence() {
        const fechaDeclaracion = document.getElementById('fechaAutorizacion').value;
        const tiempoConvivencia = document.getElementById('nombreAcompanante').value;
        const unidadTiempo = document.getElementById('ciudadDestino').value;
        
        if (fechaDeclaracion && tiempoConvivencia && unidadTiempo) {
            const isCoherent = ConfigUtils.validateTimeCoherence(fechaDeclaracion, tiempoConvivencia, unidadTiempo);
            if (!isCoherent) {
                this.showNotification('El tiempo de convivencia parece inconsistente con la fecha actual', 'warning');
            }
        }
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
        this.updateProgress();
    }

    updateDuplicateReferences() {
        const nombrePrimera = document.getElementById('nombreAutorizante').value;
        const rutPrimera = document.getElementById('rutAutorizante').value;
        const nombreSegunda = document.getElementById('nombreMenor').value;
        const rutSegunda = document.getElementById('rutMenor').value;
        
        // Referencias duplicadas de la primera persona
        const prev_nombreAutorizante2 = document.getElementById('prev_nombreAutorizante2');
        const prev_rutAutorizante2 = document.getElementById('prev_rutAutorizante2');
        
        if (prev_nombreAutorizante2) prev_nombreAutorizante2.textContent = nombrePrimera || '........................';
        if (prev_rutAutorizante2) prev_rutAutorizante2.textContent = rutPrimera || '................';

        // Referencias duplicadas de la segunda persona
        const prev_nombreMenor2 = document.getElementById('prev_nombreMenor2');
        const prev_rutMenor2 = document.getElementById('prev_rutMenor2');
        
        if (prev_nombreMenor2) prev_nombreMenor2.textContent = nombreSegunda || '........................';
        if (prev_rutMenor2) prev_rutMenor2.textContent = rutSegunda || '................';
    }

    updateDatePreview() {
        const fechaDeclaracion = document.getElementById('fechaAutorizacion').value;
        
        if (fechaDeclaracion && ConfigUtils.validateDate(fechaDeclaracion)) {
            const date = new Date(fechaDeclaracion);
            
            const prev_dia = document.getElementById('prev_dia');
            const prev_mes = document.getElementById('prev_mes');
            const prev_anio = document.getElementById('prev_anio');
            
            if (prev_dia) prev_dia.textContent = date.getDate();
            if (prev_mes) prev_mes.textContent = this.mesesEspanol[date.getMonth()];
            if (prev_anio) prev_anio.textContent = date.getFullYear();
        } else {
            const prev_dia = document.getElementById('prev_dia');
            const prev_mes = document.getElementById('prev_mes');
            const prev_anio = document.getElementById('prev_anio');
            
            if (prev_dia) prev_dia.textContent = '...';
            if (prev_mes) prev_mes.textContent = '........';
            if (prev_anio) prev_anio.textContent = '2024';
        }
    }

    updateSignatureNames() {
        const nombrePrimera = document.getElementById('nombreAutorizante').value;
        const firmaPrimera = document.getElementById('prev_firmaAutorizante');
        const nombreSegunda = document.getElementById('nombreMenor').value;
        const firmaSegunda = document.getElementById('prev_firmaMandatario');
        
        if (firmaPrimera) {
            firmaPrimera.textContent = nombrePrimera || '_______________';
        }
        
        if (firmaSegunda) {
            firmaSegunda.textContent = nombreSegunda || '_______________';
        }
    }

    getPlaceholderText(field) {
        const placeholders = {
            'ciudadAutorizacion': 'Santiago',
            'nombreAutorizante': '.........................',
            'rutAutorizante': '................',
            'nacionalidadMenor': '.........................',
            'domicilioAutorizante': '.........................',
            'comunaAutorizante': '...........',
            'telefonoAcompanante': 'Región Metropolitana',
            'nombreMenor': '.........................',
            'rutMenor': '................',
            'paisDestino': '.........................',
            'motivoViaje': '.........................',
            'duracionViaje': '.........................',
            'edadMenor': 'Región Metropolitana',
            'nombreAcompanante': '...',
            'ciudadDestino': 'meses/años',
            'rutAcompanante': '.........................',
            'relacionAcompanante': '.........................',
            'fechaNacimientoMenor': '',
            'domicilioMenor': '.........................',
            'comunaMenor': '...........',
            'relacionMenor': '.........................',
            'viajaConPasaporte': '.........................'
        };
        
        return placeholders[field] || '...........';
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
        
        if (systemState.firmasDigitales.autorizante) bonusScore += 1;
        if (systemState.fotosCarnet.autorizante.completed) bonusScore += 1;
        if (systemState.fotosCarnet.acompanante.completed) bonusScore += 0.5;
        
        // Bonus por checkbox legal
        const checkboxLegal = document.getElementById('fechaNacimientoMenor');
        if (checkboxLegal && checkboxLegal.checked) bonusScore += 0.5;
        
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
    async initializeSignatureSystemSafe() {
        console.log('🖋️ Inicializando sistema de firmas digitales...');
        
        const requiredElements = ['firmaModalOverlay', 'firmaAutorizante'];
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
        
        const btnFirmaPrimera = document.getElementById('firmaAutorizante');
        
        if (!btnFirmaPrimera) {
            throw new Error('Botón de firma no encontrado');
        }
        
        btnFirmaPrimera.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('autorizante');
        });
        
        console.log('✅ Botón de firma configurado correctamente');
    }

    openSignatureModalSafe(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        const nombreField = document.getElementById('nombreAutorizante');
        
        if (!nombreField || !nombreField.value.trim()) {
            this.showNotification('Complete el nombre de la primera persona antes de firmar', 'warning');
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
        
        const requiredElements = ['photoModalOverlay', 'photoAutorizante', 'photoAcompanante'];
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
        
        const btnPhotoPrimera = document.getElementById('photoAutorizante');
        const btnPhotoSegunda = document.getElementById('photoAcompanante');
        
        if (!btnPhotoPrimera || !btnPhotoSegunda) {
            throw new Error('Botones de foto no encontrados');
        }
        
        btnPhotoPrimera.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('autorizante');
        });
        
        btnPhotoSegunda.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('acompanante');
        });
        
        console.log('✅ Botones de foto configurados correctamente');
    }

    openPhotoModalSafe(type) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        let nombreField;
        let entityName;
        
        if (type === 'autorizante') {
            nombreField = document.getElementById('nombreAutorizante');
            entityName = 'primera persona';
        } else {
            nombreField = document.getElementById('nombreMenor');
            entityName = 'segunda persona';
        }
        
        if (!nombreField || !nombreField.value.trim()) {
            this.showNotification(`Complete el nombre de la ${entityName} antes de tomar fotos`, 'warning');
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
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        this.applyTheme(newTheme);
        ConfigUtils.saveThemeConfig(newTheme);
        
        this.showNotification(`Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 'info');
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
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
        
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                data[field] = element.value;
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
                        systemState.firmasDigitales = data.firmasDigitales || { autorizante: false, acompanante: false };
                    } else if (field === 'fotosCarnet') {
                        systemState.fotosCarnet = data.fotosCarnet || systemState.fotosCarnet;
                    } else if (field !== 'timestamp') {
                        const element = document.getElementById(field);
                        if (element && data[field]) {
                            element.value = data[field];
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
        return false;
    }

    // ===== FUNCIONES DE UTILIDAD =====
    initializeFormFields() {
        const fechaDeclaracion = document.getElementById('fechaAutorizacion');
        if (fechaDeclaracion && !fechaDeclaracion.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaDeclaracion.value = today;
        }
        
        console.log('📝 Campos del formulario inicializados');
    }

    clearForm() {
        this.showConfirmDialog(
            '¿Está seguro de que desea limpiar todos los campos?',
            'Esta acción también removerá las firmas digitales y fotos de carnet.',
            () => {
                systemState.formFields.forEach(field => {
                    const element = document.getElementById(field);
                    if (element) {
                        element.value = '';
                        element.classList.remove('rut-valid', 'rut-invalid');
                    }
                });
                
                // Limpiar checkbox
                const checkboxLegal = document.getElementById('fechaNacimientoMenor');
                if (checkboxLegal) checkboxLegal.checked = false;
                
                const fechaDeclaracion = document.getElementById('fechaAutorizacion');
                if (fechaDeclaracion) {
                    const today = new Date().toISOString().split('T')[0];
                    fechaDeclaracion.value = today;
                }
                
                systemState.firmasDigitales = { autorizante: false, acompanante: false };
                systemState.fotosCarnet = {
                    autorizante: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false },
                    acompanante: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false }
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

    // ===== GENERACIÓN DE PDF =====
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
                this.showNotification('PDF de la Declaración Jurada generado exitosamente', 'success');
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

        // Título centrado y destacado
        doc.setFont('times', 'bold');
        doc.setFontSize(18);
        doc.text('DECLARACIÓN JURADA DE CONVIVENCIA', 105, y, { align: 'center' });
        y += 30;

        // Contenido principal
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        
        // Datos básicos
        const ciudad = document.getElementById('ciudadAutorizacion').value;
        const fecha = document.getElementById('fechaAutorizacion').value;
        const nombrePrimera = document.getElementById('nombreAutorizante').value;
        const nacionalidadPrimera = document.getElementById('nacionalidadMenor').value;
        const rutPrimera = document.getElementById('rutAutorizante').value;
        const estadoCivilPrimera = document.getElementById('viajaConPasaporte').value;
        const profesionPrimera = document.getElementById('relacionMenor').value;
        const domicilioPrimera = document.getElementById('domicilioAutorizante').value;
        const comunaPrimera = document.getElementById('comunaAutorizante').value;
        const regionPrimera = document.getElementById('telefonoAcompanante').value;
        
        // Datos segunda persona
        const nombreSegunda = document.getElementById('nombreMenor').value;
        const nacionalidadSegunda = document.getElementById('paisDestino').value;
        const estadoCivilSegunda = document.getElementById('motivoViaje').value;
        const profesionSegunda = document.getElementById('duracionViaje').value;
        const domicilioSegunda = document.getElementById('domicilioMenor').value;
        const comunaSegunda = document.getElementById('comunaMenor').value;
        const regionSegunda = document.getElementById('edadMenor').value;

        // Párrafo de apertura
        const fechaObj = new Date(fecha);
        const parrafo1 = `En ${ciudad}, a ${fechaObj.getDate()} de ${this.mesesEspanol[fechaObj.getMonth()]} de ${fechaObj.getFullYear()}, por el presente instrumento yo ${nombrePrimera}, Nacionalidad ${nacionalidadPrimera}, Estado civil ${estadoCivilPrimera}, Profesión u oficio ${profesionPrimera}, cédula de identidad número ${rutPrimera}, yo ${nombreSegunda}, Nacionalidad ${nacionalidadSegunda}, Estado civil ${estadoCivilSegunda}, Profesión u oficio ${profesionSegunda}, cédula de identidad número ${rutPrimera}, ambos domiciliados en ${domicilioPrimera}, comuna de ${comunaPrimera}, ${regionPrimera};`;
        
        doc.text(parrafo1, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, parrafo1, pageWidth - 2 * margin) + 20;

        // Declaración principal
        const tiempoConvivencia = document.getElementById('nombreAcompanante').value;
        const unidadTiempo = document.getElementById('ciudadDestino').value;
        
        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        doc.text('DECLARAMOS', margin, y);
        y += 10;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        const parrafo2 = `bajo fe de juramento y con pleno conocimiento de lo dispuesto en el Artículo 210 del Código Penal, que desde hace ${tiempoConvivencia} ${unidadTiempo} convivimos como pareja de forma continua y sin interrupción.`;
        
        doc.text(parrafo2, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, parrafo2, pageWidth - 2 * margin) + 20;

        // Propósito de la declaración
        const proposito = document.getElementById('rutAcompanante').value;
        
        const parrafo3 = `Formulamos la presente declaración para ser presentada ante ${proposito}, a los fines que estime convenientes.`;
        
        doc.text(parrafo3, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, parrafo3, pageWidth - 2 * margin) + 20;

        // Observaciones adicionales
        const observaciones = document.getElementById('relacionAcompanante').value;
        if (observaciones) {
            doc.setFillColor(59, 130, 246, 0.1);
            doc.rect(margin, y - 5, pageWidth - 2 * margin, 25, 'F');
            doc.setDrawColor(59, 130, 246);
            doc.rect(margin, y - 5, pageWidth - 2 * margin, 25);
            
            doc.setFont('times', 'bold');
            doc.setFontSize(11);
            doc.text('OBSERVACIONES ADICIONALES:', margin + 5, y + 5);
            
            doc.setFont('times', 'normal');
            doc.setFontSize(10);
            doc.text(observaciones, margin + 5, y + 12, {maxWidth: pageWidth - 2 * margin - 10});
            
            y += 35;
        }

        // Verificar si necesitamos nueva página
        if (y > 180) {
            doc.addPage();
            y = 30;
        }

        // Firmas
        this.addSignatureSection(doc, y);
        
        // Advertencia legal
        if (y > 160) {
            doc.addPage();
            y = 30;
        } else {
            y += 100;
        }

        doc.setFont('times', 'bold');
        doc.setFontSize(10);
        doc.text('ADVERTENCIA LEGAL:', margin, y);
        y += 8;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.text('Esta declaración se realiza bajo fe de juramento. El falso testimonio constituye delito tipificado en el Artículo 210 del Código Penal, sancionado con presidio menor en sus grados medio a máximo. Los declarantes asumen plena responsabilidad por la veracidad de la información proporcionada.', margin, y, {maxWidth: pageWidth - 2 * margin});
        
        this.addDigitalWatermark(doc);
    }

    addSignatureSection(doc, y) {
        console.log('📄 Agregando sección de firmas al PDF...');
        
        // Firmas lado a lado
        const leftX = 60;
        const rightX = 140;
        
        // Firma primera persona
        doc.line(leftX - 20, y, leftX + 20, y);
        y += 8;
        
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        const nombrePrimera = document.getElementById('nombreAutorizante').value;
        doc.text(nombrePrimera, leftX, y, { align: 'center' });
        y += 6;
        
        const rutPrimera = document.getElementById('rutAutorizante').value;
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.text(`Rut ${rutPrimera}`, leftX, y, { align: 'center' });
        
        // Firma segunda persona
        const ySegunda = y - 14;
        doc.line(rightX - 20, ySegunda, rightX + 20, ySegunda);
        
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        const nombreSegunda = document.getElementById('nombreMenor').value;
        doc.text(nombreSegunda, rightX, ySegunda + 8, { align: 'center' });
        
        const rutSegunda = document.getElementById('rutMenor').value;
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.text(`Rut ${rutSegunda}`, rightX, ySegunda + 14, { align: 'center' });
        
        // Agregar firma digital si existe
        if (window.firmaProcessor) {
            try {
                const firmaPrimera = window.firmaProcessor.getSignatureForPDF('autorizante');
                
                if (firmaPrimera) {
                    doc.addImage(firmaPrimera, 'PNG', leftX - 20, ySegunda - 25, 40, 20);
                    console.log('✅ Firma de la primera persona agregada al PDF');
                    
                    doc.setFont('times', 'italic');
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text('Documento con firma digital aplicada', 105, y + 15, { align: 'center' });
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
        doc.text('Documento generado digitalmente - Notaría Digital Chile', 105, 260, { align: 'center' });
        doc.text(`Generado el ${new Date().toLocaleString('es-CL')}`, 105, 265, { align: 'center' });
        doc.setTextColor(0, 0, 0);
    }

    calculateTextHeight(doc, text, maxWidth) {
        const lines = doc.splitTextToSize(text, maxWidth);
        return lines.length * 5;
    }

    generateFileName() {
        const nombrePrimera = document.getElementById('nombreAutorizante').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const nombreSegunda = document.getElementById('nombreMenor').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const timestamp = new Date().toISOString().slice(0, 10);
        return `Declaracion_Jurada_Convivencia_${nombrePrimera}_${nombreSegunda}_${timestamp}.pdf`;
    }

    validateFormWithSignatures() {
        const emptyFields = [];
        
        // Campos mínimos requeridos
        const requiredFields = [
            'ciudadAutorizacion', 'fechaAutorizacion',
            'nombreAutorizante', 'rutAutorizante', 'domicilioAutorizante', 'comunaAutorizante',
            'nombreMenor', 'rutMenor', 'domicilioMenor', 'comunaMenor',
            'nombreAcompanante', 'ciudadDestino', 'rutAcompanante'
        ];
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element || !element.value.trim()) {
                emptyFields.push(field);
            }
        });
        
        const issues = [];
        
        if (emptyFields.length > 0) {
            issues.push(`Complete ${emptyFields.length} campos requeridos`);
        }
        
        // Validaciones específicas
        const rutPrimera = document.getElementById('rutAutorizante').value;
        const rutSegunda = document.getElementById('rutMenor').value;
        
        if (rutPrimera && this.isChileanRUT(rutPrimera) && !ConfigUtils.validateRUT(rutPrimera)) {
            issues.push('RUT de la primera persona inválido');
        }
        
        if (rutSegunda && this.isChileanRUT(rutSegunda) && !ConfigUtils.validateRUT(rutSegunda)) {
            issues.push('RUT de la segunda persona inválido');
        }
        
        // Verificar documentos duplicados
        if (rutPrimera && rutSegunda && rutPrimera === rutSegunda) {
            issues.push('Los declarantes no pueden tener el mismo RUT');
        }
        
        // Validar tiempo de convivencia
        const tiempo = document.getElementById('nombreAcompanante').value;
        if (tiempo && !ConfigUtils.validateTimePeriod(tiempo)) {
            issues.push('Tiempo de convivencia debe ser válido');
        }
        
        // Verificar checkbox legal
        const checkboxLegal = document.getElementById('fechaNacimientoMenor');
        if (!checkboxLegal || !checkboxLegal.checked) {
            issues.push('Debe aceptar la declaración legal');
        }
        
        if (!systemState.firmasDigitales.autorizante) {
            issues.push('Falta firma digital de la primera persona');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

// ===== CLASES PROCESADORAS (REUTILIZADAS EXACTAMENTE IGUALES) =====

// Clase procesador de firmas digitales
class FirmaDigitalProcessor {
    constructor() {
        this.processedImageData = null;
        this.currentType = null;
        this.firmasDigitales = {
            autorizante: null,
            acompanante: null
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
            
            if (window.declaracionConvivenciaSystem) {
                window.declaracionConvivenciaSystem.updateProgress();
            }
            
            this.closeModal();
            
            if (window.declaracionConvivenciaSystem) {
                window.declaracionConvivenciaSystem.showNotification('Firma digital aplicada correctamente', 'success');
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
        this.firmasDigitales.autorizante = null;
        this.firmasDigitales.acompanante = null;
        
        systemState.firmasDigitales = { autorizante: false, acompanante: false };
        
        ['autorizante'].forEach(type => {
            const buttonId = `firma${type.charAt(0).toUpperCase() + type.slice(1)}`;
            const button = document.getElementById(buttonId);
            if (button) {
                button.classList.remove('signed');
                const textElement = button.querySelector('.signature-text');
                if (textElement) {
                    textElement.textContent = 'FIRMA DIGITAL';
                }
            }
            
            const placeholderId = `signaturePlaceholder${type.charAt(0).toUpperCase() + type.slice(1)}`;
            const previewId = `signaturePreview${type.charAt(0).toUpperCase() + type.slice(1)}`;
            
            const placeholder = document.getElementById(placeholderId);
            const preview = document.getElementById(previewId);
            
            if (placeholder && preview) {
                placeholder.style.display = 'inline';
                preview.style.display = 'none';
                preview.src = '';
            }
        });
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

// Clase procesador de fotos carnet (exactamente igual)
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
        
        if (window.declaracionConvivenciaSystem) {
            window.declaracionConvivenciaSystem.showNotification(errorMessage, 'error');
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
            
            if (window.declaracionConvivenciaSystem) {
                window.declaracionConvivenciaSystem.showNotification(`Foto del ${this.currentStep} capturada`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            if (window.declaracionConvivenciaSystem) {
                window.declaracionConvivenciaSystem.showNotification('Error al capturar la foto', 'error');
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
            if (window.declaracionConvivenciaSystem) {
                window.declaracionConvivenciaSystem.showNotification('Ahora capture el reverso del carnet', 'info');
            }
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            this.currentStep = 'completed';
            this.showSummary();
            if (window.declaracionConvivenciaSystem) {
                window.declaracionConvivenciaSystem.showNotification('Ambas fotos capturadas', 'success');
            }
        }
    }

    restartProcess() {
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        if (window.declaracionConvivenciaSystem) {
            window.declaracionConvivenciaSystem.showNotification('Proceso reiniciado', 'info');
        }
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            if (window.declaracionConvivenciaSystem) {
                window.declaracionConvivenciaSystem.showNotification('Faltan fotos por capturar', 'error');
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
            
            if (window.declaracionConvivenciaSystem) {
                window.declaracionConvivenciaSystem.updateProgress();
            }

            this.closeModal();
            
            if (window.declaracionConvivenciaSystem) {
                const entityName = this.currentType === 'autorizante' ? 'primera persona' : 'segunda persona';
                window.declaracionConvivenciaSystem.showNotification(`Carnet completo de la ${entityName} guardado`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al confirmar fotos