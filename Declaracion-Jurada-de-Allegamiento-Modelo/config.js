// ========================================
// 📋 CONFIGURACIÓN DEL SISTEMA DE DECLARACIÓN JURADA DE ALLEGAMIENTO
// ========================================

const CONFIG = {
    // ===== CONFIGURACIÓN GENERAL =====
    APP: {
        name: 'Notaría Digital - Declaración Jurada de Allegamiento',
        version: '1.0.0',
        author: 'Sistema Notarial Digital Chile',
        description: 'Sistema profesional para generar declaraciones juradas de allegamiento con firmas digitales'
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
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/
        },
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        phone: {
            pattern: /^(\+56\s?)?[0-9\s\-]{8,15}$/
        },
        address: {
            min_length: 10,
            max_length: 200,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\.\,\-\#]+$/
        },
        numero_allegados: {
            min: 1,
            max: 20
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
            form_saved: 'Formulario guardado automáticamente'
        },
        error: {
            camera_access: 'No se pudo acceder a la cámara',
            invalid_image: 'Formato de imagen no válido',
            file_too_large: 'El archivo es demasiado grande',
            missing_fields: 'Complete todos los campos requeridos',
            invalid_rut: 'RUT inválido',
            invalid_email: 'Correo electrónico inválido',
            invalid_address: 'Dirección inválida',
            invalid_phone: 'Teléfono inválido',
            invalid_dates: 'Las fechas son inválidas',
            pdf_error: 'Error al generar el PDF',
            network_error: 'Error de conexión'
        },
        warning: {
            missing_signature: 'Falta agregar las firmas digitales',
            missing_photo: 'Falta capturar las fotos del carnet',
            unsaved_changes: 'Hay cambios sin guardar',
            old_browser: 'Su navegador puede no ser compatible con todas las funciones'
        },
        info: {
            auto_save: 'Cambios guardados automáticamente',
            signature_ready: 'Firma lista para usar',
            photo_ready: 'Foto lista para usar',
            form_complete: 'Formulario completo'
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
    DECLARACION: {
        tipos_vivienda: [
            'casa', 'departamento', 'casa pareada', 'villa', 'otro'
        ],
        estados_civiles: [
            'soltero/a', 'casado/a', 'viudo/a', 'divorciado/a', 'separado/a'
        ],
        regiones: [
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
            'Región de La Araucanía',
            'Región de Los Ríos',
            'Región de Los Lagos',
            'Región de Aysén',
            'Región de Magallanes'
        ],
        relaciones_estudiante: [
            'padre', 'madre', 'hermano/a', 'abuelo/a', 'tío/a', 'primo/a', 'otro familiar', 'no familiar'
        ],
        motivos_allegamiento: [
            'estudios', 'trabajo', 'economico', 'familiar', 'salud', 'otro'
        ],
        tipos_propiedad: [
            'si', 'no', 'familiar'
        ],
        opciones_menores: [
            'si', 'no'
        ],
        max_allegados: 20,
        min_allegados: 1
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

    // Validar fecha
    validateDate(dateString) {
        if (!dateString) return false;
        
        const date = new Date(dateString);
        const now = new Date();
        
        // Verificar que sea una fecha válida
        if (isNaN(date.getTime())) return false;
        
        // Verificar que no sea una fecha futura muy lejana
        const maxFutureDate = new Date();
        maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 10);
        
        return date >= new Date('1900-01-01') && date <= maxFutureDate;
    },

    // Validar nombre
    validateName(name) {
        if (!name || typeof name !== 'string') return false;
        
        const trimmedName = name.trim();
        return trimmedName.length >= CONFIG.VALIDATION.names.min_length &&
               trimmedName.length <= CONFIG.VALIDATION.names.max_length &&
               CONFIG.VALIDATION.names.pattern.test(trimmedName);
    },

    // Validar correo electrónico
    validateEmail(email) {
        if (!email || typeof email !== 'string') return false;
        
        const trimmedEmail = email.trim();
        return CONFIG.VALIDATION.email.pattern.test(trimmedEmail);
    },

    // Validar teléfono
    validatePhone(phone) {
        if (!phone || typeof phone !== 'string') return false;
        
        const cleanPhone = phone.replace(/\s/g, '');
        return CONFIG.VALIDATION.phone.pattern.test(cleanPhone);
    },

    // Validar dirección
    validateAddress(address) {
        if (!address || typeof address !== 'string') return false;
        
        const trimmedAddress = address.trim();
        return trimmedAddress.length >= CONFIG.VALIDATION.address.min_length &&
               trimmedAddress.length <= CONFIG.VALIDATION.address.max_length &&
               CONFIG.VALIDATION.address.pattern.test(trimmedAddress);
    },

    // Validar número de allegados
    validateNumeroAllegados(numero) {
        if (!numero || isNaN(numero)) return false;
        
        const numAllegados = parseInt(numero);
        return numAllegados >= CONFIG.VALIDATION.numero_allegados.min &&
               numAllegados <= CONFIG.VALIDATION.numero_allegados.max;
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

    // Generar ID de documento
    generateDocumentId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'DJA-';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        result += '-' + new Date().getFullYear();
        return result;
    },

    // Validar formulario completo de declaración jurada
    validateCompleteForm(formData) {
        const errors = [];

        // Validar campos requeridos
        const requiredFields = [
            'ciudadDeclaracion', 'fechaDeclaracion',
            'nombreDueno', 'rutDueno', 'direccionVivienda', 'comunaVivienda', 'regionVivienda',
            'fechaInicioAllegamiento', 'nombreAllegadoPrincipal', 'rutAllegadoPrincipal',
            'relacionEstudiante', 'nombresAllegados', 'numeroAllegados'
        ];

        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                errors.push(`El campo ${field} es requerido`);
            }
        });

        // Validar checkbox obligatorio
        if (!formData.declaracionVerdadera) {
            errors.push('Debe aceptar la declaración de veracidad');
        }

        // Validaciones específicas
        if (formData.rutDueno && !this.validateRUT(formData.rutDueno)) {
            errors.push('RUT del dueño inválido');
        }

        if (formData.rutAllegadoPrincipal && !this.validateRUT(formData.rutAllegadoPrincipal)) {
            errors.push('RUT del allegado principal inválido');
        }

        if (formData.correoDueno && !this.validateEmail(formData.correoDueno)) {
            errors.push('Correo del dueño inválido');
        }

        if (formData.telefonoDueno && !this.validatePhone(formData.telefonoDueno)) {
            errors.push('Teléfono del dueño inválido');
        }

        if (formData.numeroAllegados && !this.validateNumeroAllegados(formData.numeroAllegados)) {
            errors.push('Número de allegados inválido');
        }

        if (formData.fechaDeclaracion && !this.validateDate(formData.fechaDeclaracion)) {
            errors.push('Fecha de la declaración inválida');
        }

        if (formData.fechaInicioAllegamiento && !this.validateDate(formData.fechaInicioAllegamiento)) {
            errors.push('Fecha de inicio del allegamiento inválida');
        }

        // Validar que la fecha de inicio no sea futura
        if (formData.fechaInicioAllegamiento) {
            const fechaInicio = new Date(formData.fechaInicioAllegamiento);
            const hoy = new Date();
            if (fechaInicio > hoy) {
                errors.push('La fecha de inicio del allegamiento no puede ser futura');
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    // Validar coherencia de datos
    validateDataCoherence(formData) {
        const warnings = [];

        // Validar coherencia entre número de allegados y lista de nombres
        if (formData.numeroAllegados && formData.nombresAllegados) {
            const numeroDeclarado = parseInt(formData.numeroAllegados);
            const lineasNombres = formData.nombresAllegados.split('\n').filter(line => line.trim().length > 0);
            
            if (numeroDeclarado !== lineasNombres.length) {
                warnings.push('El número de allegados no coincide con la cantidad de nombres listados');
            }
        }

        // Validar fechas lógicas
        if (formData.fechaDeclaracion && formData.fechaInicioAllegamiento) {
            const fechaDeclaracion = new Date(formData.fechaDeclaracion);
            const fechaInicio = new Date(formData.fechaInicioAllegamiento);
            
            if (fechaInicio > fechaDeclaracion) {
                warnings.push('La fecha de inicio del allegamiento es posterior a la fecha de la declaración');
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

        // Formatear RUTs
        if (formatted.rutDueno) {
            formatted.rutDueno = this.formatRUT(formatted.rutDueno);
        }
        if (formatted.rutAllegadoPrincipal) {
            formatted.rutAllegadoPrincipal = this.formatRUT(formatted.rutAllegadoPrincipal);
        }

        // Formatear fechas
        if (formatted.fechaDeclaracion) {
            const date = new Date(formatted.fechaDeclaracion);
            formatted.fechaDeclaracionFormatted = `${date.getDate()} de ${CONFIG.MONTHS[date.getMonth()]} del ${date.getFullYear()}`;
        }

        if (formatted.fechaInicioAllegamiento) {
            const date = new Date(formatted.fechaInicioAllegamiento);
            formatted.fechaInicioFormatted = `${date.getDate()} de ${CONFIG.MONTHS[date.getMonth()]} del ${date.getFullYear()}`;
        }

        // Formatear teléfono
        if (formatted.telefonoDueno) {
            formatted.telefonoDueno = formatted.telefonoDueno.replace(/(\+56)?(\d{1})(\d{4})(\d{4})/, '+56 $2 $3 $4');
        }

        return formatted;
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