// ========================================
// 📋 SISTEMA PRINCIPAL DE CONTRATO DE PRESTACIÓN DE SERVICIOS A HONORARIOS
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'ciudadContrato', 'fechaContrato', 'duracionMeses',
        'razonSocialEmpresa', 'rutEmpresa', 'giroComercial', 'comunaEmpresa', 'regionEmpresa', 'domicilioEmpresa', 'emailEmpresa',
        'nombreRepresentante', 'rutRepresentante', 'nacionalidadRepresentante', 'estadoCivilRepresentante',
        'nombrePrestador', 'rutPrestador', 'nacionalidadPrestador', 'estadoCivilPrestador', 'profesionPrestador', 'comunaPrestador', 'regionPrestador', 'domicilioPrestador', 'emailPrestador',
        'tituloServicio', 'descripcionServicios', 'serviciosEspecificos',
        'tipoHonorario', 'valorHonorario', 'valorPalabras', 'diaPago', 'condicionesPago',
        'incluyeConfidencialidad', 'incluyeNoCompetencia', 'multaIncumplimiento', 'incluyeArbitraje', 'posibilidadContratacion', 'renovacionAutomatica',
        'observacionesAdicionales'
    ],
    
    firmasDigitales: {
        empresa: false,
        prestador: false
    },
    
    fotosCarnet: {
        empresa: {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        },
        prestador: {
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
class ContratoHonorariosSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Contrato de Prestación de Servicios a Honorarios...');
        
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
            'firmaEmpresa', 'firmaPrestador', 'photoEmpresa', 'photoPrestador',
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
        const rutFields = ['rutEmpresa', 'rutRepresentante', 'rutPrestador'];
        rutFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.handleRutInput(e, fieldId);
                });
            }
        });

        // Validación emails
        const emailFields = ['emailEmpresa', 'emailPrestador'];
        emailFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.handleEmailInput(e, fieldId);
                });
            }
        });

        // Auto-llenar fecha actual
        const fechaContrato = document.getElementById('fechaContrato');
        if (fechaContrato && !fechaContrato.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaContrato.value = today;
        }

        // Convertir honorario a palabras
        const valorHonorario = document.getElementById('valorHonorario');
        const valorPalabras = document.getElementById('valorPalabras');
        if (valorHonorario && valorPalabras) {
            valorHonorario.addEventListener('input', (e) => {
                const valor = parseInt(e.target.value);
                if (!isNaN(valor) && valor > 0) {
                    const palabras = NumberToWords.convertToWords(valor);
                    valorPalabras.value = palabras.charAt(0).toUpperCase() + palabras.slice(1);
                } else {
                    valorPalabras.value = '';
                }
                this.updatePreview();
            });
        }

        // Validar duración del contrato
        const duracionMeses = document.getElementById('duracionMeses');
        if (duracionMeses) {
            duracionMeses.addEventListener('input', (e) => {
                const duracion = parseInt(e.target.value);
                if (duracion > 24) {
                    this.showNotification('Duración muy larga para este tipo de contrato', 'warning');
                }
                this.updatePreview();
            });
        }

        // Validar honorarios
        const tipoHonorario = document.getElementById('tipoHonorario');
        if (tipoHonorario && valorHonorario) {
            tipoHonorario.addEventListener('change', () => {
                this.updatePreview();
            });
            
            valorHonorario.addEventListener('input', (e) => {
                const valor = parseInt(e.target.value);
                if (valor > 10000000) { // 10 millones
                    this.showNotification('Monto de honorario muy alto, verifique', 'warning');
                }
                this.updatePreview();
            });
        }

        // Validar profesión
        const profesionPrestador = document.getElementById('profesionPrestador');
        if (profesionPrestador) {
            profesionPrestador.addEventListener('input', (e) => {
                const isValid = ConfigUtils.validateProfession(e.target.value);
                e.target.classList.toggle('profession-valid', isValid);
                e.target.classList.toggle('profession-invalid', !isValid && e.target.value.length > 0);
                this.updatePreview();
            });
        }

        // Validar giro comercial
        const giroComercial = document.getElementById('giroComercial');
        if (giroComercial) {
            giroComercial.addEventListener('input', (e) => {
                const isValid = ConfigUtils.validateCommercialActivity(e.target.value);
                e.target.classList.toggle('giro-valid', isValid);
                e.target.classList.toggle('giro-invalid', !isValid && e.target.value.length > 0);
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

    handleEmailInput(event, fieldId) {
        const email = event.target.value;
        
        if (email.length > 0) {
            const isValid = ConfigUtils.validateEmail(email);
            event.target.classList.toggle('email-valid', isValid);
            event.target.classList.toggle('email-invalid', !isValid);
        } else {
            event.target.classList.remove('email-valid', 'email-invalid');
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
        this.updateSpecialClauses();
        this.updateServicesPreview();
        this.updateProgress();
    }

    updateDuplicateReferences() {
        const razonSocialEmpresa = document.getElementById('razonSocialEmpresa').value;
        const rutRepresentante = document.getElementById('rutRepresentante').value;
        const rutPrestador = document.getElementById('rutPrestador').value;
        const nombrePrestador = document.getElementById('nombrePrestador').value;
        const ciudadContrato = document.getElementById('ciudadContrato').value;
        
        const prev_razonSocialEmpresa2 = document.getElementById('prev_razonSocialEmpresa2');
        const prev_rutRepresentante2 = document.getElementById('prev_rutRepresentante2');
        const prev_rutPrestador2 = document.getElementById('prev_rutPrestador2');
        const prev_nombrePrestador2 = document.getElementById('prev_nombrePrestador2');
        const prev_ciudadContrato2 = document.getElementById('prev_ciudadContrato2');
        
        if (prev_razonSocialEmpresa2) prev_razonSocialEmpresa2.textContent = razonSocialEmpresa || 'EMPRESA SpA';
        if (prev_rutRepresentante2) prev_rutRepresentante2.textContent = rutRepresentante || '___________';
        if (prev_rutPrestador2) prev_rutPrestador2.textContent = rutPrestador || '___________';
        if (prev_nombrePrestador2) prev_nombrePrestador2.textContent = nombrePrestador || '_________________________';
        if (prev_ciudadContrato2) prev_ciudadContrato2.textContent = ciudadContrato || 'Santiago';
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
        const nombreRepresentante = document.getElementById('nombreRepresentante').value;
        const nombrePrestador = document.getElementById('nombrePrestador').value;
        
        const prev_firmaEmpresa = document.getElementById('prev_firmaEmpresa');
        const prev_firmaPrestador = document.getElementById('prev_firmaPrestador');
        
        if (prev_firmaEmpresa) prev_firmaEmpresa.textContent = nombreRepresentante || '_______________';
        if (prev_firmaPrestador) prev_firmaPrestador.textContent = nombrePrestador || '_______________';
    }

    updateSpecialClauses() {
        // Actualizar modalidad de pago
        const tipoHonorario = document.getElementById('tipoHonorario').value;
        const prev_modalidadPago = document.getElementById('prev_modalidadPago');
        
        if (prev_modalidadPago) {
            prev_modalidadPago.textContent = ConfigUtils.getTipoHonorarioDescription(tipoHonorario);
        }

        // Actualizar día de pago
        const diaPago = document.getElementById('diaPago').value;
        const prev_diaPago = document.getElementById('prev_diaPago');
        
        if (prev_diaPago) {
            prev_diaPago.textContent = ConfigUtils.getDiaPagoDescription(diaPago);
        }

        // Actualizar cláusulas especiales
        this.updateClausulasEspeciales();
    }

    updateClausulasEspeciales() {
        const incluyeConfidencialidad = document.getElementById('incluyeConfidencialidad').value;
        const incluyeNoCompetencia = document.getElementById('incluyeNoCompetencia').value;
        const multaIncumplimiento = document.getElementById('multaIncumplimiento').value;
        const incluyeArbitraje = document.getElementById('incluyeArbitraje').value;
        const posibilidadContratacion = document.getElementById('posibilidadContratacion').value;
        const renovacionAutomatica = document.getElementById('renovacionAutomatica').value;

        // Cláusula de confidencialidad
        const prev_clausulaConfidencialidad = document.getElementById('prev_clausulaConfidencialidad');
        if (prev_clausulaConfidencialidad) {
            if (incluyeConfidencialidad === 'no') {
                prev_clausulaConfidencialidad.style.display = 'none';
            } else {
                prev_clausulaConfidencialidad.style.display = 'block';
            }
        }

        // Cláusula de no competencia
        const prev_clausulaNoCompetencia = document.getElementById('prev_clausulaNoCompetencia');
        if (prev_clausulaNoCompetencia) {
            if (incluyeNoCompetencia === 'no') {
                prev_clausulaNoCompetencia.style.display = 'none';
            } else {
                prev_clausulaNoCompetencia.style.display = 'block';
            }
        }

        // Cláusula de multa
        const prev_clausulaMulta = document.getElementById('prev_clausulaMulta');
        const prev_multaIncumplimiento = document.getElementById('prev_multaIncumplimiento');
        if (prev_clausulaMulta && prev_multaIncumplimiento) {
            if (multaIncumplimiento && parseFloat(multaIncumplimiento) > 0) {
                prev_multaIncumplimiento.textContent = ConfigUtils.formatUF(multaIncumplimiento);
                prev_clausulaMulta.style.display = 'block';
            } else {
                prev_clausulaMulta.style.display = 'none';
            }
        }

        // Cláusula de arbitraje
        const prev_clausulaArbitraje = document.getElementById('prev_clausulaArbitraje');
        if (prev_clausulaArbitraje) {
            if (incluyeArbitraje === 'no') {
                prev_clausulaArbitraje.style.display = 'none';
            } else {
                prev_clausulaArbitraje.style.display = 'block';
            }
        }

        // Cláusula de renovación
        const prev_renovacionClause = document.getElementById('prev_renovacionClause');
        if (prev_renovacionClause) {
            if (renovacionAutomatica === 'si') {
                prev_renovacionClause.textContent = 'con renovación automática por períodos iguales, salvo aviso contrario de cualquiera de las partes con 30 días de anticipación';
            } else {
                prev_renovacionClause.textContent = 'plazo que podrá ser renovado previo acuerdo entre las partes, mediante la suscripción de un nuevo contrato o bien un anexo al presente documento';
            }
        }

        // Cláusula de contratación futura
        const prev_contratacionClause = document.getElementById('prev_contratacionClause');
        if (prev_contratacionClause) {
            if (posibilidadContratacion === 'no') {
                prev_contratacionClause.textContent = '';
            } else {
                prev_contratacionClause.textContent = 'Se deja constancia que La Empresa Contratante, evaluará extender el plazo, así como las condiciones del presente contrato de prestación de servicios, teniendo en especial consideración el desempeño del Prestador del Servicio.';
            }
        }
    }

    updateServicesPreview() {
        const serviciosEspecificos = document.getElementById('serviciosEspecificos').value;
        const prev_serviciosEspecificos = document.getElementById('prev_serviciosEspecificos');
        
        if (prev_serviciosEspecificos) {
            if (serviciosEspecificos && serviciosEspecificos.trim()) {
                const servicios = ConfigUtils.parseServiciosEspecificos(serviciosEspecificos);
                let html = '';
                servicios.forEach((servicio, index) => {
                    html += `<p>${index + 1}. ${servicio}</p>`;
                });
                prev_serviciosEspecificos.innerHTML = html;
            } else {
                prev_serviciosEspecificos.innerHTML = `
                    <p>1. ________________________</p>
                    <p>2. ________________________</p>
                    <p>3. ________________________</p>
                `;
            }
        }
    }

    getPlaceholderText(field) {
        const placeholders = {
            'ciudadContrato': 'Santiago',
            'duracionMeses': '6',
            'razonSocialEmpresa': 'EMPRESA SpA',
            'rutEmpresa': '___________',
            'giroComercial': '________',
            'comunaEmpresa': '________',
            'regionEmpresa': 'Metropolitana',
            'domicilioEmpresa': '_________________________',
            'emailEmpresa': '________________________',
            'nombreRepresentante': '_________________________',
            'rutRepresentante': '___________',
            'nacionalidadRepresentante': 'chilena',
            'estadoCivilRepresentante': '________',
            'nombrePrestador': '_________________________',
            'rutPrestador': '___________',
            'nacionalidadPrestador': 'chilena',
            'estadoCivilPrestador': '________',
            'profesionPrestador': '________',
            'comunaPrestador': '________',
            'regionPrestador': 'Metropolitana',
            'domicilioPrestador': '_________________________',
            'emailPrestador': '________________________',
            'tituloServicio': '________',
            'descripcionServicios': '________________________',
            'valorHonorario': '________',
            'valorPalabras': '________ pesos',
            'condicionesPago': 'contra la presentación de la respectiva Boleta de Honorario por parte del Prestador del Servicio Profesional',
            'multaIncumplimiento': '________',
            'observacionesAdicionales': '________________________'
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
        
        if (systemState.firmasDigitales.empresa) bonusScore += 0.25;
        if (systemState.firmasDigitales.prestador) bonusScore += 0.25;
        if (systemState.fotosCarnet.empresa.completed) bonusScore += 0.25;
        if (systemState.fotosCarnet.prestador.completed) bonusScore += 0.25;
        
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
        
        const requiredElements = ['firmaModalOverlay', 'firmaEmpresa', 'firmaPrestador'];
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
        const btnFirmaPrestador = document.getElementById('firmaPrestador');
        
        if (!btnFirmaEmpresa || !btnFirmaPrestador) {
            throw new Error('Botones de firma no encontrados');
        }
        
        btnFirmaEmpresa.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('empresa');
        });
        
        btnFirmaPrestador.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('prestador');
        });
        
        console.log('✅ Botones de firma configurados correctamente');
    }

    openSignatureModalSafe(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        let nombreField;
        if (type === 'empresa') {
            nombreField = document.getElementById('nombreRepresentante');
        } else if (type === 'prestador') {
            nombreField = document.getElementById('nombrePrestador');
        }
        
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
        
        const requiredElements = ['photoModalOverlay', 'photoEmpresa', 'photoPrestador'];
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
        const btnPhotoPrestador = document.getElementById('photoPrestador');
        
        if (!btnPhotoEmpresa || !btnPhotoPrestador) {
            throw new Error('Botones de foto no encontrados');
        }
        
        btnPhotoEmpresa.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('empresa');
        });
        
        btnPhotoPrestador.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('prestador');
        });
        
        console.log('✅ Botones de foto configurados correctamente');
    }

    openPhotoModalSafe(type) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        let nombreField;
        if (type === 'empresa') {
            nombreField = document.getElementById('nombreRepresentante');
        } else if (type === 'prestador') {
            nombreField = document.getElementById('nombrePrestador');
        }
        
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
                        systemState.firmasDigitales = data.firmasDigitales || { empresa: false, prestador: false };
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
                
                // Restaurar valores por defecto
                const fechaContrato = document.getElementById('fechaContrato');
                if (fechaContrato) {
                    const today = new Date().toISOString().split('T')[0];
                    fechaContrato.value = today;
                }
                
                const duracionMeses = document.getElementById('duracionMeses');
                if (duracionMeses) duracionMeses.value = '6';
                
                const diaPago = document.getElementById('diaPago');
                if (diaPago) diaPago.value = '5';
                
                const incluyeConfidencialidad = document.getElementById('incluyeConfidencialidad');
                if (incluyeConfidencialidad) incluyeConfidencialidad.value = 'si';
                
                const incluyeNoCompetencia = document.getElementById('incluyeNoCompetencia');
                if (incluyeNoCompetencia) incluyeNoCompetencia.value = 'si';
                
                const incluyeArbitraje = document.getElementById('incluyeArbitraje');
                if (incluyeArbitraje) incluyeArbitraje.value = 'si';
                
                systemState.firmasDigitales = { empresa: false, prestador: false };
                systemState.fotosCarnet = {
                    empresa: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false },
                    prestador: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false }
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
                this.showNotification('PDF de Contrato de Prestación de Servicios generado exitosamente', 'success');
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
        doc.text('CONTRATO DE PRESTACIÓN DE SERVICIOS A HONORARIOS', 105, y, { align: 'center' });
        y += 30;

        // Contenido principal
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        
        const fechaContrato = document.getElementById('fechaContrato').value;
        const ciudadContrato = document.getElementById('ciudadContrato').value;
        const razonSocialEmpresa = document.getElementById('razonSocialEmpresa').value;
        const rutEmpresa = document.getElementById('rutEmpresa').value;
        const giroComercial = document.getElementById('giroComercial').value;
        const nombreRepresentante = document.getElementById('nombreRepresentante').value;
        const nacionalidadRepresentante = document.getElementById('nacionalidadRepresentante').value;
        const estadoCivilRepresentante = document.getElementById('estadoCivilRepresentante').value;
        const rutRepresentante = document.getElementById('rutRepresentante').value;
        const domicilioEmpresa = document.getElementById('domicilioEmpresa').value;
        const comunaEmpresa = document.getElementById('comunaEmpresa').value;
        
        const nombrePrestador = document.getElementById('nombrePrestador').value;
        const nacionalidadPrestador = document.getElementById('nacionalidadPrestador').value;
        const estadoCivilPrestador = document.getElementById('estadoCivilPrestador').value;
        const profesionPrestador = document.getElementById('profesionPrestador').value;
        const rutPrestador = document.getElementById('rutPrestador').value;
        const domicilioPrestador = document.getElementById('domicilioPrestador').value;
        const comunaPrestador = document.getElementById('comunaPrestador').value;
        const regionPrestador = document.getElementById('regionPrestador').value;

        // Párrafo de fecha y partes
        let fechaTexto = '__ de ________ de 20__';
        if (fechaContrato && ConfigUtils.validateDate(fechaContrato)) {
            const date = new Date(fechaContrato);
            fechaTexto = `${date.getDate()} de ${this.mesesEspanol[date.getMonth()]} de ${date.getFullYear()}`;
        }

        const parrafo1 = `Con fecha ${fechaTexto}, por una parte, la Sociedad ${razonSocialEmpresa}, RUT ${rutEmpresa}, sociedad del giro ${giroComercial}, representada por don ${nombreRepresentante}, ${nacionalidadRepresentante}, ${estadoCivilPrestador}, cédula de identidad Nº ${rutRepresentante}, ambos domiciliados en ${domicilioEmpresa}, Comuna ${comunaEmpresa}, en adelante, "la Empresa Contratante" y, por otra parte, don ${nombrePrestador}, ${nacionalidadPrestador}, ${estadoCivilPrestador}, profesión ${profesionPrestador}, cédula de identidad número ${rutPrestador}, con domicilio en ${domicilioPrestador}, Comuna ${comunaPrestador}, Región ${regionPrestador}, en adelante "Prestador de Servicios". Ambas partes vienen en celebrar el siguiente contrato de prestación de servicios profesionales:`;
        
        doc.text(parrafo1, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, parrafo1, pageWidth - 2 * margin) + 20;

        // Cláusula Primera - Servicios
        const tituloServicio = document.getElementById('tituloServicio').value;
        const descripcionServicios = document.getElementById('descripcionServicios').value;

        const clausula1 = `PRIMERO: ${razonSocialEmpresa} contrata a don ${nombrePrestador}, quien se obliga a prestar el servicio profesional de "${tituloServicio}" para la Empresa Contratante, dicho servicio que se prestará a honorarios. ${descripcionServicios}`;
        
        doc.text(clausula1, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausula1, pageWidth - 2 * margin) + 10;

        // Servicios específicos
        const serviciosEspecificos = document.getElementById('serviciosEspecificos').value;
        if (serviciosEspecificos && serviciosEspecificos.trim()) {
            const servicios = ConfigUtils.parseServiciosEspecificos(serviciosEspecificos);
            
            doc.text('Dentro de los servicios que le corresponden al prestador se encuentran los siguientes:', margin, y, {maxWidth: pageWidth - 2 * margin});
            y += 10;
            
            servicios.forEach((servicio, index) => {
                const servicioText = `${index + 1}. ${servicio}`;
                doc.text(servicioText, margin + 5, y, {maxWidth: pageWidth - 2 * margin - 5});
                y += this.calculateTextHeight(doc, servicioText, pageWidth - 2 * margin - 5) + 5;
            });
            y += 10;
        }

        // Verificar si necesitamos nueva página
        if (y > 180) {
            doc.addPage();
            y = 30;
        }

        // Cláusula Segunda - Independencia
        const clausula2 = `SEGUNDO: Acorde a lo convenido en la cláusula precedente, el prestador se obliga a prestar los servicios profesionales a los que se refiere el presente contrato de manera oportuna y con la calidad correspondiente, sin que exista relación alguna de subordinación o dependencia con la Empresa Contratante en el desarrollo de estos servicios, ni fiscalización, control o vinculación alguna del tipo "empleador a trabajador". En consecuencia, el Prestador del Servicio Profesional no tiene derecho a ningún otro pago o beneficio más que los honorarios profesionales estipulados en la cláusula QUINTA.`;
        
        doc.text(clausula2, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausula2, pageWidth - 2 * margin) + 15;

        // Cláusula Tercera - Libertad de horarios
        const clausula3 = `TERCERO: Del mismo modo, el Prestador del Servicio Profesional no se encuentra sujeto al cumplimiento de horarios, pudiendo prestar servicios en su propio domicilio o en un lugar libremente elegido por él o bien a través de internet, videoconferencia u otro medio tecnológico.`;
        
        doc.text(clausula3, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausula3, pageWidth - 2 * margin) + 15;

        // Cláusula Cuarta - Duración
        const duracionMeses = document.getElementById('duracionMeses').value;
        const renovacionAutomatica = document.getElementById('renovacionAutomatica').value;
        
        let renovacionText = 'plazo que podrá ser renovado previo acuerdo entre las partes, mediante la suscripción de un nuevo contrato o bien un anexo al presente documento';
        if (renovacionAutomatica === 'si') {
            renovacionText = 'con renovación automática por períodos iguales, salvo aviso contrario de cualquiera de las partes con 30 días de anticipación';
        }

        const clausula4 = `CUARTO: El presente contrato de prestación de servicios tendrá una duración de ${duracionMeses} meses, contada desde la fecha de suscripción del presente contrato, ${renovacionText}.`;
        
        doc.text(clausula4, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausula4, pageWidth - 2 * margin) + 15;

        // Verificar si necesitamos nueva página
        if (y > 160) {
            doc.addPage();
            y = 30;
        }

        // Cláusula Quinta - Honorarios
        const valorHonorario = document.getElementById('valorHonorario').value;
        const valorPalabras = document.getElementById('valorPalabras').value;
        const tipoHonorario = document.getElementById('tipoHonorario').value;
        const condicionesPago = document.getElementById('condicionesPago').value;
        const diaPago = document.getElementById('diaPago').value;

        const modalidadTexto = ConfigUtils.getTipoHonorarioDescription(tipoHonorario);
        const diaTexto = ConfigUtils.getDiaPagoDescription(diaPago);

        const clausula5 = `QUINTO: Por la prestación de servicios acordada en la forma establecida en este contrato, se conviene en pagar por parte de la Empresa contratante, a título de honorarios profesionales, la suma de $${valorHonorario} (${valorPalabras} pesos) BRUTO, ${modalidadTexto}. La expresada cantidad se pagará ${condicionesPago}, realizándose la liquidación de honorarios profesionales ${diaTexto}. Además deberá enviar a la Empresa contratante una relación con los servicios efectivamente ejecutados señalando su grado de ejecución.`;
        
        doc.text(clausula5, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, clausula5, pageWidth - 2 * margin) + 15;

        // Cláusulas opcionales
        this.addOptionalClauses(doc, y, margin, pageWidth);

        // Comunicaciones
        this.addCommunicationsSection(doc, y + 40, margin, pageWidth);
        
        // Sección de firmas
        this.addSignatureSection(doc, y + 80);
        
        this.addDigitalWatermark(doc);
    }

    addOptionalClauses(doc, startY, margin, pageWidth) {
        let y = startY;
        
        const incluyeConfidencialidad = document.getElementById('incluyeConfidencialidad').value;
        const incluyeNoCompetencia = document.getElementById('incluyeNoCompetencia').value;
        const multaIncumplimiento = document.getElementById('multaIncumplimiento').value;
        const incluyeArbitraje = document.getElementById('incluyeArbitraje').value;

        let clausulaNumber = 6;

        // Cláusula de confidencialidad
        if (incluyeConfidencialidad === 'si') {
            if (y > 200) {
                doc.addPage();
                y = 30;
            }
            
            const clausulaConfidencialidad = `${this.numberToOrdinal(clausulaNumber)}: Durante toda la vigencia del presente contrato y después de terminado, de forma indefinida, el Prestador del Servicio Profesional se compromete a mantener en completa reserva toda información que llegue a su conocimiento, directa o indirectamente, respecto a los negocios o asuntos, de cualquier naturaleza que sean, de la empresa, de sus clientes, proveedores o de cualquier tercero que tenga relaciones comerciales con la Empresa Contratante.`;
            
            doc.text(clausulaConfidencialidad, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, clausulaConfidencialidad, pageWidth - 2 * margin) + 15;
            clausulaNumber++;
        }

        // Cláusula de no competencia
        if (incluyeNoCompetencia === 'si') {
            if (y > 200) {
                doc.addPage();
                y = 30;
            }
            
            const clausulaNoCompetencia = `${this.numberToOrdinal(clausulaNumber)}: Durante toda la vigencia del presente contrato y después de terminado, de forma indefinida, queda prohibido al Prestador del Servicio Profesional convertirse en competidor directo de la Empresa Contratante, ya sea de forma independiente o como empresa.`;
            
            doc.text(clausulaNoCompetencia, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, clausulaNoCompetencia, pageWidth - 2 * margin) + 15;
            clausulaNumber++;
        }

        // Cláusula de multa
        if (multaIncumplimiento && parseFloat(multaIncumplimiento) > 0) {
            if (y > 200) {
                doc.addPage();
                y = 30;
            }
            
            const clausulaMulta = `${this.numberToOrdinal(clausulaNumber)}: El incumplimiento de las obligaciones contenidas en las cláusulas anteriores, dará derecho a la Empresa Contratante a cobrar una multa por el valor equivalente en pesos a la fecha de pago, ${multaIncumplimiento} unidades de fomento, por cada incumplimiento correspondiente a confidencialidad y no competencia, indistintamente.`;
            
            doc.text(clausulaMulta, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, clausulaMulta, pageWidth - 2 * margin) + 15;
            clausulaNumber++;
        }

        // Cláusula de arbitraje
        if (incluyeArbitraje === 'si') {
            if (y > 180) {
                doc.addPage();
                y = 30;
            }
            
            const clausulaArbitraje = `${this.numberToOrdinal(clausulaNumber)}: Cualquier dificultad o controversia que se produzca entre las partes respecto de la aplicación, interpretación, duración, terminación, validez o ejecución de este contrato será sometida a arbitraje, conforme al Reglamento Procesal de Arbitraje vigente del Centro de Arbitraje y Mediación de la Cámara de Comercio de Santiago.`;
            
            doc.text(clausulaArbitraje, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, clausulaArbitraje, pageWidth - 2 * margin) + 15;
        }
    }

    addCommunicationsSection(doc, startY, margin, pageWidth) {
        const emailEmpresa = document.getElementById('emailEmpresa').value;
        const emailPrestador = document.getElementById('emailPrestador').value;
        const ciudadContrato = document.getElementById('ciudadContrato').value;

        const comunicaciones = `Se señalan los siguientes correos electrónicos para las comunicaciones que se generen con ocasión del presente contrato:\n\n• Empresa Contratante: ${emailEmpresa}\n• Prestador de Servicios: ${emailPrestador}\n\nLas partes fijan domicilio en la ciudad de ${ciudadContrato} para todos los efectos legales de este contrato.`;
        
        doc.text(comunicaciones, margin, startY, {maxWidth: pageWidth - 2 * margin});
    }

    numberToOrdinal(number) {
        const ordinals = [
            '', 'PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO',
            'SEXTO', 'SÉPTIMO', 'OCTAVO', 'NOVENO', 'DÉCIMO',
            'DÉCIMO PRIMERO', 'DÉCIMO SEGUNDO', 'DÉCIMO TERCERO'
        ];
        return ordinals[number] || `${number}°`;
    }

    addSignatureSection(doc, y) {
        console.log('📄 Agregando sección de firmas al PDF...');
        
        const leftX = 60;  // Posición para empresa
        const rightX = 150; // Posición para prestador
        
        // Líneas de firma
        doc.line(leftX - 25, y, leftX + 25, y);
        doc.line(rightX - 25, y, rightX + 25, y);
        y += 8;
        
        // Nombres
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        const nombreRepresentante = document.getElementById('nombreRepresentante').value;
        const nombrePrestador = document.getElementById('nombrePrestador').value;
        
        doc.text(nombreRepresentante, leftX, y, { align: 'center' });
        doc.text(nombrePrestador, rightX, y, { align: 'center' });
        y += 6;
        
        // Roles
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('EMPRESA CONTRATANTE', leftX, y, { align: 'center' });
        doc.text('PRESTADOR DE SERVICIOS', rightX, y, { align: 'center' });
        y += 8;
        
        // Información adicional
        const rutRepresentante = document.getElementById('rutRepresentante').value;
        const rutPrestador = document.getElementById('rutPrestador').value;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.text(`RUT N° ${rutRepresentante}`, leftX, y, { align: 'center' });
        doc.text(`RUT N° ${rutPrestador}`, rightX, y, { align: 'center' });
        
        // Agregar firmas digitales si existen
        if (window.firmaProcessor) {
            try {
                const firmaEmpresa = window.firmaProcessor.getSignatureForPDF('empresa');
                const firmaPrestador = window.firmaProcessor.getSignatureForPDF('prestador');
                
                if (firmaEmpresa) {
                    doc.addImage(firmaEmpresa, 'PNG', leftX - 25, y - 30, 50, 20);
                    console.log('✅ Firma de la empresa agregada al PDF');
                }
                
                if (firmaPrestador) {
                    doc.addImage(firmaPrestador, 'PNG', rightX - 25, y - 30, 50, 20);
                    console.log('✅ Firma del prestador agregada al PDF');
                }
                
                if (firmaEmpresa || firmaPrestador) {
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
        const nombrePrestador = document.getElementById('nombrePrestador').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const razonSocialEmpresa = document.getElementById('razonSocialEmpresa').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const timestamp = new Date().toISOString().slice(0, 10);
        return `Contrato_Honorarios_${nombrePrestador}_${razonSocialEmpresa}_${timestamp}.pdf`;
    }

    validateFormWithSignatures() {
        const emptyFields = [];
        
        // Campos mínimos requeridos
        const requiredFields = [
            'ciudadContrato', 'fechaContrato',
            'razonSocialEmpresa', 'rutEmpresa', 'giroComercial', 'comunaEmpresa', 'domicilioEmpresa', 'regionEmpresa', 'emailEmpresa',
            'nombreRepresentante', 'rutRepresentante', 'nacionalidadRepresentante', 'estadoCivilRepresentante',
            'nombrePrestador', 'rutPrestador', 'nacionalidadPrestador', 'estadoCivilPrestador', 'profesionPrestador',
            'tituloServicio', 'tipoHonorario', 'valorHonorario', 'diaPago'
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
        const rutRepresentante = document.getElementById('rutRepresentante').value;
        const rutPrestador = document.getElementById('rutPrestador').value;
        
        if (rutEmpresa && !ConfigUtils.validateRUT(rutEmpresa)) {
            issues.push('RUT de la empresa inválido');
        }
        
        if (rutRepresentante && !ConfigUtils.validateRUT(rutRepresentante)) {
            issues.push('RUT del representante inválido');
        }
        
        if (rutPrestador && !ConfigUtils.validateRUT(rutPrestador)) {
            issues.push('RUT del prestador inválido');
        }

        // Validar emails
        const emailEmpresa = document.getElementById('emailEmpresa').value;
        const emailPrestador = document.getElementById('emailPrestador').value;
        
        if (emailEmpresa && !ConfigUtils.validateEmail(emailEmpresa)) {
            issues.push('Email de la empresa inválido');
        }
        
        if (emailPrestador && !ConfigUtils.validateEmail(emailPrestador)) {
            issues.push('Email del prestador inválido');
        }
        
        // Validar fechas
        const fechaContrato = document.getElementById('fechaContrato').value;
        if (fechaContrato && !ConfigUtils.validateDate(fechaContrato)) {
            issues.push('Fecha del contrato inválida');
        }
        
        // Validar honorarios
        const valorHonorario = document.getElementById('valorHonorario').value;
        if (valorHonorario && !ConfigUtils.validateHonorarioAmount(valorHonorario)) {
            issues.push('Monto de honorario inválido');
        }
        
        if (!systemState.firmasDigitales.empresa) {
            issues.push('Falta firma digital de la empresa');
        }
        
        if (!systemState.firmasDigitales.prestador) {
            issues.push('Falta firma digital del prestador');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

// ===== CLASE PROCESADOR DE FIRMAS DIGITALES ADAPTADA =====
class FirmaDigitalProcessor {
    constructor() {
        this.processedImageData = null;
        this.currentType = null;
        this.firmasDigitales = {
            empresa: null,
            prestador: null
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
            
            if (window.contratoHonorariosSystem) {
                window.contratoHonorariosSystem.updateProgress();
            }
            
            this.closeModal();
            
            if (window.contratoHonorariosSystem) {
                window.contratoHonorariosSystem.showNotification(`Firma digital ${this.currentType === 'empresa' ? 'de la empresa' : 'del prestador'} aplicada correctamente`, 'success');
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
        this.firmasDigitales.empresa = null;
        this.firmasDigitales.prestador = null;
        
        systemState.firmasDigitales = { empresa: false, prestador: false };
        
        const buttonIds = ['firmaEmpresa', 'firmaPrestador'];
        buttonIds.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.classList.remove('signed');
                const textElement = button.querySelector('.signature-text');
                if (textElement) {
                    textElement.textContent = 'FIRMA DIGITAL';
                }
            }
        });
        
        const placeholderIds = ['signaturePlaceholderEmpresa', 'signaturePlaceholderPrestador'];
        const previewIds = ['signaturePreviewEmpresa', 'signaturePreviewPrestador'];
        
        placeholderIds.forEach((placeholderId, index) => {
            const placeholder = document.getElementById(placeholderId);
            const preview = document.getElementById(previewIds[index]);
            
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

// ===== CLASE PROCESADOR DE FOTOS CARNET ADAPTADA =====
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
        
        if (window.contratoHonorariosSystem) {
            window.contratoHonorariosSystem.showNotification(errorMessage, 'error');
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
            
            if (window.contratoHonorariosSystem) {
                window.contratoHonorariosSystem.showNotification(`Foto del ${this.currentStep} capturada`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            if (window.contratoHonorariosSystem) {
                window.contratoHonorariosSystem.showNotification('Error al capturar la foto', 'error');
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
            if (window.contratoHonorariosSystem) {
                window.contratoHonorariosSystem.showNotification('Ahora capture el reverso del carnet', 'info');
            }
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            this.currentStep = 'completed';
            this.showSummary();
            if (window.contratoHonorariosSystem) {
                window.contratoHonorariosSystem.showNotification('Ambas fotos capturadas', 'success');
            }
        }
    }

    restartProcess() {
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        if (window.contratoHonorariosSystem) {
            window.contratoHonorariosSystem.showNotification('Proceso reiniciado', 'info');
        }
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            if (window.contratoHonorariosSystem) {
                window.contratoHonorariosSystem.showNotification('Faltan fotos por capturar', 'error');
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
            
            if (window.contratoHonorariosSystem) {
                window.contratoHonorariosSystem.updateProgress();
            }

            this.closeModal();
            
            if (window.contratoHonorariosSystem) {
                window.contratoHonorariosSystem.showNotification(`Carnet completo ${this.currentType === 'empresa' ? 'de la empresa' : 'del prestador'} guardado`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al confirmar fotos:', error);
            if (window.contratoHonorariosSystem) {
                window.contratoHonorariosSystem.showNotification('Error al procesar las fotos', 'error');
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
        const types = ['empresa', 'prestador'];
        types.forEach(type => {
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
    if (window.contratoHonorariosSystem) {
        window.contratoHonorariosSystem.clearForm();
    }
};

window.generatePDF = function() {
    if (window.contratoHonorariosSystem) {
        window.contratoHonorariosSystem.generatePDF();
    }
};

// ===== INICIALIZACIÓN DEL SISTEMA =====
let contratoHonorariosSystem;

function initializeContratoHonorariosSystem() {
    console.log('📋 Iniciando Sistema de Contrato de Prestación de Servicios a Honorarios...');
    
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined') {
        console.warn('⚠️ jsPDF no está disponible, esperando...');
        setTimeout(initializeContratoHonorariosSystem, 1000);
        return;
    }
    
    // Verificar que CONFIG esté disponible
    if (typeof CONFIG === 'undefined') {
        console.warn('⚠️ CONFIG no está disponible, esperando...');
        setTimeout(initializeContratoHonorariosSystem, 1000);
        return;
    }
    
    try {
        contratoHonorariosSystem = new ContratoHonorariosSystem();
        window.contratoHonorariosSystem = contratoHonorariosSystem;
        
        console.log('✅ Sistema completamente inicializado');
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        setTimeout(initializeContratoHonorariosSystem, 2000);
    }
}

// ===== MÚLTIPLES PUNTOS DE INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContratoHonorariosSystem);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initializeContratoHonorariosSystem, 500);
}

window.addEventListener('load', () => {
    if (!window.contratoHonorariosSystem) {
        console.log('🔄 Inicialización de respaldo activada');
        setTimeout(initializeContratoHonorariosSystem, 1000);
    }
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', (event) => {
    console.error('❌ Error global capturado:', event.error);
    
    if (window.contratoHonorariosSystem) {
        window.contratoHonorariosSystem.showNotification(
            'Se detectó un error. El sistema intentará recuperarse automáticamente.', 
            'warning'
        );
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
    
    if (window.contratoHonorariosSystem) {
        window.contratoHonorariosSystem.showNotification(
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
console.log('📜 Sistema de Contrato de Prestación de Servicios a Honorarios - Script principal cargado correctamente');