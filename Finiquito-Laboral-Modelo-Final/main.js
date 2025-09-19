// ========================================
// 📋 SISTEMA PRINCIPAL DE FINIQUITO LABORAL MODELO FINAL 2
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'nombreEmpresa',
        'rutEmpresa',
        'nombreRepresentante',
        'rutRepresentante',
        'calleEmpresa',
        'comunaEmpresa',
        'ciudadEmpresa',
        'nombreTrabajador',
        'rutTrabajador',
        'calleTrabajador',
        'comunaTrabajador',
        'fechaInicio',
        'fechaTermino',
        'causalTerminacion',
        'articulosCodigo',
        'observacionesContrato',
        'montoTotal',
        'montoEnPalabras',
        'detalleLiquidacion',
        'formaPago',
        'serieCheque',
        'numeroCheque',
        'bancoEmisor',
        'nombreMinistroFe',
        'rutMinistroFe',
        'cargoMinistroFe',
        'fechaFiniquito',
        'lugarFiniquito',
        'declaracionPensiones',
        'declaracionCompleta',
        'declaracionRenuncia'
    ],
    
    firmasDigitales: {
        otorgante: false
    },
    
    fotosCarnet: {
        otorgante: {
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
class FiniquitoLaboralSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Finiquito Laboral...');
        
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
            'firmaOtorgante', 'photoOtorgante',
            'progressFill', 'progressText', 'themeToggle',
            'formaPago', 'fechaFiniquito'
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
        // Validación RUT Empresa
        const rutEmpresa = document.getElementById('rutEmpresa');
        if (rutEmpresa) {
            rutEmpresa.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutEmpresa');
            });
        }

        // Validación RUT Representante
        const rutRepresentante = document.getElementById('rutRepresentante');
        if (rutRepresentante) {
            rutRepresentante.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutRepresentante');
            });
        }

        // Validación RUT Trabajador
        const rutTrabajador = document.getElementById('rutTrabajador');
        if (rutTrabajador) {
            rutTrabajador.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutTrabajador');
            });
        }

        // Validación RUT Ministro de Fe
        const rutMinistroFe = document.getElementById('rutMinistroFe');
        if (rutMinistroFe) {
            rutMinistroFe.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutMinistroFe');
            });
        }

        // Configurar fecha por defecto (hoy)
        const fechaFiniquito = document.getElementById('fechaFiniquito');
        if (fechaFiniquito && !fechaFiniquito.value) {
            const today = new Date();
            fechaFiniquito.value = today.toISOString().split('T')[0];
        }

        // Auto-cálculo de monto en palabras
        const montoTotal = document.getElementById('montoTotal');
        if (montoTotal) {
            montoTotal.addEventListener('input', (e) => {
                this.updateMontoEnPalabras(e.target.value);
            });
        }
    }

    setupConditionalFields() {
        console.log('🔀 Configurando campos condicionales...');
        
        const formaPago = document.getElementById('formaPago');
        if (formaPago) {
            formaPago.addEventListener('change', (e) => {
                this.toggleFormaPago(e.target.value);
                this.updatePreview();
                this.saveFormState();
            });
        }
        
        console.log('✅ Campos condicionales configurados');
    }

    toggleFormaPago(tipo) {
        const serieChequeGroup = document.getElementById('serieChequeGroup');
        const numeroChequeGroup = document.getElementById('numeroChequeGroup');
        const bancoGroup = document.getElementById('bancoGroup');
        
        // Ocultar todos primero
        if (serieChequeGroup) serieChequeGroup.style.display = 'none';
        if (numeroChequeGroup) numeroChequeGroup.style.display = 'none';
        if (bancoGroup) bancoGroup.style.display = 'none';
        
        // Mostrar campos según el tipo
        if (tipo === 'cheque') {
            if (serieChequeGroup) serieChequeGroup.style.display = 'block';
            if (numeroChequeGroup) numeroChequeGroup.style.display = 'block';
            if (bancoGroup) bancoGroup.style.display = 'block';
        }
        
        // Limpiar campos no utilizados
        this.clearUnusedPaymentFields(tipo);
    }

    clearUnusedPaymentFields(tipo) {
        if (tipo !== 'cheque') {
            // Limpiar campos de cheque
            const chequeFields = ['serieCheque', 'numeroCheque', 'bancoEmisor'];
            chequeFields.forEach(field => {
                const element = document.getElementById(field);
                if (element) element.value = '';
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

    updateMontoEnPalabras(monto) {
        const montoEnPalabrasField = document.getElementById('montoEnPalabras');
        if (montoEnPalabrasField && monto) {
            const palabras = this.numeroAPalabras(parseInt(monto));
            montoEnPalabrasField.value = palabras;
        }
    }

    numeroAPalabras(numero) {
        if (numero === 0) return 'cero pesos';
        
        const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
        const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
        const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
        
        if (numero < 10) {
            return unidades[numero] + ' pesos';
        } else if (numero < 100) {
            const decena = Math.floor(numero / 10);
            const unidad = numero % 10;
            if (decena === 1) {
                const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
                return especiales[unidad] + ' pesos';
            }
            return (decenas[decena] + (unidad > 0 ? ' y ' + unidades[unidad] : '')) + ' pesos';
        } else if (numero < 1000) {
            const centena = Math.floor(numero / 100);
            const resto = numero % 100;
            let resultado = (numero === 100 ? 'cien' : centenas[centena]);
            if (resto > 0) {
                resultado += ' ' + this.numeroAPalabras(resto).replace(' pesos', '');
            }
            return resultado + ' pesos';
        } else if (numero < 1000000) {
            const miles = Math.floor(numero / 1000);
            const resto = numero % 1000;
            let resultado = '';
            if (miles === 1) {
                resultado = 'mil';
            } else {
                resultado = this.numeroAPalabras(miles).replace(' pesos', '') + ' mil';
            }
            if (resto > 0) {
                resultado += ' ' + this.numeroAPalabras(resto).replace(' pesos', '');
            }
            return resultado + ' pesos';
        } else {
            const millones = Math.floor(numero / 1000000);
            const resto = numero % 1000000;
            let resultado = '';
            if (millones === 1) {
                resultado = 'un millón';
            } else {
                resultado = this.numeroAPalabras(millones).replace(' pesos', '') + ' millones';
            }
            if (resto > 0) {
                resultado += ' ' + this.numeroAPalabras(resto).replace(' pesos', '');
            }
            return resultado + ' pesos';
        }
    }

    updatePreview() {
        // Actualizar datos básicos
        this.updateBasicDataPreview();
        
        // Actualizar fechas
        this.updateDatesPreview();
        
        // Actualizar liquidación
        this.updateLiquidacionPreview();
        
        // Actualizar método de pago
        this.updatePaymentMethodPreview();
        
        // Actualizar datos de firma
        this.updateSignaturePreview();
        
        // Actualizar progreso
        this.updateProgress();
    }

    updateBasicDataPreview() {
        // Datos de la empresa
        const nombreEmpresa = document.getElementById('nombreEmpresa').value;
        const rutEmpresa = document.getElementById('rutEmpresa').value;
        const nombreRepresentante = document.getElementById('nombreRepresentante').value;
        const rutRepresentante = document.getElementById('rutRepresentante').value;
        const calleEmpresa = document.getElementById('calleEmpresa').value;
        const comunaEmpresa = document.getElementById('comunaEmpresa').value;
        const ciudadEmpresa = document.getElementById('ciudadEmpresa').value;
        
        // Datos del trabajador
        const nombreTrabajador = document.getElementById('nombreTrabajador').value;
        const rutTrabajador = document.getElementById('rutTrabajador').value;
        const calleTrabajador = document.getElementById('calleTrabajador').value;
        const comunaTrabajador = document.getElementById('comunaTrabajador').value;
        
        // Datos del ministro de fe
        const nombreMinistroFe = document.getElementById('nombreMinistroFe').value;
        const rutMinistroFe = document.getElementById('rutMinistroFe').value;
        
        // Actualizar vista previa
        const previews = [
            { id: 'prev_nombreEmpresa', value: nombreEmpresa },
            { id: 'prev_nombreEmpresa2', value: nombreEmpresa },
            { id: 'prev_nombreEmpresa3', value: nombreEmpresa },
            { id: 'prev_nombreEmpresa4', value: nombreEmpresa },
            { id: 'prev_rutEmpresa', value: rutEmpresa },
            { id: 'prev_nombreRepresentante', value: nombreRepresentante },
            { id: 'prev_rutRepresentante', value: rutRepresentante },
            { id: 'prev_direccionEmpresa', value: `${calleEmpresa}, ${comunaEmpresa}, ${ciudadEmpresa}` },
            { id: 'prev_nombreTrabajador', value: nombreTrabajador },
            { id: 'prev_nombreTrabajador2', value: nombreTrabajador },
            { id: 'prev_nombreTrabajador3', value: nombreTrabajador },
            { id: 'prev_nombreTrabajador4', value: nombreTrabajador },
            { id: 'prev_nombreTrabajador5', value: nombreTrabajador },
            { id: 'prev_nombreTrabajador6', value: nombreTrabajador },
            { id: 'prev_nombreTrabajador7', value: nombreTrabajador },
            { id: 'prev_rutTrabajador', value: rutTrabajador },
            { id: 'prev_direccionTrabajador', value: `${calleTrabajador}, ${comunaTrabajador}` },
            { id: 'prev_nombreMinistroFe', value: nombreMinistroFe },
            { id: 'prev_nombreTrabajadorFirma', value: nombreTrabajador },
            { id: 'prev_rutTrabajadorFirma', value: rutTrabajador },
            { id: 'prev_nombreEmpleadorFirma', value: nombreRepresentante },
            { id: 'prev_rutEmpleadorFirma', value: rutRepresentante },
            { id: 'prev_nombreMinistroFeFirma', value: nombreMinistroFe },
            { id: 'prev_rutMinistroFeFirma', value: rutMinistroFe }
        ];
        
        previews.forEach(preview => {
            const element = document.getElementById(preview.id);
            if (element) {
                element.textContent = preview.value || '_____________________';
            }
        });
    }

    updateDatesPreview() {
        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaTermino = document.getElementById('fechaTermino').value;
        const fechaFiniquito = document.getElementById('fechaFiniquito').value;
        const lugarFiniquito = document.getElementById('lugarFiniquito').value;
        const causalTerminacion = document.getElementById('causalTerminacion').value;
        const articulosCodigo = document.getElementById('articulosCodigo').value;
        
        const prevFechaInicio = document.getElementById('prev_fechaInicio');
        const prevFechaTermino = document.getElementById('prev_fechaTermino');
        const prevFechaFiniquito = document.getElementById('prev_fechaFiniquito');
        const prevLugarFiniquito = document.getElementById('prev_lugarFiniquito');
        const prevCausalTerminacion = document.getElementById('prev_causalTerminacion');
        const prevArticulosCodigo = document.getElementById('prev_articulosCodigo');
        
        if (prevFechaInicio) {
            prevFechaInicio.textContent = this.formatDateForPreview(fechaInicio);
        }
        
        if (prevFechaTermino) {
            prevFechaTermino.textContent = this.formatDateForPreview(fechaTermino);
        }
        
        if (prevFechaFiniquito) {
            prevFechaFiniquito.textContent = this.formatDateForPreview(fechaFiniquito);
        }
        
        if (prevLugarFiniquito) {
            prevLugarFiniquito.textContent = lugarFiniquito || 'Santiago';
        }
        
        if (prevCausalTerminacion) {
            const causales = {
                'mutuo_acuerdo': 'mutuo acuerdo de las partes',
                'renuncia_voluntaria': 'renuncia voluntaria del trabajador',
                'vencimiento_plazo': 'vencimiento del plazo convenido',
                'conclusion_trabajo': 'conclusión del trabajo o servicio que dio origen al contrato',
                'caso_fortuito': 'caso fortuito o fuerza mayor',
                'falta_probidad': 'falta de probidad del trabajador',
                'conducta_inmoral': 'conducta inmoral del trabajador',
                'negociaciones_prohibidas': 'negociaciones prohibidas por contrato',
                'no_concurrencia': 'no concurrencia sin causa justificada',
                'abandono_trabajo': 'abandono del trabajo',
                'actos_violencia': 'actos, omisiones o imprudencias temerarias',
                'daño_material': 'daño material causado intencionalmente',
                'incumplimiento_grave': 'incumplimiento grave de las obligaciones',
                'necesidades_empresa': 'necesidades de la empresa',
                'desahucio_empleador': 'desahucio escrito del empleador',
                'otras': 'otras causales'
            };
            prevCausalTerminacion.textContent = causales[causalTerminacion] || '_____________________';
        }
        
        if (prevArticulosCodigo) {
            prevArticulosCodigo.textContent = articulosCodigo || '______';
        }
    }

    updateLiquidacionPreview() {
        const montoTotal = document.getElementById('montoTotal').value;
        const montoEnPalabras = document.getElementById('montoEnPalabras').value;
        const detalleLiquidacion = document.getElementById('detalleLiquidacion').value;
        
        // Formatear monto con separadores de miles
        const montoFormateado = montoTotal ? parseInt(montoTotal).toLocaleString('es-CL') : '_________';
        
        const previews = [
            { id: 'prev_montoTotal', value: montoFormateado },
            { id: 'prev_montoTotal2', value: montoFormateado },
            { id: 'prev_montoEnPalabras', value: montoEnPalabras },
            { id: 'prev_montoEnPalabras2', value: montoEnPalabras },
            { id: 'prev_detalleLiquidacion', value: detalleLiquidacion }
        ];
        
        previews.forEach(preview => {
            const element = document.getElementById(preview.id);
            if (element) {
                element.textContent = preview.value || '_____________________';
            }
        });
    }

    updatePaymentMethodPreview() {
        const formaPago = document.getElementById('formaPago').value;
        const serieCheque = document.getElementById('serieCheque').value;
        const numeroCheque = document.getElementById('numeroCheque').value;
        const bancoEmisor = document.getElementById('bancoEmisor').value;
        
        const prevMetodoPago = document.getElementById('prev_metodoPago');
        
        if (prevMetodoPago) {
            let metodoPagoText = 'en dinero efectivo';
            
            if (formaPago === 'cheque') {
                metodoPagoText = `en cheque nominativo extendido a su favor, serie ${serieCheque || '______'} Nº ${numeroCheque || '______'} contra el Banco ${bancoEmisor || '______'}`;
            } else if (formaPago === 'transferencia') {
                metodoPagoText = 'mediante transferencia bancaria';
            }
            
            prevMetodoPago.textContent = metodoPagoText;
        }
    }

    updateSignaturePreview() {
        // La lógica de firmas se mantiene igual, solo cambiamos las referencias
        // Ya está manejado en los métodos de actualización básica
    }

    formatDateForPreview(dateValue) {
        if (!dateValue) return '__ de _______ del ____';
        
        try {
            const date = new Date(dateValue + 'T00:00:00');
            const day = date.getDate();
            const month = this.mesesEspanol[date.getMonth()];
            const year = date.getFullYear();
            
            return `${day} de ${month} del ${year}`;
        } catch (error) {
            return '__ de _______ del ____';
        }
    }

    updateProgress() {
        let totalFields = 0;
        let filledFields = 0;
        
        // Campos básicos requeridos
        const basicFields = [
            'nombreEmpresa', 'rutEmpresa', 'nombreRepresentante', 'rutRepresentante',
            'nombreTrabajador', 'rutTrabajador', 'fechaInicio', 'fechaTermino',
            'causalTerminacion', 'montoTotal', 'formaPago', 'nombreMinistroFe',
            'fechaFiniquito', 'lugarFiniquito'
        ];
        
        totalFields += basicFields.length;
        
        basicFields.forEach(field => {
            const element = document.getElementById(field);
            if (element && element.value && element.value.trim() !== '') {
                filledFields++;
            }
        });
        
        // Checkboxes obligatorios
        const checkboxes = ['declaracionPensiones', 'declaracionCompleta', 'declaracionRenuncia'];
        totalFields += checkboxes.length;
        
        checkboxes.forEach(field => {
            const element = document.getElementById(field);
            if (element && element.checked) {
                filledFields++;
            }
        });
        
        let bonusScore = 0;
        
        // Bonus por firma digital
        if (systemState.firmasDigitales.otorgante) bonusScore += 2;
        
        // Bonus por fotos carnet
        if (systemState.fotosCarnet.otorgante.completed) bonusScore += 1;
        
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
        
        const requiredElements = ['firmaModalOverlay', 'firmaOtorgante'];
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
        
        const btnFirmaOtorgante = document.getElementById('firmaOtorgante');
        
        if (!btnFirmaOtorgante) {
            throw new Error('Botón de firma no encontrado');
        }
        
        btnFirmaOtorgante.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('otorgante');
        });
        
        console.log('✅ Botón de firma configurado correctamente');
    }

    openSignatureModalSafe(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        const nombreTrabajador = document.getElementById('nombreTrabajador').value;
        
        if (!nombreTrabajador || !nombreTrabajador.trim()) {
            this.showNotification('Complete el nombre del trabajador antes de firmar', 'warning');
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
        
        const requiredElements = ['photoModalOverlay', 'photoOtorgante'];
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
        
        const btnPhotoOtorgante = document.getElementById('photoOtorgante');
        
        if (!btnPhotoOtorgante) {
            throw new Error('Botón de foto no encontrado');
        }
        
        btnPhotoOtorgante.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('otorgante');
        });
        
        console.log('✅ Botón de foto configurado correctamente');
    }

    openPhotoModalSafe(type) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        const nombreTrabajador = document.getElementById('nombreTrabajador').value;
        
        if (!nombreTrabajador || !nombreTrabajador.trim()) {
            this.showNotification('Complete el nombre del trabajador antes de tomar fotos', 'warning');
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
                        systemState.firmasDigitales = data.firmasDigitales || { otorgante: false };
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
                
                // Disparar evento change en formaPago para mostrar/ocultar campos
                const formaPago = document.getElementById('formaPago');
                if (formaPago && formaPago.value) {
                    formaPago.dispatchEvent(new Event('change'));
                }
                
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
        const fechaFiniquito = document.getElementById('fechaFiniquito');
        if (fechaFiniquito && !fechaFiniquito.value) {
            const today = new Date();
            fechaFiniquito.value = today.toISOString().split('T')[0];
        }
        
        // Configurar lugar por defecto
        const lugarFiniquito = document.getElementById('lugarFiniquito');
        if (lugarFiniquito && !lugarFiniquito.value) {
            lugarFiniquito.value = 'Santiago';
        }
        
        // Configurar ciudad por defecto
        const ciudadEmpresa = document.getElementById('ciudadEmpresa');
        if (ciudadEmpresa && !ciudadEmpresa.value) {
            ciudadEmpresa.value = 'Santiago';
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
                
                // Reset del formulario de pago
                this.toggleFormaPago('');
                
                systemState.firmasDigitales = { otorgante: false };
                systemState.fotosCarnet = {
                    otorgante: { 
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
                this.showNotification('PDF de Finiquito Laboral generado exitosamente', 'success');
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
        doc.text('FINIQUITO DE CONTRATO DE TRABAJO', 105, y, { align: 'center' });
        y += 8;
        
        doc.setFontSize(14);
        doc.text('Modelo Final 2', 105, y, { align: 'center' });
        y += 25;

        // Cuerpo del finiquito
        doc.setFont('times', 'normal');
        doc.setFontSize(12);

        // Párrafo inicial
        const lugarFiniquito = document.getElementById('lugarFiniquito').value || 'Santiago';
        const fechaFiniquito = document.getElementById('fechaFiniquito').value;
        const fechaFormateada = this.formatDateForPreview(fechaFiniquito);
        const nombreEmpresa = document.getElementById('nombreEmpresa').value || '_____________________';
        const rutEmpresa = document.getElementById('rutEmpresa').value || '______________';
        const nombreRepresentante = document.getElementById('nombreRepresentante').value || '_____________________';
        const rutRepresentante = document.getElementById('rutRepresentante').value || '______________';
        const direccionEmpresa = this.buildDireccionEmpresa();
        const nombreTrabajador = document.getElementById('nombreTrabajador').value || '_____________________';
        const rutTrabajador = document.getElementById('rutTrabajador').value || '______________';
        const direccionTrabajador = this.buildDireccionTrabajador();
        
        const parrafoInicial = `En ${lugarFiniquito}, a ${fechaFormateada}, entre ${nombreEmpresa}, R.U.T. ${rutEmpresa}, en adelante, también, «la empresa» o «el empleador», representado por Don(a) ${nombreRepresentante}, R.U.T. ${rutRepresentante} ambos domiciliados en ${direccionEmpresa}, por una parte; y por la otra, don(a) ${nombreTrabajador}, R.U.T. ${rutTrabajador}, domiciliado en ${direccionTrabajador}, en adelante, también, «el trabajador(a)», se deja testimonio y se ha acordado el finiquito que consta de las siguientes cláusulas:`;
        
        const lines = doc.splitTextToSize(parrafoInicial, pageWidth - margin);
        doc.text(lines, margin, y);
        y += lines.length * 6 + 15;

        // Cláusula PRIMERO
        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaTermino = document.getElementById('fechaTermino').value;
        const causalTerminacion = this.getCausalText(document.getElementById('causalTerminacion').value);
        const articulosCodigo = document.getElementById('articulosCodigo').value || '______';
        
        doc.setFont('times', 'bold');
        doc.text('PRIMERO:', margin, y);
        doc.setFont('times', 'normal');
        
        const clausulaPrimero = ` El trabajador prestó servicios al empleador desde el ${this.formatDateForPreview(fechaInicio)} hasta el ${this.formatDateForPreview(fechaTermino)}, fecha esta última en que su contrato de trabajo ha terminado por ${causalTerminacion}, causal(es) señalada(s) en el Código del Trabajo, artículo(s) ${articulosCodigo}.`;
        
        const linesPrimero = doc.splitTextToSize(clausulaPrimero, pageWidth - margin - 30);
        doc.text(linesPrimero, margin + 30, y);
        y += linesPrimero.length * 6 + 10;

        // Verificar si necesitamos nueva página
        if (y > 200) {
            doc.addPage();
            y = 40;
        }

        // Cláusula SEGUNDO
        const montoTotal = document.getElementById('montoTotal').value;
        const montoFormateado = montoTotal ? parseInt(montoTotal).toLocaleString('es-CL') : '_________';
        const montoEnPalabras = document.getElementById('montoEnPalabras').value || '_____________________';
        
        doc.setFont('times', 'bold');
        doc.text('SEGUNDO:', margin, y);
        doc.setFont('times', 'normal');
        
        const clausulaSegundo = ` Don(a) ${nombreTrabajador} declara recibir en este acto, a su entera satisfacción, de parte de ${nombreEmpresa} la suma de $${montoFormateado} (${montoEnPalabras}), según la liquidación que se señala a continuación:`;
        
        const linesSegundo = doc.splitTextToSize(clausulaSegundo, pageWidth - margin - 30);
        doc.text(linesSegundo, margin + 30, y);
        y += linesSegundo.length * 6 + 10;

        // Detalle de liquidación
        const detalleLiquidacion = document.getElementById('detalleLiquidacion').value;
        if (detalleLiquidacion) {
            doc.setFont('courier', 'normal');
            doc.setFontSize(10);
            const linesDetalle = doc.splitTextToSize(detalleLiquidacion, pageWidth - margin - 20);
            doc.text(linesDetalle, margin + 10, y);
            doc.setFont('times', 'normal');
            doc.setFontSize(12);
            y += linesDetalle.length * 4 + 10;
        }

        // Continúar con el resto de las cláusulas...
        y = this.addRemainingClauses(doc, y, margin, pageWidth);

        // Verificar si necesitamos nueva página para firmas
        if (y > 200) {
            doc.addPage();
            y = 40;
        }

        // Sección de firma
        this.addSignatureSection(doc, y);
        
        this.addDigitalWatermark(doc);
    }

    buildDireccionEmpresa() {
        const calle = document.getElementById('calleEmpresa').value;
        const comuna = document.getElementById('comunaEmpresa').value;
        const ciudad = document.getElementById('ciudadEmpresa').value;
        
        return `${calle || '_______'}, ${comuna || '_______'}, ${ciudad || '_______'}`;
    }

    buildDireccionTrabajador() {
        const calle = document.getElementById('calleTrabajador').value;
        const comuna = document.getElementById('comunaTrabajador').value;
        
        return `${calle || '_______'}, ${comuna || '_______'}`;
    }

    getCausalText(causal) {
        const causales = {
            'mutuo_acuerdo': 'mutuo acuerdo de las partes',
            'renuncia_voluntaria': 'renuncia voluntaria del trabajador',
            'vencimiento_plazo': 'vencimiento del plazo convenido',
            'conclusion_trabajo': 'conclusión del trabajo o servicio que dio origen al contrato',
            'caso_fortuito': 'caso fortuito o fuerza mayor',
            'falta_probidad': 'falta de probidad del trabajador',
            'conducta_inmoral': 'conducta inmoral del trabajador',
            'negociaciones_prohibidas': 'negociaciones prohibidas por contrato',
            'no_concurrencia': 'no concurrencia sin causa justificada',
            'abandono_trabajo': 'abandono del trabajo',
            'actos_violencia': 'actos, omisiones o imprudencias temerarias',
            'daño_material': 'daño material causado intencionalmente',
            'incumplimiento_grave': 'incumplimiento grave de las obligaciones',
            'necesidades_empresa': 'necesidades de la empresa',
            'desahucio_empleador': 'desahucio escrito del empleador',
            'otras': 'otras causales'
        };
        return causales[causal] || '_____________________';
    }

    addRemainingClauses(doc, y, margin, pageWidth) {
        const nombreTrabajador = document.getElementById('nombreTrabajador').value || '_____________________';
        const nombreEmpresa = document.getElementById('nombreEmpresa').value || '_____________________';
        const montoTotal = document.getElementById('montoTotal').value;
        const montoFormateado = montoTotal ? parseInt(montoTotal).toLocaleString('es-CL') : '_________';
        const montoEnPalabras = document.getElementById('montoEnPalabras').value || '_____________________';
        const metodoPago = this.getMetodoPagoText();
        const nombreMinistroFe = document.getElementById('nombreMinistroFe').value || '_____________________';
        
        // Cláusula TERCERO
        doc.setFont('times', 'bold');
        doc.text('TERCERO:', margin, y);
        doc.setFont('times', 'normal');
        
        const clausulaTercero = ` En consecuencia, el empleador paga a don(a) ${nombreTrabajador} ${metodoPago} la suma de $ ${montoFormateado} (${montoEnPalabras}), que el trabajador declara recibir en este acto a su entera satisfacción. Las partes dejan constancia que la referida suma cubre el total de haberes especificados en la liquidación señalada en el numerando SEGUNDO del presente finiquito.`;
        
        const linesTercero = doc.splitTextToSize(clausulaTercero, pageWidth - margin - 30);
        doc.text(linesTercero, margin + 30, y);
        y += linesTercero.length * 6 + 10;

        // Cláusula CUARTO
        doc.setFont('times', 'bold');
        doc.text('CUARTO:', margin, y);
        doc.setFont('times', 'normal');
        
        const clausulaCuarto = ` Don(a) ${nombreTrabajador} deja constancia que durante el tiempo que prestó servicios a ${nombreEmpresa}, recibió oportunamente el total de las remuneraciones, beneficios y demás prestaciones convenidas de acuerdo a su contrato de trabajo, clase de trabajo ejecutado y disposiciones legales pertinentes, y que en tal virtud el empleador nada le adeuda por tales conceptos, ni por horas extraordinarias, asignación familiar, feriado, indemnización por años de servicios, imposiciones previsionales, así como por ningún otro concepto, ya sea legal o contractual, derivado de la prestación de sus servicios, de su contrato de trabajo o de la terminación del mismo.`;
        
        const linesCuarto = doc.splitTextToSize(clausulaCuarto, pageWidth - margin - 30);
        doc.text(linesCuarto, margin + 30, y);
        y += linesCuarto.length * 6 + 10;

        // Verificar si necesitamos nueva página
        if (y > 180) {
            doc.addPage();
            y = 40;
        }

        // Párrafo final
        const parrafoFinal = `Para constancia, las partes firman el presente finiquito en tres ejemplares, quedando uno en poder de cada una de ellas, y en cumplimiento de la legislación vigente, Don(a) ${nombreTrabajador} lo lee, firma y lo ratifica ante ${nombreMinistroFe}.`;
        
        const linesFinal = doc.splitTextToSize(parrafoFinal, pageWidth - margin);
        doc.text(linesFinal, margin, y);
        y += linesFinal.length * 6 + 20;

        return y;
    }

    getMetodoPagoText() {
        const formaPago = document.getElementById('formaPago').value;
        const serieCheque = document.getElementById('serieCheque').value;
        const numeroCheque = document.getElementById('numeroCheque').value;
        const bancoEmisor = document.getElementById('bancoEmisor').value;
        
        if (formaPago === 'cheque') {
            return `en cheque nominativo extendido a su favor, serie ${serieCheque || '______'} Nº ${numeroCheque || '______'} contra el Banco ${bancoEmisor || '______'},`;
        } else if (formaPago === 'transferencia') {
            return 'mediante transferencia bancaria,';
        }
        return 'en dinero efectivo,';
    }

    addSignatureSection(doc, y) {
        console.log('📄 Agregando sección de firmas al PDF...');
        
        // Verificar si necesitamos nueva página
        if (y > 180) {
            doc.addPage();
            y = 40;
        }

        const nombreTrabajador = document.getElementById('nombreTrabajador').value || '_____________________';
        const rutTrabajador = document.getElementById('rutTrabajador').value || '______________';
        const nombreRepresentante = document.getElementById('nombreRepresentante').value || '_____________________';
        const rutRepresentante = document.getElementById('rutRepresentante').value || '______________';
        const nombreMinistroFe = document.getElementById('nombreMinistroFe').value || '_____________________';
        const rutMinistroFe = document.getElementById('rutMinistroFe').value || '______________';
        
        // Firmas del trabajador y empleador (lado a lado)
        const leftX = 50;
        const rightX = 130;
        const lineWidth = 50;
        
        // Líneas de firma
        doc.line(leftX, y, leftX + lineWidth, y);
        doc.line(rightX, y, rightX + lineWidth, y);
        y += 8;
        
        // Nombres
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.text(nombreTrabajador, leftX + lineWidth/2, y, { align: 'center' });
        doc.text(nombreRepresentante, rightX + lineWidth/2, y, { align: 'center' });
        y += 6;
        
        // Roles
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('TRABAJADOR', leftX + lineWidth/2, y, { align: 'center' });
        doc.text('EMPLEADOR', rightX + lineWidth/2, y, { align: 'center' });
        y += 6;
        
        doc.text(`RUT ${rutTrabajador}`, leftX + lineWidth/2, y, { align: 'center' });
        doc.text(`RUT ${rutRepresentante}`, rightX + lineWidth/2, y, { align: 'center' });
        y += 20;
        
        // Firma del Ministro de Fe (centrada)
        const centerX = 105;
        doc.line(centerX - lineWidth/2, y, centerX + lineWidth/2, y);
        y += 8;
        
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.text(nombreMinistroFe, centerX, y, { align: 'center' });
        y += 6;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('MINISTRO DE FE', centerX, y, { align: 'center' });
        y += 6;
        
        doc.text(`RUT ${rutMinistroFe}`, centerX, y, { align: 'center' });
        
        // Agregar firma digital si existe
        if (window.firmaProcessor) {
            try {
                const firmaOtorgante = window.firmaProcessor.getSignatureForPDF('otorgante');
                
                if (firmaOtorgante) {
                    doc.addImage(firmaOtorgante, 'PNG', leftX, y - 35, 50, 20);
                    console.log('✅ Firma del trabajador agregada al PDF');
                    
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

    generateFileName() {
        const nombreTrabajador = document.getElementById('nombreTrabajador').value;
        const nombreEmpresa = document.getElementById('nombreEmpresa').value;
        let nombreArchivo = 'FiniquitoLaboral_';
        
        if (nombreTrabajador) {
            nombreArchivo += nombreTrabajador.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
        } else if (nombreEmpresa) {
            nombreArchivo += nombreEmpresa.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
        }
        
        const timestamp = new Date().toISOString().slice(0, 10);
        return `${nombreArchivo}_${timestamp}.pdf`;
    }

    validateFormWithSignature() {
        const emptyFields = [];
        
        // Campos básicos requeridos
        const basicRequiredFields = [
            'nombreEmpresa', 'rutEmpresa', 'nombreRepresentante', 'rutRepresentante',
            'nombreTrabajador', 'rutTrabajador', 'fechaInicio', 'fechaTermino',
            'causalTerminacion', 'montoTotal', 'formaPago', 'nombreMinistroFe',
            'fechaFiniquito', 'lugarFiniquito'
        ];
        
        basicRequiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element || !element.value.trim()) {
                emptyFields.push(field);
            }
        });
        
        // Validar checkboxes obligatorios
        const declaracionPensiones = document.getElementById('declaracionPensiones');
        const declaracionCompleta = document.getElementById('declaracionCompleta');
        const declaracionRenuncia = document.getElementById('declaracionRenuncia');
        
        if (!declaracionPensiones || !declaracionPensiones.checked) {
            emptyFields.push('declaracionPensiones');
        }
        
        if (!declaracionCompleta || !declaracionCompleta.checked) {
            emptyFields.push('declaracionCompleta');
        }
        
        if (!declaracionRenuncia || !declaracionRenuncia.checked) {
            emptyFields.push('declaracionRenuncia');
        }
        
        const issues = [];
        
        if (emptyFields.length > 0) {
            issues.push(`Complete ${emptyFields.length} campos faltantes`);
        }
        
        // Validaciones específicas de RUT
        const rutsToValidate = ['rutEmpresa', 'rutRepresentante', 'rutTrabajador', 'rutMinistroFe'];
        
        rutsToValidate.forEach(rutField => {
            const element = document.getElementById(rutField);
            if (element && element.value && !ConfigUtils.validateRUT(element.value)) {
                issues.push(`${rutField.replace('rut', 'RUT ')} inválido`);
            }
        });
        
        if (!systemState.firmasDigitales.otorgante) {
            issues.push('Falta firma digital del trabajador');
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

// ===== PROCESADORES DE FIRMAS Y FOTOS (REUTILIZADOS) =====
class FirmaDigitalProcessor {
    constructor() {
        this.processedImageData = null;
        this.currentType = null;
        this.firmasDigitales = {
            otorgante: null
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
            
            if (window.finiquitoLaboralSystem) {
                window.finiquitoLaboralSystem.updateProgress();
            }
            
            this.closeModal();
            
            if (window.finiquitoLaboralSystem) {
                window.finiquitoLaboralSystem.showNotification(`Firma digital del ${this.currentType} aplicada correctamente`, 'success');
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
        this.firmasDigitales.otorgante = null;
        
        systemState.firmasDigitales = { otorgante: false };
        
        const button = document.getElementById('firmaOtorgante');
        if (button) {
            button.classList.remove('signed');
            const textElement = button.querySelector('.signature-text');
            if (textElement) {
                textElement.textContent = 'FIRMA DIGITAL';
            }
        }
        
        const placeholder = document.getElementById('signaturePlaceholderOtorgante');
        const preview = document.getElementById('signaturePreviewOtorgante');
        
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
        
        if (window.finiquitoLaboralSystem) {
            window.finiquitoLaboralSystem.showNotification(errorMessage, 'error');
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
            
            if (window.finiquitoLaboralSystem) {
                window.finiquitoLaboralSystem.showNotification(`Foto del ${this.currentStep} capturada`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            if (window.finiquitoLaboralSystem) {
                window.finiquitoLaboralSystem.showNotification('Error al capturar la foto', 'error');
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
            if (window.finiquitoLaboralSystem) {
                window.finiquitoLaboralSystem.showNotification('Ahora capture el reverso del carnet', 'info');
            }
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            this.currentStep = 'completed';
            this.showSummary();
            if (window.finiquitoLaboralSystem) {
                window.finiquitoLaboralSystem.showNotification('Ambas fotos capturadas', 'success');
            }
        }
    }

    restartProcess() {
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        if (window.finiquitoLaboralSystem) {
            window.finiquitoLaboralSystem.showNotification('Proceso reiniciado', 'info');
        }
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            if (window.finiquitoLaboralSystem) {
                window.finiquitoLaboralSystem.showNotification('Faltan fotos por capturar', 'error');
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
            
            if (window.finiquitoLaboralSystem) {
                window.finiquitoLaboralSystem.updateProgress();
            }

            this.closeModal();
            
            if (window.finiquitoLaboralSystem) {
                window.finiquitoLaboralSystem.showNotification(`Carnet completo del ${this.currentType} guardado`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al confirmar fotos:', error);
            if (window.finiquitoLaboralSystem) {
                window.finiquitoLaboralSystem.showNotification('Error al procesar las fotos', 'error');
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
        systemState.fotosCarnet.otorgante = {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        };
        this.updateButton('otorgante', false);
    }
}

// ===== FUNCIONES GLOBALES =====
window.clearForm = function() {
    if (window.finiquitoLaboralSystem) {
        window.finiquitoLaboralSystem.clearForm();
    }
};

window.generatePDF = function() {
    if (window.finiquitoLaboralSystem) {
        window.finiquitoLaboralSystem.generatePDF();
    }
};

// ===== INICIALIZACIÓN DEL SISTEMA =====
let finiquitoLaboralSystem;

function initializeFiniquitoLaboralSystem() {
    console.log('📋 Iniciando Sistema de Finiquito Laboral...');
    
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined') {
        console.warn('⚠️ jsPDF no está disponible, esperando...');
        setTimeout(initializeFiniquitoLaboralSystem, 1000);
        return;
    }
    
    // Verificar que CONFIG esté disponible
    if (typeof CONFIG === 'undefined') {
        console.warn('⚠️ CONFIG no está disponible, esperando...');
        setTimeout(initializeFiniquitoLaboralSystem, 1000);
        return;
    }
    
    try {
        finiquitoLaboralSystem = new FiniquitoLaboralSystem();
        window.finiquitoLaboralSystem = finiquitoLaboralSystem;
        
        console.log('✅ Sistema completamente inicializado');
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        setTimeout(initializeFiniquitoLaboralSystem, 2000);
    }
}

// ===== MÚLTIPLES PUNTOS DE INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFiniquitoLaboralSystem);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initializeFiniquitoLaboralSystem, 500);
}

window.addEventListener('load', () => {
    if (!window.finiquitoLaboralSystem) {
        console.log('🔄 Inicialización de respaldo activada');
        setTimeout(initializeFiniquitoLaboralSystem, 1000);
    }
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', (event) => {
    console.error('❌ Error global capturado:', event.error);
    
    if (window.finiquitoLaboralSystem) {
        window.finiquitoLaboralSystem.showNotification(
            'Se detectó un error. El sistema intentará recuperarse automáticamente.', 
            'warning'
        );
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
    
    if (window.finiquitoLaboralSystem) {
        window.finiquitoLaboralSystem.showNotification(
            'Error de conectividad detectado. Algunos componentes pueden funcionar de forma limitada.', 
            'warning'
        );
    }
});

// ===== LOG FINAL =====
console.log('📜 Sistema de Finiquito Laboral - Script principal cargado correctamente');