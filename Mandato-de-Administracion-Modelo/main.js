// ========================================
// 📋 SISTEMA PRINCIPAL DE MANDATO DE ADMINISTRACIÓN
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'ciudadCarta', 'fechaCarta',
        'nombresInvitante', 'nacionalidadInvitante', 'runInvitante', 'domicilioInvitante', 'ocupacionInvitante', 'telefonoInvitante', 'estadoCivilMandante', 'comunaMandante', 'regionMandante',
        'nombresInvitado', 'nacionalidadInvitado', 'rutRepresentante', 'estadoCivilMandatario', 'ocupacionMandatario',
        'ubicacionInmueble', 'comunaInmueble', 'regionInmueble', 'numeroRepertorio', 'notario', 'rolContribuciones',
        'porcentajeComision', 'duracionMandato', 'bancoDepositos', 'numeroCuenta', 'infoDividendo', 'diasDesahucio',
        'observacionesGenerales', 'instruccionesEspeciales'
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

// ===== CLASE PRINCIPAL DEL SISTEMA =====
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
        console.log('📋 Inicializando Sistema de Mandato de Administración...');
        
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
        // Validación RUT Mandante
        const runInvitante = document.getElementById('runInvitante');
        if (runInvitante) {
            runInvitante.addEventListener('input', (e) => {
                this.handleRutInput(e, 'runInvitante');
            });
        }

        // Validación RUT Mandatario
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

        // Validar porcentaje de comisión
        const porcentajeComision = document.getElementById('porcentajeComision');
        if (porcentajeComision) {
            porcentajeComision.addEventListener('input', (e) => {
                const valor = parseFloat(e.target.value);
                if (!isNaN(valor) && ConfigUtils.validatePorcentaje(valor)) {
                    e.target.classList.add('percentage-valid');
                    e.target.classList.remove('percentage-invalid');
                } else if (e.target.value !== '') {
                    e.target.classList.add('percentage-invalid');
                    e.target.classList.remove('percentage-valid');
                } else {
                    e.target.classList.remove('percentage-valid', 'percentage-invalid');
                }
                this.updatePreview();
            });
        }

        // Validar número de repertorio
        const numeroRepertorio = document.getElementById('numeroRepertorio');
        if (numeroRepertorio) {
            numeroRepertorio.addEventListener('input', (e) => {
                if (ConfigUtils.validateRepertorio(e.target.value)) {
                    e.target.classList.add('repertorio-valid');
                    e.target.classList.remove('repertorio-invalid');
                } else if (e.target.value !== '') {
                    e.target.classList.add('repertorio-invalid');
                    e.target.classList.remove('repertorio-valid');
                } else {
                    e.target.classList.remove('repertorio-valid', 'repertorio-invalid');
                }
                this.updatePreview();
            });
        }

        // Validar ROL de contribuciones
        const rolContribuciones = document.getElementById('rolContribuciones');
        if (rolContribuciones) {
            rolContribuciones.addEventListener('input', (e) => {
                if (ConfigUtils.validateRolContribuciones(e.target.value)) {
                    e.target.classList.add('rol-valid');
                    e.target.classList.remove('rol-invalid');
                } else if (e.target.value !== '') {
                    e.target.classList.add('rol-invalid');
                    e.target.classList.remove('rol-valid');
                } else {
                    e.target.classList.remove('rol-valid', 'rol-invalid');
                }
                this.updatePreview();
            });
        }

        // Validar número de cuenta
        const numeroCuenta = document.getElementById('numeroCuenta');
        if (numeroCuenta) {
            numeroCuenta.addEventListener('input', (e) => {
                if (ConfigUtils.validateNumeroCuenta(e.target.value)) {
                    e.target.classList.add('cuenta-valid');
                    e.target.classList.remove('cuenta-invalid');
                } else if (e.target.value !== '') {
                    e.target.classList.add('cuenta-invalid');
                    e.target.classList.remove('cuenta-valid');
                } else {
                    e.target.classList.remove('cuenta-valid', 'cuenta-invalid');
                }
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
        const nombresInvitante = document.getElementById('nombresInvitante').value;
        const prev_nombresInvitante2 = document.getElementById('prev_nombresInvitante2');
        
        if (prev_nombresInvitante2) {
            prev_nombresInvitante2.textContent = nombresInvitante || '_________________________';
        }
    }

    updateDatePreview() {
        const fechaCarta = document.getElementById('fechaCarta').value;
        
        if (fechaCarta && ConfigUtils.validateDate(fechaCarta)) {
            const date = new Date(fechaCarta);
            
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
    }

    updateSignatureNames() {
        const nombresInvitante = document.getElementById('nombresInvitante').value;
        const firmaInvitante = document.getElementById('prev_firmaInvitante');
        
        if (firmaInvitante) {
            firmaInvitante.textContent = nombresInvitante || '_______________';
        }
    }

    getPlaceholderText(field) {
        const placeholders = {
            'ciudadCarta': 'Santiago',
            'nombresInvitante': '_________________________',
            'nombresInvitado': '_________________________',
            'nacionalidadInvitante': 'Chilena',
            'nacionalidadInvitado': 'Chilena',
            'runInvitante': 'XX.XXX.XXX-X',
            'rutRepresentante': 'XX.XXX.XXX-X',
            'domicilioInvitante': '_________________________',
            'ocupacionInvitante': '________',
            'ocupacionMandatario': '________',
            'telefonoInvitante': '___________',
            'comunaMandante': '___________',
            'regionMandante': '___________',
            'ubicacionInmueble': '_________________________',
            'comunaInmueble': '___________',
            'regionInmueble': '___________',
            'numeroRepertorio': 'XXXXXX/XX',
            'notario': '_________________________',
            'rolContribuciones': 'XX-XXX',
            'porcentajeComision': 'X',
            'duracionMandato': 'cinco años',
            'bancoDepositos': 'Banco',
            'numeroCuenta': 'XXXXXXXXXXXX',
            'infoDividendo': 'Pagará dividendo (si esto correspondiese)',
            'diasDesahucio': '60',
            'estadoCivilMandante': '________',
            'estadoCivilMandatario': '________',
            'observacionesGenerales': 'Todos los asuntos domésticos de los arrendatarios, tanto sanitarios, como de reparación de algún artefacto, serán tratados con el mandatario, decidiendo esta, cada solución, frente a cada situación en particular.',
            'instruccionesEspeciales': 'Instrucciones adicionales del mandante...'
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

    // ===== SISTEMA DE FIRMAS DIGITALES =====
    async initializeSignatureSystemSafe() {
        console.log('🖋️ Inicializando sistema de firmas digitales...');
        
        const requiredElements = ['firmaModalOverlay', 'firmaInvitante'];
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
        
        const btnFirmaInvitante = document.getElementById('firmaInvitante');
        
        if (!btnFirmaInvitante) {
            throw new Error('Botón de firma no encontrado');
        }
        
        btnFirmaInvitante.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('invitante');
        });
        
        console.log('✅ Botones de firma configurados correctamente');
    }

    openSignatureModalSafe(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        let nombreField = document.getElementById('nombresInvitante');
        
        if (!nombreField || !nombreField.value.trim()) {
            this.showNotification('Complete el nombre del mandante antes de firmar', 'warning');
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
        
        const requiredElements = ['photoModalOverlay', 'photoInvitante'];
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
        
        const btnPhotoInvitante = document.getElementById('photoInvitante');
        
        if (!btnPhotoInvitante) {
            throw new Error('Botón de foto no encontrado');
        }
        
        btnPhotoInvitante.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('invitante');
        });
        
        console.log('✅ Botones de foto configurados correctamente');
    }

    openPhotoModalSafe(type) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        let nombreField = document.getElementById('nombresInvitante');
        
        if (!nombreField || !nombreField.value.trim()) {
            this.showNotification('Complete el nombre del mandante antes de tomar fotos', 'warning');
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
                        systemState.firmasDigitales = data.firmasDigitales || { invitante: false };
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
        const fechaCarta = document.getElementById('fechaCarta');
        if (fechaCarta && !fechaCarta.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaCarta.value = today;
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
                        element.classList.remove('rut-valid', 'rut-invalid', 'percentage-valid', 'percentage-invalid', 'repertorio-valid', 'repertorio-invalid', 'rol-valid', 'rol-invalid', 'cuenta-valid', 'cuenta-invalid');
                    }
                });
                
                // Restaurar valores por defecto
                const fechaCarta = document.getElementById('fechaCarta');
                if (fechaCarta) {
                    const today = new Date().toISOString().split('T')[0];
                    fechaCarta.value = today;
                }
                
                const nacionalidadInvitante = document.getElementById('nacionalidadInvitante');
                if (nacionalidadInvitante) {
                    nacionalidadInvitante.value = 'Chilena';
                }
                
                const nacionalidadInvitado = document.getElementById('nacionalidadInvitado');
                if (nacionalidadInvitado) {
                    nacionalidadInvitado.value = 'Chilena';
                }
                
                const regionMandante = document.getElementById('regionMandante');
                if (regionMandante) {
                    regionMandante.value = 'Metropolitana';
                }
                
                const regionInmueble = document.getElementById('regionInmueble');
                if (regionInmueble) {
                    regionInmueble.value = 'Metropolitana';
                }
                
                const diasDesahucio = document.getElementById('diasDesahucio');
                if (diasDesahucio) {
                    diasDesahucio.value = '60';
                }
                
                systemState.firmasDigitales = { invitante: false };
                systemState.fotosCarnet = {
                    invitante: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false }
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
                this.showNotification('PDF de Mandato de Administración generado exitosamente', 'success');
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
        doc.text('MANDATO DE ADMINISTRACIÓN', 105, y, { align: 'center' });
        y += 40;

        // Contenido principal
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        
        const fechaCarta = document.getElementById('fechaCarta').value;
        const ciudadCarta = document.getElementById('ciudadCarta').value || 'Santiago';
        const nombresInvitante = document.getElementById('nombresInvitante').value;
        const nacionalidadInvitante = document.getElementById('nacionalidadInvitante').value;
        const estadoCivilMandante = document.getElementById('estadoCivilMandante').value;
        const ocupacionInvitante = document.getElementById('ocupacionInvitante').value;
        const runInvitante = document.getElementById('runInvitante').value;
        const nombresInvitado = document.getElementById('nombresInvitado').value;
        const nacionalidadInvitado = document.getElementById('nacionalidadInvitado').value;
        const estadoCivilMandatario = document.getElementById('estadoCivilMandatario').value;
        const ocupacionMandatario = document.getElementById('ocupacionMandatario').value;
        const rutRepresentante = document.getElementById('rutRepresentante').value;
        const domicilioInvitante = document.getElementById('domicilioInvitante').value;
        const comunaMandante = document.getElementById('comunaMandante').value;
        const regionMandante = document.getElementById('regionMandante').value;

        // Párrafo introductorio
        let fechaTexto = '__ de ________ de 20__';
        if (fechaCarta && ConfigUtils.validateDate(fechaCarta)) {
            const date = new Date(fechaCarta);
            fechaTexto = `${date.getDate()} de ${this.mesesEspanol[date.getMonth()]} del año ${date.getFullYear()}`;
        }

        const parrafo1 = `En la ciudad de ${ciudadCarta} de Chile, a ${fechaTexto}, entre ${nombresInvitante}, ${nacionalidadInvitante}, ${estadoCivilMandante}, ${ocupacionInvitante}, Rut N° ${runInvitante}, en adelante La mandante por una parte, y por la otra: Don/Doña ${nombresInvitado}, ${nacionalidadInvitado}, ${estadoCivilMandatario}, ${ocupacionMandatario}, Rut N° ${rutRepresentante}, en adelante EL CORREDOR o Mandatario; ambas domiciliadas en ${domicilioInvitante}, Comuna de ${comunaMandante}, Región ${regionMandante}, se ha convenido el siguiente contrato:`;
        
        doc.text(parrafo1, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, parrafo1, pageWidth - 2 * margin) + 20;

        // Cláusula de la Propiedad
        const ubicacionInmueble = document.getElementById('ubicacionInmueble').value;
        const comunaInmueble = document.getElementById('comunaInmueble').value;
        const regionInmueble = document.getElementById('regionInmueble').value;
        const numeroRepertorio = document.getElementById('numeroRepertorio').value;
        const notario = document.getElementById('notario').value;

        const clausulaPropiedad = `PROPIEDAD: El Mandante encarga al Mandatario, quien acepta dar en Administración el inmueble ubicado en ${ubicacionInmueble}, Comuna de ${comunaInmueble}, región ${regionInmueble}, en mi calidad de Dueña de la propiedad, según consta en Escritura Pública con repertorio N° ${numeroRepertorio}, suscrita ante el Notario ${notario}.`;
        
        doc.text(clausulaPropiedad, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausulaPropiedad, pageWidth - 2 * margin) + 15;

        // Cláusula de Condiciones del Mandato
        const condicionesTexto = `CONDICIONES DEL MANDATO: a) En uso de este mandato, el mandatario podrá además celebrar y firmar contrato de arrendamiento, administrar el inmueble arrendado, cobrar y percibir todas las rentas de arrendamiento, multas, cláusulas penales, garantías, indemnizaciones y costas que por cualquier motivo deba pagar el arrendatario; igualmente podrá cobrar y percibir la suma que pudiera quedar adeudando el arrendatario; podrá pagar las contribuciones a los Bienes Raíces del inmueble u otras deudas que periódicamente afecten a la propiedad según las instrucciones que se le entregan más adelante.`;
        
        doc.text(condicionesTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, condicionesTexto, pageWidth - 2 * margin) + 15;

        // Verificar si necesitamos nueva página
        if (y > 180) {
            doc.addPage();
            y = 30;
        }

        // Cláusula de Garantías
        const garantiasTexto = `GARANTÍAS: Con el objeto de facilitar la devolución de la garantía al arrendatario, que perciba el mandante al momento de celebrar el contrato de arrendamiento, el mandatario queda facultado para retener el valor de la renta del último mes de arrendamiento. El Mandante se compromete a completar oportunamente cualquier diferencia que se produjere en su contra.`;
        
        doc.text(garantiasTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, garantiasTexto, pageWidth - 2 * margin) + 15;

        // Cláusula de Comisión
        const porcentajeComision = document.getElementById('porcentajeComision').value;
        const comisionTexto = `COMISIÓN: El mandatario recibirá por la realización total o parcial de sus servicios de administración una comisión equivalente al ${porcentajeComision}% de las sumas que perciba, más el impuesto correspondiente.`;
        
        doc.text(comisionTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, comisionTexto, pageWidth - 2 * margin) + 15;

        // Cláusula de Desahucio
        const duracionMandato = document.getElementById('duracionMandato').value;
        const diasDesahucio = document.getElementById('diasDesahucio').value;
        const desahucioTexto = `DESAHUCIO DEL MANDATO: El mandato tendrá una duración de ${duracionMandato}, pero cualquiera de las partes podrá desahuciar el mandato de administración, con una anticipación no inferior a ${diasDesahucio} días al término de cualquiera de los períodos de arrendamiento, mediante carta certificada notarial.`;
        
        doc.text(desahucioTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, desahucioTexto, pageWidth - 2 * margin) + 15;

        // Instrucciones Especiales
        const bancoDepositos = document.getElementById('bancoDepositos').value;
        const numeroCuenta = document.getElementById('numeroCuenta').value;
        const rolContribuciones = document.getElementById('rolContribuciones').value;
        const infoDividendo = document.getElementById('infoDividendo').value;

        const instruccionesTexto = `INSTRUCCIONES ESPECIALES: El mandante entrega al mandatario las siguientes instrucciones: La renta deberá ser liquidada, mediante depósito Bancario, a nombre de Don/Doña ${nombresInvitante}. Se depositará en el ${bancoDepositos} cuenta N° ${numeroCuenta}. Pagará Contribuciones Rol N° ${rolContribuciones} (si esto correspondiese). ${infoDividendo}.`;
        
        doc.text(instruccionesTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, instruccionesTexto, pageWidth - 2 * margin) + 15;

        // Observaciones
        const observacionesGenerales = document.getElementById('observacionesGenerales').value;
        const observacionesTexto = `OBSERVACIONES: Las partes dejan constancia de las siguientes observaciones: ${observacionesGenerales}`;
        
        doc.text(observacionesTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, observacionesTexto, pageWidth - 2 * margin) + 15;

        // Instrucciones adicionales
        const instruccionesEspeciales = document.getElementById('instruccionesEspeciales').value;
        if (instruccionesEspeciales) {
            doc.text(instruccionesEspeciales, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, instruccionesEspeciales, pageWidth - 2 * margin) + 30;
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
        const nombresInvitante = document.getElementById('nombresInvitante').value;
        doc.text(nombresInvitante, centerX, y, { align: 'center' });
        y += 6;
        
        // Rol
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('MANDANTE', centerX, y, { align: 'center' });
        y += 8;
        
        // Información adicional
        const runInvitante = document.getElementById('runInvitante').value;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.text(`RUT N° ${runInvitante}`, centerX, y, { align: 'center' });
        
        // Agregar firma digital si existe
        if (window.firmaProcessor) {
            try {
                const firmaInvitante = window.firmaProcessor.getSignatureForPDF('invitante');
                
                if (firmaInvitante) {
                    doc.addImage(firmaInvitante, 'PNG', centerX - 40, y - 30, 80, 20);
                    console.log('✅ Firma del mandante agregada al PDF');
                    
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
        const ubicacionInmueble = document.getElementById('ubicacionInmueble').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '')
            .substring(0, 20); // Limitar longitud
        const timestamp = new Date().toISOString().slice(0, 10);
        return `Mandato_Administracion_${nombresInvitante}_${ubicacionInmueble}_${timestamp}.pdf`;
    }

    validateFormWithSignatures() {
        const emptyFields = [];
        
        // Campos mínimos requeridos
        const requiredFields = [
            'ciudadCarta', 'fechaCarta',
            'nombresInvitante', 'nacionalidadInvitante', 'runInvitante', 'domicilioInvitante', 'ocupacionInvitante',
            'nombresInvitado', 'rutRepresentante',
            'ubicacionInmueble', 'comunaInmueble', 'numeroRepertorio', 'notario',
            'porcentajeComision', 'duracionMandato'
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
            issues.push('RUT del mandante inválido');
        }
        
        if (rutRepresentante && !ConfigUtils.validateRUT(rutRepresentante)) {
            issues.push('RUT del mandatario inválido');
        }
        
        // Validar fechas
        const fechaCarta = document.getElementById('fechaCarta').value;
        if (fechaCarta && !ConfigUtils.validateDate(fechaCarta)) {
            issues.push('Fecha del mandato inválida');
        }
        
        // Validar porcentaje
        const porcentajeComision = document.getElementById('porcentajeComision').value;
        if (porcentajeComision && !ConfigUtils.validatePorcentaje(porcentajeComision)) {
            issues.push('Porcentaje de comisión inválido');
        }
        
        if (!systemState.firmasDigitales.invitante) {
            issues.push('Falta firma digital del mandante');
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
            invitante: null
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
            
            if (window.cartaInvitacionSystem) {
                window.cartaInvitacionSystem.updateProgress();
            }
            
            this.closeModal();
            
            if (window.cartaInvitacionSystem) {
                window.cartaInvitacionSystem.showNotification(`Firma digital del ${this.currentType} aplicada correctamente`, 'success');
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
        this.firmasDigitales.invitante = null;
        
        systemState.firmasDigitales = { invitante: false };
        
        const buttonId = 'firmaInvitante';
        const button = document.getElementById(buttonId);
        if (button) {
            button.classList.remove('signed');
            const textElement = button.querySelector('.signature-text');
            if (textElement) {
                textElement.textContent = 'FIRMA DIGITAL';
            }
        }
        
        const placeholderId = 'signaturePlaceholderInvitante';
        const previewId = 'signaturePreviewInvitante';
        
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
        
        if (window.cartaInvitacionSystem) {
            window.cartaInvitacionSystem.showNotification(errorMessage, 'error');
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
            
            if (window.cartaInvitacionSystem) {
                window.cartaInvitacionSystem.showNotification(`Foto del ${this.currentStep} capturada`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            if (window.cartaInvitacionSystem) {
                window.cartaInvitacionSystem.showNotification('Error al capturar la foto', 'error');
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
            if (window.cartaInvitacionSystem) {
                window.cartaInvitacionSystem.showNotification('Ahora capture el reverso del carnet', 'info');
            }
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            this.currentStep = 'completed';
            this.showSummary();
            if (window.cartaInvitacionSystem) {
                window.cartaInvitacionSystem.showNotification('Ambas fotos capturadas', 'success');
            }
        }
    }

    restartProcess() {
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        if (window.cartaInvitacionSystem) {
            window.cartaInvitacionSystem.showNotification('Proceso reiniciado', 'info');
        }
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            if (window.cartaInvitacionSystem) {
                window.cartaInvitacionSystem.showNotification('Faltan fotos por capturar', 'error');
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
            
            if (window.cartaInvitacionSystem) {
                window.cartaInvitacionSystem.updateProgress();
            }

            this.closeModal();
            
            if (window.cartaInvitacionSystem) {
                window.cartaInvitacionSystem.showNotification(`Carnet completo del ${this.currentType} guardado`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al confirmar fotos:', error);
            if (window.cartaInvitacionSystem) {
                window.cartaInvitacionSystem.showNotification('Error al procesar las fotos', 'error');
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
        const type = 'invitante';
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
    if (window.cartaInvitacionSystem) {
        window.cartaInvitacionSystem.clearForm();
    }
};

window.generatePDF = function() {
    if (window.cartaInvitacionSystem) {
        window.cartaInvitacionSystem.generatePDF();
    }
};

// ===== INICIALIZACIÓN DEL SISTEMA =====
let cartaInvitacionSystem;

function initializeCartaInvitacionSystem() {
    console.log('📋 Iniciando Sistema de Mandato de Administración...');
    
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined') {
        console.warn('⚠️ jsPDF no está disponible, esperando...');
        setTimeout(initializeCartaInvitacionSystem, 1000);
        return;
    }
    
    // Verificar que CONFIG esté disponible
    if (typeof CONFIG === 'undefined') {
        console.warn('⚠️ CONFIG no está disponible, esperando...');
        setTimeout(initializeCartaInvitacionSystem, 1000);
        return;
    }
    
    try {
        cartaInvitacionSystem = new CartaInvitacionSystem();
        window.cartaInvitacionSystem = cartaInvitacionSystem;
        
        console.log('✅ Sistema completamente inicializado');
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        setTimeout(initializeCartaInvitacionSystem, 2000);
    }
}

// ===== MÚLTIPLES PUNTOS DE INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCartaInvitacionSystem);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initializeCartaInvitacionSystem, 500);
}

window.addEventListener('load', () => {
    if (!window.cartaInvitacionSystem) {
        console.log('🔄 Inicialización de respaldo activada');
        setTimeout(initializeCartaInvitacionSystem, 1000);
    }
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', (event) => {
    console.error('❌ Error global capturado:', event.error);
    
    if (window.cartaInvitacionSystem) {
        window.cartaInvitacionSystem.showNotification(
            'Se detectó un error. El sistema intentará recuperarse automáticamente.', 
            'warning'
        );
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
    
    if (window.cartaInvitacionSystem) {
        window.cartaInvitacionSystem.showNotification(
            'Error de conectividad detectado. Algunos componentes pueden funcionar de forma limitada.', 
            'warning'
        );
    }
});

// ===== LOG FINAL =====
console.log('📜 Sistema de Mandato de Administración - Script principal cargado correctamente');