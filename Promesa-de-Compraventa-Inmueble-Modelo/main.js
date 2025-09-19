// ========================================
// 📋 SISTEMA PRINCIPAL DE PROMESA DE COMPRAVENTA
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'ciudadContrato', 'fechaContrato',
        'nombreVendedor', 'rutVendedor', 'nacionalidadVendedor', 'estadoCivilVendedor', 'profesionVendedor', 
        'domicilioVendedor', 'comunaVendedor', 'ciudadVendedor', 'correoVendedor',
        'nombreComprador', 'rutComprador', 'nacionalidadComprador', 'estadoCivilComprador', 'profesionComprador',
        'domicilioComprador', 'comunaComprador', 'ciudadComprador', 'correoComprador',
        'tipoInmueble', 'numeroInmueble', 'pisoInmueble', 'edificioInmueble', 'direccionInmueble',
        'comunaInmueble', 'regionInmueble', 'rolAvaluo', 'numeroPlano',
        'deslindeNorte', 'deslindeSur', 'deslindeEste', 'deslindeOeste', 'otrosDeslindes',
        'fojasInscripcion', 'numeroInscripcion', 'anioInscripcion', 'conservadorBienes',
        'notariaAnterior', 'fechaEscrituraAnterior',
        'precioTotalUF', 'formaPago', 'plazoEscritura', 'indemnizacionUF', 'indemnizacionDiaria',
        'condicionesPago', 'notariaDefinitiva', 'plazoAntecedentes', 'distribucionGastos', 'observacionesEspeciales'
    ],
    
    firmasDigitales: {
        vendedor: false,
        comprador: false
    },
    
    fotosCarnet: {
        vendedor: {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        },
        comprador: {
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
class PromesaCompraventaSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Promesa de Compraventa...');
        
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
            'firmaVendedor', 'firmaComprador', 'photoVendedor', 'photoComprador',
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
        // Validación RUT Vendedor
        const rutVendedor = document.getElementById('rutVendedor');
        if (rutVendedor) {
            rutVendedor.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutVendedor');
            });
        }

        // Validación RUT Comprador
        const rutComprador = document.getElementById('rutComprador');
        if (rutComprador) {
            rutComprador.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutComprador');
            });
        }

        // Validación Email Vendedor
        const correoVendedor = document.getElementById('correoVendedor');
        if (correoVendedor) {
            correoVendedor.addEventListener('input', (e) => {
                if (ConfigUtils.validateEmail(e.target.value)) {
                    e.target.classList.add('email-valid');
                    e.target.classList.remove('email-invalid');
                } else if (e.target.value !== '') {
                    e.target.classList.add('email-invalid');
                    e.target.classList.remove('email-valid');
                } else {
                    e.target.classList.remove('email-valid', 'email-invalid');
                }
                this.updatePreview();
            });
        }

        // Validación Email Comprador
        const correoComprador = document.getElementById('correoComprador');
        if (correoComprador) {
            correoComprador.addEventListener('input', (e) => {
                if (ConfigUtils.validateEmail(e.target.value)) {
                    e.target.classList.add('email-valid');
                    e.target.classList.remove('email-invalid');
                } else if (e.target.value !== '') {
                    e.target.classList.add('email-invalid');
                    e.target.classList.remove('email-valid');
                } else {
                    e.target.classList.remove('email-valid', 'email-invalid');
                }
                this.updatePreview();
            });
        }

        // Auto-llenar fecha actual
        const fechaContrato = document.getElementById('fechaContrato');
        if (fechaContrato && !fechaContrato.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaContrato.value = today;
        }

        // Validar precio en UF
        const precioTotalUF = document.getElementById('precioTotalUF');
        if (precioTotalUF) {
            precioTotalUF.addEventListener('input', (e) => {
                const valor = parseFloat(e.target.value);
                if (!isNaN(valor) && ConfigUtils.validatePrecioUF(valor)) {
                    e.target.classList.add('uf-valid');
                    e.target.classList.remove('uf-invalid');
                } else if (e.target.value !== '') {
                    e.target.classList.add('uf-invalid');
                    e.target.classList.remove('uf-valid');
                } else {
                    e.target.classList.remove('uf-valid', 'uf-invalid');
                }
                this.updatePreview();
            });
        }

        // Validar indemnización UF
        const indemnizacionUF = document.getElementById('indemnizacionUF');
        if (indemnizacionUF) {
            indemnizacionUF.addEventListener('input', (e) => {
                const valor = parseFloat(e.target.value);
                if (!isNaN(valor) && ConfigUtils.validateIndemnizacionUF(valor)) {
                    e.target.classList.add('uf-valid');
                    e.target.classList.remove('uf-invalid');
                } else if (e.target.value !== '') {
                    e.target.classList.add('uf-invalid');
                    e.target.classList.remove('uf-valid');
                } else {
                    e.target.classList.remove('uf-valid', 'uf-invalid');
                }
                this.updatePreview();
            });
        }

        // Validar ROL de avalúo
        const rolAvaluo = document.getElementById('rolAvaluo');
        if (rolAvaluo) {
            rolAvaluo.addEventListener('input', (e) => {
                if (ConfigUtils.validateRolAvaluo(e.target.value)) {
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

        // Validar fojas de inscripción
        const fojasInscripcion = document.getElementById('fojasInscripcion');
        if (fojasInscripcion) {
            fojasInscripcion.addEventListener('input', (e) => {
                if (ConfigUtils.validateFojas(e.target.value)) {
                    e.target.classList.add('fojas-valid');
                    e.target.classList.remove('fojas-invalid');
                } else if (e.target.value !== '') {
                    e.target.classList.add('fojas-invalid');
                    e.target.classList.remove('fojas-valid');
                } else {
                    e.target.classList.remove('fojas-valid', 'fojas-invalid');
                }
                this.updatePreview();
            });
        }

        // Configurar valores por defecto
        this.setupDefaultValues();
    }

    setupDefaultValues() {
        // Valores por defecto para nacionalidades
        const nacionalidadVendedor = document.getElementById('nacionalidadVendedor');
        if (nacionalidadVendedor && !nacionalidadVendedor.value) {
            nacionalidadVendedor.value = 'Chilena';
        }

        const nacionalidadComprador = document.getElementById('nacionalidadComprador');
        if (nacionalidadComprador && !nacionalidadComprador.value) {
            nacionalidadComprador.value = 'Chilena';
        }

        // Valor por defecto para región
        const regionInmueble = document.getElementById('regionInmueble');
        if (regionInmueble && !regionInmueble.value) {
            regionInmueble.value = 'Metropolitana';
        }

        // Valores por defecto para plazos
        const plazoEscritura = document.getElementById('plazoEscritura');
        if (plazoEscritura && !plazoEscritura.value) {
            plazoEscritura.value = '60';
        }

        const plazoAntecedentes = document.getElementById('plazoAntecedentes');
        if (plazoAntecedentes && !plazoAntecedentes.value) {
            plazoAntecedentes.value = '15';
        }

        // Valor por defecto para indemnización diaria
        const indemnizacionDiaria = document.getElementById('indemnizacionDiaria');
        if (indemnizacionDiaria && !indemnizacionDiaria.value) {
            indemnizacionDiaria.value = '2';
        }

        // Valor por defecto para distribución de gastos
        const distribucionGastos = document.getElementById('distribucionGastos');
        if (distribucionGastos && !distribucionGastos.value) {
            distribucionGastos.value = 'Los gastos notariales que se deriven del presente contrato serán de cargo de ambas partes por mitades. Los gastos notariales relativos al contrato prometido, serán de cargo de ambas partes por mitades. Los gastos de inscripción en el Registro de Propiedad serán de cargo exclusivo del Promitente Comprador.';
        }

        // Valor por defecto para notaría definitiva
        const notariaDefinitiva = document.getElementById('notariaDefinitiva');
        if (notariaDefinitiva && !notariaDefinitiva.value) {
            notariaDefinitiva.value = 'que singularice la parte compradora';
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
        // Referencias duplicadas en el documento
        const nombreVendedor = document.getElementById('nombreVendedor').value;
        const nombreComprador = document.getElementById('nombreComprador').value;
        const tipoInmueble = document.getElementById('tipoInmueble').value;
        const numeroInmueble = document.getElementById('numeroInmueble').value;
        const pisoInmueble = document.getElementById('pisoInmueble').value;
        const edificioInmueble = document.getElementById('edificioInmueble').value;
        const direccionInmueble = document.getElementById('direccionInmueble').value;
        const comunaInmueble = document.getElementById('comunaInmueble').value;
        const regionInmueble = document.getElementById('regionInmueble').value;
        const ciudadContrato = document.getElementById('ciudadContrato').value;

        // Actualizar referencias múltiples
        ['prev_nombreVendedor2', 'prev_nombreVendedor3', 'prev_nombreVendedor4'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = nombreVendedor || '________________';
        });

        ['prev_nombreComprador2', 'prev_nombreComprador3'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = nombreComprador || '________________';
        });

        ['prev_tipoInmueble2'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = tipoInmueble || 'inmueble';
        });

        ['prev_numeroInmueble2'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = numeroInmueble || '________';
        });

        ['prev_pisoInmueble2'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = pisoInmueble || '____ piso';
        });

        ['prev_edificioInmueble2'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = edificioInmueble || '________';
        });

        ['prev_direccionInmueble2'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = direccionInmueble || '________________';
        });

        ['prev_comunaInmueble2', 'prev_comunaInmueble3'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = comunaInmueble || '________';
        });

        ['prev_regionInmueble2'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = regionInmueble || '________';
        });

        ['prev_ciudadContrato2'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = ciudadContrato || 'Santiago';
        });
    }

    updateDatePreview() {
        const fechaContrato = document.getElementById('fechaContrato').value;
        
        if (fechaContrato && ConfigUtils.validateDate(fechaContrato)) {
            const date = new Date(fechaContrato);
            
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
        const nombreVendedor = document.getElementById('nombreVendedor').value;
        const nombreComprador = document.getElementById('nombreComprador').value;
        
        const firmaVendedor = document.getElementById('prev_firmaVendedor');
        const firmaComprador = document.getElementById('prev_firmaComprador');
        
        if (firmaVendedor) {
            firmaVendedor.textContent = nombreVendedor || '_______________';
        }
        
        if (firmaComprador) {
            firmaComprador.textContent = nombreComprador || '_______________';
        }
    }

    getPlaceholderText(field) {
        const placeholders = {
            'ciudadContrato': 'Santiago',
            'nombreVendedor': '________________',
            'nombreComprador': '________________',
            'nacionalidadVendedor': 'Chilena',
            'nacionalidadComprador': 'Chilena',
            'rutVendedor': 'XX.XXX.XXX-X',
            'rutComprador': 'XX.XXX.XXX-X',
            'domicilioVendedor': '________________',
            'domicilioComprador': '________________',
            'profesionVendedor': '________',
            'profesionComprador': '________',
            'estadoCivilVendedor': '________',
            'estadoCivilComprador': '________',
            'comunaVendedor': '________',
            'comunaComprador': '________',
            'ciudadVendedor': '________',
            'ciudadComprador': '________',
            'correoVendedor': '________',
            'correoComprador': '________',
            'tipoInmueble': 'inmueble',
            'numeroInmueble': '________',
            'pisoInmueble': '____ piso',
            'edificioInmueble': '________',
            'direccionInmueble': '________________',
            'comunaInmueble': '________',
            'regionInmueble': '________',
            'rolAvaluo': '________',
            'numeroPlano': '________',
            'deslindeNorte': '________',
            'deslindeSur': '________',
            'deslindeEste': '________',
            'deslindeOeste': '________',
            'otrosDeslindes': '________',
            'fojasInscripcion': '____',
            'numeroInscripcion': '____',
            'anioInscripcion': '____',
            'conservadorBienes': '________',
            'notariaAnterior': '________',
            'fechaEscrituraAnterior': '________',
            'precioTotalUF': '____',
            'formaPago': 'vale vista',
            'plazoEscritura': 'sesenta',
            'indemnizacionUF': '____',
            'indemnizacionDiaria': 'dos',
            'condicionesPago': '________',
            'notariaDefinitiva': 'que singularice la parte compradora',
            'plazoAntecedentes': 'quince',
            'distribucionGastos': 'Los gastos notariales serán de cargo de ambas partes por mitades',
            'observacionesEspeciales': '________'
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
        
        // Bonus por firmas digitales
        if (systemState.firmasDigitales.vendedor) bonusScore += 0.5;
        if (systemState.firmasDigitales.comprador) bonusScore += 0.5;
        
        // Bonus por fotos carnet
        if (systemState.fotosCarnet.vendedor.completed) bonusScore += 0.5;
        if (systemState.fotosCarnet.comprador.completed) bonusScore += 0.5;
        
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
        
        const requiredElements = ['firmaModalOverlay', 'firmaVendedor', 'firmaComprador'];
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
        
        const btnFirmaVendedor = document.getElementById('firmaVendedor');
        const btnFirmaComprador = document.getElementById('firmaComprador');
        
        if (!btnFirmaVendedor || !btnFirmaComprador) {
            throw new Error('Botones de firma no encontrados');
        }
        
        btnFirmaVendedor.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('vendedor');
        });
        
        btnFirmaComprador.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('comprador');
        });
        
        console.log('✅ Botones de firma configurados correctamente');
    }

    openSignatureModalSafe(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        let nombreField = document.getElementById(`nombre${type.charAt(0).toUpperCase() + type.slice(1)}`);
        
        if (!nombreField || !nombreField.value.trim()) {
            this.showNotification(`Complete el nombre del ${type} antes de firmar`, 'warning');
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
        
        const requiredElements = ['photoModalOverlay', 'photoVendedor', 'photoComprador'];
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
        
        const btnPhotoVendedor = document.getElementById('photoVendedor');
        const btnPhotoComprador = document.getElementById('photoComprador');
        
        if (!btnPhotoVendedor || !btnPhotoComprador) {
            throw new Error('Botones de foto no encontrados');
        }
        
        btnPhotoVendedor.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('vendedor');
        });
        
        btnPhotoComprador.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('comprador');
        });
        
        console.log('✅ Botones de foto configurados correctamente');
    }

    openPhotoModalSafe(type) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        let nombreField = document.getElementById(`nombre${type.charAt(0).toUpperCase() + type.slice(1)}`);
        
        if (!nombreField || !nombreField.value.trim()) {
            this.showNotification(`Complete el nombre del ${type} antes de tomar fotos`, 'warning');
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
                        systemState.firmasDigitales = data.firmasDigitales || { vendedor: false, comprador: false };
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
        const fechaContrato = document.getElementById('fechaContrato');
        if (fechaContrato && !fechaContrato.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaContrato.value = today;
        }
        
        this.setupDefaultValues();
        
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
                        element.classList.remove('rut-valid', 'rut-invalid', 'email-valid', 'email-invalid', 'uf-valid', 'uf-invalid', 'rol-valid', 'rol-invalid', 'fojas-valid', 'fojas-invalid');
                    }
                });
                
                // Restaurar valores por defecto
                this.setupDefaultValues();
                
                systemState.firmasDigitales = { vendedor: false, comprador: false };
                systemState.fotosCarnet = {
                    vendedor: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false },
                    comprador: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false }
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
                this.showNotification('PDF de Promesa de Compraventa generado exitosamente', 'success');
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
        doc.text('ESCRITURA PRIVADA', 105, y, { align: 'center' });
        y += 15;
        doc.setFontSize(18);
        doc.text('PROMESA DE COMPRAVENTA', 105, y, { align: 'center' });
        y += 30;

        // Nombres centrados
        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        const nombreVendedor = document.getElementById('nombreVendedor').value || '________________';
        const nombreComprador = document.getElementById('nombreComprador').value || '________________';
        
        doc.text(nombreVendedor, 105, y, { align: 'center' });
        y += 10;
        doc.text('A', 105, y, { align: 'center' });
        y += 10;
        doc.text(nombreComprador, 105, y, { align: 'center' });
        y += 25;

        // Contenido principal
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        
        const fechaContrato = document.getElementById('fechaContrato').value;
        const ciudadContrato = document.getElementById('ciudadContrato').value || 'Santiago';
        
        // Párrafo introductorio
        let fechaTexto = '__ de ________ de 20__';
        if (fechaContrato && ConfigUtils.validateDate(fechaContrato)) {
            const date = new Date(fechaContrato);
            fechaTexto = `${date.getDate()} de ${this.mesesEspanol[date.getMonth()]} del año ${date.getFullYear()}`;
        }

        const parrafo1 = `En ${ciudadContrato} de Chile, a ${fechaTexto}, entre don(ña) ${nombreVendedor}, ${document.getElementById('nacionalidadVendedor').value || 'chilena'}, ${document.getElementById('estadoCivilVendedor').value || '________'}, ${document.getElementById('profesionVendedor').value || '________'}, cédula de identidad N° ${document.getElementById('rutVendedor').value || 'XX.XXX.XXX-X'}, con domicilio en ${document.getElementById('domicilioVendedor').value || '________________'}, comuna de ${document.getElementById('comunaVendedor').value || '________'}, ${document.getElementById('ciudadVendedor').value || '________'}, de paso por esta, por una parte, y en adelante también denominada indistintamente como la "promitente vendedora", y por la otra parte, don(ña) ${nombreComprador}, ${document.getElementById('nacionalidadComprador').value || 'chilena'}, ${document.getElementById('estadoCivilComprador').value || '________'}, ${document.getElementById('profesionComprador').value || '________'}, cédula de identidad N° ${document.getElementById('rutComprador').value || 'XX.XXX.XXX-X'}, con domicilio en ${document.getElementById('domicilioComprador').value || '________________'}, comuna de ${document.getElementById('comunaComprador').value || '________'}, ${document.getElementById('ciudadComprador').value || '________'}, en adelante también denominada indistintamente como la "promitente compradora", todos los comparecientes mayores de edad, quienes acreditan sus identidades con sus respectivas cédulas, han convenido en forma libre y voluntaria, en pleno uso de sus facultades, en el siguiente contrato de promesa de compraventa:`;
        
        doc.text(parrafo1, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, parrafo1, pageWidth - 2 * margin) + 15;

        // Verificar si necesitamos nueva página
        if (y > 200) {
            doc.addPage();
            y = 30;
        }

        // Cláusula Primera - Propiedad
        const tipoInmueble = document.getElementById('tipoInmueble').value || 'inmueble';
        const numeroInmueble = document.getElementById('numeroInmueble').value || '________';
        const pisoInmueble = document.getElementById('pisoInmueble').value || '____ piso';
        const edificioInmueble = document.getElementById('edificioInmueble').value || '________';
        const direccionInmueble = document.getElementById('direccionInmueble').value || '________________';
        const comunaInmueble = document.getElementById('comunaInmueble').value || '________';
        const regionInmueble = document.getElementById('regionInmueble').value || '________';
        const numeroPlano = document.getElementById('numeroPlano').value || '________';
        const deslindeNorte = document.getElementById('deslindeNorte').value || '________';
        const deslindeSur = document.getElementById('deslindeSur').value || '________';
        const deslindeEste = document.getElementById('deslindeEste').value || '________';
        const deslindeOeste = document.getElementById('deslindeOeste').value || '________';
        const otrosDeslindes = document.getElementById('otrosDeslindes').value;

        const clausulaPrimera = `PRIMERO: Don(ña) ${nombreVendedor}, es dueña del ${tipoInmueble} número ${numeroInmueble} del ${pisoInmueble}, del ${edificioInmueble}, con acceso por ${direccionInmueble}, Comuna de ${comunaInmueble}, Región ${regionInmueble}, de acuerdo al plano archivado con el número ${numeroPlano}; y dueña además de derechos en proporción al valor de lo adquirido en unión de los otros adquirentes en los bienes comunes entre los cuales se encuentra el terreno, que deslinda: AL NORTE: ${deslindeNorte}; AL SUR: ${deslindeSur}; AL ESTE: ${deslindeEste}; AL OESTE: ${deslindeOeste}${otrosDeslindes ? '; ' + otrosDeslindes : ''}. Lo adquirió por tradición, cuyo título traslaticio de dominio fue compra según consta de la escritura pública de fecha ${document.getElementById('fechaEscrituraAnterior').value || '________'} en la Notaría de ${document.getElementById('notariaAnterior').value || '________'}. El dominio a su nombre figura inscrito a fojas ${document.getElementById('fojasInscripcion').value || '____'}, número ${document.getElementById('numeroInscripcion').value || '____'}, del Registro de Propiedad del año ${document.getElementById('anioInscripcion').value || '____'} del Conservador de Bienes Raíces de ${document.getElementById('conservadorBienes').value || '________'}. El rol de avalúo es ${document.getElementById('rolAvaluo').value || '________'} de la Comuna de ${comunaInmueble}.`;
        
        doc.text(clausulaPrimera, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausulaPrimera, pageWidth - 2 * margin) + 15;

        // Verificar nueva página
        if (y > 200) {
            doc.addPage();
            y = 30;
        }

        // Cláusula Segunda
        const clausulaSegunda = `SEGUNDO: Por el presente acto e instrumento, don(ña) ${nombreVendedor}, promete vender, ceder y transferir a don(ña) ${nombreComprador}, quien promete comprar, aceptar y adquirir para sí o para quien designe, el ${tipoInmueble} número ${numeroInmueble} del ${pisoInmueble}, del ${edificioInmueble}, con acceso por ${direccionInmueble}, Comuna de ${comunaInmueble}, Región ${regionInmueble}, singularizados en la cláusula primera precedente.`;
        
        doc.text(clausulaSegunda, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausulaSegunda, pageWidth - 2 * margin) + 15;

        // Cláusula Tercera - Precio
        const precioTotalUF = document.getElementById('precioTotalUF').value || '____';
        const formaPago = document.getElementById('formaPago').value || 'vale vista';
        const condicionesPago = document.getElementById('condicionesPago').value;

        const clausulaTercera = `TERCERO: El precio total de la compraventa prometida será la cantidad única y total de ${precioTotalUF} Unidades de Fomento, que será pagado en la fecha de la firma de la escritura de compraventa prometida, a través de ${formaPago}${condicionesPago ? ', ' + condicionesPago : ''}, es decir hasta que se le acredite al Notario que autorice la escritura que el inmueble vendido se encuentra en dominio del comprador libre de hipotecas, prohibiciones, embargos, litigios y de otros gravámenes.`;
        
        doc.text(clausulaTercera, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausulaTercera, pageWidth - 2 * margin) + 15;

        // Continúa con más cláusulas y la sección de firmas...
        this.addRemainingClauses(doc, y, margin, pageWidth);
        
        this.addDigitalWatermark(doc);
    }

    addRemainingClauses(doc, startY, margin, pageWidth) {
        let y = startY;

        // Verificar nueva página
        if (y > 200) {
            doc.addPage();
            y = 30;
        }

        // Cláusula sobre plazos
        const plazoEscritura = document.getElementById('plazoEscritura').value || 'sesenta';
        const plazoAntecedentes = document.getElementById('plazoAntecedentes').value || 'quince';
        const notariaDefinitiva = document.getElementById('notariaDefinitiva').value || 'que singularice la parte compradora';

        const clausulaPlazos = `SEXTO: El otorgamiento del contrato de compraventa definitivo queda sujeto en cuanto a su exigibilidad a la condición suspensiva que los títulos del inmueble prometido vender y los antecedentes de su vendedora se encuentren en orden y ajustados a derecho, conforme el criterio de la parte compradora. La escritura pública de compraventa definitiva deberá suscribirse en la notaría ${notariaDefinitiva}, una vez cumplida la condición anterior, en un plazo máximo de ${plazoEscritura} días corridos y contados a partir de esta fecha. Para dar cumplimiento a la condición anterior, los promitentes vendedores, se obligan a entregar a su costo todos los antecedentes legales relativos a los inmuebles y sus personas, dentro del plazo de ${plazoAntecedentes} días a contar de esta fecha.`;
        
        doc.text(clausulaPlazos, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausulaPlazos, pageWidth - 2 * margin) + 15;

        // Cláusula de indemnizaciones
        const indemnizacionUF = document.getElementById('indemnizacionUF').value || '____';
        const indemnizacionDiaria = document.getElementById('indemnizacionDiaria').value || 'dos';

        const clausulaIndemnizacion = `SÉPTIMO: Si cumplida la condición indicada en la cláusula sexta precedente, cualquiera de las partes no suscribiere el contrato de compraventa prometido dentro del plazo máximo estipulado, la otra parte podrá ejercer a su elección: a) Exigir el cumplimiento forzado de la compraventa, y conjuntamente con ello reclamar, a título de indemnización de perjuicios moratorios, que las partes avalúan en este acto en forma convencional y anticipada en la suma de ${indemnizacionDiaria} Unidades de Fomento por cada día de atraso; o, b) Solicitar la resolución del presente contrato y conjuntamente con ello, reclamar a título de indemnización de perjuicios compensatoria, que las partes avalúan en forma convencional y anticipada en este acto, en la suma de ${indemnizacionUF} Unidades de Fomento.`;
        
        doc.text(clausulaIndemnizacion, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausulaIndemnizacion, pageWidth - 2 * margin) + 20;

        // Sección de firmas
        this.addSignatureSection(doc, y);
    }

    addSignatureSection(doc, y) {
        console.log('📄 Agregando sección de firmas al PDF...');
        
        // Verificar si necesitamos nueva página
        if (y > 180) {
            doc.addPage();
            y = 40;
        }

        const nombreVendedor = document.getElementById('nombreVendedor').value || '_______________';
        const nombreComprador = document.getElementById('nombreComprador').value || '_______________';
        
        // Firmas lado a lado
        const leftX = 55;
        const rightX = 155;
        
        // Líneas de firma
        doc.line(leftX - 30, y, leftX + 30, y);
        doc.line(rightX - 30, y, rightX + 30, y);
        y += 8;
        
        // Nombres
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.text(nombreVendedor, leftX, y, { align: 'center' });
        doc.text(nombreComprador, rightX, y, { align: 'center' });
        y += 6;
        
        // Roles
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('PROMITENTE VENDEDORA', leftX, y, { align: 'center' });
        doc.text('PROMITENTE COMPRADORA', rightX, y, { align: 'center' });
        
        // Agregar firmas digitales si existen
        if (window.firmaProcessor) {
            try {
                const firmaVendedor = window.firmaProcessor.getSignatureForPDF('vendedor');
                const firmaComprador = window.firmaProcessor.getSignatureForPDF('comprador');
                
                if (firmaVendedor) {
                    doc.addImage(firmaVendedor, 'PNG', leftX - 30, y - 25, 60, 15);
                    console.log('✅ Firma del vendedor agregada al PDF');
                }
                
                if (firmaComprador) {
                    doc.addImage(firmaComprador, 'PNG', rightX - 30, y - 25, 60, 15);
                    console.log('✅ Firma del comprador agregada al PDF');
                }
                
                if (firmaVendedor || firmaComprador) {
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
        return lines.length * 5; // Aproximadamente 5mm por línea
    }

    generateFileName() {
        const nombreVendedor = document.getElementById('nombreVendedor').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const nombreComprador = document.getElementById('nombreComprador').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const timestamp = new Date().toISOString().slice(0, 10);
        return `Promesa_Compraventa_${nombreVendedor}_${nombreComprador}_${timestamp}.pdf`;
    }

    validateFormWithSignatures() {
        const emptyFields = [];
        
        // Campos mínimos requeridos
        const requiredFields = [
            'ciudadContrato', 'fechaContrato',
            'nombreVendedor', 'rutVendedor', 'nacionalidadVendedor', 'estadoCivilVendedor', 'profesionVendedor',
            'domicilioVendedor', 'comunaVendedor', 'ciudadVendedor',
            'nombreComprador', 'rutComprador', 'nacionalidadComprador', 'estadoCivilComprador', 'profesionComprador',
            'domicilioComprador', 'comunaComprador', 'ciudadComprador',
            'tipoInmueble', 'direccionInmueble', 'comunaInmueble', 'regionInmueble',
            'rolAvaluo', 'precioTotalUF', 'formaPago', 'plazoEscritura'
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
        const rutVendedor = document.getElementById('rutVendedor').value;
        const rutComprador = document.getElementById('rutComprador').value;
        
        if (rutVendedor && !ConfigUtils.validateRUT(rutVendedor)) {
            issues.push('RUT del vendedor inválido');
        }
        
        if (rutComprador && !ConfigUtils.validateRUT(rutComprador)) {
            issues.push('RUT del comprador inválido');
        }
        
        // Validar fechas
        const fechaContrato = document.getElementById('fechaContrato').value;
        if (fechaContrato && !ConfigUtils.validateDate(fechaContrato)) {
            issues.push('Fecha del contrato inválida');
        }
        
        // Validar precio UF
        const precioTotalUF = document.getElementById('precioTotalUF').value;
        if (precioTotalUF && !ConfigUtils.validatePrecioUF(precioTotalUF)) {
            issues.push('Precio total en UF inválido');
        }
        
        if (!systemState.firmasDigitales.vendedor) {
            issues.push('Falta firma digital del vendedor');
        }
        
        if (!systemState.firmasDigitales.comprador) {
            issues.push('Falta firma digital del comprador');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

// ===== PROCESADORES DE FIRMAS Y FOTOS (MANTENIDOS IGUAL) =====
// Se reutilizan las mismas clases del sistema original, solo cambiando las referencias de tipos

class FirmaDigitalProcessor {
    constructor() {
        this.processedImageData = null;
        this.currentType = null;
        this.firmasDigitales = {
            vendedor: null,
            comprador: null
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
            
            if (window.promesaCompraventaSystem) {
                window.promesaCompraventaSystem.updateProgress();
            }
            
            this.closeModal();
            
            if (window.promesaCompraventaSystem) {
                window.promesaCompraventaSystem.showNotification(`Firma digital del ${this.currentType} aplicada correctamente`, 'success');
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
        this.firmasDigitales.vendedor = null;
        this.firmasDigitales.comprador = null;
        
        systemState.firmasDigitales = { vendedor: false, comprador: false };
        
        ['firmaVendedor', 'firmaComprador'].forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.classList.remove('signed');
                const textElement = button.querySelector('.signature-text');
                if (textElement) {
                    textElement.textContent = 'FIRMA DIGITAL';
                }
            }
        });
        
        ['signaturePlaceholderVendedor', 'signaturePreviewVendedor', 'signaturePlaceholderComprador', 'signaturePreviewComprador'].forEach((id, index) => {
            const element = document.getElementById(id);
            if (element) {
                if (index % 2 === 0) { // placeholder
                    element.style.display = 'inline';
                } else { // preview
                    element.style.display = 'none';
                    element.src = '';
                }
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

// ===== CLASE PROCESADOR DE FOTOS CARNET (MANTENIDA IGUAL) =====
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
        
        if (window.promesaCompraventaSystem) {
            window.promesaCompraventaSystem.showNotification(errorMessage, 'error');
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
            
            if (window.promesaCompraventaSystem) {
                window.promesaCompraventaSystem.showNotification(`Foto del ${this.currentStep} capturada`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            if (window.promesaCompraventaSystem) {
                window.promesaCompraventaSystem.showNotification('Error al capturar la foto', 'error');
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
            if (window.promesaCompraventaSystem) {
                window.promesaCompraventaSystem.showNotification('Ahora capture el reverso del carnet', 'info');
            }
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            this.currentStep = 'completed';
            this.showSummary();
            if (window.promesaCompraventaSystem) {
                window.promesaCompraventaSystem.showNotification('Ambas fotos capturadas', 'success');
            }
        }
    }

    restartProcess() {
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        if (window.promesaCompraventaSystem) {
            window.promesaCompraventaSystem.showNotification('Proceso reiniciado', 'info');
        }
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            if (window.promesaCompraventaSystem) {
                window.promesaCompraventaSystem.showNotification('Faltan fotos por capturar', 'error');
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
            
            if (window.promesaCompraventaSystem) {
                window.promesaCompraventaSystem.updateProgress();
            }

            this.closeModal();
            
            if (window.promesaCompraventaSystem) {
                window.promesaCompraventaSystem.showNotification(`Carnet completo del ${this.currentType} guardado`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al confirmar fotos:', error);
            if (window.promesaCompraventaSystem) {
                window.promesaCompraventaSystem.showNotification('Error al procesar las fotos', 'error');
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
        ['vendedor', 'comprador'].forEach(type => {
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
    if (window.promesaCompraventaSystem) {
        window.promesaCompraventaSystem.clearForm();
    }
};

window.generatePDF = function() {
    if (window.promesaCompraventaSystem) {
        window.promesaCompraventaSystem.generatePDF();
    }
};

// ===== INICIALIZACIÓN DEL SISTEMA =====
let promesaCompraventaSystem;

function initializePromesaCompraventaSystem() {
    console.log('📋 Iniciando Sistema de Promesa de Compraventa...');
    
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined') {
        console.warn('⚠️ jsPDF no está disponible, esperando...');
        setTimeout(initializePromesaCompraventaSystem, 1000);
        return;
    }
    
    // Verificar que CONFIG esté disponible
    if (typeof CONFIG === 'undefined') {
        console.warn('⚠️ CONFIG no está disponible, esperando...');
        setTimeout(initializePromesaCompraventaSystem, 1000);
        return;
    }
    
    try {
        promesaCompraventaSystem = new PromesaCompraventaSystem();
        window.promesaCompraventaSystem = promesaCompraventaSystem;
        
        console.log('✅ Sistema completamente inicializado');
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        setTimeout(initializePromesaCompraventaSystem, 2000);
    }
}

// ===== MÚLTIPLES PUNTOS DE INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePromesaCompraventaSystem);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initializePromesaCompraventaSystem, 500);
}

window.addEventListener('load', () => {
    if (!window.promesaCompraventaSystem) {
        console.log('🔄 Inicialización de respaldo activada');
        setTimeout(initializePromesaCompraventaSystem, 1000);
    }
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', (event) => {
    console.error('❌ Error global capturado:', event.error);
    
    if (window.promesaCompraventaSystem) {
        window.promesaCompraventaSystem.showNotification(
            'Se detectó un error. El sistema intentará recuperarse automáticamente.', 
            'warning'
        );
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
    
    if (window.promesaCompraventaSystem) {
        window.promesaCompraventaSystem.showNotification(
            'Error de conectividad detectado. Algunos componentes pueden funcionar de forma limitada.', 
            'warning'
        );
    }
});

// ===== LOG FINAL =====
console.log('📜 Sistema de Promesa de Compraventa - Script principal cargado correctamente');