// ========================================
// 📋 CONFIGURACIÓN DEL SISTEMA DE ORDEN DE COMPRA
// ========================================

const CONFIG = {
    // ===== CONFIGURACIÓN GENERAL =====
    APP: {
        name: 'Notaría Digital - Formato Orden de Compra',
        version: '1.0.0',
        author: 'Sistema Notarial Digital Chile',
        description: 'Sistema profesional para generar órdenes de compra con firmas digitales'
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
        key: 'orden_compra_form_data',
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
        razon_social: {
            min_length: 2,
            max_length: 150,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\.\,\-\&\(\)]+$/
        },
        precio: {
            min: 0,
            max: 999999999.99,
            pattern: /^\d+(\.\d{1,2})?$/
        },
        cantidad: {
            min: 1,
            max: 99999
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
            product_added: 'Producto agregado correctamente',
            product_removed: 'Producto eliminado'
        },
        error: {
            camera_access: 'No se pudo acceder a la cámara',
            invalid_image: 'Formato de imagen no válido',
            file_too_large: 'El archivo es demasiado grande',
            missing_fields: 'Complete todos los campos requeridos',
            invalid_rut: 'RUT inválido',
            invalid_email: 'Correo electrónico inválido',
            invalid_address: 'Dirección inválida',
            invalid_phone: 'Teléfono inválido',
            invalid_price: 'Precio inválido',
            invalid_quantity: 'Cantidad inválida',
            pdf_error: 'Error al generar el PDF',
            network_error: 'Error de conexión',
            no_products: 'Debe agregar al menos un producto'
        },
        warning: {
            missing_signature: 'Falta agregar las firmas digitales',
            missing_photo: 'Falta capturar las fotos del carnet',
            unsaved_changes: 'Hay cambios sin guardar',
            old_browser: 'Su navegador puede no ser compatible con todas las funciones',
            empty_products: 'Algunos productos están incompletos',
            high_total: 'El total de la orden es muy elevado, verifique los montos'
        },
        info: {
            auto_save: 'Cambios guardados automáticamente',
            signature_ready: 'Firma lista para usar',
            photo_ready: 'Foto lista para usar',
            form_complete: 'Formulario completo',
            calculating_totals: 'Calculando totales automáticamente'
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

    // ===== CONFIGURACIÓN ESPECÍFICA DE ORDEN DE COMPRA =====
    ORDEN_COMPRA: {
        max_productos: 20,
        min_productos: 1,
        iva_rate: 0.19, // 19% IVA
        numero_orden_format: /^[A-Z]{2,4}-\d{4}-\d{3,6}$/, // Ej: OC-2024-001
        monedas: [
            { code: 'CLP', symbol: '$', name: 'Peso Chileno' },
            { code: 'USD', symbol: 'US$', name: 'Dólar Estadounidense' },
            { code: 'EUR', symbol: '€', name: 'Euro' }
        ],
        default_currency: 'CLP',
        estados_orden: [
            'borrador', 'enviada', 'aceptada', 'rechazada', 'completada', 'cancelada'
        ],
        tipos_productos: [
            'producto', 'servicio', 'insumo', 'equipo', 'software', 'consultoría'
        ],
        unidades_medida: [
            'unidad', 'kg', 'gramo', 'litro', 'metro', 'metro²', 'metro³', 'hora', 'día', 'mes'
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

    // Validar razón social
    validateRazonSocial(razonSocial) {
        if (!razonSocial || typeof razonSocial !== 'string') return false;
        
        const trimmed = razonSocial.trim();
        return trimmed.length >= CONFIG.VALIDATION.razon_social.min_length &&
               trimmed.length <= CONFIG.VALIDATION.razon_social.max_length &&
               CONFIG.VALIDATION.razon_social.pattern.test(trimmed);
    },

    // Validar precio
    validatePrice(price) {
        if (!price || isNaN(price)) return false;
        
        const numPrice = parseFloat(price);
        return numPrice >= CONFIG.VALIDATION.precio.min &&
               numPrice <= CONFIG.VALIDATION.precio.max;
    },

    // Validar cantidad
    validateQuantity(quantity) {
        if (!quantity || isNaN(quantity)) return false;
        
        const numQuantity = parseInt(quantity);
        return numQuantity >= CONFIG.VALIDATION.cantidad.min &&
               numQuantity <= CONFIG.VALIDATION.cantidad.max;
    },

    // Formatear precio
    formatPrice(price) {
        if (!price) return '0';
        
        const numPrice = parseFloat(price);
        return numPrice.toLocaleString('es-CL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    },

    // Calcular total
    calculateTotal(price, quantity) {
        if (!price || !quantity) return 0;
        
        const numPrice = parseFloat(price);
        const numQuantity = parseInt(quantity);
        
        return numPrice * numQuantity;
    },

    // Calcular IVA
    calculateIVA(subtotal) {
        if (!subtotal) return 0;
        
        const numSubtotal = parseFloat(subtotal);
        return numSubtotal * CONFIG.ORDEN_COMPRA.iva_rate;
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
        let result = 'OC-';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        result += '-' + new Date().getFullYear();
        return result;
    },

    // Validar formulario completo de orden de compra
    validateCompleteForm(formData) {
        const errors = [];

        // Validar campos requeridos básicos
        const requiredFields = [
            'numeroOrden',
            'razonSocialCliente', 'rutCliente', 'ciudadCliente', 'contactoCliente', 'direccionCliente', 'telefonoCliente',
            'razonSocialProveedor', 'rutProveedor', 'ciudadProveedor', 'contactoProveedor', 'direccionProveedor', 'telefonoProveedor',
            'nombreResponsable', 'cargoResponsable'
        ];

        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                errors.push(`El campo ${field} es requerido`);
            }
        });

        // Validar checkbox obligatorio
        if (!formData.aceptacionOrden) {
            errors.push('Debe aceptar los términos y condiciones de la orden');
        }

        // Validaciones específicas
        if (formData.rutCliente && !this.validateRUT(formData.rutCliente)) {
            errors.push('RUT del cliente inválido');
        }

        if (formData.rutProveedor && !this.validateRUT(formData.rutProveedor)) {
            errors.push('RUT del proveedor inválido');
        }

        if (formData.telefonoCliente && !this.validatePhone(formData.telefonoCliente)) {
            errors.push('Teléfono del cliente inválido');
        }

        if (formData.telefonoProveedor && !this.validatePhone(formData.telefonoProveedor)) {
            errors.push('Teléfono del proveedor inválido');
        }

        // Validar productos
        const productos = this.getProductosFromForm();
        if (productos.length === 0) {
            errors.push('Debe agregar al menos un producto');
        } else {
            productos.forEach((producto, index) => {
                if (!producto.numeroParte || !producto.descripcion || !producto.precio || !producto.cantidad) {
                    errors.push(`Producto ${index + 1}: campos incompletos`);
                }
                if (producto.precio && !this.validatePrice(producto.precio)) {
                    errors.push(`Producto ${index + 1}: precio inválido`);
                }
                if (producto.cantidad && !this.validateQuantity(producto.cantidad)) {
                    errors.push(`Producto ${index + 1}: cantidad inválida`);
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    // Obtener productos del formulario
    getProductosFromForm() {
        const productos = [];
        const productosContainer = document.getElementById('productosContainer');
        
        if (productosContainer) {
            const productoItems = productosContainer.querySelectorAll('.producto-item');
            productoItems.forEach((item, index) => {
                const productoNum = index + 1;
                const numeroParte = document.getElementById(`numeroParte${productoNum}`)?.value || '';
                const descripcion = document.getElementById(`descripcionProducto${productoNum}`)?.value || '';
                const precio = document.getElementById(`precioUnitario${productoNum}`)?.value || '';
                const cantidad = document.getElementById(`cantidad${productoNum}`)?.value || '';
                
                if (numeroParte || descripcion || precio || cantidad) {
                    productos.push({
                        numeroParte,
                        descripcion,
                        precio: parseFloat(precio) || 0,
                        cantidad: parseInt(cantidad) || 0,
                        total: (parseFloat(precio) || 0) * (parseInt(cantidad) || 0)
                    });
                }
            });
        }
        
        return productos;
    },

    // Validar coherencia de datos
    validateDataCoherence(formData) {
        const warnings = [];

        // Validar montos no negativos
        const productos = this.getProductosFromForm();
        productos.forEach((producto, index) => {
            if (producto.precio < 0) {
                warnings.push(`Producto ${index + 1}: precio no puede ser negativo`);
            }
            if (producto.cantidad <= 0) {
                warnings.push(`Producto ${index + 1}: cantidad debe ser mayor a cero`);
            }
        });

        // Validar totales
        const subtotal = productos.reduce((sum, p) => sum + p.total, 0);
        if (subtotal > 50000000) { // 50 millones
            warnings.push('El subtotal de la orden es muy elevado, verifique los montos');
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
        if (formatted.rutCliente) {
            formatted.rutCliente = this.formatRUT(formatted.rutCliente);
        }
        if (formatted.rutProveedor) {
            formatted.rutProveedor = this.formatRUT(formatted.rutProveedor);
        }

        // Formatear teléfonos
        if (formatted.telefonoCliente) {
            formatted.telefonoCliente = formatted.telefonoCliente.replace(/(\+56)?(\d{1})(\d{4})(\d{4})/, '+56 $2 $3 $4');
        }
        if (formatted.telefonoProveedor) {
            formatted.telefonoProveedor = formatted.telefonoProveedor.replace(/(\+56)?(\d{1})(\d{4})(\d{4})/, '+56 $2 $3 $4');
        }

        return formatted;
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
ConfigUtils.log('info', 'Sistema de configuración de Orden de Compra inicializado', {
    version: CONFIG.APP.version,
    capabilities: ConfigUtils.detectBrowserCapabilities(),
    mobile: ConfigUtils.isMobile()
});