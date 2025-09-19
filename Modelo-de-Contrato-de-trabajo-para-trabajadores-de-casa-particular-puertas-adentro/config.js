// ========================================
// 📋 CONFIGURACIÓN DEL SISTEMA DE CONTRATO CASA PARTICULAR
// ========================================

const CONFIG = {
    // ===== CONFIGURACIÓN GENERAL =====
    APP: {
        name: 'Notaría Digital - Contrato de Trabajo Casa Particular',
        version: '1.0.0',
        author: 'Sistema Notarial Digital Chile',
        description: 'Sistema profesional para generar contratos de trabajo para casa particular con firmas digitales'
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
        key: 'contrato_casa_particular_form_data',
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
            max_length: 15,
            format: /^[0-9A-Z]+$/
        },
        names: {
            min_length: 2,
            max_length: 100,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/
        },
        address: {
            min_length: 5,
            max_length: 200
        },
        sueldo: {
            min: 400000, // Sueldo mínimo aproximado
            max: 50000000 // Límite máximo razonable
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
            pdf: 'Generando contrato PDF...',
            saving: 'Guardando información...'
        },
        success: {
            signature_added: 'Firma digital agregada correctamente',
            photo_captured: 'Foto capturada exitosamente',
            pdf_generated: 'Contrato PDF generado correctamente',
            form_saved: 'Formulario guardado automáticamente'
        },
        error: {
            camera_access: 'No se pudo acceder a la cámara',
            invalid_image: 'Formato de imagen no válido',
            file_too_large: 'El archivo es demasiado grande',
            missing_fields: 'Complete todos los campos requeridos',
            invalid_rut: 'RUT inválido',
            invalid_cedula: 'Cédula de identidad inválida',
            invalid_address: 'Dirección inválida',
            invalid_dates: 'Las fechas son inválidas',
            pdf_error: 'Error al generar el PDF',
            network_error: 'Error de conexión',
            missing_empleador_data: 'Complete los datos del empleador',
            missing_trabajador_data: 'Complete los datos del trabajador',
            invalid_sueldo: 'El sueldo debe ser mayor al sueldo mínimo',
            invalid_nacionalidad: 'Nacionalidad inválida',
            no_tareas_selected: 'Debe seleccionar al menos una tarea'
        },
        warning: {
            missing_signature: 'Falta firma digital',
            missing_photo: 'Faltan fotos de carnet',
            unsaved_changes: 'Hay cambios sin guardar',
            old_browser: 'Su navegador puede no ser compatible con todas las funciones',
            missing_empleador_signature: 'Falta firma del empleador',
            missing_trabajador_signature: 'Falta firma del trabajador',
            low_salary: 'El sueldo parece estar bajo el sueldo mínimo'
        },
        info: {
            auto_save: 'Cambios guardados automáticamente',
            signature_ready: 'Firma lista para usar',
            photo_ready: 'Foto lista para usar',
            form_complete: 'Formulario completo',
            contrato_ready: 'Contrato listo para generar'
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

    // ===== CONFIGURACIÓN ESPECÍFICA DE CONTRATO CASA PARTICULAR =====
    CONTRATO_CASA_PARTICULAR: {
        tipos_regimen: [
            'Puertas Adentro',
            'Puertas Afuera'
        ],
        tipos_jornada: [
            'Jornada Completa (45 hrs semanales)',
            'Jornada Parcial'
        ],
        formas_pago: [
            'Dinero efectivo',
            'Cheque',
            'Depósito en cuenta vista',
            'Depósito en cuenta corriente'
        ],
        periodos_pago: [
            'Mensual',
            'Quincenal',
            'Semanal'
        ],
        sistemas_salud: [
            'FONASA',
            'ISAPRE'
        ],
        afp_principales: [
            'Capital',
            'Cuprum',
            'Habitat',
            'Modelo',
            'Planvital',
            'ProVida',
            'Uno'
        ],
        isapres_principales: [
            'Banmédica',
            'Colmena Golden Cross',
            'Consalud',
            'Cruz Blanca',
            'Nueva Masvida',
            'Vida Tres'
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
        nacionalidades_comunes: [
            'Chilena', 'Argentina', 'Peruana', 'Boliviana', 'Colombiana', 'Venezolana',
            'Ecuatoriana', 'Brasileña', 'Uruguaya', 'Paraguaya', 'Mexicana',
            'Cubana', 'Dominicana', 'Española', 'Italiana', 'Alemana',
            'Francesa', 'Portuguesa', 'China', 'Coreana', 'Japonesa',
            'India', 'Filipina', 'Estadounidense', 'Canadiense'
        ],
        tareas_casa_particular: {
            aseo: 'Labores de aseo general del hogar',
            cocinar: 'Preparación de alimentos y cocina',
            lavar: 'Lavado y planchado de ropa',
            jardineria: 'Cuidado de jardín y plantas',
            chofer: 'Conducción de vehículos',
            cuidado_ninos: 'Cuidado y atención de menores'
        },
        horarios_comunes: [
            'Lunes a Viernes de 08:00 a 17:00',
            'Lunes a Viernes de 09:00 a 18:00',
            'Lunes a Sábado de 08:30 a 17:30',
            'Lunes a Viernes de 07:00 a 16:00',
            'Lunes a Viernes de 08:00 a 12:00',
            'Lunes a Viernes de 14:00 a 18:00'
        ]
    },

    // ===== CONFIGURACIÓN ESPECÍFICA DEL DOCUMENTO =====
    DOCUMENT: {
        title: 'CONTRATO DE TRABAJO',
        subtitle: 'Trabajador(a) de Casa Particular',
        legal_basis: 'Código del Trabajo de Chile - Ley N° 20.786',
        validity_period: 'Vigente desde su firma',
        required_docs: [
            'Cédula de identidad del empleador',
            'Cédula de identidad o pasaporte del trabajador',
            'Certificados de estudios (si aplica)',
            'Referencias laborales (si aplica)'
        ],
        disclaimer: 'Este contrato se rige por las disposiciones del Código del Trabajo chileno y normativas específicas para trabajadores de casa particular.',
        law_reference: 'Documento elaborado conforme al Código del Trabajo de Chile y la Ley N° 20.786 que modifica las normas sobre trabajadoras de casa particular.'
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

    // Validar cédula de identidad o pasaporte
    validateCedula(cedula) {
        if (!cedula || typeof cedula !== 'string') return false;
        
        const cleanCedula = cedula.replace(/[^A-Z0-9]/g, '').toUpperCase();
        
        // Verificar si es RUT chileno
        if (/^[0-9]+[0-9K]$/.test(cleanCedula)) {
            return this.validateRUT(cedula);
        }
        
        // Verificar si es pasaporte extranjero
        return cleanCedula.length >= CONFIG.VALIDATION.cedula.min_length &&
               cleanCedula.length <= CONFIG.VALIDATION.cedula.max_length;
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

    // Formatear cédula
    formatCedula(cedula) {
        if (!cedula) return '';
        
        // Si parece un RUT, formatearlo como tal
        if (/^[0-9]+[0-9kK]$/.test(cedula.replace(/[^0-9kK]/g, ''))) {
            return this.formatRUT(cedula);
        }
        
        // Si es pasaporte, solo mayúsculas
        return cedula.toUpperCase().trim();
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

    // Validar fecha de nacimiento
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

    // Validar sueldo
    validateSueldo(sueldo) {
        if (!sueldo || isNaN(sueldo)) return false;
        
        const numSueldo = parseInt(sueldo);
        return numSueldo >= CONFIG.VALIDATION.sueldo.min &&
               numSueldo <= CONFIG.VALIDATION.sueldo.max;
    },

    // Validar que al menos una tarea esté seleccionada
    validateTareas() {
        const tareas = ['tareaAseo', 'tareaCocinar', 'tareaLavar', 'tareaJardineria', 'tareaChofer', 'tareaCuidadoNinos'];
        return tareas.some(tarea => {
            const checkbox = document.getElementById(tarea);
            return checkbox && checkbox.checked;
        });
    },

    // Obtener tareas seleccionadas
    getSelectedTareas() {
        const tareas = {
            'tareaAseo': 'Aseo general del hogar',
            'tareaCocinar': 'Preparación de alimentos y cocina',
            'tareaLavar': 'Lavado y planchado de ropa',
            'tareaJardineria': 'Cuidado de jardín y plantas',
            'tareaChofer': 'Conducción de vehículos',
            'tareaCuidadoNinos': 'Cuidado y atención de menores'
        };
        
        const selected = [];
        Object.keys(tareas).forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox && checkbox.checked) {
                selected.push(tareas[id]);
            }
        });
        
        return selected;
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
        let result = 'CCP-'; // Contrato Casa Particular
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

    // Validar datos del empleador
    validateEmpleadorData(data) {
        const errors = [];
        
        if (!data.nombreEmpleador || !this.validateName(data.nombreEmpleador)) {
            errors.push('Nombre del empleador inválido');
        }
        
        if (!data.rutEmpleador || !this.validateRUT(data.rutEmpleador)) {
            errors.push('RUT del empleador inválido');
        }
        
        if (!data.domicilioEmpleador || !this.validateAddress(data.domicilioEmpleador)) {
            errors.push('Domicilio del empleador inválido');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Validar datos del trabajador
    validateTrabajadorData(data) {
        const errors = [];
        
        if (!data.nombreTrabajador || !this.validateName(data.nombreTrabajador)) {
            errors.push('Nombre del trabajador inválido');
        }
        
        if (!data.cedulaTrabajador || !this.validateCedula(data.cedulaTrabajador)) {
            errors.push('Cédula del trabajador inválida');
        }
        
        if (!data.nacionalidadTrabajador || !this.validateNacionalidad(data.nacionalidadTrabajador)) {
            errors.push('Nacionalidad del trabajador inválida');
        }
        
        if (!data.fechaNacimientoTrabajador || !this.validateBirthDate(data.fechaNacimientoTrabajador)) {
            errors.push('Fecha de nacimiento del trabajador inválida');
        }
        
        if (!data.domicilioTrabajador || !this.validateAddress(data.domicilioTrabajador)) {
            errors.push('Domicilio del trabajador inválido');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Validar condiciones del contrato
    validateCondicionesContrato(data) {
        const errors = [];
        
        if (!this.validateTareas()) {
            errors.push('Debe seleccionar al menos una tarea');
        }
        
        if (!data.sueldoMensual || !this.validateSueldo(data.sueldoMensual)) {
            errors.push('Sueldo mensual inválido');
        }
        
        if (!data.tipoRegimen || data.tipoRegimen.trim().length < 2) {
            errors.push('Tipo de régimen requerido');
        }
        
        if (!data.tipoDuracion || data.tipoDuracion.trim().length < 2) {
            errors.push('Tipo de duración requerido');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Generar resumen del contrato
    generateContratoSummary(formData) {
        return {
            empleador: {
                nombre: formData.nombreEmpleador || '',
                rut: formData.rutEmpleador || '',
                domicilio: formData.domicilioEmpleador || '',
                comuna: formData.comunaEmpleador || '',
                region: formData.regionEmpleador || ''
            },
            trabajador: {
                nombre: formData.nombreTrabajador || '',
                cedula: formData.cedulaTrabajador || '',
                nacionalidad: formData.nacionalidadTrabajador || '',
                fechaNacimiento: formData.fechaNacimientoTrabajador || '',
                domicilio: formData.domicilioTrabajador || '',
                comuna: formData.comunaTrabajador || '',
                region: formData.regionTrabajador || ''
            },
            contrato: {
                tareas: this.getSelectedTareas(),
                asistenciaEspecial: formData.asistenciaEspecial || 'no',
                detalleAsistencia: formData.detalleAsistencia || '',
                sueldo: formData.sueldoMensual || '',
                otrasPrestaciones: formData.otrasPrestaciones || '',
                formaPago: formData.formaPago || '',
                periodoPago: formData.periodoPago || '',
                afp: formData.afpTrabajador || '',
                salud: formData.saludTrabajador || '',
                isapre: formData.isapreNombre || '',
                tipoRegimen: formData.tipoRegimen || '',
                jornada: formData.jornadaLaboral || '',
                horario: formData.horarioTrabajo || '',
                fechaInicio: formData.fechaInicioServicios || '',
                tipoDuracion: formData.tipoDuracion || '',
                fechaTermino: formData.fechaTermino || ''
            },
            ubicacion: {
                region: formData.regionContrato || '',
                comuna: formData.comunaContrato || '',
                direccionServicio: formData.direccionServicio || '',
                numeroServicio: formData.numeroServicio || '',
                comunaServicio: formData.comunaServicio || '',
                regionServicio: formData.regionServicio || ''
            },
            fecha: formData.fechaContrato || '',
            clausulasEspeciales: formData.clausulasEspeciales || '',
            timestamp: new Date().toISOString()
        };
    },

    // Validar formulario completo
    validateCompleteForm(formData) {
        const errors = [];
        
        // Validar datos básicos
        if (!formData.regionContrato || formData.regionContrato.trim().length < 2) {
            errors.push('Región del contrato requerida');
        }
        
        if (!formData.comunaContrato || formData.comunaContrato.trim().length < 2) {
            errors.push('Comuna del contrato requerida');
        }
        
        if (!formData.fechaContrato || !this.validateDate(formData.fechaContrato)) {
            errors.push('Fecha del contrato inválida');
        }
        
        // Validar empleador
        const empleadorValidation = this.validateEmpleadorData(formData);
        if (!empleadorValidation.valid) {
            errors.push(...empleadorValidation.errors);
        }
        
        // Validar trabajador
        const trabajadorValidation = this.validateTrabajadorData(formData);
        if (!trabajadorValidation.valid) {
            errors.push(...trabajadorValidation.errors);
        }
        
        // Validar condiciones del contrato
        const condicionesValidation = this.validateCondicionesContrato(formData);
        if (!condicionesValidation.valid) {
            errors.push(...condicionesValidation.errors);
        }
        
        return {
            valid: errors.length === 0,
            errors,
            summary: this.generateContratoSummary(formData)
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
ConfigUtils.log('info', 'Sistema de configuración de Contrato Casa Particular inicializado', {
    version: CONFIG.APP.version,
    capabilities: ConfigUtils.detectBrowserCapabilities(),
    mobile: ConfigUtils.isMobile()
});