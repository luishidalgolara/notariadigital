// ========================================
// 📋 SISTEMA PRINCIPAL DE CONSTITUCIÓN DE FUNDACIÓN
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'ciudadAutorizacion', 'fechaAutorizacion',
        'nombreAutorizante', 'rutAutorizante', 'domicilioAutorizante', 'comunaAutorizante', 'relacionMenor', 'nacionalidadMenor', 'telefonoAcompanante',
        'nombreMenor', 'rutMenor', 'domicilioMenor', 'comunaMenor', 'paisDestino', 'ciudadDestino', 'duracionViaje',
        'motivoViaje', 'observacionesViaje', 'observacionesAdicionales',
        'edadMenor', 'fechaNacimientoMenor', 'viajaConPasaporte', 'aerolinea', 'direccionDestino',
        'nombreAcompanante', 'rutAcompanante', 'relacionAcompanante', 'medioTransporte', 'numeroVuelo', 'numeroPasaporte',
        'fechaSalida', 'fechaRegreso', 'vigenciaPasaporte'
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
class FundacionSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Constitución de Fundación...');
        
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
            'firmaAutorizante', 'firmaAcompanante',
            'photoAutorizante', 'photoAcompanante',
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
        // Validación RUT Fundador
        const rutAutorizante = document.getElementById('rutAutorizante');
        if (rutAutorizante) {
            rutAutorizante.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutAutorizante');
            });
        }

        // Validación RUT Fundación
        const rutMenor = document.getElementById('rutMenor');
        if (rutMenor) {
            rutMenor.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutMenor');
            });
        }

        // Validación RUT Presidente
        const rutAcompanante = document.getElementById('rutAcompanante');
        if (rutAcompanante) {
            rutAcompanante.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutAcompanante');
            });
        }

        // Auto-calcular patrimonio
        const edadMenor = document.getElementById('edadMenor');
        if (edadMenor) {
            edadMenor.addEventListener('input', () => {
                this.formatPatrimonio();
            });
        }

        // Auto-llenar fecha actual
        const fechaAutorizacion = document.getElementById('fechaAutorizacion');
        if (fechaAutorizacion) {
            fechaAutorizacion.addEventListener('change', () => {
                this.handleDateChange();
            });
        }

        // Control de fecha de aporte
        const fechaNacimientoMenor = document.getElementById('fechaNacimientoMenor');
        if (fechaNacimientoMenor) {
            fechaNacimientoMenor.addEventListener('change', () => {
                this.validateAporteDates();
            });
        }

        // Control de teléfono
        const telefonoAcompanante = document.getElementById('telefonoAcompanante');
        if (telefonoAcompanante) {
            telefonoAcompanante.addEventListener('input', (e) => {
                this.formatPhone(e);
            });
        }

        // Validación de nombre de fundación
        const nombreMenor = document.getElementById('nombreMenor');
        if (nombreMenor) {
            nombreMenor.addEventListener('input', () => {
                this.validateFundacionName();
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
        this.checkForDuplicateRUT();
    }

    formatPatrimonio() {
        const patrimonioField = document.getElementById('edadMenor');
        if (patrimonioField && patrimonioField.value) {
            const value = parseInt(patrimonioField.value);
            if (!isNaN(value) && value > 0) {
                patrimonioField.classList.add('age-valid');
                patrimonioField.classList.remove('age-invalid');
            } else {
                patrimonioField.classList.add('age-invalid');
                patrimonioField.classList.remove('age-valid');
            }
        }
        this.updatePreview();
    }

    formatPhone(event) {
        let value = event.target.value.replace(/\D/g, '');
        if (value.startsWith('56')) {
            value = '+' + value;
        } else if (value.startsWith('9')) {
            value = '+56 ' + value;
        }
        event.target.value = value;
    }

    validateFundacionName() {
        const nombreField = document.getElementById('nombreMenor');
        if (nombreField && nombreField.value) {
            const name = nombreField.value.trim();
            if (name.toLowerCase().includes('fundación') || name.length > 10) {
                nombreField.classList.add('rut-valid');
                nombreField.classList.remove('rut-invalid');
            } else {
                nombreField.classList.add('rut-invalid');
                nombreField.classList.remove('rut-valid');
                this.showNotification('El nombre debe incluir "Fundación" o ser más descriptivo', 'warning');
            }
        }
        this.updatePreview();
    }

    handleDateChange() {
        const fecha = document.getElementById('fechaAutorizacion').value;
        if (fecha && ConfigUtils.validateDate(fecha)) {
            const fechaAporte = document.getElementById('fechaNacimientoMenor');
            
            if (!fechaAporte.value) {
                const dateObj = new Date(fecha);
                dateObj.setDate(dateObj.getDate() + 30);
                fechaAporte.value = dateObj.toISOString().split('T')[0];
            }
        }
        this.updatePreview();
    }

    validateAporteDates() {
        const fechaConstitucion = document.getElementById('fechaAutorizacion').value;
        const fechaAporte = document.getElementById('fechaNacimientoMenor').value;
        
        if (fechaConstitucion && fechaAporte) {
            const constitucion = new Date(fechaConstitucion);
            const aporte = new Date(fechaAporte);
            
            if (aporte < constitucion) {
                this.showNotification('La fecha de aporte debe ser posterior a la constitución', 'warning');
            }
        }
    }

    checkForDuplicateRUT() {
        const rutFundador = document.getElementById('rutAutorizante').value;
        const rutPresidente = document.getElementById('rutAcompanante').value;
        
        const ruts = [rutFundador, rutPresidente].filter(rut => rut && rut.length > 8);
        const uniqueRuts = [...new Set(ruts)];
        
        if (ruts.length !== uniqueRuts.length) {
            this.showNotification('El fundador y presidente no pueden tener el mismo RUT', 'warning');
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
        const nombreFundador = document.getElementById('nombreAutorizante').value;
        const nombrePresidente = document.getElementById('nombreAcompanante').value;
        const rutFundador = document.getElementById('rutAutorizante').value;
        const rutPresidente = document.getElementById('rutAcompanante').value;
        
        const prev_nombreAutorizante2 = document.getElementById('prev_nombreAutorizante2');
        const prev_rutAutorizante2 = document.getElementById('prev_rutAutorizante2');
        const prev_nombreAcompanante2 = document.getElementById('prev_nombreAcompanante2');
        const prev_rutAcompanante2 = document.getElementById('prev_rutAcompanante2');
        
        if (prev_nombreAutorizante2) prev_nombreAutorizante2.textContent = nombreFundador || '........................';
        if (prev_rutAutorizante2) prev_rutAutorizante2.textContent = rutFundador || '................';
        if (prev_nombreAcompanante2) prev_nombreAcompanante2.textContent = nombrePresidente || '........................';
        if (prev_rutAcompanante2) prev_rutAcompanante2.textContent = rutPresidente || '................';
        
        const ciudadConstitucion = document.getElementById('ciudadAutorizacion').value;
        const prev_ciudadAutorizacion2 = document.getElementById('prev_ciudadAutorizacion2');
        if (prev_ciudadAutorizacion2) {
            prev_ciudadAutorizacion2.textContent = ciudadConstitucion || '.........';
        }
    }

    updateDatePreview() {
        const fechaConstitucion = document.getElementById('fechaAutorizacion').value;
        
        if (fechaConstitucion && ConfigUtils.validateDate(fechaConstitucion)) {
            const date = new Date(fechaConstitucion);
            
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
            if (prev_anio) prev_anio.textContent = '20..';
        }
    }

    updateSignatureNames() {
        const nombreFundador = document.getElementById('nombreAutorizante').value;
        const nombrePresidente = document.getElementById('nombreAcompanante').value;
        
        const firmaFundador = document.getElementById('prev_firmaAutorizante');
        const firmaPresidente = document.getElementById('prev_firmaAcompanante');
        
        if (firmaFundador) {
            firmaFundador.textContent = nombreFundador || '_______________';
        }
        
        if (firmaPresidente) {
            firmaPresidente.textContent = nombrePresidente || '_______________';
        }
    }

    getPlaceholderText(field) {
        const placeholders = {
            'ciudadAutorizacion': '.........',
            'nombreAutorizante': '.........................',
            'nombreMenor': '.........................',
            'nombreAcompanante': '.........................',
            'rutAutorizante': '................',
            'rutMenor': '................',
            'rutAcompanante': '................',
            'domicilioAutorizante': '.........................',
            'domicilioMenor': '.........................',
            'comunaAutorizante': '...........',
            'comunaMenor': '...........',
            'paisDestino': '...........',
            'ciudadDestino': '...........',
            'duracionViaje': 'Indefinida',
            'motivoViaje': '...........',
            'relacionMenor': '.........................',
            'relacionAcompanante': '.........................',
            'telefonoAcompanante': '...........',
            'direccionDestino': '.........................',
            'medioTransporte': '...........',
            'numeroVuelo': '...........',
            'aerolinea': '...........',
            'numeroPasaporte': '...........',
            'observacionesViaje': '........................................................................................',
            'observacionesAdicionales': '........................',
            'nacionalidadMenor': '.........................',
            'edadMenor': '................',
            'viajaConPasaporte': '...........',
            'vigenciaPasaporte': '........................'
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
        
        if (systemState.firmasDigitales.autorizante) bonusScore += 0.5;
        if (systemState.firmasDigitales.acompanante) bonusScore += 0.5;
        
        if (systemState.fotosCarnet.autorizante.completed) bonusScore += 0.5;
        if (systemState.fotosCarnet.acompanante.completed) bonusScore += 0.5;
        
        const progress = ((filledFields + bonusScore) / (totalFields + 2)) * 100;
        
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
        
        const requiredElements = ['firmaModalOverlay', 'firmaAutorizante', 'firmaAcompanante'];
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
        
        const btnFirmaFundador = document.getElementById('firmaAutorizante');
        const btnFirmaPresidente = document.getElementById('firmaAcompanante');
        
        if (!btnFirmaFundador || !btnFirmaPresidente) {
            throw new Error('Botones de firma no encontrados');
        }
        
        btnFirmaFundador.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('autorizante');
        });
        
        btnFirmaPresidente.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('acompanante');
        });
        
        console.log('✅ Botones de firma configurados correctamente');
    }

    openSignatureModalSafe(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        let nombreField;
        let entityName;
        
        if (type === 'autorizante') {
            nombreField = document.getElementById('nombreAutorizante');
            entityName = 'fundador';
        } else {
            nombreField = document.getElementById('nombreAcompanante');
            entityName = 'presidente del directorio';
        }
        
        if (!nombreField || !nombreField.value.trim()) {
            this.showNotification(`Complete el nombre del ${entityName} antes de firmar`, 'warning');
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
        
        const btnPhotoFundador = document.getElementById('photoAutorizante');
        const btnPhotoPresidente = document.getElementById('photoAcompanante');
        
        if (!btnPhotoFundador || !btnPhotoPresidente) {
            throw new Error('Botones de foto no encontrados');
        }
        
        btnPhotoFundador.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('autorizante');
        });
        
        btnPhotoPresidente.addEventListener('click', (e) => {
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
            entityName = 'fundador';
        } else {
            nombreField = document.getElementById('nombreAcompanante');
            entityName = 'presidente del directorio';
        }
        
        if (!nombreField || !nombreField.value.trim()) {
            this.showNotification(`Complete el nombre del ${entityName} antes de tomar fotos`, 'warning');
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
            localStorage.setItem('fundacion_form_data', JSON.stringify(data));
        } catch (error) {
            console.warn('⚠️ No se pudo guardar automáticamente:', error);
        }
    }

    restoreFormState() {
        try {
            const savedData = localStorage.getItem('fundacion_form_data');
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
        const fechaConstitucion = document.getElementById('fechaAutorizacion');
        if (fechaConstitucion && !fechaConstitucion.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaConstitucion.value = today;
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
                        element.classList.remove('rut-valid', 'rut-invalid', 'age-valid', 'age-invalid');
                    }
                });
                
                const fechaConstitucion = document.getElementById('fechaAutorizacion');
                if (fechaConstitucion) {
                    const today = new Date().toISOString().split('T')[0];
                    fechaConstitucion.value = today;
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
                this.showNotification('PDF de Constitución de Fundación generado exitosamente', 'success');
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
        doc.text('CONSTITUCIÓN DE FUNDACIÓN', 105, y, { align: 'center' });
        y += 30;

        // Contenido principal
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        
        const nombreFundador = document.getElementById('nombreAutorizante').value;
        const rutFundador = document.getElementById('rutAutorizante').value;
        const estadoCivil = document.getElementById('relacionMenor').value;
        const profesion = document.getElementById('nacionalidadMenor').value;
        const domicilioFundador = document.getElementById('domicilioAutorizante').value;
        const comunaFundador = document.getElementById('comunaAutorizante').value;
        
        const nombreFundacion = document.getElementById('nombreMenor').value;
        const domicilioFundacion = document.getElementById('domicilioMenor').value;
        const comunaFundacion = document.getElementById('comunaMenor').value;
        const provincia = document.getElementById('paisDestino').value;
        const region = document.getElementById('ciudadDestino').value;
        
        const objetoFundacion = document.getElementById('observacionesViaje').value;
        const patrimonio = document.getElementById('edadMenor').value;
        
        const nombrePresidente = document.getElementById('nombreAcompanante').value;
        const rutPresidente = document.getElementById('rutAcompanante').value;

        // Párrafo principal de constitución
        const ciudadConstitucion = document.getElementById('ciudadAutorizacion').value;
        const fechaConstitucion = document.getElementById('fechaAutorizacion').value;
        const fechaConstitucionObj = new Date(fechaConstitucion);
        
        const parrafo1 = `En ${ciudadConstitucion}, a ${fechaConstitucionObj.getDate()} de ${this.mesesEspanol[fechaConstitucionObj.getMonth()]} de ${fechaConstitucionObj.getFullYear()}, siendo las .... horas, comparece don(ña) ${nombreFundador}, cédula nacional de identidad número ${rutFundador}, ${estadoCivil}, de profesión ${profesion}, domiciliado(a) en ${domicilioFundador}, comuna ${comunaFundador}, manifestando su voluntad de constituir una Fundación de Derecho Privado, sin fin de lucro, denominada "${nombreFundacion}".`;
        
        doc.text(parrafo1, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, parrafo1, pageWidth - 2 * margin) + 15;

        // Título I - Nombre, Objeto, Domicilio y Duración
        doc.setFont('times', 'bold');
        doc.text('TÍTULO I - Del Nombre, Objeto, Domicilio y Duración', margin, y);
        y += 10;
        
        doc.setFont('times', 'normal');
        const titulo1 = `Créase una Fundación de Beneficencia, sin fines de lucro, regida por las normas del Título XXXIII del Libro Primero del Código Civil y por las disposiciones contenidas en la Ley Nº 20.500, que tendrá como domicilio la Comuna de ${comunaFundacion}, Provincia de ${provincia} de la Región ${region}. El nombre de la Fundación será "${nombreFundacion}". El objeto de la Fundación será ${objetoFundacion}.`;
        
        doc.text(titulo1, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, titulo1, pageWidth - 2 * margin) + 15;

        // Título II - Del Patrimonio
        doc.setFont('times', 'bold');
        doc.text('TÍTULO II - Del Patrimonio', margin, y);
        y += 10;
        
        doc.setFont('times', 'normal');
        const titulo2 = `El patrimonio de la Fundación estará formado por la suma de ${patrimonio} pesos, que el fundador destina y se obliga a aportar a la Fundación tan pronto se inscriba en el Registro Nacional de Personas Jurídicas sin Fines de Lucro a cargo del Registro Civil e Identificación.`;
        
        doc.text(titulo2, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, titulo2, pageWidth - 2 * margin) + 15;

        // Título III - De los Órganos de Administración
        doc.setFont('times', 'bold');
        doc.text('TÍTULO III - De los Órganos de Administración', margin, y);
        y += 10;
        
        doc.setFont('times', 'normal');
        const duracionDirectorio = document.getElementById('relacionAcompanante').value;
        const titulo3 = `La Fundación será administrada por un Directorio que tendrá a su cargo la dirección superior de la Fundación. Estará compuesto por un Presidente: ${nombrePresidente}, RUT ${rutPresidente}, y demás miembros que se designen conforme a los estatutos. El Directorio durará ${duracionDirectorio}.`;
        
        doc.text(titulo3, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, titulo3, pageWidth - 2 * margin) + 25;

        // Cláusula legal destacada
        doc.setFillColor(59, 130, 246, 0.1);
        doc.rect(margin, y - 5, pageWidth - 2 * margin, 25, 'F');
        doc.setDrawColor(59, 130, 246);
        doc.rect(margin, y - 5, pageWidth - 2 * margin, 25);
        
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        const clausulaLegal = 'Esta constitución se rige por las disposiciones del Código Civil y la Ley Nº 20.500 sobre Asociaciones y Participación Ciudadana en la Gestión Pública.';
        doc.text(clausulaLegal, 105, y + 7, { align: 'center', maxWidth: pageWidth - 4 * margin });
        y += 40;

        // Verificar si necesitamos nueva página
        if (y > 200) {
            doc.addPage();
            y = 30;
        }

        // Firmas
        this.addSignatureSection(doc, y);
        
        // Nota legal
        if (y > 180) {
            doc.addPage();
            y = 30;
        } else {
            y += 80;
        }

        // Línea para notario
        doc.setDrawColor(59, 130, 246);
        doc.line(75, y, 135, y);
        y += 8;
        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        doc.text('NOTARIO', 105, y, { align: 'center' });
        y += 20;

        doc.setFont('times', 'italic');
        doc.setFontSize(9);
        doc.text('Nota: Esta constitución debe ser presentada ante el Servicio de Registro Civil e Identificación para su inscripción en el Registro Nacional de Personas Jurídicas sin Fines de Lucro. Se recomienda verificar el cumplimiento de todos los requisitos legales.', margin, y, {maxWidth: pageWidth - 2 * margin});
        
        this.addDigitalWatermark(doc);
    }

    addSignatureSection(doc, y) {
        console.log('📄 Agregando sección de firmas al PDF...');
        
        // Firmas lado a lado
        const leftX = 40;
        const rightX = 120;
        
        // Líneas de firma
        doc.line(leftX, y, leftX + 50, y);
        doc.line(rightX, y, rightX + 50, y);
        y += 8;
        
        // Nombres
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        const nombreFundador = document.getElementById('nombreAutorizante').value;
        const nombrePresidente = document.getElementById('nombreAcompanante').value;
        
        doc.text(nombreFundador, leftX + 25, y, { align: 'center' });
        doc.text(nombrePresidente, rightX + 25, y, { align: 'center' });
        y += 6;
        
        // Roles
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('FUNDADOR', leftX + 25, y, { align: 'center' });
        doc.text('PRESIDENTE DIRECTORIO', rightX + 25, y, { align: 'center' });
        y += 6;
        
        // Información adicional
        const rutFundador = document.getElementById('rutAutorizante').value;
        const rutPresidente = document.getElementById('rutAcompanante').value;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.text(`RUT: ${rutFundador}`, leftX + 25, y, { align: 'center' });
        doc.text(`RUT: ${rutPresidente}`, rightX + 25, y, { align: 'center' });
        
        // Agregar firmas digitales si existen
        if (window.firmaProcessor) {
            try {
                const firmaFundador = window.firmaProcessor.getSignatureForPDF('autorizante');
                const firmaPresidente = window.firmaProcessor.getSignatureForPDF('acompanante');
                
                if (firmaFundador) {
                    doc.addImage(firmaFundador, 'PNG', leftX, y - 35, 50, 25);
                    console.log('✅ Firma del fundador agregada al PDF');
                }
                
                if (firmaPresidente) {
                    doc.addImage(firmaPresidente, 'PNG', rightX, y - 35, 50, 25);
                    console.log('✅ Firma del presidente agregada al PDF');
                }
                
                if (firmaFundador || firmaPresidente) {
                    doc.setFont('times', 'italic');
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text('Documento con firmas digitales aplicadas', 105, y + 15, { align: 'center' });
                    doc.setTextColor(0, 0, 0);
                }
            } catch (error) {
                console.error('❌ Error agregando firmas digitales al PDF:', error);
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
        return lines.length * 5;
    }

    generateFileName() {
        const nombreFundador = document.getElementById('nombreAutorizante').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const nombreFundacion = document.getElementById('nombreMenor').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const timestamp = new Date().toISOString().slice(0, 10);
        return `Constitucion_Fundacion_${nombreFundador}_${nombreFundacion}_${timestamp}.pdf`;
    }

    validateFormWithSignatures() {
        const emptyFields = [];
        
        // Campos mínimos requeridos para constitución de fundación
        const requiredFields = [
            'ciudadAutorizacion', 'fechaAutorizacion',
            'nombreAutorizante', 'rutAutorizante', 'domicilioAutorizante', 'comunaAutorizante', 'relacionMenor', 'nacionalidadMenor',
            'nombreMenor', 'domicilioMenor', 'comunaMenor', 'paisDestino', 'ciudadDestino',
            'motivoViaje', 'observacionesViaje', 'edadMenor',
            'nombreAcompanante', 'rutAcompanante', 'relacionAcompanante'
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
        const rutFundador = document.getElementById('rutAutorizante').value;
        const rutPresidente = document.getElementById('rutAcompanante').value;
        
        if (rutFundador && !ConfigUtils.validateRUT(rutFundador)) {
            issues.push('RUT del fundador inválido');
        }
        
        if (rutPresidente && !ConfigUtils.validateRUT(rutPresidente)) {
            issues.push('RUT del presidente inválido');
        }
        
        // Verificar RUTs duplicados
        if (rutFundador && rutPresidente && rutFundador === rutPresidente) {
            issues.push('El fundador y presidente no pueden tener el mismo RUT');
        }
        
        // Validar patrimonio
        const patrimonio = parseInt(document.getElementById('edadMenor').value);
        if (isNaN(patrimonio) || patrimonio <= 0) {
            issues.push('El patrimonio inicial debe ser mayor a 0');
        }
        
        // Validar fechas
        const fechaConstitucion = document.getElementById('fechaAutorizacion').value;
        const fechaAporte = document.getElementById('fechaNacimientoMenor').value;
        
        if (fechaConstitucion && fechaAporte) {
            const constitucion = new Date(fechaConstitucion);
            const aporte = new Date(fechaAporte);
            
            if (aporte < constitucion) {
                issues.push('La fecha de aporte debe ser posterior a la constitución');
            }
        }
        
        if (!systemState.firmasDigitales.autorizante) {
            issues.push('Falta firma digital del fundador');
        }
        
        if (!systemState.firmasDigitales.acompanante) {
            issues.push('Falta firma digital del presidente');
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
                    if (this.currentType === 'autorizante') {
                        textElement.textContent = 'FIRMADO DIGITALMENTE';
                    } else {
                        textElement.textContent = 'FIRMA PRESIDENTE';
                    }
                }
            }
            
            this.updateSignaturePreview(this.currentType, this.processedImageData);
            
            if (window.fundacionSystem) {
                window.fundacionSystem.updateProgress();
            }
            
            this.closeModal();
            
            if (window.fundacionSystem) {
                const entityName = this.currentType === 'autorizante' ? 'fundador' : 'presidente';
                window.fundacionSystem.showNotification(`Firma digital del ${entityName} aplicada correctamente`, 'success');
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
        
        ['autorizante', 'acompanante'].forEach(type => {
            const buttonId = `firma${type.charAt(0).toUpperCase() + type.slice(1)}`;
            const button = document.getElementById(buttonId);
            if (button) {
                button.classList.remove('signed');
                const textElement = button.querySelector('.signature-text');
                if (textElement) {
                    if (type === 'autorizante') {
                        textElement.textContent = 'FIRMA DIGITAL';
                    } else {
                        textElement.textContent = 'FIRMA PRESIDENTE';
                    }
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
        
        if (window.fundacionSystem) {
            window.fundacionSystem.showNotification(errorMessage, 'error');
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
            
            if (window.fundacionSystem) {
                window.fundacionSystem.showNotification(`Foto del ${this.currentStep} capturada`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            if (window.fundacionSystem) {
                window.fundacionSystem.showNotification('Error al capturar la foto', 'error');
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
            if (window.fundacionSystem) {
                window.fundacionSystem.showNotification('Ahora capture el reverso del carnet', 'info');
            }
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            this.currentStep = 'completed';
            this.showSummary();
            if (window.fundacionSystem) {
                window.fundacionSystem.showNotification('Ambas fotos capturadas', 'success');
            }
        }
    }

    restartProcess() {
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        if (window.fundacionSystem) {
            window.fundacionSystem.showNotification('Proceso reiniciado', 'info');
        }
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            if (window.fundacionSystem) {
                window.fundacionSystem.showNotification('Faltan fotos por capturar', 'error');
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
            
            if (window.fundacionSystem) {
                window.fundacionSystem.updateProgress();
            }

            this.closeModal();
            
            if (window.fundacionSystem) {
                const entityName = this.currentType === 'autorizante' ? 'fundador' : 'presidente';
                window.fundacionSystem.showNotification(`Carnet completo del ${entityName} guardado`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al confirmar fotos:', error);
            if (window.fundacionSystem) {
                window.fundacionSystem.showNotification('Error al procesar las fotos', 'error');
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
        ['autorizante', 'acompanante'].forEach(type => {
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
    if (window.fundacionSystem) {
        window.fundacionSystem.clearForm();
    }
};

window.generatePDF = function() {
    if (window.fundacionSystem) {
        window.fundacionSystem.generatePDF();
    }
};

// ===== INICIALIZACIÓN DEL SISTEMA =====
let fundacionSystem;

function initializeFundacionSystem() {
    console.log('📋 Iniciando Sistema de Constitución de Fundación...');
    
    if (typeof window.jspdf === 'undefined') {
        console.warn('⚠️ jsPDF no está disponible, esperando...');
        setTimeout(initializeFundacionSystem, 1000);
        return;
    }
    
    if (typeof CONFIG === 'undefined') {
        console.warn('⚠️ CONFIG no está disponible, esperando...');
        setTimeout(initializeFundacionSystem, 1000);
        return;
    }
    
    try {
        fundacionSystem = new FundacionSystem();
        window.fundacionSystem = fundacionSystem;
        
        console.log('✅ Sistema completamente inicializado');
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        setTimeout(initializeFundacionSystem, 2000);
    }
}

// ===== MÚLTIPLES PUNTOS DE INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFundacionSystem);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initializeFundacionSystem, 500);
}

window.addEventListener('load', () => {
    if (!window.fundacionSystem) {
        console.log('🔄 Inicialización de respaldo activada');
        setTimeout(initializeFundacionSystem, 1000);
    }
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', (event) => {
    console.error('❌ Error global capturado:', event.error);
    
    if (window.fundacionSystem) {
        window.fundacionSystem.showNotification(
            'Se detectó un error. El sistema intentará recuperarse automáticamente.', 
            'warning'
        );
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
    
    if (window.fundacionSystem) {
        window.fundacionSystem.showNotification(
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

// ===== UTILIDADES DE DEPURACIÓN =====
if (CONFIG.DEBUG.enabled) {
    window.debugFundacion = {
        getSystemState: () => systemState,
        getConfig: () => CONFIG,
        clearStorage: () => {
            localStorage.removeItem('fundacion_form_data');
            console.log('🗑️ Almacenamiento local limpiado');
        },
        simulateError: (type = 'general') => {
            switch (type) {
                case 'camera':
                    throw new Error('Error simulado de cámara');
                case 'signature':
                    throw new Error('Error simulado de firma');
                case 'pdf':
                    throw new Error('Error simulado de PDF');
                default:
                    throw new Error('Error simulado general');
            }
        },
        testValidations: () => {
            console.log('🧪 Pruebas de validación:');
            console.log('RUT válido:', ConfigUtils.validateRUT('12.345.678-5'));
            console.log('RUT inválido:', ConfigUtils.validateRUT('12.345.678-0'));
            console.log('Fecha válida:', ConfigUtils.validateDate('2024-12-25'));
            console.log('Fecha inválida:', ConfigUtils.validateDate('2024-13-45'));
        },
        forceTheme: (theme) => {
            if (window.fundacionSystem) {
                window.fundacionSystem.applyTheme(theme);
                console.log(`🎨 Tema forzado a: ${theme}`);
            }
        }
    };
    
    console.log('🐛 Modo debug activado. Usa window.debugFundacion para herramientas de desarrollo.');
}

// ===== PERFORMANCE MONITORING =====
if (CONFIG.DEBUG.show_performance) {
    const performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
            if (entry.duration > 100) { // Solo mostrar operaciones que tomen más de 100ms
                console.log(`⏱️ Performance: ${entry.name} tomó ${entry.duration.toFixed(2)}ms`);
            }
        });
    });
    
    performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
}

// ===== DETECCIÓN DE ACCESIBILIDAD =====
const accessibilityPrefs = ConfigUtils.detectAccessibilityPreferences();
if (accessibilityPrefs.reducedMotion) {
    document.documentElement.style.setProperty('--transition-fast', 'none');
    document.documentElement.style.setProperty('--transition-normal', 'none');
    document.documentElement.style.setProperty('--transition-slow', 'none');
    console.log('♿ Animaciones reducidas por preferencias de accesibilidad');
}

// ===== LIMPIEZA AL CERRAR =====
window.addEventListener('beforeunload', () => {
    if (window.fundacionSystem) {
        window.fundacionSystem.stopAutoSave();
    }
    
    if (window.photoProcessor) {
        window.photoProcessor.stopCamera();
    }
});

// ===== LOG FINAL =====
console.log('📜 Sistema de Constitución de Fundación - Script principal cargado correctamente');