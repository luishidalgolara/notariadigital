// ========================================
// 📋 SISTEMA PRINCIPAL DE COMPRAVENTA DE VEHÍCULO
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'ciudadContrato', 'fechaContrato', 'notarioPublico', 'numeroNotaria', 'ciudadNotaria',
        'nombreVendedor', 'rutVendedor', 'telefonoVendedor', 'domicilioVendedor', 'numeroVendedor', 'comunaVendedor', 'ciudadVendedor', 'regionVendedor',
        'nombreComprador', 'rutComprador', 'telefonoComprador', 'domicilioComprador', 'numeroComprador', 'comunaComprador', 'ciudadComprador', 'regionComprador',
        'tipoVehiculo', 'marcaVehiculo', 'anioVehiculo', 'modeloVehiculo', 'numeroMotor', 'numeroChasis', 'kilometraje', 'numeroPuertas', 'colorVehiculo', 'patenteVehiculo', 'fechaInscripcion', 'estadoVehiculo',
        'precioVenta', 'formaPago', 'precioEnPalabras', 'declaracionDeudas', 'detalleDeudaTexto',
        'domicilioLegalComuna', 'domicilioLegalCiudad', 'renunciaSaneamiento', 'responsabilidadMultas', 'gastosContrato', 'observacionesAdicionales'
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
class CompravenatVehiculoSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Compraventa de Vehículo...');
        
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

        // Formateo de precio
        const precioVenta = document.getElementById('precioVenta');
        if (precioVenta) {
            precioVenta.addEventListener('input', (e) => {
                this.handlePriceInput(e);
            });
        }

        // Formateo de patente
        const patenteVehiculo = document.getElementById('patenteVehiculo');
        if (patenteVehiculo) {
            patenteVehiculo.addEventListener('input', (e) => {
                this.handlePatenteInput(e);
            });
        }

        // Validación de año
        const anioVehiculo = document.getElementById('anioVehiculo');
        if (anioVehiculo) {
            anioVehiculo.addEventListener('input', (e) => {
                this.handleYearInput(e);
            });
        }

        // Validación de kilometraje
        const kilometraje = document.getElementById('kilometraje');
        if (kilometraje) {
            kilometraje.addEventListener('input', (e) => {
                this.handleKilometrajeInput(e);
            });
        }

        // Auto-llenar fecha actual
        const fechaContrato = document.getElementById('fechaContrato');
        if (fechaContrato && !fechaContrato.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaContrato.value = today;
        }

        // Listener para mostrar/ocultar detalle de deudas
        const declaracionDeudas = document.getElementById('declaracionDeudas');
        if (declaracionDeudas) {
            declaracionDeudas.addEventListener('change', (e) => {
                this.toggleDetalleDeudas(e.target.value === 'con_deudas');
                this.updatePreview();
            });
        }

        // Configurar valores por defecto
        this.setupDefaultValues();
    }

    setupDefaultValues() {
        // Valor por defecto para región
        const regionVendedor = document.getElementById('regionVendedor');
        if (regionVendedor && !regionVendedor.value) {
            regionVendedor.value = 'Metropolitana';
        }

        const regionComprador = document.getElementById('regionComprador');
        if (regionComprador && !regionComprador.value) {
            regionComprador.value = 'Metropolitana';
        }

        // Valor por defecto para número de notaría
        const numeroNotaria = document.getElementById('numeroNotaria');
        if (numeroNotaria && !numeroNotaria.value) {
            numeroNotaria.value = 'Primera';
        }

        // Valor por defecto para ciudad de notaría
        const ciudadNotaria = document.getElementById('ciudadNotaria');
        if (ciudadNotaria && !ciudadNotaria.value) {
            ciudadNotaria.value = 'Santiago';
        }
    }

    toggleDetalleDeudas(show) {
        const section = document.getElementById('detalleDeudas');
        if (section) {
            section.style.display = show ? 'block' : 'none';
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

    handlePriceInput(event) {
        const formatted = ConfigUtils.formatPrecio(event.target.value);
        event.target.value = formatted;
        
        const isValid = ConfigUtils.validatePrecio(formatted);
        event.target.classList.toggle('precio-valid', isValid);
        event.target.classList.toggle('precio-invalid', !isValid);
        
        // Mostrar advertencia si el precio es muy alto
        const cleanPrice = formatted.replace(/[^\d]/g, '');
        const numericPrice = parseInt(cleanPrice);
        if (numericPrice > CONFIG.COMPRAVENTA_VEHICULO.precios_referencia.lujo) {
            this.showNotification('El precio parece muy elevado, verifique la cantidad', 'warning');
        }
        
        this.updatePreview();
    }

    handlePatenteInput(event) {
        const formatted = ConfigUtils.formatPatente(event.target.value);
        event.target.value = formatted;
        
        const isValid = ConfigUtils.validatePatente(formatted);
        event.target.classList.toggle('patente-valid', isValid);
        event.target.classList.toggle('patente-invalid', !isValid);
        
        this.updatePreview();
    }

    handleYearInput(event) {
        const year = event.target.value;
        const isValid = ConfigUtils.validateYear(year);
        event.target.classList.toggle('year-valid', isValid);
        event.target.classList.toggle('year-invalid', !isValid);
        
        if (year && parseInt(year) < 2000) {
            this.showNotification('El vehículo es muy antiguo', 'warning');
        }
        
        this.updatePreview();
    }

    handleKilometrajeInput(event) {
        const km = event.target.value;
        const isValid = ConfigUtils.validateKilometraje(km);
        event.target.classList.toggle('km-valid', isValid);
        event.target.classList.toggle('km-invalid', !isValid);
        
        // Advertir sobre kilometraje alto
        const numKm = parseInt(km);
        if (numKm > CONFIG.COMPRAVENTA_VEHICULO.kilometraje_referencia.muy_alto) {
            this.showNotification('El kilometraje es muy alto para el año del vehículo', 'warning');
        }
        
        this.updatePreview();
    }

    updatePreview() {
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            const preview = document.getElementById('prev_' + field);
            if (element && preview) {
                let value = element.type === 'checkbox' ? element.checked : element.value || '';
                preview.textContent = value || this.getPlaceholderText(field);
            }
        });

        this.updateDuplicateReferences();
        this.updateDatePreview();
        this.updateSignatureNames();
        this.updateConditionalSections();
        this.updateFormattedTexts();
        this.updateProgress();
    }

    updateDuplicateReferences() {
        // Referencias duplicadas en el documento
        const nombreVendedor = document.getElementById('nombreVendedor').value;
        const rutVendedor = document.getElementById('rutVendedor').value;
        const nombreComprador = document.getElementById('nombreComprador').value;
        const rutComprador = document.getElementById('rutComprador').value;

        // Actualizar nombres y RUTs en firmas
        const nombreVendedorFirma = document.getElementById('prev_nombreVendedorFirma');
        const rutVendedorFirma = document.getElementById('prev_rutVendedorFirma');
        const nombreCompradorFirma = document.getElementById('prev_nombreCompradorFirma');
        const rutCompradorFirma = document.getElementById('prev_rutCompradorFirma');
        
        if (nombreVendedorFirma) nombreVendedorFirma.textContent = nombreVendedor || '________________';
        if (rutVendedorFirma) rutVendedorFirma.textContent = rutVendedor || '________________';
        if (nombreCompradorFirma) nombreCompradorFirma.textContent = nombreComprador || '________________';
        if (rutCompradorFirma) rutCompradorFirma.textContent = rutComprador || '________________';
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
            if (prev_anio) prev_anio.textContent = '2024';
        }
    }

    updateSignatureNames() {
        const nombreVendedor = document.getElementById('nombreVendedor').value;
        const nombreComprador = document.getElementById('nombreComprador').value;
        
        const firmaVendedor = document.getElementById('prev_nombreVendedor');
        const firmaComprador = document.getElementById('prev_nombreComprador');
        
        if (firmaVendedor) {
            firmaVendedor.textContent = nombreVendedor || '________________';
        }
        
        if (firmaComprador) {
            firmaComprador.textContent = nombreComprador || '________________';
        }
    }

    updateConditionalSections() {
        // Sección de detalle de deudas
        const declaracionDeudas = document.getElementById('declaracionDeudas').value;
        const detalleDeudaSection = document.getElementById('detalleDeudaSection');
        if (detalleDeudaSection) {
            detalleDeudaSection.style.display = declaracionDeudas === 'con_deudas' ? 'block' : 'none';
        }

        // Sección de observaciones adicionales
        const observacionesAdicionales = document.getElementById('observacionesAdicionales').value;
        const observacionesSection = document.getElementById('observacionesSection');
        if (observacionesSection) {
            observacionesSection.style.display = observacionesAdicionales && observacionesAdicionales.trim() ? 'block' : 'none';
        }
    }

    updateFormattedTexts() {
        // Actualizar texto de declaración de deudas
        const declaracionDeudas = document.getElementById('declaracionDeudas').value;
        const prevDeclaracionDeudas = document.getElementById('prev_declaracionDeudas');
        if (prevDeclaracionDeudas) {
            if (declaracionDeudas === 'con_deudas') {
                prevDeclaracionDeudas.textContent = 'tiene deudas pendientes según se detalla';
            } else {
                prevDeclaracionDeudas.textContent = 'no tiene deudas ni gravámenes de ninguna especie';
            }
        }

        // Actualizar texto de renuncia a saneamiento
        const renunciaSaneamiento = document.getElementById('renunciaSaneamiento').value;
        const prevRenunciaSaneamiento = document.getElementById('prev_renunciaSaneamiento');
        if (prevRenunciaSaneamiento) {
            if (renunciaSaneamiento === 'si') {
                prevRenunciaSaneamiento.textContent = 'renuncia expresamente a las acciones de saneamiento por evicción y por vicios redhibitorios, establecidos en los párrafos siete y ocho del Título XXIII del Libro IV del Código Civil';
            } else {
                prevRenunciaSaneamiento.textContent = 'se reserva sus derechos respecto a las acciones de saneamiento';
            }
        }

        // Actualizar texto de responsabilidad por multas
        const responsabilidadMultas = document.getElementById('responsabilidadMultas').value;
        const prevResponsabilidadMultas = document.getElementById('prev_responsabilidadMultas');
        if (prevResponsabilidadMultas) {
            switch (responsabilidadMultas) {
                case 'vendedor':
                    prevResponsabilidadMultas.textContent = 'el vendedor declara que exime de responsabilidad al comprador de dicha multa y que responderá de ella';
                    break;
                case 'comprador':
                    prevResponsabilidadMultas.textContent = 'el comprador acepta asumir las multas anteriores al contrato';
                    break;
                case 'sin_multas':
                    prevResponsabilidadMultas.textContent = 'ambas partes declaran que no existen multas pendientes';
                    break;
            }
        }

        // Actualizar texto de gastos del contrato
        const gastosContrato = document.getElementById('gastosContrato').value;
        const prevGastosContrato = document.getElementById('prev_gastosContrato');
        if (prevGastosContrato) {
            switch (gastosContrato) {
                case 'comprador':
                    prevGastosContrato.textContent = 'de cargo exclusivo del comprador';
                    break;
                case 'vendedor':
                    prevGastosContrato.textContent = 'de cargo exclusivo del vendedor';
                    break;
                case 'compartidos':
                    prevGastosContrato.textContent = 'compartidos entre ambas partes';
                    break;
            }
        }
    }

    getPlaceholderText(field) {
        const placeholders = {
            'ciudadContrato': 'Santiago',
            'notarioPublico': '________________',
            'numeroNotaria': 'Primera',
            'ciudadNotaria': '________________',
            'nombreVendedor': '________________',
            'rutVendedor': 'XX.XXX.XXX-X',
            'telefonoVendedor': '___________',
            'domicilioVendedor': '________________',
            'numeroVendedor': '____',
            'comunaVendedor': '________________',
            'ciudadVendedor': '________________',
            'regionVendedor': 'Metropolitana',
            'nombreComprador': '________________',
            'rutComprador': 'XX.XXX.XXX-X',
            'telefonoComprador': '___________',
            'domicilioComprador': '________________',
            'numeroComprador': '____',
            'comunaComprador': '________________',
            'ciudadComprador': '________________',
            'regionComprador': 'Metropolitana',
            'tipoVehiculo': 'automóvil',
            'marcaVehiculo': '________________',
            'anioVehiculo': '____',
            'modeloVehiculo': '________________',
            'numeroMotor': '________________',
            'numeroChasis': '________________',
            'kilometraje': '________',
            'numeroPuertas': '4',
            'colorVehiculo': '________________',
            'patenteVehiculo': '________________',
            'fechaInscripcion': '________________',
            'estadoVehiculo': 'buen',
            'precioVenta': '$________________',
            'formaPago': 'al contado en este acto',
            'precioEnPalabras': '________________',
            'declaracionDeudas': 'no tiene deudas ni gravámenes de ninguna especie',
            'detalleDeudaTexto': '________________',
            'domicilioLegalComuna': '________________',
            'domicilioLegalCiudad': '________________',
            'renunciaSaneamiento': 'renuncia expresamente a las acciones de saneamiento',
            'responsabilidadMultas': 'el vendedor responde por multas anteriores',
            'gastosContrato': 'de cargo exclusivo del comprador',
            'observacionesAdicionales': '________________'
        };
        
        return placeholders[field] || '________';
    }

    updateProgress() {
        const totalFields = systemState.formFields.length;
        let filledFields = 0;
        
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                if (element.type === 'checkbox') {
                    if (element.checked) filledFields++;
                } else if (element.value && element.value.trim() !== '') {
                    filledFields++;
                }
            }
        });
        
        let bonusScore = 0;
        
        // Bonus por firmas digitales
        if (systemState.firmasDigitales.vendedor) bonusScore += 1;
        if (systemState.firmasDigitales.comprador) bonusScore += 1;
        
        // Bonus por fotos carnet
        if (systemState.fotosCarnet.vendedor.completed) bonusScore += 0.5;
        if (systemState.fotosCarnet.comprador.completed) bonusScore += 0.5;
        
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
        
        // Para vendedor, verificar nombre
        if (type === 'vendedor') {
            let nombreField = document.getElementById('nombreVendedor');
            if (!nombreField || !nombreField.value.trim()) {
                this.showNotification('Complete el nombre del vendedor antes de firmar', 'warning');
                return;
            }
        }
        
        // Para comprador, verificar nombre
        if (type === 'comprador') {
            let nombreField = document.getElementById('nombreComprador');
            if (!nombreField || !nombreField.value.trim()) {
                this.showNotification('Complete el nombre del comprador antes de firmar', 'warning');
                return;
            }
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
        
        // Para vendedor, verificar nombre
        if (type === 'vendedor') {
            let nombreField = document.getElementById('nombreVendedor');
            if (!nombreField || !nombreField.value.trim()) {
                this.showNotification('Complete el nombre del vendedor antes de tomar fotos', 'warning');
                return;
            }
        }
        
        // Para comprador, verificar nombre
        if (type === 'comprador') {
            let nombreField = document.getElementById('nombreComprador');
            if (!nombreField || !nombreField.value.trim()) {
                this.showNotification('Complete el nombre del comprador antes de tomar fotos', 'warning');
                return;
            }
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
                data[field] = element.type === 'checkbox' ? element.checked : element.value;
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
            'Esta acción también removerá las firmas digitales y documentos.',
            () => {
                systemState.formFields.forEach(field => {
                    const element = document.getElementById(field);
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = false;
                        } else {
                            element.value = '';
                        }
                        element.classList.remove('rut-valid', 'rut-invalid', 'precio-valid', 'precio-invalid', 
                                                'patente-valid', 'patente-invalid', 'year-valid', 'year-invalid',
                                                'km-valid', 'km-invalid');
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
                this.showNotification('PDF del Contrato de Compraventa generado exitosamente', 'success');
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
        doc.text('CONTRATO DE COMPRAVENTA DE VEHÍCULO USADO', 105, y, { align: 'center' });
        y += 25;

        // Encabezado del contrato
        const ciudadContrato = document.getElementById('ciudadContrato').value || 'Santiago';
        const fechaContrato = document.getElementById('fechaContrato').value;
        const notarioPublico = document.getElementById('notarioPublico').value || '________________';
        const numeroNotaria = document.getElementById('numeroNotaria').value || 'Primera';
        const ciudadNotaria = document.getElementById('ciudadNotaria').value || '________________';
        
        let fechaTexto = '__ de ________ del 2024';
        if (fechaContrato && ConfigUtils.validateDate(fechaContrato)) {
            const date = new Date(fechaContrato);
            fechaTexto = `${date.getDate()} de ${this.mesesEspanol[date.getMonth()]} del ${date.getFullYear()}`;
        }

        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        
        const encabezado = `En ${ciudadContrato} a ${fechaTexto}, ante mí, ${notarioPublico} notario público titular de la ${numeroNotaria} Notaría de ${ciudadNotaria}, comparecen:`;
        doc.text(encabezado, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, encabezado, pageWidth - 2 * margin) + 15;

        // Datos del vendedor
        doc.setFont('times', 'bold');
        doc.text('EL VENDEDOR:', margin, y);
        y += 10;
        
        const nombreVendedor = document.getElementById('nombreVendedor').value || '________________';
        const rutVendedor = document.getElementById('rutVendedor').value || '________________';
        const domicilioVendedor = document.getElementById('domicilioVendedor').value || '________________';
        const numeroVendedor = document.getElementById('numeroVendedor').value || '____';
        const comunaVendedor = document.getElementById('comunaVendedor').value || '________________';
        const ciudadVendedor = document.getElementById('ciudadVendedor').value || '________________';

        doc.setFont('times', 'normal');
        const datosVendedor = `Don(ña) ${nombreVendedor}, cédula nacional de identidad número ${rutVendedor}, domiciliado(a) en ${domicilioVendedor} número ${numeroVendedor}, de la comuna de ${comunaVendedor} de la ciudad de ${ciudadVendedor}, República de Chile, en adelante "EL VENDEDOR".`;
        doc.text(datosVendedor, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, datosVendedor, pageWidth - 2 * margin) + 15;

        // Datos del comprador
        doc.setFont('times', 'bold');
        doc.text('EL COMPRADOR:', margin, y);
        y += 10;
        
        const nombreComprador = document.getElementById('nombreComprador').value || '________________';
        const rutComprador = document.getElementById('rutComprador').value || '________________';
        const domicilioComprador = document.getElementById('domicilioComprador').value || '________________';
        const numeroComprador = document.getElementById('numeroComprador').value || '____';
        const comunaComprador = document.getElementById('comunaComprador').value || '________________';
        const ciudadComprador = document.getElementById('ciudadComprador').value || '________________';

        doc.setFont('times', 'normal');
        const datosComprador = `Don(ña) ${nombreComprador}, cédula nacional de identidad número ${rutComprador}, domiciliado(a) en ${domicilioComprador} número ${numeroComprador}, de la comuna de ${comunaComprador}, de la ciudad de ${ciudadComprador}, República de Chile, en adelante "EL COMPRADOR".`;
        doc.text(datosComprador, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, datosComprador, pageWidth - 2 * margin) + 20;

        // Verificar nueva página
        if (y > 200) {
            doc.addPage();
            y = 30;
        }

        doc.text('Quienes manifiestan haber convenido el siguiente contrato de compraventa:', margin, y, {maxWidth: pageWidth - 2 * margin});
        y += 20;

        // PRIMERO - Descripción del vehículo
        doc.setFont('times', 'bold');
        doc.text('PRIMERO:', margin, y);
        y += 8;

        const tipoVehiculo = document.getElementById('tipoVehiculo').value || 'automóvil';
        const marcaVehiculo = document.getElementById('marcaVehiculo').value || '________________';
        const anioVehiculo = document.getElementById('anioVehiculo').value || '____';
        const modeloVehiculo = document.getElementById('modeloVehiculo').value || '________________';
        const numeroMotor = document.getElementById('numeroMotor').value || '________________';
        const numeroChasis = document.getElementById('numeroChasis').value || '________________';
        const kilometraje = document.getElementById('kilometraje').value || '________';
        const numeroPuertas = document.getElementById('numeroPuertas').value || '4';
        const colorVehiculo = document.getElementById('colorVehiculo').value || '________________';
        const patenteVehiculo = document.getElementById('patenteVehiculo').value || '________________';
        const fechaInscripcion = document.getElementById('fechaInscripcion').value || '________________';
        const estadoVehiculo = ConfigUtils.getEstadoVehiculoText(document.getElementById('estadoVehiculo').value);

        doc.setFont('times', 'normal');
        const clausulaPrimero = `El vendedor vende y transfiere, al comprador, quien compra y adquiere para sí, el ${tipoVehiculo} usado de marca ${marcaVehiculo}, del año ${anioVehiculo}, modelo ${modeloVehiculo}, número de motor ${numeroMotor}, número de chasis ${numeroChasis}, kilometraje ${kilometraje} km, de ${numeroPuertas} puertas, color ${colorVehiculo}, inscrito en el Registro de Vehículos Motorizados del Registro Civil con el número de patente ${patenteVehiculo}, de fecha ${fechaInscripcion}, vehículo que se encuentra en ${estadoVehiculo}, que es conocido del comprador, sin derecho a ningún reclamo posterior.`;
        doc.text(clausulaPrimero, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausulaPrimero, pageWidth - 2 * margin) + 15;

        // SEGUNDO - Precio
        doc.setFont('times', 'bold');
        doc.text('SEGUNDO:', margin, y);
        y += 8;

        const precioVenta = document.getElementById('precioVenta').value || '$________________';
        const precioEnPalabras = document.getElementById('precioEnPalabras').value || '________________';
        const formaPago = ConfigUtils.getFormaPagoText(document.getElementById('formaPago').value);

        doc.setFont('times', 'normal');
        const clausulaSegundo = `El precio de venta por el vehículo es la cantidad de ${precioVenta} (${precioEnPalabras}) que el comprador paga al vendedor ${formaPago} y que el vendedor declara recibir a su entera satisfacción.`;
        doc.text(clausulaSegundo, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausulaSegundo, pageWidth - 2 * margin) + 15;

        // TERCERO - Deudas y gravámenes
        doc.setFont('times', 'bold');
        doc.text('TERCERO:', margin, y);
        y += 8;

        const declaracionDeudas = document.getElementById('declaracionDeudas').value;
        const detalleDeudas = document.getElementById('detalleDeudaTexto').value || '';
        
        let textoDeudas = 'no tiene deudas ni gravámenes de ninguna especie';
        if (declaracionDeudas === 'con_deudas') {
            textoDeudas = `tiene las siguientes deudas: ${detalleDeudas}`;
        }

        doc.setFont('times', 'normal');
        const clausulaTercero = `El vendedor declara que el vehículo en referencia ${textoDeudas}, declaración que ha sido motivo determinante de esta operación. El comprador declara por su parte que este hecho es causa determinante de esta compraventa y que ha estudiado debidamente los títulos del vehículo que compra.`;
        doc.text(clausulaTercero, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausulaTercero, pageWidth - 2 * margin) + 15;

        // Verificar nueva página
        if (y > 200) {
            doc.addPage();
            y = 30;
        }

        // CUARTO - Recepción y saneamiento
        doc.setFont('times', 'bold');
        doc.text('CUARTO:', margin, y);
        y += 8;

        const renunciaSaneamiento = document.getElementById('renunciaSaneamiento').value;
        let textoSaneamiento = 'renuncia expresamente a las acciones de saneamiento por evicción y por vicios redhibitorios, establecidos en los párrafos siete y ocho del Título XXIII del Libro IV del Código Civil';
        if (renunciaSaneamiento === 'no') {
            textoSaneamiento = 'se reserva sus derechos respecto a las acciones de saneamiento';
        }

        doc.setFont('times', 'normal');
        const clausulaCuarto = `El comprador declara haber recibido materialmente el vehículo objeto de este contrato, a su entera satisfacción. Por lo que expresa no tener cargo alguno ni objeción que formular, declarando el comprador que ${textoSaneamiento}.`;
        doc.text(clausulaCuarto, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausulaCuarto, pageWidth - 2 * margin) + 15;

        // QUINTO - Multas
        doc.setFont('times', 'bold');
        doc.text('QUINTO:', margin, y);
        y += 8;

        const responsabilidadMultas = document.getElementById('responsabilidadMultas').value;
        let textoMultas = 'el vendedor declara que exime de responsabilidad al comprador de dicha multa y que responderá de ella';
        if (responsabilidadMultas === 'comprador') {
            textoMultas = 'el comprador acepta asumir las multas anteriores al contrato';
        } else if (responsabilidadMultas === 'sin_multas') {
            textoMultas = 'ambas partes declaran que no existen multas pendientes';
        }

        doc.setFont('times', 'normal');
        const clausulaQuinto = `En el evento que al vehículo materia del presente contrato se le haya cursado una infracción o multa con fecha anterior al presente contrato de compraventa, ${textoMultas}.`;
        doc.text(clausulaQuinto, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausulaQuinto, pageWidth - 2 * margin) + 15;

        // SEXTO - Gastos
        doc.setFont('times', 'bold');
        doc.text('SEXTO:', margin, y);
        y += 8;

        const gastosContrato = document.getElementById('gastosContrato').value;
        let textoGastos = 'de cargo exclusivo del comprador del vehículo';
        if (gastosContrato === 'vendedor') {
            textoGastos = 'de cargo exclusivo del vendedor del vehículo';
        } else if (gastosContrato === 'compartidos') {
            textoGastos = 'compartidos entre ambas partes';
        }

        doc.setFont('times', 'normal');
        const clausulaSexto = `Los gastos derivados del presente contrato de compraventa, incluso impuestos, derechos notariales, inscripción serán ${textoGastos}.`;
        doc.text(clausulaSexto, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausulaSexto, pageWidth - 2 * margin) + 15;

        // SÉPTIMO - Domicilio
        doc.setFont('times', 'bold');
        doc.text('SÉPTIMO:', margin, y);
        y += 8;

        const domicilioLegalComuna = document.getElementById('domicilioLegalComuna').value || '________________';
        const domicilioLegalCiudad = document.getElementById('domicilioLegalCiudad').value || '________________';

        doc.setFont('times', 'normal');
        const clausulaSeptimo = `Para todos los efectos del presente contrato, las partes fijan su domicilio en la comuna de ${domicilioLegalComuna} y ciudad de ${domicilioLegalCiudad} y se someten a la jurisdicción de sus Tribunales.`;
        doc.text(clausulaSeptimo, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausulaSeptimo, pageWidth - 2 * margin) + 15;

        // OCTAVO - Inscripción
        doc.setFont('times', 'bold');
        doc.text('OCTAVO:', margin, y);
        y += 8;

        doc.setFont('times', 'normal');
        const clausulaOctavo = 'Se faculta al portador de copia autorizada de este contrato para requerir su inscripción en el Registro de Vehículos Motorizados del Registro Civil.';
        doc.text(clausulaOctavo, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausulaOctavo, pageWidth - 2 * margin) + 20;

        // Observaciones adicionales
        const observacionesAdicionales = document.getElementById('observacionesAdicionales').value;
        if (observacionesAdicionales && observacionesAdicionales.trim()) {
            doc.setFont('times', 'bold');
            doc.text('OBSERVACIONES ADICIONALES:', margin, y);
            y += 8;
            doc.setFont('times', 'normal');
            doc.text(observacionesAdicionales, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, observacionesAdicionales, pageWidth - 2 * margin) + 20;
        }

        // Verificar nueva página para firmas
        if (y > 180) {
            doc.addPage();
            y = 40;
        }

        // En comprobante, firman
        doc.setFont('times', 'bold');
        doc.text('En comprobante, firman:', 105, y, { align: 'center' });
        y += 40;

        // Sección de firmas
        this.addSignatureSectionVehicle(doc, y);
        
        this.addDigitalWatermark(doc);
    }

    addSignatureSectionVehicle(doc, y) {
        console.log('📄 Agregando sección de firmas al PDF...');
        
        const nombreVendedor = document.getElementById('nombreVendedor').value || '________________';
        const rutVendedor = document.getElementById('rutVendedor').value || '________________';
        const nombreComprador = document.getElementById('nombreComprador').value || '________________';
        const rutComprador = document.getElementById('rutComprador').value || '________________';
        
        // Firmas lado a lado
        const leftX = 55;
        const rightX = 155;
        const signatureWidth = 60;
        
        // VENDEDOR (izquierda)
        doc.line(leftX - 30, y, leftX + 30, y);
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.text(nombreVendedor, leftX, y + 8, { align: 'center' });
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('VENDEDOR', leftX, y + 14, { align: 'center' });
        doc.text(`CI: ${rutVendedor}`, leftX, y + 20, { align: 'center' });
        
        // COMPRADOR (derecha)
        doc.line(rightX - 30, y, rightX + 30, y);
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.text(nombreComprador, rightX, y + 8, { align: 'center' });
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('COMPRADOR', rightX, y + 14, { align: 'center' });
        doc.text(`CI: ${rutComprador}`, rightX, y + 20, { align: 'center' });
        
        // Agregar firmas digitales si existen
        if (window.firmaProcessor) {
            try {
                const firmaVendedor = window.firmaProcessor.getSignatureForPDF('vendedor');
                const firmaComprador = window.firmaProcessor.getSignatureForPDF('comprador');
                
                if (firmaVendedor) {
                    doc.addImage(firmaVendedor, 'PNG', leftX - 30, y - 20, 60, 15);
                    console.log('✅ Firma del vendedor agregada al PDF');
                }
                
                if (firmaComprador) {
                    doc.addImage(firmaComprador, 'PNG', rightX - 30, y - 20, 60, 15);
                    console.log('✅ Firma del comprador agregada al PDF');
                }
                
                if (firmaVendedor || firmaComprador) {
                    doc.setFont('times', 'italic');
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text('Documento con firmas digitales aplicadas', 105, y + 35, { align: 'center' });
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
        const nombreVendedor = (document.getElementById('nombreVendedor').value || 'Vendedor')
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const nombreComprador = (document.getElementById('nombreComprador').value || 'Comprador')
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const timestamp = new Date().toISOString().slice(0, 10);
        return `Contrato_Compraventa_Vehiculo_${nombreVendedor}_${nombreComprador}_${timestamp}.pdf`;
    }

    validateFormWithSignatures() {
        const emptyFields = [];
        
        // Campos mínimos requeridos
        const requiredFields = [
            'ciudadContrato', 'fechaContrato', 'notarioPublico', 'numeroNotaria', 'ciudadNotaria',
            'nombreVendedor', 'rutVendedor', 'domicilioVendedor', 'comunaVendedor', 'ciudadVendedor',
            'nombreComprador', 'rutComprador', 'domicilioComprador', 'comunaComprador', 'ciudadComprador',
            'tipoVehiculo', 'marcaVehiculo', 'anioVehiculo', 'modeloVehiculo', 'numeroMotor', 'numeroChasis',
            'patenteVehiculo', 'precioVenta', 'precioEnPalabras', 'domicilioLegalComuna', 'domicilioLegalCiudad'
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
        
        // Validar vehículo
        const patenteVehiculo = document.getElementById('patenteVehiculo').value;
        if (patenteVehiculo && !ConfigUtils.validatePatente(patenteVehiculo)) {
            issues.push('Patente del vehículo inválida');
        }
        
        const precioVenta = document.getElementById('precioVenta').value;
        if (precioVenta && !ConfigUtils.validatePrecio(precioVenta)) {
            issues.push('Precio de venta inválido');
        }
        
        if (!systemState.firmasDigitales.vendedor) {
            issues.push('Falta firma digital del vendedor');
        }
        
        if (!systemState.firmasDigitales.comprador) {
            issues.push('Falta