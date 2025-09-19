// ========================================
// 📋 CONFIGURACIÓN DEL SISTEMA DE CONTRATO DE TRABAJO CASA PARTICULAR
// ========================================

const CONFIG = {
    // ===== CONFIGURACIÓN GENERAL =====
    APP: {
        name: 'Notaría Digital - Contrato de Trabajo Casa Particular Puertas Afuera',
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
        key: 'contrato_trabajo_form_data',
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
        salary: {
            min_amount: 350000, // Salario mínimo aproximado
            max_amount: 10000000,
            pattern: /^[0-9\.\,\$\s]+$/
        },
        hours: {
            min_weekly: 20,
            max_weekly: 45,
            min_daily: 4,
            max_daily: 12
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
        storage_key: 'notaria_digital_contrato_theme_preference',
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
            pdf_generated: 'PDF del contrato generado correctamente',
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
            invalid_phone: 'Número de teléfono inválido',
            invalid_salary: 'Monto de salario inválido',
            invalid_dates: 'Las fechas son inválidas',
            invalid_schedule: 'Horarios de trabajo inválidos',
            pdf_error: 'Error al generar el PDF',
            network_error: 'Error de conexión'
        },
        warning: {
            missing_signature: 'Falta agregar las firmas digitales',
            missing_photo: 'Falta capturar las fotos del carnet',
            unsaved_changes: 'Hay cambios sin guardar',
            old_browser: 'Su navegador puede no ser compatible con todas las funciones',
            incomplete_schedule: 'Complete los horarios de trabajo',
            salary_below_minimum: 'El salario ingresado está bajo el mínimo legal'
        },
        info: {
            auto_save: 'Cambios guardados automáticamente',
            signature_ready: 'Firma lista para usar',
            photo_ready: 'Foto lista para usar',
            form_complete: 'Formulario completo',
            schedule_calculated: 'Horario calculado automáticamente'
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

    // ===== CONFIGURACIÓN ESPECÍFICA DE CONTRATO DE TRABAJO =====
    CONTRATO_TRABAJO: {
        tareas_disponibles: [
            { id: 'tareaAseo', label: 'Aseo', value: 'Aseo' },
            { id: 'tareaCocinar', label: 'Cocinar', value: 'Cocinar' },
            { id: 'tareaLavarPlanchar', label: 'Lavar y planchar ropa', value: 'Lavar y planchar ropa' },
            { id: 'tareaJardineria', label: 'Jardinería', value: 'Jardinería' },
            { id: 'tareaChofer', label: 'Chofer', value: 'Chofer' },
            { id: 'tareaCuidadoNinos', label: 'Cuidado de niños', value: 'Cuidado de niños' }
        ],
        
        regiones: [
            'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
            'Valparaíso', 'Metropolitana', 'O\'Higgins', 'Maule', 'Ñuble',
            'Biobío', 'Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'
        ],

        afps: [
            'Capital', 'Cuprum', 'Habitat', 'Planvital', 'Provida', 'Modelo', 'Uno'
        ],

        sistemas_salud: [
            'FONASA', 'Isapre Banmedica', 'Isapre Colmena', 'Isapre Cruz Blanca', 
            'Isapre Vida Tres', 'Isapre Consalud', 'Otra Isapre'
        ],

        formas_pago: [
            { value: 'efectivo', label: 'Dinero en efectivo' },
            { value: 'transferencia', label: 'Transferencia bancaria' },
            { value: 'cheque', label: 'Cheque' },
            { value: 'deposito_cuenta_vista', label: 'Depósito en cuenta vista' },
            { value: 'deposito_cuenta_corriente', label: 'Depósito en cuenta corriente' }
        ],

        dias_pago: [
            { value: 'ultimo_dia_habil', label: 'Último día hábil del mes' },
            { value: '30', label: 'Día 30 de cada mes' },
            { value: '31', label: 'Último día del mes' },
            { value: '15_ultimo', label: 'Día 15 y último día' }
        ],

        horas_semanales_opciones: [
            { value: '45', label: '45 horas semanales' },
            { value: '40', label: '40 horas semanales' },
            { value: '35', label: '35 horas semanales' },
            { value: '30', label: '30 horas semanales' },
            { value: 'otra', label: 'Otra cantidad' }
        ],

        duracion_opciones: [
            { value: 'indefinida', label: 'Duración indefinida' },
            { value: 'plazo_fijo', label: 'Plazo fijo' },
            { value: 'obra_faena', label: 'Por obra o faena' }
        ],

        salarios_minimos: {
            2024: 460000,
            2025: 500000
        },

        dias_semana: [
            { id: 'Lunes', label: 'Lunes', trabajaId: 'trabajaLunes', entradaId: 'entradaLunes', salidaId: 'salidaLunes' },
            { id: 'Martes', label: 'Martes', trabajaId: 'trabajaMartes', entradaId: 'entradaMartes', salidaId: 'salidaMartes' },
            { id: 'Miercoles', label: 'Miércoles', trabajaId: 'trabajaMiercoles', entradaId: 'entradaMiercoles', salidaId: 'salidaMiercoles' },
            { id: 'Jueves', label: 'Jueves', trabajaId: 'trabajaJueves', entradaId: 'entradaJueves', salidaId: 'salidaJueves' },
            { id: 'Viernes', label: 'Viernes', trabajaId: 'trabajaViernes', entradaId: 'entradaViernes', salidaId: 'salidaViernes' },
            { id: 'Sabado', label: 'Sábado', trabajaId: 'trabajaSabado', entradaId: 'entradaSabado', salidaId: 'salidaSabado' }
        ]
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

    // Validar salario
    validateSalary(salary) {
        if (!salary) return false;
        
        const cleanSalary = salary.replace(/[^\d]/g, '');
        const numericSalary = parseInt(cleanSalary);
        
        return !isNaN(numericSalary) && 
               numericSalary >= CONFIG.VALIDATION.salary.min_amount &&
               numericSalary <= CONFIG.VALIDATION.salary.max_amount;
    },

    // Formatear salario
    formatSalary(salary) {
        if (!salary) return '';
        
        const cleanSalary = salary.replace(/[^\d]/g, '');
        if (!cleanSalary) return '';
        
        const numericSalary = parseInt(cleanSalary);
        return '$' + numericSalary.toLocaleString('es-CL');
    },

    // Validar horario
    validateTime(timeString) {
        if (!timeString) return false;
        
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(timeString);
    },

    // Calcular horas entre dos tiempos
    calculateHoursBetween(startTime, endTime) {
        if (!startTime || !endTime) return 0;
        
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        let endMinutes = endHour * 60 + endMin;
        
        // Si el tiempo de fin es menor, asumimos que es al día siguiente
        if (endMinutes < startMinutes) {
            endMinutes += 24 * 60;
        }
        
        return (endMinutes - startMinutes) / 60;
    },

    // Validar edad mínima para trabajar
    validateWorkingAge(birthDate) {
        if (!birthDate) return false;
        
        const today = new Date();
        const birth = new Date(birthDate);
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            return age - 1 >= 18;
        }
        
        return age >= 18;
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

    // Generar ID de contrato
    generateContractId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'CTC-';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        result += '-' + new Date().getFullYear();
        return result;
    },

    // Validar formulario completo de contrato
    validateCompleteContractForm(formData) {
        const errors = [];

        // Validar campos requeridos básicos
        const requiredFields = [
            'ciudadContrato', 'fechaContrato',
            'nombreEmpleador', 'rutEmpleador', 'domicilioEmpleador', 'comunaEmpleador', 'regionEmpleador',
            'nombreTrabajador', 'rutTrabajador', 'fechaNacimientoTrabajador', 'nacionalidadTrabajador',
            'domicilioTrabajador', 'comunaTrabajador', 'regionTrabajador',
            'lugarTrabajo', 'comunaTrabajo', 'regionTrabajo',
            'sueldoMensual', 'formaPago', 'diaPago',
            'afpTrabajador', 'sistemaSalud',
            'horasSemanales', 'horasColacion',
            'fechaInicioServicios', 'duracionContrato'
        ];

        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                errors.push(`El campo ${field} es requerido`);
            }
        });

        // Validaciones específicas
        if (formData.rutEmpleador && !this.validateRUT(formData.rutEmpleador)) {
            errors.push('RUT del empleador inválido');
        }

        if (formData.rutTrabajador && !this.validateRUT(formData.rutTrabajador)) {
            errors.push('RUT del trabajador inválido');
        }

        if (formData.fechaContrato && !this.validateDate(formData.fechaContrato)) {
            errors.push('Fecha del contrato inválida');
        }

        if (formData.fechaNacimientoTrabajador && !this.validateWorkingAge(formData.fechaNacimientoTrabajador)) {
            errors.push('El trabajador debe ser mayor de 18 años');
        }

        if (formData.fechaInicioServicios && !this.validateDate(formData.fechaInicioServicios)) {
            errors.push('Fecha de inicio de servicios inválida');
        }

        if (formData.sueldoMensual && !this.validateSalary(formData.sueldoMensual)) {
            errors.push('Monto del salario inválido');
        }

        if (formData.telefonoEmpleador && !this.validatePhone(formData.telefonoEmpleador)) {
            errors.push('Teléfono del empleador inválido');
        }

        if (formData.telefonoTrabajador && !this.validatePhone(formData.telefonoTrabajador)) {
            errors.push('Teléfono del trabajador inválido');
        }

        // Validar al menos una tarea seleccionada
        const tareas = CONFIG.CONTRATO_TRABAJO.tareas_disponibles;
        const tareasSeleccionadas = tareas.some(tarea => formData[tarea.id] === true);
        if (!tareasSeleccionadas) {
            errors.push('Debe seleccionar al menos una tarea a realizar');
        }

        // Validar horarios si las horas semanales están definidas
        if (formData.horasSemanales && formData.horasSemanales !== 'otra') {
            const horasRequeridas = parseInt(formData.horasSemanales);
            let horasCalculadas = 0;
            
            CONFIG.CONTRATO_TRABAJO.dias_semana.forEach(dia => {
                const trabaja = formData[dia.trabajaId];
                const entrada = formData[dia.entradaId];
                const salida = formData[dia.salidaId];
                
                if (trabaja && entrada && salida) {
                    horasCalculadas += this.calculateHoursBetween(entrada, salida);
                }
            });
            
            // Restar horas de colación
            const horasColacion = parseFloat(formData.horasColacion || 1);
            const diasTrabajo = CONFIG.CONTRATO_TRABAJO.dias_semana.filter(dia => formData[dia.trabajaId]).length;
            horasCalculadas -= (horasColacion * diasTrabajo);
            
            if (Math.abs(horasCalculadas - horasRequeridas) > 2) {
                errors.push('Las horas calculadas no coinciden con las horas semanales especificadas');
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    // Formatear fecha en español
    formatDateInSpanish(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            const day = date.getDate();
            const month = CONFIG.MONTHS[date.getMonth()];
            const year = date.getFullYear();
            
            return `${day} de ${month} de ${year}`;
        } catch (error) {
            return dateString;
        }
    },

    // Capitalizar primera letra
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // Limpiar texto para PDF
    sanitizeTextForPDF(text) {
        if (!text) return '';
        
        return text
            .replace(/[\r\n\t]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    },

    // Obtener tareas seleccionadas
    getSelectedTasks(formData) {
        const selectedTasks = [];
        
        CONFIG.CONTRATO_TRABAJO.tareas_disponibles.forEach(tarea => {
            if (formData[tarea.id] === true) {
                selectedTasks.push(tarea.value);
            }
        });
        
        return selectedTasks;
    },

    // Formatear lista de tareas
    formatTasksList(tasks) {
        if (!tasks || tasks.length === 0) return '';
        
        if (tasks.length === 1) {
            return tasks[0];
        } else if (tasks.length === 2) {
            return tasks.join(' y ');
        } else {
            const lastTask = tasks.pop();
            return tasks.join(', ') + ' y ' + lastTask;
        }
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
ConfigUtils.log('info', 'Sistema de configuración de Contrato de Trabajo Casa Particular inicializado', {
    version: CONFIG.APP.version,
    capabilities: ConfigUtils.detectBrowserCapabilities(),
    mobile: ConfigUtils.isMobile()
});