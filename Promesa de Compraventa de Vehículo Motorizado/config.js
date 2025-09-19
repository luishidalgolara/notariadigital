// ===== CONFIGURACIÓN DEL SISTEMA DE PROMESA DE COMPRAVENTA =====

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
            'nombreVendedor', 'rutVendedor', 'domicilioVendedor', 'comunaVendedor',
            'nombreComprador', 'rutComprador', 'domicilioComprador', 'comunaComprador',
            'tipoVehiculo', 'marcaVehiculo', 'modeloVehiculo', 'anoVehiculo', 
            'colorVehiculo', 'patenteVehiculo', 'motorVehiculo', 'chasisVehiculo',
            'lugarContrato', 'fechaContrato', 'precioNumeros', 'precioLetras', 
            'formaPago', 'fechaEntrega', 'fechaVentaDefinitiva', 'condicionesAdicionales',
            'montoMulta', 'domicilioLegal'
        ],
        rut_pattern: /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,
        patente_pattern: /^[A-Z]{2}\d{4}$|^[A-Z]{4}\d{2}$/,
        min_price: 1000,
        max_price: 999999999,
        min_year: 1900,
        max_year: new Date().getFullYear() + 1
    },
    
    // Opciones predefinidas para formularios
    OPTIONS: {
        tipos_vehiculo: [
            { value: 'automóvil', label: 'Automóvil' },
            { value: 'camioneta', label: 'Camioneta' },
            { value: 'motocicleta', label: 'Motocicleta' },
            { value: 'camión', label: 'Camión' },
            { value: 'bus', label: 'Bus' },
            { value: 'furgón', label: 'Furgón' },
            { value: 'jeep', label: 'Jeep/SUV' },
            { value: 'station wagon', label: 'Station Wagon' },
            { value: 'pickup', label: 'Pickup' },
            { value: 'otro', label: 'Otro' }
        ],
        
        marcas_vehiculo: [
            'Toyota', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'Ford', 'Volkswagen',
            'Suzuki', 'Mazda', 'Honda', 'Peugeot', 'Renault', 'Citroën', 'Fiat',
            'BMW', 'Mercedes-Benz', 'Audi', 'Volvo', 'Subaru', 'Mitsubishi',
            'Isuzu', 'Mahindra', 'Great Wall', 'Chery', 'JAC', 'BYD', 'Otra'
        ],
        
        colores_vehiculo: [
            'Blanco', 'Negro', 'Gris', 'Plata', 'Azul', 'Rojo', 'Verde', 'Amarillo',
            'Café', 'Dorado', 'Naranjo', 'Morado', 'Rosa', 'Beige', 'Crema', 'Otro'
        ],
        
        comunas_chile: [
            // Región Metropolitana
            'Santiago', 'Providencia', 'Las Condes', 'Vitacura', 'Ñuñoa',
            'La Reina', 'Macul', 'Peñalolén', 'La Florida', 'Puente Alto',
            'San Miguel', 'San Joaquín', 'La Granja', 'La Pintana', 'El Bosque',
            'Pedro Aguirre Cerda', 'Lo Espejo', 'Estación Central', 'Maipú',
            'Pudahuel', 'Cerro Navia', 'Lo Prado', 'Quinta Normal', 'Independencia',
            'Recoleta', 'Conchalí', 'Huechuraba', 'Quilicura', 'Renca',
            // Valparaíso
            'Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué', 'Villa Alemana',
            'Casablanca', 'San Antonio', 'Cartagena', 'El Quisco', 'Algarrobo',
            // Concepción
            'Concepción', 'Talcahuano', 'Chiguayante', 'San Pedro de la Paz',
            'Penco', 'Tomé', 'Hualpén', 'Coronel', 'Lota',
            // La Serena
            'La Serena', 'Coquimbo', 'Ovalle', 'Illapel',
            // Temuco
            'Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón',
            // Otras principales
            'Antofagasta', 'Calama', 'Iquique', 'Alto Hospicio', 'Arica',
            'Rancagua', 'Talca', 'Chillán', 'Los Ángeles', 'Osorno',
            'Puerto Montt', 'Castro', 'Coyhaique', 'Punta Arenas'
        ],
        
        formas_pago_comunes: [
            'Al contado',
            'Mitad al contado, saldo en 6 cuotas',
            'Mitad al contado, saldo en 12 cuotas',
            '30% al contado, saldo financiado',
            'Transferencia bancaria inmediata',
            'Cheque al día',
            'Crédito bancario',
            'Permuta por otro vehículo',
            'Personalizada'
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
        key: 'promesaCompraventaForm'
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
        validate_patente: '/api/validate/patente',
        send_email: '/api/notifications/email',
        get_templates: '/api/templates',
        vehicle_info: '/api/vehicles/info'
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
            pdf_generated: '¡PDF de Promesa de Compraventa generado exitosamente!',
            form_saved: 'Formulario guardado correctamente',
            form_cleared: 'Formulario limpiado correctamente',
            signature_applied: 'Firma digital aplicada correctamente',
            photos_captured: 'Fotos del carnet capturadas correctamente'
        },
        errors: {
            validation_failed: 'Por favor complete todos los campos requeridos',
            pdf_generation_failed: 'Error al generar el PDF. Intente nuevamente.',
            invalid_rut: 'El RUT ingresado no es válido',
            invalid_patente: 'La patente ingresada no es válida',
            invalid_price: 'El precio debe ser mayor a $1.000',
            invalid_year: 'El año del vehículo no es válido',
            connection_error: 'Error de conexión. Verifique su conexión a internet.',
            camera_access_denied: 'Acceso a la cámara denegado',
            file_too_large: 'El archivo es muy grande (máximo 5MB)',
            invalid_file_type: 'Tipo de archivo no válido'
        },
        warnings: {
            unsaved_changes: 'Tiene cambios sin guardar. ¿Desea continuar?',
            clear_form: '¿Está seguro de que desea limpiar todos los campos?',
            incomplete_data: 'Complete los datos del vendedor antes de firmar',
            missing_signatures: 'Faltan firmas digitales por aplicar',
            missing_photos: 'Faltan fotos del carnet por capturar'
        },
        info: {
            form_restored: 'Formulario restaurado desde guardado automático',
            price_converted: 'Precio convertido automáticamente',
            patente_formatted: 'Formato de patente aplicado',
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
        title: 'PROMESA DE COMPRAVENTA',
        subtitle: 'Vehículo Motorizado',
        type: 'legal_contract',
        version: '1.0.0',
        template_id: 'promesa_compraventa_vehiculo',
        
        // Textos legales estándar
        legal_texts: {
            saneamiento: 'El vehículo se promete vender en el estado en que actualmente se encuentra, que es conocido del promitente comprador(a), con todos sus accesorios, con sus derechos, respondiendo el promitente vendedor(a) por el saneamiento conforme a la ley.',
            
            no_enajenacion: 'El promitente vendedor(a) asume la obligación de no vender, ceder, prendar, permutar, arrendar, dar en pago ni ejecutar acto jurídico de ninguna naturaleza sobre el referido bien, a menos que el promitente comprador(a) lo autorice por escrito; caso contrario, deberá restituir íntegramente con intereses y reajustes lo que hubiere recibido a cuenta del precio, y sin perjuicio del ejercicio de las acciones judiciales que correspondan.',
            
            multa_incumplimiento: 'Si llegado el plazo señalado y cumplidas las condiciones exigidas para la celebración del contrato de compraventa definitivo, alguna de las partes se negare a suscribirlo, la parte incumplidora deberá indemnizar a la otra parte, dentro de los 5 días siguientes a la fecha de término del contrato, la suma de $ [MONTO_MULTA], que se entenderá como multa o cláusula penal. Sin perjuicio del derecho de la parte cumplidora a pedir el cumplimiento forzado del presente contrato.',
            
            domicilio_legal: 'Para todos los efectos legales que puedan derivar del presente contrato las partes fijan su domicilio en [DOMICILIO_LEGAL] y se someten a la Jurisdicción de sus Tribunales de Justicia.'
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
            const saved = localStorage.getItem('promesa_compraventa_config');
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
            localStorage.setItem('promesa_compraventa_config', JSON.stringify(CONFIG));
            console.log('✅ Configuración guardada en localStorage');
        } catch (error) {
            console.warn('⚠️ No se pudo guardar configuración:', error);
        }
    },
    
    /**
     * Obtiene lista de opciones para un select
     * @param {string} optionType - Tipo de opción (ej: 'tipos_vehiculo')
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
     * Convierte número a palabras (básico)
     * @param {number} number - Número a convertir
     * @returns {string} Número en palabras
     */
    numberToWords(number) {
        // Implementación básica - se puede expandir
        const units = [
            '', 'mil', 'millones', 'mil millones'
        ];
        
        if (number === 0) return 'cero pesos';
        
        let result = '';
        let unitIndex = 0;
        
        while (number > 0) {
            const group = number % 1000;
            if (group !== 0) {
                result = `${group} ${units[unitIndex]} ${result}`.trim();
            }
            number = Math.floor(number / 1000);
            unitIndex++;
        }
        
        return `${result} pesos`.replace(/\s+/g, ' ').trim();
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
     * Valida formato de patente chilena
     * @param {string} patente - Patente a validar
     * @returns {boolean} True si es válida
     */
    validatePatente(patente) {
        const patterns = [
            /^[A-Z]{2}\d{4}$/, // Formato antiguo: AB1234
            /^[A-Z]{4}\d{2}$/ // Formato nuevo: ABCD12
        ];
        
        return patterns.some(pattern => pattern.test(patente.toUpperCase()));
    },
    
    /**
     * Formatea patente a mayúsculas
     * @param {string} patente - Patente sin formato
     * @returns {string} Patente formateada
     */
    formatPatente(patente) {
        return patente.toUpperCase().replace(/[^A-Z0-9]/g, '');
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

console.log('🔧 Configuración del Sistema de Promesa de Compraventa cargada');
console.log('📋 Campos requeridos:', CONFIG.VALIDATION.required_fields.length);
console.log('🚗 Tipos de vehículos:', CONFIG.OPTIONS.tipos_vehiculo.length);
console.log('🏘️ Comunas disponibles:', CONFIG.OPTIONS.comunas_chile.length);