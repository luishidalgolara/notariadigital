// ===== CONFIGURACIÓN DEL SISTEMA DE PODER SIMPLE =====

/**
 * Configuración general del sistema
 */
const CONFIG = {
    // Información de la empresa/notaría
    COMPANY: {
        name: 'Notaría Digital Chile',
        address: 'Santiago, Chile',
        phone: '+56 2 2XXX XXXX',
        email: 'contacto@notariadigital.cl',
        website: 'www.notariadigital.cl'
    },
    
    // Configuración del PDF
    PDF: {
        format: 'a4',
        orientation: 'portrait',
        unit: 'mm',
        margins: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        },
        fonts: {
            primary: 'times',
            secondary: 'helvetica'
        },
        sizes: {
            title: 14,
            subtitle: 12,
            body: 10,
            small: 8
        }
    },
    
    // Configuración de validación
    VALIDATION: {
        required_fields: [
            'ciudadPoder', 'fechaPoder',
            'nombreMandante', 'rutMandante', 'domicilioMandante', 'comunaMandante', 'ciudadMandante',
            'nombreMandatario', 'rutMandatario', 'domicilioMandatario', 'comunaMandatario', 'ciudadMandatario',
            'efectosPoder'
        ],
        rut_pattern: /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,
        min_text_length: 10,
        max_text_length: 2000
    },
    
    // Opciones predefinidas para formularios
    OPTIONS: {
        ciudades_chile: [
            'Santiago', 'Valparaíso', 'Viña del Mar', 'Concepción', 'La Serena', 'Coquimbo',
            'Antofagasta', 'Temuco', 'Rancagua', 'Talca', 'Arica', 'Iquique', 'Puerto Montt',
            'Chillán', 'Los Ángeles', 'Calama', 'Copiapó', 'Osorno', 'Quillota', 'Valdivia',
            'Punta Arenas', 'San Antonio', 'Melipilla', 'Los Andes', 'Curicó', 'Linares',
            'Ovalle', 'San Fernando', 'Talagante', 'Cauquenes', 'Castro', 'Ancud', 'Coyhaique'
        ],
        
        comunas_principales: [
            // Santiago
            'Santiago', 'Providencia', 'Las Condes', 'Vitacura', 'Ñuñoa', 'La Reina', 'Macul',
            'Peñalolén', 'La Florida', 'Puente Alto', 'San Miguel', 'San Joaquín', 'La Granja',
            'La Pintana', 'El Bosque', 'Pedro Aguirre Cerda', 'Lo Espejo', 'Estación Central',
            'Maipú', 'Pudahuel', 'Cerro Navia', 'Lo Prado', 'Quinta Normal', 'Independencia',
            'Recoleta', 'Conchalí', 'Huechuraba', 'Quilicura', 'Renca',
            // Valparaíso
            'Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué', 'Villa Alemana', 'Casablanca',
            // Concepción
            'Concepción', 'Talcahuano', 'Chiguayante', 'San Pedro de la Paz', 'Penco', 'Tomé',
            // Otras importantes
            'La Serena', 'Coquimbo', 'Antofagasta', 'Temuco', 'Rancagua', 'Talca'
        ],
        
        efectos_poder_comunes: [
            'Para representarme en toda clase de trámites ante instituciones públicas y privadas',
            'Para cobrar dineros, firmar documentos y realizar gestiones bancarias',
            'Para retirar documentos y certificados de organismos públicos',
            'Para realizar trámites relacionados con vehículos motorizados',
            'Para gestiones ante el Servicio de Impuestos Internos',
            'Para trámites ante notarías y conservadores',
            'Para gestiones ante AFP y sistemas de salud',
            'Para representación en juicios y procedimientos legales',
            'Para trámites de importación y exportación',
            'Para gestiones inmobiliarias y de propiedades',
            'Personalizado'
        ]
    },
    
    // Meses en español para fechas
    MONTHS: [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ],
    
    // Configuración de autoguardado
    AUTOSAVE: {
        enabled: true,
        interval: 30000, // 30 segundos
        key: 'poderSimpleForm'
    },
    
    // Configuración de notificaciones
    NOTIFICATIONS: {
        duration: 3000, // 3 segundos
        position: 'top-right',
        animations: true
    },
    
    // URLs y endpoints (para futuras integraciones)
    ENDPOINTS: {
        save_document: '/api/documents/save',
        validate_rut: '/api/validate/rut',
        send_email: '/api/notifications/email',
        get_templates: '/api/templates/poder-simple'
    },
    
    // Configuración de seguridad
    SECURITY: {
        max_file_size: 5 * 1024 * 1024, // 5MB
        allowed_file_types: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
        session_timeout: 30 * 60 * 1000, // 30 minutos
        max_attempts: 3
    },
    
    // Textos y mensajes predefinidos
    MESSAGES: {
        success: {
            pdf_generated: '¡PDF de Poder Simple generado exitosamente!',
            form_saved: 'Formulario guardado correctamente',
            form_cleared: 'Formulario limpiado correctamente',
            signature_applied: 'Firma digital aplicada correctamente',
            photos_captured: 'Fotos del carnet capturadas correctamente'
        },
        errors: {
            validation_failed: 'Por favor complete todos los campos requeridos',
            pdf_generation_failed: 'Error al generar el PDF. Intente nuevamente.',
            invalid_rut: 'El RUT ingresado no es válido',
            invalid_date: 'La fecha ingresada no es válida',
            invalid_text_length: 'El texto de efectos debe tener entre 10 y 2000 caracteres',
            connection_error: 'Error de conexión. Verifique su conexión a internet.',
            camera_access_denied: 'Acceso a la cámara denegado',
            file_too_large: 'El archivo es muy grande (máximo 5MB)',
            invalid_file_type: 'Tipo de archivo no válido'
        },
        warnings: {
            unsaved_changes: 'Tiene cambios sin guardar. ¿Desea continuar?',
            clear_form: '¿Está seguro de que desea limpiar todos los campos?',
            incomplete_data: 'Complete los datos del mandante antes de firmar',
            missing_signatures: 'Faltan firmas digitales por aplicar',
            missing_photos: 'Faltan fotos del carnet por capturar',
            same_person_warning: 'El mandante y mandatario parecen ser la misma persona'
        },
        info: {
            form_restored: 'Formulario restaurado desde guardado automático',
            rut_formatted: 'Formato de RUT aplicado',
            camera_ready: 'Cámara lista para capturar',
            photo_captured: 'Foto capturada correctamente'
        }
    },
    
    // Configuración de tema/apariencia
    THEME: {
        primary_color: '#ed8936',
        secondary_color: '#48bb78',
        accent_color: '#805ad5',
        background_gradient: 'linear-gradient(135deg, #0f1419 0%, #1a202c 50%, #2d3748 100%)',
        text_colors: {
            primary: '#e2e8f0',
            secondary: '#cbd5e0',
            muted: '#a0aec0'
        }
    },
    
    // Configuración específica del documento
    DOCUMENT: {
        title: 'PODER SIMPLE',
        subtitle: '',
        type: 'legal_power',
        version: '1.0.0',
        template_id: 'poder_simple',
        
        // Textos legales estándar
        legal_texts: {
            clausula_final: 'El presente poder se otorga con las facultades establecidas en el artículo 7º del Código de Procedimiento Civil.',
            
            nota_laboral: 'NOTA: Este poder no habilita para asistir a comparendo de conciliación en representación del empleador o del trabajador.',
            
            validez: 'Este poder tendrá validez por el tiempo que determine la ley y mientras no sea revocado expresamente por el mandante.',
            
            revocacion: 'Este poder podrá ser revocado en cualquier momento por el mandante mediante comunicación escrita al mandatario.'
        }
    },
    
    // Configuración de analytics (opcional)
    ANALYTICS: {
        enabled: false,
        google_analytics_id: 'GA-XXXXXXXXX',
        track_form_completion: true,
        track_pdf_generation: true,
        track_signatures: true,
        track_photos: true
    }
};

/**
 * Funciones de utilidad para configuración
 */
const ConfigUtils = {
    /**
     * Obtiene un valor de configuración por ruta
     * @param {string} path - Ruta separada por puntos (ej: 'PDF.fonts.primary')
     * @returns {*} Valor de configuración
     */
    get(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], CONFIG);
    },
    
    /**
     * Establece un valor de configuración
     * @param {string} path - Ruta separada por puntos
     * @param {*} value - Nuevo valor
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key] = obj[key] || {}, CONFIG);
        target[lastKey] = value;
    },
    
    /**
     * Valida que la configuración esté completa
     * @returns {boolean} True si la configuración es válida
     */
    validate() {
        const required = [
            'COMPANY.name',
            'PDF.format',
            'VALIDATION.required_fields',
            'DOCUMENT.title'
        ];
        
        return required.every(path => this.get(path) !== undefined);
    },
    
    /**
     * Carga configuración desde localStorage
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('poder_simple_config');
            if (saved) {
                const config = JSON.parse(saved);
                Object.assign(CONFIG, config);
                console.log('✅ Configuración cargada desde localStorage');
            }
        } catch (error) {
            console.warn('⚠️ No se pudo cargar configuración guardada:', error);
        }
    },
    
    /**
     * Guarda configuración en localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('poder_simple_config', JSON.stringify(CONFIG));
            console.log('✅ Configuración guardada en localStorage');
        } catch (error) {
            console.warn('⚠️ No se pudo guardar configuración:', error);
        }
    },
    
    /**
     * Obtiene lista de opciones para un select
     * @param {string} optionType - Tipo de opción (ej: 'ciudades_chile')
     * @returns {Array} Array de opciones
     */
    getOptions(optionType) {
        return this.get(`OPTIONS.${optionType}`) || [];
    },
    
    /**
     * Formatea número a pesos chilenos
     * @param {number} amount - Cantidad
     * @returns {string} Cantidad formateada
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount);
    },
    
    /**
     * Valida RUT chileno
     * @param {string} rut - RUT a validar
     * @returns {boolean} True si es válido
     */
    validateRUT(rut) {
        const cleanRUT = rut.replace(/[^0-9kK]/g, '');
        
        if (cleanRUT.length < 8 || cleanRUT.length > 9) return false;
        
        const dv = cleanRUT.slice(-1).toLowerCase();
        const numbers = cleanRUT.slice(0, -1);
        
        let sum = 0;
        let multiplier = 2;
        
        for (let i = numbers.length - 1; i >= 0; i--) {
            sum += parseInt(numbers[i]) * multiplier;
            multiplier = multiplier === 7 ? 2 : multiplier + 1;
        }
        
        const expectedDV = 11 - (sum % 11);
        const finalDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'k' : expectedDV.toString();
        
        return dv === finalDV;
    },
    
    /**
     * Formatea RUT con puntos y guión
     * @param {string} rut - RUT sin formato
     * @returns {string} RUT formateado
     */
    formatRUT(rut) {
        rut = rut.replace(/[^0-9kK]/g, '');
        
        if (rut.length < 2) return rut;
        
        const dv = rut.slice(-1);
        const numbers = rut.slice(0, -1);
        const formattedNumbers = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        
        return `${formattedNumbers}-${dv}`;
    },
    
    /**
     * Valida fecha
     * @param {string} date - Fecha en formato YYYY-MM-DD
     * @returns {boolean} True si es válida
     */
    validateDate(date) {
        if (!date) return false;
        const dateObj = new Date(date);
        return dateObj instanceof Date && !isNaN(dateObj);
    },
    
    /**
     * Formatea fecha a español
     * @param {string} date - Fecha en formato YYYY-MM-DD
     * @returns {string} Fecha formateada
     */
    formatDateToSpanish(date) {
        if (!date) return '';
        const dateObj = new Date(date);
        const day = dateObj.getDate();
        const month = this.get('MONTHS')[dateObj.getMonth()];
        const year = dateObj.getFullYear();
        return `${day} de ${month} de ${year}`;
    },
    
    /**
     * Valida longitud de texto
     * @param {string} text - Texto a validar
     * @param {number} min - Longitud mínima
     * @param {number} max - Longitud máxima
     * @returns {boolean} True si es válida
     */
    validateTextLength(text, min = 10, max = 2000) {
        if (!text) return false;
        const length = text.trim().length;
        return length >= min && length <= max;
    }
};

// Auto-cargar configuración guardada al inicializar
ConfigUtils.loadFromStorage();

// Exportar configuración para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ConfigUtils };
} else {
    window.CONFIG = CONFIG;
    window.ConfigUtils = ConfigUtils;
}

console.log('🔧 Configuración del Sistema de Poder Simple cargada');
console.log('📋 Campos requeridos:', CONFIG.VALIDATION.required_fields.length);
console.log('🏙️ Ciudades disponibles:', CONFIG.OPTIONS.ciudades_chile.length);
console.log('🏘️ Comunas disponibles:', CONFIG.OPTIONS.comunas_principales.length);