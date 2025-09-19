// ========================================
// 📋 CONFIGURACIÓN DEL SISTEMA DE CONVENIO DE PRÁCTICA PROFESIONAL
// ========================================

const CONFIG = {
    // ===== CONFIGURACIÓN GENERAL =====
    APP: {
        name: 'Notaría Digital - Convenio de Práctica Profesional',
        version: '1.0.0',
        author: 'Sistema Notarial Digital Chile',
        description: 'Sistema profesional para generar convenios de práctica profesional con firmas digitales'
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
        key: 'convenio_practica_form_data',
        max_history: 5
    },

    // ===== CONFIGURACIÓN DE VALIDACIÓN =====
    VALIDATION: {
        rut: {
            min_length: 8,
            max_length: 12,
            format: /^[0-9]+[-|‐]{1}[0-9kK]{1}$/
        },
        cedula: {
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
        address: {
            min_length: 5,
            max_length: 200
        },
        horas_practica: {
            min: 480,
            max: 720
        },
        nacionalidad: {
            min_length: 2,
            max_length: 50,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/
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
            title: 16,
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
            invalid_cedula: 'Cédula de identidad inválida',
            invalid_phone: 'Número de teléfono inválido',
            invalid_address: 'Dirección inválida',
            invalid_dates: 'Las fechas son inválidas',
            pdf_error: 'Error al generar el PDF',
            network_error: 'Error de conexión',
            missing_empresa_data: 'Complete los datos de la empresa',
            missing_educando_data: 'Complete los datos del educando',
            missing_establecimiento_data: 'Complete los datos del establecimiento',
            invalid_horas: 'Las horas de práctica deben estar entre 480 y 720',
            invalid_nacionalidad: 'Nacionalidad inválida'
        },
        warning: {
            missing_signature: 'Falta firma digital',
            missing_photo: 'Faltan fotos de carnet',
            unsaved_changes: 'Hay cambios sin guardar',
            old_browser: 'Su navegador puede no ser compatible con todas las funciones',
            missing_empresa_signature: 'Falta firma de la empresa',
            missing_educando_signature: 'Falta firma del educando'
        },
        info: {
            auto_save: 'Cambios guardados automáticamente',
            signature_ready: 'Firma lista para usar',
            photo_ready: 'Foto lista para usar',
            form_complete: 'Formulario completo',
            convenio_ready: 'Convenio listo para generar'
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

    // ===== CONFIGURACIÓN ESPECÍFICA DEL CONVENIO DE PRÁCTICA PROFESIONAL =====
    CONVENIO: {
        tipos_establecimiento: [
            'Instituto Profesional',
            'Centro de Formación Técnica',
            'Universidad',
            'Liceo Técnico-Profesional',
            'Centro de Capacitación'
        ],
        tipos_empresa: [
            'Sociedad Anónima',
            'Sociedad de Responsabilidad Limitada',
            'Empresa Individual de Responsabilidad Limitada',
            'Sociedad Colectiva',
            'Sociedad en Comandita',
            'Cooperativa',
            'Fundación',
            'Corporación'
        ],
        regiones_chile: [
            'Región de Arica y Parinacota',
            'Región de Tarapacá',
            'Región de Antofagasta',
            'Región de Atacama',
            'Región de Coquimbo',
            'Región de Valparaíso',
            'Región Metropolitana de Santiago',
            'Región del Libertador General Bernardo O\'Higgins',
            'Región del Maule',
            'Región de Ñuble',
            'Región del Biobío',
            'Región de La Araucanía',
            'Región de Los Ríos',
            'Región de Los Lagos',
            'Región Aysén del General Carlos Ibáñez del Campo',
            'Región de Magallanes y de la Antártica Chilena'
        ],
        comunas_principales: [
            'Santiago', 'Las Condes', 'Providencia', 'Ñuñoa', 'Maipú', 'La Florida',
            'Puente Alto', 'San Bernardo', 'Valparaíso', 'Viña del Mar', 'Concepción',
            'Talcahuano', 'Temuco', 'Valdivia', 'Puerto Montt', 'Iquique', 'Antofagasta',
            'La Serena', 'Rancagua', 'Talca', 'Chillán'
        ],
        ciudades_principales: [
            'Santiago', 'Valparaíso', 'Viña del Mar', 'Concepción', 'La Serena',
            'Antofagasta', 'Temuco', 'Rancagua', 'Talca', 'Arica', 'Chillán',
            'Iquique', 'Los Angeles', 'Puerto Montt', 'Valdivia', 'Osorno',
            'Quilpué', 'Villa Alemana', 'Curicó', 'Calama'
        ],
        nacionalidades_comunes: [
            'Chilena', 'Argentina', 'Peruana', 'Boliviana', 'Colombiana',
            'Venezolana', 'Ecuatoriana', 'Brasileña', 'Uruguaya', 'Paraguaya',
            'Española', 'Italiana', 'Alemana', 'Francesa', 'Estadounidense'
        ],
        areas_practica: [
            'Administración y Negocios',
            'Contabilidad y Auditoría',
            'Informática y Telecomunicaciones',
            'Ingeniería',
            'Salud',
            'Educación',
            'Turismo y Hotelería',
            'Gastronomía',
            'Diseño y Comunicación',
            'Construcción',
            'Electricidad',
            'Mecánica',
            'Marketing y Ventas',
            'Recursos Humanos',
            'Logística y Transporte'
        ],
        horarios_comunes: [
            'Lunes a Viernes de 08:00 a 17:00 hrs',
            'Lunes a Viernes de 09:00 a 18:00 hrs',
            'Lunes a Viernes de 08:30 a 17:30 hrs',
            'Lunes a Viernes de 09:00 a 13:00 hrs',
            'Lunes a Viernes de 14:00 a 18:00 hrs',
            'Turno rotativo según necesidades de la empresa'
        ]
    },

    // ===== CONFIGURACIÓN ESPECÍFICA DEL DOCUMENTO =====
    DOCUMENT: {
        title: 'MODELO CONVENIO DE PRÁCTICA PROFESIONAL',
        subtitle: '',
        legal_basis: 'D.S. Nº 30 de Educación - Ministerio de Educación Pública',
        validity_period: 'Válido durante el período de práctica establecido',
        required_docs: [
            'Cédula nacional de identidad del representante de la empresa',
            'Cédula nacional de identidad del educando',
            'Certificado de matrícula del educando',
            'RUT de la empresa'
        ],
        disclaimer: 'Este convenio no se rige por la legislación laboral, ya que la práctica profesional obedece a normas emanadas por el Ministerio de Educación Pública.',
        law_reference: 'Documento emitido de acuerdo con el D.S. Nº 30, de Educación, publicado el 11-03-1987.'
    }
};

// ===== UTILIDADES DE CONFIGURACIÓN =====
const ConfigUtils = {
    // Validar RUT o Cédula chilena
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

    // Validar Cédula de Identidad (alias para validateRUT)
    validateCedula(cedula) {
        return this.validateRUT(cedula);
    },

    // Formatear RUT/Cédula con puntos y guión
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
        maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
        
        return date >= new Date('1900-01-01') && date <= maxFutureDate;
    },

    // Validar fecha de nacimiento (debe ser en el pasado)
    validateBirthDate(dateString) {
        if (!dateString) return false;
        
        const date = new Date(dateString);
        const now = new Date();
        
        // Verificar que sea una fecha válida
        if (isNaN(date.getTime())) return false;
        
        // Verificar que sea una fecha pasada
        if (date >= now) return false;
        
        // Verificar rango razonable (entre 14 y 100 años)
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 100);
        
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - 14);
        
        return date >= minDate && date <= maxDate;
    },

    // Validar nombre
    validateName(name) {
        if (!name || typeof name !== 'string') return false;
        
        const trimmedName = name.trim();
        return trimmedName.length >= CONFIG.VALIDATION.names.min_length &&
               trimmedName.length <= CONFIG.VALIDATION.names.max_length &&
               CONFIG.VALIDATION.names.pattern.test(trimmedName);
    },

    // Validar dirección
    validateAddress(address) {
        if (!address || typeof address !== 'string') return false;
        
        const trimmedAddress = address.trim();
        return trimmedAddress.length >= CONFIG.VALIDATION.address.min_length &&
               trimmedAddress.length <= CONFIG.VALIDATION.address.max_length;
    },

    // Validar nacionalidad
    validateNacionalidad(nacionalidad) {
        if (!nacionalidad || typeof nacionalidad !== 'string') return false;
        
        const trimmedNacionalidad = nacionalidad.trim();
        return trimmedNacionalidad.length >= CONFIG.VALIDATION.nacionalidad.min_length &&
               trimmedNacionalidad.length <= CONFIG.VALIDATION.nacionalidad.max_length &&
               CONFIG.VALIDATION.nacionalidad.pattern.test(trimmedNacionalidad);
    },

    // Validar horas de práctica
    validateHorasPractica(horas) {
        if (!horas || isNaN(horas)) return false;
        
        const numHoras = parseInt(horas);
        return numHoras >= CONFIG.VALIDATION.horas_practica.min &&
               numHoras <= CONFIG.VALIDATION.horas_practica.max;
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
        let result = 'CPP-'; // Convenio Práctica Profesional
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

    // Formatear fecha para mostrar en español
    formatDateToSpanish(dateString) {
        if (!dateString || !ConfigUtils.validateDate(dateString)) return '';
        
        const date = new Date(dateString);
        const day = date.getDate();
        const month = CONFIG.MONTHS[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day} de ${month} de ${year}`;
    },

    // Calcular edad desde fecha de nacimiento
    calculateAge(birthDate) {
        if (!birthDate || !ConfigUtils.validateBirthDate(birthDate)) return '';
        
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    },

    // Obtener nombre del día de la semana
    getDayName(dateString) {
        if (!dateString || !this.validateDate(dateString)) return '';
        
        const date = new Date(dateString);
        return CONFIG.DAYS[date.getDay()];
    },

    // Validar datos de la empresa
    validateEmpresaData(data) {
        const errors = [];
        
        if (!data.nombreEmpresa || !this.validateName(data.nombreEmpresa)) {
            errors.push('Nombre de la empresa inválido');
        }
        
        if (!data.rutEmpresa || !this.validateRUT(data.rutEmpresa)) {
            errors.push('RUT de la empresa inválido');
        }
        
        if (!data.nombreRepresentante || !this.validateName(data.nombreRepresentante)) {
            errors.push('Nombre del representante inválido');
        }
        
        if (!data.rutRepresentante || !this.validateRUT(data.rutRepresentante)) {
            errors.push('RUT del representante inválido');
        }
        
        if (!data.domicilioEmpresa || !this.validateAddress(data.domicilioEmpresa)) {
            errors.push('Domicilio de la empresa inválido');
        }
        
        if (!data.comunaEmpresa || data.comunaEmpresa.trim().length < 2) {
            errors.push('Comuna de la empresa inválida');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Validar datos del educando
    validateEducandoData(data) {
        const errors = [];
        
        if (!data.nombreEducando || !this.validateName(data.nombreEducando)) {
            errors.push('Nombre del educando inválido');
        }
        
        if (!data.rutEducando || !this.validateRUT(data.rutEducando)) {
            errors.push('RUT del educando inválido');
        }
        
        if (!data.nacionalidadEducando || !this.validateNacionalidad(data.nacionalidadEducando)) {
            errors.push('Nacionalidad del educando inválida');
        }
        
        if (!data.fechaNacimientoEducando || !this.validateBirthDate(data.fechaNacimientoEducando)) {
            errors.push('Fecha de nacimiento del educando inválida');
        }
        
        if (!data.domicilioEducando || !this.validateAddress(data.domicilioEducando)) {
            errors.push('Domicilio del educando inválido');
        }
        
        if (!data.comunaEducando || data.comunaEducando.trim().length < 2) {
            errors.push('Comuna del educando inválida');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Validar condiciones de práctica
    validateCondicionesPractica(data) {
        const errors = [];
        
        if (!data.seccionPractica || data.seccionPractica.trim().length < 2) {
            errors.push('Sección de práctica requerida');
        }
        
        if (!data.horasTotales || !this.validateHorasPractica(data.horasTotales)) {
            errors.push('Horas totales de práctica inválidas (480-720 horas)');
        }
        
        if (!data.horarioPractica || data.horarioPractica.trim().length < 5) {
            errors.push('Horario de práctica requerido');
        }
        
        if (!data.fechaInicioPractica || !this.validateDate(data.fechaInicioPractica)) {
            errors.push('Fecha de inicio de práctica inválida');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Generar resumen del convenio
    generateConvenioSummary(formData) {
        return {
            establecimiento: {
                nombre: formData.nombreEstablecimiento || '',
                docente: formData.nombreDocente || ''
            },
            empresa: {
                nombre: formData.nombreEmpresa || '',
                rut: formData.rutEmpresa || '',
                representante: formData.nombreRepresentante || '',
                rutRepresentante: formData.rutRepresentante || '',
                domicilio: formData.domicilioEmpresa || '',
                comuna: formData.comunaEmpresa || ''
            },
            educando: {
                nombre: formData.nombreEducando || '',
                rut: formData.rutEducando || '',
                nacionalidad: formData.nacionalidadEducando || '',
                fechaNacimiento: formData.fechaNacimientoEducando || '',
                domicilio: formData.domicilioEducando || '',
                comuna: formData.comunaEducando || ''
            },
            practica: {
                seccion: formData.seccionPractica || '',
                horas: formData.horasTotales || '',
                horario: formData.horarioPractica || '',
                fechaInicio: formData.fechaInicioPractica || ''
            },
            asignaciones: {
                colacion: formData.asignacionColacion || 0,
                movilizacion: formData.asignacionMovilizacion || 0,
                reembolso: formData.topeReembolso || 0
            },
            fecha: formData.fechaConvenio || '',
            ciudad: formData.ciudadConvenio || 'Santiago',
            condicionesEspecificas: formData.condicionesEspecificas || '',
            diasInasistencia: formData.diasInasistencia || 3,
            numeroEjemplares: formData.numeroEjemplares || 3,
            timestamp: new Date().toISOString()
        };
    },

    // Validar formulario completo
    validateCompleteForm(formData) {
        const errors = [];
        
        // Validar datos básicos
        if (!formData.ciudadConvenio || formData.ciudadConvenio.trim().length < 2) {
            errors.push('Ciudad del convenio requerida');
        }
        
        if (!formData.fechaConvenio || !this.validateDate(formData.fechaConvenio)) {
            errors.push('Fecha del convenio inválida');
        }
        
        // Validar establecimiento educacional
        if (!formData.nombreEstablecimiento || formData.nombreEstablecimiento.trim().length < 5) {
            errors.push('Nombre del establecimiento educacional requerido');
        }
        
        if (!formData.nombreDocente || !this.validateName(formData.nombreDocente)) {
            errors.push('Nombre del docente coordinador requerido');
        }
        
        // Validar empresa
        const empresaValidation = this.validateEmpresaData(formData);
        if (!empresaValidation.valid) {
            errors.push(...empresaValidation.errors);
        }
        
        // Validar educando
        const educandoValidation = this.validateEducandoData(formData);
        if (!educandoValidation.valid) {
            errors.push(...educandoValidation.errors);
        }
        
        // Validar condiciones de práctica
        const condicionesValidation = this.validateCondicionesPractica(formData);
        if (!condicionesValidation.valid) {
            errors.push(...condicionesValidation.errors);
        }
        
        return {
            valid: errors.length === 0,
            errors,
            summary: this.generateConvenioSummary(formData)
        };
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
ConfigUtils.log('info', 'Sistema de configuración de Convenio de Práctica Profesional inicializado', {
    version: CONFIG.APP.version,
    capabilities: ConfigUtils.detectBrowserCapabilities(),
    mobile: ConfigUtils.isMobile(),
    accessibility: ConfigUtils.detectAccessibilityPreferences()
});