// ========================================
// 📋 CONFIGURACIÓN DEL SISTEMA DE DECLARACIÓN DE EXPENSAS
// ========================================

const CONFIG = {
    // ===== CONFIGURACIÓN GENERAL =====
    APP: {
        name: 'Notaría Digital - Declaración de Expensas',
        version: '2.0.0',
        author: 'Sistema Notarial Digital Chile',
        description: 'Sistema profesional para generar declaraciones de expensas con firmas digitales'
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
        key: 'expensas_form_data',
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
        income: {
            min: 0,
            max: 999999999999 // 999 mil millones
        },
        age: {
            min: 0,
            max: 120
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

    // ===== TIPOS DE RESIDENCIA =====
    RESIDENCE_TYPES: {
        definitiva: 'Residencia Definitiva',
        temporal: 'Residencia Temporal',
        estudiante: 'Visa de Estudiante',
        trabajo: 'Visa de Trabajo',
        turistico: 'Turístico',
        refugiado: 'Refugiado',
        otro: 'Otro'
    },

    // ===== RELACIONES FAMILIARES =====
    FAMILY_RELATIONS: {
        'cónyuge': 'Cónyuge',
        'hijo/hija': 'Hijo/Hija',
        'padre': 'Padre',
        'madre': 'Madre',
        'hermano/hermana': 'Hermano/Hermana',
        'abuelo/abuela': 'Abuelo/Abuela',
        'nieto/nieta': 'Nieto/Nieta',
        'tío/tía': 'Tío/Tía',
        'sobrino/sobrina': 'Sobrino/Sobrina',
        'primo/prima': 'Primo/Prima',
        'yerno/nuera': 'Yerno/Nuera',
        'suegro/suegra': 'Suegro/Suegra',
        'cuñado/cuñada': 'Cuñado/Cuñada',
        'concubino/concubina': 'Concubino/Concubina',
        'otro familiar': 'Otro Familiar',
        'no familiar': 'No Familiar'
    },

    // ===== PERÍODOS DE PERMANENCIA =====
    STAY_PERIODS: {
        indefinido: 'Indefinido',
        '1 mes': '1 Mes',
        '2 meses': '2 Meses',
        '3 meses': '3 Meses',
        '6 meses': '6 Meses',
        '1 año': '1 Año',
        '2 años': '2 Años',
        '3 años': '3 Años',
        '5 años': '5 Años',
        otro: 'Otro período'
    },

    // ===== TIPOS DE VIVIENDA =====
    HOUSING_TYPES: {
        'casa propia': 'Casa Propia',
        'departamento propio': 'Departamento Propio',
        'casa arrendada': 'Casa Arrendada',
        'departamento arrendado': 'Departamento Arrendado',
        'casa familiar': 'Casa Familiar',
        'pensión': 'Pensión',
        'residencial': 'Residencial',
        'otro': 'Otro'
    },

    // ===== TIPOS DE GASTOS =====
    EXPENSE_TYPES: {
        alimentacion: 'Alimentación',
        vivienda: 'Vivienda',
        vestimenta: 'Vestimenta',
        salud: 'Salud',
        educacion: 'Educación',
        transporte: 'Transporte'
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
        storage_key: 'expensas_theme_preference',
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
            pdf_generated: 'PDF de declaración generado correctamente',
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
            invalid_age: 'Edad debe estar entre 0 y 120 años',
            duplicate_documents: 'Los documentos no pueden ser duplicados',
            invalid_dates: 'Las fechas son inválidas',
            pdf_error: 'Error al generar el PDF',
            network_error: 'Error de conexión',
            invalid_income: 'Ingreso declarado inválido',
            missing_relation: 'Debe especificar la relación con el beneficiario',
            invalid_phone: 'Formato de teléfono inválido'
        },
        warning: {
            missing_signature: 'Falta agregar la firma digital',
            missing_photo: 'Falta capturar la foto del carnet',
            unsaved_changes: 'Hay cambios sin guardar',
            old_browser: 'Su navegador puede no ser compatible con todas las funciones',
            duplicate_documents: 'Algunos documentos están duplicados',
            incomplete_beneficiary: 'Complete la información del beneficiario adicional',
            no_expenses_selected: 'No ha seleccionado tipos de gastos a cubrir'
        },
        info: {
            auto_save: 'Cambios guardados automáticamente',
            signature_ready: 'Firma lista para usar',
            photo_ready: 'Foto lista para usar',
            form_complete: 'Formulario completo',
            additional_beneficiary: 'Beneficiario adicional detectado',
            same_address: 'Se usará la misma dirección del declarante'
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
        opening: 'En {ciudad}, a {dia} de {mes} de {anio}, comparece: Don/a {declarante}, de nacionalidad {nacionalidad_declarante}, cédula de identidad para extranjeros N° {documento_declarante}, con residencia {tipo_residencia}, {estado_civil}, con domicilio en {domicilio_declarante}, comuna de {comuna_declarante}, y de paso por esta; mayor de edad, quien acredita su identidad con su mencionada cédula y declara:',
        
        declaration: 'Que asumiré todos los costos de mantención en Chile, de {relacion_beneficiario}, {nombre_beneficiario}, de nacionalidad {nacionalidad_beneficiario}, cédula de identidad o pasaporte N° {documento_beneficiario}, por un período de permanencia {duracion_permanencia}, quien vive a mis expensas y en mi mismo domicilio, ubicado en {domicilio_beneficiario}, comuna de {comuna_beneficiario}.',
        
        additional_beneficiaries: 'También me hago responsable de los gastos de mantención de {beneficiarios_adicionales}.',
        
        economic_info: 'Declaro tener un ingreso mensual de ${ingreso_mensual}, ejerciendo la profesión de {ocupacion}, con capacidad económica suficiente para cubrir los gastos estimados en ${costo_estimado} mensuales por beneficiario.',
        
        expenses_covered: 'Los gastos que me comprometo a cubrir incluyen: {tipos_gastos}.',
        
        closing: 'Para constancia firma,',
        
        legal_note: 'Esta declaración de expensas tiene validez legal y constituye un compromiso formal del declarante de asumir todos los gastos de manutención del o los beneficiarios indicados durante su permanencia en Chile. El incumplimiento de esta declaración puede tener consecuencias legales y migratorias.'
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
        
        // Para declaración de expensas, la fecha debe ser reciente
        const minPastDate = new Date();
        minPastDate.setFullYear(minPastDate.getFullYear() - 1);
        
        return date >= minPastDate && date <= maxFutureDate;
    },

    // Validar ingreso/monto
    validateAmount(amount) {
        if (!amount) return false;
        
        const numAmount = parseFloat(amount.toString().replace(/[.,]/g, ''));
        return numAmount >= CONFIG.VALIDATION.income.min && 
               numAmount <= CONFIG.VALIDATION.income.max;
    },

    // Validar edad
    validateAge(age) {
        if (!age) return false;
        
        const numAge = parseInt(age);
        return numAge >= CONFIG.VALIDATION.age.min && 
               numAge <= CONFIG.VALIDATION.age.max;
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
                
                canvas.toBlob(resolve, 'image/jpeg', quality);
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

    // Validar conjunto de datos de expensas
    validateExpensasData(data) {
        const errors = [];
        
        // Validaciones requeridas
        if (!data.nombreDeclarante) errors.push('Nombre del declarante es requerido');
        if (!data.documentoDeclarante) errors.push('Documento del declarante es requerido');
        if (!data.nombreBeneficiario) errors.push('Nombre del beneficiario es requerido');
        if (!data.documentoBeneficiario) errors.push('Documento del beneficiario es requerido');
        if (!data.relacionBeneficiario) errors.push('Relación con el beneficiario es requerida');
        if (!data.domicilioDeclarante) errors.push('Domicilio del declarante es requerido');
        if (!data.domicilioBeneficiarios) errors.push('Domicilio donde vivirá el beneficiario es requerido');
        
        // Validaciones específicas
        if (data.documentoDeclarante && data.documentoBeneficiario && 
            data.documentoDeclarante === data.documentoBeneficiario) {
            errors.push('El declarante y beneficiario no pueden tener el mismo documento');
        }
        
        if (data.edadBeneficiario && !this.validateAge(data.edadBeneficiario)) {
            errors.push('Edad del beneficiario debe estar entre 0 y 120 años');
        }
        
        if (data.ingresoMensual && !this.validateAmount(data.ingresoMensual)) {
            errors.push('Ingreso mensual declarado es inválido');
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

    // Formatear período de permanencia
    formatStayPeriod(period) {
        return CONFIG.STAY_PERIODS[period] || period;
    },

    // Obtener etiqueta de relación familiar
    getFamilyRelationLabel(relation) {
        return CONFIG.FAMILY_RELATIONS[relation] || relation;
    },

    // Formatear lista de gastos
    formatExpensesList(expensesArray) {
        if (!expensesArray || !Array.isArray(expensesArray)) return '';
        
        const labels = expensesArray.map(expense => CONFIG.EXPENSE_TYPES[expense] || expense);
        
        if (labels.length === 0) return 'No especificados';
        if (labels.length === 1) return labels[0];
        if (labels.length === 2) return labels.join(' y ');
        
        return labels.slice(0, -1).join(', ') + ' y ' + labels[labels.length - 1];
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
ConfigUtils.log('info', 'Sistema de configuración para declaración de expensas inicializado', {
    version: CONFIG.APP.version,
    capabilities: ConfigUtils.detectBrowserCapabilities(),
    mobile: ConfigUtils.isMobile(),
    accessibility: ConfigUtils.detectAccessibilityPreferences()
});