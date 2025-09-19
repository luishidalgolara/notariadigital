// ========================================
// 📋 CONFIGURACIÓN DEL SISTEMA DE OFERTA LABORAL PARA EXTRANJEROS
// ========================================

const CONFIG = {
    // ===== CONFIGURACIÓN GENERAL =====
    APP: {
        name: 'Notaría Digital - Oferta Laboral para Extranjeros',
        version: '1.0.0',
        author: 'Sistema Notarial Digital Chile',
        description: 'Sistema profesional para generar ofertas laborales para trabajadores extranjeros con firmas digitales'
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
        key: 'oferta_laboral_form_data',
        max_history: 5
    },

    // ===== CONFIGURACIÓN DE VALIDACIÓN =====
    VALIDATION: {
        rut: {
            min_length: 8,
            max_length: 12,
            format: /^[0-9]+[-|‐]{1}[0-9kK]{1}$/
        },
        pasaporte: {
            min_length: 6,
            max_length: 15,
            format: /^[A-Z0-9]+$/
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
        remuneracion: {
            min: 400000, // Sueldo mínimo aproximado
            max: 50000000 // Límite máximo razonable
        },
        nacionalidad: {
            min_length: 2,
            max_length: 50,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/
        },
        cargo: {
            min_length: 3,
            max_length: 100,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-\/]+$/
        },
        funciones: {
            min_length: 10,
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
            invalid_pasaporte: 'Número de pasaporte inválido',
            invalid_phone: 'Número de teléfono inválido',
            invalid_address: 'Dirección inválida',
            invalid_dates: 'Las fechas son inválidas',
            pdf_error: 'Error al generar el PDF',
            network_error: 'Error de conexión',
            missing_oferente_data: 'Complete los datos del oferente',
            missing_receptor_data: 'Complete los datos del receptor',
            invalid_remuneracion: 'La remuneración debe ser mayor al sueldo mínimo',
            invalid_nacionalidad: 'Nacionalidad inválida',
            invalid_cargo: 'Nombre del cargo inválido',
            invalid_funciones: 'Funciones muy cortas o demasiado extensas'
        },
        warning: {
            missing_signature: 'Falta firma digital',
            missing_photo: 'Faltan fotos de carnet',
            unsaved_changes: 'Hay cambios sin guardar',
            old_browser: 'Su navegador puede no ser compatible con todas las funciones',
            missing_oferente_signature: 'Falta firma del oferente',
            missing_receptor_signature: 'Falta firma del receptor',
            low_salary: 'La remuneración parece estar bajo el sueldo mínimo'
        },
        info: {
            auto_save: 'Cambios guardados automáticamente',
            signature_ready: 'Firma lista para usar',
            photo_ready: 'Foto lista para usar',
            form_complete: 'Formulario completo',
            oferta_ready: 'Oferta laboral lista para generar'
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

    // ===== CONFIGURACIÓN ESPECÍFICA DE OFERTA LABORAL =====
    OFERTA_LABORAL: {
        tipos_contrato: [
            'Indefinido',
            'Plazo Fijo',
            'Por Obra o Faena',
            'Honorarios',
            'Aprendizaje'
        ],
        tipos_jornada: [
            'Jornada Completa (45 hrs semanales)',
            'Jornada Parcial',
            'Jornada Excepcional',
            'Turno',
            'Jornada Bisemanal'
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
        nacionalidades_extranjeros: [
            'Argentina', 'Peruana', 'Boliviana', 'Colombiana', 'Venezolana',
            'Ecuatoriana', 'Brasileña', 'Uruguaya', 'Paraguaya', 'Mexicana',
            'Cubana', 'Dominicana', 'Española', 'Italiana', 'Alemana',
            'Francesa', 'Portuguesa', 'Rumana', 'Croata', 'Polaca',
            'Rusa', 'Ucraniana', 'China', 'Coreana', 'Japonesa',
            'India', 'Paquistaní', 'Filipina', 'Tailandesa', 'Vietnamita',
            'Estadounidense', 'Canadiense', 'Australiana', 'Neozelandesa',
            'Sudafricana', 'Nigeriana', 'Marroquí', 'Egipcia', 'Turca'
        ],
        areas_trabajo: [
            'Administración y Negocios',
            'Contabilidad y Finanzas',
            'Informática y Tecnología',
            'Ingeniería',
            'Salud y Medicina',
            'Educación',
            'Turismo y Hotelería',
            'Gastronomía y Alimentación',
            'Diseño y Comunicaciones',
            'Construcción y Arquitectura',
            'Electricidad y Electrónica',
            'Mecánica y Automotriz',
            'Marketing y Ventas',
            'Recursos Humanos',
            'Logística y Transporte',
            'Servicios Generales',
            'Agricultura y Pesca',
            'Minería y Metalurgia',
            'Textil y Confección',
            'Servicios Domésticos'
        ],
        cargos_frecuentes: [
            'Desarrollador de Software',
            'Analista de Sistemas',
            'Ingeniero Civil',
            'Contador Auditor',
            'Administrador de Empresas',
            'Vendedor',
            'Cajero',
            'Operario de Producción',
            'Supervisor de Turno',
            'Recepcionista',
            'Asistente Administrativo',
            'Chef de Cocina',
            'Garzon/Mesero',
            'Técnico Electricista',
            'Técnico Mecánico',
            'Chofer Profesional',
            'Operador de Maquinaria',
            'Auxiliar de Aseo',
            'Guardia de Seguridad',
            'Profesor de Idiomas',
            'Traductor',
            'Diseñador Gráfico',
            'Marketing Digital',
            'Analista de Datos',
            'Enfermero',
            'Técnico en Salud',
            'Fisioterapeuta',
            'Nutricionista',
            'Psicólogo',
            'Trabajador Social'
        ],
        horarios_comunes: [
            'Lunes a Viernes de 08:00 a 17:00',
            'Lunes a Viernes de 09:00 a 18:00',
            'Lunes a Sábado de 08:30 a 17:30',
            'Turno de Mañana: 06:00 a 14:00',
            'Turno de Tarde: 14:00 a 22:00',
            'Turno de Noche: 22:00 a 06:00',
            'Lunes a Viernes de 09:00 a 13:00 y 14:00 a 18:00',
            'Horario de Mall: incluye fines de semana',
            'Horario rotativo según necesidades',
            'Jornada Parcial: 4 horas diarias'
        ]
    },

    // ===== CONFIGURACIÓN ESPECÍFICA DEL DOCUMENTO =====
    DOCUMENT: {
        title: 'OFERTA LABORAL',
        subtitle: 'Para Trabajadores Extranjeros',
        legal_basis: 'Ley N° 21.325 de Migración y Extranjería - DFL N° 1 Código del Trabajo',
        validity_period: 'Válida por 30 días desde su emisión',
        required_docs: [
            'Pasaporte vigente del trabajador extranjero',
            'Cédula de identidad del oferente',
            'RUT de la empresa o empleador',
            'Certificados de estudios y experiencia laboral'
        ],
        disclaimer: 'Esta oferta laboral está sujeta a la obtención de los permisos de trabajo correspondientes según la legislación migratoria chilena vigente.',
        law_reference: 'Documento elaborado conforme a la Ley N° 21.325 de Migración y Extranjería y el Código del Trabajo chileno.'
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

    // Validar número de pasaporte
    validatePasaporte(pasaporte) {
        if (!pasaporte || typeof pasaporte !== 'string') return false;
        
        const cleanPasaporte = pasaporte.replace(/[^A-Z0-9]/g, '').toUpperCase();
        return cleanPasaporte.length >= CONFIG.VALIDATION.pasaporte.min_length &&
               cleanPasaporte.length <= CONFIG.VALIDATION.pasaporte.max_length &&
               CONFIG.VALIDATION.pasaporte.format.test(cleanPasaporte);
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

    // Formatear número de pasaporte
    formatPasaporte(pasaporte) {
        if (!pasaporte) return '';
        return pasaporte.toUpperCase().trim();
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
        
        // Verificar rango razonable (entre 16 y 80 años)
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 80);
        
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - 16);
        
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

    // Validar cargo
    validateCargo(cargo) {
        if (!cargo || typeof cargo !== 'string') return false;
        
        const trimmedCargo = cargo.trim();
        return trimmedCargo.length >= CONFIG.VALIDATION.cargo.min_length &&
               trimmedCargo.length <= CONFIG.VALIDATION.cargo.max_length &&
               CONFIG.VALIDATION.cargo.pattern.test(trimmedCargo);
    },

    // Validar funciones
    validateFunciones(funciones) {
        if (!funciones || typeof funciones !== 'string') return false;
        
        const trimmedFunciones = funciones.trim();
        return trimmedFunciones.length >= CONFIG.VALIDATION.funciones.min_length &&
               trimmedFunciones.length <= CONFIG.VALIDATION.funciones.max_length;
    },

    // Validar remuneración
    validateRemuneracion(remuneracion) {
        if (!remuneracion || isNaN(remuneracion)) return false;
        
        const numRemuneracion = parseInt(remuneracion);
        return numRemuneracion >= CONFIG.VALIDATION.remuneracion.min &&
               numRemuneracion <= CONFIG.VALIDATION.remuneracion.max;
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
        let result = 'OLE-'; // Oferta Laboral Extranjeros
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

    // Validar datos del oferente
    validateOferenteData(data) {
        const errors = [];
        
        if (!data.nombreOferente || !this.validateName(data.nombreOferente)) {
            errors.push('Nombre del oferente inválido');
        }
        
        if (!data.rutOferente || !this.validateRUT(data.rutOferente)) {
            errors.push('RUT del oferente inválido');
        }
        
        if (!data.nombreEmpresa || data.nombreEmpresa.trim().length < 2) {
            errors.push('Nombre de la empresa inválido');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Validar datos del receptor
    validateReceptorData(data) {
        const errors = [];
        
        if (!data.nombreReceptor || !this.validateName(data.nombreReceptor)) {
            errors.push('Nombre del receptor inválido');
        }
        
        if (!data.numeroPasaporte || !this.validatePasaporte(data.numeroPasaporte)) {
            errors.push('Número de pasaporte inválido');
        }
        
        if (!data.nacionalidadReceptor || !this.validateNacionalidad(data.nacionalidadReceptor)) {
            errors.push('Nacionalidad del receptor inválida');
        }
        
        if (!data.fechaNacimientoReceptor || !this.validateBirthDate(data.fechaNacimientoReceptor)) {
            errors.push('Fecha de nacimiento del receptor inválida');
        }
        
        if (!data.domicilioReceptor || !this.validateAddress(data.domicilioReceptor)) {
            errors.push('Domicilio del receptor inválido');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Validar condiciones laborales
    validateCondicionesLaborales(data) {
        const errors = [];
        
        if (!data.nombreCargo || !this.validateCargo(data.nombreCargo)) {
            errors.push('Nombre del cargo inválido');
        }
        
        if (!data.funcionesDesempenar || !this.validateFunciones(data.funcionesDesempenar)) {
            errors.push('Descripción de funciones insuficiente');
        }
        
        if (!data.remuneracionMensual || !this.validateRemuneracion(data.remuneracionMensual)) {
            errors.push('Remuneración mensual inválida');
        }
        
        if (!data.tipoContrato || data.tipoContrato.trim().length < 2) {
            errors.push('Tipo de contrato requerido');
        }
        
        if (!data.jornadaLaboral || data.jornadaLaboral.trim().length < 2) {
            errors.push('Jornada laboral requerida');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Generar resumen de la oferta laboral
    generateOfertaSummary(formData) {
        return {
            oferente: {
                nombre: formData.nombreOferente || '',
                rut: formData.rutOferente || '',
                empresa: formData.nombreEmpresa || ''
            },
            receptor: {
                nombre: formData.nombreReceptor || '',
                pasaporte: formData.numeroPasaporte || '',
                nacionalidad: formData.nacionalidadReceptor || '',
                fechaNacimiento: formData.fechaNacimientoReceptor || '',
                domicilio: formData.domicilioReceptor || ''
            },
            oferta: {
                cargo: formData.nombreCargo || '',
                funciones: formData.funcionesDesempenar || '',
                remuneracion: formData.remuneracionMensual || '',
                tipoContrato: formData.tipoContrato || '',
                jornada: formData.jornadaLaboral || '',
                horario: formData.horarioTrabajo || '',
                fechaInicio: formData.fechaInicioPropuesta || '',
                duracion: formData.duracionContrato || ''
            },
            ubicacion: {
                region: formData.regionOferta || '',
                comuna: formData.comunaOferta || ''
            },
            fecha: formData.fechaOferta || '',
            observaciones: formData.observacionesAdicionales || '',
            timestamp: new Date().toISOString()
        };
    },

    // Validar formulario completo
    validateCompleteForm(formData) {
        const errors = [];
        
        // Validar datos básicos
        if (!formData.regionOferta || formData.regionOferta.trim().length < 2) {
            errors.push('Región requerida');
        }
        
        if (!formData.comunaOferta || formData.comunaOferta.trim().length < 2) {
            errors.push('Comuna requerida');
        }
        
        if (!formData.fechaOferta || !this.validateDate(formData.fechaOferta)) {
            errors.push('Fecha de la oferta inválida');
        }
        
        // Validar oferente
        const oferenteValidation = this.validateOferenteData(formData);
        if (!oferenteValidation.valid) {
            errors.push(...oferenteValidation.errors);
        }
        
        // Validar receptor
        const receptorValidation = this.validateReceptorData(formData);
        if (!receptorValidation.valid) {
            errors.push(...receptorValidation.errors);
        }
        
        // Validar condiciones laborales
        const condicionesValidation = this.validateCondicionesLaborales(formData);
        if (!condicionesValidation.valid) {
            errors.push(...condicionesValidation.errors);
        }
        
        return {
            valid: errors.length === 0,
            errors,
            summary: this.generateOfertaSummary(formData)
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
ConfigUtils.log('info', 'Sistema de configuración de Oferta Laboral para Extranjeros inicializado', {
    version: CONFIG.APP.version,
    capabilities: ConfigUtils.detectBrowserCapabilities(),
    mobile: ConfigUtils.isMobile()
});