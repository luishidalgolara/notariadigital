// ========================================
// 📋 CONFIGURACIÓN DEL SISTEMA DE CONTRATO DE PRESTACIÓN DE SERVICIOS A HONORARIOS
// ========================================

const CONFIG = {
    // ===== CONFIGURACIÓN GENERAL =====
    APP: {
        name: 'Notaría Digital - Contrato de Prestación de Servicios a Honorarios',
        version: '1.0.0',
        author: 'Sistema Notarial Digital Chile',
        description: 'Sistema profesional para generar contratos de prestación de servicios a honorarios con firmas digitales'
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
        key: 'contrato_honorarios_form_data',
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
            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        },
        company_name: {
            min_length: 3,
            max_length: 150,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\.\,\-]+$/
        },
        profession: {
            min_length: 2,
            max_length: 80,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/
        },
        commercial_activity: {
            min_length: 5,
            max_length: 200,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\.\,\-]+$/
        },
        honorario_amount: {
            min: 1000,
            max: 50000000 // 50 millones máximo
        },
        duration_months: {
            min: 1,
            max: 60 // 5 años máximo
        },
        multa_uf: {
            min: 0,
            max: 1000
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
            invalid_honorario_amount: 'Monto de honorario inválido',
            invalid_dates: 'Las fechas son inválidas',
            invalid_duration: 'Duración del contrato inválida',
            invalid_profession: 'Profesión inválida',
            invalid_commercial_activity: 'Giro comercial inválido',
            pdf_error: 'Error al generar el PDF',
            network_error: 'Error de conexión'
        },
        warning: {
            missing_signature: 'Faltan firmas digitales',
            missing_photo: 'Faltan fotos de carnet',
            unsaved_changes: 'Hay cambios sin guardar',
            old_browser: 'Su navegador puede no ser compatible con todas las funciones',
            high_honorario: 'Monto de honorario muy alto, verifique',
            long_duration: 'Duración muy larga para este tipo de contrato'
        },
        info: {
            auto_save: 'Cambios guardados automáticamente',
            signature_ready: 'Firma lista para usar',
            photo_ready: 'Foto lista para usar',
            form_complete: 'Formulario completo',
            contract_info: 'Contrato de prestación de servicios independientes'
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

    // ===== CONFIGURACIÓN ESPECÍFICA DE HONORARIOS =====
    HONORARIOS: {
        tipos_honorario: [
            'por-hora',
            'mensual', 
            'por-proyecto',
            'mixto'
        ],
        estados_civiles: [
            'soltero',
            'casado', 
            'divorciado',
            'viudo'
        ],
        profesiones_comunes: [
            'Abogado', 'Contador', 'Ingeniero', 'Arquitecto', 'Médico',
            'Consultor', 'Desarrollador', 'Diseñador', 'Analista',
            'Administrador', 'Marketing', 'Vendedor', 'Periodista',
            'Traductor', 'Psicólogo', 'Nutricionista', 'Otro'
        ],
        giros_comerciales: [
            'Desarrollo de Software', 'Consultoría', 'Marketing Digital',
            'Servicios Contables', 'Servicios Legales', 'Diseño Gráfico',
            'Arquitectura', 'Ingeniería', 'Servicios de Salud',
            'Educación', 'Comercio', 'Construcción', 'Otro'
        ],
        regiones: [
            'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
            'Valparaíso', 'Metropolitana de Santiago', 'O\'Higgins', 'Maule', 'Ñuble',
            'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'
        ],
        dias_pago: [
            '5',
            '15',
            '30',
            'ultimo',
            'entrega'
        ]
    },

    // ===== CONFIGURACIÓN DE CONTRATOS =====
    CONTRACT: {
        clausulas_especiales: {
            confidencialidad: true,
            no_competencia: true,
            arbitraje: true,
            posibilidad_contratacion: true,
            renovacion_automatica: false
        },
        duracion_default: 6, // meses
        multa_default: 50, // UF
        ciudad_default: 'Santiago'
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

    // Validar correo electrónico
    validateEmail(email) {
        if (!email || typeof email !== 'string') return false;
        return CONFIG.VALIDATION.email.pattern.test(email.trim().toLowerCase());
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

    // Validar nombre de empresa
    validateCompanyName(name) {
        if (!name || typeof name !== 'string') return false;
        
        const trimmedName = name.trim();
        return trimmedName.length >= CONFIG.VALIDATION.company_name.min_length &&
               trimmedName.length <= CONFIG.VALIDATION.company_name.max_length &&
               CONFIG.VALIDATION.company_name.pattern.test(trimmedName);
    },

    // Validar profesión
    validateProfession(profession) {
        if (!profession || typeof profession !== 'string') return false;
        
        const trimmedProfession = profession.trim();
        return trimmedProfession.length >= CONFIG.VALIDATION.profession.min_length &&
               trimmedProfession.length <= CONFIG.VALIDATION.profession.max_length &&
               CONFIG.VALIDATION.profession.pattern.test(trimmedProfession);
    },

    // Validar giro comercial
    validateCommercialActivity(activity) {
        if (!activity || typeof activity !== 'string') return false;
        
        const trimmedActivity = activity.trim();
        return trimmedActivity.length >= CONFIG.VALIDATION.commercial_activity.min_length &&
               trimmedActivity.length <= CONFIG.VALIDATION.commercial_activity.max_length &&
               CONFIG.VALIDATION.commercial_activity.pattern.test(trimmedActivity);
    },

    // Validar monto de honorario
    validateHonorarioAmount(amount) {
        if (!amount || isNaN(amount)) return false;
        
        const numAmount = parseFloat(amount);
        return numAmount >= CONFIG.VALIDATION.honorario_amount.min &&
               numAmount <= CONFIG.VALIDATION.honorario_amount.max;
    },

    // Validar duración en meses
    validateDurationMonths(months) {
        if (!months || isNaN(months)) return false;
        
        const numMonths = parseInt(months);
        return numMonths >= CONFIG.VALIDATION.duration_months.min &&
               numMonths <= CONFIG.VALIDATION.duration_months.max;
    },

    // Validar multa en UF
    validateMultaUF(uf) {
        if (!uf || isNaN(uf)) return false;
        
        const numUF = parseFloat(uf);
        return numUF >= CONFIG.VALIDATION.multa_uf.min &&
               numUF <= CONFIG.VALIDATION.multa_uf.max;
    },

    // Validar estado civil
    validateEstadoCivil(estado) {
        return CONFIG.HONORARIOS.estados_civiles.includes(estado);
    },

    // Validar tipo de honorario
    validateTipoHonorario(tipo) {
        return CONFIG.HONORARIOS.tipos_honorario.includes(tipo);
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

    // Detectar preferencias de accesibilidad
    detectAccessibilityPreferences() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        const prefersLargeFonts = window.matchMedia('(prefers-font-size: large)').matches;
        
        return {
            reducedMotion: prefersReducedMotion,
            highContrast: prefersHighContrast,
            largeFonts: prefersLargeFonts
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
            errors.push(`El archivo es muy grande. Máximo ${ConfigUtils.formatFileSize(CONFIG.SECURITY.max_file_size)}`);
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Comprimir imagen
    compressImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
                const newWidth = img.width * ratio;
                const newHeight = img.height * ratio;
                
                canvas.width = newWidth;
                canvas.height = newHeight;
                
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };
            
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    },

    // Formatear número con separadores de miles
    formatNumber(number) {
        if (!number) return '';
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    },

    // Formatear monto en pesos chilenos
    formatCurrency(amount) {
        if (!amount || isNaN(amount)) return '$0';
        
        const formatted = ConfigUtils.formatNumber(amount);
        return `$${formatted}`;
    },

    // Formatear UF
    formatUF(amount) {
        if (!amount || isNaN(amount)) return '0 UF';
        return `${amount} UF`;
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

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
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
        let result = 'CPH-';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        result += '-' + new Date().getFullYear();
        return result;
    },

    // Capitalizar primera letra
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    // Convertir a mayúsculas manteniendo acentos
    toUpperCase(str) {
        if (!str) return '';
        return str.toUpperCase();
    },

    // Obtener descripción del tipo de honorario
    getTipoHonorarioDescription(tipo) {
        const descriptions = {
            'por-hora': 'por cada hora trabajada',
            'mensual': 'mensual fijo',
            'por-proyecto': 'por proyecto completo', 
            'mixto': 'modalidad mixta'
        };
        return descriptions[tipo] || 'según modalidad acordada';
    },

    // Obtener descripción del día de pago
    getDiaPagoDescription(dia) {
        const descriptions = {
            '5': 'el día 5 de cada mes',
            '15': 'el día 15 de cada mes',
            '30': 'el día 30 de cada mes',
            'ultimo': 'el último día hábil del mes',
            'entrega': 'al momento de entrega del proyecto'
        };
        return descriptions[dia] || 'según fecha acordada';
    },

    // Validar que los servicios específicos estén bien formateados
    validateServiciosEspecificos(servicios) {
        if (!servicios || typeof servicios !== 'string') return false;
        
        const lines = servicios.trim().split('\n').filter(line => line.trim() !== '');
        return lines.length >= 1 && lines.length <= 10; // Entre 1 y 10 servicios
    },

    // Parsear servicios específicos a array
    parseServiciosEspecificos(servicios) {
        if (!servicios) return [];
        
        return servicios
            .trim()
            .split('\n')
            .map(line => line.trim())
            .filter(line => line !== '')
            .map(line => line.replace(/^\d+\.\s*/, '')) // Remover numeración si existe
            .slice(0, 10); // Máximo 10 servicios
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
ConfigUtils.log('info', 'Sistema de configuración de Contrato de Prestación de Servicios a Honorarios inicializado', {
    version: CONFIG.APP.version,
    capabilities: ConfigUtils.detectBrowserCapabilities(),
    mobile: ConfigUtils.isMobile(),
    accessibility: ConfigUtils.detectAccessibilityPreferences()
});