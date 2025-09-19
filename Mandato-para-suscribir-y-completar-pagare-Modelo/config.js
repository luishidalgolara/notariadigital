// ========================================
// 📋 CONFIGURACIÓN DEL SISTEMA DE MANDATO PARA SUSCRIBIR Y COMPLETAR PAGARÉ
// ========================================

const CONFIG = {
    // ===== CONFIGURACIÓN GENERAL =====
    APP: {
        name: 'Notaría Digital - Mandato para Suscribir y Completar Pagaré',
        version: '2.0.0',
        author: 'Sistema Notarial Digital Chile',
        description: 'Sistema profesional para generar mandatos de pagaré con firmas digitales'
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
        key: 'mandato_pagare_form_data',
        max_history: 5
    },

    // ===== CONFIGURACIÓN DE VALIDACIÓN =====
    VALIDATION: {
        rut: {
            min_length: 8,
            max_length: 12,
            format: /^[0-9]+[-|‐]{1}[0-9kK]{1}$/
        },
        foreign_document: {
            min_length: 5,
            max_length: 20,
            pattern: /^[A-Za-z0-9\-\.]+$/
        },
        amount: {
            min: 0,
            max: 999999999999 // 999 mil millones
        },
        percentage: {
            min: 0,
            max: 100
        },
        names: {
            min_length: 2,
            max_length: 150,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-\.]+$/
        },
        phone: {
            pattern: /^(\+56\s?)?[0-9\s\-]{8,15}$/
        },
        address: {
            min_length: 5,
            max_length: 200
        },
        observations: {
            max_length: 1000
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

    // ===== REGIONES DE CHILE =====
    REGIONS: [
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
        'Región de Aysén del General Carlos Ibáñez del Campo',
        'Región de Magallanes y de la Antártica Chilena'
    ],

    // ===== NACIONALIDADES COMUNES =====
    NATIONALITIES: {
        chilena: 'Chilena',
        argentina: 'Argentina',
        boliviana: 'Boliviana',
        brasileña: 'Brasileña',
        colombiana: 'Colombiana',
        ecuatoriana: 'Ecuatoriana',
        paraguaya: 'Paraguaya',
        peruana: 'Peruana',
        uruguaya: 'Uruguaya',
        venezolana: 'Venezolana',
        española: 'Española',
        italiana: 'Italiana',
        francesa: 'Francesa',
        alemana: 'Alemana',
        estadounidense: 'Estadounidense',
        canadiense: 'Canadiense',
        china: 'China',
        japonesa: 'Japonesa',
        coreana: 'Coreana',
        haitiana: 'Haitiana'
    },

    // ===== ESTADOS CIVILES =====
    CIVIL_STATUS: {
        'soltero/a': 'Soltero(a)',
        'casado/a': 'Casado(a)',
        'viudo/a': 'Viudo(a)',
        'divorciado/a': 'Divorciado(a)',
        'separado/a': 'Separado(a)',
        'conviviente civil': 'Conviviente Civil'
    },

    // ===== TIPOS DE PRESTADOR =====
    PROVIDER_TYPES: {
        'Persona Natural': 'Persona Natural',
        'Empresa': 'Empresa',
        'Sociedad': 'Sociedad',
        'Otro': 'Otro'
    },

    // ===== MODALIDADES DE PAGO =====
    PAYMENT_MODES: {
        'Pago único': 'Pago único al vencimiento',
        'Cuotas mensuales': 'Cuotas mensuales',
        'Cuotas trimestrales': 'Cuotas trimestrales',
        'Según acuerdo': 'Según acuerdo posterior'
    },

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
        storage_key: 'mandato_pagare_theme_preference',
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
            pdf_generated: 'PDF del mandato generado correctamente',
            form_saved: 'Formulario guardado automáticamente',
            form_cleared: 'Formulario limpiado correctamente'
        },
        error: {
            camera_access: 'No se pudo acceder a la cámara',
            invalid_image: 'Formato de imagen no válido',
            file_too_large: 'El archivo es demasiado grande',
            missing_fields: 'Complete todos los campos requeridos',
            invalid_rut: 'RUT inválido',
            invalid_document: 'Documento de identidad inválido',
            invalid_amount: 'Monto inválido',
            duplicate_documents: 'Los documentos no pueden ser duplicados',
            invalid_dates: 'Las fechas son inválidas',
            pdf_error: 'Error al generar el PDF',
            network_error: 'Error de conexión',
            invalid_percentage: 'Porcentaje inválido',
            missing_mandatario: 'Debe completar los datos del mandatario',
            invalid_phone: 'Formato de teléfono inválido'
        },
        warning: {
            missing_signature: 'Falta agregar la firma digital',
            missing_photo: 'Falta capturar la foto del carnet',
            unsaved_changes: 'Hay cambios sin guardar',
            old_browser: 'Su navegador puede no ser compatible con todas las funciones',
            duplicate_documents: 'Algunos documentos están duplicados',
            incomplete_mandatario: 'Complete la información del mandatario',
            no_amount_specified: 'No ha especificado el monto de la deuda'
        },
        info: {
            auto_save: 'Cambios guardados automáticamente',
            signature_ready: 'Firma lista para usar',
            photo_ready: 'Foto lista para usar',
            form_complete: 'Formulario completo',
            mandatario_detected: 'Datos del mandatario completados',
            amount_calculated: 'Monto calculado automáticamente'
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

    // ===== PLANTILLAS LEGALES =====
    LEGAL_TEMPLATES: {
        opening: 'En {ciudad}, a {dia} de {mes} de {anio}, don/doña {nombre_mandante}, {nacionalidad_mandante}, {estado_civil_mandante}, {profesion_mandante} con domicilio en calle {domicilio_mandante}, comuna de {comuna_mandante}, Santiago, en adelante el Mandante, confiere mandato especial a don/doña {nombre_mandatario} {nacionalidad_mandatario}, {estado_civil_mandatario}, {profesion_mandatario} con domicilio en calle {domicilio_mandatario}, comuna de {comuna_mandatario}, Santiago, en adelante el Mandatario, en los siguientes términos:',
        
        main_clause: 'A fin de facilitar el cobro y pago de todo o cualquier monto en dinero que el Mandante adeude o llegue a adeudar, y que guarde relación con la prestación de servicios realizada por {prestador_servicio} {tipo_prestador}, RUT N° {rut_prestador}, {incluye_iva}, el Mandante viene en conferir poder especial a don/doña {nombre_mandatario}, ya individualizado/a, o a quien sus derechos represente, para que en su nombre y representación, oportunamente, suscriba pagarés, reconocimientos de deuda, establezca montos, fechas de vencimiento y requiera el cobro en caso de mora en el pago íntegro y oportuno de los montos que el Mandante deba pagar por los servicios prestados, {relevar_protesto}.',
        
        instructions: 'El Mandante instruye a don/doña {nombre_mandatario}, ya individualizado, a fin de que éste, en forma previa a la presentación a cobro del pagaré, proceda a incorporar al pagaré los datos relativos a los montos adeudados y fecha de vencimiento, todo ello con la finalidad que el título correspondiente reúna los requisitos legales de conformidad con la Ley 18.092, sobre letra de cambio y pagaré.',
        
        additional_costs: 'El presente mandato autoriza al Mandatario para incluir en la cantidad adeudada e incorporada al pagaré {gastos_notariales}, por autorización de la firma del suscriptor y los generados en caso de protesto del mismo, así como {impuesto_timbres} en caso de estar afecto al mismo.',
        
        final_clause: 'Se deja expresa constancia que el pagaré a que se refiere el presente mandato no constituye novación de las obligaciones que mediante él se documentan de modo alguno. Además, el Mandante declara que el presente mandato {es_gratuito} y que exime al mandatario de la obligación de rendir cuenta. También se deja constancia que el presente mandato se extinguirá una vez se produzca el pago de la totalidad de los servicios contratados y prestados por el Mandante.',
        
        legal_note: 'Este mandato otorga facultades específicas para suscribir y completar pagarés conforme a la Ley 18.092. El mandato se extingue automáticamente con el pago total de la deuda. El incumplimiento puede generar consecuencias legales según la legislación vigente.'
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

    // Validar documento extranjero
    validateForeignDocument(document) {
        if (!document || typeof document !== 'string') return false;
        
        const cleanDocument = document.trim();
        return cleanDocument.length >= CONFIG.VALIDATION.foreign_document.min_length &&
               cleanDocument.length <= CONFIG.VALIDATION.foreign_document.max_length &&
               CONFIG.VALIDATION.foreign_document.pattern.test(cleanDocument);
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
        
        // Para mandatos, la fecha debe ser reciente o futura cercana
        const minPastDate = new Date();
        minPastDate.setFullYear(minPastDate.getFullYear() - 1);
        
        return date >= minPastDate && date <= maxFutureDate;
    },

    // Validar monto
    validateAmount(amount) {
        if (!amount) return false;
        
        const numAmount = parseFloat(amount.toString().replace(/[.,]/g, ''));
        return numAmount >= CONFIG.VALIDATION.amount.min && 
               numAmount <= CONFIG.VALIDATION.amount.max;
    },

    // Validar porcentaje
    validatePercentage(percentage) {
        if (!percentage) return true; // Los porcentajes son opcionales
        
        const numPercentage = parseFloat(percentage);
        return numPercentage >= CONFIG.VALIDATION.percentage.min && 
               numPercentage <= CONFIG.VALIDATION.percentage.max;
    },

    // Validar nombre
    validateName(name) {
        if (!name || typeof name !== 'string') return false;
        
        const trimmedName = name.trim();
        return trimmedName.length >= CONFIG.VALIDATION.names.min_length &&
               trimmedName.length <= CONFIG.VALIDATION.names.max_length &&
               CONFIG.VALIDATION.names.pattern.test(trimmedName);
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
               trimmedAddress.length <= CONFIG.VALIDATION.address.max_length;
    },

    // Formatear número con separadores de miles
    formatNumber(number) {
        if (!number) return '';
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    },

    // Formatear monto monetario
    formatCurrency(amount) {
        if (!amount) return '';
        
        const numAmount = parseFloat(amount.toString().replace(/[^\d]/g, ''));
        if (isNaN(numAmount)) return '';
        
        return '$' + this.formatNumber(numAmount);
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
                
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
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

    // Generar texto legal con plantillas
    generateLegalText(template, variables) {
        let text = CONFIG.LEGAL_TEMPLATES[template] || template;
        
        Object.keys(variables).forEach(key => {
            const placeholder = `{${key}}`;
            text = text.replace(new RegExp(placeholder, 'g'), variables[key]);
        });
        
        return text;
    },

    // Limpiar y formatear texto para documentos
    cleanTextForDocument(text) {
        if (!text) return '';
        
        return text
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s\-\.\,\:\;]/g, '');
    },

    // Validar conjunto de datos del mandato
    validateMandatoData(data) {
        const errors = [];
        
        // Validaciones requeridas - Mandante
        if (!data.nombreMandante) errors.push('Nombre del mandante es requerido');
        if (!data.rutMandante) errors.push('RUT del mandante es requerido');
        if (!data.domicilioMandante) errors.push('Domicilio del mandante es requerido');
        if (!data.comunaMandante) errors.push('Comuna del mandante es requerida');
        
        // Validaciones requeridas - Mandatario
        if (!data.nombreMandatario) errors.push('Nombre del mandatario es requerido');
        if (!data.rutMandatario) errors.push('RUT del mandatario es requerido');
        if (!data.domicilioMandatario) errors.push('Domicilio del mandatario es requerido');
        if (!data.comunaMandatario) errors.push('Comuna del mandatario es requerida');
        
        // Validaciones requeridas - Deuda
        if (!data.prestadorServicio) errors.push('Prestador del servicio es requerido');
        if (!data.rutPrestador) errors.push('RUT del prestador es requerido');
        if (!data.montoAdeudado) errors.push('Monto adeudado es requerido');
        
        // Validaciones específicas
        if (data.rutMandante && data.rutMandatario && 
            data.rutMandante === data.rutMandatario) {
            errors.push('El mandante y mandatario no pueden tener el mismo RUT');
        }
        
        if (data.montoAdeudado && !this.validateAmount(data.montoAdeudado)) {
            errors.push('Monto adeudado es inválido');
        }
        
        if (data.tasaInteres && !this.validatePercentage(data.tasaInteres)) {
            errors.push('Tasa de interés debe estar entre 0 y 100%');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Obtener información regional
    getRegionInfo(regionName) {
        return CONFIG.REGIONS.find(region => 
            region.toLowerCase().includes(regionName.toLowerCase())
        );
    },

    // Formatear modalidad de pago
    formatPaymentMode(mode) {
        return CONFIG.PAYMENT_MODES[mode] || mode;
    },

    // Obtener etiqueta de estado civil
    getCivilStatusLabel(status) {
        return CONFIG.CIVIL_STATUS[status] || status;
    },

    // Obtener etiqueta de nacionalidad
    getNationalityLabel(nationality) {
        return CONFIG.NATIONALITIES[nationality] || nationality;
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
ConfigUtils.log('info', 'Sistema de configuración para mandato de pagaré inicializado', {
    version: CONFIG.APP.version,
    capabilities: ConfigUtils.detectBrowserCapabilities(),
    mobile: ConfigUtils.isMobile(),
    accessibility: ConfigUtils.detectAccessibilityPreferences()
});