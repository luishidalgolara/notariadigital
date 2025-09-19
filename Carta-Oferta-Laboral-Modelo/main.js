// ========================================
// 📋 SISTEMA PRINCIPAL DE CARTA OFERTA LABORAL MODELO 2
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'fechaOferta',
        'nombreCandidato', 
        'cargoOfrecido',
        'nombreEmpresa',
        'dependenciaDirecta',
        'fechaInicioPropuesta',
        'funcionesResponsabilidades',
        'sueldoFijo3Meses',
        'comisionPorcentaje3Meses',
        'conceptoComision3Meses',
        'sueldoFijo4Mes',
        'comisionClientesNuevos',
        'conceptoComisionNuevos',
        'comisionClientesHistoricos',
        'conceptoComisionHistoricos',
        'colacionMensual',
        'otrosBeneficios',
        'plazoContrato',
        'observacionesEspeciales',
        'nombreGerenteGeneral',
        'nombreSubGerente',
        'nombreGerenteComercial',
        'rutCandidato'
    ],
    
    firmasDigitales: {
        candidato: false
    },
    
    fotosCarnet: {
        candidato: {
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
class CartaOfertaSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Carta Oferta Laboral...');
        
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
            'firmaCandidato', 'photoCandidato',
            'progressFill', 'progressText', 'themeToggle',
            'fechaOferta', 'nombreCandidato'
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
                e.returnValue = 'Hay cambios sin guardar. ¿Está seguro de que desea salir?';
            }
        });

        console.log('✅ Event listeners configurados');
    }

    setupSpecialFieldListeners() {
        // Validación RUT Candidato
        const rutCandidato = document.getElementById('rutCandidato');
        if (rutCandidato) {
            rutCandidato.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutCandidato');
            });
        }

        // Configurar fecha por defecto (hoy)
        const fechaOferta = document.getElementById('fechaOferta');
        if (fechaOferta && !fechaOferta.value) {
            const today = new Date();
            fechaOferta.value = today.toISOString().split('T')[0];
        }

        // Formatear montos automáticamente
        const moneyFields = ['sueldoFijo3Meses', 'sueldoFijo4Mes', 'colacionMensual'];
        moneyFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.addEventListener('input', (e) => {
                    // Mantener solo números
                    const value = e.target.value.replace(/[^\d]/g, '');
                    e.target.value = value;
                    this.updatePreview();
                });
            }
        });

        // Validar porcentajes
        const percentFields = ['comisionPorcentaje3Meses', 'comisionClientesNuevos', 'comisionClientesHistoricos'];
        percentFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    if (value > 100) {
                        e.target.value = 100;
                    } else if (value < 0) {
                        e.target.value = 0;
                    }
                    this.updatePreview();
                });
            }
        });
    }

    setupConditionalFields() {
        console.log('🔀 Configurando campos condicionales...');
        // Para esta carta oferta, todos los campos son visibles siempre
        console.log('✅ Campos condicionales configurados');
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
        
        // Actualizar montos y condiciones
        this.updateEconomicConditionsPreview();
        
        // Actualizar datos de firma
        this.updateSignaturePreview();
        
        // Actualizar progreso
        this.updateProgress();
    }

    updateBasicDataPreview() {
        // Obtener datos del formulario
        const fechaOferta = document.getElementById('fechaOferta').value || '___________';
        const nombreCandidato = document.getElementById('nombreCandidato').value || '_____________________';
        const cargoOfrecido = document.getElementById('cargoOfrecido').value || '_____________________';
        const nombreEmpresa = document.getElementById('nombreEmpresa').value || '_____________________';
        const dependenciaDirecta = document.getElementById('dependenciaDirecta').value || '_____________________';
        const fechaInicioPropuesta = document.getElementById('fechaInicioPropuesta').value || '___________';
        const funcionesResponsabilidades = document.getElementById('funcionesResponsabilidades').value || 'Funciones por definir';
        const plazoContrato = document.getElementById('plazoContrato').value || '_____________________';
        const nombreGerenteGeneral = document.getElementById('nombreGerenteGeneral').value || '_____________________';
        const nombreSubGerente = document.getElementById('nombreSubGerente').value || '_____________________';
        const nombreGerenteComercial = document.getElementById('nombreGerenteComercial').value || '_____________________';
        
        // Actualizar vista previa
        const previews = [
            { id: 'prev_fechaOferta', value: this.formatDateForPreview(fechaOferta) },
            { id: 'prev_nombreCandidato', value: nombreCandidato },
            { id: 'prev_cargoOfrecido', value: cargoOfrecido },
            { id: 'prev_nombreEmpresa', value: nombreEmpresa },
            { id: 'prev_dependenciaDirecta', value: dependenciaDirecta },
            { id: 'prev_fechaInicioPropuesta', value: this.formatDateForPreview(fechaInicioPropuesta) },
            { id: 'prev_funcionesResponsabilidades', value: funcionesResponsabilidades },
            { id: 'prev_plazoContrato', value: plazoContrato },
            { id: 'prev_nombreGerenteGeneral', value: nombreGerenteGeneral },
            { id: 'prev_nombreSubGerente', value: nombreSubGerente },
            { id: 'prev_nombreGerenteComercial', value: nombreGerenteComercial }
        ];
        
        previews.forEach(preview => {
            const element = document.getElementById(preview.id);
            if (element) {
                element.textContent = preview.value;
            }
        });
    }

    updateDatesPreview() {
        const fechaOferta = document.getElementById('fechaOferta').value;
        const fechaInicioPropuesta = document.getElementById('fechaInicioPropuesta').value;
        
        const prevFechaOferta = document.getElementById('prev_fechaOferta');
        const prevFechaInicioPropuesta = document.getElementById('prev_fechaInicioPropuesta');
        
        if (prevFechaOferta) {
            prevFechaOferta.textContent = this.formatDateForPreview(fechaOferta);
        }
        
        if (prevFechaInicioPropuesta) {
            prevFechaInicioPropuesta.textContent = this.formatDateForPreview(fechaInicioPropuesta);
        }
    }

    updateEconomicConditionsPreview() {
        // Primeros 3 meses
        const sueldoFijo3Meses = document.getElementById('sueldoFijo3Meses').value;
        const comisionPorcentaje3Meses = document.getElementById('comisionPorcentaje3Meses').value;
        const conceptoComision3Meses = document.getElementById('conceptoComision3Meses').value || 'concepto por definir';
        
        // Del 4° mes en adelante
        const sueldoFijo4Mes = document.getElementById('sueldoFijo4Mes').value;
        const comisionClientesNuevos = document.getElementById('comisionClientesNuevos').value;
        const conceptoComisionNuevos = document.getElementById('conceptoComisionNuevos').value || 'concepto por definir';
        const comisionClientesHistoricos = document.getElementById('comisionClientesHistoricos').value;
        const conceptoComisionHistoricos = document.getElementById('conceptoComisionHistoricos').value || 'concepto por definir';
        
        // Beneficios
        const colacionMensual = document.getElementById('colacionMensual').value;
        const otrosBeneficios = document.getElementById('otrosBeneficios').value;
        
        // Actualizar vistas previas de montos
        const prevSueldo3Meses = document.getElementById('prev_sueldoFijo3Meses');
        const prevComision3Meses = document.getElementById('prev_comisionPorcentaje3Meses');
        const prevConcepto3Meses = document.getElementById('prev_conceptoComision3Meses');
        
        const prevSueldo4Mes = document.getElementById('prev_sueldoFijo4Mes');
        const prevComisionNuevos = document.getElementById('prev_comisionClientesNuevos');
        const prevConceptoNuevos = document.getElementById('prev_conceptoComisionNuevos');
        const prevComisionHistoricos = document.getElementById('prev_comisionClientesHistoricos');
        const prevConceptoHistoricos = document.getElementById('prev_conceptoComisionHistoricos');
        
        const prevColacion = document.getElementById('prev_colacionMensual');
        const prevOtrosBeneficios = document.getElementById('prev_otrosBeneficios');
        
        // Formatear montos
        if (prevSueldo3Meses) {
            prevSueldo3Meses.textContent = sueldoFijo3Meses ? 
                new Intl.NumberFormat('es-CL').format(sueldoFijo3Meses) : '____________';
        }
        
        if (prevComision3Meses) {
            prevComision3Meses.textContent = comisionPorcentaje3Meses || '__';
        }
        
        if (prevConcepto3Meses) {
            prevConcepto3Meses.textContent = conceptoComision3Meses;
        }
        
        if (prevSueldo4Mes) {
            prevSueldo4Mes.textContent = sueldoFijo4Mes ? 
                new Intl.NumberFormat('es-CL').format(sueldoFijo4Mes) : '____________';
        }
        
        if (prevComisionNuevos) {
            prevComisionNuevos.textContent = comisionClientesNuevos || '__';
        }
        
        if (prevConceptoNuevos) {
            prevConceptoNuevos.textContent = conceptoComisionNuevos;
        }
        
        if (prevComisionHistoricos) {
            prevComisionHistoricos.textContent = comisionClientesHistoricos || '__';
        }
        
        if (prevConceptoHistoricos) {
            prevConceptoHistoricos.textContent = conceptoComisionHistoricos;
        }
        
        if (prevColacion) {
            prevColacion.textContent = colacionMensual ? 
                new Intl.NumberFormat('es-CL').format(colacionMensual) : '____________';
        }
        
        if (prevOtrosBeneficios) {
            prevOtrosBeneficios.textContent = otrosBeneficios || 'Sin beneficios adicionales especificados';
        }
    }

    updateSignaturePreview() {
        // La lógica de firmas se mantiene igual
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
        
        // Campos básicos requeridos para carta oferta
        const basicFields = [
            'fechaOferta', 'nombreCandidato', 'cargoOfrecido', 'nombreEmpresa',
            'dependenciaDirecta', 'fechaInicioPropuesta', 'funcionesResponsabilidades',
            'sueldoFijo3Meses', 'sueldoFijo4Mes', 'plazoContrato',
            'nombreGerenteGeneral', 'rutCandidato'
        ];
        
        totalFields += basicFields.length;
        
        basicFields.forEach(field => {
            const element = document.getElementById(field);
            if (element && element.value && element.value.trim() !== '') {
                filledFields++;
            }
        });
        
        // Checkboxes obligatorios
        const checkboxes = [
            'declaracionVeracidadOferta', 
            'declaracionCondicionesLaborales', 
            'declaracionLegislacionLaboral'
        ];
        totalFields += checkboxes.length;
        
        checkboxes.forEach(field => {
            const element = document.getElementById(field);
            if (element && element.checked) {
                filledFields++;
            }
        });
        
        let bonusScore = 0;
        
        // Bonus por firma digital
        if (systemState.firmasDigitales.candidato) bonusScore += 2;
        
        // Bonus por fotos carnet
        if (systemState.fotosCarnet.candidato.completed) bonusScore += 1;
        
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
        
        const requiredElements = ['firmaModalOverlay', 'firmaCandidato'];
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
        
        const btnFirmaCandidato = document.getElementById('firmaCandidato');
        
        if (!btnFirmaCandidato) {
            throw new Error('Botón de firma no encontrado');
        }
        
        btnFirmaCandidato.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('candidato');
        });
        
        console.log('✅ Botón de firma configurado correctamente');
    }

    openSignatureModalSafe(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        const nombreCandidato = document.getElementById('nombreCandidato').value;
        
        if (!nombreCandidato || !nombreCandidato.trim()) {
            this.showNotification('Complete el nombre del candidato antes de firmar', 'warning');
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
        
        const requiredElements = ['photoModalOverlay', 'photoCandidato'];
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
        
        const btnPhotoCandidato = document.getElementById('photoCandidato');
        
        if (!btnPhotoCandidato) {
            throw new Error('Botón de foto no encontrado');
        }
        
        btnPhotoCandidato.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('candidato');
        });
        
        console.log('✅ Botón de foto configurado correctamente');
    }

    openPhotoModalSafe(type) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        const nombreCandidato = document.getElementById('nombreCandidato').value;
        
        if (!nombreCandidato || !nombreCandidato.trim()) {
            this.showNotification('Complete el nombre del candidato antes de tomar fotos', 'warning');
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
            localStorage.setItem('carta_oferta_form_data', JSON.stringify(data));
        } catch (error) {
            console.warn('⚠️ No se pudo guardar automáticamente:', error);
        }
    }

    restoreFormState() {
        try {
            const savedData = localStorage.getItem('carta_oferta_form_data');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                Object.keys(data).forEach(field => {
                    if (field === 'firmasDigitales') {
                        systemState.firmasDigitales = data.firmasDigitales || { candidato: false };
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
        const fechaOferta = document.getElementById('fechaOferta');
        if (fechaOferta && !fechaOferta.value) {
            const today = new Date();
            fechaOferta.value = today.toISOString().split('T')[0];
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
                
                systemState.firmasDigitales = { candidato: false };
                systemState.fotosCarnet = {
                    candidato: { 
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
                this.showNotification('PDF de Carta Oferta Laboral generado exitosamente', 'success');
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
        const pageWidth = 170;
        const margin = 20;

        // Título centrado
        doc.setFont('times', 'bold');
        doc.setFontSize(18);
        doc.text('CARTA OFERTA LABORAL', 105, y, { align: 'center' });
        y += 20;

        // Obtener datos del formulario
        const fechaOferta = document.getElementById('fechaOferta').value;
        const nombreCandidato = document.getElementById('nombreCandidato').value || '_____________________';
        const cargoOfrecido = document.getElementById('cargoOfrecido').value || '_____________________';
        const nombreEmpresa = document.getElementById('nombreEmpresa').value || '_____________________';
        const dependenciaDirecta = document.getElementById('dependenciaDirecta').value || '_____________________';
        const fechaInicioPropuesta = document.getElementById('fechaInicioPropuesta').value;
        const funcionesResponsabilidades = document.getElementById('funcionesResponsabilidades').value || 'Por definir';

        // Fecha
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        doc.text(`Fecha: ${this.formatDateForPreview(fechaOferta)}`, margin, y);
        y += 10;

        doc.text(`Para: ${nombreCandidato}`, margin, y);
        y += 8;

        doc.text(`Cargo: ${cargoOfrecido}`, margin, y);
        y += 8;

        doc.text(`Empresa: ${nombreEmpresa}`, margin, y);
        y += 8;

        doc.text(`Dependencia Directa: ${dependenciaDirecta}`, margin, y);
        y += 8;

        doc.text(`Inicio de la propuesta: ${this.formatDateForPreview(fechaInicioPropuesta)}`, margin, y);
        y += 15;

        // Principales Funciones y Responsabilidades
        doc.setFont('times', 'bold');
        doc.text('Principales Funciones y Responsabilidades:', margin, y);
        y += 8;

        doc.setFont('times', 'normal');
        const funcionesLines = doc.splitTextToSize(funcionesResponsabilidades, pageWidth);
        doc.text(funcionesLines, margin, y);
        y += funcionesLines.length * 5 + 10;

        // Propuesta y Condiciones
        doc.setFont('times', 'bold');
        doc.text('Propuesta, Condiciones:', margin, y);
        y += 10;

        // Primeros tres meses
        const sueldoFijo3Meses = document.getElementById('sueldoFijo3Meses').value;
        const comisionPorcentaje3Meses = document.getElementById('comisionPorcentaje3Meses').value;
        const conceptoComision3Meses = document.getElementById('conceptoComision3Meses').value;

        doc.setFont('times', 'normal');
        doc.text('Tres primeros meses:', margin, y);
        y += 6;

        if (sueldoFijo3Meses) {
            const montoFormateado = new Intl.NumberFormat('es-CL').format(sueldoFijo3Meses);
            doc.text(`Sueldo fijo $${montoFormateado} líquido.`, margin + 5, y);
            y += 6;
        }

        if (comisionPorcentaje3Meses && conceptoComision3Meses) {
            doc.text(`Comisión del ${comisionPorcentaje3Meses}% ${conceptoComision3Meses}`, margin + 5, y);
            y += 8;
        }

        // Del cuarto mes en adelante
        const sueldoFijo4Mes = document.getElementById('sueldoFijo4Mes').value;
        const comisionClientesNuevos = document.getElementById('comisionClientesNuevos').value;
        const conceptoComisionNuevos = document.getElementById('conceptoComisionNuevos').value;
        const comisionClientesHistoricos = document.getElementById('comisionClientesHistoricos').value;
        const conceptoComisionHistoricos = document.getElementById('conceptoComisionHistoricos').value;

        doc.text('Del cuarto mes en adelante:', margin, y);
        y += 6;

        if (sueldoFijo4Mes) {
            const montoFormateado = new Intl.NumberFormat('es-CL').format(sueldoFijo4Mes);
            doc.text(`Sueldo fijo $${montoFormateado} líquido.`, margin + 5, y);
            y += 6;
        }

        if (comisionClientesNuevos && conceptoComisionNuevos) {
            doc.text(`Comisión del ${comisionClientesNuevos}% ${conceptoComisionNuevos}.`, margin + 5, y);
            y += 6;
        }

        if (comisionClientesHistoricos && conceptoComisionHistoricos) {
            doc.text(`Comisión del ${comisionClientesHistoricos}% ${conceptoComisionHistoricos}.`, margin + 5, y);
            y += 10;
        }

        // Beneficios adicionales
        const colacionMensual = document.getElementById('colacionMensual').value;
        const otrosBeneficios = document.getElementById('otrosBeneficios').value;

        doc.setFont('times', 'bold');
        doc.text('Además de los siguientes beneficios:', margin, y);
        y += 8;

        doc.setFont('times', 'normal');
        if (colacionMensual) {
            const montoFormateado = new Intl.NumberFormat('es-CL').format(colacionMensual);
            doc.text(`Por concepto de colación $${montoFormateado}.- pesos mensuales.`, margin, y);
            y += 6;
        }

        if (otrosBeneficios) {
            const beneficiosLines = doc.splitTextToSize(otrosBeneficios, pageWidth);
            doc.text(beneficiosLines, margin, y);
            y += beneficiosLines.length * 5 + 10;
        }

        // Plazo
        const plazoContrato = document.getElementById('plazoContrato').value;
        doc.setFont('times', 'bold');
        doc.text('Plazo:', margin, y);
        y += 8;

        doc.setFont('times', 'normal');
        doc.text(plazoContrato || '_____________________', margin, y);
        y += 20;

        // Verificar si necesitamos nueva página para firmas
        if (y > 180) {
            doc.addPage();
            y = 40;
        }

        // Sección de firmas
        this.addSignatureSection(doc, y);
        
        this.addDigitalWatermark(doc);
    }

    addSignatureSection(doc, y) {
        console.log('📄 Agregando sección de firmas al PDF...');
        
        // Verificar si necesitamos nueva página
        if (y > 160) {
            doc.addPage();
            y = 40;
        }

        const nombreGerenteGeneral = document.getElementById('nombreGerenteGeneral').value || '_____________________';
        const nombreSubGerente = document.getElementById('nombreSubGerente').value || '_____________________';
        const nombreGerenteComercial = document.getElementById('nombreGerenteComercial').value || '_____________________';
        
        const lineY = y;
        const spacing = 50;
        
        // Líneas de firma
        doc.line(30, lineY, 80, lineY);
        doc.line(110, lineY, 160, lineY);
        y += 8;
        
        // Nombres y cargos
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text(nombreGerenteGeneral, 55, y, { align: 'center' });
        doc.text(nombreSubGerente, 135, y, { align: 'center' });
        y += 5;
        
        doc.text('Gerente General', 55, y, { align: 'center' });
        doc.text('Sub-Gerente General', 135, y, { align: 'center' });
        y += 20;
        
        // Tercera firma
        doc.line(70, y, 120, y);
        y += 8;
        doc.text(nombreGerenteComercial, 95, y, { align: 'center' });
        y += 5;
        doc.text('Gerente Comercial', 95, y, { align: 'center' });
        y += 15;

        // Agregar firma digital del candidato si existe
        if (window.firmaProcessor) {
            try {
                const firmaCandidato = window.firmaProcessor.getSignatureForPDF('candidato');
                
                if (firmaCandidato) {
                    doc.addImage(firmaCandidato, 'PNG', 70, y - 40, 50, 20);
                    console.log('✅ Firma del candidato agregada al PDF');
                    
                    doc.setFont('times', 'italic');
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text('Documento con firma digital del candidato aplicada', 105, y + 10, { align: 'center' });
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
        doc.text('Documento con firma digital - Notaría Digital Chile', 105, 260, { align: 'center' });
        doc.text(`Generado el ${new Date().toLocaleString('es-CL')}`, 105, 265, { align: 'center' });
        doc.setTextColor(0, 0, 0);
    }

    generateFileName() {
        const nombreCandidato = document.getElementById('nombreCandidato').value;
        let nombreArchivo = 'CartaOfertaLaboral_';
        
        if (nombreCandidato) {
            nombreArchivo += nombreCandidato.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
        }
        
        const timestamp = new Date().toISOString().slice(0, 10);
        return `${nombreArchivo}_${timestamp}.pdf`;
    }

    validateFormWithSignature() {
        const emptyFields = [];
        
        // Campos básicos requeridos
        const basicRequiredFields = [
            'fechaOferta', 'nombreCandidato', 'cargoOfrecido', 'nombreEmpresa',
            'dependenciaDirecta', 'fechaInicioPropuesta', 'funcionesResponsabilidades',
            'sueldoFijo3Meses', 'sueldoFijo4Mes', 'plazoContrato',
            'nombreGerenteGeneral', 'rutCandidato'
        ];
        
        basicRequiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element || !element.value.trim()) {
                emptyFields.push(field);
            }
        });
        
        // Validar checkboxes obligatorios
        const checkboxes = [
            'declaracionVeracidadOferta', 
            'declaracionCondicionesLaborales', 
            'declaracionLegislacionLaboral'
        ];
        
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
        const rutCandidato = document.getElementById('rutCandidato').value;
        if (rutCandidato && !ConfigUtils.validateRUT(rutCandidato)) {
            issues.push('RUT del candidato inválido');
        }
        
        if (!systemState.firmasDigitales.candidato) {
            issues.push('Falta firma digital del candidato');
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

    // ===== SISTEMA DE NOTIFICACIONES (REUTILIZADO) =====
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

// ===== PROCESADORES REUTILIZADOS =====
// Los procesadores FirmaDigitalProcessor y PhotoCarnetDualProcessor se mantienen igual
// Solo se adaptan las referencias de 'suscriptor' a 'candidato' en el estado global

// ===== FUNCIONES GLOBALES =====
window.clearForm = function() {
    if (window.cartaOfertaSystem) {
        window.cartaOfertaSystem.clearForm();
    }
};

window.generatePDF = function() {
    if (window.cartaOfertaSystem) {
        window.cartaOfertaSystem.generatePDF();
    }
};

// ===== INICIALIZACIÓN DEL SISTEMA =====
let cartaOfertaSystem;

function initializeCartaOfertaSystem() {
    console.log('📋 Iniciando Sistema de Carta Oferta Laboral...');
    
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined') {
        console.warn('⚠️ jsPDF no está disponible, esperando...');
        setTimeout(initializeCartaOfertaSystem, 1000);
        return;
    }
    
    // Verificar que CONFIG esté disponible
    if (typeof CONFIG === 'undefined') {
        console.warn('⚠️ CONFIG no está disponible, esperando...');
        setTimeout(initializeCartaOfertaSystem, 1000);
        return;
    }
    
    try {
        cartaOfertaSystem = new CartaOfertaSystem();
        window.cartaOfertaSystem = cartaOfertaSystem;
        
        console.log('✅ Sistema completamente inicializado');
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        setTimeout(initializeCartaOfertaSystem, 2000);
    }
}

// ===== MÚLTIPLES PUNTOS DE INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCartaOfertaSystem);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initializeCartaOfertaSystem, 500);
}

window.addEventListener('load', () => {
    if (!window.cartaOfertaSystem) {
        console.log('🔄 Inicialización de respaldo activada');
        setTimeout(initializeCartaOfertaSystem, 1000);
    }
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', (event) => {
    console.error('❌ Error global capturado:', event.error);
    
    if (window.cartaOfertaSystem) {
        window.cartaOfertaSystem.showNotification(
            'Se detectó un error. El sistema intentará recuperarse automáticamente.', 
            'warning'
        );
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
    
    if (window.cartaOfertaSystem) {
        window.cartaOfertaSystem.showNotification(
            'Error de conectividad detectado. Algunos componentes pueden funcionar de forma limitada.', 
            'warning'
        );
    }
});

// ===== LOG FINAL =====
console.log('📜 Sistema de Carta Oferta Laboral - Script principal cargado correctamente');