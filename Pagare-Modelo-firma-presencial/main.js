// ========================================
// 📋 SISTEMA PRINCIPAL DE PAGARÉ MODELO FIRMA PRESENCIAL
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'nombreSociedad',
        'rutSociedad', 
        'giroSociedad',
        'domicilioSociedad',
        'comunaSociedad',
        'ciudadSociedad',
        'nombreRepresentante',
        'nacionalidadRepresentante',
        'estadoCivilRepresentante',
        'profesionRepresentante',
        'cedulaRepresentante',
        'montoNumeros',
        'montoLetras',
        'diaPago',
        'mesPago',
        'anoPago',
        'comunaPago',
        'nombreSuscriptor',
        'rutSuscriptor',
        'profesionSuscriptor',
        'domicilioSuscriptor',
        'nombreRep1',
        'cedulaRep1',
        'cargoRep1',
        'nombreRep2',
        'cedulaRep2',
        'cargoRep2',
        'ciudadSuscripcion',
        'fechaSuscripcion',
        'observacionesAdicionales',
        'declaracionVeracidad',
        'declaracionPago',
        'declaracionCompetencia'
    ],
    
    firmasDigitales: {
        suscriptor: false
    },
    
    fotosCarnet: {
        suscriptor: {
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
class PagareSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.numerosALetras = new NumerosALetras();
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Pagaré Firma Presencial...');
        
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
            'firmaSuscriptor', 'photoSuscriptor',
            'progressFill', 'progressText', 'themeToggle',
            'montoNumeros', 'fechaSuscripcion'
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
        // Validación RUT Sociedad
        const rutSociedad = document.getElementById('rutSociedad');
        if (rutSociedad) {
            rutSociedad.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutSociedad');
            });
        }

        // Validación Cédula Representante
        const cedulaRepresentante = document.getElementById('cedulaRepresentante');
        if (cedulaRepresentante) {
            cedulaRepresentante.addEventListener('input', (e) => {
                this.handleRutInput(e, 'cedulaRepresentante');
            });
        }

        // Validación RUT Suscriptor
        const rutSuscriptor = document.getElementById('rutSuscriptor');
        if (rutSuscriptor) {
            rutSuscriptor.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutSuscriptor');
            });
        }

        // Validación Cédula Rep1
        const cedulaRep1 = document.getElementById('cedulaRep1');
        if (cedulaRep1) {
            cedulaRep1.addEventListener('input', (e) => {
                this.handleRutInput(e, 'cedulaRep1');
            });
        }

        // Validación Cédula Rep2
        const cedulaRep2 = document.getElementById('cedulaRep2');
        if (cedulaRep2) {
            cedulaRep2.addEventListener('input', (e) => {
                this.handleRutInput(e, 'cedulaRep2');
            });
        }

        // Convertir números a letras automáticamente
        const montoNumeros = document.getElementById('montoNumeros');
        const montoLetras = document.getElementById('montoLetras');
        
        if (montoNumeros && montoLetras) {
            montoNumeros.addEventListener('input', (e) => {
                const valor = parseInt(e.target.value) || 0;
                if (valor > 0) {
                    const valorEnLetras = this.numerosALetras.convertir(valor);
                    montoLetras.value = valorEnLetras;
                } else {
                    montoLetras.value = '';
                }
                this.updatePreview();
            });
        }

        // Configurar fecha por defecto (hoy)
        const fechaSuscripcion = document.getElementById('fechaSuscripcion');
        if (fechaSuscripcion && !fechaSuscripcion.value) {
            const today = new Date();
            fechaSuscripcion.value = today.toISOString().split('T')[0];
        }

        // Listener especial para mostrar/ocultar sección de representantes
        const nombreRep1 = document.getElementById('nombreRep1');
        const nombreRep2 = document.getElementById('nombreRep2');
        
        if (nombreRep1) {
            nombreRep1.addEventListener('input', () => {
                this.toggleRepresentantesSection();
            });
        }
        
        if (nombreRep2) {
            nombreRep2.addEventListener('input', () => {
                this.toggleRepresentantesSection();
            });
        }

        // Listener para observaciones adicionales
        const observacionesAdicionales = document.getElementById('observacionesAdicionales');
        if (observacionesAdicionales) {
            observacionesAdicionales.addEventListener('input', () => {
                this.toggleObservacionesSection();
            });
        }
    }

    setupConditionalFields() {
        console.log('🔀 Configurando campos condicionales...');
        
        // Inicializar visibilidad de secciones opcionales
        this.toggleRepresentantesSection();
        this.toggleObservacionesSection();
        
        console.log('✅ Campos condicionales configurados');
    }

    toggleRepresentantesSection() {
        const nombreRep1 = document.getElementById('nombreRep1').value;
        const nombreRep2 = document.getElementById('nombreRep2').value;
        const cedulaRep1 = document.getElementById('cedulaRep1').value;
        const cedulaRep2 = document.getElementById('cedulaRep2').value;
        
        const representantesSection = document.getElementById('representantesSection');
        
        if (representantesSection) {
            const hasRepresentantesData = nombreRep1 || nombreRep2 || cedulaRep1 || cedulaRep2;
            representantesSection.style.display = hasRepresentantesData ? 'block' : 'none';
        }
    }

    toggleObservacionesSection() {
        const observacionesAdicionales = document.getElementById('observacionesAdicionales').value;
        const observacionesSection = document.getElementById('observacionesSection');
        
        if (observacionesSection) {
            observacionesSection.style.display = observacionesAdicionales ? 'block' : 'none';
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
        
        // Actualizar montos
        this.updateMontosPreview();
        
        // Actualizar datos de firma
        this.updateSignaturePreview();
        
        // Actualizar progreso
        this.updateProgress();
    }

    updateBasicDataPreview() {
        // Datos de la sociedad
        const nombreSociedad = document.getElementById('nombreSociedad').value;
        const rutSociedad = document.getElementById('rutSociedad').value;
        const giroSociedad = document.getElementById('giroSociedad').value;
        const domicilioSociedad = document.getElementById('domicilioSociedad').value;
        const comunaSociedad = document.getElementById('comunaSociedad').value;
        const ciudadSociedad = document.getElementById('ciudadSociedad').value;
        
        // Datos del representante
        const nombreRepresentante = document.getElementById('nombreRepresentante').value;
        const nacionalidadRepresentante = document.getElementById('nacionalidadRepresentante').value;
        const estadoCivilRepresentante = document.getElementById('estadoCivilRepresentante').value;
        const profesionRepresentante = document.getElementById('profesionRepresentante').value;
        const cedulaRepresentante = document.getElementById('cedulaRepresentante').value;
        
        // Datos del suscriptor
        const nombreSuscriptor = document.getElementById('nombreSuscriptor').value;
        const rutSuscriptor = document.getElementById('rutSuscriptor').value;
        const profesionSuscriptor = document.getElementById('profesionSuscriptor').value;
        const domicilioSuscriptor = document.getElementById('domicilioSuscriptor').value;
        
        // Datos de pago
        const comunaPago = document.getElementById('comunaPago').value;
        
        // Representantes legales
        const nombreRep1 = document.getElementById('nombreRep1').value;
        const cedulaRep1 = document.getElementById('cedulaRep1').value;
        const cargoRep1 = document.getElementById('cargoRep1').value;
        const nombreRep2 = document.getElementById('nombreRep2').value;
        const cedulaRep2 = document.getElementById('cedulaRep2').value;
        const cargoRep2 = document.getElementById('cargoRep2').value;
        
        // Observaciones adicionales
        const observacionesAdicionales = document.getElementById('observacionesAdicionales').value;
        
        // Actualizar vista previa
        const previews = [
            { id: 'prev_nombreSociedad', value: nombreSociedad },
            { id: 'prev_rutSociedad', value: rutSociedad },
            { id: 'prev_nombreRepresentante', value: nombreRepresentante },
            { id: 'prev_nacionalidadRepresentante', value: nacionalidadRepresentante },
            { id: 'prev_estadoCivilRepresentante', value: estadoCivilRepresentante },
            { id: 'prev_profesionRepresentante', value: profesionRepresentante },
            { id: 'prev_cedulaRepresentante', value: cedulaRepresentante },
            { id: 'prev_domicilioSociedad', value: domicilioSociedad },
            { id: 'prev_domicilioSociedadPago', value: domicilioSociedad },
            { id: 'prev_comunaSociedad', value: comunaSociedad },
            { id: 'prev_ciudadSociedad', value: ciudadSociedad },
            { id: 'prev_nombreSuscriptor', value: nombreSuscriptor },
            { id: 'prev_rutSuscriptor', value: rutSuscriptor },
            { id: 'prev_domicilioSuscriptor', value: domicilioSuscriptor },
            { id: 'prev_comunaPago', value: comunaPago },
            { id: 'prev_nombreRep1', value: nombreRep1 },
            { id: 'prev_cedulaRep1', value: cedulaRep1 },
            { id: 'prev_cargoRep1', value: cargoRep1 },
            { id: 'prev_nombreRep2', value: nombreRep2 },
            { id: 'prev_cedulaRep2', value: cedulaRep2 },
            { id: 'prev_cargoRep2', value: cargoRep2 },
            { id: 'prev_nombreSociedadFinal', value: nombreSociedad },
            { id: 'prev_observacionesAdicionales', value: observacionesAdicionales }
        ];
        
        previews.forEach(preview => {
            const element = document.getElementById(preview.id);
            if (element) {
                element.textContent = preview.value || '_____________________';
            }
        });
    }

    updateDatesPreview() {
        const fechaSuscripcion = document.getElementById('fechaSuscripcion').value;
        const ciudadSuscripcion = document.getElementById('ciudadSuscripcion').value;
        const diaPago = document.getElementById('diaPago').value;
        const mesPago = document.getElementById('mesPago').value;
        const anoPago = document.getElementById('anoPago').value;
        
        const prevFechaSuscripcion = document.getElementById('prev_fechaSuscripcion');
        const prevCiudadSuscripcion = document.getElementById('prev_ciudadSuscripcion');
        const prevDiaPago = document.getElementById('prev_diaPago');
        const prevMesPago = document.getElementById('prev_mesPago');
        const prevAnoPago = document.getElementById('prev_anoPago');
        
        if (prevFechaSuscripcion) {
            prevFechaSuscripcion.textContent = this.formatDateForPreview(fechaSuscripcion);
        }
        
        if (prevCiudadSuscripcion) {
            prevCiudadSuscripcion.textContent = ciudadSuscripcion || 'Santiago';
        }
        
        if (prevDiaPago) {
            prevDiaPago.textContent = diaPago || '__';
        }
        
        if (prevMesPago) {
            prevMesPago.textContent = mesPago || '_______';
        }
        
        if (prevAnoPago) {
            prevAnoPago.textContent = anoPago || '____';
        }
    }

    updateMontosPreview() {
        const montoNumeros = document.getElementById('montoNumeros').value;
        const montoLetras = document.getElementById('montoLetras').value;
        
        const prevMontoNumeros = document.getElementById('prev_montoNumeros');
        const prevMontoLetras = document.getElementById('prev_montoLetras');
        
        if (prevMontoNumeros) {
            if (montoNumeros) {
                const montoFormateado = new Intl.NumberFormat('es-CL').format(montoNumeros);
                prevMontoNumeros.textContent = montoFormateado;
            } else {
                prevMontoNumeros.textContent = '__.______._____';
            }
        }
        
        if (prevMontoLetras) {
            prevMontoLetras.textContent = montoLetras || 'monto en letras';
        }

        // Actualizar visibilidad de secciones opcionales
        this.toggleRepresentantesSection();
        this.toggleObservacionesSection();
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
        
        // Campos básicos requeridos para pagaré
        const basicFields = CONFIG.PAGARE.validaciones_especificas.campos_requeridos;
        
        totalFields += basicFields.length;
        
        basicFields.forEach(field => {
            const element = document.getElementById(field);
            if (element && element.value && element.value.trim() !== '') {
                filledFields++;
            }
        });
        
        // Checkboxes obligatorios
        const checkboxes = CONFIG.PAGARE.validaciones_especificas.checkboxes_obligatorios;
        totalFields += checkboxes.length;
        
        checkboxes.forEach(field => {
            const element = document.getElementById(field);
            if (element && element.checked) {
                filledFields++;
            }
        });
        
        let bonusScore = 0;
        
        // Bonus por firma digital
        if (systemState.firmasDigitales.suscriptor) bonusScore += 2;
        
        // Bonus por fotos carnet
        if (systemState.fotosCarnet.suscriptor.completed) bonusScore += 1;
        
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
        
        const requiredElements = ['firmaModalOverlay', 'firmaSuscriptor'];
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
        
        const btnFirmaSuscriptor = document.getElementById('firmaSuscriptor');
        
        if (!btnFirmaSuscriptor) {
            throw new Error('Botón de firma no encontrado');
        }
        
        btnFirmaSuscriptor.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('suscriptor');
        });
        
        console.log('✅ Botón de firma configurado correctamente');
    }

    openSignatureModalSafe(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        const nombreSuscriptor = document.getElementById('nombreSuscriptor').value;
        
        if (!nombreSuscriptor || !nombreSuscriptor.trim()) {
            this.showNotification('Complete el nombre del suscriptor antes de firmar', 'warning');
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
        
        const requiredElements = ['photoModalOverlay', 'photoSuscriptor'];
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
        
        const btnPhotoSuscriptor = document.getElementById('photoSuscriptor');
        
        if (!btnPhotoSuscriptor) {
            throw new Error('Botón de foto no encontrado');
        }
        
        btnPhotoSuscriptor.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('suscriptor');
        });
        
        console.log('✅ Botón de foto configurado correctamente');
    }

    openPhotoModalSafe(type) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        const nombreSuscriptor = document.getElementById('nombreSuscriptor').value;
        
        if (!nombreSuscriptor || !nombreSuscriptor.trim()) {
            this.showNotification('Complete el nombre del suscriptor antes de tomar fotos', 'warning');
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
                        systemState.firmasDigitales = data.firmasDigitales || { suscriptor: false };
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
        const fechaSuscripcion = document.getElementById('fechaSuscripcion');
        if (fechaSuscripcion && !fechaSuscripcion.value) {
            const today = new Date();
            fechaSuscripcion.value = today.toISOString().split('T')[0];
        }
        
        // Configurar lugar por defecto
        const ciudadSuscripcion = document.getElementById('ciudadSuscripcion');
        if (ciudadSuscripcion && !ciudadSuscripcion.value) {
            ciudadSuscripcion.value = 'Santiago';
        }
        
        // Configurar ciudad sociedad por defecto
        const ciudadSociedad = document.getElementById('ciudadSociedad');
        if (ciudadSociedad && !ciudadSociedad.value) {
            ciudadSociedad.value = 'Santiago';
        }
        
        // Configurar nacionalidad por defecto
        const nacionalidadRepresentante = document.getElementById('nacionalidadRepresentante');
        if (nacionalidadRepresentante && !nacionalidadRepresentante.value) {
            nacionalidadRepresentante.value = 'Chilena';
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
                
                systemState.firmasDigitales = { suscriptor: false };
                systemState.fotosCarnet = {
                    suscriptor: { 
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
                this.showNotification('PDF de Pagaré generado exitosamente', 'success');
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
        doc.text('PAGARÉ', 105, y, { align: 'center' });
        y += 8;
        
        doc.setFontSize(12);
        doc.text('(EN PESOS)', 105, y, { align: 'center' });
        y += 25;

        // Cuerpo del pagaré
        doc.setFont('times', 'normal');
        doc.setFontSize(11);

        // Obtener datos del formulario
        const nombreSociedad = document.getElementById('nombreSociedad').value || '_____________________';
        const rutSociedad = document.getElementById('rutSociedad').value || '_____________________';
        const nombreRepresentante = document.getElementById('nombreRepresentante').value || '_____________________';
        const nacionalidadRepresentante = document.getElementById('nacionalidadRepresentante').value || '_____________________';
        const estadoCivilRepresentante = document.getElementById('estadoCivilRepresentante').value || '_____________________';
        const profesionRepresentante = document.getElementById('profesionRepresentante').value || '_____________________';
        const cedulaRepresentante = document.getElementById('cedulaRepresentante').value || '_____________________';
        const domicilioSociedad = document.getElementById('domicilioSociedad').value || '_____________________';
        const comunaSociedad = document.getElementById('comunaSociedad').value || '_____________________';
        const ciudadSociedad = document.getElementById('ciudadSociedad').value || 'Santiago';
        
        const montoNumeros = document.getElementById('montoNumeros').value;
        const montoLetras = document.getElementById('montoLetras').value || 'monto en letras';
        const montoFormateado = montoNumeros ? new Intl.NumberFormat('es-CL').format(montoNumeros) : '__.______._____';
        
        const diaPago = document.getElementById('diaPago').value || '__';
        const mesPago = document.getElementById('mesPago').value || '_______';
        const anoPago = document.getElementById('anoPago').value || '____';
        const comunaPago = document.getElementById('comunaPago').value || '_____________________';
        
        // Párrafo principal del pagaré
        const parrafoInicial = `Debo y pagaré a la vista de la Sociedad ${nombreSociedad}, del giro de su denominación, rol único tributario número ${rutSociedad}, representada por don ${nombreRepresentante}, ${nacionalidadRepresentante}, ${estadoCivilRepresentante}, ${profesionRepresentante}, cédula de identidad número ${cedulaRepresentante}, ambos domiciliados en ${domicilioSociedad}, comuna de ${comunaSociedad}, ciudad de ${ciudadSociedad}, la cantidad de $${montoFormateado}.- (${montoLetras}).`;
        
        const linesInicial = doc.splitTextToSize(parrafoInicial, pageWidth - margin);
        doc.text(linesInicial, margin, y);
        y += linesInicial.length * 5 + 10;

        // Párrafo de condiciones de pago
        const parrafoPago = `Las sumas que debo serán pagadas en el domicilio de la sociedad señalada, ubicadas en ${domicilioSociedad}, comuna de ${comunaPago}, ciudad de Santiago, el día ${diaPago} del mes de ${mesPago} del año ${anoPago}`;
        
        const linesPago = doc.splitTextToSize(parrafoPago, pageWidth - margin);
        doc.text(linesPago, margin, y);
        y += linesPago.length * 5 + 15;

        // Cláusulas legales (más pequeñas)
        doc.setFontSize(9);
        
        const clausula1 = 'En caso de mora o simple atraso en el pago de una cualquiera de las cuotas en que se divide el importe de este pagaré, el acreedor tendrá el derecho a hacer exigible el monto total insoluto, como si se tratare de una obligación de plazo vencido, en los términos previstos en el artículo 105 inciso 2º de la Ley Nº 18.092.';
        const linesClausula1 = doc.splitTextToSize(clausula1, pageWidth - margin);
        doc.text(linesClausula1, margin, y);
        y += linesClausula1.length * 4 + 10;

        const clausula2 = 'Asimismo, en el evento de mora o simple atraso en el pago de una cualquiera de las cuotas en que se divide el importe de este pagaré, se devengará un interés penal moratorio equivalente al máximo convencional para operaciones no reajustables en moneda nacional, el que se calculará entre el día de mora o simple atraso y hasta el día de pago efectivo, sobre la cuota de que se trate o sobre la totalidad del importe, en su caso.';
        const linesClausula2 = doc.splitTextToSize(clausula2, pageWidth - margin);
        doc.text(linesClausula2, margin, y);
        y += linesClausula2.length * 4 + 10;

        // Observaciones adicionales si existen
        const observacionesAdicionales = document.getElementById('observacionesAdicionales').value;
        if (observacionesAdicionales) {
            const obsText = `Observaciones adicionales: ${observacionesAdicionales}`;
            const linesObs = doc.splitTextToSize(obsText, pageWidth - margin);
            doc.text(linesObs, margin, y);
            y += linesObs.length * 4 + 10;
        }

        const clausula3 = 'El presente Pagaré se suscribe con cláusula "sin protesto". La obligación de este pagaré es indivisible. Los impuestos, derechos notariales y cualquier otro gasto serán de exclusivo cargo del suscriptor.';
        const linesClausula3 = doc.splitTextToSize(clausula3, pageWidth - margin);
        doc.text(linesClausula3, margin, y);
        y += linesClausula3.length * 4 + 20;

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

        const nombreSuscriptor = document.getElementById('nombreSuscriptor').value || '_____________________';
        const rutSuscriptor = document.getElementById('rutSuscriptor').value || '______________';
        const domicilioSuscriptor = document.getElementById('domicilioSuscriptor').value || '_____________________';
        const nombreRep1 = document.getElementById('nombreRep1').value;
        const cedulaRep1 = document.getElementById('cedulaRep1').value;
        const nombreRep2 = document.getElementById('nombreRep2').value;
        const cedulaRep2 = document.getElementById('cedulaRep2').value;
        const nombreSociedad = document.getElementById('nombreSociedad').value || '_____________________';
        
        const centerX = 105;
        const lineWidth = 60;
        
        // Línea de firma del suscriptor
        doc.line(centerX - lineWidth/2, y, centerX + lineWidth/2, y);
        y += 8;
        
        // Datos del suscriptor
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.text('SUSCRIPTOR', centerX, y, { align: 'center' });
        y += 6;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text(nombreSuscriptor, centerX, y, { align: 'center' });
        y += 5;
        doc.text(`RUT N° ${rutSuscriptor}`, centerX, y, { align: 'center' });
        y += 5;
        doc.text(`DOMICILIO: ${domicilioSuscriptor}`, centerX, y, { align: 'center' });
        y += 25;
        
        // Representantes legales si existen
        if (nombreRep1 || nombreRep2) {
            const rep1X = 70;
            const rep2X = 140;
            
            // Líneas de firma
            if (nombreRep1) {
                doc.line(rep1X - 25, y, rep1X + 25, y);
            }
            if (nombreRep2) {
                doc.line(rep2X - 25, y, rep2X + 25, y);
            }
            y += 8;
            
            doc.setFont('times', 'normal');
            doc.setFontSize(9);
            
            if (nombreRep1) {
                doc.text(nombreRep1, rep1X, y, { align: 'center' });
                doc.text(`CI N° ${cedulaRep1}`, rep1X, y + 4, { align: 'center' });
            }
            
            if (nombreRep2) {
                doc.text(nombreRep2, rep2X, y, { align: 'center' });
                doc.text(`CI N° ${cedulaRep2}`, rep2X, y + 4, { align: 'center' });
            }
            
            y += 20;
            
            // Recuadro para la sociedad
            doc.setLineWidth(0.5);
            doc.rect(centerX - 40, y, 80, 25);
            
            doc.setFont('times', 'bold');
            doc.setFontSize(12);
            doc.text(`pp. ${nombreSociedad}`, centerX, y + 12, { align: 'center' });
            doc.text('SUSCRIPTORA', centerX, y + 20, { align: 'center' });
            
            y += 35;
        }
        
        // Fecha de suscripción
        const ciudadSuscripcion = document.getElementById('ciudadSuscripcion').value || 'Santiago';
        const fechaSuscripcion = document.getElementById('fechaSuscripcion').value;
        const fechaFormateada = this.formatDateForPreview(fechaSuscripcion);
        
        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        doc.text(`${ciudadSuscripcion}, ${fechaFormateada}`, centerX, y + 15, { align: 'center' });
        
        // Agregar firma digital si existe
        if (window.firmaProcessor) {
            try {
                const firmaSuscriptor = window.firmaProcessor.getSignatureForPDF('suscriptor');
                
                if (firmaSuscriptor) {
                    doc.addImage(firmaSuscriptor, 'PNG', centerX - 30, y - 50, 60, 25);
                    console.log('✅ Firma del suscriptor agregada al PDF');
                    
                    doc.setFont('times', 'italic');
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text('Documento con firma digital aplicada', centerX, y + 25, { align: 'center' });
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
        const nombreSuscriptor = document.getElementById('nombreSuscriptor').value;
        let nombreArchivo = 'Pagare_';
        
        if (nombreSuscriptor) {
            nombreArchivo += nombreSuscriptor.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
        }
        
        const timestamp = new Date().toISOString().slice(0, 10);
        return `${nombreArchivo}_${timestamp}.pdf`;
    }

    validateFormWithSignature() {
        const emptyFields = [];
        
        // Campos básicos requeridos
        const basicRequiredFields = CONFIG.PAGARE.validaciones_especificas.campos_requeridos;
        
        basicRequiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element || !element.value.trim()) {
                emptyFields.push(field);
            }
        });
        
        // Validar checkboxes obligatorios
        const checkboxes = CONFIG.PAGARE.validaciones_especificas.checkboxes_obligatorios;
        
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
        const rutsToValidate = ['rutSociedad', 'cedulaRepresentante', 'rutSuscriptor'];
        
        // Agregar RUTs de representantes si están presentes
        const nombreRep1 = document.getElementById('nombreRep1').value;
        const cedulaRep1 = document.getElementById('cedulaRep1').value;
        const nombreRep2 = document.getElementById('nombreRep2').value;
        const cedulaRep2 = document.getElementById('cedulaRep2').value;
        
        if (nombreRep1 || cedulaRep1) {
            rutsToValidate.push('cedulaRep1');
        }
        if (nombreRep2 || cedulaRep2) {
            rutsToValidate.push('cedulaRep2');
        }
        
        rutsToValidate.forEach(rutField => {
            const element = document.getElementById(rutField);
            if (element && element.value && !ConfigUtils.validateRUT(element.value)) {
                issues.push(`${rutField.replace('rut', 'RUT ').replace('cedula', 'Cédula ')} inválido`);
            }
        });
        
        if (!systemState.firmasDigitales.suscriptor) {
            issues.push('Falta firma digital del suscriptor');
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

// ===== CLASE PARA CONVERTIR NÚMEROS A LETRAS =====
class NumerosALetras {
    constructor() {
        this.unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
        this.decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
        this.especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
        this.centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
    }

    convertir(numero) {
        if (numero === 0) return 'cero pesos';
        if (numero === 1) return 'un peso';
        
        let resultado = this.convertirGrupo(numero);
        return resultado + ' pesos';
    }

    convertirGrupo(numero) {
        if (numero === 0) return '';
        if (numero < 10) return this.unidades[numero];
        if (numero < 20) return this.especiales[numero - 10];
        if (numero < 100) return this.convertirDecenas(numero);
        if (numero < 1000) return this.convertirCentenas(numero);
        if (numero < 1000000) return this.convertirMiles(numero);
        if (numero < 1000000000) return this.convertirMillones(numero);
        
        return 'número muy grande';
    }

    convertirDecenas(numero) {
        const dec = Math.floor(numero / 10);
        const uni = numero % 10;
        
        if (dec === 2 && uni > 0) {
            return 'veinti' + this.unidades[uni];
        }
        
        return this.decenas[dec] + (uni > 0 ? ' y ' + this.unidades[uni] : '');
    }

    convertirCentenas(numero) {
        const cen = Math.floor(numero / 100);
        const resto = numero % 100;
        
        let resultado = '';
        
        if (cen === 1 && resto === 0) {
            resultado = 'cien';
        } else {
            resultado = this.centenas[cen];
            if (resto > 0) {
                resultado += ' ' + this.convertirGrupo(resto);
            }
        }
        
        return resultado;
    }

    convertirMiles(numero) {
        const miles = Math.floor(numero / 1000);
        const resto = numero % 1000;
        
        let resultado = '';
        
        if (miles === 1) {
            resultado = 'mil';
        } else {
            resultado = this.convertirGrupo(miles) + ' mil';
        }
        
        if (resto > 0) {
            resultado += ' ' + this.convertirGrupo(resto);
        }
        
        return resultado;
    }

    convertirMillones(numero) {
        const millones = Math.floor(numero / 1000000);
        const resto = numero % 1000000;
        
        let resultado = '';
        
        if (millones === 1) {
            resultado = 'un millón';
        } else {
            resultado = this.convertirGrupo(millones) + ' millones';
        }
        
        if (resto > 0) {
            resultado += ' ' + this.convertirGrupo(resto);
        }
        
        return resultado;
    }
}

// ===== PROCESADORES DE FIRMAS Y FOTOS (REUTILIZADOS) =====
class FirmaDigitalProcessor {
    constructor() {
        this.processedImageData = null;
        this.currentType = null;
        this.firmasDigitales = {
            suscriptor: null
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
            
            if (window.pagareSystem) {
                window.pagareSystem.updateProgress();
            }
            
            this.closeModal();
            
            if (window.pagareSystem) {
                window.pagareSystem.showNotification(`Firma digital del ${this.currentType} aplicada correctamente`, 'success');
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
        this.firmasDigitales.suscriptor = null;
        
        systemState.firmasDigitales = { suscriptor: false };
        
        const button = document.getElementById('firmaSuscriptor');
        if (button) {
            button.classList.remove('signed');
            const textElement = button.querySelector('.signature-text');
            if (textElement) {
                textElement.textContent = 'FIRMA DIGITAL';
            }
        }
        
        const placeholder = document.getElementById('signaturePlaceholderSuscriptor');
        const preview = document.getElementById('signaturePreviewSuscriptor');
        
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
        
        if (window.pagareSystem) {
            window.pagareSystem.showNotification(errorMessage, 'error');
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
            
            if (window.pagareSystem) {
                window.pagareSystem.showNotification(`Foto del ${this.currentStep} capturada`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            if (window.pagareSystem) {
                window.pagareSystem.showNotification('Error al capturar la foto', 'error');
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
            if (window.pagareSystem) {
                window.pagareSystem.showNotification('Ahora capture el reverso del carnet', 'info');
            }
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            this.currentStep = 'completed';
            this.showSummary();
            if (window.pagareSystem) {
                window.pagareSystem.showNotification('Ambas fotos capturadas', 'success');
            }
        }
    }

    restartProcess() {
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        if (window.pagareSystem) {
            window.pagareSystem.showNotification('Proceso reiniciado', 'info');
        }
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            if (window.pagareSystem) {
                window.pagareSystem.showNotification('Faltan fotos por capturar', 'error');
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
            
            if (window.pagareSystem) {
                window.pagareSystem.updateProgress();
            }

            this.closeModal();
            
            if (window.pagareSystem) {
                window.pagareSystem.showNotification(`Carnet completo del ${this.currentType} guardado`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al confirmar fotos:', error);
            if (window.pagareSystem) {
                window.pagareSystem.showNotification('Error al procesar las fotos', 'error');
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
        systemState.fotosCarnet.suscriptor = {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        };
        this.updateButton('suscriptor', false);
    }
}

// ===== FUNCIONES GLOBALES =====
window.clearForm = function() {
    if (window.pagareSystem) {
        window.pagareSystem.clearForm();
    }
};

window.generatePDF = function() {
    if (window.pagareSystem) {
        window.pagareSystem.generatePDF();
    }
};

// ===== INICIALIZACIÓN DEL SISTEMA =====
let pagareSystem;

function initializePagareSystem() {
    console.log('📋 Iniciando Sistema de Pagaré Firma Presencial...');
    
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined') {
        console.warn('⚠️ jsPDF no está disponible, esperando...');
        setTimeout(initializePagareSystem, 1000);
        return;
    }
    
    // Verificar que CONFIG esté disponible
    if (typeof CONFIG === 'undefined') {
        console.warn('⚠️ CONFIG no está disponible, esperando...');
        setTimeout(initializePagareSystem, 1000);
        return;
    }
    
    try {
        pagareSystem = new PagareSystem();
        window.pagareSystem = pagareSystem;
        
        console.log('✅ Sistema completamente inicializado');
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        setTimeout(initializePagareSystem, 2000);
    }
}

// ===== MÚLTIPLES PUNTOS DE INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePagareSystem);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initializePagareSystem, 500);
}

window.addEventListener('load', () => {
    if (!window.pagareSystem) {
        console.log('🔄 Inicialización de respaldo activada');
        setTimeout(initializePagareSystem, 1000);
    }
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', (event) => {
    console.error('❌ Error global capturado:', event.error);
    
    if (window.pagareSystem) {
        window.pagareSystem.showNotification(
            'Se detectó un error. El sistema intentará recuperarse automáticamente.', 
            'warning'
        );
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
    
    if (window.pagareSystem) {
        window.pagareSystem.showNotification(
            'Error de conectividad detectado. Algunos componentes pueden funcionar de forma limitada.', 
            'warning'
        );
    }
});

// ===== LOG FINAL =====
console.log('📜 Sistema de Pagaré Firma Presencial - Script principal cargado correctamente');