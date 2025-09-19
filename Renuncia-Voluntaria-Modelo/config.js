// ========================================
// 📋 CONFIGURACIÓN DEL SISTEMA DE RENUNCIA VOLUNTARIA
// ========================================

const CONFIG = {
    // ===== CONFIGURACIÓN GENERAL =====
    APP: {
        name: 'Notaría Digital - Renuncia Voluntaria',
        version: '1.0.0',
        author: 'Sistema Notarial Digital Chile',
        description: 'Sistema profesional para generar cartas de renuncia voluntaria con firmas digitales'
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
        key: 'renuncia_voluntaria_form_data',
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
        empresa: {
            min_length: 2,
            max_length: 200,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\.\,\-\&]+$/
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
        motivos: {
            min_length: 10,
            max_length: 1000,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\.\,\-\;\:\(\)]+$/
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
        storage_key: 'notaria_digital_renuncia_theme_preference',
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
            photo_captured: 'Documento capturado exitosamente',
            pdf_generated: 'PDF de la renuncia generado correctamente',
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
            invalid_company: 'Nombre de empresa inválido',
            invalid_salary: 'Monto de salario inválido',
            invalid_dates: 'Las fechas son inválidas',
            invalid_motivos: 'Los motivos de renuncia son requeridos',
            pdf_error: 'Error al generar el PDF',
            network_error: 'Error de conexión'
        },
        warning: {
            missing_signature: 'Falta agregar la firma digital',
            missing_photo: 'Falta capturar los documentos',
            unsaved_changes: 'Hay cambios sin guardar',
            old_browser: 'Su navegador puede no ser compatible con todas las funciones',
            incomplete_form: 'Complete todos los campos requeridos',
            invalid_resignation_date: 'La fecha de renuncia debe ser futura',
            insufficient_notice: 'Se recomienda dar aviso previo de al menos 30 días'
        },
        info: {
            auto_save: 'Cambios guardados automáticamente',
            signature_ready: 'Firma lista para usar',
            photo_ready: 'Documentos listos para usar',
            form_complete: 'Formulario completo',
            resignation_notice: 'Recuerde que la renuncia debe ser ratificada ante ministro de fe'
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

    // ===== CONFIGURACIÓN ESPECÍFICA DE RENUNCIA VOLUNTARIA =====
    RENUNCIA_VOLUNTARIA: {
        regiones: [
            'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
            'Valparaíso', 'Metropolitana', 'O\'Higgins', 'Maule', 'Ñuble',
            'Biobío', 'Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'
        ],

        articulos_codigo: [
            { value: '159-2', label: 'Artículo 159 N° 2 - Renuncia Voluntaria' },
            { value: '171', label: 'Artículo 171 - Desahucio del trabajador' },
            { value: '177', label: 'Artículo 177 - Aviso previo' }
        ],

        dias_aviso_previo: [
            { value: '30', label: '30 días (Recomendado)' },
            { value: '15', label: '15 días' },
            { value: '7', label: '7 días' },
            { value: 'inmediato', label: 'Inmediato' }
        ],

        motivos_comunes: [
            'Nuevas oportunidades laborales',
            'Crecimiento profesional',
            'Motivos personales',
            'Cambio de residencia',
            'Mejores condiciones laborales',
            'Emprendimiento personal',
            'Estudios superiores',
            'Motivos familiares'
        ],

        cargos_comunes: [
            'Ejecutivo/a de Ventas',
            'Asistente Administrativo/a',
            'Contador/a',
            'Secretario/a',
            'Supervisor/a',
            'Operario/a',
            'Técnico/a',
            'Profesional',
            'Analista',
            'Coordinador/a'
        ],

        departamentos_comunes: [
            'Administración',
            'Ventas',
            'Marketing',
            'Recursos Humanos',
            'Contabilidad',
            'Producción',
            'Logística',
            'Tecnología',
            'Atención al Cliente',
            'Operaciones'
        ],

        textos_agradecimiento: [
            'Agradeciendo el haberme permitido laborar en vuestra empresa',
            'Agradezco la oportunidad de haber trabajado en esta empresa y el crecimiento profesional obtenido',
            'Reconociendo las oportunidades de desarrollo que me brindaron',
            'Valorando la experiencia laboral adquirida en esta organización'
        ],

        salarios_referencia: {
            minimo_2024: 460000,
            minimo_2025: 500000,
            promedio_nacional: 700000
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
        
        return date >= new Date('1900-01-01') && date <= maxFutureDate;
    },

    // Validar fecha de renuncia (debe ser futura)
    validateResignationDate(dateString) {
        if (!dateString) return false;
        
        const date = new Date(dateString);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        // Verificar que sea una fecha válida y futura
        if (isNaN(date.getTime())) return false;
        
        return date >= now;
    },

    // Calcular días de aviso previo
    calculateNoticeDays(startDate, endDate) {
        if (!startDate || !endDate) return 0;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays);
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
        return trimmedName.length >= CONFIG.VALIDATION.empresa.min_length &&
               trimmedName.length <= CONFIG.VALIDATION.empresa.max_length &&
               CONFIG.VALIDATION.empresa.pattern.test(trimmedName);
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

    // Validar motivos de renuncia
    validateMotivos(motivos) {
        if (!motivos || typeof motivos !== 'string') return false;
        
        const trimmedMotivos = motivos.trim();
        return trimmedMotivos.length >= CONFIG.VALIDATION.motivos.min_length &&
               trimmedMotivos.length <= CONFIG.VALIDATION.motivos.max_length &&
               CONFIG.VALIDATION.motivos.pattern.test(trimmedMotivos);
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

    // Generar ID de documento
    generateDocumentId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'RV-';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        result += '-' + new Date().getFullYear();
        return result;
    },

    // Validar formulario completo de renuncia
    validateCompleteResignationForm(formData) {
        const errors = [];

        // Validar campos requeridos básicos
        const requiredFields = [
            'ciudadRenuncia', 'fechaDocumento',
            'razonSocialEmpresa', 'rutEmpresa', 'domicilioEmpresa', 'comunaEmpresa',
            'nombreTrabajador', 'rutTrabajador', 'domicilioTrabajador', 'comunaTrabajador', 'regionTrabajador',
            'fechaEfectivaRenuncia', 'articuloCodigo', 'motivosRenuncia',
            'cargoTrabajador', 'diasAvisoPrevio'
        ];

        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                errors.push(`El campo ${field} es requerido`);
            }
        });

        // Validaciones específicas
        if (formData.rutEmpresa && !this.validateRUT(formData.rutEmpresa)) {
            errors.push('RUT de la empresa inválido');
        }

        if (formData.rutTrabajador && !this.validateRUT(formData.rutTrabajador)) {
            errors.push('RUT del trabajador inválido');
        }

        if (formData.fechaDocumento && !this.validateDate(formData.fechaDocumento)) {
            errors.push('Fecha del documento inválida');
        }

        if (formData.fechaEfectivaRenuncia && !this.validateResignationDate(formData.fechaEfectivaRenuncia)) {
            errors.push('La fecha efectiva de renuncia debe ser futura');
        }

        if (formData.razonSocialEmpresa && !this.validateCompanyName(formData.razonSocialEmpresa)) {
            errors.push('Nombre de empresa inválido');
        }

        if (formData.nombreTrabajador && !this.validateName(formData.nombreTrabajador)) {
            errors.push('Nombre del trabajador inválido');
        }

        if (formData.motivosRenuncia && !this.validateMotivos(formData.motivosRenuncia)) {
            errors.push('Los motivos de renuncia son requeridos y deben tener al menos 10 caracteres');
        }

        if (formData.telefonoEmpresa && !this.validatePhone(formData.telefonoEmpresa)) {
            errors.push('Teléfono de la empresa inválido');
        }

        if (formData.telefonoTrabajador && !this.validatePhone(formData.telefonoTrabajador)) {
            errors.push('Teléfono del trabajador inválido');
        }

        if (formData.sueldoActual && !this.validateSalary(formData.sueldoActual)) {
            errors.push('Monto del salario inválido');
        }

        // Validar días de aviso previo
        if (formData.fechaDocumento && formData.fechaEfectivaRenuncia) {
            const noticeDays = this.calculateNoticeDays(formData.fechaDocumento, formData.fechaEfectivaRenuncia);
            if (noticeDays < 7) {
                errors.push('Se recomienda dar aviso previo de al menos 7 días');
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

    // Obtener texto del artículo
    getArticleText(articleValue) {
        const article = CONFIG.RENUNCIA_VOLUNTARIA.articulos_codigo.find(art => art.value === articleValue);
        return article ? article.label : 'artículo 159 N° 2';
    },

    // Obtener texto de días de aviso previo
    getNoticeDaysText(daysValue) {
        const days = CONFIG.RENUNCIA_VOLUNTARIA.dias_aviso_previo.find(day => day.value === daysValue);
        return days ? days.value : '30';
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
ConfigUtils.log('info', 'Sistema de configuración de Renuncia Voluntaria inicializado', {
    version: CONFIG.APP.version,
    capabilities: ConfigUtils.detectBrowserCapabilities(),
    mobile: ConfigUtils.isMobile()
});