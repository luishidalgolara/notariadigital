// ========================================
// 📋 SISTEMA PRINCIPAL DE RENUNCIA VOLUNTARIA
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'ciudadRenuncia', 'fechaDocumento',
        'razonSocialEmpresa', 'rutEmpresa', 'telefonoEmpresa', 'domicilioEmpresa', 'numeroEmpresa', 'comunaEmpresa',
        'nombreTrabajador', 'rutTrabajador', 'telefonoTrabajador', 'domicilioTrabajador', 'comunaTrabajador', 'regionTrabajador',
        'fechaEfectivaRenuncia', 'articuloCodigo', 'motivosRenuncia', 'diasAvisoPrevio', 'requiereRatificacion',
        'cargoTrabajador', 'fechaInicioEmpresa', 'areaDepartamento', 'jefeDirecto', 'sueldoActual',
        'incluyeAgradecimiento', 'textoAgradecimientoPersonalizado', 'comentariosAdicionales', 'observacionesGenerales'
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
class RenunciaVoluntariaSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Renuncia Voluntaria...');
        
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
            'firmaEmpleador', 'firmaTrabajador', 'photoEmpleador', 'photoTrabajador',
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
        const rutEmpresa = document.getElementById('rutEmpresa');
        if (rutEmpresa) {
            rutEmpresa.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutEmpresa');
            });
        }

        // Validación RUT Trabajador
        const rutTrabajador = document.getElementById('rutTrabajador');
        if (rutTrabajador) {
            rutTrabajador.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutTrabajador');
            });
        }

        // Formateo de salario
        const sueldoActual = document.getElementById('sueldoActual');
        if (sueldoActual) {
            sueldoActual.addEventListener('input', (e) => {
                this.handleSalaryInput(e);
            });
        }

        // Auto-llenar fecha actual
        const fechaDocumento = document.getElementById('fechaDocumento');
        if (fechaDocumento && !fechaDocumento.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaDocumento.value = today;
        }

        // Listener para mostrar/ocultar agradecimiento
        const incluyeAgradecimiento = document.getElementById('incluyeAgradecimiento');
        if (incluyeAgradecimiento) {
            incluyeAgradecimiento.addEventListener('change', (e) => {
                this.toggleAgradecimiento(e.target.value === 'si');
                this.updatePreview();
            });
        }

        // Validación fecha efectiva de renuncia
        const fechaEfectivaRenuncia = document.getElementById('fechaEfectivaRenuncia');
        if (fechaEfectivaRenuncia) {
            fechaEfectivaRenuncia.addEventListener('change', (e) => {
                this.validateResignationDate(e.target.value);
            });
        }

        // Configurar valores por defecto
        this.setupDefaultValues();
    }

    setupDefaultValues() {
        // Valor por defecto para región
        const regionTrabajador = document.getElementById('regionTrabajador');
        if (regionTrabajador && !regionTrabajador.value) {
            regionTrabajador.value = 'Metropolitana';
        }

        // Valor por defecto para agradecimiento
        const textoAgradecimientoPersonalizado = document.getElementById('textoAgradecimientoPersonalizado');
        if (textoAgradecimientoPersonalizado && !textoAgradecimientoPersonalizado.value) {
            textoAgradecimientoPersonalizado.value = 'Agradeciendo el haberme permitido laborar en vuestra empresa';
        }

        // Establecer fecha mínima para renuncia (hoy + 1 día)
        const fechaEfectivaRenuncia = document.getElementById('fechaEfectivaRenuncia');
        if (fechaEfectivaRenuncia) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const minDate = tomorrow.toISOString().split('T')[0];
            fechaEfectivaRenuncia.setAttribute('min', minDate);
        }
    }

    toggleAgradecimiento(show) {
        const section = document.getElementById('textoAgradecimiento');
        if (section) {
            section.style.display = show ? 'block' : 'none';
        }
    }

    validateResignationDate(dateValue) {
        if (!dateValue) return;
        
        const selectedDate = new Date(dateValue);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate <= today) {
            this.showNotification('La fecha efectiva de renuncia debe ser futura', 'warning');
            return false;
        }
        
        // Calcular días de aviso previo
        const fechaDocumento = document.getElementById('fechaDocumento').value;
        if (fechaDocumento) {
            const noticeDays = ConfigUtils.calculateNoticeDays(fechaDocumento, dateValue);
            if (noticeDays < 7) {
                this.showNotification(`Solo ${noticeDays} días de aviso previo. Se recomienda mínimo 30 días`, 'warning');
            }
        }
        
        return true;
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

    handleSalaryInput(event) {
        const formatted = ConfigUtils.formatSalary(event.target.value);
        event.target.value = formatted;
        
        const isValid = ConfigUtils.validateSalary(formatted);
        event.target.classList.toggle('salary-valid', isValid);
        event.target.classList.toggle('salary-invalid', !isValid);
        
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
        this.updateProgress();
    }

    updateDuplicateReferences() {
        // Referencias duplicadas en el documento
        const nombreTrabajador = document.getElementById('nombreTrabajador').value;
        const rutTrabajador = document.getElementById('rutTrabajador').value;

        // Actualizar RUT en firma
        const rutTrabajadorFirma = document.getElementById('prev_rutTrabajadorFirma');
        if (rutTrabajadorFirma) {
            rutTrabajadorFirma.textContent = rutTrabajador || '________________';
        }
    }

    updateDatePreview() {
        const fechaDocumento = document.getElementById('fechaDocumento').value;
        
        if (fechaDocumento && ConfigUtils.validateDate(fechaDocumento)) {
            const date = new Date(fechaDocumento);
            
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
        const nombreTrabajador = document.getElementById('nombreTrabajador').value;
        
        const firmaTrabajador = document.getElementById('prev_nombreTrabajador');
        
        if (firmaTrabajador) {
            firmaTrabajador.textContent = nombreTrabajador || '________________';
        }
    }

    updateConditionalSections() {
        // Sección de agradecimiento
        const incluyeAgradecimiento = document.getElementById('incluyeAgradecimiento').value;
        const agradecimientoSection = document.getElementById('agradecimientoSection');
        if (agradecimientoSection) {
            agradecimientoSection.style.display = incluyeAgradecimiento === 'si' ? 'block' : 'none';
        }

        // Sección de comentarios adicionales
        const comentariosAdicionales = document.getElementById('comentariosAdicionales').value;
        const comentariosSection = document.getElementById('comentariosSection');
        if (comentariosSection) {
            comentariosSection.style.display = comentariosAdicionales && comentariosAdicionales.trim() ? 'block' : 'none';
        }

        // Sección de observaciones en notas
        const observacionesGenerales = document.getElementById('observacionesGenerales').value;
        const observacionesNotasSection = document.getElementById('observacionesNotasSection');
        if (observacionesNotasSection) {
            observacionesNotasSection.style.display = observacionesGenerales && observacionesGenerales.trim() ? 'inline' : 'none';
        }
    }

    getPlaceholderText(field) {
        const placeholders = {
            'ciudadRenuncia': 'Santiago',
            'razonSocialEmpresa': '________________',
            'rutEmpresa': 'XX.XXX.XXX-X',
            'telefonoEmpresa': '___________',
            'domicilioEmpresa': '________________',
            'numeroEmpresa': '____',
            'comunaEmpresa': '________________',
            'nombreTrabajador': '________________',
            'rutTrabajador': 'XX.XXX.XXX-X',
            'telefonoTrabajador': '___________',
            'domicilioTrabajador': '________________',
            'comunaTrabajador': '________________',
            'regionTrabajador': 'Metropolitana',
            'fechaEfectivaRenuncia': '________________',
            'articuloCodigo': 'artículo 159 N° 2',
            'motivosRenuncia': '________________',
            'diasAvisoPrevio': '30',
            'cargoTrabajador': '________________',
            'fechaInicioEmpresa': '________________',
            'areaDepartamento': '________________',
            'jefeDirecto': '________________',
            'sueldoActual': '$________',
            'textoAgradecimientoPersonalizado': 'Agradeciendo el haberme permitido laborar en vuestra empresa',
            'comentariosAdicionales': '________________',
            'observacionesGenerales': '________________'
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
        if (systemState.firmasDigitales.trabajador) bonusScore += 1;
        
        // Bonus por fotos carnet
        if (systemState.fotosCarnet.trabajador.completed) bonusScore += 0.5;
        if (systemState.fotosCarnet.empleador.completed) bonusScore += 0.5;
        
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
        
        // Para trabajador, verificar nombre
        if (type === 'trabajador') {
            let nombreField = document.getElementById('nombreTrabajador');
            if (!nombreField || !nombreField.value.trim()) {
                this.showNotification('Complete el nombre del trabajador antes de firmar', 'warning');
                return;
            }
        }
        
        // Para empleador, verificar razón social
        if (type === 'empleador') {
            let razonSocialField = document.getElementById('razonSocialEmpresa');
            if (!razonSocialField || !razonSocialField.value.trim()) {
                this.showNotification('Complete la razón social de la empresa antes de firmar', 'warning');
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
        
        // Para trabajador, verificar nombre
        if (type === 'trabajador') {
            let nombreField = document.getElementById('nombreTrabajador');
            if (!nombreField || !nombreField.value.trim()) {
                this.showNotification('Complete el nombre del trabajador antes de tomar fotos', 'warning');
                return;
            }
        }
        
        // Para empleador, verificar razón social
        if (type === 'empleador') {
            let razonSocialField = document.getElementById('razonSocialEmpresa');
            if (!razonSocialField || !razonSocialField.value.trim()) {
                this.showNotification('Complete la razón social de la empresa antes de tomar fotos', 'warning');
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
        const fechaDocumento = document.getElementById('fechaDocumento');
        if (fechaDocumento && !fechaDocumento.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaDocumento.value = today;
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
                        element.classList.remove('rut-valid', 'rut-invalid', 'salary-valid', 'salary-invalid');
                    }
                });
                
                // Restaurar valores por defecto
                this.setupDefaultValues();
                
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
                this.showNotification('PDF de la Renuncia Voluntaria generado exitosamente', 'success');
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
        doc.text('MODELO DE RENUNCIA VOLUNTARIA', 105, y, { align: 'center' });
        y += 25;

        // Fecha y lugar
        const ciudadRenuncia = document.getElementById('ciudadRenuncia').value || 'Santiago';
        const fechaDocumento = document.getElementById('fechaDocumento').value;
        
        let fechaTexto = '__ de ________ de 20__';
        if (fechaDocumento && ConfigUtils.validateDate(fechaDocumento)) {
            const date = new Date(fechaDocumento);
            fechaTexto = `${date.getDate()} de ${this.mesesEspanol[date.getMonth()]} de ${date.getFullYear()}`;
        }

        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        doc.text(`${ciudadRenuncia}, ${fechaTexto}`, pageWidth + margin, y, { align: 'right' });
        y += 30;

        // Destinatario
        doc.setFont('times', 'bold');
        doc.text('SEÑORES', margin, y);
        y += 15;

        // Datos de la empresa en tabla
        const razonSocialEmpresa = document.getElementById('razonSocialEmpresa').value || '________________';
        const rutEmpresa = document.getElementById('rutEmpresa').value || '________________';
        const domicilioEmpresa = document.getElementById('domicilioEmpresa').value || '________________';
        const numeroEmpresa = document.getElementById('numeroEmpresa').value || '____';
        const comunaEmpresa = document.getElementById('comunaEmpresa').value || '________________';

        // Tabla de datos empresa
        const tableData = [
            ['EMPRESA', razonSocialEmpresa],
            ['RUT', rutEmpresa],
            ['Domicilio', `${domicilioEmpresa} Nº ${numeroEmpresa}`],
            ['Comuna', comunaEmpresa]
        ];

        // Dibujar tabla manual
        let tableY = y;
        const cellHeight = 8;
        const col1Width = 30;
        const col2Width = pageWidth - col1Width - margin;

        tableData.forEach((row, index) => {
            // Bordes
            doc.rect(margin, tableY, col1Width, cellHeight);
            doc.rect(margin + col1Width, tableY, col2Width, cellHeight);
            
            // Contenido
            doc.setFont('times', 'bold');
            doc.text(row[0], margin + 2, tableY + 5);
            doc.setFont('times', 'normal');
            doc.text(row[1], margin + col1Width + 2, tableY + 5);
            
            tableY += cellHeight;
        });

        y = tableY + 20;

        // Verificar nueva página
        if (y > 200) {
            doc.addPage();
            y = 30;
        }

        // Saludo
        doc.text('De mi consideración:', margin, y);
        y += 20;

        // Cuerpo principal
        const fechaEfectivaRenuncia = document.getElementById('fechaEfectivaRenuncia').value || '________________';
        const articuloCodigo = ConfigUtils.getArticleText(document.getElementById('articuloCodigo').value);
        
        const parrafoPrincipal = `Por intermedio de la presente comunico a ustedes mi renuncia voluntaria, en conformidad al ${articuloCodigo}, del Código del Trabajo y 177, del mismo cuerpo legal, la cual se hará efectiva a contar del día ${fechaEfectivaRenuncia}.`;
        
        doc.text(parrafoPrincipal, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, parrafoPrincipal, pageWidth - 2 * margin) + 15;

        // Agradecimiento y motivos
        const incluyeAgradecimiento = document.getElementById('incluyeAgradecimiento').value;
        const motivosRenuncia = document.getElementById('motivosRenuncia').value || '________________';
        
        if (incluyeAgradecimiento === 'si') {
            const textoAgradecimientoPersonalizado = document.getElementById('textoAgradecimientoPersonalizado').value || 'Agradeciendo el haberme permitido laborar en vuestra empresa';
            
            const parrafoAgradecimiento = `${textoAgradecimientoPersonalizado} le comunico que los motivos de mi renuncia son ${motivosRenuncia}.`;
            
            doc.text(parrafoAgradecimiento, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, parrafoAgradecimiento, pageWidth - 2 * margin) + 15;
        } else {
            const parrafoMotivos = `Le comunico que los motivos de mi renuncia son ${motivosRenuncia}.`;
            
            doc.text(parrafoMotivos, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, parrafoMotivos, pageWidth - 2 * margin) + 15;
        }

        // Comentarios adicionales
        const comentariosAdicionales = document.getElementById('comentariosAdicionales').value;
        if (comentariosAdicionales && comentariosAdicionales.trim()) {
            doc.setFont('times', 'bold');
            doc.text('Comentarios adicionales:', margin, y);
            y += 8;
            doc.setFont('times', 'normal');
            doc.text(comentariosAdicionales, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, comentariosAdicionales, pageWidth - 2 * margin) + 15;
        }

        // Verificar nueva página para firma
        if (y > 180) {
            doc.addPage();
            y = 40;
        }

        // Despedida
        doc.text('Atentamente', margin, y);
        y += 40;

        // Sección de firma
        this.addSignatureSection(doc, y);
        
        // Notas al pie
        y += 80;
        if (y > 220) {
            doc.addPage();
            y = 40;
        }

        const diasAvisoPrevio = ConfigUtils.getNoticeDaysText(document.getElementById('diasAvisoPrevio').value);
        const observacionesGenerales = document.getElementById('observacionesGenerales').value;

        doc.setFont('times', 'bold');
        doc.setFontSize(10);
        doc.text('NOTA:', margin, y);
        y += 8;

        doc.setFont('times', 'normal');
        const notas = [
            '1.- La renuncia voluntaria deberá ser ratificada ante ministro de fe.',
            `2.- La renuncia voluntaria se deberá avisar con ${diasAvisoPrevio} días, a lo menos, de anticipación.`
        ];

        notas.forEach(nota => {
            doc.text(nota, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, nota, pageWidth - 2 * margin) + 3;
        });

        if (observacionesGenerales && observacionesGenerales.trim()) {
            y += 5;
            doc.setFont('times', 'bold');
            doc.text('Observaciones:', margin, y);
            y += 5;
            doc.setFont('times', 'normal');
            doc.text(observacionesGenerales, margin, y, {maxWidth: pageWidth - 2 * margin});
        }
        
        this.addDigitalWatermark(doc);
    }

    addSignatureSection(doc, y) {
        console.log('📄 Agregando sección de firma al PDF...');
        
        const nombreTrabajador = document.getElementById('nombreTrabajador').value || '________________';
        const rutTrabajador = document.getElementById('rutTrabajador').value || '________________';
        
        // Línea de firma centrada
        const centerX = 105;
        doc.line(centerX - 40, y, centerX + 40, y);
        y += 8;
        
        // Nombre
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.text(nombreTrabajador, centerX, y, { align: 'center' });
        y += 6;
        
        // Rol
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('TRABAJADOR', centerX, y, { align: 'center' });
        y += 5;
        
        // RUT
        doc.text(`RUT: ${rutTrabajador}`, centerX, y, { align: 'center' });
        
        // Agregar firma digital si existe
        if (window.firmaProcessor) {
            try {
                const firmaTrabajador = window.firmaProcessor.getSignatureForPDF('trabajador');
                
                if (firmaTrabajador) {
                    doc.addImage(firmaTrabajador, 'PNG', centerX - 40, y - 25, 80, 20);
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

    calculateTextHeight(doc, text, maxWidth) {
        const lines = doc.splitTextToSize(text, maxWidth);
        return lines.length * 5; // Aproximadamente 5mm por línea
    }

    generateFileName() {
        const nombreTrabajador = (document.getElementById('nombreTrabajador').value || 'Trabajador')
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const timestamp = new Date().toISOString().slice(0, 10);
        return `Renuncia_Voluntaria_${nombreTrabajador}_${timestamp}.pdf`;
    }

    validateFormWithSignatures() {
        const emptyFields = [];
        
        // Campos mínimos requeridos
        const requiredFields = [
            'ciudadRenuncia', 'fechaDocumento',
            'razonSocialEmpresa', 'rutEmpresa', 'domicilioEmpresa', 'comunaEmpresa',
            'nombreTrabajador', 'rutTrabajador', 'domicilioTrabajador', 'comunaTrabajador', 'regionTrabajador',
            'fechaEfectivaRenuncia', 'motivosRenuncia', 'cargoTrabajador'
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
        const rutTrabajador = document.getElementById('rutTrabajador').value;
        
        if (rutEmpresa && !ConfigUtils.validateRUT(rutEmpresa)) {
            issues.push('RUT de la empresa inválido');
        }
        
        if (rutTrabajador && !ConfigUtils.validateRUT(rutTrabajador)) {
            issues.push('RUT del trabajador inválido');
        }
        
        // Validar fechas
        const fechaDocumento = document.getElementById('fechaDocumento').value;
        if (fechaDocumento && !ConfigUtils.validateDate(fechaDocumento)) {
            issues.push('Fecha del documento inválida');
        }
        
        const fechaEfectivaRenuncia = document.getElementById('fechaEfectivaRenuncia').value;
        if (fechaEfectivaRenuncia && !ConfigUtils.validateResignationDate(fechaEfectivaRenuncia)) {
            issues.push('La fecha efectiva de renuncia debe ser futura');
        }
        
        // Validar motivos
        const motivosRenuncia = document.getElementById('motivosRenuncia').value;
        if (motivosRenuncia && !ConfigUtils.validateMotivos(motivosRenuncia)) {
            issues.push('Los motivos de renuncia deben tener al menos 10 caracteres');
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

// ===== PROCESADORES DE FIRMAS Y FOTOS (MANTENIDOS IGUAL) =====
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
            
            if (window.renunciaVoluntariaSystem) {
                window.renunciaVoluntariaSystem.updateProgress();
            }
            
            this.closeModal();
            
            if (window.renunciaVoluntariaSystem) {
                window.renunciaVoluntariaSystem.showNotification(`Firma digital aplicada correctamente`, 'success');
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
        
        ['firmaEmpleador', 'firmaTrabajador'].forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.classList.remove('signed');
                const textElement = button.querySelector('.signature-text');
                if (textElement) {
                    if (buttonId === 'firmaEmpleador') {
                        textElement.textContent = 'FIRMA DIGITAL EMPRESA';
                    } else {
                        textElement.textContent = 'FIRMA DIGITAL';
                    }
                }
            }
        });
        
        ['signaturePlaceholderEmpleador', 'signaturePreviewEmpleador', 'signaturePlaceholderTrabajador', 'signaturePreviewTrabajador'].forEach((id, index) => {
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
                if (h3) h3.textContent = 'Posicione el documento en el recuadro';
                if (p) p.textContent = 'Asegúrese de que el documento esté bien iluminado y sea legible';
                overlay.className = 'camera-overlay frente';
            } else if (this.currentStep === 'reverso') {
                if (h3) h3.textContent = 'Ahora capture el segundo documento';
                if (p) p.textContent = 'Posicione el documento de manera clara y legible';
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
                if (h3) h3.textContent = 'Vista previa del primer documento';
                if (p) p.textContent = 'Verifique que la imagen sea clara y legible';
                if (span) span.textContent = 'Continuar al Segundo';
            } else if (this.currentStep === 'reverso') {
                if (h3) h3.textContent = 'Vista previa del segundo documento';
                if (p) p.textContent = 'Verifique que la imagen sea clara y legible';
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
        
        if (window.renunciaVoluntariaSystem) {
            window.renunciaVoluntariaSystem.showNotification(errorMessage, 'error');
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
            
            if (window.renunciaVoluntariaSystem) {
                window.renunciaVoluntariaSystem.showNotification(`Documento capturado`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            if (window.renunciaVoluntariaSystem) {
                window.renunciaVoluntariaSystem.showNotification('Error al capturar la foto', 'error');
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
            if (window.renunciaVoluntariaSystem) {
                window.renunciaVoluntariaSystem.showNotification('Ahora capture el segundo documento', 'info');
            }
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            this.currentStep = 'completed';
            this.showSummary();
            if (window.renunciaVoluntariaSystem) {
                window.renunciaVoluntariaSystem.showNotification('Ambos documentos capturados', 'success');
            }
        }
    }

    restartProcess() {
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        if (window.renunciaVoluntariaSystem) {
            window.renunciaVoluntariaSystem.showNotification('Proceso reiniciado', 'info');
        }
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            if (window.renunciaVoluntariaSystem) {
                window.renunciaVoluntariaSystem.showNotification('Faltan documentos por capturar', 'error');
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
            
            if (window.renunciaVoluntariaSystem) {
                window.renunciaVoluntariaSystem.updateProgress();
            }

            this.closeModal();
            
            if (window.renunciaVoluntariaSystem) {
                window.renunciaVoluntariaSystem.showNotification(`Documentos guardados correctamente`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al confirmar fotos:', error);
            if (window.renunciaVoluntariaSystem) {
                window.renunciaVoluntariaSystem.showNotification('Error al procesar las fotos', 'error');
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
                    if (type === 'empleador') {
                        textElement.textContent = 'DOCUMENTOS COMPLETOS';
                    } else {
                        textElement.textContent = 'FOTOS COMPLETAS';
                    }
                } else {
                    button.classList.remove('uploaded');
                    if (type === 'empleador') {
                        textElement.textContent = 'DOCUMENTOS EMPRESA';
                    } else {
                        textElement.textContent = 'FOTO CARNET';
                    }
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
    if (window.renunciaVoluntariaSystem) {
        window.renunciaVoluntariaSystem.clearForm();
    }
};

window.generatePDF = function() {
    if (window.renunciaVoluntariaSystem) {
        window.renunciaVoluntariaSystem.generatePDF();
    }
};

// ===== INICIALIZACIÓN DEL SISTEMA =====
let renunciaVoluntariaSystem;

function initializeRenunciaVoluntariaSystem() {
    console.log('📋 Iniciando Sistema de Renuncia Voluntaria...');
    
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined') {
        console.warn('⚠️ jsPDF no está disponible, esperando...');
        setTimeout(initializeRenunciaVoluntariaSystem, 1000);
        return;
    }
    
    // Verificar que CONFIG esté disponible
    if (typeof CONFIG === 'undefined') {
        console.warn('⚠️ CONFIG no está disponible, esperando...');
        setTimeout(initializeRenunciaVoluntariaSystem, 1000);
        return;
    }
    
    try {
        renunciaVoluntariaSystem = new RenunciaVoluntariaSystem();
        window.renunciaVoluntariaSystem = renunciaVoluntariaSystem;
        
        console.log('✅ Sistema completamente inicializado');
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        setTimeout(initializeRenunciaVoluntariaSystem, 2000);
    }
}

// ===== MÚLTIPLES PUNTOS DE INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeRenunciaVoluntariaSystem);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initializeRenunciaVoluntariaSystem, 500);
}

window.addEventListener('load', () => {
    if (!window.renunciaVoluntariaSystem) {
        console.log('🔄 Inicialización de respaldo activada');
        setTimeout(initializeRenunciaVoluntariaSystem, 1000);
    }
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', (event) => {
    console.error('❌ Error global capturado:', event.error);
    
    if (window.renunciaVoluntariaSystem) {
        window.renunciaVoluntariaSystem.showNotification(
            'Se detectó un error. El sistema intentará recuperarse automáticamente.', 
            'warning'
        );
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
    
    if (window.renunciaVoluntariaSystem) {
        window.renunciaVoluntariaSystem.showNotification(
            'Error de conectividad detectado. Algunos componentes pueden funcionar de forma limitada.', 
            'warning'
        );
    }
});

// ===== LOG FINAL =====
console.log('📜 Sistema de Renuncia Voluntaria - Script principal cargado correctamente');