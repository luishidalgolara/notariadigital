// ========================================
// 📋 CONFIGURACIÓN DEL SISTEMA DE CONTRATO DE ARRIENDO
// ========================================

const CONFIG = {
    // ===== CONFIGURACIÓN GENERAL =====
    APP: {
        name: 'Notaría Digital - Contrato de Arriendo',
        version: '1.0.0',
        author: 'Sistema Notarial Digital Chile',
        description: 'Sistema profesional para generar contratos de arriendo con firmas digitales'
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
        key: 'contrato_arriendo_form_data',
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
        phone: {
            pattern: /^(\+56\s?)?[0-9\s\-]{8,15}$/
        },
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        company_name: {
            min_length: 3,
            max_length: 150,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\.\,\-]+$/
        },
        monetary_amount: {
            min: 1,
            max: 500000000 // 500 millones máximo
        },
        account_number: {
            pattern: /^[0-9\-]{8,20}$/
        },
        address: {
            min_length: 10,
            max_length: 200,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\.\,\-\#°]+$/
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
            invalid_email: 'Email inválido',
            invalid_account: 'Número de cuenta inválido',
            invalid_monetary_amount: 'Monto inválido',
            invalid_dates: 'Las fechas son inválidas',
            pdf_error: 'Error al generar el PDF',
            network_error: 'Error de conexión'
        },
        warning: {
            missing_signature: 'Falta agregar la firma digital',
            missing_photo: 'Falta capturar la foto del carnet',
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

    // ===== CONFIGURACIÓN ESPECÍFICA DE CONTRATO DE ARRIENDO =====
    ARRIENDO: {
        tipos_inmueble: [
            'Departamento',
            'Casa',
            'Oficina',
            'Local comercial',
            'Bodega',
            'Parcela',
            'Terreno',
            'Habitación',
            'Otro'
        ],
        destinos_inmueble: [
            'habitacional',
            'comercial',
            'oficina',
            'bodega',
            'mixto',
            'otro'
        ],
        regiones_chile: [
            'Arica y Parinacota',
            'Tarapacá', 
            'Antofagasta',
            'Atacama',
            'Coquimbo',
            'Valparaíso',
            'Metropolitana',
            'O\'Higgins',
            'Maule',
            'Ñuble',
            'Biobío',
            'La Araucanía',
            'Los Ríos',
            'Los Lagos',
            'Aysén',
            'Magallanes y Antártica Chilena'
        ],
        bancos_principales: [
            'Banco de Chile',
            'Banco Santander',
            'Banco Estado',
            'Banco BCI',
            'Banco Security',
            'Banco Falabella',
            'Banco Edwards',
            'Banco Itaú',
            'Banco Consorcio',
            'Banco Internacional',
            'Banco Ripley',
            'Banco BICE',
            'Coopeuch',
            'Otro'
        ],
        tipos_moneda: [
            'pesos',
            'uf'
        ],
        vigencias_contrato: [
            '1 año',
            '2 años',
            '3 años',
            'indefinido'
        ],
        estados_civiles: [
            'soltero/a',
            'casado/a', 
            'viudo/a',
            'divorciado/a',
            'separado/a'
        ],
        profesiones_comunes: [
            'Abogado/a',
            'Ingeniero/a',
            'Médico/a',
            'Contador/a',
            'Arquitecto/a',
            'Profesor/a',
            'Empresario/a',
            'Comerciante',
            'Pensionado/a',
            'Dueña de casa',
            'Estudiante',
            'Técnico',
            'Funcionario público',
            'Otro'
        ],
        ciudades_principales: [
            'Santiago',
            'Valparaíso',
            'Viña del Mar',
            'Concepción',
            'La Serena',
            'Antofagasta',
            'Temuco',
            'Rancagua',
            'Talca',
            'Arica',
            'Iquique',
            'Puerto Montt',
            'Chillán',
            'Los Ángeles',
            'Calama',
            'Copiapó',
            'Osorno',
            'Quillota',
            'Valdivia',
            'Punta Arenas'
        ]
    },

    // ===== CONFIGURACIÓN DE VALIDACIONES ESPECÍFICAS =====
    ARRIENDO_VALIDATION: {
        renta: {
            min_amount: 100000, // $100.000 mínimo
            max_amount: 50000000, // $50.000.000 máximo
            min_uf: 3, // 3 UF mínimo
            max_uf: 1000 // 1000 UF máximo
        },
        garantia: {
            min_amount: 50000, // $50.000 mínimo
            max_amount: 100000000, // $100.000.000 máximo
            typical_months: [1, 2, 3] // 1-3 meses típicos
        },
        dias_pago: {
            min_dias: 1,
            max_dias: 31
        },
        dias_anticipacion: {
            min_dias: 1,
            max_dias: 365
        },
        dias_devolucion_garantia: {
            min_dias: 1,
            max_dias: 90
        },
        visitas: {
            min_visitas_mes: 0,
            max_visitas_mes: 30,
            min_periodo_meses: 1,
            max_periodo_meses: 12,
            min_dias_semana: 1,
            max_dias_semana: 7,
            min_horas_dia: 1,
            max_horas_dia: 24
        },
        multa: {
            min_uf: 0.01,
            max_uf: 10
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
        
        // Verificar que no sea muy antigua
        const minDate = new Date('1900-01-01');
        
        return date >= minDate && date <= maxFutureDate;
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

    // Validar email
    validateEmail(email) {
        if (!email || typeof email !== 'string') return false;
        
        return CONFIG.VALIDATION.email.pattern.test(email.trim());
    },

    // Validar dirección
    validateAddress(address) {
        if (!address || typeof address !== 'string') return false;
        
        const trimmedAddress = address.trim();
        return trimmedAddress.length >= CONFIG.VALIDATION.address.min_length &&
               trimmedAddress.length <= CONFIG.VALIDATION.address.max_length &&
               CONFIG.VALIDATION.address.pattern.test(trimmedAddress);
    },

    // Validar monto monetario
    validateMonetaryAmount(amount) {
        if (!amount || isNaN(amount)) return false;
        
        const numAmount = parseFloat(amount);
        return numAmount >= CONFIG.VALIDATION.monetary_amount.min &&
               numAmount <= CONFIG.VALIDATION.monetary_amount.max;
    },

    // Validar número de cuenta
    validateAccountNumber(account) {
        if (!account || typeof account !== 'string') return false;
        
        const cleanAccount = account.replace(/\s/g, '');
        return CONFIG.VALIDATION.account_number.pattern.test(cleanAccount);
    },

    // Validar renta específicamente
    validateRenta(amount, tipo = 'pesos') {
        if (!amount || isNaN(amount)) return false;
        
        const numAmount = parseFloat(amount);
        
        if (tipo === 'uf') {
            return numAmount >= CONFIG.ARRIENDO_VALIDATION.renta.min_uf &&
                   numAmount <= CONFIG.ARRIENDO_VALIDATION.renta.max_uf;
        } else {
            return numAmount >= CONFIG.ARRIENDO_VALIDATION.renta.min_amount &&
                   numAmount <= CONFIG.ARRIENDO_VALIDATION.renta.max_amount;
        }
    },

    // Validar garantía específicamente
    validateGarantia(amount) {
        if (!amount || isNaN(amount)) return false;
        
        const numAmount = parseFloat(amount);
        return numAmount >= CONFIG.ARRIENDO_VALIDATION.garantia.min_amount &&
               numAmount <= CONFIG.ARRIENDO_VALIDATION.garantia.max_amount;
    },

    // Validar días de pago
    validateDiasPago(dias) {
        if (!dias || isNaN(dias)) return false;
        
        const numDias = parseInt(dias);
        return numDias >= CONFIG.ARRIENDO_VALIDATION.dias_pago.min_dias &&
               numDias <= CONFIG.ARRIENDO_VALIDATION.dias_pago.max_dias;
    },

    // Validar días de anticipación
    validateDiasAnticipacion(dias) {
        if (!dias || isNaN(dias)) return false;
        
        const numDias = parseInt(dias);
        return numDias >= CONFIG.ARRIENDO_VALIDATION.dias_anticipacion.min_dias &&
               numDias <= CONFIG.ARRIENDO_VALIDATION.dias_anticipacion.max_dias;
    },

    // Validar visitas
    validateVisitas(cantidad, tipo = 'mes') {
        if (!cantidad || isNaN(cantidad)) return false;
        
        const numCantidad = parseInt(cantidad);
        
        switch (tipo) {
            case 'mes':
                return numCantidad >= CONFIG.ARRIENDO_VALIDATION.visitas.min_visitas_mes &&
                       numCantidad <= CONFIG.ARRIENDO_VALIDATION.visitas.max_visitas_mes;
            case 'periodo':
                return numCantidad >= CONFIG.ARRIENDO_VALIDATION.visitas.min_periodo_meses &&
                       numCantidad <= CONFIG.ARRIENDO_VALIDATION.visitas.max_periodo_meses;
            case 'dias_semana':
                return numCantidad >= CONFIG.ARRIENDO_VALIDATION.visitas.min_dias_semana &&
                       numCantidad <= CONFIG.ARRIENDO_VALIDATION.visitas.max_dias_semana;
            case 'horas_dia':
                return numCantidad >= CONFIG.ARRIENDO_VALIDATION.visitas.min_horas_dia &&
                       numCantidad <= CONFIG.ARRIENDO_VALIDATION.visitas.max_horas_dia;
            default:
                return false;
        }
    },

    // Validar multa
    validateMulta(uf) {
        if (!uf || isNaN(uf)) return false;
        
        const numUF = parseFloat(uf);
        return numUF >= CONFIG.ARRIENDO_VALIDATION.multa.min_uf &&
               numUF <= CONFIG.ARRIENDO_VALIDATION.multa.max_uf;
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

    // Formatear número de cuenta
    formatAccountNumber(account) {
        if (!account) return '';
        
        let clean = account.replace(/[^0-9\-]/g, '');
        
        // Agregar guión si no lo tiene
        if (clean.length > 8 && clean.indexOf('-') === -1) {
            clean = clean.slice(0, -1) + '-' + clean.slice(-1);
        }
        
        return clean;
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

    // Generar ID de documento único
    generateDocumentId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'ARR-';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        result += '-' + new Date().getFullYear();
        return result;
    },

    // Convertir UF a pesos (aproximado)
    convertUFToPesos(uf, valorUF = 36000) {
        if (!uf || isNaN(uf)) return 0;
        return Math.round(parseFloat(uf) * valorUF);
    },

    // Convertir pesos a UF (aproximado)
    convertPesosToUF(pesos, valorUF = 36000) {
        if (!pesos || isNaN(pesos)) return 0;
        return Math.round((parseFloat(pesos) / valorUF) * 100) / 100;
    },

    // Calcular días entre fechas
    daysBetweenDates(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        const firstDate = new Date(date1);
        const secondDate = new Date(date2);
        
        return Math.round(Math.abs((firstDate - secondDate) / oneDay));
    },

    // Validar coherencia de fechas
    validateDateCoherence(fechaInicio, fechaTermino) {
        if (!fechaInicio || !fechaTermino) return true;
        
        const inicioDate = new Date(fechaInicio);
        const terminoDate = new Date(fechaTermino);
        
        // La fecha de término debe ser posterior al inicio
        return terminoDate > inicioDate;
    },

    // Sugerir valores típicos para contratos de arriendo
    getSuggestedValues() {
        return {
            renta_tipica: [300000, 500000, 750000, 1000000, 1500000],
            garantia_tipica: [300000, 500000, 750000, 1000000],
            uf_tipica: [10, 15, 20, 25, 30, 40, 50],
            dias_pago_comunes: [5, 10, 15],
            dias_anticipacion_comunes: [30, 60, 90],
            dias_devolucion_comunes: [15, 30, 45]
        };
    },

    // Validar relación garantía-renta
    validateGarantiaRentaRatio(garantia, renta) {
        if (!garantia || !renta) return true;
        
        const numGarantia = parseFloat(garantia);
        const numRenta = parseFloat(renta);
        
        // La garantía típicamente es 1-3 meses de renta
        const ratio = numGarantia / numRenta;
        return ratio >= 0.5 && ratio <= 6;
    },

    // Validar coherencia de fechas de contrato
    validateContractDates(fechaInicio, fechaTermino, vigencia) {
        if (!fechaInicio || !fechaTermino) return true;
        
        const inicio = new Date(fechaInicio);
        const termino = new Date(fechaTermino);
        
        // Verificar que término sea posterior al inicio
        if (termino <= inicio) return false;
        
        // Verificar coherencia con vigencia si está definida
        if (vigencia) {
            const diferenciaMeses = (termino.getFullYear() - inicio.getFullYear()) * 12 + (termino.getMonth() - inicio.getMonth());
            
            switch (vigencia) {
                case '1 año':
                    return diferenciaMeses >= 11 && diferenciaMeses <= 13;
                case '2 años':
                    return diferenciaMeses >= 23 && diferenciaMeses <= 25;
                case '3 años':
                    return diferenciaMeses >= 35 && diferenciaMeses <= 37;
                default:
                    return true;
            }
        }
        
        return true;
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
ConfigUtils.log('info', 'Sistema de configuración de Contrato de Arriendo inicializado', {
    version: CONFIG.APP.version,
    capabilities: ConfigUtils.detectBrowserCapabilities(),
    mobile: ConfigUtils.isMobile(),
    accessibility: ConfigUtils.detectAccessibilityPreferences()
});