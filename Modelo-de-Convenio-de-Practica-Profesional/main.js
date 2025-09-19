// ========================================
// 📋 SISTEMA PRINCIPAL DE CONVENIO DE PRÁCTICA PROFESIONAL
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'ciudadConvenio', 'fechaConvenio',
        'nombreEstablecimiento', 'nombreDocente',
        'nombreEmpresa', 'rutEmpresa', 'domicilioEmpresa', 'comunaEmpresa',
        'nombreRepresentante', 'rutRepresentante',
        'nombreEducando', 'rutEducando', 'nacionalidadEducando', 'fechaNacimientoEducando', 
        'domicilioEducando', 'comunaEducando',
        'seccionPractica', 'horasTotales', 'horarioPractica', 'fechaInicioPractica',
        'asignacionColacion', 'asignacionMovilizacion', 'topeReembolso',
        'diasInasistencia', 'numeroEjemplares', 'condicionesEspecificas'
    ],
    
    firmasDigitales: {
        empresa: false,
        educando: false
    },
    
    fotosCarnet: {
        empresa: {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        },
        educando: {
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
class ConvenioPracticaSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Convenio de Práctica Profesional...');
        
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
            'firmaEmpresa', 'firmaEducando',
            'photoEmpresa', 'photoEducando',
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
        // Validación RUT Empresa
        const rutEmpresaField = document.getElementById('rutEmpresa');
        if (rutEmpresaField) {
            rutEmpresaField.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutEmpresa');
            });
        }

        // Validación RUT Representante
        const rutRepresentanteField = document.getElementById('rutRepresentante');
        if (rutRepresentanteField) {
            rutRepresentanteField.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutRepresentante');
            });
        }

        // Validación RUT Educando
        const rutEducandoField = document.getElementById('rutEducando');
        if (rutEducandoField) {
            rutEducandoField.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutEducando');
            });
        }

        // Auto-llenar fecha actual para convenio y fecha de inicio
        const fechaConvenio = document.getElementById('fechaConvenio');
        if (fechaConvenio && !fechaConvenio.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaConvenio.value = today;
        }

        // Validar horas de práctica
        const horasTotalesField = document.getElementById('horasTotales');
        if (horasTotalesField) {
            horasTotalesField.addEventListener('input', (e) => {
                const horas = parseInt(e.target.value);
                if (horas && (horas < 480 || horas > 720)) {
                    this.showNotification('Las horas deben estar entre 480 y 720', 'warning');
                }
                this.updatePreview();
            });
        }

        // Formatear números para asignaciones
        ['asignacionColacion', 'asignacionMovilizacion', 'topeReembolso'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', (e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    e.target.value = value;
                    this.updatePreview();
                });
            }
        });

        // Validar fecha de nacimiento
        const fechaNacimientoField = document.getElementById('fechaNacimientoEducando');
        if (fechaNacimientoField) {
            fechaNacimientoField.addEventListener('blur', (e) => {
                if (e.target.value && !ConfigUtils.validateBirthDate(e.target.value)) {
                    this.showNotification('Fecha de nacimiento inválida', 'warning');
                }
            });
        }

        // Mostrar/ocultar secciones condicionales
        const condicionesEspecificas = document.getElementById('condicionesEspecificas');
        if (condicionesEspecificas) {
            condicionesEspecificas.addEventListener('input', () => {
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

    updateConditionalSections() {
        // Mostrar/ocultar condiciones específicas
        const condicionesEspecificas = document.getElementById('condicionesEspecificas');
        const condicionesContainer = document.getElementById('condicionesContainer');
        
        if (condicionesEspecificas && condicionesContainer) {
            if (condicionesEspecificas.value.trim()) {
                condicionesContainer.style.display = 'block';
            } else {
                condicionesContainer.style.display = 'none';
            }
        }
    }

    updatePreview() {
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            const preview = document.getElementById('prev_' + field);
            if (element && preview) {
                let value = element.value || '';
                
                // Formatear números con separadores de miles para asignaciones
                if (['asignacionColacion', 'asignacionMovilizacion', 'topeReembolso'].includes(field) && value) {
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
        const rutEmpresa = document.getElementById('rutEmpresa').value;
        const prev_rutEmpresa2 = document.getElementById('prev_rutEmpresa2');
        if (prev_rutEmpresa2) prev_rutEmpresa2.textContent = rutEmpresa || '___________';

        const rutEducando = document.getElementById('rutEducando').value;
        const prev_rutEducando2 = document.getElementById('prev_rutEducando2');
        if (prev_rutEducando2) prev_rutEducando2.textContent = rutEducando || '___________';

        const nombreEducando = document.getElementById('nombreEducando').value;
        const prev_nombreEducando2 = document.getElementById('prev_nombreEducando2');
        if (prev_nombreEducando2) prev_nombreEducando2.textContent = nombreEducando || '________________';
    }

    updateDatePreview() {
        // Fecha del convenio
        const fechaConvenio = document.getElementById('fechaConvenio').value;
        
        if (fechaConvenio && ConfigUtils.validateDate(fechaConvenio)) {
            const date = new Date(fechaConvenio);
            
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

        // Fecha de nacimiento del educando
        const fechaNacimientoEducando = document.getElementById('fechaNacimientoEducando').value;
        const prev_fechaNacimiento = document.getElementById('prev_fechaNacimiento');
        
        if (prev_fechaNacimiento) {
            if (fechaNacimientoEducando && ConfigUtils.validateBirthDate(fechaNacimientoEducando)) {
                const date = new Date(fechaNacimientoEducando);
                const dia = date.getDate();
                const mes = this.mesesEspanol[date.getMonth()];
                const anio = date.getFullYear();
                prev_fechaNacimiento.textContent = `${dia} de ${mes} de ${anio}`;
            } else {
                prev_fechaNacimiento.textContent = '__ de ________ de ____';
            }
        }

        // Fecha de inicio de práctica
        const fechaInicioPractica = document.getElementById('fechaInicioPractica').value;
        const prev_fechaInicio = document.getElementById('prev_fechaInicio');
        
        if (prev_fechaInicio) {
            if (fechaInicioPractica && ConfigUtils.validateDate(fechaInicioPractica)) {
                const date = new Date(fechaInicioPractica);
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
        const nombreRepresentante = document.getElementById('nombreRepresentante').value;
        const prev_firmaEmpresa = document.getElementById('prev_firmaEmpresa');
        if (prev_firmaEmpresa) prev_firmaEmpresa.textContent = nombreRepresentante || '_______________';

        const nombreEducando = document.getElementById('nombreEducando').value;
        const prev_firmaEducando = document.getElementById('prev_firmaEducando');
        if (prev_firmaEducando) prev_firmaEducando.textContent = nombreEducando || '_______________';
    }

    getPlaceholderText(field) {
        const placeholders = {
            'ciudadConvenio': 'Santiago',
            'nombreEstablecimiento': '________________',
            'nombreDocente': '________________',
            'nombreEmpresa': '________________',
            'rutEmpresa': '___________',
            'domicilioEmpresa': '________________',
            'comunaEmpresa': '________',
            'nombreRepresentante': '________________',
            'rutRepresentante': '___________',
            'nombreEducando': '________________',
            'rutEducando': '___________',
            'nacionalidadEducando': '________',
            'domicilioEducando': '________________',
            'comunaEducando': '________',
            'seccionPractica': '________________',
            'horasTotales': '____',
            'horarioPractica': '________________',
            'asignacionColacion': '0',
            'asignacionMovilizacion': '0',
            'topeReembolso': '0',
            'diasInasistencia': '__',
            'numeroEjemplares': '__',
            'condicionesEspecificas': 'Las condiciones específicas se detallarán según los requerimientos de la empresa'
        };
        
        return placeholders[field] || '________________';
    }

    updateProgress() {
        const requiredFields = [
            'ciudadConvenio', 'fechaConvenio', 'nombreEstablecimiento', 'nombreDocente',
            'nombreEmpresa', 'rutEmpresa', 'domicilioEmpresa', 'comunaEmpresa',
            'nombreRepresentante', 'rutRepresentante',
            'nombreEducando', 'rutEducando', 'nacionalidadEducando', 'fechaNacimientoEducando',
            'domicilioEducando', 'comunaEducando',
            'seccionPractica', 'horasTotales', 'horarioPractica', 'fechaInicioPractica'
        ];
        
        let filledFields = 0;
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (element && element.value.trim() !== '') {
                filledFields++;
            }
        });
        
        let bonusScore = 0;
        
        if (systemState.firmasDigitales.empresa) bonusScore += 0.5;
        if (systemState.firmasDigitales.educando) bonusScore += 0.5;
        if (systemState.fotosCarnet.empresa.completed) bonusScore += 0.25;
        if (systemState.fotosCarnet.educando.completed) bonusScore += 0.25;
        
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
        
        const requiredElements = ['firmaModalOverlay', 'firmaEmpresa', 'firmaEducando'];
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
        
        const btnFirmaEmpresa = document.getElementById('firmaEmpresa');
        const btnFirmaEducando = document.getElementById('firmaEducando');
        
        if (!btnFirmaEmpresa || !btnFirmaEducando) {
            throw new Error('Botones de firma no encontrados');
        }
        
        btnFirmaEmpresa.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('empresa');
        });

        btnFirmaEducando.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('educando');
        });
        
        console.log('✅ Botones de firma configurados correctamente');
    }

    openSignatureModalSafe(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        let nombreField;
        if (type === 'empresa') {
            nombreField = document.getElementById('nombreRepresentante');
        } else {
            nombreField = document.getElementById('nombreEducando');
        }
        
        if (!nombreField || !nombreField.value.trim()) {
            const tipoNombre = type === 'empresa' ? 'representante de la empresa' : 'educando';
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
        
        const requiredElements = ['photoModalOverlay', 'photoEmpresa', 'photoEducando'];
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
        
        const btnPhotoEmpresa = document.getElementById('photoEmpresa');
        const btnPhotoEducando = document.getElementById('photoEducando');
        
        if (!btnPhotoEmpresa || !btnPhotoEducando) {
            throw new Error('Botones de foto no encontrados');
        }
        
        btnPhotoEmpresa.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('empresa');
        });

        btnPhotoEducando.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('educando');
        });
        
        console.log('✅ Botones de foto configurados correctamente');
    }

    openPhotoModalSafe(type) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        let nombreField;
        if (type === 'empresa') {
            nombreField = document.getElementById('nombreRepresentante');
        } else {
            nombreField = document.getElementById('nombreEducando');
        }
        
        if (!nombreField || !nombreField.value.trim()) {
            const tipoNombre = type === 'empresa' ? 'representante de la empresa' : 'educando';
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
                        systemState.firmasDigitales = data.firmasDigitales || { empresa: false, educando: false };
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
        // Auto-llenar fecha actual para el convenio
        const fechaConvenio = document.getElementById('fechaConvenio');
        if (fechaConvenio && !fechaConvenio.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaConvenio.value = today;
        }
        
        // Valores por defecto
        const nacionalidadEducando = document.getElementById('nacionalidadEducando');
        if (nacionalidadEducando && !nacionalidadEducando.value) {
            nacionalidadEducando.value = 'Chilena';
        }
        
        const diasInasistencia = document.getElementById('diasInasistencia');
        if (diasInasistencia && !diasInasistencia.value) {
            diasInasistencia.value = '3';
        }
        
        const numeroEjemplares = document.getElementById('numeroEjemplares');
        if (numeroEjemplares && !numeroEjemplares.value) {
            numeroEjemplares.value = '3';
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
                
                // Restaurar valores por defecto
                this.initializeFormFields();
                
                systemState.firmasDigitales = { empresa: false, educando: false };
                systemState.fotosCarnet = {
                    empresa: { 
                        frente: { captured: false, imageData: null, timestamp: null }, 
                        reverso: { captured: false, imageData: null, timestamp: null }, 
                        completed: false 
                    },
                    educando: { 
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
                this.showNotification('PDF de Convenio de Práctica Profesional generado exitosamente', 'success');
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
        doc.setFontSize(16);
        doc.text('MODELO CONVENIO DE PRÁCTICA PROFESIONAL', 105, y, { align: 'center' });
        y += 20;

        // Contenido principal
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        
        // Fecha y lugar
        const fechaConvenio = document.getElementById('fechaConvenio').value;
        const ciudadConvenio = document.getElementById('ciudadConvenio').value;

        let fechaTexto = '__ de ________ de 20__';
        if (fechaConvenio && ConfigUtils.validateDate(fechaConvenio)) {
            const date = new Date(fechaConvenio);
            fechaTexto = `${date.getDate()} de ${this.mesesEspanol[date.getMonth()]} de ${date.getFullYear()}`;
        }

        // Párrafo inicial del convenio
        const nombreEstablecimiento = document.getElementById('nombreEstablecimiento').value;
        const nombreDocente = document.getElementById('nombreDocente').value;
        const nombreEmpresa = document.getElementById('nombreEmpresa').value;
        const rutEmpresa = document.getElementById('rutEmpresa').value;
        const nombreRepresentante = document.getElementById('nombreRepresentante').value;
        const rutRepresentante = document.getElementById('rutRepresentante').value;
        const domicilioEmpresa = document.getElementById('domicilioEmpresa').value;
        const comunaEmpresa = document.getElementById('comunaEmpresa').value;
        const nombreEducando = document.getElementById('nombreEducando').value;
        const rutEducando = document.getElementById('rutEducando').value;
        const nacionalidadEducando = document.getElementById('nacionalidadEducando').value;
        const fechaNacimientoEducando = document.getElementById('fechaNacimientoEducando').value;
        const domicilioEducando = document.getElementById('domicilioEducando').value;
        const comunaEducando = document.getElementById('comunaEducando').value;
        const seccionPractica = document.getElementById('seccionPractica').value;

        let fechaNacimientoTexto = '__ de ________ de ____';
        if (fechaNacimientoEducando && ConfigUtils.validateBirthDate(fechaNacimientoEducando)) {
            const date = new Date(fechaNacimientoEducando);
            fechaNacimientoTexto = `${date.getDate()} de ${this.mesesEspanol[date.getMonth()]} de ${date.getFullYear()}`;
        }

        const parrafoInicial = `En ${ciudadConvenio}, a ${fechaTexto}, a pedido expreso del establecimiento educacional ${nombreEstablecimiento} representado por el docente coordinador de práctica Don(a) ${nombreDocente}, la Empresa ${nombreEmpresa}, R.U.T ${rutEmpresa} representada por Don(a) ${nombreRepresentante} R.U.T ${rutRepresentante}, con domicilio para estos efectos en ${domicilioEmpresa}, comuna de ${comunaEmpresa}, autoriza al educando del citado establecimiento Sr.(ta) ${nombreEducando} R.U.T ${rutEducando} de nacionalidad ${nacionalidadEducando}, nacido el ${fechaNacimientoTexto} y domiciliado en ${domicilioEducando}, comuna de ${comunaEducando} para realizar su práctica profesional en la sección ${seccionPractica} en las siguientes condiciones:`;

        doc.text(parrafoInicial, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, parrafoInicial, pageWidth - 2 * margin) + 15;

        // Cláusulas del convenio
        const clausulas = [
            {
                numero: 'PRIMERO',
                texto: 'Las partes declaran que el educando, no es, ni será trabajador dependiente de la empresa, la que en este caso actúa como delegado del establecimiento educacional y que su función es una prolongación de la función docente del citado establecimiento.'
            },
            {
                numero: 'SEGUNDO',
                texto: `Con todo, pese a no existir vínculo de subordinación y dependencia, la empresa para el buen fin de la práctica del educando establece que éste debe obligarse a las condiciones que se detallan a continuación:\n\n${document.getElementById('condicionesEspecificas').value || 'Las condiciones específicas se establecerán según los requerimientos de la empresa.'}`
            },
            {
                numero: 'TERCERO',
                texto: `La práctica del educando, de acuerdo a lo solicitado por el establecimiento educacional será de ${document.getElementById('horasTotales').value || '____'} horas cronológicas las que deberán, por asuntos de ordenamiento interno, desarrollarse dentro del siguiente horario: ${document.getElementById('horarioPractica').value || '________________'}.`
            },
            {
                numero: 'CUARTO',
                texto: `La prestación aparente de servicios no juega como elemento de plusvalía y la empresa, como colaboradores de la función docente del establecimiento educacional, no se encuentra obligada a pagar remuneraciones alguna para esta práctica.\n\nPese a lo anterior, la empresa pagará, a título de compensación, asignaciones de movilización, de colación y de reembolso de gastos, debidamente comprobados, que el educando haya podido efectuar en relación a la práctica y que hubieren sido previamente autorizados por ella. Sin perjuicio de lo anterior, se fija en este acto el pago de las siguientes asignaciones:\n\nAsignación de Colación: $${ConfigUtils.formatNumber(document.getElementById('asignacionColacion').value) || '0'}\n\nAsignación de Movilización: $${ConfigUtils.formatNumber(document.getElementById('asignacionMovilizacion').value) || '0'}\n\nLos reembolsos de gastos en que incurra el educando tendrá un tope de: $${ConfigUtils.formatNumber(document.getElementById('topeReembolso').value) || '0'}`
            },
            {
                numero: 'QUINTO',
                texto: 'Por no ser trabajador de la empresa el educando no podrá intervenir en forma alguna en los asuntos sindicales o de negociación colectiva de ésta.'
            },
            {
                numero: 'SEXTO',
                texto: 'El hecho de haber realizado su práctica en la empresa no obliga en forma alguna a ésta a contratarlo con posterioridad a ella.'
            },
            {
                numero: 'SÉPTIMO',
                texto: 'La empresa se obliga a los controles que el establecimiento educacional practique mediante sus docentes.'
            },
            {
                numero: 'OCTAVO',
                texto: `La práctica terminará al haberse completado satisfactoriamente las horas establecidas en la cláusula tercera de este convenio y haberse extendido el informe de práctica requerido.\n\nSin embargo, la práctica podrá terminarse anticipadamente por lo siguiente:\n\na) Abandono notorio de ella, cuando, de acuerdo con el establecimiento educacional se compruebe la inasistencia injustificada por ${document.getElementById('diasInasistencia').value || '__'} días consecutivos;\n\nb) Faltas a la buena relación que debe existir entre el educando y las personas que imparten la práctica en los niveles que sean;\n\nc) Por infringir la norma de la cláusula quinta de este convenio.\n\nEn todos estos casos se dará aviso escrito y circunstancias a la autoridad educacional del caso.`
            },
            {
                numero: 'NOVENO',
                texto: (() => {
                    const fechaInicioPractica = document.getElementById('fechaInicioPractica').value;
                    let fechaInicioTexto = '__ de ________ de 20__';
                    if (fechaInicioPractica && ConfigUtils.validateDate(fechaInicioPractica)) {
                        const date = new Date(fechaInicioPractica);
                        fechaInicioTexto = `${date.getDate()} de ${this.mesesEspanol[date.getMonth()]} de ${date.getFullYear()}`;
                    }
                    return `Se deja constancia que el educando, Sr.(ta) ${nombreEducando}, motivo del presente convenio, inicia su práctica profesional con fecha ${fechaInicioTexto}.`;
                })()
            },
            {
                numero: 'DÉCIMO',
                texto: `El presente convenio se firma en ${document.getElementById('numeroEjemplares').value || '__'} ejemplares, declarando las partes haber recibido, a lo menos, un ejemplar de este convenio.`
            }
        ];

        // Agregar cláusulas al PDF
        clausulas.forEach(clausula => {
            // Verificar si necesitamos nueva página
            if (y > 200) {
                doc.addPage();
                y = 30;
            }

            doc.setFont('times', 'bold');
            doc.text(`${clausula.numero}:`, margin, y);
            y += 8;

            doc.setFont('times', 'normal');
            doc.text(clausula.texto, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, clausula.texto, pageWidth - 2 * margin) + 15;
        });

        // Verificar si necesitamos nueva página para firmas
        if (y > 160) {
            doc.addPage();
            y = 30;
        }

        // Espacio para firmas
        y += 40;
        this.addSignatureSection(doc, y);
        
        // Notas legales
        y += 100;
        if (y > 220) {
            doc.addPage();
            y = 30;
        }
        
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('(1) Este convenio no se rige por la legislación laboral, ya que la práctica profesional obedece', margin, y);
        y += 6;
        doc.text('a normas emanadas por el Ministerio de Educación Pública.', margin, y);
        y += 10;
        doc.text('(2) Como norma general, de acuerdo con el D.S. Nº 30, de Educación, publicado el 11-03-1987,', margin, y);
        y += 6;
        doc.text('la duración de la práctica no podrá ser inferior a 480 horas cronológicas ni superior a 720', margin, y);
        y += 6;
        doc.text('de estas horas.', margin, y);
        
        this.addDigitalWatermark(doc);
    }

    addSignatureSection(doc, y) {
        console.log('📄 Agregando sección de firmas al PDF...');
        
        const leftX = 60;   // Empresa
        const rightX = 150; // Educando
        
        // Líneas de firma
        doc.line(leftX - 25, y, leftX + 25, y);
        doc.line(rightX - 25, y, rightX + 25, y);
        y += 8;
        
        // Nombres
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        const nombreRepresentante = document.getElementById('nombreRepresentante').value;
        const nombreEducando = document.getElementById('nombreEducando').value;
        doc.text(nombreRepresentante, leftX, y, { align: 'center' });
        doc.text(nombreEducando, rightX, y, { align: 'center' });
        y += 8;
        
        // Títulos
        doc.setFont('times', 'bold');
        doc.setFontSize(10);
        doc.text('EMPRESA', leftX, y, { align: 'center' });
        doc.text('EDUCANDO', rightX, y, { align: 'center' });
        y += 8;
        
        // RUTs
        const rutEmpresa = document.getElementById('rutEmpresa').value;
        const rutEducando = document.getElementById('rutEducando').value;
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.text(`RUT ${rutEmpresa}`, leftX, y, { align: 'center' });
        doc.text(`RUT ${rutEducando}`, rightX, y, { align: 'center' });
        
        // Agregar firmas digitales si existen
        if (window.firmaProcessor) {
            try {
                const firmaEmpresa = window.firmaProcessor.getSignatureForPDF('empresa');
                const firmaEducando = window.firmaProcessor.getSignatureForPDF('educando');
                
                if (firmaEmpresa) {
                    doc.addImage(firmaEmpresa, 'PNG', leftX - 25, y - 30, 50, 20);
                    console.log('✅ Firma de la empresa agregada al PDF');
                }
                
                if (firmaEducando) {
                    doc.addImage(firmaEducando, 'PNG', rightX - 25, y - 30, 50, 20);
                    console.log('✅ Firma del educando agregada al PDF');
                }
                
                if (firmaEmpresa || firmaEducando) {
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
        doc.text(`ID: ${ConfigUtils.generateDocumentId()}`, 105, 270, { align: 'center' });
        doc.setTextColor(0, 0, 0);
    }

    calculateTextHeight(doc, text, maxWidth) {
        const lines = doc.splitTextToSize(text, maxWidth);
        return lines.length * 5; // Aproximadamente 5mm por línea
    }

    generateFileName() {
        const nombreEducando = document.getElementById('nombreEducando').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const nombreEmpresa = document.getElementById('nombreEmpresa').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '')
            .substring(0, 20);
        const timestamp = new Date().toISOString().slice(0, 10);
        return `Convenio_Practica_${nombreEducando}_${nombreEmpresa}_${timestamp}.pdf`;
    }

    validateFormWithSignatures() {
        const emptyFields = [];
        
        // Campos mínimos requeridos
        const requiredFields = [
            'ciudadConvenio', 'fechaConvenio',
            'nombreEstablecimiento', 'nombreDocente',
            'nombreEmpresa', 'rutEmpresa', 'domicilioEmpresa', 'comunaEmpresa',
            'nombreRepresentante', 'rutRepresentante',
            'nombreEducando', 'rutEducando', 'nacionalidadEducando', 'fechaNacimientoEducando',
            'domicilioEducando', 'comunaEducando',
            'seccionPractica', 'horasTotales', 'horarioPractica', 'fechaInicioPractica'
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
        const rutEmpresa = document.getElementById('rutEmpresa').value;
        if (rutEmpresa && !ConfigUtils.validateRUT(rutEmpresa)) {
            issues.push('RUT de la empresa inválido');
        }

        const rutRepresentante = document.getElementById('rutRepresentante').value;
        if (rutRepresentante && !ConfigUtils.validateRUT(rutRepresentante)) {
            issues.push('RUT del representante inválido');
        }

        const rutEducando = document.getElementById('rutEducando').value;
        if (rutEducando && !ConfigUtils.validateRUT(rutEducando)) {
            issues.push('RUT del educando inválido');
        }
        
        // Validar fechas
        const fechaConvenio = document.getElementById('fechaConvenio').value;
        if (fechaConvenio && !ConfigUtils.validateDate(fechaConvenio)) {
            issues.push('Fecha del convenio inválida');
        }
        
        const fechaNacimientoEducando = document.getElementById('fechaNacimientoEducando').value;
        if (fechaNacimientoEducando && !ConfigUtils.validateBirthDate(fechaNacimientoEducando)) {
            issues.push('Fecha de nacimiento del educando inválida');
        }
        
        const fechaInicioPractica = document.getElementById('fechaInicioPractica').value;
        if (fechaInicioPractica && !ConfigUtils.validateDate(fechaInicioPractica)) {
            issues.push('Fecha de inicio de práctica inválida');
        }
        
        // Validar horas de práctica
        const horasTotales = document.getElementById('horasTotales').value;
        if (horasTotales && !ConfigUtils.validateHorasPractica(horasTotales)) {
            issues.push('Horas de práctica inválidas (480-720 horas)');
        }
        
        if (!systemState.firmasDigitales.empresa) {
            issues.push('Falta firma digital de la empresa');
        }

        if (!systemState.firmasDigitales.educando) {
            issues.push('Falta firma digital del educando');
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
            empresa: null,
            educando: null
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
            
            if (window.convenioPracticaSystem) {
                window.convenioPracticaSystem.updateProgress();
            }
            
            this.closeModal();
            
            if (window.convenioPracticaSystem) {
                window.convenioPracticaSystem.showNotification(`Firma digital ${this.currentType === 'empresa' ? 'de la empresa' : 'del educando'} aplicada correctamente`, 'success');
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
        this.firmasDigitales = { empresa: null, educando: null };
        
        systemState.firmasDigitales = { empresa: false, educando: false };
        
        ['empresa', 'educando'].forEach(type => {
            const buttonId = `firma${type.charAt(0).toUpperCase() + type.slice(1)}`;
            const button = document.getElementById(buttonId);
            if (button) {
                button.classList.remove('signed');
                const textElement = button.querySelector('.signature-text');
                if (textElement) {
                    textElement.textContent = type === 'empresa' ? 'FIRMA EMPRESA' : 'FIRMA EDUCANDO';
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
        
        if (window.convenioPracticaSystem) {
            window.convenioPracticaSystem.showNotification(errorMessage, 'error');
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
            
            if (window.convenioPracticaSystem) {
                window.convenioPracticaSystem.showNotification(`Foto del ${this.currentStep} capturada`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            if (window.convenioPracticaSystem) {
                window.convenioPracticaSystem.showNotification('Error al capturar la foto', 'error');
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
            if (window.convenioPracticaSystem) {
                window.convenioPracticaSystem.showNotification('Ahora capture el reverso del carnet', 'info');
            }
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            this.currentStep = 'completed';
            this.showSummary();
            if (window.convenioPracticaSystem) {
                window.convenioPracticaSystem.showNotification('Ambas fotos capturadas', 'success');
            }
        }
    }

    restartProcess() {
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        if (window.convenioPracticaSystem) {
            window.convenioPracticaSystem.showNotification('Proceso reiniciado', 'info');
        }
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            if (window.convenioPracticaSystem) {
                window.convenioPracticaSystem.showNotification('Faltan fotos por capturar', 'error');
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
            
            if (window.convenioPracticaSystem) {
                window.convenioPracticaSystem.updateProgress();
            }

            this.closeModal();
            
            if (window.convenioPracticaSystem) {
                const tipoPersona = this.currentType === 'empresa' ? 'representante de la empresa' : 'educando';
                window.convenioPracticaSystem.showNotification(`Carnet completo del ${tipoPersona} guardado`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al confirmar fotos:', error);
            if (window.convenioPracticaSystem) {
                window.convenioPracticaSystem.showNotification('Error al procesar las fotos', 'error');
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
        ['empresa', 'educando'].forEach(type => {
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
    if (window.convenioPracticaSystem) {
        window.convenioPracticaSystem.clearForm();
    }
};

window.generatePDF = function() {
    if (window.convenioPracticaSystem) {
        window.convenioPracticaSystem.generatePDF();
    }
};

// ===== INICIALIZACIÓN DEL SISTEMA =====
let convenioPracticaSystem;

function initializeConvenioPracticaSystem() {
    console.log('📋 Iniciando Sistema de Convenio de Práctica Profesional...');
    
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined') {
        console.warn('⚠️ jsPDF no está disponible, esperando...');
        setTimeout(initializeConvenioPracticaSystem, 1000);
        return;
    }
    
    // Verificar que CONFIG esté disponible
    if (typeof CONFIG === 'undefined') {
        console.warn('⚠️ CONFIG no está disponible, esperando...');
        setTimeout(initializeConvenioPracticaSystem, 1000);
        return;
    }
    
    try {
        convenioPracticaSystem = new ConvenioPracticaSystem();
        window.convenioPracticaSystem = convenioPracticaSystem;
        
        console.log('✅ Sistema completamente inicializado');
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        setTimeout(initializeConvenioPracticaSystem, 2000);
    }
}

// ===== MÚLTIPLES PUNTOS DE INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeConvenioPracticaSystem);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initializeConvenioPracticaSystem, 500);
}

window.addEventListener('load', () => {
    if (!window.convenioPracticaSystem) {
        console.log('🔄 Inicialización de respaldo activada');
        setTimeout(initializeConvenioPracticaSystem, 1000);
    }
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', (event) => {
    console.error('❌ Error global capturado:', event.error);
    
    if (window.convenioPracticaSystem) {
        window.convenioPracticaSystem.showNotification(
            'Se detectó un error. El sistema intentará recuperarse automáticamente.', 
            'warning'
        );
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
    
    if (window.convenioPracticaSystem) {
        window.convenioPracticaSystem.showNotification(
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
console.log('📜 Sistema de Convenio de Práctica Profesional - Script principal cargado correctamente');