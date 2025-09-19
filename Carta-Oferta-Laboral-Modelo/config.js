// ========================================
// 📋 CONFIGURACIÓN DEL SISTEMA DE PAGARÉ MODELO FIRMA PRESENCIAL
// ========================================

const CONFIG = {
    // ===== CONFIGURACIÓN GENERAL =====
    APP: {
        name: 'Notaría Digital - Pagaré Modelo Firma Presencial',
        version: '1.0.0',
        author: 'Sistema Notarial Digital Chile',
        description: 'Sistema profesional para generar pagarés con firma digital'
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
        key: 'pagare_form_data',
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
        profesion: {
            min_length: 3,
            max_length: 80,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.]+$/
        },
        ciudad: {
            min_length: 2,
            max_length: 50,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.]+$/
        },
        monto: {
            min_value: 1000, // $1,000 CLP mínimo
            max_value: 999999999999, // Casi un billón
            pattern: /^[0-9]+$/
        },
        sociedad: {
            min_length: 5,
            max_length: 150,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\.\,\-&]+$/
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
            invalid_name: 'Nombre inválido',
            invalid_profesion: 'Profesión inválida',
            invalid_monto: 'Monto inválido',
            invalid_sociedad: 'Nombre de sociedad inválido',
            pdf_error: 'Error al generar el PDF',
            network_error: 'Error de conexión',
            missing_checkboxes: 'Debe aceptar todas las declaraciones legales',
            missing_estado_civil: 'Debe seleccionar el estado civil',
            missing_pagare_data: 'Faltan datos obligatorios del pagaré'
        },
        warning: {
            missing_signature: 'Falta agregar la firma digital',
            missing_photo: 'Falta capturar las fotos del carnet',
            unsaved_changes: 'Hay cambios sin guardar',
            old_browser: 'Su navegador puede no ser compatible con todas las funciones',
            incomplete_form: 'Algunos campos están incompletos',
            missing_suscriptor_name: 'Debe completar el nombre del suscriptor antes de continuar',
            invalid_date_range: 'La fecha de suscripción no puede ser muy antigua ni muy futura',
            optional_representatives: 'Los datos de los representantes legales son opcionales',
            high_amount: 'El monto del pagaré es muy elevado, verifique la información',
            future_payment_date: 'La fecha de pago está muy lejos en el futuro'
        },
        info: {
            auto_save: 'Cambios guardados automáticamente',
            signature_ready: 'Firma lista para usar',
            photo_ready: 'Foto lista para usar',
            form_complete: 'Formulario completo',
            legal_responsibility: 'Recuerde que este pagaré tiene validez legal',
            optional_fields: 'Algunos campos son opcionales y pueden dejarse en blanco',
            amount_converted: 'Monto convertido automáticamente a letras',
            representatives_optional: 'Los representantes legales son opcionales'
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

    // ===== CONFIGURACIÓN ESPECÍFICA DE PAGARÉ =====
    PAGARE: {
        estados_civiles_representante: [
            { 
                code: 'soltero', 
                name: 'Soltero',
                display: 'soltero'
            },
            { 
                code: 'casado', 
                name: 'Casado',
                display: 'casado'
            },
            { 
                code: 'viudo', 
                name: 'Viudo',
                display: 'viudo'
            },
            { 
                code: 'divorciado', 
                name: 'Divorciado',
                display: 'divorciado'
            }
        ],
        
        regiones_chile: [
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
            'Región de la Araucanía',
            'Región de Los Ríos',
            'Región de Los Lagos',
            'Región de Aysén del General Carlos Ibáñez del Campo',
            'Región de Magallanes y de la Antártica Chilena'
        ],
        
        ciudades_comunes: [
            'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta',
            'Temuco', 'Rancagua', 'Talca', 'Arica', 'Chillán',
            'Iquique', 'Los Ángeles', 'Puerto Montt', 'Calama', 'Copiapó',
            'Osorno', 'Quillota', 'Valdivia', 'Punta Arenas', 'Coquimbo'
        ],
        
        profesiones_comunes: [
            'Abogado', 'Ingeniero Civil', 'Médico Cirujano', 'Contador Auditor',
            'Profesor', 'Arquitecto', 'Psicólogo', 'Enfermero', 'Técnico',
            'Comerciante', 'Empresario', 'Funcionario Público', 'Estudiante',
            'Pensionado', 'Empleado', 'Trabajador Independiente', 'Gerente',
            'Ingeniero Comercial', 'Administrador', 'Otro'
        ],
        
        giros_comerciales: [
            'Comercio al por mayor', 'Comercio al por menor', 'Servicios financieros',
            'Construcción', 'Inmobiliaria', 'Transporte', 'Tecnología',
            'Consultoría', 'Manufactura', 'Importación y exportación',
            'Servicios profesionales', 'Educación', 'Salud', 'Turismo',
            'Agricultura', 'Minería', 'Otro'
        ],
        
        nacionalidades: [
            'Chilena', 'Argentina', 'Peruana', 'Boliviana', 'Brasileña',
            'Colombiana', 'Venezolana', 'Ecuatoriana', 'Uruguaya', 'Paraguaya',
            'Española', 'Italiana', 'Alemana', 'Francesa', 'Estadounidense',
            'China', 'Japonesa', 'Coreana', 'Otra'
        ],
        
        validaciones_especificas: {
            rut_obligatorio: true,
            monto_minimo: 1000, // $1,000 CLP
            monto_maximo: 999999999999, // Casi un billón
            nombre_minimo_chars: 5,
            sociedad_minimo_chars: 5,
            profesion_minimo_chars: 3,
            domicilio_minimo_chars: 10,
            fecha_maxima_futura_anos: 5, // Máximo 5 años hacia adelante
            fecha_maxima_pasada_dias: 30, // Máximo 30 días hacia atrás
            dia_pago_minimo: 1,
            dia_pago_maximo: 31,
            ano_pago_minimo: new Date().getFullYear(),
            ano_pago_maximo: new Date().getFullYear() + 10,
            
            checkboxes_obligatorios: [
                'declaracionVeracidad', 
                'declaracionPago', 
                'declaracionCompetencia'
            ],
            
            campos_requeridos: [
                'nombreSociedad', 'rutSociedad', 'giroSociedad', 'domicilioSociedad',
                'comunaSociedad', 'ciudadSociedad', 'nombreRepresentante', 
                'nacionalidadRepresentante', 'estadoCivilRepresentante', 
                'profesionRepresentante', 'cedulaRepresentante', 'montoNumeros',
                'diaPago', 'mesPago', 'anoPago', 'comunaPago', 'nombreSuscriptor',
                'rutSuscriptor', 'profesionSuscriptor', 'domicilioSuscriptor',
                'ciudadSuscripcion', 'fechaSuscripcion'
            ],
            
            campos_opcionales: [
                'montoLetras', 'nombreRep1', 'cedulaRep1', 'cargoRep1',
                'nombreRep2', 'cedulaRep2', 'cargoRep2', 'observacionesAdicionales'
            ],
            
            campos_calculados_automaticamente: [
                'montoLetras' // Se calcula automáticamente desde montoNumeros
            ]
        },
        
        limites_montos: {
            advertencia_monto_alto: 50000000, // $50 millones
            maximo_sin_validacion_adicional: 100000000, // $100 millones
            require_justificacion_sobre: 500000000 // $500 millones
        },
        
        validaciones_fechas: {
            permitir_fines_semana: true,
            permitir_festivos: true,
            dias_habiles_adelanto_minimo: 1,
            meses_maximos_vencimiento: 60 // 5 años máximo
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
        return trimmedNombre.length >= CONFIG.PAGARE.validaciones_especificas.nombre_minimo_chars &&
               trimmedNombre.length <= CONFIG.VALIDATION.names.max_length &&
               CONFIG.VALIDATION.names.pattern.test(trimmedNombre);
    },

    // Validar nombre de sociedad
    validateNombreSociedad(sociedad) {
        if (!sociedad || typeof sociedad !== 'string') return false;
        
        const trimmedSociedad = sociedad.trim();
        return trimmedSociedad.length >= CONFIG.PAGARE.validaciones_especificas.sociedad_minimo_chars &&
               trimmedSociedad.length <= CONFIG.VALIDATION.sociedad.max_length &&
               CONFIG.VALIDATION.sociedad.pattern.test(trimmedSociedad);
    },

    // Validar profesión
    validateProfesion(profesion) {
        if (!profesion || typeof profesion !== 'string') return false;
        
        const trimmedProfesion = profesion.trim();
        return trimmedProfesion.length >= CONFIG.PAGARE.validaciones_especificas.profesion_minimo_chars &&
               trimmedProfesion.length <= CONFIG.VALIDATION.profesion.max_length &&
               CONFIG.VALIDATION.profesion.pattern.test(trimmedProfesion);
    },

    // Validar dirección/domicilio
    validateDomicilio(domicilio) {
        if (!domicilio || typeof domicilio !== 'string') return false;
        
        const trimmedDomicilio = domicilio.trim();
        return trimmedDomicilio.length >= CONFIG.PAGARE.validaciones_especificas.domicilio_minimo_chars &&
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

    // Validar estado civil
    validateEstadoCivil(estadoCivil) {
        if (!estadoCivil || typeof estadoCivil !== 'string') return false;
        
        const estadosValidos = CONFIG.PAGARE.estados_civiles_representante.map(e => e.code);
        return estadosValidos.includes(estadoCivil);
    },

    // Validar monto del pagaré
    validateMonto(monto) {
        if (!monto || isNaN(monto)) return false;
        
        const montoNumerico = parseInt(monto);
        return montoNumerico >= CONFIG.PAGARE.validaciones_especificas.monto_minimo &&
               montoNumerico <= CONFIG.PAGARE.validaciones_especificas.monto_maximo &&
               CONFIG.VALIDATION.monto.pattern.test(monto.toString());
    },

    // Validar fecha de suscripción
    validateFechaSuscripcion(fecha) {
        if (!fecha) return false;
        
        try {
            const fechaSuscripcion = new Date(fecha + 'T00:00:00');
            const hoy = new Date();
            const maxPasada = new Date();
            
            maxPasada.setDate(hoy.getDate() - CONFIG.PAGARE.validaciones_especificas.fecha_maxima_pasada_dias);
            
            // Permitir fecha actual y hasta 30 días atrás
            if (fechaSuscripcion > hoy) return false;
            if (fechaSuscripcion < maxPasada) return false;
            
            return true;
        } catch (error) {
            return false;
        }
    },

    // Validar fecha de pago
    validateFechaPago(dia, mes, ano) {
        if (!dia || !mes || !ano) return false;
        
        try {
            const diaNum = parseInt(dia);
            const anoNum = parseInt(ano);
            const mesIndex = CONFIG.MONTHS.indexOf(mes.toLowerCase());
            
            if (mesIndex === -1) return false;
            if (diaNum < CONFIG.PAGARE.validaciones_especificas.dia_pago_minimo || 
                diaNum > CONFIG.PAGARE.validaciones_especificas.dia_pago_maximo) return false;
            if (anoNum < CONFIG.PAGARE.validaciones_especificas.ano_pago_minimo || 
                anoNum > CONFIG.PAGARE.validaciones_especificas.ano_pago_maximo) return false;
            
            // Validar que la fecha sea válida
            const fechaPago = new Date(anoNum, mesIndex, diaNum);
            const hoy = new Date();
            
            // La fecha de pago debe ser futura (al menos mañana)
            hoy.setHours(23, 59, 59, 999);
            return fechaPago > hoy;
            
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
            
            return `${day} de ${month} de ${year}`;
        } catch (error) {
            return '';
        }
    },

    // Formatear monto con separadores de miles
    formatMonto(monto) {
        if (!monto || isNaN(monto)) return '';
        return new Intl.NumberFormat('es-CL').format(parseInt(monto));
    },

    // Validar que el monto no sea excesivamente alto
    validateMontoRazonable(monto) {
        if (!monto || isNaN(monto)) return { valid: false, warning: null };
        
        const montoNumerico = parseInt(monto);
        const warnings = [];
        
        if (montoNumerico > CONFIG.PAGARE.limites_montos.advertencia_monto_alto) {
            warnings.push('El monto es muy elevado');
        }
        
        if (montoNumerico > CONFIG.PAGARE.limites_montos.require_justificacion_sobre) {
            warnings.push('Monto requiere justificación adicional');
        }
        
        return {
            valid: montoNumerico <= CONFIG.PAGARE.limites_montos.maximo_sin_validacion_adicional,
            warnings: warnings
        };
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

    // Validar formulario completo de pagaré
    validateCompletePagare(formData) {
        const errors = [];
        
        // Validar campos requeridos
        CONFIG.PAGARE.validaciones_especificas.campos_requeridos.forEach(field => {
            if (!formData[field] || formData[field].toString().trim() === '') {
                errors.push(`El campo ${field} es requerido`);
            }
        });

        // Validar checkboxes obligatorios
        CONFIG.PAGARE.validaciones_especificas.checkboxes_obligatorios.forEach(checkbox => {
            if (!formData[checkbox]) {
                errors.push(`Debe marcar la casilla de ${checkbox}`);
            }
        });

        // Validaciones específicas
        const rutsToValidate = ['rutSociedad', 'cedulaRepresentante', 'rutSuscriptor'];
        
        // Agregar RUTs de representantes si están presentes
        if (formData.nombreRep1 || formData.cedulaRep1) {
            rutsToValidate.push('cedulaRep1');
        }
        if (formData.nombreRep2 || formData.cedulaRep2) {
            rutsToValidate.push('cedulaRep2');
        }
        
        rutsToValidate.forEach(rutField => {
            if (formData[rutField] && !this.validateRUT(formData[rutField])) {
                errors.push(`${rutField.replace('rut', 'RUT ').replace('cedula', 'Cédula ')} inválido`);
            }
        });

        if (formData.nombreSociedad && !this.validateNombreSociedad(formData.nombreSociedad)) {
            errors.push('Nombre de sociedad inválido');
        }

        if (formData.nombreSuscriptor && !this.validateNombreCompleto(formData.nombreSuscriptor)) {
            errors.push('Nombre del suscriptor inválido');
        }

        if (formData.profesionRepresentante && !this.validateProfesion(formData.profesionRepresentante)) {
            errors.push('Profesión del representante inválida');
        }

        if (formData.domicilioSociedad && !this.validateDomicilio(formData.domicilioSociedad)) {
            errors.push('Domicilio de la sociedad inválido');
        }

        if (formData.estadoCivilRepresentante && !this.validateEstadoCivil(formData.estadoCivilRepresentante)) {
            errors.push('Estado civil del representante inválido');
        }

        if (formData.montoNumeros && !this.validateMonto(formData.montoNumeros)) {
            errors.push('Monto del pagaré inválido');
        }

        if (formData.fechaSuscripcion && !this.validateFechaSuscripcion(formData.fechaSuscripcion)) {
            errors.push('Fecha de suscripción inválida');
        }

        if (formData.diaPago && formData.mesPago && formData.anoPago && 
            !this.validateFechaPago(formData.diaPago, formData.mesPago, formData.anoPago)) {
            errors.push('Fecha de pago inválida');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    // Validar coherencia de datos
    validateDataCoherence(formData) {
        const warnings = [];

        // Validar fecha de suscripción muy antigua
        if (formData.fechaSuscripcion) {
            const fechaSuscripcion = new Date(formData.fechaSuscripcion + 'T00:00:00');
            const unaSemanaAtras = new Date();
            unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);
            
            if (fechaSuscripcion < unaSemanaAtras) {
                warnings.push('La fecha de suscripción es muy antigua');
            }
        }

        // Validar coherencia entre representantes legales
        const tieneNombreRep1 = formData.nombreRep1 && formData.nombreRep1.trim();
        const tieneCedulaRep1 = formData.cedulaRep1 && formData.cedulaRep1.trim();
        const tieneNombreRep2 = formData.nombreRep2 && formData.nombreRep2.trim();
        const tieneCedulaRep2 = formData.cedulaRep2 && formData.cedulaRep2.trim();
        
        if ((tieneNombreRep1 && !tieneCedulaRep1) || (!tieneNombreRep1 && tieneCedulaRep1)) {
            warnings.push('Si incluye un representante legal, complete nombre y cédula');
        }
        
        if ((tieneNombreRep2 && !tieneCedulaRep2) || (!tieneNombreRep2 && tieneCedulaRep2)) {
            warnings.push('Si incluye un segundo representante legal, complete nombre y cédula');
        }

        // Validar monto razonable
        if (formData.montoNumeros) {
            const validacionMonto = this.validateMontoRazonable(formData.montoNumeros);
            warnings.push(...validacionMonto.warnings);
        }

        // Validar fecha de pago muy lejana
        if (formData.diaPago && formData.mesPago && formData.anoPago) {
            try {
                const mesIndex = CONFIG.MONTHS.indexOf(formData.mesPago.toLowerCase());
                const fechaPago = new Date(parseInt(formData.anoPago), mesIndex, parseInt(formData.diaPago));
                const dosAnosAdelante = new Date();
                dosAnosAdelante.setFullYear(dosAnosAdelante.getFullYear() + 2);
                
                if (fechaPago > dosAnosAdelante) {
                    warnings.push('La fecha de pago está muy lejos en el futuro');
                }
            } catch (error) {
                // Error en formato de fecha, se maneja en validaciones principales
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
        const rutFields = ['rutSociedad', 'cedulaRepresentante', 'rutSuscriptor', 'cedulaRep1', 'cedulaRep2'];
        rutFields.forEach(field => {
            if (formatted[field]) {
                formatted[field + 'Formatted'] = this.formatRUT(formatted[field]);
            }
        });

        // Formatear fecha de suscripción
        if (formatted.fechaSuscripcion) {
            formatted.fechaSuscripcionFormatted = this.formatDateSpanish(formatted.fechaSuscripcion);
        }

        // Formatear monto
        if (formatted.montoNumeros) {
            formatted.montoNumerosFormatted = this.formatMonto(formatted.montoNumeros);
        }

        return formatted;
    },

    // Obtener datos del formulario actual
    getFormDataFromDOM() {
        const formData = {};
        
        // Campos básicos
        const fields = [
            'nombreSociedad', 'rutSociedad', 'giroSociedad', 'domicilioSociedad',
            'comunaSociedad', 'ciudadSociedad', 'nombreRepresentante', 
            'nacionalidadRepresentante', 'estadoCivilRepresentante', 
            'profesionRepresentante', 'cedulaRepresentante', 'montoNumeros',
            'montoLetras', 'diaPago', 'mesPago', 'anoPago', 'comunaPago',
            'nombreSuscriptor', 'rutSuscriptor', 'profesionSuscriptor', 
            'domicilioSuscriptor', 'nombreRep1', 'cedulaRep1', 'cargoRep1',
            'nombreRep2', 'cedulaRep2', 'cargoRep2', 'ciudadSuscripcion',
            'fechaSuscripcion', 'observacionesAdicionales'
        ];
        
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                formData[field] = element.value || '';
            }
        });
        
        // Checkboxes básicos
        const checkboxes = ['declaracionVeracidad', 'declaracionPago', 'declaracionCompetencia'];
        checkboxes.forEach(checkbox => {
            const element = document.getElementById(checkbox);
            formData[checkbox] = element ? element.checked : false;
        });
        
        return formData;
    },

    // Verificar si el formulario está completo
    isFormComplete() {
        const formData = this.getFormDataFromDOM();
        const validation = this.validateCompletePagare(formData);
        return validation.valid;
    },

    // Calcular progreso del formulario
    calculateFormProgress() {
        const formData = this.getFormDataFromDOM();
        let totalFields = 0;
        let completedFields = 0;
        
        // Campos básicos requeridos
        CONFIG.PAGARE.validaciones_especificas.campos_requeridos.forEach(field => {
            totalFields++;
            if (formData[field] && formData[field].toString().trim() !== '') {
                completedFields++;
            }
        });
        
        // Checkboxes obligatorios
        CONFIG.PAGARE.validaciones_especificas.checkboxes_obligatorios.forEach(field => {
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
ConfigUtils.log('info', 'Sistema de configuración de Pagaré inicializado', {
    version: CONFIG.APP.version,
    capabilities: ConfigUtils.detectBrowserCapabilities(),
    mobile: ConfigUtils.isMobile()
});