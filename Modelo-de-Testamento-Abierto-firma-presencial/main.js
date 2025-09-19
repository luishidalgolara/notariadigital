// ========================================
// 📋 SISTEMA PRINCIPAL DE TESTAMENTO ABIERTO
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'ciudadTestamento', 'fechaTestamento', 'horaTestamento', 'calleOficio', 'numeroOficio',
        'nombreNotario', 'regionNotario', 
        'nombreTestador', 'origenTestador', 'nacionalidadTestador', 'edadTestador', 
        'cedulaTestador', 'profesionTestador', 'direccionTestador', 'numeroDomicilio', 
        'ciudadDomicilio', 'comunaDomicilio',
        'ciudadNacimiento', 'fechaNacimiento', 'numeroRegistro', 'circunscripcion',
        'nombrePadre', 'nombreMadre', 'estadoPadres',
        'estadoCivil', 'nombreConyuge', 'nombreConyugeAnterior', 'hijosLegitimos', 'hijosNaturales',
        'bienesInmuebles', 'bienesMuebles', 'otrosBienes',
        'herederosMejoras', 'porcentajeLibreDisposicion', 'herederosLibreDisposicion', 'herederosSubstitutos',
        'legadoBienRaiz', 'legadoEspecies', 'legadoDinero',
        'albaceaFiduciario', 'albaceaTenencia', 'partidorHerencia',
        'nombreTestigo1', 'cedulaTestigo1', 'domicilioTestigo1',
        'nombreTestigo2', 'cedulaTestigo2', 'domicilioTestigo2',
        'nombreTestigo3', 'cedulaTestigo3', 'domicilioTestigo3'
    ],
    
    firmasDigitales: {
        testador: false
    },
    
    fotosCarnet: {
        testador: {
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
class TestamentoAbiertoSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Testamento Abierto...');
        
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
            'firmaTestador', 'photoTestador',
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
        // Validación Cédula Testador
        const cedulaTestador = document.getElementById('cedulaTestador');
        if (cedulaTestador) {
            cedulaTestador.addEventListener('input', (e) => {
                this.handleCedulaInput(e, 'cedulaTestador');
            });
        }

        // Validación Cédulas Testigos
        ['cedulaTestigo1', 'cedulaTestigo2', 'cedulaTestigo3'].forEach(cedulaId => {
            const cedula = document.getElementById(cedulaId);
            if (cedula) {
                cedula.addEventListener('input', (e) => {
                    this.handleCedulaInput(e, cedulaId);
                });
            }
        });

        // Auto-llenar fecha actual
        const fechaTestamento = document.getElementById('fechaTestamento');
        if (fechaTestamento && !fechaTestamento.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaTestamento.value = today;
        }

        // Auto-llenar hora actual
        const horaTestamento = document.getElementById('horaTestamento');
        if (horaTestamento && !horaTestamento.value) {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            horaTestamento.value = `${hours}:${minutes}`;
        }

        // Validar edad del testador
        const edadTestador = document.getElementById('edadTestador');
        if (edadTestador) {
            edadTestador.addEventListener('input', (e) => {
                const valor = parseInt(e.target.value);
                if (!isNaN(valor) && ConfigUtils.validateAge(valor)) {
                    e.target.classList.add('edad-valid');
                    e.target.classList.remove('edad-invalid');
                } else if (e.target.value !== '') {
                    e.target.classList.add('edad-invalid');
                    e.target.classList.remove('edad-valid');
                } else {
                    e.target.classList.remove('edad-valid', 'edad-invalid');
                }
                this.updatePreview();
            });
        }

        // Validar nombres
        ['nombreTestador', 'nombreNotario', 'nombrePadre', 'nombreMadre', 'nombreConyuge',
         'nombreTestigo1', 'nombreTestigo2', 'nombreTestigo3'].forEach(nombreId => {
            const nombre = document.getElementById(nombreId);
            if (nombre) {
                nombre.addEventListener('input', (e) => {
                    if (ConfigUtils.validateName(e.target.value)) {
                        e.target.classList.add('nombre-valid');
                        e.target.classList.remove('nombre-invalid');
                    } else if (e.target.value !== '') {
                        e.target.classList.add('nombre-invalid');
                        e.target.classList.remove('nombre-valid');
                    } else {
                        e.target.classList.remove('nombre-valid', 'nombre-invalid');
                    }
                    this.updatePreview();
                });
            }
        });

        // Validar números de dirección
        ['numeroDomicilio', 'numeroOficio'].forEach(numeroId => {
            const numero = document.getElementById(numeroId);
            if (numero) {
                numero.addEventListener('input', (e) => {
                    if (ConfigUtils.validateNumeroAddress(e.target.value)) {
                        e.target.classList.add('numero-valid');
                        e.target.classList.remove('numero-invalid');
                    } else if (e.target.value !== '') {
                        e.target.classList.add('numero-invalid');
                        e.target.classList.remove('numero-valid');
                    } else {
                        e.target.classList.remove('numero-valid', 'numero-invalid');
                    }
                    this.updatePreview();
                });
            }
        });

        // Validar fecha de nacimiento
        const fechaNacimiento = document.getElementById('fechaNacimiento');
        if (fechaNacimiento) {
            fechaNacimiento.addEventListener('change', (e) => {
                if (ConfigUtils.validateFechaNacimiento(e.target.value)) {
                    e.target.classList.add('fecha-valid');
                    e.target.classList.remove('fecha-invalid');
                } else if (e.target.value !== '') {
                    e.target.classList.add('fecha-invalid');
                    e.target.classList.remove('fecha-valid');
                } else {
                    e.target.classList.remove('fecha-valid', 'fecha-invalid');
                }
                this.updatePreview();
            });
        }

        // Auto-llenar porcentaje de libre disposición por defecto
        const porcentajeLibreDisposicion = document.getElementById('porcentajeLibreDisposicion');
        if (porcentajeLibreDisposicion && !porcentajeLibreDisposicion.value) {
            porcentajeLibreDisposicion.value = CONFIG.TESTAMENTO.porcentaje_libre_disposicion_default;
        }
    }

    handleCedulaInput(event, fieldId) {
        const formatted = ConfigUtils.formatCedula(event.target.value);
        event.target.value = formatted;
        
        if (formatted.length > 8) {
            const isValid = ConfigUtils.validateCedula(formatted);
            event.target.classList.toggle('cedula-valid', isValid);
            event.target.classList.toggle('cedula-invalid', !isValid);
        } else {
            event.target.classList.remove('cedula-valid', 'cedula-invalid');
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
        this.updateTimePreview();
        this.updateSignatureNames();
        this.updateProgress();
    }

    updateDuplicateReferences() {
        // Actualizar referencias duplicadas en el documento
        const nombreTestador = document.getElementById('nombreTestador').value;
        const cedulaTestador = document.getElementById('cedulaTestador').value;
        const nombreConyuge = document.getElementById('nombreConyuge').value;
        const ciudadNacimiento = document.getElementById('ciudadNacimiento').value;
        
        const prev_cedulaTestador2 = document.getElementById('prev_cedulaTestador2');
        const prev_nombreConyuge2 = document.getElementById('prev_nombreConyuge2');
        const prev_ciudadNacimiento2 = document.getElementById('prev_ciudadNacimiento2');
        
        if (prev_cedulaTestador2) {
            prev_cedulaTestador2.textContent = cedulaTestador || '___________';
        }
        
        if (prev_nombreConyuge2) {
            prev_nombreConyuge2.textContent = nombreConyuge || '_________________________';
        }
        
        if (prev_ciudadNacimiento2) {
            prev_ciudadNacimiento2.textContent = ciudadNacimiento || '_________________';
        }
    }

    updateDatePreview() {
        const fechaTestamento = document.getElementById('fechaTestamento').value;
        const fechaNacimiento = document.getElementById('fechaNacimiento').value;
        
        // Actualizar fecha del testamento
        if (fechaTestamento && ConfigUtils.validateDate(fechaTestamento)) {
            const dateFormat = ConfigUtils.formatDateToSpanish(fechaTestamento);
            
            const prev_dia = document.getElementById('prev_dia');
            const prev_mes = document.getElementById('prev_mes');
            const prev_anio = document.getElementById('prev_anio');
            
            if (prev_dia) prev_dia.textContent = dateFormat.dia;
            if (prev_mes) prev_mes.textContent = dateFormat.mes;
            if (prev_anio) prev_anio.textContent = dateFormat.anio;
        }

        // Actualizar fecha de nacimiento
        if (fechaNacimiento && ConfigUtils.validateFechaNacimiento(fechaNacimiento)) {
            const birthFormat = ConfigUtils.formatDateToSpanish(fechaNacimiento);
            const prev_fechaNacimiento = document.getElementById('prev_fechaNacimiento');
            
            if (prev_fechaNacimiento) {
                prev_fechaNacimiento.textContent = `${birthFormat.dia} de ${birthFormat.mes} de ${birthFormat.anio}`;
            }
        }
    }

    updateTimePreview() {
        const horaTestamento = document.getElementById('horaTestamento').value;
        const prev_horaTestamento = document.getElementById('prev_horaTestamento');
        
        if (prev_horaTestamento) {
            prev_horaTestamento.textContent = ConfigUtils.formatTimeForDocument(horaTestamento);
        }
    }

    updateSignatureNames() {
        const nombreTestador = document.getElementById('nombreTestador').value;
        const firmaTestador = document.getElementById('prev_firmaTestador');
        
        if (firmaTestador) {
            firmaTestador.textContent = nombreTestador || '_______________';
        }
    }

    getPlaceholderText(field) {
        const placeholders = {
            'ciudadTestamento': 'Santiago',
            'nombreNotario': '_________________________',
            'nombreTestador': '_________________________',
            'cedulaTestador': 'XX.XXX.XXX-X',
            'edadTestador': '65',
            'nombrePadre': '_________________________',
            'nombreMadre': '_________________________',
            'nombreConyuge': '_________________________',
            'nombreConyugeAnterior': '_________________________',
            'direccionTestador': '_________________________',
            'numeroDomicilio': '____',
            'ciudadDomicilio': '_________________',
            'comunaDomicilio': '___________',
            'calleOficio': '_________________',
            'numeroOficio': '____',
            'origenTestador': '_________________',
            'nacionalidadTestador': '_________________',
            'profesionTestador': '_________________',
            'ciudadNacimiento': '_________________',
            'numeroRegistro': '________',
            'circunscripcion': '_________________',
            'estadoPadres': 'ambos fallecidos',
            'estadoCivil': '_________________',
            'hijosLegitimos': '_________________________',
            'hijosNaturales': '_________________________',
            'bienesInmuebles': '_________________________',
            'bienesMuebles': '_________________________',
            'otrosBienes': '_________________________',
            'herederosMejoras': '_________________________',
            'herederosLibreDisposicion': '_________________________',
            'herederosSubstitutos': '_________________________',
            'legadoBienRaiz': '_________________________',
            'legadoEspecies': '_________________________',
            'legadoDinero': '_________________________',
            'albaceaFiduciario': '_________________________',
            'albaceaTenencia': '_________________________',
            'partidorHerencia': '_________________________',
            'porcentajeLibreDisposicion': '25',
            'nombreTestigo1': '_________________',
            'cedulaTestigo1': '_________________',
            'domicilioTestigo1': '_________________',
            'nombreTestigo2': '_________________',
            'cedulaTestigo2': '_________________',
            'domicilioTestigo2': '_________________',
            'nombreTestigo3': '_________________',
            'cedulaTestigo3': '_________________',
            'domicilioTestigo3': '_________________'
        };
        
        return placeholders[field] || '________';
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
        
        if (systemState.firmasDigitales.testador) bonusScore += 0.5;
        if (systemState.fotosCarnet.testador.completed) bonusScore += 0.5;
        
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

    // ===== SISTEMA DE FIRMAS DIGITALES =====
    async initializeSignatureSystemSafe() {
        console.log('🖋️ Inicializando sistema de firmas digitales...');
        
        const requiredElements = ['firmaModalOverlay', 'firmaTestador'];
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
        
        const btnFirmaTestador = document.getElementById('firmaTestador');
        
        if (!btnFirmaTestador) {
            throw new Error('Botón de firma no encontrado');
        }
        
        btnFirmaTestador.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('testador');
        });
        
        console.log('✅ Botones de firma configurados correctamente');
    }

    openSignatureModalSafe(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        let nombreField = document.getElementById('nombreTestador');
        
        if (!nombreField || !nombreField.value.trim()) {
            this.showNotification('Complete el nombre del testador antes de firmar', 'warning');
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
        
        const requiredElements = ['photoModalOverlay', 'photoTestador'];
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
        
        const btnPhotoTestador = document.getElementById('photoTestador');
        
        if (!btnPhotoTestador) {
            throw new Error('Botón de foto no encontrado');
        }
        
        btnPhotoTestador.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('testador');
        });
        
        console.log('✅ Botones de foto configurados correctamente');
    }

    openPhotoModalSafe(type) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        let nombreField = document.getElementById('nombreTestador');
        
        if (!nombreField || !nombreField.value.trim()) {
            this.showNotification('Complete el nombre del testador antes de tomar fotos', 'warning');
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
                        systemState.firmasDigitales = data.firmasDigitales || { testador: false };
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
        const fechaTestamento = document.getElementById('fechaTestamento');
        if (fechaTestamento && !fechaTestamento.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaTestamento.value = today;
        }
        
        const horaTestamento = document.getElementById('horaTestamento');
        if (horaTestamento && !horaTestamento.value) {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            horaTestamento.value = `${hours}:${minutes}`;
        }

        const porcentajeLibreDisposicion = document.getElementById('porcentajeLibreDisposicion');
        if (porcentajeLibreDisposicion && !porcentajeLibreDisposicion.value) {
            porcentajeLibreDisposicion.value = CONFIG.TESTAMENTO.porcentaje_libre_disposicion_default;
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
                        element.classList.remove('cedula-valid', 'cedula-invalid', 'nombre-valid', 'nombre-invalid', 'edad-valid', 'edad-invalid', 'numero-valid', 'numero-invalid', 'fecha-valid', 'fecha-invalid');
                    }
                });
                
                // Restaurar valores por defecto
                const fechaTestamento = document.getElementById('fechaTestamento');
                if (fechaTestamento) {
                    const today = new Date().toISOString().split('T')[0];
                    fechaTestamento.value = today;
                }

                const horaTestamento = document.getElementById('horaTestamento');
                if (horaTestamento) {
                    const now = new Date();
                    const hours = now.getHours().toString().padStart(2, '0');
                    const minutes = now.getMinutes().toString().padStart(2, '0');
                    horaTestamento.value = `${hours}:${minutes}`;
                }

                const porcentajeLibreDisposicion = document.getElementById('porcentajeLibreDisposicion');
                if (porcentajeLibreDisposicion) {
                    porcentajeLibreDisposicion.value = CONFIG.TESTAMENTO.porcentaje_libre_disposicion_default;
                }
                
                systemState.firmasDigitales = { testador: false };
                systemState.fotosCarnet = {
                    testador: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false }
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
                this.showNotification('PDF del Testamento Abierto generado exitosamente', 'success');
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
        doc.text('TESTAMENTO ABIERTO', 105, y, { align: 'center' });
        y += 30;

        // Contenido principal
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        
        // Párrafo introductorio
        const calleOficio = document.getElementById('calleOficio').value;
        const numeroOficio = document.getElementById('numeroOficio').value;
        const ciudadTestamento = document.getElementById('ciudadTestamento').value;
        const comunaTestamento = document.getElementById('comunaTestamento').value;
        const horaTestamento = document.getElementById('horaTestamento').value;
        const nombreNotario = document.getElementById('nombreNotario').value;
        const regionNotario = document.getElementById('regionNotario').value;
        const nombreTestador = document.getElementById('nombreTestador').value;
        const origenTestador = document.getElementById('origenTestador').value;
        const nacionalidadTestador = document.getElementById('nacionalidadTestador').value;
        const direccionTestador = document.getElementById('direccionTestador').value;
        const numeroDomicilio = document.getElementById('numeroDomicilio').value;
        const ciudadDomicilio = document.getElementById('ciudadDomicilio').value;
        const comunaDomicilio = document.getElementById('comunaDomicilio').value;
        const edadTestador = document.getElementById('edadTestador').value;
        const profesionTestador = document.getElementById('profesionTestador').value;
        const estadoCivil = document.getElementById('estadoCivil').value;
        const cedulaTestador = document.getElementById('cedulaTestador').value;

        const parrafoIntroductorio = `En el oficio de calle ${calleOficio} número ${numeroOficio} de la ciudad de ${ciudadTestamento}, de la comuna de ${comunaTestamento}, siendo las ${horaTestamento} horas, ante mí, ${nombreNotario}, Notario Público de esta comuna, de la ${regionNotario}ª Región, Notario y testigos que se indican al final, compareció don ${nombreTestador}, originario de ${origenTestador}, de nacionalidad ${nacionalidadTestador}, domiciliado en ${direccionTestador} número ${numeroDomicilio}, de la ciudad de ${ciudadDomicilio} de la comuna de ${comunaDomicilio}, de ${edadTestador} años de edad, de profesión ${profesionTestador}, de estado civil ${estadoCivil} cédula nacional de identidad y rol único tributario número ${cedulaTestador} y expresó que procedía a otorgar su testamento abierto, según las declaraciones y disposiciones que siguen:`;
        
        doc.text(parrafoIntroductorio, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, parrafoIntroductorio, pageWidth - 2 * margin) + 15;

        // PRIMERO: Datos de nacimiento
        const ciudadNacimiento = document.getElementById('ciudadNacimiento').value;
        const fechaNacimiento = document.getElementById('fechaNacimiento').value;
        const numeroRegistro = document.getElementById('numeroRegistro').value;
        const circunscripcion = document.getElementById('circunscripcion').value;

        let fechaNacimientoTexto = '__ de ________ de 19__';
        if (fechaNacimiento && ConfigUtils.validateFechaNacimiento(fechaNacimiento)) {
            const birthFormat = ConfigUtils.formatDateToSpanish(fechaNacimiento);
            fechaNacimientoTexto = `${birthFormat.dia} de ${birthFormat.mes} de ${birthFormat.anio}`;
        }

        const parrafoPrimero = `PRIMERO: Declaro que nací en la ciudad de ${ciudadNacimiento} con fecha ${fechaNacimientoTexto} y que mi nacimiento se encuentra inscrito bajo en número ${numeroRegistro} del Libro correspondiente del Registro Civil de la ciudad de ${ciudadNacimiento}, Circunscripción ${circunscripcion}, del mismo año.`;
        
        doc.setFont('times', 'bold');
        doc.text('PRIMERO:', margin, y);
        doc.setFont('times', 'normal');
        doc.text(parrafoPrimero.substring(9), margin + 25, y, {maxWidth: pageWidth - 2 * margin - 25});
        y += this.calculateTextHeight(doc, parrafoPrimero, pageWidth - 2 * margin) + 15;

        // SEGUNDO: Filiación
        const nombrePadre = document.getElementById('nombrePadre').value;
        const nombreMadre = document.getElementById('nombreMadre').value;
        const estadoPadres = document.getElementById('estadoPadres').value;

        const parrafoSegundo = `SEGUNDO: Declaro que soy hijo legítimo de don ${nombrePadre} y de doña ${nombreMadre} ${estadoPadres}.`;
        
        doc.setFont('times', 'bold');
        doc.text('SEGUNDO:', margin, y);
        doc.setFont('times', 'normal');
        doc.text(parrafoSegundo.substring(9), margin + 28, y, {maxWidth: pageWidth - 2 * margin - 28});
        y += this.calculateTextHeight(doc, parrafoSegundo, pageWidth - 2 * margin) + 15;

        // TERCERO: Estado civil e hijos
        const nombreConyuge = document.getElementById('nombreConyuge').value;
        const hijosLegitimos = document.getElementById('hijosLegitimos').value;

        const parrafoTercero = `TERCERO: Declaro que fui casado en primeras nupcias, con doña ${nombreConyuge}. Del matrimonio nacieron los siguientes hijos: ${hijosLegitimos}.`;
        
        doc.setFont('times', 'bold');
        doc.text('TERCERO:', margin, y);
        doc.setFont('times', 'normal');
        doc.text(parrafoTercero.substring(9), margin + 26, y, {maxWidth: pageWidth - 2 * margin - 26});
        y += this.calculateTextHeight(doc, parrafoTercero, pageWidth - 2 * margin) + 15;

        // CUARTO: Hijos naturales
        const hijosNaturales = document.getElementById('hijosNaturales').value;

        const parrafoCuarto = `CUARTO: Declaro que son mis hijos naturales los siguientes: ${hijosNaturales}.`;
        
        doc.setFont('times', 'bold');
        doc.text('CUARTO:', margin, y);
        doc.setFont('times', 'normal');
        doc.text(parrafoCuarto.substring(8), margin + 24, y, {maxWidth: pageWidth - 2 * margin - 24});
        y += this.calculateTextHeight(doc, parrafoCuarto, pageWidth - 2 * margin) + 15;

        // QUINTO: Bienes
        const bienesInmuebles = document.getElementById('bienesInmuebles').value;
        const bienesMuebles = document.getElementById('bienesMuebles').value;
        const otrosBienes = document.getElementById('otrosBienes').value;

        const parrafoQuinto = `QUINTO: Declaro, como bienes de mi propiedad, todos los que aparezcan como tales a la fecha de mi fallecimiento; y especialmente, los siguientes: ${bienesInmuebles}, ${bienesMuebles}, ${otrosBienes}.`;
        
        doc.setFont('times', 'bold');
        doc.text('QUINTO:', margin, y);
        doc.setFont('times', 'normal');
        doc.text(parrafoQuinto.substring(8), margin + 24, y, {maxWidth: pageWidth - 2 * margin - 24});
        y += this.calculateTextHeight(doc, parrafoQuinto, pageWidth - 2 * margin) + 15;

        // Verificar si necesitamos nueva página
        if (y > 200) {
            doc.addPage();
            y = 30;
        }

        // SEXTO: Mitad legitimaria
        const parrafoSexto = `SEXTO: Es mi voluntad que la mitad legitimaria de mi herencia, se reparta entre mis hijos legítimos y naturales, en la forma y proporción determinada por la ley, sin perjuicio de los derechos que correspondan a mi cónyuge doña ${nombreConyuge}.`;
        
        doc.setFont('times', 'bold');
        doc.text('SEXTO:', margin, y);
        doc.setFont('times', 'normal');
        doc.text(parrafoSexto.substring(7), margin + 22, y, {maxWidth: pageWidth - 2 * margin - 22});
        y += this.calculateTextHeight(doc, parrafoSexto, pageWidth - 2 * margin) + 15;

        // SÉPTIMO: Cuarta de mejoras
        const herederosMejoras = document.getElementById('herederosMejoras').value;

        const parrafoSeptimo = `SÉPTIMO: Instituyo herederos en la cuarta parte de mejoras, a mis hijos ${herederosMejoras}, por cabezas, por partes iguales, con derecho de acrecer entre ellos.`;
        
        doc.setFont('times', 'bold');
        doc.text('SÉPTIMO:', margin, y);
        doc.setFont('times', 'normal');
        doc.text(parrafoSeptimo.substring(9), margin + 26, y, {maxWidth: pageWidth - 2 * margin - 26});
        y += this.calculateTextHeight(doc, parrafoSeptimo, pageWidth - 2 * margin) + 15;

        // OCTAVO: Libre disposición
        const porcentajeLibreDisposicion = document.getElementById('porcentajeLibreDisposicion').value;
        const herederosLibreDisposicion = document.getElementById('herederosLibreDisposicion').value;
        const herederosSubstitutos = document.getElementById('herederosSubstitutos').value;

        const parrafoOctavo = `OCTAVO: Instituyo herederos, de una cuota del ${porcentajeLibreDisposicion}% de mi herencia, con cargo a la cuarta parte de libre disposición, conjuntamente, a ${herederosLibreDisposicion} con derecho de acrecer entre ellos. Para el caso de faltar todos ellos, declaro, como sustitutos, a ${herederosSubstitutos}, sucesivamente.`;
        
        doc.setFont('times', 'bold');
        doc.text('OCTAVO:', margin, y);
        doc.setFont('times', 'normal');
        doc.text(parrafoOctavo.substring(8), margin + 24, y, {maxWidth: pageWidth - 2 * margin - 24});
        y += this.calculateTextHeight(doc, parrafoOctavo, pageWidth - 2 * margin) + 20;

        // NOVENO al DUODÉCIMO (designaciones y legados)
        const albaceaFiduciario = document.getElementById('albaceaFiduciario').value;
        const albaceaTenencia = document.getElementById('albaceaTenencia').value;
        const partidorHerencia = document.getElementById('partidorHerencia').value;

        const parrafoNoveno = `NOVENO: Designo como Albacea fiduciario a ${albaceaFiduciario}.`;
        doc.setFont('times', 'bold');
        doc.text('NOVENO:', margin, y);
        doc.setFont('times', 'normal');
        doc.text(parrafoNoveno.substring(8), margin + 24, y, {maxWidth: pageWidth - 2 * margin - 24});
        y += this.calculateTextHeight(doc, parrafoNoveno, pageWidth - 2 * margin) + 15;

        const parrafoUndecimo = `UNDÉCIMO: Designo albacea, con tenencia y administración de bienes, a ${albaceaTenencia}.`;
        doc.setFont('times', 'bold');
        doc.text('UNDÉCIMO:', margin, y);
        doc.setFont('times', 'normal');
        doc.text(parrafoUndecimo.substring(10), margin + 28, y, {maxWidth: pageWidth - 2 * margin - 28});
        y += this.calculateTextHeight(doc, parrafoUndecimo, pageWidth - 2 * margin) + 15;

        const parrafoDuodecimo = `DUODÉCIMO: Designo partidor de mi herencia al ${partidorHerencia}.`;
        doc.setFont('times', 'bold');
        doc.text('DUODÉCIMO:', margin, y);
        doc.setFont('times', 'normal');
        doc.text(parrafoDuodecimo.substring(11), margin + 30, y, {maxWidth: pageWidth - 2 * margin - 30});
        y += this.calculateTextHeight(doc, parrafoDuodecimo, pageWidth - 2 * margin) + 20;

        // Certificación del notario con testigos
        const nombreTestigo1 = document.getElementById('nombreTestigo1').value;
        const cedulaTestigo1 = document.getElementById('cedulaTestigo1').value;
        const domicilioTestigo1 = document.getElementById('domicilioTestigo1').value;
        const nombreTestigo2 = document.getElementById('nombreTestigo2').value;
        const cedulaTestigo2 = document.getElementById('cedulaTestigo2').value;
        const domicilioTestigo2 = document.getElementById('domicilioTestigo2').value;
        const nombreTestigo3 = document.getElementById('nombreTestigo3').value;
        const cedulaTestigo3 = document.getElementById('cedulaTestigo3').value;
        const domicilioTestigo3 = document.getElementById('domicilioTestigo3').value;

        const parrafoCertificacion = `El Notario certifica de que el testador se encuentra en su sano y entero juicio y que el testamento anterior fue leído en alta y clara voz por el escribano suscrito, a la vista del testador y de los testigos, en un solo acto, ininterrumpido, siendo testigos don ${nombreTestigo1}, cédula nacional de identidad y rol único tributario número ${cedulaTestigo1} domiciliado en ${domicilioTestigo1}; don ${nombreTestigo2} cédula nacional de identidad y rol único tributario número ${cedulaTestigo2}, domiciliado en ${domicilioTestigo2}, y don ${nombreTestigo3}, cédula nacional de identidad y rol único tributario número ${cedulaTestigo3}, domiciliado en ${domicilioTestigo3}, mayores de edad, hábiles para testificar, conocidos del testador y del Notario autorizante por haber exhibido las respectivas cédulas.`;
        
        doc.text(parrafoCertificacion, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, parrafoCertificacion, pageWidth - 2 * margin) + 40;

        // Verificar si necesitamos nueva página
        if (y > 180) {
            doc.addPage();
            y = 30;
        }

        // Sección de firma
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
        const nombreTestador = document.getElementById('nombreTestador').value;
        doc.text(nombreTestador, centerX, y, { align: 'center' });
        y += 6;
        
        // Rol
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('TESTADOR', centerX, y, { align: 'center' });
        y += 8;
        
        // Información adicional
        const cedulaTestador = document.getElementById('cedulaTestador').value;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.text(`C.I. N° ${cedulaTestador}`, centerX, y, { align: 'center' });
        
        // Agregar firma digital si existe
        if (window.firmaProcessor) {
            try {
                const firmaTestador = window.firmaProcessor.getSignatureForPDF('testador');
                
                if (firmaTestador) {
                    doc.addImage(firmaTestador, 'PNG', centerX - 40, y - 30, 80, 20);
                    console.log('✅ Firma del testador agregada al PDF');
                    
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

        y += 20;
        
        // Frase final
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        doc.text('En comprobante, firman.', 105, y, { align: 'center' });
    }

    addDigitalWatermark(doc) {
        doc.setFont('times', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Testamento Abierto firmado digitalmente - Notaría Digital Chile', 105, 260, { align: 'center' });
        doc.text(`Generado el ${new Date().toLocaleString('es-CL')}`, 105, 265, { align: 'center' });
        doc.setTextColor(0, 0, 0);
    }

    calculateTextHeight(doc, text, maxWidth) {
        const lines = doc.splitTextToSize(text, maxWidth);
        return lines.length * 5; // Aproximadamente 5mm por línea
    }

    generateFileName() {
        const nombreTestador = document.getElementById('nombreTestador').value;
        const fechaTestamento = document.getElementById('fechaTestamento').value;
        return ConfigUtils.generateTestamentoFileName(nombreTestador, fechaTestamento);
    }

    validateFormWithSignatures() {
        const emptyFields = [];
        
        // Campos mínimos requeridos
        const requiredFields = CONFIG.TESTAMENTO.campos_obligatorios;
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element || !element.value.trim()) {
                emptyFields.push(field);
            }
        });
        
        const issues = [];
        
        if (emptyFields.length > 0) {
            issues.push(`Complete ${emptyFields.length} campos obligatorios faltantes`);
        }
        
        // Validaciones específicas
        const cedulaTestador = document.getElementById('cedulaTestador').value;
        
        if (cedulaTestador && !ConfigUtils.validateCedula(cedulaTestador)) {
            issues.push('Cédula del testador inválida');
        }
        
        // Validar fechas
        const fechaTestamento = document.getElementById('fechaTestamento').value;
        if (fechaTestamento && !ConfigUtils.validateDate(fechaTestamento)) {
            issues.push('Fecha del testamento inválida');
        }

        const fechaNacimiento = document.getElementById('fechaNacimiento').value;
        if (fechaNacimiento && !ConfigUtils.validateFechaNacimiento(fechaNacimiento)) {
            issues.push('Fecha de nacimiento inválida');
        }
        
        // Validar edad
        const edadTestador = document.getElementById('edadTestador').value;
        if (edadTestador && !ConfigUtils.validateAge(edadTestador)) {
            issues.push('Edad del testador inválida');
        }
        
        if (!systemState.firmasDigitales.testador) {
            issues.push('Falta firma digital del testador');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

// ===== CLASE PROCESADOR DE FIRMAS DIGITALES (ADAPTADA) =====
class FirmaDigitalProcessor {
    constructor() {
        this.processedImageData = null;
        this.currentType = null;
        this.firmasDigitales = {
            testador: null
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
            
            if (window.testamentoAbiertoSystem) {
                window.testamentoAbiertoSystem.updateProgress();
            }
            
            this.closeModal();
            
            if (window.testamentoAbiertoSystem) {
                window.testamentoAbiertoSystem.showNotification(`Firma digital del ${this.currentType} aplicada correctamente`, 'success');
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
        this.firmasDigitales.testador = null;
        
        systemState.firmasDigitales = { testador: false };
        
        const buttonId = 'firmaTestador';
        const button = document.getElementById(buttonId);
        if (button) {
            button.classList.remove('signed');
            const textElement = button.querySelector('.signature-text');
            if (textElement) {
                textElement.textContent = 'FIRMA DIGITAL';
            }
        }
        
        const placeholderId = 'signaturePlaceholderTestador';
        const previewId = 'signaturePreviewTestador';
        
        const placeholder = document.getElementById(placeholderId);
        const preview = document.getElementById(previewId);
        
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

// ===== CLASE PROCESADOR DE FOTOS CARNET (ADAPTADA) =====
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
        const type = 'testador';
        systemState.fotosCarnet[type] = {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        };
        this.updateButton(type, false);
    }
}

// ===== FUNCIONES GLOBALES =====
window.clearForm = function() {
    if (window.testamentoAbiertoSystem) {
        window.testamentoAbiertoSystem.clearForm();
    }
};

window.generatePDF = function() {
    if (window.testamentoAbiertoSystem) {
        window.testamentoAbiertoSystem.generatePDF();
    }
};

// ===== INICIALIZACIÓN DEL SISTEMA =====
let testamentoAbiertoSystem;

function initializeTestamentoAbiertoSystem() {
    console.log('📋 Iniciando Sistema de Testamento Abierto...');
    
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined') {
        console.warn('⚠️ jsPDF no está disponible, esperando...');
        setTimeout(initializeTestamentoAbiertoSystem, 1000);
        return;
    }
    
    // Verificar que CONFIG esté disponible
    if (typeof CONFIG === 'undefined') {
        console.warn('⚠️ CONFIG no está disponible, esperando...');
        setTimeout(initializeTestamentoAbiertoSystem, 1000);
        return;
    }
    
    try {
        testamentoAbiertoSystem = new TestamentoAbiertoSystem();
        window.testamentoAbiertoSystem = testamentoAbiertoSystem;
        
        console.log('✅ Sistema completamente inicializado');
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        setTimeout(initializeTestamentoAbiertoSystem, 2000);
    }
}

// ===== MÚLTIPLES PUNTOS DE INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTestamentoAbiertoSystem);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initializeTestamentoAbiertoSystem, 500);
}

window.addEventListener('load', () => {
    if (!window.testamentoAbiertoSystem) {
        console.log('🔄 Inicialización de respaldo activada');
        setTimeout(initializeTestamentoAbiertoSystem, 1000);
    }
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', (event) => {
    console.error('❌ Error global capturado:', event.error);
    
    if (window.testamentoAbiertoSystem) {
        window.testamentoAbiertoSystem.showNotification(
            'Se detectó un error. El sistema intentará recuperarse automáticamente.', 
            'warning'
        );
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
    
    if (window.testamentoAbiertoSystem) {
        window.testamentoAbiertoSystem.showNotification(
            'Error de conectividad detectado. Algunos componentes pueden funcionar de forma limitada.', 
            'warning'
        );
    }
});

// ===== LOG FINAL =====
console.log('📜 Sistema de Testamento Abierto - Script principal cargado correctamente');init();
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
        
        if (window.testamentoAbiertoSystem) {
            window.testamentoAbiertoSystem.showNotification(errorMessage, 'error');
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
            
            if (window.testamentoAbiertoSystem) {
                window.testamentoAbiertoSystem.showNotification(`Foto del ${this.currentStep} capturada`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            if (window.testamentoAbiertoSystem) {
                window.testamentoAbiertoSystem.showNotification('Error al capturar la foto', 'error');
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
            if (window.testamentoAbiertoSystem) {
                window.testamentoAbiertoSystem.showNotification('Ahora capture el reverso del carnet', 'info');
            }
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            this.currentStep = 'completed';
            this.showSummary();
            if (window.testamentoAbiertoSystem) {
                window.testamentoAbiertoSystem.showNotification('Ambas fotos capturadas', 'success');
            }
        }
    }

    restartProcess() {
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        if (window.testamentoAbiertoSystem) {
            window.testamentoAbiertoSystem.showNotification('Proceso reiniciado', 'info');
        }
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            if (window.testamentoAbiertoSystem) {
                window.testamentoAbiertoSystem.showNotification('Faltan fotos por capturar', 'error');
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
            
            if (window.testamentoAbiertoSystem) {
                window.testamentoAbiertoSystem.updateProgress();
            }

            this.closeModal();
            
            if (window.testamentoAbiertoSystem) {
                window.testamentoAbiertoSystem.showNotification(`Carnet completo del ${this.currentType} guardado`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al confirmar fotos:', error);
            if (window.testamentoAbiertoSystem) {
                window.testamentoAbiertoSystem.showNotification('Error al procesar las fotos', 'error');
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
        this.