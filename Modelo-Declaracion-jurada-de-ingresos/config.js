// ========================================
// 📋 CONFIGURACIÓN DEL SISTEMA DE DECLARACIÓN JURADA DE INGRESOS
// ========================================

const CONFIG = {
    // ===== CONFIGURACIÓN GENERAL =====
    APP: {
        name: 'Notaría Digital - Declaración Jurada de Ingresos',
        version: '1.0.0',
        author: 'Sistema Notarial Digital Chile',
        description: 'Sistema profesional para generar declaraciones juradas de ingresos con firma digital'
    },

    // ===== CONFIGURACIÓN DE SEGURIDAD =====
    SECURITY: {
        max_file_size: 5 * 1024 * 1024, // 5MB máximo para imágenes
        allowed_image_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        max_signature_width: 800,
        max_signature_height: 400,
        max_photo_width: 1280,
        max_photo_height: 720,
        compression_quality: 0.85
    },

    // ===== CONFIGURACIÓN DE AUTOGUARDADO =====
    AUTOSAVE: {
        enabled: true,
        interval: 30000, // 30 segundos
        key: 'declaracion_jurada_form_data',
        max_history: 5
    },

    // ===== CONFIGURACIÓN DE VALIDACIÓN =====
    VALIDATION: {
        rut: {
            min_length: 8,
            max_length: 12,
            format: /^[0-9]+[-|‐]{1}[0-9kK]{1}$/
        },
        names: {
            min_length: 2,
            max_length: 100,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.]+$/
        },
        address: {
            min_length: 10,
            max_length: 200,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\.\,\-\#]+$/
        },
        monto_ingreso: {
            min: 0,
            max: 999999999.99,
            pattern: /^\d+(\.\d{1,2})?$/
        },
        concepto_ingreso: {
            min_length: 5,
            max_length: 200,
            required_concepts: [
                'Sueldo o salario por trabajo dependiente',
                'Honorarios por servicios profesionales',
                'Ingresos por actividad comercial',
                'Pensión de jubilación',
                'Pensión de invalidez',
                'Arriendo de propiedades',
                'Dividendos e inversiones',
                'Subsidio del Estado',
                'Otros ingresos'
            ]
        },
        ciudad: {
            min_length: 2,
            max_length: 50,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.]+$/
        }
    },

    // ===== MESES EN ESPAÑOL =====
    MONTHS: [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ],

    // ===== DÍAS DE LA SEMANA =====
    DAYS: [
        'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
    ],

    // ===== CONFIGURACIÓN DE NOTIFICACIONES =====
    NOTIFICATIONS: {
        duration: 4000, // 4 segundos
        position: 'top-right',
        max_stack: 3,
        icons: {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        }
    },

    // ===== CONFIGURACIÓN DE CÁMARA =====
    CAMERA: {
        constraints: {
            video: {
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 },
                facingMode: 'environment' // Cámara trasera por defecto
            },
            audio: false
        },
        capture_format: 'image/jpeg',
        capture_quality: 0.8,
        retry_attempts: 3,
        timeout: 30000 // 30 segundos
    },

    // ===== CONFIGURACIÓN DE PDF =====
    PDF: {
        format: 'letter', // Formato carta estándar
        orientation: 'portrait',
        margin: 20, // milímetros
        font_family: 'times',
        font_sizes: {
            title: 18,
            subtitle: 14,
            body: 12,
            small: 10,
            tiny: 8
        },
        line_height: 1.4,
        watermark: true
    },

    // ===== CONFIGURACIÓN DE FIRMAS DIGITALES =====
    SIGNATURES: {
        max_width: 400,
        max_height: 200,
        background_removal: {
            luminosity_threshold: 160,
            saturation_threshold: 40,
            brightness_threshold: 120
        },
        processing: {
            contrast_boost: 1.2,
            noise_reduction: true,
            edge_enhancement: true
        },
        output_format: 'image/png'
    },

    // ===== CONFIGURACIÓN DE TEMAS =====
    THEMES: {
        default: 'dark',
        storage_key: 'notaria_digital_theme_preference',
        auto_detect: true, // Detectar preferencia del sistema
        transitions: true
    },

    // ===== CONFIGURACIÓN DE ANIMACIONES =====
    ANIMATIONS: {
        enabled: true,
        duration: {
            fast: 200,
            normal: 300,
            slow: 500
        },
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        reduce_motion: true // Respetar preferencias de accesibilidad
    },

    // ===== MENSAJES DEL SISTEMA =====
    MESSAGES: {
        loading: {
            camera: 'Iniciando cámara...',
            signature: 'Procesando firma...',
            pdf: 'Generando documento PDF...',
            saving: 'Guardando información...'
        },
        success: {
            signature_added: 'Firma digital agregada correctamente',
            photo_captured: 'Foto capturada exitosamente',
            pdf_generated: 'PDF generado correctamente',
            form_saved: 'Formulario guardado automáticamente',
            form_cleared: 'Formulario limpiado correctamente'
        },
        error: {
            camera_access: 'No se pudo acceder a la cámara',
            invalid_image: 'Formato de imagen no válido',
            file_too_large: 'El archivo es demasiado grande',
            missing_fields: 'Complete todos los campos requeridos',
            invalid_rut: 'RUT inválido',
            invalid_address: 'Dirección inválida',
            invalid_amount: 'Monto de ingreso inválido',
            invalid_date: 'Fecha inválida',
            pdf_error: 'Error al generar el PDF',
            network_error: 'Error de conexión',
            missing_checkboxes: 'Debe aceptar ambas declaraciones legales'
        },
        warning: {
            missing_signature: 'Falta agregar la firma digital',
            missing_photo: 'Falta capturar las fotos del carnet',
            unsaved_changes: 'Hay cambios sin guardar',
            old_browser: 'Su navegador puede no ser compatible con todas las funciones',
            incomplete_form: 'Algunos campos están incompletos',
            high_amount: 'El monto declarado es muy elevado, verifique la cifra',
            missing_concept_detail: 'Debe especificar el detalle de otros ingresos'
        },
        info: {
            auto_save: 'Cambios guardados automáticamente',
            signature_ready: 'Firma lista para usar',
            photo_ready: 'Foto lista para usar',
            form_complete: 'Formulario completo',
            legal_responsibility: 'Recuerde que esta declaración tiene validez legal'
        }
    },

    // ===== CONFIGURACIÓN DE PERFORMANCE =====
    PERFORMANCE: {
        debounce_delay: 300, // milisegundos para eventos de input
        throttle_delay: 100, // milisegundos para scroll/resize
        lazy_load: true,
        preload_critical: true,
        optimize_images: true
    },

    // ===== CONFIGURACIÓN DE ACCESIBILIDAD =====
    ACCESSIBILITY: {
        high_contrast: false,
        large_text: false,
        reduce_motion: false,
        screen_reader: true,
        keyboard_navigation: true,
        focus_indicators: true
    },

    // ===== CONFIGURACIÓN DE DESARROLLO =====
    DEBUG: {
        enabled: false, // Cambiar a true para desarrollo
        log_level: 'info', // 'debug', 'info', 'warn', 'error'
        show_performance: false,
        mock_camera: false,
        mock_signatures: false
    },

    // ===== CONFIGURACIÓN ESPECÍFICA DE DECLARACIÓN JURADA =====
    DECLARACION_JURADA: {
        tipos_moneda: [
            { code: 'CLP', symbol: '$', name: 'Pesos Chilenos' },
            { code: 'USD', symbol: 'US$', name: 'Dólares Americanos' },
            { code: 'EUR', symbol: '€', name: 'Euros' },
            { code: 'UF', symbol: 'UF ', name: 'Unidades de Fomento' }
        ],
        moneda_default: 'CLP',
        monto_minimo: 0,
        monto_maximo: 999999999.99,
        conceptos_ingreso: [
            'Sueldo o salario por trabajo dependiente',
            'Honorarios por servicios profesionales',
            'Ingresos por actividad comercial',
            'Pensión de jubilación',
            'Pensión de invalidez',
            'Arriendo de propiedades',
            'Dividendos e inversiones',
            'Subsidio del Estado',
            'Otros ingresos'
        ],
        ciudades_comunes: [
            'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta',
            'Temuco', 'Rancagua', 'Talca', 'Arica', 'Chillán',
            'Iquique', 'Los Ángeles', 'Puerto Montt', 'Calama', 'Copiapó',
            'Osorno', 'Quillota', 'Valdivia', 'Punta Arenas', 'Coquimbo'
        ],
        validaciones_especificas: {
            rut_obligatorio: true,
            nombre_minimo_chars: 3,
            domicilio_minimo_chars: 10,
            monto_requerido: true,
            concepto_requerido: true,
            fecha_maxima_futura_dias: 0, // No permitir fechas futuras
            fecha_maxima_pasada_anos: 1, // Máximo 1 año hacia atrás
            checkboxes_obligatorios: ['conocimientoSanciones', 'veracidadDeclaracion']
        }
    }
};

// ===== UTILIDADES DE CONFIGURACIÓN =====
const ConfigUtils = {
    // Validar RUT chileno
    validateRUT(rut) {
        if (!rut || typeof rut !== 'string') return false;
        
        // Limpiar RUT
        const cleanRUT = rut.replace(/[^0-9kK]/g, '');
        if (cleanRUT.length < 2) return false;
        
        const body = cleanRUT.slice(0, -1);
        const dv = cleanRUT.slice(-1).toUpperCase();
        
        // Calcular dígito verificador
        let sum = 0;
        let multiplier = 2;
        
        for (let i = body.length - 1; i >= 0; i--) {
            sum += parseInt(body[i]) * multiplier;
            multiplier = multiplier < 7 ? multiplier + 1 : 2;
        }
        
        const remainder = sum % 11;
        const calculatedDV = remainder < 2 ? remainder.toString() : 'K';
        
        return dv === calculatedDV;
    },

    // Formatear RUT con puntos y guión
    formatRUT(rut) {
        if (!rut) return '';
        
        // Limpiar RUT
        const cleanRUT = rut.replace(/[^0-9kK]/g, '');
        if (cleanRUT.length < 2) return cleanRUT;
        
        const body = cleanRUT.slice(0, -1);
        const dv = cleanRUT.slice(-1);
        
        // Agregar puntos al cuerpo
        const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        
        return `${formattedBody}-${dv}`;
    },

    // Validar nombre completo
    validateNombreCompleto(nombre) {
        if (!nombre || typeof nombre !== 'string') return false;
        
        const trimmedNombre = nombre.trim();
        return trimmedNombre.length >= CONFIG.DECLARACION_JURADA.validaciones_especificas.nombre_minimo_chars &&
               trimmedNombre.length <= CONFIG.VALIDATION.names.max_length &&
               CONFIG.VALIDATION.names.pattern.test(trimmedNombre);
    },

    // Validar dirección/domicilio
    validateDomicilio(domicilio) {
        if (!domicilio || typeof domicilio !== 'string') return false;
        
        const trimmedDomicilio = domicilio.trim();
        return trimmedDomicilio.length >= CONFIG.DECLARACION_JURADA.validaciones_especificas.domicilio_minimo_chars &&
               trimmedDomicilio.length <= CONFIG.VALIDATION.address.max_length &&
               CONFIG.VALIDATION.address.pattern.test(trimmedDomicilio);
    },

    // Validar ciudad
    validateCiudad(ciudad) {
        if (!ciudad || typeof ciudad !== 'string') return false;
        
        const trimmedCiudad = ciudad.trim();
        return trimmedCiudad.length >= CONFIG.VALIDATION.ciudad.min_length &&
               trimmedCiudad.length <= CONFIG.VALIDATION.ciudad.max_length &&
               CONFIG.VALIDATION.ciudad.pattern.test(trimmedCiudad);
    },

    // Validar monto de ingreso
    validateMontoIngreso(monto) {
        if (!monto || isNaN(monto)) return false;
        
        const numMonto = parseFloat(monto);
        return numMonto >= CONFIG.DECLARACION_JURADA.monto_minimo &&
               numMonto <= CONFIG.DECLARACION_JURADA.monto_maximo;
    },

    // Validar concepto de ingreso
    validateConceptoIngreso(concepto, otrosDetalle = '') {
        if (!concepto || typeof concepto !== 'string') return false;
        
        const isValidConcept = CONFIG.DECLARACION_JURADA.conceptos_ingreso.includes(concepto);
        
        if (concepto === 'Otros ingresos') {
            return isValidConcept && otrosDetalle && otrosDetalle.trim().length >= 5;
        }
        
        return isValidConcept;
    },

    // Validar fecha de declaración
    validateFechaDeclaracion(fecha) {
        if (!fecha) return false;
        
        try {
            const fechaDeclaracion = new Date(fecha + 'T00:00:00');
            const hoy = new Date();
            const unAnoAtras = new Date();
            unAnoAtras.setFullYear(hoy.getFullYear() - CONFIG.DECLARACION_JURADA.validaciones_especificas.fecha_maxima_pasada_anos);
            
            // No permitir fechas futuras
            if (fechaDeclaracion > hoy) return false;
            
            // No permitir fechas muy antiguas
            if (fechaDeclaracion < unAnoAtras) return false;
            
            return true;
        } catch (error) {
            return false;
        }
    },

    // Formatear precio con separadores de miles
    formatPrice(price) {
        if (!price) return '0';
        
        const numPrice = parseFloat(price);
        return numPrice.toLocaleString('es-CL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    },

    // Formatear fecha en español
    formatDateSpanish(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString + 'T00:00:00');
            const day = date.getDate();
            const month = CONFIG.MONTHS[date.getMonth()];
            const year = date.getFullYear();
            
            return `${day} de ${month} del ${year}`;
        } catch (error) {
            return '';
        }
    },

    // Obtener símbolo de moneda
    getMonedaSymbol(codigoMoneda) {
        const moneda = CONFIG.DECLARACION_JURADA.tipos_moneda.find(m => m.code === codigoMoneda);
        return moneda ? moneda.symbol : '$';
    },

    // Obtener nombre de moneda
    getMonedaName(codigoMoneda) {
        const moneda = CONFIG.DECLARACION_JURADA.tipos_moneda.find(m => m.code === codigoMoneda);
        return moneda ? moneda.name : 'Pesos Chilenos';
    },

    // Obtener configuración del tema
    getThemeConfig() {
        const savedTheme = localStorage.getItem(CONFIG.THEMES.storage_key);
        
        if (savedTheme) {
            return savedTheme;
        }
        
        // Auto-detectar preferencia del sistema
        if (CONFIG.THEMES.auto_detect && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        return CONFIG.THEMES.default;
    },

    // Guardar configuración del tema
    saveThemeConfig(theme) {
        try {
            localStorage.setItem(CONFIG.THEMES.storage_key, theme);
            return true;
        } catch (error) {
            console.warn('No se pudo guardar la preferencia de tema:', error);
            return false;
        }
    },

    // Detectar capacidades del navegador
    detectBrowserCapabilities() {
        return {
            webRTC: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            canvas: !!(document.createElement('canvas').getContext),
            localStorage: (() => {
                try {
                    const test = '__localStorage_test__';
                    localStorage.setItem(test, test);
                    localStorage.removeItem(test);
                    return true;
                } catch (e) {
                    return false;
                }
            })(),
            fileReader: !!(window.FileReader),
            workers: !!(window.Worker),
            geolocation: !!(navigator.geolocation),
            notifications: !!(window.Notification),
            orientation: !!(window.DeviceOrientationEvent),
            touch: !!(('ontouchstart' in window) || (navigator.maxTouchPoints > 0)),
            retina: window.devicePixelRatio > 1
        };
    },

    // Detectar si es dispositivo móvil
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768);
    },

    // Generar ID único
    generateUniqueId() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    },

    // Validar imagen
    validateImage(file) {
        const errors = [];
        
        if (!file) {
            errors.push('No se seleccionó ningún archivo');
            return { valid: false, errors };
        }
        
        if (!CONFIG.SECURITY.allowed_image_types.includes(file.type)) {
            errors.push('Tipo de archivo no permitido. Use JPG, PNG o WebP');
        }
        
        if (file.size > CONFIG.SECURITY.max_file_size) {
            errors.push(`El archivo es muy grande. Máximo ${this.formatFileSize(CONFIG.SECURITY.max_file_size)}`);
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Formatear tamaño de archivo
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Formatear número con separadores de miles
    formatNumber(number) {
        if (!number) return '';
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Log con niveles
    log(level, message, data = null) {
        if (!CONFIG.DEBUG.enabled) return;
        
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(CONFIG.DEBUG.log_level);
        const messageLevelIndex = levels.indexOf(level);
        
        if (messageLevelIndex >= currentLevelIndex) {
            const timestamp = new Date().toISOString();
            const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
            
            if (data) {
                console[level](prefix, message, data);
            } else {
                console[level](prefix, message);
            }
        }
    },

    // Validar formulario completo de declaración jurada
    validateCompleteDeclaracionJurada(formData) {
        const errors = [];

        // Validar campos requeridos básicos
        const requiredFields = [
            'nombreCompleto',
            'rutDeclarante', 
            'domicilioDeclarante', 
            'ciudadDeclarante',
            'montoIngreso', 
            'tipoMoneda', 
            'conceptoIngreso',
            'fechaDeclaracion', 
            'lugarDeclaracion'
        ];

        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                errors.push(`El campo ${field} es requerido`);
            }
        });

        // Validar checkboxes obligatorios
        CONFIG.DECLARACION_JURADA.validaciones_especificas.checkboxes_obligatorios.forEach(checkbox => {
            if (!formData[checkbox]) {
                errors.push(`Debe marcar la casilla de ${checkbox}`);
            }
        });

        // Validaciones específicas
        if (formData.rutDeclarante && !this.validateRUT(formData.rutDeclarante)) {
            errors.push('RUT del declarante inválido');
        }

        if (formData.nombreCompleto && !this.validateNombreCompleto(formData.nombreCompleto)) {
            errors.push('Nombre completo inválido');
        }

        if (formData.domicilioDeclarante && !this.validateDomicilio(formData.domicilioDeclarante)) {
            errors.push('Domicilio inválido');
        }

        if (formData.ciudadDeclarante && !this.validateCiudad(formData.ciudadDeclarante)) {
            errors.push('Ciudad inválida');
        }

        if (formData.montoIngreso && !this.validateMontoIngreso(formData.montoIngreso)) {
            errors.push('Monto de ingreso inválido');
        }

        if (formData.conceptoIngreso) {
            const otrosDetalle = formData.conceptoIngreso === 'Otros ingresos' ? formData.otrosIngresos : '';
            if (!this.validateConceptoIngreso(formData.conceptoIngreso, otrosDetalle)) {
                errors.push('Concepto de ingreso inválido o falta detalle de otros ingresos');
            }
        }

        if (formData.fechaDeclaracion && !this.validateFechaDeclaracion(formData.fechaDeclaracion)) {
            errors.push('Fecha de declaración inválida');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    // Validar coherencia de datos
    validateDataCoherence(formData) {
        const warnings = [];

        // Validar montos muy altos
        if (formData.montoIngreso && parseFloat(formData.montoIngreso) > 10000000) { // 10 millones
            warnings.push('El monto declarado es muy elevado, verifique la cifra');
        }

        // Validar montos muy bajos
        if (formData.montoIngreso && parseFloat(formData.montoIngreso) < 100000 && formData.conceptoIngreso === 'Sueldo o salario por trabajo dependiente') { // 100 mil
            warnings.push('El monto declarado parece bajo para un sueldo, verifique la cifra');
        }

        // Validar fecha muy antigua
        if (formData.fechaDeclaracion) {
            const fechaDeclaracion = new Date(formData.fechaDeclaracion + 'T00:00:00');
            const tresMesesAtras = new Date();
            tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
            
            if (fechaDeclaracion < tresMesesAtras) {
                warnings.push('La fecha de declaración es muy antigua');
            }
        }

        return {
            coherent: warnings.length === 0,
            warnings: warnings
        };
    },

    // Formatear datos para vista previa
    formatDataForPreview(formData) {
        const formatted = { ...formData };

        // Formatear RUT
        if (formatted.rutDeclarante) {
            formatted.rutDeclarante = this.formatRUT(formatted.rutDeclarante);
        }

        // Formatear monto
        if (formatted.montoIngreso) {
            formatted.montoIngresoFormatted = this.formatPrice(formatted.montoIngreso);
        }

        // Formatear fecha
        if (formatted.fechaDeclaracion) {
            formatted.fechaDeclaracionFormatted = this.formatDateSpanish(formatted.fechaDeclaracion);
        }

        return formatted;
    },

    // Obtener datos del formulario actual
    getFormDataFromDOM() {
        const formData = {};
        
        // Campos básicos
        const fields = [
            'nombreCompleto', 'rutDeclarante', 'domicilioDeclarante', 'ciudadDeclarante',
            'montoIngreso', 'tipoMoneda', 'conceptoIngreso', 'otrosIngresos',
            'fechaDeclaracion', 'lugarDeclaracion'
        ];
        
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                formData[field] = element.value || '';
            }
        });
        
        // Checkboxes
        const checkboxes = ['conocimientoSanciones', 'veracidadDeclaracion'];
        checkboxes.forEach(checkbox => {
            const element = document.getElementById(checkbox);
            formData[checkbox] = element ? element.checked : false;
        });
        
        return formData;
    },

    // Verificar si el formulario está completo
    isFormComplete() {
        const formData = this.getFormDataFromDOM();
        const validation = this.validateCompleteDeclaracionJurada(formData);
        return validation.valid;
    },

    // Calcular progreso del formulario
    calculateFormProgress() {
        const formData = this.getFormDataFromDOM();
        const totalFields = 12; // Total de campos requeridos
        let completedFields = 0;
        
        // Contar campos completados
        const requiredFields = [
            'nombreCompleto', 'rutDeclarante', 'domicilioDeclarante', 'ciudadDeclarante',
            'montoIngreso', 'tipoMoneda', 'conceptoIngreso', 'fechaDeclaracion', 'lugarDeclaracion'
        ];
        
        requiredFields.forEach(field => {
            if (formData[field] && formData[field].trim() !== '') {
                completedFields++;
            }
        });
        
        // Checkboxes
        if (formData.conocimientoSanciones) completedFields++;
        if (formData.veracidadDeclaracion) completedFields++;
        
        // Validar otros ingresos si es necesario
        if (formData.conceptoIngreso === 'Otros ingresos' && formData.otrosIngresos && formData.otrosIngresos.trim() !== '') {
            completedFields += 0.5; // Bonus por completar el detalle
        }
        
        return Math.round((completedFields / totalFields) * 100);
    }
};

// ===== EXPORTAR CONFIGURACIÓN =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ConfigUtils };
} else if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.ConfigUtils = ConfigUtils;
}

// ===== LOG DE INICIALIZACIÓN =====
ConfigUtils.log('info', 'Sistema de configuración de Declaración Jurada inicializado', {
    version: CONFIG.APP.version,
    capabilities: ConfigUtils.detectBrowserCapabilities(),
    mobile: ConfigUtils.isMobile()
});