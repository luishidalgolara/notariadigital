// ========================================
// 📋 SISTEMA PRINCIPAL DE CONTRATO CASA PARTICULAR
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'regionContrato', 'comunaContrato', 'fechaContrato',
        'nombreEmpleador', 'rutEmpleador', 'domicilioEmpleador', 'comunaEmpleador', 'regionEmpleador',
        'nombreTrabajador', 'cedulaTrabajador', 'nacionalidadTrabajador', 'fechaNacimientoTrabajador', 
        'domicilioTrabajador', 'comunaTrabajador', 'regionTrabajador',
        'asistenciaEspecial', 'detalleAsistencia',
        'direccionServicio', 'numeroServicio', 'comunaServicio', 'regionServicio',
        'sueldoMensual', 'otrasPrestaciones', 'descripcionOtras', 'formaPago', 'periodoPago',
        'afpTrabajador', 'saludTrabajador', 'isapreNombre',
        'tipoRegimen', 'jornadaLaboral', 'horarioTrabajo',
        'fechaInicioServicios', 'tipoDuracion', 'fechaTermino',
        'clausulasEspeciales'
    ],
    
    checkboxFields: [
        'tareaAseo', 'tareaCocinar', 'tareaLavar', 'tareaJardineria', 'tareaChofer', 'tareaCuidadoNinos'
    ],
    
    firmasDigitales: {
        empleador: false,
        trabajador: false
    },
    
    fotosCarnet: {
        empleador: {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        },
        trabajador: {
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
class ContratoCasaParticularSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Contrato Casa Particular...');
        
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
            'firmaEmpleador', 'firmaTrabajador',
            'photoEmpleador', 'photoTrabajador',
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
        
        // Listeners para campos de texto normales
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

        // Listeners para checkboxes de tareas
        systemState.checkboxFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
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
        // Validación RUT Empleador
        const rutEmpleadorField = document.getElementById('rutEmpleador');
        if (rutEmpleadorField) {
            rutEmpleadorField.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutEmpleador');
            });
        }

        // Validación Cédula Trabajador
        const cedulaTrabajadorField = document.getElementById('cedulaTrabajador');
        if (cedulaTrabajadorField) {
            cedulaTrabajadorField.addEventListener('input', (e) => {
                this.handleCedulaInput(e, 'cedulaTrabajador');
            });
        }

        // Auto-llenar fecha actual
        const fechaContrato = document.getElementById('fechaContrato');
        if (fechaContrato && !fechaContrato.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaContrato.value = today;
        }

        // Validar sueldo
        const sueldoField = document.getElementById('sueldoMensual');
        if (sueldoField) {
            sueldoField.addEventListener('input', (e) => {
                const sueldo = parseInt(e.target.value);
                if (sueldo && sueldo < CONFIG.VALIDATION.sueldo.min) {
                    this.showNotification('El sueldo debe ser mayor al sueldo mínimo', 'warning');
                }
                this.updatePreview();
            });
        }

        // Validar fecha de nacimiento
        const fechaNacimientoField = document.getElementById('fechaNacimientoTrabajador');
        if (fechaNacimientoField) {
            fechaNacimientoField.addEventListener('blur', (e) => {
                if (e.target.value && !ConfigUtils.validateBirthDate(e.target.value)) {
                    this.showNotification('Fecha de nacimiento inválida (debe ser mayor de 16 años)', 'warning');
                }
            });
        }

        // Campo asistencia especial
        const asistenciaEspecialField = document.getElementById('asistenciaEspecial');
        if (asistenciaEspecialField) {
            asistenciaEspecialField.addEventListener('change', () => {
                this.toggleAsistenciaEspecial();
                this.updatePreview();
            });
        }

        // Campo sistema de salud
        const saludTrabajadorField = document.getElementById('saludTrabajador');
        if (saludTrabajadorField) {
            saludTrabajadorField.addEventListener('change', () => {
                this.toggleIsapreField();
                this.updatePreview();
            });
        }

        // Campo tipo de régimen
        const tipoRegimenField = document.getElementById('tipoRegimen');
        if (tipoRegimenField) {
            tipoRegimenField.addEventListener('change', () => {
                this.toggleRegimenFields();
                this.updatePreview();
            });
        }

        // Campo tipo de duración
        const tipoDuracionField = document.getElementById('tipoDuracion');
        if (tipoDuracionField) {
            tipoDuracionField.addEventListener('change', () => {
                this.toggleFechaTermino();
                this.updatePreview();
            });
        }

        // Cláusulas especiales
        const clausulasEspecialesField = document.getElementById('clausulasEspeciales');
        if (clausulasEspecialesField) {
            clausulasEspecialesField.addEventListener('input', () => {
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

    handleCedulaInput(event, fieldId) {
        const formatted = ConfigUtils.formatCedula(event.target.value);
        event.target.value = formatted;
        
        if (formatted.length >= 8) {
            const isValid = ConfigUtils.validateCedula(formatted);
            event.target.classList.toggle('cedula-valid', isValid);
            event.target.classList.toggle('cedula-invalid', !isValid);
        } else {
            event.target.classList.remove('cedula-valid', 'cedula-invalid');
        }
        
        this.updatePreview();
    }

    toggleAsistenciaEspecial() {
        const asistenciaEspecial = document.getElementById('asistenciaEspecial');
        const detalleContainer = document.getElementById('detalleAsistenciaContainer');
        
        if (asistenciaEspecial && detalleContainer) {
            if (asistenciaEspecial.value === 'si') {
                detalleContainer.style.display = 'block';
            } else {
                detalleContainer.style.display = 'none';
                const detalleField = document.getElementById('detalleAsistencia');
                if (detalleField) detalleField.value = '';
            }
        }
    }

    toggleIsapreField() {
        const saludTrabajador = document.getElementById('saludTrabajador');
        const isapreContainer = document.getElementById('isapreNombreContainer');
        
        if (saludTrabajador && isapreContainer) {
            if (saludTrabajador.value === 'isapre') {
                isapreContainer.style.display = 'block';
            } else {
                isapreContainer.style.display = 'none';
                const isapreField = document.getElementById('isapreNombre');
                if (isapreField) isapreField.value = '';
            }
        }
    }

    toggleRegimenFields() {
        const tipoRegimen = document.getElementById('tipoRegimen');
        const regimenPuertasAdentroInfo = document.getElementById('regimenPuertasAdentroInfo');
        const jornadaContainer = document.getElementById('jornadaContainer');
        const horarioContainer = document.getElementById('horarioContainer');
        
        if (tipoRegimen) {
            if (tipoRegimen.value === 'puertas-adentro') {
                if (regimenPuertasAdentroInfo) regimenPuertasAdentroInfo.style.display = 'block';
                if (jornadaContainer) jornadaContainer.style.display = 'none';
                if (horarioContainer) horarioContainer.style.display = 'none';
                
                // Limpiar campos de puertas afuera
                const jornadaField = document.getElementById('jornadaLaboral');
                const horarioField = document.getElementById('horarioTrabajo');
                if (jornadaField) jornadaField.value = '';
                if (horarioField) horarioField.value = '';
            } else if (tipoRegimen.value === 'puertas-afuera') {
                if (regimenPuertasAdentroInfo) regimenPuertasAdentroInfo.style.display = 'none';
                if (jornadaContainer) jornadaContainer.style.display = 'block';
                if (horarioContainer) horarioContainer.style.display = 'block';
            }
        }
    }

    toggleFechaTermino() {
        const tipoDuracion = document.getElementById('tipoDuracion');
        const fechaTerminoContainer = document.getElementById('fechaTerminoContainer');
        
        if (tipoDuracion && fechaTerminoContainer) {
            if (tipoDuracion.value === 'plazo-fijo') {
                fechaTerminoContainer.style.display = 'block';
            } else {
                fechaTerminoContainer.style.display = 'none';
                const fechaTerminoField = document.getElementById('fechaTermino');
                if (fechaTerminoField) fechaTerminoField.value = '';
            }
        }
    }

    updateConditionalSections() {
        // Mostrar/ocultar cláusulas especiales
        const clausulasEspeciales = document.getElementById('clausulasEspeciales');
        const clausulasEspecialesContainer = document.getElementById('clausulasEspecialesContainer');
        
        if (clausulasEspeciales && clausulasEspecialesContainer) {
            if (clausulasEspeciales.value.trim()) {
                clausulasEspecialesContainer.style.display = 'block';
            } else {
                clausulasEspecialesContainer.style.display = 'none';
            }
        }

        // Mostrar/ocultar asistencia especial en preview
        const asistenciaEspecial = document.getElementById('asistenciaEspecial');
        const asistenciaEspecialContainer = document.getElementById('asistenciaEspecialContainer');
        
        if (asistenciaEspecial && asistenciaEspecialContainer) {
            if (asistenciaEspecial.value === 'si') {
                asistenciaEspecialContainer.style.display = 'block';
            } else {
                asistenciaEspecialContainer.style.display = 'none';
            }
        }
    }

    updatePreview() {
        // Actualizar campos de texto normales
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            const preview = document.getElementById('prev_' + field);
            if (element && preview) {
                let value = element.value || '';
                
                // Formatear sueldo con separadores de miles
                if (field === 'sueldoMensual' && value) {
                    value = ConfigUtils.formatNumber(value);
                }
                
                preview.textContent = value || this.getPlaceholderText(field);
            }
        });

        // Actualizar tareas seleccionadas
        this.updateTareasPreview();
        
        this.updateDuplicateReferences();
        this.updateDatePreview();
        this.updateSignatureNames();
        this.updateConditionalSections();
        this.updateRegimenPreview();
        this.updateProgress();
    }

    updateTareasPreview() {
        const tareasSeleccionadas = ConfigUtils.getSelectedTareas();
        const tareasPreview = document.getElementById('prev_tareasSeleccionadas');
        
        if (tareasPreview) {
            if (tareasSeleccionadas.length > 0) {
                tareasPreview.textContent = tareasSeleccionadas.join(', ');
            } else {
                tareasPreview.textContent = 'Tareas por definir';
            }
        }
    }

    updateDuplicateReferences() {
        // Actualizar referencias duplicadas en el documento
        const rutEmpleador = document.getElementById('rutEmpleador').value;
        const prev_rutEmpleador2 = document.getElementById('prev_rutEmpleador2');
        if (prev_rutEmpleador2) prev_rutEmpleador2.textContent = rutEmpleador || 'XX.XXX.XXX-X';

        const cedulaTrabajador = document.getElementById('cedulaTrabajador').value;
        const prev_cedulaTrabajador2 = document.getElementById('prev_cedulaTrabajador2');
        if (prev_cedulaTrabajador2) prev_cedulaTrabajador2.textContent = cedulaTrabajador || 'XX.XXX.XXX-X';

        // Actualizar nombre de ISAPRE si aplica
        const saludTrabajador = document.getElementById('saludTrabajador').value;
        const isapreNombre = document.getElementById('isapreNombre').value;
        const prev_isapreNombre = document.getElementById('prev_isapreNombre');
        
        if (prev_isapreNombre) {
            if (saludTrabajador === 'isapre' && isapreNombre) {
                prev_isapreNombre.textContent = ` - ${isapreNombre}`;
                prev_isapreNombre.style.display = 'inline';
            } else {
                prev_isapreNombre.style.display = 'none';
            }
        }
    }

    updateDatePreview() {
        // Fecha del contrato
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

        // Fecha de nacimiento del trabajador
        const fechaNacimientoTrabajador = document.getElementById('fechaNacimientoTrabajador').value;
        const prev_fechaNacimiento = document.getElementById('prev_fechaNacimiento');
        
        if (prev_fechaNacimiento) {
            if (fechaNacimientoTrabajador && ConfigUtils.validateDate(fechaNacimientoTrabajador)) {
                const date = new Date(fechaNacimientoTrabajador);
                const dia = date.getDate();
                const mes = this.mesesEspanol[date.getMonth()];
                const anio = date.getFullYear();
                prev_fechaNacimiento.textContent = `${dia} de ${mes} de ${anio}`;
            } else {
                prev_fechaNacimiento.textContent = '__ de _______ de ____';
            }
        }

        // Fecha de inicio de servicios
        const fechaInicioServicios = document.getElementById('fechaInicioServicios').value;
        const prev_fechaInicioServicios = document.getElementById('prev_fechaInicioServicios');
        
        if (prev_fechaInicioServicios) {
            if (fechaInicioServicios && ConfigUtils.validateDate(fechaInicioServicios)) {
                const date = new Date(fechaInicioServicios);
                const dia = date.getDate();
                const mes = this.mesesEspanol[date.getMonth()];
                const anio = date.getFullYear();
                prev_fechaInicioServicios.textContent = `${dia} de ${mes} de ${anio}`;
            } else {
                prev_fechaInicioServicios.textContent = '__ de _______ de ____';
            }
        }

        // Fecha de término si aplica
        const tipoDuracion = document.getElementById('tipoDuracion').value;
        const fechaTermino = document.getElementById('fechaTermino').value;
        const fechaTerminoTexto = document.getElementById('fechaTerminoTexto');
        const prev_fechaTermino = document.getElementById('prev_fechaTermino');
        
        if (fechaTerminoTexto && prev_fechaTermino) {
            if (tipoDuracion === 'plazo-fijo') {
                fechaTerminoTexto.style.display = 'inline';
                if (fechaTermino && ConfigUtils.validateDate(fechaTermino)) {
                    const date = new Date(fechaTermino);
                    const dia = date.getDate();
                    const mes = this.mesesEspanol[date.getMonth()];
                    const anio = date.getFullYear();
                    prev_fechaTermino.textContent = `${dia} de ${mes} de ${anio}`;
                } else {
                    prev_fechaTermino.textContent = '__ de _______ de ____';
                }
            } else {
                fechaTerminoTexto.style.display = 'none';
            }
        }
    }

    updateSignatureNames() {
        const nombreEmpleador = document.getElementById('nombreEmpleador').value;
        const prev_firmaEmpleador = document.getElementById('prev_firmaEmpleador');
        if (prev_firmaEmpleador) prev_firmaEmpleador.textContent = nombreEmpleador || '_______________';

        const nombreTrabajador = document.getElementById('nombreTrabajador').value;
        const prev_firmaTrabajador = document.getElementById('prev_firmaTrabajador');
        if (prev_firmaTrabajador) prev_firmaTrabajador.textContent = nombreTrabajador || '_______________';
    }

    updateRegimenPreview() {
        const tipoRegimen = document.getElementById('tipoRegimen').value;
        const regimenPuertasAdentroTexto = document.getElementById('regimenPuertasAdentroTexto');
        const regimenPuertasAfueraTexto = document.getElementById('regimenPuertasAfueraTexto');
        
        if (regimenPuertasAdentroTexto && regimenPuertasAfueraTexto) {
            if (tipoRegimen === 'puertas-afuera') {
                regimenPuertasAdentroTexto.style.display = 'none';
                regimenPuertasAfueraTexto.style.display = 'block';
            } else {
                regimenPuertasAdentroTexto.style.display = 'block';
                regimenPuertasAfueraTexto.style.display = 'none';
            }
        }
    }

    getPlaceholderText(field) {
        const placeholders = {
            'regionContrato': '____________',
            'comunaContrato': '____________',
            'nombreEmpleador': '_________________',
            'rutEmpleador': 'xx.xxx.xxx-x',
            'domicilioEmpleador': '_________________',
            'comunaEmpleador': '_________',
            'regionEmpleador': '_________________',
            'nombreTrabajador': '_________________',
            'cedulaTrabajador': 'xx.xxx.xxx-x',
            'nacionalidadTrabajador': '_________',
            'domicilioTrabajador': '_________________',
            'comunaTrabajador': '_________',
            'regionTrabajador': '_________________',
            'direccionServicio': '_________________',
            'numeroServicio': '___',
            'comunaServicio': '_________',
            'regionServicio': '_________________',
            'sueldoMensual': 'XXX.XXX',
            'descripcionOtras': '_________________',
            'formaPago': 'dinero efectivo',
            'periodoPago': 'mensuales',
            'afpTrabajador': '_________________',
            'saludTrabajador': '_________________',
            'jornadaLaboral': '_________',
            'horarioTrabajo': '_________',
            'tipoDuracion': 'indefinida',
            'detalleAsistencia': '___________',
            'clausulasEspeciales': '_________________'
        };
        
        return placeholders[field] || '_________________';
    }

    updateProgress() {
        const requiredFields = [
            'regionContrato', 'comunaContrato', 'fechaContrato',
            'nombreEmpleador', 'rutEmpleador', 'domicilioEmpleador',
            'nombreTrabajador', 'cedulaTrabajador', 'nacionalidadTrabajador', 'fechaNacimientoTrabajador', 'domicilioTrabajador',
            'direccionServicio', 'numeroServicio', 'comunaServicio',
            'sueldoMensual', 'formaPago', 'periodoPago', 'tipoRegimen', 'fechaInicioServicios', 'tipoDuracion'
        ];
        
        let filledFields = 0;
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (element && element.value.trim() !== '') {
                filledFields++;
            }
        });
        
        // Verificar tareas seleccionadas
        if (ConfigUtils.validateTareas()) {
            filledFields++;
        }
        
        let bonusScore = 0;
        
        if (systemState.firmasDigitales.empleador) bonusScore += 0.5;
        if (systemState.firmasDigitales.trabajador) bonusScore += 0.5;
        if (systemState.fotosCarnet.empleador.completed) bonusScore += 0.25;
        if (systemState.fotosCarnet.trabajador.completed) bonusScore += 0.25;
        
        const progress = ((filledFields + bonusScore) / (requiredFields.length + 1 + 1.5)) * 100;
        
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
        
        const requiredElements = ['firmaModalOverlay', 'firmaEmpleador', 'firmaTrabajador'];
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
        
        const btnFirmaEmpleador = document.getElementById('firmaEmpleador');
        const btnFirmaTrabajador = document.getElementById('firmaTrabajador');
        
        if (!btnFirmaEmpleador || !btnFirmaTrabajador) {
            throw new Error('Botones de firma no encontrados');
        }
        
        btnFirmaEmpleador.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('empleador');
        });

        btnFirmaTrabajador.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('trabajador');
        });
        
        console.log('✅ Botones de firma configurados correctamente');
    }

    openSignatureModalSafe(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        let nombreField;
        if (type === 'empleador') {
            nombreField = document.getElementById('nombreEmpleador');
        } else {
            nombreField = document.getElementById('nombreTrabajador');
        }
        
        if (!nombreField || !nombreField.value.trim()) {
            const tipoNombre = type === 'empleador' ? 'empleador' : 'trabajador';
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
        
        const requiredElements = ['photoModalOverlay', 'photoEmpleador', 'photoTrabajador'];
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
        
        const btnPhotoEmpleador = document.getElementById('photoEmpleador');
        const btnPhotoTrabajador = document.getElementById('photoTrabajador');
        
        if (!btnPhotoEmpleador || !btnPhotoTrabajador) {
            throw new Error('Botones de foto no encontrados');
        }
        
        btnPhotoEmpleador.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('empleador');
        });

        btnPhotoTrabajador.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('trabajador');
        });
        
        console.log('✅ Botones de foto configurados correctamente');
    }

    openPhotoModalSafe(type) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        let nombreField;
        if (type === 'empleador') {
            nombreField = document.getElementById('nombreEmpleador');
        } else {
            nombreField = document.getElementById('nombreTrabajador');
        }
        
        if (!nombreField || !nombreField.value.trim()) {
            const tipoNombre = type === 'empleador' ? 'empleador' : 'trabajador';
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

        // Guardar estados de checkboxes
        systemState.checkboxFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                data[field] = element.checked;
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
                        systemState.firmasDigitales = data.firmasDigitales || { empleador: false, trabajador: false };
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
                
                // Actualizar campos dependientes
                this.toggleAsistenciaEspecial();
                this.toggleIsapreField();
                this.toggleRegimenFields();
                this.toggleFechaTermino();
                
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
        // Auto-llenar fecha actual para el contrato
        const fechaContrato = document.getElementById('fechaContrato');
        if (fechaContrato && !fechaContrato.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaContrato.value = today;
        }
        
        // Valor por defecto para región
        const regionContrato = document.getElementById('regionContrato');
        if (regionContrato && !regionContrato.value) {
            regionContrato.value = 'Región Metropolitana de Santiago';
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
                        element.classList.remove('rut-valid', 'rut-invalid', 'cedula-valid', 'cedula-invalid');
                    }
                });

                systemState.checkboxFields.forEach(field => {
                    const element = document.getElementById(field);
                    if (element) {
                        element.checked = false;
                    }
                });
                
                // Restaurar valores por defecto
                this.initializeFormFields();
                
                systemState.firmasDigitales = { empleador: false, trabajador: false };
                systemState.fotosCarnet = {
                    empleador: { 
                        frente: { captured: false, imageData: null, timestamp: null }, 
                        reverso: { captured: false, imageData: null, timestamp: null }, 
                        completed: false 
                    },
                    trabajador: { 
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

                // Resetear campos dependientes
                this.toggleAsistenciaEspecial();
                this.toggleIsapreField();
                this.toggleRegimenFields();
                this.toggleFechaTermino();
                
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
                this.showNotification('Contrato de Casa Particular PDF generado exitosamente', 'success');
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

        // Fecha y lugar
        const fechaContrato = document.getElementById('fechaContrato').value;
        const regionContrato = document.getElementById('regionContrato').value;
        const comunaContrato = document.getElementById('comunaContrato').value;

        let fechaTexto = '__ de ________ de 20__';
        if (fechaContrato && ConfigUtils.validateDate(fechaContrato)) {
            const date = new Date(fechaContrato);
            fechaTexto = `${date.getDate()} de ${this.mesesEspanol[date.getMonth()]} del año ${date.getFullYear()}`;
        }

        const ubicacionFecha = `En ${regionContrato}, ${comunaContrato}, a ${fechaTexto}`;
        doc.text(ubicacionFecha, pageWidth - 20, y, { align: 'right' });
        y += 30;

        // Títulos
        doc.setFont('times', 'bold');
        doc.setFontSize(18);
        doc.text('CONTRATO DE TRABAJO', 105, y, { align: 'center' });
        y += 10;
        doc.setFontSize(14);
        doc.text('Trabajador(a) de Casa Particular', 105, y, { align: 'center' });
        y += 30;

        // Contenido principal
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        
        // Datos de las partes
        const nombreEmpleador = document.getElementById('nombreEmpleador').value;
        const rutEmpleador = document.getElementById('rutEmpleador').value;
        const domicilioEmpleador = document.getElementById('domicilioEmpleador').value;
        const comunaEmpleador = document.getElementById('comunaEmpleador').value;
        const regionEmpleador = document.getElementById('regionEmpleador').value;
        
        const nombreTrabajador = document.getElementById('nombreTrabajador').value;
        const cedulaTrabajador = document.getElementById('cedulaTrabajador').value;
        const nacionalidadTrabajador = document.getElementById('nacionalidadTrabajador').value;
        const fechaNacimientoTrabajador = document.getElementById('fechaNacimientoTrabajador').value;
        const domicilioTrabajador = document.getElementById('domicilioTrabajador').value;
        const comunaTrabajador = document.getElementById('comunaTrabajador').value;
        const regionTrabajador = document.getElementById('regionTrabajador').value;

        let fechaNacimientoTexto = '__ de _______ de ____';
        if (fechaNacimientoTrabajador && ConfigUtils.validateDate(fechaNacimientoTrabajador)) {
            const date = new Date(fechaNacimientoTrabajador);
            fechaNacimientoTexto = `${date.getDate()} de ${this.mesesEspanol[date.getMonth()]} de ${date.getFullYear()}`;
        }

        const parrafoInicial = `Entre ${nombreEmpleador}, RUT: ${rutEmpleador}, con domicilio en ${domicilioEmpleador}, comuna de ${comunaEmpleador}, región ${regionEmpleador}, en adelante "el empleador", por una parte, y don(ña) ${nombreTrabajador}, Cédula de Identidad N° ${cedulaTrabajador}, Fecha de Nacimiento ${fechaNacimientoTexto}, con domicilio en ${domicilioTrabajador}, comuna de ${comunaTrabajador}, región ${regionTrabajador}, de nacionalidad ${nacionalidadTrabajador}, en adelante "el trabajador(a)", se conviene un contrato de trabajo cuyas cláusulas son las siguientes:`;

        doc.text(parrafoInicial, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, parrafoInicial, pageWidth - 2 * margin) + 20;

        // PRIMERO - Naturaleza de servicios
        doc.setFont('times', 'bold');
        doc.text('PRIMERO.- De la naturaleza de los servicios.', margin, y);
        y += 10;
        
        doc.setFont('times', 'normal');
        const naturalezaTexto = 'El trabajador(a) se obliga a desempeñar trabajos de asistencia propios o inherentes al hogar, de acuerdo a las instrucciones que al efecto sean impartidas por el empleador.';
        doc.text(naturalezaTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, naturalezaTexto, pageWidth - 2 * margin) + 10;

        const tareasTexto = 'Para una adecuada descripción de las obligaciones que derivan del presente contrato, las partes acuerdan que el trabajador(a) desempeñará de forma principal las siguientes tareas:';
        doc.text(tareasTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, tareasTexto, pageWidth - 2 * margin) + 10;

        const tareasSeleccionadas = ConfigUtils.getSelectedTareas();
        if (tareasSeleccionadas.length > 0) {
            tareasSeleccionadas.forEach(tarea => {
                doc.text(`• ${tarea}`, margin + 5, y);
                y += 6;
            });
            y += 10;
        }

        // Asistencia especial si aplica
        const asistenciaEspecial = document.getElementById('asistenciaEspecial').value;
        const detalleAsistencia = document.getElementById('detalleAsistencia').value;
        
        if (asistenciaEspecial === 'si' && detalleAsistencia) {
            const asistenciaTexto = `Asimismo, se tiene por expresamente convenido que el trabajador(a) deberá atender y asistir con cuidados especiales: ${detalleAsistencia}`;
            doc.text(asistenciaTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, asistenciaTexto, pageWidth - 2 * margin) + 15;
        }

        // Verificar nueva página
        if (y > 220) {
            doc.addPage();
            y = 30;
        }

        // SEGUNDO - Lugar de servicios
        doc.setFont('times', 'bold');
        doc.text('SEGUNDO.- El lugar de prestación de los servicios.', margin, y);
        y += 10;

        doc.setFont('times', 'normal');
        const direccionServicio = document.getElementById('direccionServicio').value;
        const numeroServicio = document.getElementById('numeroServicio').value;
        const comunaServicio = document.getElementById('comunaServicio').value;
        const regionServicio = document.getElementById('regionServicio').value;

        const lugarTexto = `Las partes acuerdan que los servicios deberán ser prestados en el domicilio ubicado en ${direccionServicio}, N° ${numeroServicio}, Comuna ${comunaServicio}, Región ${regionServicio}.`;
        doc.text(lugarTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, lugarTexto, pageWidth - 2 * margin) + 15;

        // TERCERO - Remuneraciones
        doc.setFont('times', 'bold');
        doc.text('TERCERO.- Del monto, forma y período de pago de las remuneraciones.', margin, y);
        y += 10;

        doc.setFont('times', 'normal');
        const remuneracionTexto = 'El trabajador(a) tendrá derecho a percibir las siguientes prestaciones a título de remuneración:';
        doc.text(remuneracionTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, remuneracionTexto, pageWidth - 2 * margin) + 10;

        const sueldoMensual = document.getElementById('sueldoMensual').value;
        const descripcionOtras = document.getElementById('descripcionOtras').value;
        
        doc.text(`a) Sueldo ascendente a: $ ${ConfigUtils.formatNumber(sueldoMensual)}.-`, margin, y);
        y += 8;
        doc.text(`b) Otras prestaciones: ${descripcionOtras || 'No aplica'}`, margin, y);
        y += 15;

        const formaPago = document.getElementById('formaPago').value;
        const periodoPago = document.getElementById('periodoPago').value;
        
        const pagoTexto = `Las remuneraciones se pagarán por períodos ${periodoPago} vencidos. El pago de la remuneración se hará en ${formaPago}.`;
        doc.text(pagoTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, pagoTexto, pageWidth - 2 * margin) + 15;

        // Verificar nueva página
        if (y > 200) {
            doc.addPage();
            y = 30;
        }

        // CUARTO - Cotizaciones
        doc.setFont('times', 'bold');
        doc.text('CUARTO.- Cotizaciones de Seguridad Social.', margin, y);
        y += 10;

        doc.setFont('times', 'normal');
        const cotizacionesTexto = 'El trabajador(a) declara encontrarse afiliado a las siguientes instituciones de seguridad social:';
        doc.text(cotizacionesTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, cotizacionesTexto, pageWidth - 2 * margin) + 10;

        const afpTrabajador = document.getElementById('afpTrabajador').value;
        const saludTrabajador = document.getElementById('saludTrabajador').value;
        const isapreNombre = document.getElementById('isapreNombre').value;
        
        doc.text(`a) AFP: ${afpTrabajador}`, margin, y);
        y += 8;
        
        let saludTexto = `b) Salud: ${saludTrabajador}`;
        if (saludTrabajador === 'isapre' && isapreNombre) {
            saludTexto += ` - ${isapreNombre}`;
        }
        doc.text(saludTexto, margin, y);
        y += 20;

        // QUINTO - Régimen de trabajo
        doc.setFont('times', 'bold');
        doc.text('QUINTO.- Régimen de Trabajo.', margin, y);
        y += 10;

        doc.setFont('times', 'normal');
        const tipoRegimen = document.getElementById('tipoRegimen').value;
        
        if (tipoRegimen === 'puertas-adentro') {
            const regimenTexto = 'El trabajador(a) prestará servicios en régimen "puertas adentro" (vive en casa del empleador). Las partes dejan constancia que, atendida la naturaleza de los servicios y considerando además que el trabajador(a) vivirá en la casa del empleador, no estará sujeto a horario, debiendo tener normalmente un descanso absoluto mínimo de 12 horas diarias. Entre el término de la jornada diaria y el inicio de la siguiente, el descanso será ininterrumpido y, normalmente, de un mínimo de 9 horas.';
            doc.text(regimenTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, regimenTexto, pageWidth - 2 * margin) + 15;
        } else {
            const jornadaLaboral = document.getElementById('jornadaLaboral').value;
            const horarioTrabajo = document.getElementById('horarioTrabajo').value;
            
            const regimenTexto = `El trabajador(a) prestará servicios en régimen "puertas afuera" (no vive en casa del empleador). Jornada: ${jornadaLaboral}. Horario: ${horarioTrabajo}.`;
            doc.text(regimenTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, regimenTexto, pageWidth - 2 * margin) + 15;
        }

        // SEXTO - Duración
        doc.setFont('times', 'bold');
        doc.text('SEXTO.- Fecha de inicio y duración del contrato.', margin, y);
        y += 10;

        doc.setFont('times', 'normal');
        const fechaInicioServicios = document.getElementById('fechaInicioServicios').value;
        const tipoDuracion = document.getElementById('tipoDuracion').value;
        
        let fechaInicioTexto = '__ de _______ de ____';
        if (fechaInicioServicios && ConfigUtils.validateDate(fechaInicioServicios)) {
            const date = new Date(fechaInicioServicios);
            fechaInicioTexto = `${date.getDate()} de ${this.mesesEspanol[date.getMonth()]} de ${date.getFullYear()}`;
        }

        let duracionTexto = `Las partes dejan constancia que el trabajador(a) comenzó a prestar servicios para el empleador con fecha ${fechaInicioTexto}. Este contrato tendrá una duración de carácter ${tipoDuracion}`;
        
        if (tipoDuracion === 'plazo-fijo') {
            const fechaTermino = document.getElementById('fechaTermino').value;
            if (fechaTermino && ConfigUtils.validateDate(fechaTermino)) {
                const date = new Date(fechaTermino);
                const fechaTerminoTexto = `${date.getDate()} de ${this.mesesEspanol[date.getMonth()]} de ${date.getFullYear()}`;
                duracionTexto += ` hasta el ${fechaTerminoTexto}`;
            }
        }
        duracionTexto += '.';

        doc.text(duracionTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, duracionTexto, pageWidth - 2 * margin) + 15;

        // SÉPTIMO - Disposiciones generales
        doc.setFont('times', 'bold');
        doc.text('SÉPTIMO.- Disposiciones generales.', margin, y);
        y += 10;

        doc.setFont('times', 'normal');
        const disposicionesTexto = 'Las partes manifiestan estar en conocimiento que se encuentra prohibido exigir al trabajador(a) el uso obligatorio de uniforme, delantal o cualquier otro distintivo o vestimenta identificadores en espacios públicos.';
        doc.text(disposicionesTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, disposicionesTexto, pageWidth - 2 * margin) + 15;

        // Cláusulas especiales si existen
        const clausulasEspeciales = document.getElementById('clausulasEspeciales').value;
        if (clausulasEspeciales && clausulasEspeciales.trim()) {
            doc.setFont('times', 'bold');
            doc.text('CLÁUSULAS ESPECIALES', margin, y);
            y += 10;
            
            doc.setFont('times', 'normal');
            doc.text(clausulasEspeciales, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, clausulasEspeciales, pageWidth - 2 * margin) + 20;
        }

        // Verificar si necesitamos nueva página para firmas
        if (y > 160) {
            doc.addPage();
            y = 30;
        }

        // Firmas
        this.addSignatureSectionContract(doc, y);
        
        // Notas legales
        y += 100;
        if (y > 220) {
            doc.addPage();
            y = 30;
        }
        
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('Nota Legal: Este contrato se rige por las disposiciones del Código del Trabajo', margin, y);
        y += 6;
        doc.text('de Chile y normativas específicas para trabajadores de casa particular.', margin, y);
        y += 10;
        doc.text('Importante: Se recomienda registrar este contrato en la Dirección del Trabajo', margin, y);
        y += 6;
        doc.text('conforme a la normativa vigente.', margin, y);
        
        this.addDigitalWatermark(doc);
    }

    addSignatureSectionContract(doc, y) {
        console.log('📄 Agregando sección de firmas al PDF...');
        
        const leftX = 60;
        const rightX = 150;
        
        // Líneas de firma
        doc.line(leftX - 25, y, leftX + 25, y);
        doc.line(rightX - 25, y, rightX + 25, y);
        y += 8;
        
        // Títulos
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.text('EMPLEADOR', leftX, y, { align: 'center' });
        doc.text('TRABAJADOR(A)', rightX, y, { align: 'center' });
        y += 8;
        
        // Nombres
        const nombreEmpleador = document.getElementById('nombreEmpleador').value;
        const nombreTrabajador = document.getElementById('nombreTrabajador').value;
        
        doc.text(nombreEmpleador, leftX, y, { align: 'center' });
        doc.text(nombreTrabajador, rightX, y, { align: 'center' });
        y += 8;
        
        // RUTs
        const rutEmpleador = document.getElementById('rutEmpleador').value;
        const cedulaTrabajador = document.getElementById('cedulaTrabajador').value;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.text(`RUT: ${rutEmpleador}`, leftX, y, { align: 'center' });
        doc.text(`RUT: ${cedulaTrabajador}`, rightX, y, { align: 'center' });
        
        // Agregar firmas digitales si existen
        if (window.firmaProcessor) {
            try {
                const firmaEmpleador = window.firmaProcessor.getSignatureForPDF('empleador');
                const firmaTrabajador = window.firmaProcessor.getSignatureForPDF('trabajador');
                
                if (firmaEmpleador) {
                    doc.addImage(firmaEmpleador, 'PNG', leftX - 25, y - 35, 50, 20);
                    console.log('✅ Firma del empleador agregada al PDF');
                }
                
                if (firmaTrabajador) {
                    doc.addImage(firmaTrabajador, 'PNG', rightX - 25, y - 35, 50, 20);
                    console.log('✅ Firma del trabajador agregada al PDF');
                }
                
                if (firmaEmpleador || firmaTrabajador) {
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
        const nombreTrabajador = document.getElementById('nombreTrabajador').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const nombreEmpleador = document.getElementById('nombreEmpleador').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '')
            .substring(0, 20);
        const timestamp = new Date().toISOString().slice(0, 10);
        return `Contrato_Casa_Particular_${nombreTrabajador}_${nombreEmpleador}_${timestamp}.pdf`;
    }

    validateFormWithSignatures() {
        const emptyFields = [];
        
        // Campos mínimos requeridos
        const requiredFields = [
            'regionContrato', 'comunaContrato', 'fechaContrato',
            'nombreEmpleador', 'rutEmpleador', 'domicilioEmpleador',
            'nombreTrabajador', 'cedulaTrabajador', 'nacionalidadTrabajador', 'fechaNacimientoTrabajador', 'domicilioTrabajador',
            'direccionServicio', 'numeroServicio', 'comunaServicio',
            'sueldoMensual', 'formaPago', 'periodoPago', 'tipoRegimen', 'fechaInicioServicios', 'tipoDuracion'
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
        
        // Verificar tareas seleccionadas
        if (!ConfigUtils.validateTareas()) {
            issues.push('Debe seleccionar al menos una tarea');
        }
        
        // Validaciones específicas
        const rutEmpleador = document.getElementById('rutEmpleador').value;
        if (rutEmpleador && !ConfigUtils.validateRUT(rutEmpleador)) {
            issues.push('RUT del empleador inválido');
        }

        const cedulaTrabajador = document.getElementById('cedulaTrabajador').value;
        if (cedulaTrabajador && !ConfigUtils.validateCedula(cedulaTrabajador)) {
            issues.push('Cédula del trabajador inválida');
        }
        
        // Validar fechas
        const fechaContrato = document.getElementById('fechaContrato').value;
        if (fechaContrato && !ConfigUtils.validateDate(fechaContrato)) {
            issues.push('Fecha del contrato inválida');
        }
        
        const fechaNacimientoTrabajador = document.getElementById('fechaNacimientoTrabajador').value;
        if (fechaNacimientoTrabajador && !ConfigUtils.validateBirthDate(fechaNacimientoTrabajador)) {
            issues.push('Fecha de nacimiento del trabajador inválida');
        }
        
        // Validar sueldo
        const sueldoMensual = document.getElementById('sueldoMensual').value;
        if (sueldoMensual && !ConfigUtils.validateSueldo(sueldoMensual)) {
            issues.push('Sueldo inválido (debe ser mayor al sueldo mínimo)');
        }
        
        if (!systemState.firmasDigitales.empleador) {
            issues.push('Falta firma digital del empleador');
        }
        
        if (!systemState.firmasDigitales.trabajador) {
            issues.push('Falta firma digital del trabajador');
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
            empleador: null,
            trabajador: null
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
            
            if (window.contratoCasaParticularSystem) {
                window.contratoCasaParticularSystem.updateProgress();
            }
            
            this.closeModal();
            
            if (window.contratoCasaParticularSystem) {
                const tipoTexto = this.currentType === 'empleador' ? 'del empleador' : 'del trabajador';
                window.contratoCasaParticularSystem.showNotification(`Firma digital ${tipoTexto} aplicada correctamente`, 'success');
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
        this.firmasDigitales = { empleador: null, trabajador: null };
        
        systemState.firmasDigitales = { empleador: false, trabajador: false };
        
        ['empleador', 'trabajador'].forEach(type => {
            const buttonId = `firma${type.charAt(0).toUpperCase() + type.slice(1)}`;
            const button = document.getElementById(buttonId);
            if (button) {
                button.classList.remove('signed');
                const textElement = button.querySelector('.signature-text');
                if (textElement) {
                    textElement.textContent = type === 'empleador' ? 'FIRMA EMPLEADOR' : 'FIRMA TRABAJADOR';
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
                if (p) p.textContent = 'Debe verse la foto, nombre y número de identificación';
                overlay.className = 'camera-overlay frente';
            } else if (this.currentStep === 'reverso') {
                if (h3) h3.textContent = 'Ahora posicione el REVERSO de su carnet';
                if (p) p.textContent = 'Debe verse la información adicional claramente';
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
                if (p) p.textContent = 'Verifique que se vea la información principal';
                if (span) span.textContent = 'Continuar al Reverso';
            } else if (this.currentStep === 'reverso') {
                if (h3) h3.textContent = 'Vista previa del REVERSO';
                if (p) p.textContent = 'Verifique que se vea la información adicional';
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
        
        if (window.contratoCasaParticularSystem) {
            window.contratoCasaParticularSystem.showNotification(errorMessage, 'error');
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
            
            if (window.contratoCasaParticularSystem) {
                window.contratoCasaParticularSystem.showNotification(`Foto del ${this.currentStep} capturada`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            if (window.contratoCasaParticularSystem) {
                window.contratoCasaParticularSystem.showNotification('Error al capturar la foto', 'error');
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
            if (window.contratoCasaParticularSystem) {
                window.contratoCasaParticularSystem.showNotification('Ahora capture el reverso del carnet', 'info');
            }
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            this.currentStep = 'completed';
            this.showSummary();
            if (window.contratoCasaParticularSystem) {
                window.contratoCasaParticularSystem.showNotification('Ambas fotos capturadas', 'success');
            }
        }
    }

    restartProcess() {
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        if (window.contratoCasaParticularSystem) {
            window.contratoCasaParticularSystem.showNotification('Proceso reiniciado', 'info');
        }
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            if (window.contratoCasaParticularSystem) {
                window.contratoCasaParticularSystem.showNotification('Faltan fotos por capturar', 'error');
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
            
            if (window.contratoCasaParticularSystem) {
                window.contratoCasaParticularSystem.updateProgress();
            }

            this.closeModal();
            
            if (window.contratoCasaParticularSystem) {
                const tipoPersona = this.currentType === 'empleador' ? 'empleador' : 'trabajador';
                window.contratoCasaParticularSystem.showNotification(`Carnet completo del ${tipoPersona} guardado`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al confirmar fotos:', error);
            if (window.contratoCasaParticularSystem) {
                window.contratoCasaParticularSystem.showNotification('Error al procesar las fotos', 'error');
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
        ['empleador', 'trabajador'].forEach(type => {
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
    if (window.contratoCasaParticularSystem) {
        window.contratoCasaParticularSystem.clearForm();
    }
};

window.generatePDF = function() {
    if (window.contratoCasaParticularSystem) {
        window.contratoCasaParticularSystem.generatePDF();
    }
};

// ===== INICIALIZACIÓN DEL SISTEMA =====
let contratoCasaParticularSystem;

function initializeContratoCasaParticularSystem() {
    console.log('📋 Iniciando Sistema de Contrato Casa Particular...');
    
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined') {
        console.warn('⚠️ jsPDF no está disponible, esperando...');
        setTimeout(initializeContratoCasaParticularSystem, 1000);
        return;
    }
    
    // Verificar que CONFIG esté disponible
    if (typeof CONFIG === 'undefined') {
        console.warn('⚠️ CONFIG no está disponible, esperando...');
        setTimeout(initializeContratoCasaParticularSystem, 1000);
        return;
    }
    
    try {
        contratoCasaParticularSystem = new ContratoCasaParticularSystem();
        window.contratoCasaParticularSystem = contratoCasaParticularSystem;
        
        console.log('✅ Sistema completamente inicializado');
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        setTimeout(initializeContratoCasaParticularSystem, 2000);
    }
}

// ===== MÚLTIPLES PUNTOS DE INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContratoCasaParticularSystem);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initializeContratoCasaParticularSystem, 500);
}

window.addEventListener('load', () => {
    if (!window.contratoCasaParticularSystem) {
        console.log('🔄 Inicialización de respaldo activada');
        setTimeout(initializeContratoCasaParticularSystem, 1000);
    }
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', (event) => {
    console.error('❌ Error global capturado:', event.error);
    
    if (window.contratoCasaParticularSystem) {
        window.contratoCasaParticularSystem.showNotification(
            'Se detectó un error. El sistema intentará recuperarse automáticamente.', 
            'warning'
        );
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
    
    if (window.contratoCasaParticularSystem) {
        window.contratoCasaParticularSystem.showNotification(
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
console.log('📜 Sistema de Contrato Casa Particular - Script principal cargado correctamente');