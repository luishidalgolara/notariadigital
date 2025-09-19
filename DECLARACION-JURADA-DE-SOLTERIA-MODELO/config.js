// ========================================
// 📋 CONFIGURACIÓN DEL SISTEMA DE DECLARACIÓN JURADA DE SOLTERÍA MODELO 2
// ========================================

const CONFIG = {
    // ===== CONFIGURACIÓN GENERAL =====
    APP: {
        name: 'Notaría Digital - Declaración Jurada de Soltería Modelo 2',
        version: '1.0.0',
        author: 'Sistema Notarial Digital Chile',
        description: 'Sistema profesional para generar declaraciones juradas de soltería con firma digital'
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
        key: 'declaracion_solteria_form_data',
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
        profesion: {
            min_length: 3,
            max_length: 80,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.]+$/
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
            invalid_date: 'Fecha inválida',
            invalid_name: 'Nombre inválido',
            invalid_profesion: 'Profesión inválida',
            pdf_error: 'Error al generar el PDF',
            network_error: 'Error de conexión',
            missing_checkboxes: 'Debe aceptar todas las declaraciones legales',
            missing_estado_civil: 'Debe seleccionar el estado civil'
        },
        warning: {
            missing_signature: 'Falta agregar la firma digital',
            missing_photo: 'Falta capturar las fotos del carnet',
            unsaved_changes: 'Hay cambios sin guardar',
            old_browser: 'Su navegador puede no ser compatible con todas las funciones',
            incomplete_form: 'Algunos campos están incompletos',
            missing_declarant_name: 'Debe completar el nombre del declarante antes de continuar',
            invalid_date_range: 'La fecha de declaración no puede ser muy antigua ni muy futura',
            optional_ministro_fe: 'Los datos del ministro de fe son opcionales'
        },
        info: {
            auto_save: 'Cambios guardados automáticamente',
            signature_ready: 'Firma lista para usar',
            photo_ready: 'Foto lista para usar',
            form_complete: 'Formulario completo',
            legal_responsibility: 'Recuerde que esta declaración jurada tiene validez legal',
            optional_fields: 'Algunos campos son opcionales y pueden dejarse en blanco'
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

    // ===== CONFIGURACIÓN ESPECÍFICA DE DECLARACIÓN JURADA DE SOLTERÍA =====
    DECLARACION_SOLTERIA: {
        estados_civiles: [
            { 
                code: 'soltero', 
                name: 'Soltero',
                display: 'soltero'
            },
            { 
                code: 'soltera', 
                name: 'Soltera',
                display: 'soltera'
            }
        ],
        
        regiones_chile: [
            'Región de Arica y Parinacota',
            'Región de Tarapacá',
            'Región de Antofagasta',
            'Región de Atacama',
            'Región de Coquimbo',
            'Región de Valparaíso',
            'Región Metropolitana',
            'Región del Libertador General Bernardo O\'Higgins',
            'Región del Maule',
            'Región de Ñuble',
            'Región del Biobío',
            'Región de la Araucanía',
            'Región de Los Ríos',
            'Región de Los Lagos',
            'Región de Aysén del General Carlos Ibáñez del Campo',
            'Región de Magallanes y de la Antártica Chilena'
        ],
        
        ciudades_comunes: [
            'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta',
            'Temuco', 'Rancagua', 'Talca', 'Arica', 'Chillán',
            'Iquique', 'Los Ángeles', 'Puerto Montt', 'Calama', 'Copiapó',
            'Osorno', 'Quillota', 'Valdivia', 'Punta Arenas', 'Coquimbo'
        ],
        
        profesiones_comunes: [
            'Abogado', 'Ingeniero Civil', 'Médico Cirujano', 'Contador Auditor',
            'Profesor', 'Arquitecto', 'Psicólogo', 'Enfermero', 'Técnico',
            'Comerciante', 'Empresario', 'Funcionario Público', 'Estudiante',
            'Pensionado', 'Empleado', 'Trabajador Independiente', 'Otro'
        ],
        
        validaciones_especificas: {
            rut_obligatorio: true,
            nombre_minimo_chars: 5,
            profesion_minimo_chars: 3,
            domicilio_minimo_chars: 10,
            fecha_maxima_futura_dias: 0, // Solo fecha actual o pasada
            fecha_maxima_pasada_anos: 1, // Máximo 1 año hacia atrás
            checkboxes_obligatorios: ['declaracionVeracidad', 'declaracionEstadoCivil', 'declaracionResponsabilidad'],
            campos_requeridos: [
                'nombreCompleto', 'rutDeclarante', 'profesion', 'domicilioCompleto',
                'comuna', 'region', 'estadoCivil', 'ciudadDeclaracion', 'fechaDeclaracion'
            ],
            campos_opcionales: [
                'declaracionAdicional', 'nombreMinistroFe', 'rutMinistroFe', 
                'cargoMinistroFe', 'paisDeclaracion'
            ]
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
        return trimmedNombre.length >= CONFIG.DECLARACION_SOLTERIA.validaciones_especificas.nombre_minimo_chars &&
               trimmedNombre.length <= CONFIG.VALIDATION.names.max_length &&
               CONFIG.VALIDATION.names.pattern.test(trimmedNombre);
    },

    // Validar profesión
    validateProfesion(profesion) {
        if (!profesion || typeof profesion !== 'string') return false;
        
        const trimmedProfesion = profesion.trim();
        return trimmedProfesion.length >= CONFIG.DECLARACION_SOLTERIA.validaciones_especificas.profesion_minimo_chars &&
               trimmedProfesion.length <= CONFIG.VALIDATION.profesion.max_length &&
               CONFIG.VALIDATION.profesion.pattern.test(trimmedProfesion);
    },

    // Validar dirección/domicilio
    validateDomicilio(domicilio) {
        if (!domicilio || typeof domicilio !== 'string') return false;
        
        const trimmedDomicilio = domicilio.trim();
        return trimmedDomicilio.length >= CONFIG.DECLARACION_SOLTERIA.validaciones_especificas.domicilio_minimo_chars &&
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

    // Validar estado civil
    validateEstadoCivil(estadoCivil) {
        if (!estadoCivil || typeof estadoCivil !== 'string') return false;
        
        const estadosValidos = CONFIG.DECLARACION_SOLTERIA.estados_civiles.map(e => e.code);
        return estadosValidos.includes(estadoCivil);
    },

    // Validar fecha de declaración
    validateFechaDeclaracion(fecha) {
        if (!fecha) return false;
        
        try {
            const fechaDeclaracion = new Date(fecha + 'T00:00:00');
            const hoy = new Date();
            const unAnoAtras = new Date();
            
            unAnoAtras.setFullYear(hoy.getFullYear() - CONFIG.DECLARACION_SOLTERIA.validaciones_especificas.fecha_maxima_pasada_anos);
            
            // No permitir fechas futuras
            if (fechaDeclaracion > hoy) return false;
            
            // No permitir fechas muy antiguas
            if (fechaDeclaracion < unAnoAtras) return false;
            
            return true;
        } catch (error) {
            return false;
        }
    },

    // Formatear fecha en español
    formatDateSpanish(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString + 'T00:00:00');
            const day = date.getDate();
            const month = CONFIG.MONTHS[date.getMonth()];
            const year = date.getFullYear();
            
            return `${day} de ${month} de ${year}`;
        } catch (error) {
            return '';
        }
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

    // Validar formulario completo de declaración jurada de soltería
    validateCompleteDeclaracionSolteria(formData) {
        const errors = [];
        
        // Validar campos requeridos
        CONFIG.DECLARACION_SOLTERIA.validaciones_especificas.campos_requeridos.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                errors.push(`El campo ${field} es requerido`);
            }
        });

        // Validar checkboxes obligatorios
        CONFIG.DECLARACION_SOLTERIA.validaciones_especificas.checkboxes_obligatorios.forEach(checkbox => {
            if (!formData[checkbox]) {
                errors.push(`Debe marcar la casilla de ${checkbox}`);
            }
        });

        // Validaciones específicas
        const rutsToValidate = ['rutDeclarante'];
        
        // Agregar RUT ministro de fe si está presente
        if (formData.nombreMinistroFe || formData.rutMinistroFe) {
            rutsToValidate.push('rutMinistroFe');
        }
        
        rutsToValidate.forEach(rutField => {
            if (formData[rutField] && !this.validateRUT(formData[rutField])) {
                errors.push(`${rutField.replace('rut', 'RUT ')} inválido`);
            }
        });

        if (formData.nombreCompleto && !this.validateNombreCompleto(formData.nombreCompleto)) {
            errors.push('Nombre completo inválido');
        }

        if (formData.profesion && !this.validateProfesion(formData.profesion)) {
            errors.push('Profesión inválida');
        }

        if (formData.domicilioCompleto && !this.validateDomicilio(formData.domicilioCompleto)) {
            errors.push('Domicilio inválido');
        }

        if (formData.estadoCivil && !this.validateEstadoCivil(formData.estadoCivil)) {
            errors.push('Estado civil inválido');
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

        // Validar fecha muy antigua
        if (formData.fechaDeclaracion) {
            const fechaDeclaracion = new Date(formData.fechaDeclaracion + 'T00:00:00');
            const tresMesesAtras = new Date();
            tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
            
            if (fechaDeclaracion < tresMesesAtras) {
                warnings.push('La fecha de declaración es muy antigua');
            }
        }

        // Validar coherencia entre ministro de fe
        const tieneNombreMinistro = formData.nombreMinistroFe && formData.nombreMinistroFe.trim();
        const tieneRutMinistro = formData.rutMinistroFe && formData.rutMinistroFe.trim();
        const tieneCargoMinistro = formData.cargoMinistroFe && formData.cargoMinistroFe.trim();
        
        if ((tieneNombreMinistro || tieneRutMinistro || tieneCargoMinistro) && 
            !(tieneNombreMinistro && tieneRutMinistro)) {
            warnings.push('Si incluye datos del ministro de fe, complete al menos nombre y RUT');
        }

        return {
            coherent: warnings.length === 0,
            warnings: warnings
        };
    },

    // Formatear datos para vista previa
    formatDataForPreview(formData) {
        const formatted = { ...formData };

        // Formatear RUTs
        const rutFields = ['rutDeclarante', 'rutMinistroFe'];
        rutFields.forEach(field => {
            if (formatted[field]) {
                formatted[field + 'Formatted'] = this.formatRUT(formatted[field]);
            }
        });

        // Formatear fecha de declaración
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
            'nombreCompleto', 'rutDeclarante', 'profesion', 'domicilioCompleto',
            'comuna', 'region', 'estadoCivil', 'declaracionAdicional',
            'ciudadDeclaracion', 'fechaDeclaracion', 'paisDeclaracion',
            'nombreMinistroFe', 'rutMinistroFe', 'cargoMinistroFe'
        ];
        
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                formData[field] = element.value || '';
            }
        });
        
        // Checkboxes básicos
        const checkboxes = ['declaracionVeracidad', 'declaracionEstadoCivil', 'declaracionResponsabilidad'];
        checkboxes.forEach(checkbox => {
            const element = document.getElementById(checkbox);
            formData[checkbox] = element ? element.checked : false;
        });
        
        return formData;
    },

    // Verificar si el formulario está completo
    isFormComplete() {
        const formData = this.getFormDataFromDOM();
        const validation = this.validateCompleteDeclaracionSolteria(formData);
        return validation.valid;
    },

    // Calcular progreso del formulario
    calculateFormProgress() {
        const formData = this.getFormDataFromDOM();
        let totalFields = 0;
        let completedFields = 0;
        
        // Campos básicos requeridos
        CONFIG.DECLARACION_SOLTERIA.validaciones_especificas.campos_requeridos.forEach(field => {
            totalFields++;
            if (formData[field] && formData[field].trim() !== '') {
                completedFields++;
            }
        });
        
        // Checkboxes obligatorios
        CONFIG.DECLARACION_SOLTERIA.validaciones_especificas.checkboxes_obligatorios.forEach(field => {
            totalFields++;
            if (formData[field]) {
                completedFields++;
            }
        });
        
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
ConfigUtils.log('info', 'Sistema de configuración de Declaración Jurada de Soltería inicializado', {
    version: CONFIG.APP.version,
    capabilities: ConfigUtils.detectBrowserCapabilities(),
    mobile: ConfigUtils.isMobile()
});