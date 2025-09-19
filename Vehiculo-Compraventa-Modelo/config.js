// ========================================
// 📋 CONFIGURACIÓN DEL SISTEMA DE COMPRAVENTA DE VEHÍCULO
// ========================================

const CONFIG = {
    // ===== CONFIGURACIÓN GENERAL =====
    APP: {
        name: 'Notaría Digital - Compraventa de Vehículo',
        version: '1.0.0',
        author: 'Sistema Notarial Digital Chile',
        description: 'Sistema profesional para generar contratos de compraventa de vehículos con firmas digitales'
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
        key: 'compraventa_vehiculo_form_data',
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
        precio: {
            min_amount: 100000, // Precio mínimo
            max_amount: 500000000, // 500 millones
            pattern: /^[0-9\.\,\$\s]+$/
        },
        patente: {
            pattern: /^[A-Z]{4}[0-9]{2}$|^[A-Z]{2}[0-9]{4}$|^[A-Z]{3}[0-9]{3}$/
        },
        motor_chasis: {
            min_length: 6,
            max_length: 25,
            pattern: /^[A-Z0-9]+$/
        },
        year: {
            min_year: 1990,
            max_year: new Date().getFullYear() + 1
        },
        kilometraje: {
            min_km: 0,
            max_km: 1000000
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
        storage_key: 'notaria_digital_compraventa_theme_preference',
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
            photo_captured: 'Documento capturado exitosamente',
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
            invalid_patente: 'Patente inválida (formato: ABCD12 o AB1234)',
            invalid_precio: 'Precio inválido',
            invalid_year: 'Año del vehículo inválido',
            invalid_kilometraje: 'Kilometraje inválido',
            invalid_motor_chasis: 'Número de motor/chasis inválido',
            pdf_error: 'Error al generar el PDF',
            network_error: 'Error de conexión'
        },
        warning: {
            missing_signature: 'Falta agregar las firmas digitales',
            missing_photo: 'Falta capturar los documentos',
            unsaved_changes: 'Hay cambios sin guardar',
            old_browser: 'Su navegador puede no ser compatible con todas las funciones',
            incomplete_form: 'Complete todos los campos requeridos',
            high_price: 'El precio parece elevado, verifique la cantidad',
            high_mileage: 'El kilometraje es muy alto para el año del vehículo',
            old_vehicle: 'El vehículo es muy antiguo'
        },
        info: {
            auto_save: 'Cambios guardados automáticamente',
            signature_ready: 'Firma lista para usar',
            photo_ready: 'Documentos listos para usar',
            form_complete: 'Formulario completo',
            contract_notice: 'Recuerde que el contrato debe ser firmado ante notario'
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

    // ===== CONFIGURACIÓN ESPECÍFICA DE COMPRAVENTA DE VEHÍCULO =====
    COMPRAVENTA_VEHICULO: {
        regiones: [
            'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
            'Valparaíso', 'Metropolitana', 'O\'Higgins', 'Maule', 'Ñuble',
            'Biobío', 'Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'
        ],

        tipos_vehiculo: [
            { value: 'Automóvil', label: 'Automóvil' },
            { value: 'Camioneta', label: 'Camioneta' },
            { value: 'Motocicleta', label: 'Motocicleta' },
            { value: 'Furgón', label: 'Furgón' },
            { value: 'Jeep', label: 'Jeep' },
            { value: 'Camión', label: 'Camión' }
        ],

        marcas_populares: [
            'Toyota', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'Ford',
            'Volkswagen', 'Peugeot', 'Renault', 'Suzuki', 'Mazda', 'Honda',
            'BMW', 'Mercedes-Benz', 'Audi', 'Volvo', 'Mitsubishi', 'Subaru'
        ],

        numero_puertas: [
            { value: '2', label: '2 puertas' },
            { value: '3', label: '3 puertas' },
            { value: '4', label: '4 puertas' },
            { value: '5', label: '5 puertas' }
        ],

        estados_vehiculo: [
            { value: 'excelente', label: 'Excelente estado de funcionamiento' },
            { value: 'buen', label: 'Buen estado de funcionamiento' },
            { value: 'regular', label: 'Regular estado de funcionamiento' },
            { value: 'necesita_reparacion', label: 'Necesita reparación' }
        ],

        formas_pago: [
            { value: 'contado', label: 'Al contado en este acto' },
            { value: 'transferencia', label: 'Transferencia bancaria' },
            { value: 'cheque', label: 'Cheque al día' },
            { value: 'financiamiento', label: 'Con financiamiento' }
        ],

        gastos_contrato: [
            { value: 'comprador', label: 'Todos los gastos son de cargo del comprador' },
            { value: 'vendedor', label: 'Todos los gastos son de cargo del vendedor' },
            { value: 'compartidos', label: 'Gastos compartidos entre las partes' }
        ],

        responsabilidad_multas: [
            { value: 'vendedor', label: 'El vendedor responde por multas anteriores' },
            { value: 'comprador', label: 'El comprador asume multas anteriores' },
            { value: 'sin_multas', label: 'No existen multas pendientes' }
        ],

        numero_notarias: [
            'Primera', 'Segunda', 'Tercera', 'Cuarta', 'Quinta',
            'Sexta', 'Séptima', 'Octava', 'Novena', 'Décima'
        ],

        colores_comunes: [
            'Blanco', 'Negro', 'Gris', 'Plata', 'Azul', 'Rojo',
            'Verde', 'Amarillo', 'Café', 'Dorado', 'Beige'
        ],

        precios_referencia: {
            minimo: 500000,         // 500 mil
            promedio_bajo: 2000000, // 2 millones
            promedio_medio: 8000000, // 8 millones
            promedio_alto: 25000000, // 25 millones
            lujo: 50000000          // 50 millones
        },

        kilometraje_referencia: {
            nuevo: 0,
            bajo: 20000,
            medio: 80000,
            alto: 150000,
            muy_alto: 250000
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

    // Validar patente chilena
    validatePatente(patente) {
        if (!patente || typeof patente !== 'string') return false;
        
        const cleanPatente = patente.toUpperCase().replace(/\s/g, '');
        return CONFIG.VALIDATION.patente.pattern.test(cleanPatente);
    },

    // Formatear patente
    formatPatente(patente) {
        if (!patente) return '';
        
        const clean = patente.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        // Formato ABCD12 o AB1234
        if (clean.length === 6) {
            if (/^[A-Z]{4}[0-9]{2}$/.test(clean)) {
                return clean.substring(0, 4) + clean.substring(4);
            } else if (/^[A-Z]{2}[0-9]{4}$/.test(clean)) {
                return clean.substring(0, 2) + clean.substring(2);
            }
        }
        
        return clean;
    },

    // Validar precio
    validatePrecio(precio) {
        if (!precio) return false;
        
        const cleanPrecio = precio.replace(/[^\d]/g, '');
        const numericPrecio = parseInt(cleanPrecio);
        
        return !isNaN(numericPrecio) && 
               numericPrecio >= CONFIG.VALIDATION.precio.min_amount &&
               numericPrecio <= CONFIG.VALIDATION.precio.max_amount;
    },

    // Formatear precio
    formatPrecio(precio) {
        if (!precio) return '';
        
        const cleanPrecio = precio.replace(/[^\d]/g, '');
        if (!cleanPrecio) return '';
        
        const numericPrecio = parseInt(cleanPrecio);
        return '$' + numericPrecio.toLocaleString('es-CL');
    },

    // Convertir número a palabras (básico)
    numberToWords(num) {
        if (!num) return '';
        
        const units = ['', 'mil', 'millón', 'mil millones'];
        const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
        const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
        const ones = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
        
        // Implementación simplificada - para casos complejos se recomienda usar una librería especializada
        return 'Complete manualmente el monto en palabras';
    },

    // Validar año del vehículo
    validateYear(year) {
        if (!year) return false;
        
        const numYear = parseInt(year);
        return numYear >= CONFIG.VALIDATION.year.min_year && 
               numYear <= CONFIG.VALIDATION.year.max_year;
    },

    // Validar kilometraje
    validateKilometraje(km) {
        if (!km && km !== 0) return false;
        
        const numKm = parseInt(km);
        return numKm >= CONFIG.VALIDATION.kilometraje.min_km && 
               numKm <= CONFIG.VALIDATION.kilometraje.max_km;
    },

    // Validar número de motor/chasis
    validateMotorChasis(value) {
        if (!value || typeof value !== 'string') return false;
        
        const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        return clean.length >= CONFIG.VALIDATION.motor_chasis.min_length &&
               clean.length <= CONFIG.VALIDATION.motor_chasis.max_length &&
               CONFIG.VALIDATION.motor_chasis.pattern.test(clean);
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
               trimmedAddress.length <= CONFIG.VALIDATION.address.max_length &&
               CONFIG.VALIDATION.address.pattern.test(trimmedAddress);
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
        let result = 'CV-';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        result += '-' + new Date().getFullYear();
        return result;
    },

    // Validar formulario completo de compraventa
    validateCompleteVehicleForm(formData) {
        const errors = [];

        // Validar campos requeridos básicos
        const requiredFields = [
            'ciudadContrato', 'fechaContrato', 'notarioPublico', 'numeroNotaria', 'ciudadNotaria',
            'nombreVendedor', 'rutVendedor', 'domicilioVendedor', 'numeroVendedor', 'comunaVendedor', 'ciudadVendedor', 'regionVendedor',
            'nombreComprador', 'rutComprador', 'domicilioComprador', 'numeroComprador', 'comunaComprador', 'ciudadComprador', 'regionComprador',
            'tipoVehiculo', 'marcaVehiculo', 'anioVehiculo', 'modeloVehiculo', 'numeroMotor', 'numeroChasis',
            'kilometraje', 'numeroPuertas', 'colorVehiculo', 'patenteVehiculo', 'estadoVehiculo',
            'precioVenta', 'formaPago', 'precioEnPalabras', 'declaracionDeudas',
            'domicilioLegalComuna', 'domicilioLegalCiudad'
        ];

        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                errors.push(`El campo ${field} es requerido`);
            }
        });

        // Validaciones específicas
        if (formData.rutVendedor && !this.validateRUT(formData.rutVendedor)) {
            errors.push('RUT del vendedor inválido');
        }

        if (formData.rutComprador && !this.validateRUT(formData.rutComprador)) {
            errors.push('RUT del comprador inválido');
        }

        if (formData.fechaContrato && !this.validateDate(formData.fechaContrato)) {
            errors.push('Fecha del contrato inválida');
        }

        if (formData.patenteVehiculo && !this.validatePatente(formData.patenteVehiculo)) {
            errors.push('Patente del vehículo inválida');
        }

        if (formData.precioVenta && !this.validatePrecio(formData.precioVenta)) {
            errors.push('Precio de venta inválido');
        }

        if (formData.anioVehiculo && !this.validateYear(formData.anioVehiculo)) {
            errors.push('Año del vehículo inválido');
        }

        if (formData.kilometraje && !this.validateKilometraje(formData.kilometraje)) {
            errors.push('Kilometraje inválido');
        }

        if (formData.numeroMotor && !this.validateMotorChasis(formData.numeroMotor)) {
            errors.push('Número de motor inválido');
        }

        if (formData.numeroChasis && !this.validateMotorChasis(formData.numeroChasis)) {
            errors.push('Número de chasis inválido');
        }

        if (formData.nombreVendedor && !this.validateName(formData.nombreVendedor)) {
            errors.push('Nombre del vendedor inválido');
        }

        if (formData.nombreComprador && !this.validateName(formData.nombreComprador)) {
            errors.push('Nombre del comprador inválido');
        }

        if (formData.telefonoVendedor && !this.validatePhone(formData.telefonoVendedor)) {
            errors.push('Teléfono del vendedor inválido');
        }

        if (formData.telefonoComprador && !this.validatePhone(formData.telefonoComprador)) {
            errors.push('Teléfono del comprador inválido');
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

    // Obtener texto del estado del vehículo
    getEstadoVehiculoText(estadoValue) {
        const estado = CONFIG.COMPRAVENTA_VEHICULO.estados_vehiculo.find(est => est.value === estadoValue);
        return estado ? estado.label : 'buen estado de funcionamiento';
    },

    // Obtener texto de forma de pago
    getFormaPagoText(formaPagoValue) {
        const forma = CONFIG.COMPRAVENTA_VEHICULO.formas_pago.find(fp => fp.value === formaPagoValue);
        return forma ? forma.label : 'al contado en este acto';
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
ConfigUtils.log('info', 'Sistema de configuración de Compraventa de Vehículo inicializado', {
    version: CONFIG.APP.version,
    capabilities: ConfigUtils.detectBrowserCapabilities(),
    mobile: ConfigUtils.isMobile()
});