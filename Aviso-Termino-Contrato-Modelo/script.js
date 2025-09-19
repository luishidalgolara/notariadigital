// ========================================
// 📋 SISTEMA DE AVISO DE TÉRMINO DE CONTRATO DE TRABAJO - SCRIPT PRINCIPAL
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'ciudadAviso', 'fechaAviso',
        'nombreEmpleador', 'rutEmpleador', 'domicilioEmpleador', 'comunaEmpleador', 'ciudadEmpleador',
        'representanteLegal', 'rutRepresentante',
        'nombreTrabajador', 'rutTrabajador', 'domicilioTrabajador', 'comunaTrabajador', 'ciudadTrabajador',
        'cargoTrabajador', 'areaTrabajador',
        'fechaInicioContrato', 'tipoContrato', 'jornadaLaboral', 'sueldoBase', 'observacionesContrato',
        'fechaTermino', 'articuloCodigo', 'numeroInciso', 'tipoCausal', 'descripcionCausal', 'hechosFundamento',
        'estadoCotizaciones', 'certificadoCotizaciones', 'formaEntrega', 'inspeccionTrabajo', 'observacionesAdicionales'
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
    
    // Estado de inicialización
    initialized: {
        core: false,
        signatures: false,
        photos: false
    }
};

// ===== CLASE PRINCIPAL DEL SISTEMA =====
class AvisoTerminoSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Aviso de Término de Contrato...');
        
        try {
            // Esperar a que el DOM esté completamente listo
            await this.waitForDOM();
            
            // Verificar elementos críticos múltiples veces si es necesario
            const elementsReady = await this.ensureCriticalElements();
            
            if (!elementsReady) {
                throw new Error('Elementos críticos no disponibles después de múltiples intentos');
            }

            // Inicialización paso a paso con verificaciones
            await this.initializeCore();
            await this.initializeSpecialSystems();
            
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
            'progressFill', 'progressText'
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
        
        console.log('✅ Núcleo del sistema inicializado');
    }

    async initializeSpecialSystems() {
        console.log('⚙️ Inicializando sistemas especiales...');
        
        // Intentar inicializar firmas digitales
        try {
            await this.initializeSignatureSystemSafe();
            systemState.initialized.signatures = true;
            console.log('✅ Sistema de firmas digitales inicializado');
        } catch (error) {
            console.error('❌ Error inicializando firmas digitales:', error);
        }

        // Intentar inicializar fotos carnet
        try {
            await this.initializePhotoSystemSafe();
            systemState.initialized.photos = true;
            console.log('✅ Sistema de fotos carnet inicializado');
        } catch (error) {
            console.error('❌ Error inicializando fotos carnet:', error);
        }

        // Intentar hasta 3 veces si algún sistema falló
        if (!systemState.initialized.signatures || !systemState.initialized.photos) {
            console.log('🔄 Reintentando inicialización de sistemas...');
            await this.delay(2000);
            await this.retryFailedSystems();
        }
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

    setupEventListeners() {
        console.log('🎧 Configurando event listeners...');
        
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('input', () => this.updatePreview());
                element.addEventListener('change', () => this.updatePreview());
            }
        });

        this.setupSpecialFieldListeners();
        
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });

        console.log('✅ Event listeners configurados');
    }

    setupSpecialFieldListeners() {
        // Validación RUT Empleador
        const rutEmpleador = document.getElementById('rutEmpleador');
        if (rutEmpleador) {
            rutEmpleador.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutEmpleador');
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

        // Validación Sueldo
        const sueldoBase = document.getElementById('sueldoBase');
        if (sueldoBase) {
            sueldoBase.addEventListener('input', (e) => {
                this.handleSalaryInput(e);
            });
        }

        // Auto-llenar fecha actual
        const fechaAviso = document.getElementById('fechaAviso');
        if (fechaAviso) {
            fechaAviso.addEventListener('change', () => {
                this.handleDateChange();
            });
        }

        // Validar fechas de contrato
        const fechaInicioContrato = document.getElementById('fechaInicioContrato');
        const fechaTermino = document.getElementById('fechaTermino');
        
        if (fechaInicioContrato && fechaTermino) {
            fechaInicioContrato.addEventListener('change', () => this.validateContractDates());
            fechaTermino.addEventListener('change', () => this.validateContractDates());
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
        this.checkForDuplicateRUT();
    }

    handleSalaryInput(event) {
        const salary = parseFloat(event.target.value);
        
        if (!isNaN(salary) && salary > 0) {
            const isValid = ConfigUtils.validateSalary(salary);
            event.target.classList.toggle('price-valid', isValid);
            event.target.classList.toggle('price-invalid', !isValid);
            
            if (salary < CONFIG.VALIDATION.min_salary) {
                this.showNotification('El sueldo parece bajo. Verifique el monto.', 'warning');
            }
        } else {
            event.target.classList.remove('price-valid', 'price-invalid');
        }
        
        this.updatePreview();
    }

    handleDateChange() {
        const fecha = document.getElementById('fechaAviso').value;
        if (fecha && ConfigUtils.validateDate(fecha)) {
            // Auto-sugerir fecha de término si no está llena
            const fechaTermino = document.getElementById('fechaTermino');
            
            if (!fechaTermino.value) {
                // Sugerir mismo día por defecto
                fechaTermino.value = fecha;
            }
        }
        this.updatePreview();
    }

    validateContractDates() {
        const fechaInicio = document.getElementById('fechaInicioContrato').value;
        const fechaTermino = document.getElementById('fechaTermino').value;
        
        if (fechaInicio && fechaTermino) {
            const inicio = new Date(fechaInicio);
            const termino = new Date(fechaTermino);
            
            if (termino <= inicio) {
                this.showNotification('La fecha de término debe ser posterior a la fecha de inicio del contrato', 'warning');
            }
        }
    }

    checkForDuplicateRUT() {
        const rutEmpleador = document.getElementById('rutEmpleador').value;
        const rutRepresentante = document.getElementById('rutRepresentante').value;
        const rutTrabajador = document.getElementById('rutTrabajador').value;
        
        if (rutTrabajador && ((rutEmpleador && rutTrabajador === rutEmpleador) || 
                              (rutRepresentante && rutTrabajador === rutRepresentante))) {
            this.showNotification('El trabajador no puede tener el mismo RUT que el empleador o representante', 'warning');
        }
    }

    updatePreview() {
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            const preview = document.getElementById('prev_' + field);
            if (element && preview) {
                let value = element.value || '';
                
                // Formateo especial para sueldo
                if (field === 'sueldoBase' && value) {
                    value = ConfigUtils.formatPrice(parseFloat(value));
                }
                
                preview.textContent = value || this.getPlaceholderText(field);
            }
        });

        // Actualizar referencias duplicadas
        this.updateDuplicateReferences();
        this.updateDatePreview();
        this.updateSignatureNames();
        this.updateProgress();
    }

    updateDuplicateReferences() {
        // Nombres duplicados
        const nombreEmpleador = document.getElementById('nombreEmpleador').value;
        const nombreTrabajador = document.getElementById('nombreTrabajador').value;
        const rutEmpleador = document.getElementById('rutEmpleador').value;
        
        document.getElementById('prev_nombreEmpleador2').textContent = nombreEmpleador || '........................';
        document.getElementById('prev_rutEmpleador2').textContent = rutEmpleador || '................';
        
        // Ciudad duplicada si existe
        const ciudadAviso = document.getElementById('ciudadAviso').value;
        const prev_ciudadAviso2 = document.getElementById('prev_ciudadAviso2');
        if (prev_ciudadAviso2) {
            prev_ciudadAviso2.textContent = ciudadAviso || '.........';
        }
    }

    updateDatePreview() {
        const fechaAviso = document.getElementById('fechaAviso').value;
        
        if (fechaAviso && ConfigUtils.validateDate(fechaAviso)) {
            const date = new Date(fechaAviso);
            
            document.getElementById('prev_dia').textContent = date.getDate();
            document.getElementById('prev_mes').textContent = this.mesesEspanol[date.getMonth()];
            document.getElementById('prev_anio').textContent = date.getFullYear();
        } else {
            document.getElementById('prev_dia').textContent = '...';
            document.getElementById('prev_mes').textContent = '........';
            document.getElementById('prev_anio').textContent = '20..';
        }

        // Formatear fecha de término duplicada
        const fechaTermino = document.getElementById('fechaTermino').value;
        const prev_fechaTermino2 = document.getElementById('prev_fechaTermino2');
        if (fechaTermino && prev_fechaTermino2) {
            const termino = new Date(fechaTermino);
            prev_fechaTermino2.textContent = `${termino.getDate()} de ${this.mesesEspanol[termino.getMonth()]} de ${termino.getFullYear()}`;
        } else if (prev_fechaTermino2) {
            prev_fechaTermino2.textContent = '....... de ................. de 2.....';
        }
    }

    updateSignatureNames() {
        const nombreEmpleador = document.getElementById('nombreEmpleador').value;
        const nombreTrabajador = document.getElementById('nombreTrabajador').value;
        
        const firmaEmpleador = document.getElementById('prev_firmaEmpleador');
        const firmaTrabajador = document.getElementById('prev_firmaTrabajador');
        
        if (firmaEmpleador) {
            firmaEmpleador.textContent = nombreEmpleador || '_______________';
        }
        
        if (firmaTrabajador) {
            firmaTrabajador.textContent = nombreTrabajador || '_______________';
        }
    }

    getPlaceholderText(field) {
        const placeholders = {
            'ciudadAviso': '.........',
            'nombreEmpleador': '.........................',
            'nombreTrabajador': '.........................',
            'rutEmpleador': '................',
            'rutRepresentante': '................',
            'rutTrabajador': '................',
            'domicilioEmpleador': '.........................',
            'domicilioTrabajador': '.........................',
            'comunaEmpleador': '...........',
            'comunaTrabajador': '...........',
            'ciudadEmpleador': '...........',
            'ciudadTrabajador': '...........',
            'cargoTrabajador': '...........',
            'areaTrabajador': '...........',
            'tipoContrato': '...........',
            'jornadaLaboral': '...........',
            'sueldoBase': '...........',
            'articuloCodigo': '......',
            'numeroInciso': '.................',
            'tipoCausal': '.........................',
            'descripcionCausal': '................................................................................................................................',
            'hechosFundamento': '................................................................................................................................................................................................................................................................................................................................................................................................',
            'estadoCotizaciones': '........................',
            'certificadoCotizaciones': '........................',
            'observacionesContrato': '........................................................................................',
            'observacionesAdicionales': '........................'
        };
        
        return placeholders[field] || '...........';
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
        
        if (systemState.firmasDigitales.empleador) bonusScore += 0.5;
        if (systemState.firmasDigitales.trabajador) bonusScore += 0.5;
        
        if (systemState.fotosCarnet.empleador.completed) bonusScore += 0.5;
        if (systemState.fotosCarnet.trabajador.completed) bonusScore += 0.5;
        
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

    // ===== SISTEMA DE FIRMAS DIGITALES MEJORADO =====
    async initializeSignatureSystemSafe() {
        console.log('🖋️ Inicializando sistema de firmas digitales...');
        
        // Verificar elementos necesarios para firmas
        const requiredElements = ['firmaModalOverlay', 'firmaEmpleador', 'firmaTrabajador'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`Elementos de firma faltantes: ${missingElements.join(', ')}`);
        }
        
        // Crear procesador con verificación
        if (!window.firmaProcessor) {
            window.firmaProcessor = new FirmaDigitalProcessor();
            
            // Verificar que el procesador se inicializó correctamente
            await this.delay(500);
            
            if (!window.firmaProcessor) {
                throw new Error('No se pudo crear el procesador de firmas');
            }
        }
        
        // Configurar botones con verificación
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
        
        // Remover listeners existentes
        const clonedBtnEmpleador = btnFirmaEmpleador.cloneNode(true);
        const clonedBtnTrabajador = btnFirmaTrabajador.cloneNode(true);
        
        btnFirmaEmpleador.parentNode.replaceChild(clonedBtnEmpleador, btnFirmaEmpleador);
        btnFirmaTrabajador.parentNode.replaceChild(clonedBtnTrabajador, btnFirmaTrabajador);
        
        // Configurar nuevos listeners
        clonedBtnEmpleador.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖋️ Clic en firma empleador');
            this.openSignatureModalSafe('empleador');
        });
        
        clonedBtnTrabajador.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖋️ Clic en firma trabajador');
            this.openSignatureModalSafe('trabajador');
        });
        
        console.log('✅ Botones de firma configurados correctamente');
    }

    openSignatureModalSafe(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        let nombreField;
        if (type === 'empleador') {
            nombreField = document.getElementById('representanteLegal');
        } else {
            nombreField = document.getElementById('nombreTrabajador');
        }
        
        if (!nombreField || !nombreField.value.trim()) {
            const entityName = type === 'empleador' ? 'representante legal' : 'trabajador';
            this.showNotification(`Complete el nombre del ${entityName} antes de firmar`, 'warning');
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

    async retrySignatureSystem() {
        try {
            await this.initializeSignatureSystemSafe();
            this.showNotification('Sistema de firmas reactivado', 'success');
        } catch (error) {
            console.error('❌ No se pudo reactivar el sistema de firmas:', error);
            this.showNotification('Sistema de firmas no disponible', 'error');
        }
    }

    // ===== SISTEMA DE FOTOS CARNET MEJORADO =====
    async initializePhotoSystemSafe() {
        console.log('📷 Inicializando sistema de fotos carnet...');
        
        // Verificar elementos necesarios para fotos
        const requiredElements = ['photoModalOverlay', 'photoEmpleador', 'photoTrabajador'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`Elementos de fotos faltantes: ${missingElements.join(', ')}`);
        }
        
        // Crear procesador con verificación
        if (!window.photoProcessor) {
            window.photoProcessor = new PhotoCarnetDualProcessor();
            
            // Verificar que el procesador se inicializó correctamente
            await this.delay(500);
            
            if (!window.photoProcessor) {
                throw new Error('No se pudo crear el procesador de fotos');
            }
        }
        
        // Configurar botones con verificación
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
        
        // Remover listeners existentes
        const clonedBtnPhotoEmpleador = btnPhotoEmpleador.cloneNode(true);
        const clonedBtnPhotoTrabajador = btnPhotoTrabajador.cloneNode(true);
        
        btnPhotoEmpleador.parentNode.replaceChild(clonedBtnPhotoEmpleador, btnPhotoEmpleador);
        btnPhotoTrabajador.parentNode.replaceChild(clonedBtnPhotoTrabajador, btnPhotoTrabajador);
        
        // Configurar nuevos listeners
        clonedBtnPhotoEmpleador.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('📷 Clic en foto empleador');
            this.openPhotoModalSafe('empleador');
        });
        
        clonedBtnPhotoTrabajador.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('📷 Clic en foto trabajador');
            this.openPhotoModalSafe('trabajador');
        });
        
        console.log('✅ Botones de foto configurados correctamente');
    }

    openPhotoModalSafe(type) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        let nombreField;
        if (type === 'empleador') {
            nombreField = document.getElementById('representanteLegal');
        } else {
            nombreField = document.getElementById('nombreTrabajador');
        }
        
        if (!nombreField || !nombreField.value.trim()) {
            const entityName = type === 'empleador' ? 'representante legal' : 'trabajador';
            this.showNotification(`Complete el nombre del ${entityName} antes de tomar fotos`, 'warning');
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

    async retryPhotoSystem() {
        try {
            await this.initializePhotoSystemSafe();
            this.showNotification('Sistema de fotos reactivado', 'success');
        } catch (error) {
            console.error('❌ No se pudo reactivar el sistema de fotos:', error);
            this.showNotification('Sistema de fotos no disponible', 'error');
        }
    }

    // ===== FUNCIONES DE UTILIDAD =====
    initializeFormFields() {
        // Establecer fecha actual por defecto
        const fechaAviso = document.getElementById('fechaAviso');
        if (fechaAviso && !fechaAviso.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaAviso.value = today;
        }
        
        console.log('📝 Campos del formulario inicializados');
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
        
        try {
            localStorage.setItem(CONFIG.AUTOSAVE.key, JSON.stringify(data));
        } catch (error) {
            console.warn('⚠️ No se pudo guardar automáticamente');
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
                    } else {
                        const element = document.getElementById(field);
                        if (element && data[field]) {
                            element.value = data[field];
                        }
                    }
                });
                
                this.updatePreview();
                console.log('📥 Formulario restaurado');
            }
        } catch (error) {
            console.warn('⚠️ No se pudo restaurar el formulario');
        }
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
                        element.classList.remove('rut-valid', 'rut-invalid', 'price-valid', 'price-invalid');
                    }
                });
                
                // Restablecer fecha actual
                const fechaAviso = document.getElementById('fechaAviso');
                if (fechaAviso) {
                    const today = new Date().toISOString().split('T')[0];
                    fechaAviso.value = today;
                }
                
                systemState.firmasDigitales = { empleador: false, trabajador: false };
                systemState.fotosCarnet = {
                    empleador: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false },
                    trabajador: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false }
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
            
            // Intentar inicialización parcial
            this.fallbackInitialization();
        }
    }

    async fallbackInitialization() {
        console.log('🆘 Intentando inicialización de respaldo...');
        
        try {
            // Solo funcionalidad básica
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
                <div class="notification-icon">${this.getNotificationIcon(type)}</div>
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
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        return icons[type] || icons.info;
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
        const btn = event.target;
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
            const doc = new jsPDF();

            this.setupPDFDocument(doc);
            await this.addPDFContent(doc);
            
            const fileName = this.generateFileName();
            
            setTimeout(() => {
                doc.save(fileName);
                this.showNotification('¡PDF de Aviso de Término de Contrato generado exitosamente!', 'success');
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

        // Título
        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.text('AVISO DE TÉRMINO DE CONTRATO DE TRABAJO', 105, y, { align: 'center' });
        y += 25;

        // Fecha y lugar
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        
        const ciudadAviso = document.getElementById('ciudadAviso').value;
        const fechaAviso = new Date(document.getElementById('fechaAviso').value);
        
        const fechaText = `${ciudadAviso}, ${fechaAviso.getDate()} de ${this.mesesEspanol[fechaAviso.getMonth()]} de ${fechaAviso.getFullYear()}`;
        doc.text(fechaText, pageWidth - margin, y, { align: 'right' });
        y += 25;

        // Destinatario
        const nombreTrabajador = document.getElementById('nombreTrabajador').value;
        doc.setFont('times', 'bold');
        doc.text('SEÑOR(A):', margin, y);
        y += 8;
        doc.setFont('times', 'normal');
        doc.text(nombreTrabajador, margin, y);
        y += 8;
        doc.setFont('times', 'bold');
        doc.text('PRESENTE', margin, y);
        y += 20;

        // Saludo
        doc.setFont('times', 'normal');
        doc.text('Estimado señor(a):', margin, y);
        y += 20;

        // Párrafo principal
        const fechaTermino = document.getElementById('fechaTermino').value;
        const fechaTerminoObj = new Date(fechaTermino);
        const fechaTerminoText = `${fechaTerminoObj.getDate()} de ${this.mesesEspanol[fechaTerminoObj.getMonth()]} de ${fechaTerminoObj.getFullYear()}`;
        
        const articuloCodigo = document.getElementById('articuloCodigo').value;
        const numeroInciso = document.getElementById('numeroInciso').value;
        const tipoCausal = document.getElementById('tipoCausal').value;
        
        const parrafo1 = `Nos permitimos comunicar que, con esta fecha, ${fechaTerminoText}, se ha resuelto poner término al contrato de trabajo que lo vincula con la empresa, por la causal del artículo ${articuloCodigo}, ${numeroInciso}, del Código del Trabajo, esto es, ${tipoCausal}`;
        
        doc.text(parrafo1, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += 25;

        // Descripción de la causal
        const descripcionCausal = document.getElementById('descripcionCausal').value;
        if (descripcionCausal) {
            doc.text(descripcionCausal, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += 20;
        }

        // Hechos que fundamentan
        doc.text('Los hechos en que se funda la causal invocada consisten en que:', margin, y);
        y += 15;
        
        const hechosFundamento = document.getElementById('hechosFundamento').value;
        doc.text(hechosFundamento, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += 30;

        // Información de cotizaciones
        const estadoCotizaciones = document.getElementById('estadoCotizaciones').value;
        const certificadoCotizaciones = document.getElementById('certificadoCotizaciones').value;
        
        const parrafoCotizaciones = `Informo que sus cotizaciones previsionales ${estadoCotizaciones}. Además, ${certificadoCotizaciones} de las entidades de previsión a las que se encuentra afiliado, que dan cuenta que las cotizaciones previsionales, del período trabajado, se encuentran pagadas.`;
        
        doc.text(parrafoCotizaciones, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += 25;

        // Despedida
        doc.text('Saluda a usted,', margin, y);
        y += 40;

        // Verificar si necesitamos nueva página
        if (y > 220) {
            doc.addPage();
            y = 30;
        }

        // Firmas
        this.addSignatureSection(doc, y);
        
        // Nota legal
        if (y > 200) {
            doc.addPage();
            y = 30;
        } else {
            y += 60;
        }

        doc.setFont('times', 'italic');
        doc.setFontSize(9);
        doc.text(CONFIG.DOCUMENT.legal_texts.nota_legal, margin, y, {maxWidth: pageWidth - 2 * margin});
        
        this.addDigitalWatermark(doc);
    }

    addSignatureSection(doc, y) {
        console.log('📄 Agregando sección de firmas al PDF...');
        
        // Firmas lado a lado
        const leftX = 40;
        const rightX = 120;
        
        // Líneas de firma
        doc.line(leftX, y, leftX + 50, y);
        doc.line(rightX, y, rightX + 50, y);
        y += 8;
        
        // Nombres
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        const representanteLegal = document.getElementById('representanteLegal').value;
        const nombreTrabajador = document.getElementById('nombreTrabajador').value;
        
        doc.text(representanteLegal, leftX + 25, y, { align: 'center' });
        doc.text(nombreTrabajador, rightX + 25, y, { align: 'center' });
        y += 6;
        
        // Roles
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('EMPLEADOR', leftX + 25, y, { align: 'center' });
        doc.text('TRABAJADOR', rightX + 25, y, { align: 'center' });
        y += 6;
        
        // Información adicional
        const nombreEmpleador = document.getElementById('nombreEmpleador').value;
        const rutEmpleador = document.getElementById('rutEmpleador').value;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.text(nombreEmpleador, leftX + 25, y, { align: 'center' });
        doc.text('Recibí copia de la presente carta', rightX + 25, y, { align: 'center' });
        y += 4;
        doc.text(`RUT: ${rutEmpleador}`, leftX + 25, y, { align: 'center' });
        
        // Agregar firmas digitales si existen
        if (window.firmaProcessor) {
            try {
                const firmaEmpleador = window.firmaProcessor.getSignatureForPDF('empleador');
                const firmaTrabajador = window.firmaProcessor.getSignatureForPDF('trabajador');
                
                if (firmaEmpleador) {
                    doc.addImage(firmaEmpleador, 'PNG', leftX, y - 35, 50, 25);
                    console.log('✅ Firma del empleador agregada al PDF');
                }
                
                if (firmaTrabajador) {
                    doc.addImage(firmaTrabajador, 'PNG', rightX, y - 35, 50, 25);
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
        doc.text('Documento firmado digitalmente - Notaría Digital Chile', 105, 280, { align: 'center' });
        doc.text(`Generado el ${new Date().toLocaleString('es-CL')}`, 105, 285, { align: 'center' });
        doc.setTextColor(0, 0, 0);
    }

    generateFileName() {
        const nombreEmpleador = document.getElementById('nombreEmpleador').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const nombreTrabajador = document.getElementById('nombreTrabajador').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const timestamp = new Date().toISOString().slice(0, 10);
        return `Aviso_Termino_Contrato_${nombreEmpleador}_${nombreTrabajador}_${timestamp}.pdf`;
    }

    validateFormWithSignatures() {
        const emptyFields = [];
        
        systemState.formFields.forEach(field => {
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
        const rutEmpleador = document.getElementById('rutEmpleador').value;
        const rutRepresentante = document.getElementById('rutRepresentante').value;
        const rutTrabajador = document.getElementById('rutTrabajador').value;
        
        if (rutEmpleador && !ConfigUtils.validateRUT(rutEmpleador)) {
            issues.push('RUT del empleador inválido');
        }
        
        if (rutRepresentante && !ConfigUtils.validateRUT(rutRepresentante)) {
            issues.push('RUT del representante inválido');
        }
        
        if (rutTrabajador && !ConfigUtils.validateRUT(rutTrabajador)) {
            issues.push('RUT del trabajador inválido');
        }
        
        if (rutTrabajador && ((rutEmpleador && rutTrabajador === rutEmpleador) || 
                              (rutRepresentante && rutTrabajador === rutRepresentante))) {
            issues.push('El trabajador no puede tener el mismo RUT que el empleador o representante');
        }
        
        const fechaInicio = document.getElementById('fechaInicioContrato').value;
        const fechaTermino = document.getElementById('fechaTermino').value;
        
        if (fechaInicio && fechaTermino) {
            const inicio = new Date(fechaInicio);
            const termino = new Date(fechaTermino);
            
            if (termino <= inicio) {
                issues.push('La fecha de término debe ser posterior a la fecha de inicio');
            }
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

// ===== CLASES AUXILIARES (Adaptadas para contratos de trabajo) =====

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
        if (!file.type.startsWith('image/')) {
            this.showAlert('Por favor selecciona una imagen válida (PNG, JPG, JPEG)', 'error');
            return;
        }
        if (file.size > CONFIG.SECURITY.max_file_size) {
            this.showAlert('La imagen es muy grande. Máximo 5MB', 'error');
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
            
            const isWhitish = luminosity > 160;
            const isGrayish = average > 140 && colorDiff < 40;
            const isLightColor = minColor > 120;
            
            if (isWhitish || isGrayish || isLightColor) {
                data[i + 3] = 0;
            } else {
                const factor = 1.2;
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
            
            if (window.avisoTerminoSystem) {
                window.avisoTerminoSystem.updateProgress();
            }
            
            this.closeModal();
            
            if (window.avisoTerminoSystem) {
                window.avisoTerminoSystem.showNotification(`Firma digital del ${this.currentType} aplicada correctamente`, 'success');
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
        this.firmasDigitales.empleador = null;
        this.firmasDigitales.trabajador = null;
        
        systemState.firmasDigitales = { empleador: false, trabajador: false };
        
        ['empleador', 'trabajador'].forEach(type => {
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

            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'environment'
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
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
        let detailedInfo = '';

        switch (error.name) {
            case 'NotAllowedError':
                errorTitle = '🚫 Acceso Denegado';
                errorMessage = 'Permisos de cámara denegados';
                detailedInfo = 'Haga clic en el icono de cámara 📷 en la barra de direcciones y seleccione "Permitir"';
                break;
                
            case 'NotFoundError':
                errorTitle = '📷 Cámara No Encontrada';
                errorMessage = 'No se detectó ninguna cámara';
                detailedInfo = 'Verifique que su cámara esté conectada y funcionando';
                break;
                
            case 'NotReadableError':
                errorTitle = '⚠️ Cámara Ocupada';
                errorMessage = 'La cámara está siendo usada por otra aplicación';
                detailedInfo = 'Cierre otras aplicaciones que puedan estar usando la cámara';
                break;
                
            default:
                errorTitle = '❌ Error de Cámara';
                errorMessage = 'Error inesperado al acceder a la cámara';
                detailedInfo = 'Recargue la página e intente nuevamente. Asegúrese de estar en HTTPS.';
        }

        this.showLoading(errorTitle, errorMessage + '. ' + detailedInfo);
        
        if (window.avisoTerminoSystem) {
            window.avisoTerminoSystem.showNotification(errorMessage + '. ' + detailedInfo, 'error');
        }
        
        // Agregar botón de cerrar en caso de error persistente
        setTimeout(() => {
            const loading = document.getElementById('photoLoading');
            if (loading && loading.style.display === 'block') {
                const closeBtn = document.createElement('button');
                closeBtn.textContent = 'Cerrar y Continuar';
                closeBtn.style.cssText = `
                    margin-top: 20px;
                    padding: 12px 24px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                `;
                closeBtn.addEventListener('click', () => this.closeModal());
                loading.appendChild(closeBtn);
            }
        }, 3000);
    }

    capturePhoto() {
        if (!this.video || !this.canvas || !this.context || this.isCapturing) {
            return;
        }

        this.isCapturing = true;

        try {
            this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            const imageData = this.canvas.toDataURL('image/jpeg', 0.8);
            
            this.tempImages[this.currentStep] = imageData;
            
            const preview = document.getElementById('photoPreview');
            if (preview) {
                preview.src = imageData;
            }
            
            this.showPreview();
            
            if (window.avisoTerminoSystem) {
                window.avisoTerminoSystem.showNotification(`Foto del ${this.currentStep} capturada`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            if (window.avisoTerminoSystem) {
                window.avisoTerminoSystem.showNotification('Error al capturar la foto', 'error');
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
            if (window.avisoTerminoSystem) {
                window.avisoTerminoSystem.showNotification('Ahora capture el reverso del carnet', 'info');
            }
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            this.currentStep = 'completed';
            this.showSummary();
            if (window.avisoTerminoSystem) {
                window.avisoTerminoSystem.showNotification('Ambas fotos capturadas', 'success');
            }
        }
    }

    restartProcess() {
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        if (window.avisoTerminoSystem) {
            window.avisoTerminoSystem.showNotification('Proceso reiniciado', 'info');
        }
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            if (window.avisoTerminoSystem) {
                window.avisoTerminoSystem.showNotification('Faltan fotos por capturar', 'error');
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
            
            if (window.avisoTerminoSystem) {
                window.avisoTerminoSystem.updateProgress();
            }

            this.closeModal();
            
            if (window.avisoTerminoSystem) {
                window.avisoTerminoSystem.showNotification(`Carnet completo del ${this.currentType} guardado`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al confirmar fotos:', error);
            if (window.avisoTerminoSystem) {
                window.avisoTerminoSystem.showNotification('Error al procesar las fotos', 'error');
            }
        }
    }

    async processCarnetImage(imageData) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                const maxWidth = 800;
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                const newWidth = img.width * ratio;
                const newHeight = img.height * ratio;
                
                canvas.width = newWidth;
                canvas.height = newHeight;
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                
                resolve(canvas.toDataURL('image/jpeg', 0.85));
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
    if (window.avisoTerminoSystem) {
        window.avisoTerminoSystem.clearForm();
    }
};

window.generatePDF = function() {
    if (window.avisoTerminoSystem) {
        window.avisoTerminoSystem.generatePDF();
    }
};

// ===== INICIALIZACIÓN DEL SISTEMA MEJORADA =====
let avisoTerminoSystem;

// Función de inicialización robusta
function initializeAvisoTerminoSystem() {
    console.log('📋 Iniciando Sistema de Aviso de Término de Contrato...');
    
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined') {
        console.warn('⚠️ jsPDF no está disponible, esperando...');
        setTimeout(initializeAvisoTerminoSystem, 1000);
        return;
    }
    
    // Verificar que CONFIG esté disponible
    if (typeof CONFIG === 'undefined') {
        console.warn('⚠️ CONFIG no está disponible, esperando...');
        setTimeout(initializeAvisoTerminoSystem, 1000);
        return;
    }
    
    try {
        avisoTerminoSystem = new AvisoTerminoSystem();
        window.avisoTerminoSystem = avisoTerminoSystem;
        
        console.log('✅ Sistema completamente inicializado');
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        setTimeout(initializeAvisoTerminoSystem, 2000);
    }
}

// Múltiples puntos de inicialización para asegurar carga
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAvisoTerminoSystem);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    // Si ya está cargado, esperar un poco y ejecutar
    setTimeout(initializeAvisoTerminoSystem, 500);
}

// Respaldo adicional
window.addEventListener('load', () => {
    if (!window.avisoTerminoSystem) {
        console.log('🔄 Inicialización de respaldo activada');
        setTimeout(initializeAvisoTerminoSystem, 1000);
    }
});

console.log('📜 Script principal de Aviso de Término de Contrato cargado - VERSIÓN ADAPTADA');