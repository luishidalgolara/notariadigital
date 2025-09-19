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
            title: 16,
            subtitle: 14,
            body: 12,
            small: 10
        }
    },
    
    // Configuración de validación
    VALIDATION: {
        required_fields: [
            'ciudadContrato', 'fechaContrato',
            'nombreVendedor', 'rutVendedor', 'domicilioVendedor', 'comunaVendedor',
            'nombreComprador', 'rutComprador', 'domicilioComprador', 'comunaComprador',
            'tipoVehiculo', 'marcaVehiculo', 'modeloVehiculo', 'anoVehiculo', 'patenteVehiculo',
            'numeroMotor', 'numeroChasis', 'colorVehiculo',
            'precioVenta', 'formaPago', 'fechaEntrega', 'fechaVentaDefinitiva', 'condicionVenta'
        ],
        rut_pattern: /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,
        patente_pattern: /^[A-Z]{2}\d{4}$|^[A-Z]{4}\d{2}$/,
        min_text_length: 10,
        max_text_length: 2000,
        min_price: 100000,
        max_price: 999999999
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
        
        tipos_vehiculo: [
            'Automóvil', 'Station Wagon', 'Hatchback', 'Sedán', 'SUV', 'Pick-up',
            'Camioneta', 'Furgón', 'Bus', 'Camión', 'Motocicleta', 'Scooter',
            'Cuatriciclo', 'Remolque', 'Casa Rodante', 'Otro'
        ],
        
        marcas_vehiculo: [
            'Toyota', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Suzuki',
            'Ford', 'Volkswagen', 'Peugeot', 'Renault', 'Citroën', 'Fiat',
            'Honda', 'Mitsubishi', 'Subaru', 'Isuzu', 'Jeep', 'Land Rover',
            'BMW', 'Mercedes-Benz', 'Audi', 'Volvo', 'Porsche', 'Ferrari',
            'Lamborghini', 'Maserati', 'Jaguar', 'Alfa Romeo', 'Mini',
            'Chery', 'BYD', 'Great Wall', 'JAC', 'Dongfeng', 'Otra'
        ],
        
        colores_vehiculo: [
            'Blanco', 'Negro', 'Gris', 'Plata', 'Azul', 'Rojo', 'Verde',
            'Amarillo', 'Naranja', 'Café', 'Beige', 'Dorado', 'Violeta',
            'Rosa', 'Celeste', 'Verde Oliva', 'Burdeo', 'Otro'
        ],
        
        formas_pago: [
            'Contado total al momento de la firma',
            'Contado total al momento de la entrega',
            'Pie del 30% y saldo financiado',
            'Pie del 50% y saldo contra entrega',
            'Cuotas mensuales según convenio',
            'Transferencia bancaria en fecha acordada',
            'Cheque al día',
            'Cheque a fecha',
            'Combinación efectivo y financiamiento',
            'Otra forma de pago a convenir'
        ],
        
        condiciones_venta: [
            'El vehículo se encuentra en perfecto estado de funcionamiento',
            'Se entrega con revisión técnica al día',
            'Se entrega con permiso de circulación al día',
            'Se entrega con seguro vigente',
            'Se incluyen todos los accesorios originales',
            'Se incluye manual de usuario y llaves de repuesto',
            'Vehículo libre de multas y partes policiales',
            'Se acepta el estado actual conocido por el comprador',
            'Condición personalizada'
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
        get_templates: '/api/templates/promesa-compraventa'
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
            invalid_date: 'La fecha ingresada no es válida',
            invalid_price: 'El precio debe estar entre $100.000 y $999.999.999',
            invalid_text_length: 'El texto debe tener entre 10 y 2000 caracteres',
            connection_error: 'Error de conexión. Verifique su conexión a internet.',
            camera_access_denied: 'Acceso a la cámara denegado',
            file_too_large: 'El archivo es muy grande (máximo 5MB)',
            invalid_file_type: 'Tipo de archivo no válido',
            same_person_error: 'El vendedor y comprador no pueden ser la misma persona'
        },
        warnings: {
            unsaved_changes: 'Tiene cambios sin guardar. ¿Desea continuar?',
            clear_form: '¿Está seguro de que desea limpiar todos los campos?',
            incomplete_data: 'Complete los datos antes de firmar',
            missing_signatures: 'Faltan firmas digitales por aplicar',
            missing_photos: 'Faltan fotos del carnet por capturar',
            same_person_warning: 'El vendedor y comprador parecen ser la misma persona',
            low_price_warning: 'El precio parece bajo para un vehículo. Verifique el monto.',
            future_date_warning: 'La fecha de entrega está muy lejos en el futuro'
        },
        info: {
            form_restored: 'Formulario restaurado desde guardado automático',
            rut_formatted: 'Formato de RUT aplicado',
            patente_formatted: 'Formato de patente aplicado',
            price_formatted: 'Precio formateado correctamente',
            camera_ready: 'Cámara lista para capturar',
            photo_captured: 'Foto capturada correctamente'
        }
    },
    
    // Configuración de tema/apariencia
    THEME: {
        primary_color: '#3b82f6',
        secondary_color: '#10b981',
        accent_color: '#f59e0b',
        background_gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
        text_colors: {
            primary: '#e2e8f0',
            secondary: '#cbd5e0',
            muted: '#a0aec0'
        }
    },
    
    // Configuración específica del documento
    DOCUMENT: {
        title: 'PROMESA DE COMPRAVENTA DE VEHÍCULO MOTORIZADO',
        subtitle: 'Contrato de promesa bilateral',
        type: 'vehicle_sale_promise',
        version: '1.0.0',
        template_id: 'promesa_compraventa_vehiculo',
        
        // Textos legales estándar
        legal_texts: {
            clausula_saneamiento: 'El vehículo se promete vender en el estado en que actualmente se encuentra, que es conocido del promitente comprador, con todos sus accesorios, con sus derechos, respondiendo el promitente vendedor por el saneamiento conforme a la ley.',
            
            clausula_exclusividad: 'El promitente vendedor asume la obligación de no vender, ceder, prendar, permutar, arrendar, dar en pago ni ejecutar acto jurídico de ninguna naturaleza sobre el referido bien, a menos que el promitente comprador lo autorice por escrito; caso contrario, deberá restituir íntegramente con intereses y reajustes lo que hubiere recibido a cuenta del precio, y sin perjuicio del ejercicio de las acciones judiciales que correspondan.',
            
            clausula_incumplimiento: 'Si llegado el plazo señalado y cumplidas las condiciones exigidas para la celebración del contrato de compraventa definitivo, alguna de las partes se negare a suscribirlo, la parte incumplidora deberá indemnizar a la otra parte, dentro de los 5 días siguientes a la fecha de término del contrato, la suma equivalente al 10% del precio total, que se entenderá como multa o cláusula penal.',
            
            clausula_jurisdiccion: 'Para todos los efectos legales que puedan derivar del presente contrato las partes fijan su domicilio en la comuna donde se celebra este contrato y se someten a la Jurisdicción de sus Tribunales de Justicia.',
            
            clausula_entrega: 'La entrega del vehículo y sus llaves se efectuará en la fecha acordada, recibiendo el promitente comprador a entera satisfacción.',
            
            clausula_transferencia: 'La transferencia de dominio en el Registro de Vehículos Motorizados se efectuará dentro de los 30 días siguientes a la fecha de la venta definitiva.'
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
     * Valida patente chilena
     * @param {string} patente - Patente a validar
     * @returns {boolean} True si es válida
     */
    validatePatente(patente) {
        const cleanPatente = patente.replace(/[^A-Z0-9]/g, '').toUpperCase();
        
        // Formato antiguo: AA1234 o nuevo: AAAA12
        const oldFormat = /^[A-Z]{2}\d{4}$/;
        const newFormat = /^[A-Z]{4}\d{2}$/;
        
        return oldFormat.test(cleanPatente) || newFormat.test(cleanPatente);
    },
    
    /**
     * Formatea patente chilena
     * @param {string} patente - Patente sin formato
     * @returns {string} Patente formateada
     */
    formatPatente(patente) {
        const cleanPatente = patente.replace(/[^A-Z0-9]/g, '').toUpperCase();
        
        if (cleanPatente.length === 6) {
            // Formato antiguo AA1234 -> AA-12-34
            if (/^[A-Z]{2}\d{4}$/.test(cleanPatente)) {
                return cleanPatente.slice(0, 2) + '-' + cleanPatente.slice(2, 4) + '-' + cleanPatente.slice(4);
            }
            // Formato nuevo AAAA12 -> AAAA-12
            if (/^[A-Z]{4}\d{2}$/.test(cleanPatente)) {
                return cleanPatente.slice(0, 4) + '-' + cleanPatente.slice(4);
            }
        }
        
        return cleanPatente;
    },
    
    /**
     * Valida precio del vehículo
     * @param {number} price - Precio a validar
     * @returns {boolean} True si es válido
     */
    validatePrice(price) {
        const numPrice = parseFloat(price);
        return !isNaN(numPrice) && 
               numPrice >= this.get('VALIDATION.min_price') && 
               numPrice <= this.get('VALIDATION.max_price');
    },
    
    /**
     * Formatea precio con separadores de miles
     * @param {number} price - Precio a formatear
     * @returns {string} Precio formateado
     */
    formatPrice(price) {
        return new Intl.NumberFormat('es-CL').format(price);
    },
    
    /**
     * Convierte número a palabras (para el PDF)
     * @param {number} number - Número a convertir
     * @returns {string} Número en palabras
     */
    numberToWords(number) {
        const ones = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
        const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
        const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
        
        if (number === 0) return 'cero';
        if (number === 100) return 'cien';
        
        let result = '';
        
        if (number >= 1000000) {
            const millions = Math.floor(number / 1000000);
            result += millions === 1 ? 'un millón ' : this.numberToWords(millions) + ' millones ';
            number %= 1000000;
        }
        
        if (number >= 1000) {
            const thousands = Math.floor(number / 1000);
            result += thousands === 1 ? 'mil ' : this.numberToWords(thousands) + ' mil ';
            number %= 1000;
        }
        
        if (number >= 100) {
            result += hundreds[Math.floor(number / 100)] + ' ';
            number %= 100;
        }
        
        if (number >= 20) {
            result += tens[Math.floor(number / 10)];
            if (number % 10 !== 0) {
                result += ' y ' + ones[number % 10];
            }
        } else if (number >= 10) {
            const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
            result += teens[number - 10];
        } else if (number > 0) {
            result += ones[number];
        }
        
        return result.trim();
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

console.log('🔧 Configuración del Sistema de Promesa de Compraventa cargada');
console.log('📋 Campos requeridos:', CONFIG.VALIDATION.required_fields.length);
console.log('🏙️ Ciudades disponibles:', CONFIG.OPTIONS.ciudades_chile.length);
console.log('🚗 Marcas de vehículos:', CONFIG.OPTIONS.marcas_vehiculo.length);