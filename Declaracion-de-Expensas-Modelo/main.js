// ========================================
// 📋 SISTEMA PRINCIPAL DE DECLARACIÓN DE EXPENSAS
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'ciudadAutorizacion', 'fechaAutorizacion',
        'nombreAutorizante', 'rutAutorizante', 'domicilioAutorizante', 'comunaAutorizante', 'nacionalidadMenor', 'relacionMenor', 'viajaConPasaporte', 'telefonoAcompanante',
        'nombreMenor', 'rutMenor', 'paisDestino', 'motivoViaje', 'duracionViaje', 'edadMenor',
        'nombreAcompanante', 'ciudadDestino', 'rutAcompanante', 'relacionAcompanante', 'fechaNacimientoMenor', 'observacionesAdicionales',
        'domicilioMenor', 'comunaMenor', 'direccionDestino', 'medioTransporte', 'aerolinea', 'numeroVuelo',
        'numeroPasaporte', 'fechaSalida', 'fechaRegreso', 'vigenciaPasaporte', 'observacionesViaje'
    ],
    
    firmasDigitales: {
        autorizante: false,
        acompanante: false
    },
    
    fotosCarnet: {
        autorizante: {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        },
        acompanante: {
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
class ExpensasSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Declaración de Expensas...');
        
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
            'firmaAutorizante', 'photoAutorizante', 'photoAcompanante',
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
        this.setupCheckboxListeners();
        
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
        // Validación cédula/pasaporte declarante
        const rutAutorizante = document.getElementById('rutAutorizante');
        if (rutAutorizante) {
            rutAutorizante.addEventListener('input', (e) => {
                this.handleDocumentInput(e, 'rutAutorizante');
            });
        }

        // Validación cédula/pasaporte beneficiario
        const rutMenor = document.getElementById('rutMenor');
        if (rutMenor) {
            rutMenor.addEventListener('input', (e) => {
                this.handleDocumentInput(e, 'rutMenor');
            });
        }

        // Validación cédula/pasaporte beneficiario adicional
        const rutAcompanante = document.getElementById('rutAcompanante');
        if (rutAcompanante) {
            rutAcompanante.addEventListener('input', (e) => {
                this.handleDocumentInput(e, 'rutAcompanante');
            });
        }

        // Validar edad
        const edadMenor = document.getElementById('edadMenor');
        if (edadMenor) {
            edadMenor.addEventListener('input', () => {
                this.validateAge(edadMenor);
            });
        }

        // Validar edad beneficiario adicional
        const fechaNacimientoMenor = document.getElementById('fechaNacimientoMenor');
        if (fechaNacimientoMenor) {
            fechaNacimientoMenor.addEventListener('input', () => {
                this.validateAge(fechaNacimientoMenor);
            });
        }

        // Auto-llenar fecha actual
        const fechaAutorizacion = document.getElementById('fechaAutorizacion');
        if (fechaAutorizacion) {
            fechaAutorizacion.addEventListener('change', () => {
                this.updatePreview();
            });
        }

        // Control de teléfono
        const telefonoAcompanante = document.getElementById('telefonoAcompanante');
        if (telefonoAcompanante) {
            telefonoAcompanante.addEventListener('input', (e) => {
                this.formatPhone(e);
            });
        }

        // Control de ingresos
        const numeroPasaporte = document.getElementById('numeroPasaporte');
        if (numeroPasaporte) {
            numeroPasaporte.addEventListener('input', (e) => {
                this.formatMoney(e);
            });
        }

        // Control de costo estimado
        const vigenciaPasaporte = document.getElementById('vigenciaPasaporte');
        if (vigenciaPasaporte) {
            vigenciaPasaporte.addEventListener('input', (e) => {
                this.formatMoney(e);
            });
        }

        // Validar relación mismo domicilio
        const aerolinea = document.getElementById('aerolinea');
        if (aerolinea) {
            aerolinea.addEventListener('change', () => {
                this.handleSameDomicilio();
            });
        }
    }

    setupCheckboxListeners() {
        const checkboxes = ['alimentacion', 'vivienda', 'vestimenta', 'salud', 'educacion', 'transporte'];
        
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.updateGastosCubiertos();
                });
            }
        });
    }

    handleDocumentInput(event, fieldId) {
        let value = event.target.value;
        
        // Detectar si es RUT chileno o documento extranjero
        if (this.isChileanRUT(value)) {
            const formatted = ConfigUtils.formatRUT(value);
            event.target.value = formatted;
            
            if (formatted.length > 8) {
                const isValid = ConfigUtils.validateRUT(formatted);
                event.target.classList.toggle('rut-valid', isValid);
                event.target.classList.toggle('rut-invalid', !isValid);
            } else {
                event.target.classList.remove('rut-valid', 'rut-invalid');
            }
        } else {
            // Es documento extranjero, validar formato básico
            event.target.classList.toggle('rut-valid', value.length >= 5);
            event.target.classList.toggle('rut-invalid', value.length > 0 && value.length < 5);
        }
        
        this.updatePreview();
        this.checkForDuplicateDocuments();
    }

    isChileanRUT(value) {
        // Detectar si el valor parece ser un RUT chileno
        return /^[0-9]+[-|‐]{0,1}[0-9kK]{0,1}$/.test(value.replace(/\./g, ''));
    }

    validateAge(ageField) {
        const age = parseInt(ageField.value);
        if (!isNaN(age) && age >= 0 && age <= 120) {
            ageField.classList.add('age-valid');
            ageField.classList.remove('age-invalid');
        } else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initializeExpensasSystem, 500);
}

window.addEventListener('load', () => {
    if (!window.expensasSystem) {
        console.log('🔄 Inicialización de respaldo activada');
        setTimeout(initializeExpensasSystem, 1000);
    }
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', (event) => {
    console.error('❌ Error global capturado:', event.error);
    
    if (window.expensasSystem) {
        window.expensasSystem.showNotification(
            'Se detectó un error. El sistema intentará recuperarse automáticamente.', 
            'warning'
        );
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
    
    if (window.expensasSystem) {
        window.expensasSystem.showNotification(
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

// ===== UTILIDADES DE DEPURACIÓN =====
if (CONFIG.DEBUG.enabled) {
    window.debugExpensas = {
        getSystemState: () => systemState,
        getConfig: () => CONFIG,
        clearStorage: () => {
            localStorage.removeItem('expensas_form_data');
            console.log('🗑️ Almacenamiento local limpiado');
        },
        simulateError: (type = 'general') => {
            switch (type) {
                case 'camera':
                    throw new Error('Error simulado de cámara');
                case 'signature':
                    throw new Error('Error simulado de firma');
                case 'pdf':
                    throw new Error('Error simulado de PDF');
                default:
                    throw new Error('Error simulado general');
            }
        },
        testValidations: () => {
            console.log('🧪 Pruebas de validación:');
            console.log('RUT válido:', ConfigUtils.validateRUT('12.345.678-5'));
            console.log('RUT inválido:', ConfigUtils.validateRUT('12.345.678-0'));
            console.log('Fecha válida:', ConfigUtils.validateDate('2024-12-25'));
            console.log('Fecha inválida:', ConfigUtils.validateDate('2024-13-45'));
        },
        forceTheme: (theme) => {
            if (window.expensasSystem) {
                window.expensasSystem.applyTheme(theme);
                console.log(`🎨 Tema forzado a: ${theme}`);
            }
        },
        testDocumentValidation: () => {
            console.log('🧪 Pruebas de documentos:');
            const testDoc1 = '12.345.678-9';
            const testDoc2 = 'AA1234567';
            console.log(`${testDoc1} es RUT chileno:`, window.expensasSystem.isChileanRUT(testDoc1));
            console.log(`${testDoc2} es RUT chileno:`, window.expensasSystem.isChileanRUT(testDoc2));
        }
    };
    
    console.log('🐛 Modo debug activado. Usa window.debugExpensas para herramientas de desarrollo.');
}

// ===== PERFORMANCE MONITORING =====
if (CONFIG.DEBUG.show_performance) {
    const performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
            if (entry.duration > 100) { // Solo mostrar operaciones que tomen más de 100ms
                console.log(`⏱️ Performance: ${entry.name} tomó ${entry.duration.toFixed(2)}ms`);
            }
        });
    });
    
    performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
}

// ===== DETECCIÓN DE ACCESIBILIDAD =====
const accessibilityPrefs = ConfigUtils.detectAccessibilityPreferences();
if (accessibilityPrefs.reducedMotion) {
    document.documentElement.style.setProperty('--transition-fast', 'none');
    document.documentElement.style.setProperty('--transition-normal', 'none');
    document.documentElement.style.setProperty('--transition-slow', 'none');
    console.log('♿ Animaciones reducidas por preferencias de accesibilidad');
}

// ===== LIMPIEZA AL CERRAR =====
window.addEventListener('beforeunload', () => {
    if (window.expensasSystem) {
        window.expensasSystem.stopAutoSave();
    }
    
    if (window.photoProcessor) {
        window.photoProcessor.stopCamera();
    }
});

// ===== LOG FINAL =====
console.log('📜 Sistema de Declaración de Expensas - Script principal cargado correctamente');ageField.value) {
            ageField.classList.add('age-invalid');
            ageField.classList.remove('age-valid');
        } else {
            ageField.classList.remove('age-valid', 'age-invalid');
        }
        this.updatePreview();
    }

    formatPhone(event) {
        let value = event.target.value.replace(/\D/g, '');
        if (value.startsWith('56')) {
            value = '+' + value;
        } else if (value.startsWith('9')) {
            value = '+56 ' + value;
        }
        event.target.value = value;
    }

    formatMoney(event) {
        let value = event.target.value.replace(/\D/g, '');
        if (value) {
            value = parseInt(value).toLocaleString('es-CL');
        }
        event.target.value = value;
    }

    handleSameDomicilio() {
        const sameDomicilio = document.getElementById('aerolinea').value;
        const domicilioMenor = document.getElementById('domicilioMenor');
        const comunaMenor = document.getElementById('comunaMenor');
        const domicilioAutorizante = document.getElementById('domicilioAutorizante').value;
        const comunaAutorizante = document.getElementById('comunaAutorizante').value;
        
        if (sameDomicilio === 'si' && domicilioAutorizante && comunaAutorizante) {
            if (domicilioMenor) domicilioMenor.value = domicilioAutorizante;
            if (comunaMenor) comunaMenor.value = comunaAutorizante;
            this.updatePreview();
        }
    }

    checkForDuplicateDocuments() {
        const rutDeclarante = document.getElementById('rutAutorizante').value;
        const rutBeneficiario = document.getElementById('rutMenor').value;
        const rutBeneficiario2 = document.getElementById('rutAcompanante').value;
        
        const documents = [rutDeclarante, rutBeneficiario, rutBeneficiario2]
            .filter(doc => doc && doc.length > 5);
        
        const uniqueDocuments = [...new Set(documents)];
        
        if (documents.length !== uniqueDocuments.length) {
            this.showNotification('Los documentos de identidad no pueden ser duplicados', 'warning');
        }
    }

    updateGastosCubiertos() {
        const checkboxes = ['alimentacion', 'vivienda', 'vestimenta', 'salud', 'educacion', 'transporte'];
        const gastosCubiertos = document.getElementById('gastosCubiertos');
        
        const checked = checkboxes.filter(id => {
            const checkbox = document.getElementById(id);
            return checkbox && checkbox.checked;
        });
        
        if (gastosCubiertos) {
            if (checked.length > 0) {
                const labels = {
                    'alimentacion': 'Alimentación',
                    'vivienda': 'Vivienda',
                    'vestimenta': 'Vestimenta',
                    'salud': 'Salud',
                    'educacion': 'Educación',
                    'transporte': 'Transporte'
                };
                
                const checkedLabels = checked.map(id => labels[id]);
                gastosCubiertos.textContent = checkedLabels.join(', ');
            } else {
                gastosCubiertos.textContent = 'No especificados';
            }
        }
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
        this.updateBeneficiariosAdicionales();
        this.updateGastosCubiertos();
        this.updateProgress();
    }

    updateDuplicateReferences() {
        const nombreDeclarante = document.getElementById('nombreAutorizante').value;
        const rutDeclarante = document.getElementById('rutAutorizante').value;
        
        const prev_nombreAutorizante2 = document.getElementById('prev_nombreAutorizante2');
        const prev_rutAutorizante2 = document.getElementById('prev_rutAutorizante2');
        
        if (prev_nombreAutorizante2) prev_nombreAutorizante2.textContent = nombreDeclarante || '........................';
        if (prev_rutAutorizante2) prev_rutAutorizante2.textContent = rutDeclarante || '................';
    }

    updateDatePreview() {
        const fechaComparecencia = document.getElementById('fechaAutorizacion').value;
        
        if (fechaComparecencia && ConfigUtils.validateDate(fechaComparecencia)) {
            const date = new Date(fechaComparecencia);
            
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
            
            if (prev_dia) prev_dia.textContent = '...';
            if (prev_mes) prev_mes.textContent = '........';
            if (prev_anio) prev_anio.textContent = '20..';
        }
    }

    updateSignatureNames() {
        const nombreDeclarante = document.getElementById('nombreAutorizante').value;
        const firmaDeclarante = document.getElementById('prev_firmaAutorizante');
        
        if (firmaDeclarante) {
            firmaDeclarante.textContent = nombreDeclarante || '_______________';
        }
    }

    updateBeneficiariosAdicionales() {
        const nombreBeneficiario2 = document.getElementById('nombreAcompanante').value;
        const beneficiariosSection = document.getElementById('beneficiariosAdicionales');
        
        if (beneficiariosSection) {
            if (nombreBeneficiario2) {
                beneficiariosSection.style.display = 'block';
            } else {
                beneficiariosSection.style.display = 'none';
            }
        }
    }

    getPlaceholderText(field) {
        const placeholders = {
            'ciudadAutorizacion': '.........',
            'nombreAutorizante': '.........................',
            'rutAutorizante': '................',
            'nacionalidadMenor': '.........................',
            'domicilioAutorizante': '.........................',
            'comunaAutorizante': '...........',
            'telefonoAcompanante': '...........',
            'nombreMenor': '.........................',
            'rutMenor': '................',
            'paisDestino': '.........................',
            'motivoViaje': '.........................',
            'duracionViaje': '.........................',
            'edadMenor': '...',
            'nombreAcompanante': '.........................',
            'ciudadDestino': '.........................',
            'rutAcompanante': '................',
            'relacionAcompanante': '.........................',
            'fechaNacimientoMenor': '...',
            'observacionesAdicionales': '........................',
            'domicilioMenor': '.........................',
            'comunaMenor': '...........',
            'direccionDestino': '.........................',
            'medioTransporte': '.........................',
            'aerolinea': '.........................',
            'numeroVuelo': '...........',
            'numeroPasaporte': '..................',
            'fechaSalida': '.........................',
            'fechaRegreso': '.........................',
            'vigenciaPasaporte': '..................',
            'observacionesViaje': '........................................................................................',
            'relacionMenor': '.........................',
            'viajaConPasaporte': '.........................'
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
        
        // Agregar puntuación por checkboxes
        const checkboxes = ['alimentacion', 'vivienda', 'vestimenta', 'salud', 'educacion', 'transporte'];
        const checkedBoxes = checkboxes.filter(id => {
            const checkbox = document.getElementById(id);
            return checkbox && checkbox.checked;
        }).length;
        
        if (checkedBoxes > 0) filledFields += 1;
        
        let bonusScore = 0;
        
        if (systemState.firmasDigitales.autorizante) bonusScore += 1;
        if (systemState.fotosCarnet.autorizante.completed) bonusScore += 1;
        if (systemState.fotosCarnet.acompanante.completed) bonusScore += 0.5;
        
        const progress = ((filledFields + bonusScore) / (totalFields + 2.5)) * 100;
        
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
        
        const requiredElements = ['firmaModalOverlay', 'firmaAutorizante'];
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
        
        const btnFirmaDeclarante = document.getElementById('firmaAutorizante');
        
        if (!btnFirmaDeclarante) {
            throw new Error('Botón de firma no encontrado');
        }
        
        btnFirmaDeclarante.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('autorizante');
        });
        
        console.log('✅ Botón de firma configurado correctamente');
    }

    openSignatureModalSafe(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        const nombreField = document.getElementById('nombreAutorizante');
        
        if (!nombreField || !nombreField.value.trim()) {
            this.showNotification('Complete el nombre del declarante antes de firmar', 'warning');
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
        
        const requiredElements = ['photoModalOverlay', 'photoAutorizante', 'photoAcompanante'];
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
        
        const btnPhotoDeclarante = document.getElementById('photoAutorizante');
        const btnPhotoBeneficiario = document.getElementById('photoAcompanante');
        
        if (!btnPhotoDeclarante || !btnPhotoBeneficiario) {
            throw new Error('Botones de foto no encontrados');
        }
        
        btnPhotoDeclarante.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('autorizante');
        });
        
        btnPhotoBeneficiario.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('acompanante');
        });
        
        console.log('✅ Botones de foto configurados correctamente');
    }

    openPhotoModalSafe(type) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        let nombreField;
        let entityName;
        
        if (type === 'autorizante') {
            nombreField = document.getElementById('nombreAutorizante');
            entityName = 'declarante';
        } else {
            nombreField = document.getElementById('nombreMenor');
            entityName = 'beneficiario';
        }
        
        if (!nombreField || !nombreField.value.trim()) {
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
        
        // Guardar estado de checkboxes
        const checkboxes = ['alimentacion', 'vivienda', 'vestimenta', 'salud', 'educacion', 'transporte'];
        data.checkboxes = {};
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                data.checkboxes[id] = checkbox.checked;
            }
        });
        
        data.firmasDigitales = systemState.firmasDigitales;
        data.fotosCarnet = systemState.fotosCarnet;
        data.timestamp = new Date().toISOString();
        
        try {
            localStorage.setItem('expensas_form_data', JSON.stringify(data));
        } catch (error) {
            console.warn('⚠️ No se pudo guardar automáticamente:', error);
        }
    }

    restoreFormState() {
        try {
            const savedData = localStorage.getItem('expensas_form_data');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                Object.keys(data).forEach(field => {
                    if (field === 'firmasDigitales') {
                        systemState.firmasDigitales = data.firmasDigitales || { autorizante: false, acompanante: false };
                    } else if (field === 'fotosCarnet') {
                        systemState.fotosCarnet = data.fotosCarnet || systemState.fotosCarnet;
                    } else if (field === 'checkboxes') {
                        Object.keys(data.checkboxes || {}).forEach(checkboxId => {
                            const checkbox = document.getElementById(checkboxId);
                            if (checkbox) {
                                checkbox.checked = data.checkboxes[checkboxId];
                            }
                        });
                    } else if (field !== 'timestamp') {
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
            console.warn('⚠️ No se pudo restaurar el formulario:', error);
        }
    }

    hasUnsavedChanges() {
        return false;
    }

    // ===== FUNCIONES DE UTILIDAD =====
    initializeFormFields() {
        const fechaComparecencia = document.getElementById('fechaAutorizacion');
        if (fechaComparecencia && !fechaComparecencia.value) {
            const today = new Date().toISOString().split('T')[0];
            fechaComparecencia.value = today;
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
                        element.classList.remove('rut-valid', 'rut-invalid', 'age-valid', 'age-invalid');
                    }
                });
                
                // Limpiar checkboxes
                const checkboxes = ['alimentacion', 'vivienda', 'vestimenta', 'salud', 'educacion', 'transporte'];
                checkboxes.forEach(id => {
                    const checkbox = document.getElementById(id);
                    if (checkbox) checkbox.checked = false;
                });
                
                const fechaComparecencia = document.getElementById('fechaAutorizacion');
                if (fechaComparecencia) {
                    const today = new Date().toISOString().split('T')[0];
                    fechaComparecencia.value = today;
                }
                
                systemState.firmasDigitales = { autorizante: false, acompanante: false };
                systemState.fotosCarnet = {
                    autorizante: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false },
                    acompanante: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false }
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
                this.showNotification('PDF de Declaración de Expensas generado exitosamente', 'success');
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

        // Título centrado y destacado
        doc.setFont('times', 'bold');
        doc.setFontSize(18);
        doc.text('DECLARACIÓN DE EXPENSAS', 105, y, { align: 'center' });
        y += 15;
        
        doc.setFontSize(14);
        doc.text('Modelo 2', 105, y, { align: 'center' });
        y += 30;

        // Contenido principal
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        
        // Datos básicos
        const ciudad = document.getElementById('ciudadAutorizacion').value;
        const fecha = document.getElementById('fechaAutorizacion').value;
        const nombreDeclarante = document.getElementById('nombreAutorizante').value;
        const nacionalidadDeclarante = document.getElementById('nacionalidadMenor').value;
        const rutDeclarante = document.getElementById('rutAutorizante').value;
        const residenciaDeclarante = document.getElementById('relacionMenor').value;
        const estadoCivil = document.getElementById('viajaConPasaporte').value;
        const domicilioDeclarante = document.getElementById('domicilioAutorizante').value;
        const comunaDeclarante = document.getElementById('comunaAutorizante').value;
        
        // Datos beneficiario
        const relacionBeneficiario = document.getElementById('motivoViaje').value;
        const nombreBeneficiario = document.getElementById('nombreMenor').value;
        const nacionalidadBeneficiario = document.getElementById('paisDestino').value;
        const rutBeneficiario = document.getElementById('rutMenor').value;
        const duracionPermanencia = document.getElementById('duracionViaje').value;
        const domicilioBeneficiario = document.getElementById('domicilioMenor').value;
        const comunaBeneficiario = document.getElementById('comunaMenor').value;

        // Párrafo principal
        const fechaObj = new Date(fecha);
        const parrafo1 = `En ${ciudad}, a ${fechaObj.getDate()} de ${this.mesesEspanol[fechaObj.getMonth()]} de ${fechaObj.getFullYear()}, comparece: Don/a ${nombreDeclarante}, de nacionalidad ${nacionalidadDeclarante}, cédula de identidad para extranjeros N° ${rutDeclarante}, con residencia ${residenciaDeclarante}, ${estadoCivil}, con domicilio en ${domicilioDeclarante}, comuna de ${comunaDeclarante}, y de paso por esta; mayor de edad, quien acredita su identidad con su mencionada cédula y declara:`;
        
        doc.text(parrafo1, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, parrafo1, pageWidth - 2 * margin) + 15;

        // Declaración principal
        const parrafo2 = `Que asumiré todos los costos de mantención en Chile, de ${relacionBeneficiario}, ${nombreBeneficiario}, de nacionalidad ${nacionalidadBeneficiario}, cédula de identidad o pasaporte N° ${rutBeneficiario}, por un período de permanencia ${duracionPermanencia}, quien vive a mis expensas y en mi mismo domicilio, ubicado en ${domicilioBeneficiario}, comuna de ${comunaBeneficiario}.`;
        
        doc.text(parrafo2, margin, y, {maxWidth: pageWidth - 2 * margin});
        y += this.calculateTextHeight(doc, parrafo2, pageWidth - 2 * margin) + 15;

        // Beneficiarios adicionales si existen
        const nombreBeneficiario2 = document.getElementById('nombreAcompanante').value;
        if (nombreBeneficiario2) {
            const nacionalidadBeneficiario2 = document.getElementById('ciudadDestino').value;
            const rutBeneficiario2 = document.getElementById('rutAcompanante').value;
            const relacionBeneficiario2 = document.getElementById('relacionAcompanante').value;
            
            doc.setFont('times', 'bold');
            doc.text('Beneficiarios Adicionales:', margin, y);
            y += 8;
            
            doc.setFont('times', 'normal');
            const parrafoAdicional = `También me hago responsable de los gastos de mantención de ${nombreBeneficiario2}, de nacionalidad ${nacionalidadBeneficiario2}, cédula de identidad o pasaporte N° ${rutBeneficiario2}, ${relacionBeneficiario2}.`;
            
            doc.text(parrafoAdicional, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, parrafoAdicional, pageWidth - 2 * margin) + 15;
        }

        // Información económica
        const ingreso = document.getElementById('numeroPasaporte').value;
        const ocupacion = document.getElementById('fechaSalida').value;
        const costoEstimado = document.getElementById('vigenciaPasaporte').value;
        
        if (ingreso || ocupacion || costoEstimado) {
            doc.setFillColor(59, 130, 246, 0.1);
            doc.rect(margin, y - 5, pageWidth - 2 * margin, 25, 'F');
            doc.setDrawColor(59, 130, 246);
            doc.rect(margin, y - 5, pageWidth - 2 * margin, 25);
            
            doc.setFont('times', 'bold');
            doc.setFontSize(11);
            doc.text('INFORMACIÓN ECONÓMICA:', margin + 5, y + 5);
            
            doc.setFont('times', 'normal');
            doc.setFontSize(10);
            if (ingreso) doc.text(`Ingreso mensual declarado: $${ingreso}`, margin + 5, y + 12);
            if (ocupacion) doc.text(`Ocupación: ${ocupacion}`, margin + 5, y + 18);
            if (costoEstimado) doc.text(`Costo estimado por beneficiario: $${costoEstimado} mensuales`, margin + 5, y + 24);
            
            y += 35;
        }

        // Gastos que cubrirá
        const checkboxes = ['alimentacion', 'vivienda', 'vestimenta', 'salud', 'educacion', 'transporte'];
        const gastosCubiertos = checkboxes.filter(id => {
            const checkbox = document.getElementById(id);
            return checkbox && checkbox.checked;
        });
        
        if (gastosCubiertos.length > 0) {
            doc.setFont('times', 'bold');
            doc.text('Gastos que cubrirá:', margin, y);
            y += 8;
            
            doc.setFont('times', 'normal');
            const labels = {
                'alimentacion': 'Alimentación',
                'vivienda': 'Vivienda',
                'vestimenta': 'Vestimenta',
                'salud': 'Salud',
                'educacion': 'Educación',
                'transporte': 'Transporte'
            };
            
            const gastosTexto = gastosCubiertos.map(id => labels[id]).join(', ');
            doc.text(gastosTexto, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, gastosTexto, pageWidth - 2 * margin) + 10;
        }

        // Observaciones
        const observaciones = document.getElementById('observacionesViaje').value;
        if (observaciones) {
            doc.setFont('times', 'bold');
            doc.text('Observaciones:', margin, y);
            y += 8;
            
            doc.setFont('times', 'normal');
            doc.text(observaciones, margin, y, {maxWidth: pageWidth - 2 * margin});
            y += this.calculateTextHeight(doc, observaciones, pageWidth - 2 * margin) + 15;
        }

        // Verificar si necesitamos nueva página
        if (y > 200) {
            doc.addPage();
            y = 30;
        }

        // "Para constancia firma"
        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        doc.text('Para constancia firma,', 105, y, { align: 'center' });
        y += 30;

        // Firma
        this.addSignatureSection(doc, y);
        
        // Nota legal
        if (y > 180) {
            doc.addPage();
            y = 30;
        } else {
            y += 80;
        }

        // Línea para notario
        doc.setDrawColor(59, 130, 246);
        doc.line(75, y, 135, y);
        y += 8;
        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        doc.text('NOTARIO', 105, y, { align: 'center' });
        y += 20;

        doc.setFont('times', 'italic');
        doc.setFontSize(9);
        doc.text('Nota Legal: Esta declaración de expensas tiene validez legal y constituye un compromiso formal del declarante de asumir todos los gastos de manutención del o los beneficiarios indicados durante su permanencia en Chile. El incumplimiento de esta declaración puede tener consecuencias legales y migratorias.', margin, y, {maxWidth: pageWidth - 2 * margin});
        
        this.addDigitalWatermark(doc);
    }

    addSignatureSection(doc, y) {
        console.log('📄 Agregando sección de firma al PDF...');
        
        // Centrar la firma
        const centerX = 105;
        
        // Línea de firma
        doc.line(centerX - 25, y, centerX + 25, y);
        y += 8;
        
        // Nombre
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        const nombreDeclarante = document.getElementById('nombreAutorizante').value;
        
        doc.text(nombreDeclarante, centerX, y, { align: 'center' });
        y += 6;
        
        // Rol
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('DECLARANTE', centerX, y, { align: 'center' });
        y += 6;
        
        // RUT
        const rutDeclarante = document.getElementById('rutAutorizante').value;
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.text(`${rutDeclarante}`, centerX, y, { align: 'center' });
        
        // Agregar firma digital si existe
        if (window.firmaProcessor) {
            try {
                const firmaDeclarante = window.firmaProcessor.getSignatureForPDF('autorizante');
                
                if (firmaDeclarante) {
                    doc.addImage(firmaDeclarante, 'PNG', centerX - 25, y - 35, 50, 25);
                    console.log('✅ Firma del declarante agregada al PDF');
                    
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
        return lines.length * 5;
    }

    generateFileName() {
        const nombreDeclarante = document.getElementById('nombreAutorizante').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const nombreBeneficiario = document.getElementById('nombreMenor').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const timestamp = new Date().toISOString().slice(0, 10);
        return `Declaracion_Expensas_${nombreDeclarante}_${nombreBeneficiario}_${timestamp}.pdf`;
    }

    validateFormWithSignatures() {
        const emptyFields = [];
        
        // Campos mínimos requeridos
        const requiredFields = [
            'ciudadAutorizacion', 'fechaAutorizacion',
            'nombreAutorizante', 'rutAutorizante', 'nacionalidadMenor', 'domicilioAutorizante', 'comunaAutorizante',
            'nombreMenor', 'rutMenor', 'paisDestino', 'motivoViaje', 'duracionViaje',
            'domicilioMenor', 'comunaMenor'
        ];
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element || !element.value.trim()) {
                emptyFields.push(field);
            }
        });
        
        const issues = [];
        
        if (emptyFields.length > 0) {
            issues.push(`Complete ${emptyFields.length} campos requeridos`);
        }
        
        // Validaciones específicas
        const rutDeclarante = document.getElementById('rutAutorizante').value;
        const rutBeneficiario = document.getElementById('rutMenor').value;
        
        if (rutDeclarante && this.isChileanRUT(rutDeclarante) && !ConfigUtils.validateRUT(rutDeclarante)) {
            issues.push('RUT del declarante inválido');
        }
        
        if (rutBeneficiario && this.isChileanRUT(rutBeneficiario) && !ConfigUtils.validateRUT(rutBeneficiario)) {
            issues.push('RUT del beneficiario inválido');
        }
        
        // Verificar documentos duplicados
        if (rutDeclarante && rutBeneficiario && rutDeclarante === rutBeneficiario) {
            issues.push('El declarante y beneficiario no pueden tener el mismo documento');
        }
        
        // Validar edades
        const edadBeneficiario = parseInt(document.getElementById('edadMenor').value);
        if (isNaN(edadBeneficiario) || edadBeneficiario < 0 || edadBeneficiario > 120) {
            issues.push('Edad del beneficiario debe ser válida (0-120)');
        }
        
        if (!systemState.firmasDigitales.autorizante) {
            issues.push('Falta firma digital del declarante');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

// ===== CLASES PROCESADORAS (MISMO CÓDIGO QUE ANTES) =====

// Clase procesador de firmas digitales (reutilizada)
class FirmaDigitalProcessor {
    constructor() {
        this.processedImageData = null;
        this.currentType = null;
        this.firmasDigitales = {
            autorizante: null,
            acompanante: null
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
            
            if (window.expensasSystem) {
                window.expensasSystem.updateProgress();
            }
            
            this.closeModal();
            
            if (window.expensasSystem) {
                window.expensasSystem.showNotification('Firma digital aplicada correctamente', 'success');
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
        this.firmasDigitales.autorizante = null;
        this.firmasDigitales.acompanante = null;
        
        systemState.firmasDigitales = { autorizante: false, acompanante: false };
        
        ['autorizante'].forEach(type => {
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

// Clase procesador de fotos carnet (reutilizada)
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
        
        if (window.expensasSystem) {
            window.expensasSystem.showNotification(errorMessage, 'error');
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
            
            if (window.expensasSystem) {
                window.expensasSystem.showNotification(`Foto del ${this.currentStep} capturada`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            if (window.expensasSystem) {
                window.expensasSystem.showNotification('Error al capturar la foto', 'error');
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
            if (window.expensasSystem) {
                window.expensasSystem.showNotification('Ahora capture el reverso del carnet', 'info');
            }
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            this.currentStep = 'completed';
            this.showSummary();
            if (window.expensasSystem) {
                window.expensasSystem.showNotification('Ambas fotos capturadas', 'success');
            }
        }
    }

    restartProcess() {
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        if (window.expensasSystem) {
            window.expensasSystem.showNotification('Proceso reiniciado', 'info');
        }
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            if (window.expensasSystem) {
                window.expensasSystem.showNotification('Faltan fotos por capturar', 'error');
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
            
            if (window.expensasSystem) {
                window.expensasSystem.updateProgress();
            }

            this.closeModal();
            
            if (window.expensasSystem) {
                const entityName = this.currentType === 'autorizante' ? 'declarante' : 'beneficiario';
                window.expensasSystem.showNotification(`Carnet completo del ${entityName} guardado`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al confirmar fotos:', error);
            if (window.expensasSystem) {
                window.expensasSystem.showNotification('Error al procesar las fotos', 'error');
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
                    if (type === 'autorizante') {
                        textElement.textContent = 'FOTOS COMPLETAS';
                    } else {
                        textElement.textContent = 'FOTOS BENEFICIARIO';
                    }
                } else {
                    button.classList.remove('uploaded');
                    if (type === 'autorizante') {
                        textElement.textContent = 'FOTO CARNET';
                    } else {
                        textElement.textContent = 'FOTO BENEFICIARIO';
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
        ['autorizante', 'acompanante'].forEach(type => {
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
    if (window.expensasSystem) {
        window.expensasSystem.clearForm();
    }
};

window.generatePDF = function() {
    if (window.expensasSystem) {
        window.expensasSystem.generatePDF();
    }
};

// ===== INICIALIZACIÓN DEL SISTEMA =====
let expensasSystem;

function initializeExpensasSystem() {
    console.log('📋 Iniciando Sistema de Declaración de Expensas...');
    
    if (typeof window.jspdf === 'undefined') {
        console.warn('⚠️ jsPDF no está disponible, esperando...');
        setTimeout(initializeExpensasSystem, 1000);
        return;
    }
    
    if (typeof CONFIG === 'undefined') {
        console.warn('⚠️ CONFIG no está disponible, esperando...');
        setTimeout(initializeExpensasSystem, 1000);
        return;
    }
    
    try {
        expensasSystem = new ExpensasSystem();
        window.expensasSystem = expensasSystem;
        
        console.log('✅ Sistema completamente inicializado');
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        setTimeout(initializeExpensasSystem, 2000);
    }
}

// ===== MÚLTIPLES PUNTOS DE INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExpensasSystem);
} else if (