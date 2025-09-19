// ========================================
// 📋 SISTEMA PRINCIPAL DE OFERTA LABORAL PARA EXTRANJEROS
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'regionOferta', 'comunaOferta', 'fechaOferta',
        'nombreOferente', 'rutOferente', 'nombreEmpresa',
        'nombreReceptor', 'numeroPasaporte', 'nacionalidadReceptor', 'fechaNacimientoReceptor', 'domicilioReceptor',
        'nombreCargo', 'funcionesDesempenar',
        'remuneracionMensual', 'tipoContrato', 'jornadaLaboral', 'horarioTrabajo', 'fechaInicioPropuesta', 'duracionContrato',
        'observacionesAdicionales'
    ],
    
    firmasDigitales: {
        oferente: false,
        receptor: false
    },
    
    fotosCarnet: {
        oferente: {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        },
        receptor: {
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
class OfertaLaboralSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Oferta Laboral para Extranjeros...');
        
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
            'firmaOferente', 'firmaReceptor',
            'photoOferente', 'photoReceptor',
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
        // Validación RUT Oferente
        const rutOferenteField = document.getElementById('rutOferente');
        if (rutOferenteField) {
            rutOferenteField.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutOferente');
            });
        }

        // Validación Pasaporte Receptor
        const pasaporteField = document.getElementById('numeroPasaporte');
        if (pasaporteField) {
            pasaporteField.addEventListener('input', (e) => {
                this.handlePasaporteInput(e, 'numeroPasaporte');
            });
        }

        // Auto-llenar fecha actual
        const fechaOferta = document.getElementById('fechaOferta');
        if (fechaOferta && !fechaOferta.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaOferta.value = today;
        }

        // Validar remuneración
        const remuneracionField = document.getElementById('remuneracionMensual');
        if (remuneracionField) {
            remuneracionField.addEventListener('input', (e) => {
                const remuneracion = parseInt(e.target.value);
                if (remuneracion && remuneracion < CONFIG.VALIDATION.remuneracion.min) {
                    this.showNotification('La remuneración debe ser mayor al sueldo mínimo', 'warning');
                }
                this.updatePreview();
            });
            
            remuneracionField.addEventListener('blur', (e) => {
                if (e.target.value) {
                    const formatted = ConfigUtils.formatNumber(e.target.value);
                    // No cambiar el valor del input, solo para mostrar
                }
            });
        }

        // Validar fecha de nacimiento
        const fechaNacimientoField = document.getElementById('fechaNacimientoReceptor');
        if (fechaNacimientoField) {
            fechaNacimientoField.addEventListener('blur', (e) => {
                if (e.target.value && !ConfigUtils.validateBirthDate(e.target.value)) {
                    this.showNotification('Fecha de nacimiento inválida (debe ser mayor de 16 años)', 'warning');
                }
            });
        }

        // Validar cargo
        const cargoField = document.getElementById('nombreCargo');
        if (cargoField) {
            cargoField.addEventListener('blur', (e) => {
                if (e.target.value && !ConfigUtils.validateCargo(e.target.value)) {
                    this.showNotification('Nombre del cargo inválido', 'warning');
                }
            });
        }

        // Validar funciones
        const funcionesField = document.getElementById('funcionesDesempenar');
        if (funcionesField) {
            funcionesField.addEventListener('input', () => {
                this.updateConditionalSections();
                this.updatePreview();
            });
            
            funcionesField.addEventListener('blur', (e) => {
                if (e.target.value && !ConfigUtils.validateFunciones(e.target.value)) {
                    this.showNotification('La descripción de funciones debe tener al menos 10 caracteres', 'warning');
                }
            });
        }

        // Mostrar/ocultar observaciones adicionales
        const observacionesField = document.getElementById('observacionesAdicionales');
        if (observacionesField) {
            observacionesField.addEventListener('input', () => {
                this.updateConditionalSections();
                this.updatePreview();
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

    handlePasaporteInput(event, fieldId) {
        const formatted = ConfigUtils.formatPasaporte(event.target.value);
        event.target.value = formatted;
        
        if (formatted.length >= 6) {
            const isValid = ConfigUtils.validatePasaporte(formatted);
            event.target.classList.toggle('pasaporte-valid', isValid);
            event.target.classList.toggle('pasaporte-invalid', !isValid);
        } else {
            event.target.classList.remove('pasaporte-valid', 'pasaporte-invalid');
        }
        
        this.updatePreview();
    }

    updateConditionalSections() {
        // Mostrar/ocultar observaciones adicionales
        const observacionesAdicionales = document.getElementById('observacionesAdicionales');
        const observacionesContainer = document.getElementById('observacionesContainer');
        
        if (observacionesAdicionales && observacionesContainer) {
            if (observacionesAdicionales.value.trim()) {
                observacionesContainer.style.display = 'block';
            } else {
                observacionesContainer.style.display = 'none';
            }
        }
    }

    updatePreview() {
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            const preview = document.getElementById('prev_' + field);
            if (element && preview) {
                let value = element.value || '';
                
                // Formatear remuneración con separadores de miles
                if (field === 'remuneracionMensual' && value) {
                    value = ConfigUtils.formatNumber(value);
                }
                
                preview.textContent = value || this.getPlaceholderText(field);
            }
        });

        this.updateDuplicateReferences();
        this.updateDatePreview();
        this.updateSignatureNames();
        this.updateConditionalSections();
        this.updateProgress();
    }

    updateDuplicateReferences() {
        // Actualizar referencias duplicadas en el documento
        const rutOferente = document.getElementById('rutOferente').value;
        const prev_rutOferente2 = document.getElementById('prev_rutOferente2');
        if (prev_rutOferente2) prev_rutOferente2.textContent = rutOferente || 'XX.XXX.XXX-X';
    }

    updateDatePreview() {
        // Fecha de la oferta
        const fechaOferta = document.getElementById('fechaOferta').value;
        
        if (fechaOferta && ConfigUtils.validateDate(fechaOferta)) {
            const date = new Date(fechaOferta);
            
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
            
            if (prev_dia) prev_dia.textContent = '__';
            if (prev_mes) prev_mes.textContent = '________';
            if (prev_anio) prev_anio.textContent = '20__';
        }

        // Fecha de inicio propuesta
        const fechaInicioPropuesta = document.getElementById('fechaInicioPropuesta').value;
        const prev_fechaInicio = document.getElementById('prev_fechaInicio');
        
        if (prev_fechaInicio) {
            if (fechaInicioPropuesta && ConfigUtils.validateDate(fechaInicioPropuesta)) {
                const date = new Date(fechaInicioPropuesta);
                const dia = date.getDate();
                const mes = this.mesesEspanol[date.getMonth()];
                const anio = date.getFullYear();
                prev_fechaInicio.textContent = `${dia} de ${mes} de ${anio}`;
            } else {
                prev_fechaInicio.textContent = '__ de ________ de 20__';
            }
        }
    }

    updateSignatureNames() {
        const nombreOferente = document.getElementById('nombreOferente').value;
        const prev_firmaOferente = document.getElementById('prev_firmaOferente');
        if (prev_firmaOferente) prev_firmaOferente.textContent = nombreOferente || '_______________';
    }

    getPlaceholderText(field) {
        const placeholders = {
            'regionOferta': 'Región XXXX',
            'comunaOferta': 'Comuna',
            'nombreOferente': 'NOMBRE DEL QUE OFRECE LA OFERTA',
            'rutOferente': 'xxxxxxxx-x',
            'nombreEmpresa': '________________',
            'nombreReceptor': 'NOMBRE DEL QUE RECIBE LA OFERTA',
            'numeroPasaporte': 'XXXXXX',
            'nacionalidadReceptor': '________________',
            'domicilioReceptor': '________________',
            'nombreCargo': 'NOMBRE DEL CARGO EN EL QUE TRABAJARÁ',
            'funcionesDesempenar': 'FUNCIONES A DESEMPEÑAR',
            'remuneracionMensual': 'XXX.XXX',
            'tipoContrato': '________________',
            'jornadaLaboral': '________________',
            'horarioTrabajo': '________________',
            'duracionContrato': '________________',
            'observacionesAdicionales': '________________'
        };
        
        return placeholders[field] || '________________';
    }

    updateProgress() {
        const requiredFields = [
            'regionOferta', 'comunaOferta', 'fechaOferta',
            'nombreOferente', 'rutOferente', 'nombreEmpresa',
            'nombreReceptor', 'numeroPasaporte', 'nacionalidadReceptor', 'fechaNacimientoReceptor', 'domicilioReceptor',
            'nombreCargo', 'funcionesDesempenar', 'remuneracionMensual', 'tipoContrato', 'jornadaLaboral'
        ];
        
        let filledFields = 0;
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (element && element.value.trim() !== '') {
                filledFields++;
            }
        });
        
        let bonusScore = 0;
        
        if (systemState.firmasDigitales.oferente) bonusScore += 0.5;
        if (systemState.firmasDigitales.receptor) bonusScore += 0.5;
        if (systemState.fotosCarnet.oferente.completed) bonusScore += 0.25;
        if (systemState.fotosCarnet.receptor.completed) bonusScore += 0.25;
        
        const progress = ((filledFields + bonusScore) / (requiredFields.length + 1.5)) * 100;
        
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
        
        const requiredElements = ['firmaModalOverlay', 'firmaOferente', 'firmaReceptor'];
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
        
        const btnFirmaOferente = document.getElementById('firmaOferente');
        const btnFirmaReceptor = document.getElementById('firmaReceptor');
        
        if (!btnFirmaOferente || !btnFirmaReceptor) {
            throw new Error('Botones de firma no encontrados');
        }
        
        btnFirmaOferente.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('oferente');
        });

        btnFirmaReceptor.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('receptor');
        });
        
        console.log('✅ Botones de firma configurados correctamente');
    }

    openSignatureModalSafe(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        let nombreField;
        if (type === 'oferente') {
            nombreField = document.getElementById('nombreOferente');
        } else {
            nombreField = document.getElementById('nombreReceptor');
        }
        
        if (!nombreField || !nombreField.value.trim()) {
            const tipoNombre = type === 'oferente' ? 'oferente' : 'receptor';
            this.showNotification(`Complete el nombre del ${tipoNombre} antes de firmar`, 'warning');
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
        
        const requiredElements = ['photoModalOverlay', 'photoOferente', 'photoReceptor'];
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
        
        const btnPhotoOferente = document.getElementById('photoOferente');
        const btnPhotoReceptor = document.getElementById('photoReceptor');
        
        if (!btnPhotoOferente || !btnPhotoReceptor) {
            throw new Error('Botones de foto no encontrados');
        }
        
        btnPhotoOferente.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('oferente');
        });

        btnPhotoReceptor.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('receptor');
        });
        
        console.log('✅ Botones de foto configurados correctamente');
    }

    openPhotoModalSafe(type) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        let nombreField;
        if (type === 'oferente') {
            nombreField = document.getElementById('nombreOferente');
        } else {
            nombreField = document.getElementById('nombreReceptor');
        }
        
        if (!nombreField || !nombreField.value.trim()) {
            const tipoNombre = type === 'oferente' ? 'oferente' : 'receptor';
            this.showNotification(`Complete el nombre del ${tipoNombre} antes de tomar fotos`, 'warning');
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
                        systemState.firmasDigitales = data.firmasDigitales || { oferente: false, receptor: false };
                    } else if (field === 'fotosCarnet') {
                        systemState.fotosCarnet = data.fotosCarnet || systemState.fotosCarnet;
                    } else if (field !== 'timestamp') {
                        const element = document.getElementById(field);
                        if (element && data[field] !== undefined) {
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
        return false; // Por ahora, siempre guardamos automáticamente
    }

    // ===== FUNCIONES DE UTILIDAD =====
    initializeFormFields() {
        // Auto-llenar fecha actual para la oferta
        const fechaOferta = document.getElementById('fechaOferta');
        if (fechaOferta && !fechaOferta.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaOferta.value = today;
        }
        
        // Valor por defecto para región
        const regionOferta = document.getElementById('regionOferta');
        if (regionOferta && !regionOferta.value) {
            regionOferta.value = 'Región Metropolitana de Santiago';
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
                        element.classList.remove('rut-valid', 'rut-invalid', 'pasaporte-valid', 'pasaporte-invalid');
                    }
                });
                
                // Restaurar valores por defecto
                this.initializeFormFields();
                
                systemState.firmasDigitales = { oferente: false, receptor: false };
                systemState.fotosCarnet = {
                    oferente: { 
                        frente: { captured: false, imageData: null, timestamp: null }, 
                        reverso: { captured: false, imageData: null, timestamp: null }, 
                        completed: false 
                    },
                    receptor: { 
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
                this.showNotification('PDF de Oferta Laboral para Extranjeros generado exitosamente', 'success');
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

        // Fecha y lugar (alineado a la derecha)
        const fechaOferta = document.getElementById('fechaOferta').value;
        const regionOferta = document.getElementById('regionOferta').value;
        const comunaOferta = document.getElementById('comunaOferta').value;

        let fechaTexto = '__ de ________ de 20__';
        if (fechaOferta && ConfigUtils.validateDate(fechaOferta)) {
            const date = new Date(fechaOferta);
            fechaTexto = `${date.getDate()} de ${this.mesesEspanol[date.getMonth()]} de ${date.getFullYear()}`;
        }

        const ubicacionFecha = `${regionOferta}, ${comunaOferta}, ${fechaTexto}`;
        doc.text(ubicacionFecha, pageWidth - 20, y, { align: 'right' });
        y += 30;

        // Título centrado con subrayado
        doc.setFont('times', 'bold');
        doc.setFontSize(18);
        doc.text('OFERTA LABORAL', 105, y, { align: 'center' });
        doc.line(80, y + 3, 130, y + 3);
        y += 30;

        // Contenido principal
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        
        // Párrafo inicial
        const nombreOferente = document.getElementById('nombreOferente').value;
        const rutOferente = document.getElementById('rutOferente').value;
        const nombreReceptor = document.getElementById('nombreReceptor').value;
        const numeroPasaporte = document.getElementById('numeroPasaporte').value;
        const nombreEmpresa = document.getElementById('nombreEmpresa').value;
        const nombreCargo = document.getElementById('nombreCargo').value;

        const parrafoInicial = `Yo, ${nombreOferente}, RUT: ${rutOferente}, junto con saludarlo y conforme al análisis de sus antecedentes y a las entrevistas sostenidas tenemos el agrado de ofrecerle la posibilidad a ${nombreReceptor} Número de pasaporte: ${numeroPasaporte} de ingresar a nuestra empresa ${nombreEmpresa} ocupando el cargo de:`;

        doc.text(parrafoInicial, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, parrafoInicial, pageWidth - 2 * margin) + 20;

        // Nombre del cargo centrado y destacado
        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.text(nombreCargo, 105, y, { align: 'center' });
        y += 20;

        // Funciones
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        doc.text('para realizar las siguientes funciones/labores:', margin, y);
        y += 15;

        doc.setFont('times', 'bold');
        doc.text('FUNCIONES A DESEMPEÑAR', margin, y);
        y += 10;

        doc.setFont('times', 'normal');
        const funcionesDesempenar = document.getElementById('funcionesDesempenar').value;
        doc.text(funcionesDesempenar, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, funcionesDesempenar, pageWidth - 2 * margin) + 20;

        // Remuneración
        const remuneracionMensual = document.getElementById('remuneracionMensual').value;
        const remuneracionTexto = `Recibiendo una remuneración mensual de $ ${ConfigUtils.formatNumber(remuneracionMensual)} pesos (Nunca menor a sueldo mínimo)`;
        doc.text(remuneracionTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, remuneracionTexto, pageWidth - 2 * margin) + 20;

        // Condiciones adicionales
        if (y > 200) {
            doc.addPage();
            y = 30;
        }

        doc.setFont('times', 'bold');
        doc.text('CONDICIONES ADICIONALES', margin, y);
        y += 15;

        doc.setFont('times', 'normal');
        const tipoContrato = document.getElementById('tipoContrato').value;
        const jornadaLaboral = document.getElementById('jornadaLaboral').value;
        const horarioTrabajo = document.getElementById('horarioTrabajo').value;
        
        let fechaInicioTexto = '__ de ________ de 20__';
        const fechaInicioPropuesta = document.getElementById('fechaInicioPropuesta').value;
        if (fechaInicioPropuesta && ConfigUtils.validateDate(fechaInicioPropuesta)) {
            const date = new Date(fechaInicioPropuesta);
            fechaInicioTexto = `${date.getDate()} de ${this.mesesEspanol[date.getMonth()]} de ${date.getFullYear()}`;
        }
        
        const duracionContrato = document.getElementById('duracionContrato').value;

        const condiciones = [
            `Tipo de Contrato: ${tipoContrato}`,
            `Jornada Laboral: ${jornadaLaboral}`,
            `Horario: ${horarioTrabajo}`,
            `Fecha de Inicio: ${fechaInicioTexto}`,
            `Duración: ${duracionContrato}`
        ];

        condiciones.forEach(condicion => {
            doc.text(condicion, margin, y);
            y += 8;
        });

        y += 15;

        // Cláusula de vigencia
        doc.setFont('times', 'bold');
        doc.text('CLÁUSULA DE VIGENCIA', margin, y);
        y += 10;

        doc.setFont('times', 'italic');
        const clausulaVigencia = '"La obligación de prestar servicios emanada del presente contrato, sólo podrá cumplirse una vez que el trabajador haya obtenido la visación de residencia correspondiente en Chile o el permiso especial de trabajo para extranjeros con visa en trámite".';
        doc.text(clausulaVigencia, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausulaVigencia, pageWidth - 2 * margin) + 20;

        // Observaciones adicionales si existen
        const observacionesAdicionales = document.getElementById('observacionesAdicionales').value;
        if (observacionesAdicionales && observacionesAdicionales.trim()) {
            doc.setFont('times', 'bold');
            doc.text('OBSERVACIONES ADICIONALES', margin, y);
            y += 10;
            
            doc.setFont('times', 'normal');
            doc.text(observacionesAdicionales, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, observacionesAdicionales, pageWidth - 2 * margin) + 20;
        }

        // Atentamente
        doc.setFont('times', 'normal');
        doc.text('Atentamente,', margin, y);
        y += 40;

        // Verificar si necesitamos nueva página para firma
        if (y > 200) {
            doc.addPage();
            y = 30;
        }

        // Firma
        this.addSignatureSection(doc, y);
        
        // Notas legales
        y += 80;
        if (y > 220) {
            doc.addPage();
            y = 30;
        }
        
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('Nota Legal: Esta oferta laboral está sujeta a la obtención de los permisos de trabajo', margin, y);
        y += 6;
        doc.text('correspondientes según la legislación chilena vigente.', margin, y);
        y += 10;
        doc.text('Importante: El trabajador extranjero debe cumplir con todos los requisitos migratorios', margin, y);
        y += 6;
        doc.text('antes de iniciar sus funciones.', margin, y);
        
        this.addDigitalWatermark(doc);
    }

    addSignatureSection(doc, y) {
        console.log('📄 Agregando sección de firma al PDF...');
        
        const centerX = 105;
        
        // Línea de firma
        doc.line(centerX - 40, y, centerX + 40, y);
        y += 8;
        
        // Nombre
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        const nombreOferente = document.getElementById('nombreOferente').value;
        doc.text(nombreOferente, centerX, y, { align: 'center' });
        y += 8;
        
        // RUT
        const rutOferente = document.getElementById('rutOferente').value;
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.text(`RUT: ${rutOferente}`, centerX, y, { align: 'center' });
        
        // Agregar firma digital si existe
        if (window.firmaProcessor) {
            try {
                const firmaOferente = window.firmaProcessor.getSignatureForPDF('oferente');
                
                if (firmaOferente) {
                    doc.addImage(firmaOferente, 'PNG', centerX - 25, y - 30, 50, 20);
                    console.log('✅ Firma del oferente agregada al PDF');
                    
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
        doc.text(`ID: ${ConfigUtils.generateDocumentId()}`, 105, 270, { align: 'center' });
        doc.setTextColor(0, 0, 0);
    }

    calculateTextHeight(doc, text, maxWidth) {
        const lines = doc.splitTextToSize(text, maxWidth);
        return lines.length * 5; // Aproximadamente 5mm por línea
    }

    generateFileName() {
        const nombreReceptor = document.getElementById('nombreReceptor').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const nombreEmpresa = document.getElementById('nombreEmpresa').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '')
            .substring(0, 20);
        const timestamp = new Date().toISOString().slice(0, 10);
        return `Oferta_Laboral_${nombreReceptor}_${nombreEmpresa}_${timestamp}.pdf`;
    }

    validateFormWithSignatures() {
        const emptyFields = [];
        
        // Campos mínimos requeridos
        const requiredFields = [
            'regionOferta', 'comunaOferta', 'fechaOferta',
            'nombreOferente', 'rutOferente', 'nombreEmpresa',
            'nombreReceptor', 'numeroPasaporte', 'nacionalidadReceptor', 'fechaNacimientoReceptor', 'domicilioReceptor',
            'nombreCargo', 'funcionesDesempenar', 'remuneracionMensual', 'tipoContrato', 'jornadaLaboral'
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
        const rutOferente = document.getElementById('rutOferente').value;
        if (rutOferente && !ConfigUtils.validateRUT(rutOferente)) {
            issues.push('RUT del oferente inválido');
        }

        const numeroPasaporte = document.getElementById('numeroPasaporte').value;
        if (numeroPasaporte && !ConfigUtils.validatePasaporte(numeroPasaporte)) {
            issues.push('Número de pasaporte inválido');
        }
        
        // Validar fechas
        const fechaOferta = document.getElementById('fechaOferta').value;
        if (fechaOferta && !ConfigUtils.validateDate(fechaOferta)) {
            issues.push('Fecha de la oferta inválida');
        }
        
        const fechaNacimientoReceptor = document.getElementById('fechaNacimientoReceptor').value;
        if (fechaNacimientoReceptor && !ConfigUtils.validateBirthDate(fechaNacimientoReceptor)) {
            issues.push('Fecha de nacimiento del receptor inválida');
        }
        
        // Validar remuneración
        const remuneracionMensual = document.getElementById('remuneracionMensual').value;
        if (remuneracionMensual && !ConfigUtils.validateRemuneracion(remuneracionMensual)) {
            issues.push('Remuneración inválida (debe ser mayor al sueldo mínimo)');
        }
        
        // Validar cargo y funciones
        const nombreCargo = document.getElementById('nombreCargo').value;
        if (nombreCargo && !ConfigUtils.validateCargo(nombreCargo)) {
            issues.push('Nombre del cargo inválido');
        }
        
        const funcionesDesempenar = document.getElementById('funcionesDesempenar').value;
        if (funcionesDesempenar && !ConfigUtils.validateFunciones(funcionesDesempenar)) {
            issues.push('Descripción de funciones insuficiente');
        }
        
        if (!systemState.firmasDigitales.oferente) {
            issues.push('Falta firma digital del oferente');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

// ===== CLASE PROCESADOR DE FIRMAS DIGITALES =====
class FirmaDigitalProcessor {
    constructor() {
        this.processedImageData = null;
        this.currentType = null;
        this.firmasDigitales = {
            oferente: null,
            receptor: null
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
            
            if (window.ofertaLaboralSystem) {
                window.ofertaLaboralSystem.updateProgress();
            }
            
            this.closeModal();
            
            if (window.ofertaLaboralSystem) {
                const tipoTexto = this.currentType === 'oferente' ? 'del oferente' : 'del receptor';
                window.ofertaLaboralSystem.showNotification(`Firma digital ${tipoTexto} aplicada correctamente`, 'success');
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
        this.firmasDigitales = { oferente: null, receptor: null };
        
        systemState.firmasDigitales = { oferente: false, receptor: false };
        
        ['oferente', 'receptor'].forEach(type => {
            const buttonId = `firma${type.charAt(0).toUpperCase() + type.slice(1)}`;
            const button = document.getElementById(buttonId);
            if (button) {
                button.classList.remove('signed');
                const textElement = button.querySelector('.signature-text');
                if (textElement) {
                    textElement.textContent = type === 'oferente' ? 'FIRMA OFERENTE' : 'FIRMA RECEPTOR';
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

// ===== CLASE PROCESADOR DE FOTOS CARNET =====
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
                if (p) p.textContent = 'Debe verse la foto, nombre y número de identificación';
                overlay.className = 'camera-overlay frente';
            } else if (this.currentStep === 'reverso') {
                if (h3) h3.textContent = 'Ahora posicione el REVERSO de su carnet';
                if (p) p.textContent = 'Debe verse la información adicional claramente';
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
                if (p) p.textContent = 'Verifique que se vea la información principal';
                if (span) span.textContent = 'Continuar al Reverso';
            } else if (this.currentStep === 'reverso') {
                if (h3) h3.textContent = 'Vista previa del REVERSO';
                if (p) p.textContent = 'Verifique que se vea la información adicional';
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
                errorTitle = 'Acceso Denegado';
                errorMessage = 'Permisos de cámara denegados';
                break;
            case 'NotFoundError':
                errorTitle = 'Cámara No Encontrada';
                errorMessage = 'No se detectó ninguna cámara';
                break;
            case 'NotReadableError':
                errorTitle = 'Cámara Ocupada';
                errorMessage = 'La cámara está siendo usada por otra aplicación';
                break;
            default:
                errorTitle = 'Error de Cámara';
                errorMessage = 'Error inesperado al acceder a la cámara';
        }

        this.showLoading(errorTitle, errorMessage);
        
        if (window.ofertaLaboralSystem) {
            window.ofertaLaboralSystem.showNotification(errorMessage, 'error');
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
            
            if (window.ofertaLaboralSystem) {
                window.ofertaLaboralSystem.showNotification(`Foto del ${this.currentStep} capturada`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            if (window.ofertaLaboralSystem) {
                window.ofertaLaboralSystem.showNotification('Error al capturar la foto', 'error');
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
            if (window.ofertaLaboralSystem) {
                window.ofertaLaboralSystem.showNotification('Ahora capture el reverso del carnet', 'info');
            }
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            this.currentStep = 'completed';
            this.showSummary();
            if (window.ofertaLaboralSystem) {
                window.ofertaLaboralSystem.showNotification('Ambas fotos capturadas', 'success');
            }
        }
    }

    restartProcess() {
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        if (window.ofertaLaboralSystem) {
            window.ofertaLaboralSystem.showNotification('Proceso reiniciado', 'info');
        }
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            if (window.ofertaLaboralSystem) {
                window.ofertaLaboralSystem.showNotification('Faltan fotos por capturar', 'error');
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
            
            if (window.ofertaLaboralSystem) {
                window.ofertaLaboralSystem.updateProgress();
            }

            this.closeModal();
            
            if (window.ofertaLaboralSystem) {
                const tipoPersona = this.currentType === 'oferente' ? 'oferente' : 'receptor';
                window.ofertaLaboralSystem.showNotification(`Carnet completo del ${tipoPersona} guardado`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al confirmar fotos:', error);
            if (window.ofertaLaboralSystem) {
                window.ofertaLaboralSystem.showNotification('Error al procesar las fotos', 'error');
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
        ['oferente', 'receptor'].forEach(type => {
            systemState.fotosCarnet[type] = {
                frente: { captured: false, imageData: null, timestamp: null },
                reverso: { captured: false, imageData: null, timestamp: null },
                completed: false
            };
            
            this.updateButton(type, false);
        });
    }
}

// ===== FUNCIONES GLOBALES =====
window.clearForm = function() {
    if (window.ofertaLaboralSystem) {
        window.ofertaLaboralSystem.clearForm();
    }
};

window.generatePDF = function() {
    if (window.ofertaLaboralSystem) {
        window.ofertaLaboralSystem.generatePDF();
    }
};

// ===== INICIALIZACIÓN DEL SISTEMA =====
let ofertaLaboralSystem;

function initializeOfertaLaboralSystem() {
    console.log('📋 Iniciando Sistema de Oferta Laboral para Extranjeros...');
    
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined') {
        console.warn('⚠️ jsPDF no está disponible, esperando...');
        setTimeout(initializeOfertaLaboralSystem, 1000);
        return;
    }
    
    // Verificar que CONFIG esté disponible
    if (typeof CONFIG === 'undefined') {
        console.warn('⚠️ CONFIG no está disponible, esperando...');
        setTimeout(initializeOfertaLaboralSystem, 1000);
        return;
    }
    
    try {
        ofertaLaboralSystem = new OfertaLaboralSystem();
        window.ofertaLaboralSystem = ofertaLaboralSystem;
        
        console.log('✅ Sistema completamente inicializado');
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        setTimeout(initializeOfertaLaboralSystem, 2000);
    }
}

// ===== MÚLTIPLES PUNTOS DE INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOfertaLaboralSystem);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initializeOfertaLaboralSystem, 500);
}

window.addEventListener('load', () => {
    if (!window.ofertaLaboralSystem) {
        console.log('🔄 Inicialización de respaldo activada');
        setTimeout(initializeOfertaLaboralSystem, 1000);
    }
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', (event) => {
    console.error('❌ Error global capturado:', event.error);
    
    if (window.ofertaLaboralSystem) {
        window.ofertaLaboralSystem.showNotification(
            'Se detectó un error. El sistema intentará recuperarse automáticamente.', 
            'warning'
        );
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
    
    if (window.ofertaLaboralSystem) {
        window.ofertaLaboralSystem.showNotification(
            'Error de conectividad detectado. Algunos componentes pueden funcionar de forma limitada.', 
            'warning'
        );
    }
});

// ===== COMPATIBILIDAD CON NAVEGADORES ANTIGUOS =====
if (!window.Promise) {
    console.error('❌ Navegador no compatible: Promise no está disponible');
}

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.warn('⚠️ Funciones de cámara no disponibles en este navegador');
}

if (!window.FileReader) {
    console.warn('⚠️ Funciones de carga de archivos limitadas');
}

// ===== LOG FINAL =====
console.log('📜 Sistema de Oferta Laboral para Extranjeros - Script principal cargado correctamente');