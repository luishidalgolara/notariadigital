// ========================================
// 📋 CONFIGURACIÓN DEL SISTEMA DE FINIQUITO LABORAL MODELO FINAL 2
// ========================================

const CONFIG = {
    // ===== CONFIGURACIÓN GENERAL =====
    APP: {
        name: 'Notaría Digital - Finiquito Laboral Modelo Final 2',
        version: '1.0.0',
        author: 'Sistema Notarial Digital Chile',
        description: 'Sistema profesional para generar finiquitos laborales con firma digital'
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
        key: 'finiquito_laboral_form_data',
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
        empresa_name: {
            min_length: 5,
            max_length: 150,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\.\,\-\_\&\(\)]+$/
        },
        ciudad: {
            min_length: 2,
            max_length: 50,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.]+$/
        },
        monto: {
            min_value: 1000,
            max_value: 999999999,
            format: /^[0-9]+$/
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
            invalid_amount: 'Monto inválido',
            pdf_error: 'Error al generar el PDF',
            network_error: 'Error de conexión',
            missing_checkboxes: 'Debe aceptar todas las declaraciones legales',
            missing_payment_method: 'Debe seleccionar la forma de pago',
            missing_termination_cause: 'Debe especificar la causal de terminación'
        },
        warning: {
            missing_signature: 'Falta agregar la firma digital',
            missing_photo: 'Falta capturar las fotos del carnet',
            unsaved_changes: 'Hay cambios sin guardar',
            old_browser: 'Su navegador puede no ser compatible con todas las funciones',
            incomplete_form: 'Algunos campos están incompletos',
            missing_worker_name: 'Debe completar el nombre del trabajador antes de continuar',
            invalid_date_range: 'La fecha de término debe ser posterior a la fecha de inicio',
            high_amount: 'El monto ingresado es muy alto, verifique que sea correcto'
        },
        info: {
            auto_save: 'Cambios guardados automáticamente',
            signature_ready: 'Firma lista para usar',
            photo_ready: 'Foto lista para usar',
            form_complete: 'Formulario completo',
            legal_responsibility: 'Recuerde que este finiquito tiene validez legal',
            payment_method_changed: 'Forma de pago cambiada - complete los campos adicionales si es necesario'
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

    // ===== CONFIGURACIÓN ESPECÍFICA DE FINIQUITO LABORAL =====
    FINIQUITO_LABORAL: {
        causales_terminacion: [
            { 
                code: 'mutuo_acuerdo', 
                name: 'Mutuo acuerdo de las partes',
                articulos: ['159 N°4']
            },
            { 
                code: 'renuncia_voluntaria', 
                name: 'Renuncia voluntaria del trabajador',
                articulos: ['159 N°1']
            },
            { 
                code: 'vencimiento_plazo', 
                name: 'Vencimiento del plazo convenido',
                articulos: ['159 N°4']
            },
            { 
                code: 'conclusion_trabajo', 
                name: 'Conclusión del trabajo o servicio que dio origen al contrato',
                articulos: ['159 N°5']
            },
            { 
                code: 'caso_fortuito', 
                name: 'Caso fortuito o fuerza mayor',
                articulos: ['159 N°6']
            },
            { 
                code: 'falta_probidad', 
                name: 'Falta de probidad del trabajador',
                articulos: ['160 N°1 letra a']
            },
            { 
                code: 'conducta_inmoral', 
                name: 'Conducta inmoral del trabajador',
                articulos: ['160 N°1 letra b']
            },
            { 
                code: 'negociaciones_prohibidas', 
                name: 'Negociaciones que ejecute el trabajador prohibidas por contrato',
                articulos: ['160 N°1 letra c']
            },
            { 
                code: 'no_concurrencia', 
                name: 'No concurrencia del trabajador a sus labores sin causa justificada',
                articulos: ['160 N°1 letra d']
            },
            { 
                code: 'abandono_trabajo', 
                name: 'Abandono del trabajo por parte del trabajador',
                articulos: ['160 N°1 letra e']
            },
            { 
                code: 'actos_violencia', 
                name: 'Actos, omisiones o imprudencias temerarias',
                articulos: ['160 N°1 letra f']
            },
            { 
                code: 'daño_material', 
                name: 'Daño material causado intencionalmente',
                articulos: ['160 N°1 letra g']
            },
            { 
                code: 'incumplimiento_grave', 
                name: 'Incumplimiento grave de las obligaciones del contrato',
                articulos: ['160 N°1 letra h']
            },
            { 
                code: 'necesidades_empresa', 
                name: 'Necesidades de la empresa, establecimiento o servicio',
                articulos: ['161']
            },
            { 
                code: 'desahucio_empleador', 
                name: 'Desahucio escrito del empleador',
                articulos: ['162']
            },
            { 
                code: 'otras', 
                name: 'Otras causales (especificar en observaciones)',
                articulos: ['Especificar']
            }
        ],
        
        formas_pago: [
            { code: 'efectivo', name: 'Dinero efectivo' },
            { code: 'cheque', name: 'Cheque nominativo' },
            { code: 'transferencia', name: 'Transferencia bancaria' }
        ],
        
        ciudades_comunes: [
            'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta',
            'Temuco', 'Rancagua', 'Talca', 'Arica', 'Chillán',
            'Iquique', 'Los Ángeles', 'Puerto Montt', 'Calama', 'Copiapó',
            'Osorno', 'Quillota', 'Valdivia', 'Punta Arenas', 'Coquimbo'
        ],
        
        conceptos_liquidacion: [
            { code: 'sueldo_proporcional', name: 'Sueldo proporcional' },
            { code: 'vacaciones_proporcionales', name: 'Vacaciones proporcionales' },
            { code: 'gratificacion_legal', name: 'Gratificación legal' },
            { code: 'indemnizacion_años_servicio', name: 'Indemnización por años de servicio' },
            { code: 'indemnizacion_aviso_previo', name: 'Indemnización sustitutiva del aviso previo' },
            { code: 'horas_extraordinarias', name: 'Horas extraordinarias' },
            { code: 'bonos_adicionales', name: 'Bonos adicionales' },
            { code: 'comisiones', name: 'Comisiones' },
            { code: 'otros_haberes', name: 'Otros haberes' }
        ],
        
        validaciones_especificas: {
            rut_obligatorio: true,
            nombre_minimo_chars: 3,
            empresa_nombre_minimo_chars: 5,
            domicilio_minimo_chars: 10,
            monto_minimo: 1000,
            monto_maximo: 999999999,
            fecha_maxima_futura_dias: 30, // Permitir hasta 30 días en el futuro
            fecha_maxima_pasada_anos: 2, // Máximo 2 años hacia atrás
            checkboxes_obligatorios: ['declaracionPensiones', 'declaracionCompleta', 'declaracionRenuncia'],
            campos_requeridos: [
                'nombreEmpresa', 'rutEmpresa', 'nombreRepresentante', 'rutRepresentante',
                'nombreTrabajador', 'rutTrabajador', 'fechaInicio', 'fechaTermino',
                'causalTerminacion', 'montoTotal', 'formaPago', 'nombreMinistroFe',
                'fechaFiniquito', 'lugarFiniquito'
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
        return trimmedNombre.length >= CONFIG.FINIQUITO_LABORAL.validaciones_especificas.nombre_minimo_chars &&
               trimmedNombre.length <= CONFIG.VALIDATION.names.max_length &&
               CONFIG.VALIDATION.names.pattern.test(trimmedNombre);
    },

    // Validar nombre de empresa
    validateNombreEmpresa(nombreEmpresa) {
        if (!nombreEmpresa || typeof nombreEmpresa !== 'string') return false;
        
        const trimmedNombre = nombreEmpresa.trim();
        return trimmedNombre.length >= CONFIG.FINIQUITO_LABORAL.validaciones_especificas.empresa_nombre_minimo_chars &&
               trimmedNombre.length <= CONFIG.VALIDATION.empresa_name.max_length &&
               CONFIG.VALIDATION.empresa_name.pattern.test(trimmedNombre);
    },

    // Validar dirección/domicilio
    validateDomicilio(domicilio) {
        if (!domicilio || typeof domicilio !== 'string') return false;
        
        const trimmedDomicilio = domicilio.trim();
        return trimmedDomicilio.length >= CONFIG.FINIQUITO_LABORAL.validaciones_especificas.domicilio_minimo_chars &&
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

    // Validar monto
    validateMonto(monto) {
        if (!monto) return false;
        
        const numeroMonto = parseInt(monto);
        if (isNaN(numeroMonto)) return false;
        
        return numeroMonto >= CONFIG.FINIQUITO_LABORAL.validaciones_especificas.monto_minimo &&
               numeroMonto <= CONFIG.FINIQUITO_LABORAL.validaciones_especificas.monto_maximo;
    },

    // Validar causal de terminación
    validateCausalTerminacion(causal) {
        if (!causal || typeof causal !== 'string') return false;
        
        const causalesValidas = CONFIG.FINIQUITO_LABORAL.causales_terminacion.map(c => c.code);
        return causalesValidas.includes(causal);
    },

    // Validar forma de pago
    validateFormaPago(forma) {
        if (!forma || typeof forma !== 'string') return false;
        
        const formasValidas = CONFIG.FINIQUITO_LABORAL.formas_pago.map(f => f.code);
        return formasValidas.includes(forma);
    },

    // Validar fecha de finiquito
    validateFechaFiniquito(fecha) {
        if (!fecha) return false;
        
        try {
            const fechaFiniquito = new Date(fecha + 'T00:00:00');
            const hoy = new Date();
            const dosAnosAtras = new Date();
            const treintaDiasAdelante = new Date();
            
            dosAnosAtras.setFullYear(hoy.getFullYear() - CONFIG.FINIQUITO_LABORAL.validaciones_especificas.fecha_maxima_pasada_anos);
            treintaDiasAdelante.setDate(hoy.getDate() + CONFIG.FINIQUITO_LABORAL.validaciones_especificas.fecha_maxima_futura_dias);
            
            // Permitir fechas hasta 30 días en el futuro
            if (fechaFiniquito > treintaDiasAdelante) return false;
            
            // No permitir fechas muy antiguas
            if (fechaFiniquito < dosAnosAtras) return false;
            
            return true;
        } catch (error) {
            return false;
        }
    },

    // Validar rango de fechas de contrato
    validateFechasContrato(fechaInicio, fechaTermino) {
        if (!fechaInicio || !fechaTermino) return false;
        
        try {
            const inicio = new Date(fechaInicio + 'T00:00:00');
            const termino = new Date(fechaTermino + 'T00:00:00');
            
            // La fecha de término debe ser posterior a la de inicio
            return termino > inicio;
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
            
            return `${day} de ${month} del ${year}`;
        } catch (error) {
            return '';
        }
    },

    // Formatear monto con separadores de miles
    formatMonto(monto) {
        if (!monto) return '';
        return parseInt(monto).toLocaleString('es-CL');
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

    // Validar formulario completo de finiquito laboral
    validateCompleteFiniquitoLaboral(formData) {
        const errors = [];
        
        // Validar campos requeridos
        CONFIG.FINIQUITO_LABORAL.validaciones_especificas.campos_requeridos.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                errors.push(`El campo ${field} es requerido`);
            }
        });

        // Validar checkboxes obligatorios
        CONFIG.FINIQUITO_LABORAL.validaciones_especificas.checkboxes_obligatorios.forEach(checkbox => {
            if (!formData[checkbox]) {
                errors.push(`Debe marcar la casilla de ${checkbox}`);
            }
        });

        // Validaciones específicas
        const rutsToValidate = ['rutEmpresa', 'rutRepresentante', 'rutTrabajador', 'rutMinistroFe'];
        
        rutsToValidate.forEach(rutField => {
            if (formData[rutField] && !this.validateRUT(formData[rutField])) {
                errors.push(`${rutField.replace('rut', 'RUT ')} inválido`);
            }
        });

        if (formData.nombreEmpresa && !this.validateNombreEmpresa(formData.nombreEmpresa)) {
            errors.push('Nombre de empresa inválido');
        }

        if (formData.nombreTrabajador && !this.validateNombreCompleto(formData.nombreTrabajador)) {
            errors.push('Nombre del trabajador inválido');
        }

        if (formData.nombreRepresentante && !this.validateNombreCompleto(formData.nombreRepresentante)) {
            errors.push('Nombre del representante inválido');
        }

        if (formData.nombreMinistroFe && !this.validateNombreCompleto(formData.nombreMinistroFe)) {
            errors.push('Nombre del ministro de fe inválido');
        }

        if (formData.montoTotal && !this.validateMonto(formData.montoTotal)) {
            errors.push('Monto total inválido');
        }

        if (formData.causalTerminacion && !this.validateCausalTerminacion(formData.causalTerminacion)) {
            errors.push('Causal de terminación inválida');
        }

        if (formData.formaPago && !this.validateFormaPago(formData.formaPago)) {
            errors.push('Forma de pago inválida');
        }

        if (formData.fechaFiniquito && !this.validateFechaFiniquito(formData.fechaFiniquito)) {
            errors.push('Fecha de finiquito inválida');
        }

        if (formData.fechaInicio && formData.fechaTermino && !this.validateFechasContrato(formData.fechaInicio, formData.fechaTermino)) {
            errors.push('El rango de fechas del contrato es inválido');
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
        if (formData.fechaFiniquito) {
            const fechaFiniquito = new Date(formData.fechaFiniquito + 'T00:00:00');
            const tresMesesAtras = new Date();
            tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
            
            if (fechaFiniquito < tresMesesAtras) {
                warnings.push('La fecha de finiquito es muy antigua');
            }
        }

        // Validar monto muy alto
        if (formData.montoTotal && parseInt(formData.montoTotal) > 10000000) {
            warnings.push('El monto es muy alto, verifique que sea correcto');
        }

        // Validar duración del contrato
        if (formData.fechaInicio && formData.fechaTermino) {
            const inicio = new Date(formData.fechaInicio + 'T00:00:00');
            const termino = new Date(formData.fechaTermino + 'T00:00:00');
            const duracionDias = (termino - inicio) / (1000 * 60 * 60 * 24);
            
            if (duracionDias < 1) {
                warnings.push('La duración del contrato es muy corta');
            } else if (duracionDias > 365 * 10) {
                warnings.push('La duración del contrato es muy larga (más de 10 años)');
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
        const rutFields = ['rutEmpresa', 'rutRepresentante', 'rutTrabajador', 'rutMinistroFe'];
        rutFields.forEach(field => {
            if (formatted[field]) {
                formatted[field + 'Formatted'] = this.formatRUT(formatted[field]);
            }
        });

        // Formatear fechas
        if (formatted.fechaInicio) {
            formatted.fechaInicioFormatted = this.formatDateSpanish(formatted.fechaInicio);
        }
        if (formatted.fechaTermino) {
            formatted.fechaTerminoFormatted = this.formatDateSpanish(formatted.fechaTermino);
        }
        if (formatted.fechaFiniquito) {
            formatted.fechaFiniquitoFormatted = this.formatDateSpanish(formatted.fechaFiniquito);
        }

        // Formatear monto
        if (formatted.montoTotal) {
            formatted.montoTotalFormatted = this.formatMonto(formatted.montoTotal);
        }

        return formatted;
    },

    // Obtener datos del formulario actual
    getFormDataFromDOM() {
        const formData = {};
        
        // Campos básicos
        const fields = [
            'nombreEmpresa', 'rutEmpresa', 'nombreRepresentante', 'rutRepresentante',
            'calleEmpresa', 'comunaEmpresa', 'ciudadEmpresa',
            'nombreTrabajador', 'rutTrabajador', 'calleTrabajador', 'comunaTrabajador',
            'fechaInicio', 'fechaTermino', 'causalTerminacion', 'articulosCodigo', 'observacionesContrato',
            'montoTotal', 'montoEnPalabras', 'detalleLiquidacion',
            'formaPago', 'serieCheque', 'numeroCheque', 'bancoEmisor',
            'nombreMinistroFe', 'rutMinistroFe', 'cargoMinistroFe',
            'fechaFiniquito', 'lugarFiniquito'
        ];
        
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                formData[field] = element.value || '';
            }
        });
        
        // Checkboxes básicos
        const checkboxes = ['declaracionPensiones', 'declaracionCompleta', 'declaracionRenuncia'];
        checkboxes.forEach(checkbox => {
            const element = document.getElementById(checkbox);
            formData[checkbox] = element ? element.checked : false;
        });
        
        return formData;
    },

    // Verificar si el formulario está completo
    isFormComplete() {
        const formData = this.getFormDataFromDOM();
        const validation = this.validateCompleteFiniquitoLaboral(formData);
        return validation.valid;
    },

    // Calcular progreso del formulario
    calculateFormProgress() {
        const formData = this.getFormDataFromDOM();
        let totalFields = 0;
        let completedFields = 0;
        
        // Campos básicos requeridos
        CONFIG.FINIQUITO_LABORAL.validaciones_especificas.campos_requeridos.forEach(field => {
            totalFields++;
            if (formData[field] && formData[field].trim() !== '') {
                completedFields++;
            }
        });
        
        // Checkboxes obligatorios
        CONFIG.FINIQUITO_LABORAL.validaciones_especificas.checkboxes_obligatorios.forEach(field => {
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
ConfigUtils.log('info', 'Sistema de configuración de Finiquito Laboral inicializado', {
    version: CONFIG.APP.version,
    capabilities: ConfigUtils.detectBrowserCapabilities(),
    mobile: ConfigUtils.isMobile()
});