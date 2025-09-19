// ========================================
// 📋 SISTEMA PRINCIPAL DE CONTRATO DE ARRIENDO
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'ciudadContrato', 'fechaContrato',
        'nombreArrendador', 'nacionalidadArrendador', 'rutArrendador', 'domicilioArrendador', 'profesionArrendador', 'telefonoArrendador', 'estadoCivilArrendador', 'comunaArrendador', 'ciudadArrendador', 'emailArrendador',
        'nombreArrendatario', 'nacionalidadArrendatario', 'rutArrendatario', 'domicilioArrendatario', 'profesionArrendatario', 'telefonoArrendatario', 'estadoCivilArrendatario', 'comunaArrendatario', 'ciudadArrendatario', 'emailArrendatario',
        'direccionInmueble', 'numeroEstacionamiento', 'numeroBodega', 'comunaInmueble', 'regionInmueble', 'destinoInmueble',
        'fechaInicioContrato', 'fechaTerminoContrato', 'diasAnticipacion', 'vigenciaContrato',
        'tipoMonedaRenta', 'montoRentaMensual', 'diasPagoRenta', 'montoGarantia', 'diasDevolucionGarantia', 'multaDiaRetraso', 'cuentaCorriente', 'nombreBanco', 'emailComprobantes',
        'visitasPermitidasMes', 'periodoVisitas', 'diasSemanaMostrar', 'horasDiaMostrar',
        'nombreGarante', 'rutGarante', 'nacionalidadGarante', 'estadoCivilGarante', 'profesionGarante', 'domicilioGarante', 'comunaGarante', 'ciudadGarante',
        'inventarioEspecies', 'observacionesEspeciales'
    ],
    
    firmasDigitales: {
        arrendador: false,
        arrendatario: false,
        garante: false
    },
    
    fotosCarnet: {
        arrendador: {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        },
        arrendatario: {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        },
        garante: {
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

// ===== UTILIDADES PARA NÚMEROS A PALABRAS =====
const NumberToWords = {
    units: ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'],
    teens: ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'],
    tens: ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'],
    hundreds: ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'],
    
    convertToWords(number) {
        if (number === 0) return 'cero';
        if (number === 100) return 'cien';
        
        let result = '';
        
        // Millones
        if (number >= 1000000) {
            const millions = Math.floor(number / 1000000);
            if (millions === 1) {
                result += 'un millón ';
            } else {
                result += this.convertThousands(millions) + ' millones ';
            }
            number %= 1000000;
        }
        
        // Miles
        if (number >= 1000) {
            const thousands = Math.floor(number / 1000);
            if (thousands === 1) {
                result += 'mil ';
            } else {
                result += this.convertThousands(thousands) + ' mil ';
            }
            number %= 1000;
        }
        
        // Centenas, decenas y unidades
        if (number > 0) {
            result += this.convertThousands(number);
        }
        
        return result.trim();
    },
    
    convertThousands(number) {
        let result = '';
        
        // Centenas
        if (number >= 100) {
            const hundreds = Math.floor(number / 100);
            result += this.hundreds[hundreds] + ' ';
            number %= 100;
        }
        
        // Decenas y unidades
        if (number >= 20) {
            const tens = Math.floor(number / 10);
            const units = number % 10;
            result += this.tens[tens];
            if (units > 0) {
                result += ' y ' + this.units[units];
            }
        } else if (number >= 10) {
            result += this.teens[number - 10];
        } else if (number > 0) {
            result += this.units[number];
        }
        
        return result.trim();
    }
};

// ===== CLASE PRINCIPAL DEL SISTEMA =====
class ContratoArriendoSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Contrato de Arriendo...');
        
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
            'firmaArrendador', 'firmaArrendatario', 'firmaGarante',
            'photoArrendador', 'photoArrendatario', 'photoGarante',
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
        // Validación RUTs
        const rutFields = ['rutArrendador', 'rutArrendatario', 'rutGarante'];
        rutFields.forEach(fieldId => {
            const rutField = document.getElementById(fieldId);
            if (rutField) {
                rutField.addEventListener('input', (e) => {
                    this.handleRutInput(e, fieldId);
                });
            }
        });

        // Auto-llenar fecha actual
        const fechaContrato = document.getElementById('fechaContrato');
        if (fechaContrato && !fechaContrato.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaContrato.value = today;
        }

        // Validar emails
        const emailFields = ['emailArrendador', 'emailArrendatario', 'emailComprobantes'];
        emailFields.forEach(fieldId => {
            const emailField = document.getElementById(fieldId);
            if (emailField) {
                emailField.addEventListener('input', (e) => {
                    const email = e.target.value;
                    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                    e.target.classList.toggle('email-valid', isValid && email.length > 0);
                    e.target.classList.toggle('email-invalid', !isValid && email.length > 0);
                    this.updatePreview();
                });
            }
        });

        // Formatear número de cuenta
        const cuentaCorriente = document.getElementById('cuentaCorriente');
        if (cuentaCorriente) {
            cuentaCorriente.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^0-9-]/g, '');
                e.target.value = value;
                this.updatePreview();
            });
        }

        // Manejar campos opcionales del inmueble
        const numeroEstacionamiento = document.getElementById('numeroEstacionamiento');
        const numeroBodega = document.getElementById('numeroBodega');
        
        if (numeroEstacionamiento) {
            numeroEstacionamiento.addEventListener('input', () => this.updatePreview());
        }
        if (numeroBodega) {
            numeroBodega.addEventListener('input', () => this.updatePreview());
        }

        // Manejar tipo de moneda
        const tipoMonedaRenta = document.getElementById('tipoMonedaRenta');
        if (tipoMonedaRenta) {
            tipoMonedaRenta.addEventListener('change', () => this.updatePreview());
        }

        // Calcular fecha término automáticamente
        const fechaInicio = document.getElementById('fechaInicioContrato');
        const vigenciaContrato = document.getElementById('vigenciaContrato');
        
        if (fechaInicio && vigenciaContrato) {
            const calculateEndDate = () => {
                if (fechaInicio.value && vigenciaContrato.value) {
                    const startDate = new Date(fechaInicio.value);
                    let endDate;
                    
                    switch (vigenciaContrato.value) {
                        case '1 año':
                            endDate = new Date(startDate.setFullYear(startDate.getFullYear() + 1));
                            break;
                        case '2 años':
                            endDate = new Date(startDate.setFullYear(startDate.getFullYear() + 2));
                            break;
                        default:
                            return;
                    }
                    
                    const fechaTermino = document.getElementById('fechaTerminoContrato');
                    if (fechaTermino) {
                        fechaTermino.value = endDate.toISOString().split('T')[0];
                        this.updatePreview();
                    }
                }
            };
            
            fechaInicio.addEventListener('change', calculateEndDate);
            vigenciaContrato.addEventListener('change', calculateEndDate);
        }

        // Mostrar/ocultar sección de garante
        const nombreGarante = document.getElementById('nombreGarante');
        if (nombreGarante) {
            nombreGarante.addEventListener('input', () => {
                const garanteSection = document.getElementById('garanteSection');
                if (garanteSection) {
                    garanteSection.style.display = nombreGarante.value.trim() ? 'block' : 'none';
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
        this.updateOptionalFields();
        this.updateMoneyTypeText();
        this.updateProgress();
    }

    updateDuplicateReferences() {
        // Referencias múltiples del arrendador
        const nombreArrendador = document.getElementById('nombreArrendador').value;
        const rutArrendador = document.getElementById('rutArrendador').value;
        
        // Referencias múltiples del arrendatario
        const nombreArrendatario = document.getElementById('nombreArrendatario').value;
        const rutArrendatario = document.getElementById('rutArrendatario').value;
        
        // Referencias múltiples del garante
        const nombreGarante = document.getElementById('nombreGarante').value;
        const rutGarante = document.getElementById('rutGarante').value;
        
        // Otros campos duplicados
        const ciudadContrato = document.getElementById('ciudadContrato').value;
        
        // Actualizar todas las referencias
        const updates = {
            'prev_nombreArrendador2': nombreArrendador || '_________________________',
            'prev_nombreArrendatario2': nombreArrendatario || '_________________________',
            'prev_rutArrendador2': rutArrendador || '___________',
            'prev_rutArrendatario2': rutArrendatario || '___________',
            'prev_rutGarante2': rutGarante || '___________',
            'prev_ciudadContrato2': ciudadContrato || 'Santiago'
        };
        
        Object.keys(updates).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = updates[id];
            }
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
        const nombreArrendador = document.getElementById('nombreArrendador').value;
        const nombreArrendatario = document.getElementById('nombreArrendatario').value;
        const nombreGarante = document.getElementById('nombreGarante').value;
        
        const firmaArrendador = document.getElementById('prev_firmaArrendador');
        const firmaArrendatario = document.getElementById('prev_firmaArrendatario');
        const firmaGarante = document.getElementById('prev_firmaGarante');
        
        if (firmaArrendador) {
            firmaArrendador.textContent = nombreArrendador || '_______________';
        }
        if (firmaArrendatario) {
            firmaArrendatario.textContent = nombreArrendatario || '_______________';
        }
        if (firmaGarante) {
            firmaGarante.textContent = nombreGarante || '_______________';
        }
    }

    updateOptionalFields() {
        // Manejar estacionamiento y bodega opcionales
        const numeroEstacionamiento = document.getElementById('numeroEstacionamiento').value;
        const numeroBodega = document.getElementById('numeroBodega').value;
        
        const estacionamientoText = document.getElementById('estacionamiento-text');
        const bodegaText = document.getElementById('bodega-text');
        
        if (estacionamientoText) {
            estacionamientoText.style.display = numeroEstacionamiento.trim() ? 'inline' : 'none';
        }
        if (bodegaText) {
            bodegaText.style.display = numeroBodega.trim() ? 'inline' : 'none';
        }
    }

    updateMoneyTypeText() {
        const tipoMonedaRenta = document.getElementById('tipoMonedaRenta').value;
        const tipoMonedaTexto = document.getElementById('prev_tipoMonedaTexto');
        
        if (tipoMonedaTexto) {
            if (tipoMonedaRenta === 'uf') {
                tipoMonedaTexto.textContent = 'UF';
            } else {
                tipoMonedaTexto.textContent = 'pesos';
            }
        }
    }

    getPlaceholderText(field) {
        const placeholders = {
            'ciudadContrato': 'Santiago',
            'nombreArrendador': '_________________________',
            'nombreArrendatario': '_________________________',
            'nombreGarante': '_________________________',
            'nacionalidadArrendador': 'Chilena',
            'nacionalidadArrendatario': 'Chilena',
            'nacionalidadGarante': 'Chilena',
            'rutArrendador': '___________',
            'rutArrendatario': '___________',
            'rutGarante': '___________',
            'domicilioArrendador': '_________________________',
            'domicilioArrendatario': '_________________________',
            'domicilioGarante': '_________________________',
            'profesionArrendador': '________',
            'profesionArrendatario': '________',
            'profesionGarante': '________',
            'telefonoArrendador': '___________',
            'telefonoArrendatario': '___________',
            'comunaArrendador': '________',
            'comunaArrendatario': '________',
            'comunaGarante': '________',
            'comunaInmueble': '________',
            'ciudadArrendador': 'Santiago',
            'ciudadArrendatario': 'Santiago',
            'ciudadGarante': 'Santiago',
            'regionInmueble': 'Metropolitana',
            'direccionInmueble': '_________________________',
            'numeroEstacionamiento': '________',
            'numeroBodega': '________',
            'destinoInmueble': '________',
            'fechaInicioContrato': '________',
            'fechaTerminoContrato': '________',
            'diasAnticipacion': '________',
            'vigenciaContrato': '________',
            'tipoMonedaRenta': '________',
            'montoRentaMensual': '________',
            'diasPagoRenta': '________',
            'montoGarantia': '________',
            'diasDevolucionGarantia': '________',
            'multaDiaRetraso': '________',
            'cuentaCorriente': '________',
            'nombreBanco': '________',
            'emailComprobantes': '________',
            'emailArrendador': '________',
            'emailArrendatario': '________',
            'visitasPermitidasMes': '________',
            'periodoVisitas': '________',
            'diasSemanaMostrar': '________',
            'horasDiaMostrar': '________',
            'inventarioEspecies': '________________________',
            'observacionesEspeciales': '________________________'
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
        
        if (systemState.firmasDigitales.arrendador) bonusScore += 0.25;
        if (systemState.firmasDigitales.arrendatario) bonusScore += 0.25;
        if (systemState.firmasDigitales.garante) bonusScore += 0.25;
        if (systemState.fotosCarnet.arrendador.completed) bonusScore += 0.25;
        if (systemState.fotosCarnet.arrendatario.completed) bonusScore += 0.25;
        if (systemState.fotosCarnet.garante.completed) bonusScore += 0.25;
        
        const progress = ((filledFields + bonusScore) / (totalFields + 1.5)) * 100;
        
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
        
        const requiredElements = ['firmaModalOverlay', 'firmaArrendador', 'firmaArrendatario'];
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
        
        const signatureButtons = [
            { id: 'firmaArrendador', type: 'arrendador', nameField: 'nombreArrendador' },
            { id: 'firmaArrendatario', type: 'arrendatario', nameField: 'nombreArrendatario' },
            { id: 'firmaGarante', type: 'garante', nameField: 'nombreGarante' }
        ];
        
        signatureButtons.forEach(({ id, type, nameField }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openSignatureModalSafe(type, nameField);
                });
            }
        });
        
        console.log('✅ Botones de firma configurados correctamente');
    }

    openSignatureModalSafe(type, nameField) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        let nombreField = document.getElementById(nameField);
        
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
        
        const requiredElements = ['photoModalOverlay', 'photoArrendador', 'photoArrendatario'];
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
        
        const photoButtons = [
            { id: 'photoArrendador', type: 'arrendador', nameField: 'nombreArrendador' },
            { id: 'photoArrendatario', type: 'arrendatario', nameField: 'nombreArrendatario' },
            { id: 'photoGarante', type: 'garante', nameField: 'nombreGarante' }
        ];
        
        photoButtons.forEach(({ id, type, nameField }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openPhotoModalSafe(type, nameField);
                });
            }
        });
        
        console.log('✅ Botones de foto configurados correctamente');
    }

    openPhotoModalSafe(type, nameField) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        let nombreField = document.getElementById(nameField);
        
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
            localStorage.setItem('contrato_arriendo_form_data', JSON.stringify(data));
        } catch (error) {
            console.warn('⚠️ No se pudo guardar automáticamente:', error);
        }
    }

    restoreFormState() {
        try {
            const savedData = localStorage.getItem('contrato_arriendo_form_data');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                Object.keys(data).forEach(field => {
                    if (field === 'firmasDigitales') {
                        systemState.firmasDigitales = data.firmasDigitales || { arrendador: false, arrendatario: false, garante: false };
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
        return false;
    }

    // ===== FUNCIONES DE UTILIDAD =====
    initializeFormFields() {
        const fechaContrato = document.getElementById('fechaContrato');
        if (fechaContrato && !fechaContrato.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaContrato.value = today;
        }
        
        const regionInmueble = document.getElementById('regionInmueble');
        if (regionInmueble && !regionInmueble.value) {
            regionInmueble.value = 'Metropolitana';
        }
        
        const ciudadFields = ['ciudadContrato', 'ciudadArrendador', 'ciudadArrendatario', 'ciudadGarante'];
        ciudadFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value) {
                field.value = 'Santiago';
            }
        });
        
        const nacionalidadFields = ['nacionalidadArrendador', 'nacionalidadArrendatario', 'nacionalidadGarante'];
        nacionalidadFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value) {
                field.value = 'Chilena';
            }
        });
        
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
                        element.classList.remove('rut-valid', 'rut-invalid', 'email-valid', 'email-invalid');
                    }
                });
                
                this.initializeFormFields();
                
                systemState.firmasDigitales = { arrendador: false, arrendatario: false, garante: false };
                systemState.fotosCarnet = {
                    arrendador: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false },
                    arrendatario: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false },
                    garante: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false }
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
                this.showNotification('PDF de Contrato de Arriendo generado exitosamente', 'success');
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
        doc.text('CONTRATO DE ARRENDAMIENTO', 105, y, { align: 'center' });
        y += 30;

        // Subtítulo con partes
        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        const nombreArrendador = document.getElementById('nombreArrendador').value || 'ARRENDADOR';
        const nombreArrendatario = document.getElementById('nombreArrendatario').value || 'ARRENDATARIO';
        
        doc.text(nombreArrendador, 105, y, { align: 'center' });
        y += 15;
        doc.text('A', 105, y, { align: 'center' });
        y += 15;
        doc.text(nombreArrendatario, 105, y, { align: 'center' });
        y += 30;

        // Contenido principal
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        
        const fechaContrato = document.getElementById('fechaContrato').value;
        const ciudadContrato = document.getElementById('ciudadContrato').value;
        const nacionalidadArrendador = document.getElementById('nacionalidadArrendador').value;
        const rutArrendador = document.getElementById('rutArrendador').value;
        const estadoCivilArrendador = document.getElementById('estadoCivilArrendador').value;
        const profesionArrendador = document.getElementById('profesionArrendador').value;
        const domicilioArrendador = document.getElementById('domicilioArrendador').value;
        const comunaArrendador = document.getElementById('comunaArrendador').value;
        const ciudadArrendador = document.getElementById('ciudadArrendador').value;

        // Párrafo de fecha y partes
        let fechaTexto = '__ de ________ del 20__';
        if (fechaContrato && ConfigUtils.validateDate(fechaContrato)) {
            const date = new Date(fechaContrato);
            fechaTexto = `${date.getDate()} de ${this.mesesEspanol[date.getMonth()]} del ${date.getFullYear()}`;
        }

        const parrafo1 = `En ${ciudadContrato.toUpperCase()} de Chile, a ${fechaTexto}, entre: don(ña) ${nombreArrendador}, ${nacionalidadArrendador}, ${estadoCivilArrendador}, ${profesionArrendador}, cédula de identidad N° ${rutArrendador}, con domicilio en ${domicilioArrendador}, comuna de ${comunaArrendador}, ${ciudadArrendador} (en adelante, el "Arrendador"); por una parte y por la otra...`;
        
        doc.text(parrafo1, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, parrafo1, pageWidth - 2 * margin) + 20;

        // Verificar si necesitamos nueva página
        if (y > 200) {
            doc.addPage();
            y = 30;
        }

        // Continuar con más cláusulas del contrato...
        const direccionInmueble = document.getElementById('direccionInmueble').value;
        const comunaInmueble = document.getElementById('comunaInmueble').value;
        const regionInmueble = document.getElementById('regionInmueble').value;

        const clausula1 = `PRIMERO: Objeto. El Arrendador es dueño del inmueble ubicado en ${direccionInmueble}, comuna de ${comunaInmueble}, Región ${regionInmueble}. Por el presente instrumento, el Arrendador, da en arrendamiento al Arrendatario el inmueble individualizado precedentemente.`;
        
        doc.text(clausula1, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausula1, pageWidth - 2 * margin) + 15;

        // Agregar más contenido del contrato...
        const montoRentaMensual = document.getElementById('montoRentaMensual').value;
        const diasPagoRenta = document.getElementById('diasPagoRenta').value;
        const cuentaCorriente = document.getElementById('cuentaCorriente').value;
        const nombreBanco = document.getElementById('nombreBanco').value;

        const clausula5 = `QUINTO: Renta. La renta mensual de arrendamiento será la suma de $${montoRentaMensual} pesos, pagadera dentro de los ${diasPagoRenta} primeros días de cada mes, mediante depósito en la cuenta corriente número ${cuentaCorriente}, del Banco ${nombreBanco}.`;
        
        doc.text(clausula5, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausula5, pageWidth - 2 * margin) + 30;

        // Sección de firmas
        this.addSignatureSection(doc, y);
        
        this.addDigitalWatermark(doc);
    }

    addSignatureSection(doc, y) {
        console.log('📄 Agregando sección de firmas al PDF...');
        
        const centerX = 105;
        const signatureWidth = 70;
        const signatureSpacing = 90;
        
        // Firmas del Arrendador y Arrendatario
        const arrendadorX = centerX - signatureSpacing / 2;
        const arrendatarioX = centerX + signatureSpacing / 2;
        
        // Líneas de firma
        doc.line(arrendadorX - signatureWidth/2, y, arrendadorX + signatureWidth/2, y);
        doc.line(arrendatarioX - signatureWidth/2, y, arrendatarioX + signatureWidth/2, y);
        y += 8;
        
        // Nombres
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        const nombreArrendador = document.getElementById('nombreArrendador').value;
        const nombreArrendatario = document.getElementById('nombreArrendatario').value;
        
        doc.text(nombreArrendador, arrendadorX, y, { align: 'center' });
        doc.text(nombreArrendatario, arrendatarioX, y, { align: 'center' });
        y += 6;
        
        // Roles
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('ARRENDADOR', arrendadorX, y, { align: 'center' });
        doc.text('ARRENDATARIO', arrendatarioX, y, { align: 'center' });
        y += 8;
        
        // RUTs
        const rutArrendador = document.getElementById('rutArrendador').value;
        const rutArrendatario = document.getElementById('rutArrendatario').value;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.text(`C.I. N° ${rutArrendador}`, arrendadorX, y, { align: 'center' });
        doc.text(`C.I. N° ${rutArrendatario}`, arrendatarioX, y, { align: 'center' });
        
        // Agregar firmas digitales si existen
        if (window.firmaProcessor) {
            try {
                const firmaArrendador = window.firmaProcessor.getSignatureForPDF('arrendador');
                const firmaArrendatario = window.firmaProcessor.getSignatureForPDF('arrendatario');
                
                if (firmaArrendador) {
                    doc.addImage(firmaArrendador, 'PNG', arrendadorX - signatureWidth/2, y - 30, signatureWidth, 20);
                }
                if (firmaArrendatario) {
                    doc.addImage(firmaArrendatario, 'PNG', arrendatarioX - signatureWidth/2, y - 30, signatureWidth, 20);
                }
                
                console.log('✅ Firmas digitales agregadas al PDF');
            } catch (error) {
                console.error('❌ Error agregando firmas digitales al PDF:', error);
            }
        }
        
        // Firma del Garante si existe
        const nombreGarante = document.getElementById('nombreGarante').value;
        if (nombreGarante && nombreGarante.trim()) {
            y += 30;
            doc.line(centerX - signatureWidth/2, y, centerX + signatureWidth/2, y);
            y += 8;
            
            doc.setFont('times', 'bold');
            doc.setFontSize(11);
            doc.text(nombreGarante, centerX, y, { align: 'center' });
            y += 6;
            
            doc.setFont('times', 'normal');
            doc.setFontSize(10);
            doc.text('GARANTE/CODEUDOR SOLIDARIO', centerX, y, { align: 'center' });
            y += 8;
            
            const rutGarante = document.getElementById('rutGarante').value;
            doc.setFont('times', 'normal');
            doc.setFontSize(9);
            doc.text(`C.I. N° ${rutGarante}`, centerX, y, { align: 'center' });
            
            // Agregar firma del garante si existe
            if (window.firmaProcessor) {
                try {
                    const firmaGarante = window.firmaProcessor.getSignatureForPDF('garante');
                    if (firmaGarante) {
                        doc.addImage(firmaGarante, 'PNG', centerX - signatureWidth/2, y - 30, signatureWidth, 20);
                    }
                } catch (error) {
                    console.error('❌ Error agregando firma del garante al PDF:', error);
                }
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
        const nombreArrendador = document.getElementById('nombreArrendador').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const nombreArrendatario = document.getElementById('nombreArrendatario').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const timestamp = new Date().toISOString().slice(0, 10);
        return `Contrato_Arriendo_${nombreArrendador}_${nombreArrendatario}_${timestamp}.pdf`;
    }

    validateFormWithSignatures() {
        const emptyFields = [];
        
        // Campos mínimos requeridos
        const requiredFields = [
            'ciudadContrato', 'fechaContrato',
            'nombreArrendador', 'nacionalidadArrendador', 'rutArrendador', 'domicilioArrendador', 'profesionArrendador',
            'nombreArrendatario', 'nacionalidadArrendatario', 'rutArrendatario', 'domicilioArrendatario', 'profesionArrendatario',
            'direccionInmueble', 'comunaInmueble', 'destinoInmueble',
            'fechaInicioContrato', 'fechaTerminoContrato', 'vigenciaContrato',
            'tipoMonedaRenta', 'montoRentaMensual', 'diasPagoRenta', 'montoGarantia'
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
        const rutFields = [
            { id: 'rutArrendador', name: 'arrendador' },
            { id: 'rutArrendatario', name: 'arrendatario' },
            { id: 'rutGarante', name: 'garante' }
        ];
        
        rutFields.forEach(({ id, name }) => {
            const rut = document.getElementById(id).value;
            if (rut && !ConfigUtils.validateRUT(rut)) {
                issues.push(`RUT del ${name} inválido`);
            }
        });
        
        // Validar fechas
        const fechaContrato = document.getElementById('fechaContrato').value;
        if (fechaContrato && !ConfigUtils.validateDate(fechaContrato)) {
            issues.push('Fecha del contrato inválida');
        }
        
        const fechaInicio = document.getElementById('fechaInicioContrato').value;
        const fechaTermino = document.getElementById('fechaTerminoContrato').value;
        if (fechaInicio && fechaTermino) {
            if (!ConfigUtils.validateDate(fechaInicio)) {
                issues.push('Fecha de inicio del contrato inválida');
            }
            if (!ConfigUtils.validateDate(fechaTermino)) {
                issues.push('Fecha de término del contrato inválida');
            }
            if (new Date(fechaInicio) >= new Date(fechaTermino)) {
                issues.push('La fecha de término debe ser posterior a la fecha de inicio');
            }
        }
        
        // Validar emails
        const emailFields = ['emailArrendador', 'emailArrendatario', 'emailComprobantes'];
        emailFields.forEach(fieldId => {
            const email = document.getElementById(fieldId).value;
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                issues.push(`Email ${fieldId.replace('email', '').toLowerCase()} inválido`);
            }
        });
        
        // Validar firmas requeridas
        if (!systemState.firmasDigitales.arrendador) {
            issues.push('Falta firma digital del arrendador');
        }
        if (!systemState.firmasDigitales.arrendatario) {
            issues.push('Falta firma digital del arrendatario');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

// ===== CLASES DE PROCESADORES (ACTUALIZADAS PARA MÚLTIPLES USUARIOS) =====
class FirmaDigitalProcessor {
    constructor() {
        this.processedImageData = null;
        this.currentType = null;
        this.firmasDigitales = {
            arrendador: null,
            arrendatario: null,
            garante: null
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
            
            if (window.contratoArriendoSystem) {
                window.contratoArriendoSystem.updateProgress();
            }
            
            this.closeModal();
            
            if (window.contratoArriendoSystem) {
                window.contratoArriendoSystem.showNotification(`Firma digital del ${this.currentType} aplicada correctamente`, 'success');
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
        this.firmasDigitales = { arrendador: null, arrendatario: null, garante: null };
        systemState.firmasDigitales = { arrendador: false, arrendatario: false, garante: false };
        
        ['arrendador', 'arrendatario', 'garante'].forEach(type => {
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

// ===== CLASE PROCESADOR DE FOTOS (ACTUALIZADA PARA MÚLTIPLES USUARIOS) =====
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
        
        if (window.contratoArriendoSystem) {
            window.contratoArriendoSystem.showNotification(errorMessage, 'error');
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
            
            if (window.contratoArriendoSystem) {
                window.contratoArriendoSystem.showNotification(`Foto del ${this.currentStep} capturada`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            if (window.contratoArriendoSystem) {
                window.contratoArriendoSystem.showNotification('Error al capturar la foto', 'error');
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
            if (window.contratoArriendoSystem) {
                window.contratoArriendoSystem.showNotification('Ahora capture el reverso del carnet', 'info');
            }
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            this.currentStep = 'completed';
            this.showSummary();
            if (window.contratoArriendoSystem) {
                window.contratoArriendoSystem.showNotification('Ambas fotos capturadas', 'success');
            }
        }
    }

    restartProcess() {
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        if (window.contratoArriendoSystem) {
            window.contratoArriendoSystem.showNotification('Proceso reiniciado', 'info');
        }
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            if (window.contratoArriendoSystem) {
                window.contratoArriendoSystem.showNotification('Faltan fotos por capturar', 'error');
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
            
            if (window.contratoArriendoSystem) {
                window.contratoArriendoSystem.updateProgress();
            }

            this.closeModal();
            
            if (window.contratoArriendoSystem) {
                window.contratoArriendoSystem.showNotification(`Carnet completo del ${this.currentType} guardado`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al confirmar fotos:', error);
            if (window.contratoArriendoSystem) {
                window.contratoArriendoSystem.showNotification('Error al procesar las fotos', 'error');
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
        ['arrendador', 'arrendatario', 'garante'].forEach(type => {
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
    if (window.contratoArriendoSystem) {
        window.contratoArriendoSystem.clearForm();
    }
};

window.generatePDF = function() {
    if (window.contratoArriendoSystem) {
        window.contratoArriendoSystem.generatePDF();
    }
};

// ===== INICIALIZACIÓN DEL SISTEMA =====
let contratoArriendoSystem;

function initializeContratoArriendoSystem() {
    console.log('📋 Iniciando Sistema de Contrato de Arriendo...');
    
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined') {
        console.warn('⚠️ jsPDF no está disponible, esperando...');
        setTimeout(initializeContratoArriendoSystem, 1000);
        return;
    }
    
    // Verificar que CONFIG esté disponible
    if (typeof CONFIG === 'undefined') {
        console.warn('⚠️ CONFIG no está disponible, esperando...');
        setTimeout(initializeContratoArriendoSystem, 1000);
        return;
    }
    
    try {
        contratoArriendoSystem = new ContratoArriendoSystem();
        window.contratoArriendoSystem = contratoArriendoSystem;
        
        console.log('✅ Sistema completamente inicializado');
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        setTimeout(initializeContratoArriendoSystem, 2000);
    }
}

// ===== MÚLTIPLES PUNTOS DE INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContratoArriendoSystem);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initializeContratoArriendoSystem, 500);
}

window.addEventListener('load', () => {
    if (!window.contratoArriendoSystem) {
        console.log('🔄 Inicialización de respaldo activada');
        setTimeout(initializeContratoArriendoSystem, 1000);
    }
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', (event) => {
    console.error('❌ Error global capturado:', event.error);
    
    if (window.contratoArriendoSystem) {
        window.contratoArriendoSystem.showNotification(
            'Se detectó un error. El sistema intentará recuperarse automáticamente.', 
            'warning'
        );
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
    
    if (window.contratoArriendoSystem) {
        window.contratoArriendoSystem.showNotification(
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
console.log('📜 Sistema de Contrato de Arriendo - Script principal cargado correctamente');