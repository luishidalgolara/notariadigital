// ========================================
// 📋 CONFIGURACIÓN DEL SISTEMA DE AVISO DE TÉRMINO DE CONTRATO
// ========================================

const CONFIG = {
    // ===== CONFIGURACIÓN DEL SISTEMA =====
    SYSTEM: {
        name: 'Sistema de Aviso de Término de Contrato',
        version: '2.0.0',
        environment: 'production'
    },

    // ===== CONFIGURACIÓN DE VALIDACIONES =====
    VALIDATION: {
        // Validación de RUT
        rut_pattern: /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,
        rut_min_length: 8,
        rut_max_length: 12,
        
        // Validación de fechas
        min_date: '1900-01-01',
        max_date: '2050-12-31',
        
        // Validación de sueldos
        min_salary: 350000, // Sueldo mínimo aproximado en Chile
        max_salary: 50000000, // Límite razonable para validación
        
        // Validación de nombres
        name_min_length: 2,
        name_max_length: 100,
        name_pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        
        // Validación de campos de texto
        text_min_length: 5,
        text_max_length: 1000,
        
        // Validación de direcciones
        address_min_length: 5,
        address_max_length: 200
    },

    // ===== CONFIGURACIÓN DE DOCUMENTOS =====
    DOCUMENT: {
        // Configuración de PDF
        pdf_config: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        },
        
        // Textos legales
        legal_texts: {
            nota_legal: 'Este aviso debe entregarse personalmente al trabajador, quien deberá firmar una copia del mismo, o enviarse por Correo Certificado al último domicilio que tiene registrado la empresa, en el plazo de tres días hábiles, o seis días hábiles cuando se invoque causa fortuita o fuerza mayor, ambos contado desde que deja de pertenecer a la empresa, considerándose el sábado como día hábil, o de treinta días a lo menos cuando sea aplicada como causal las señaladas en el Artículo 161 del Código del Trabajo. Copia de este aviso debe remitirse a la Inspección del Trabajo, en los mismos plazos señalados.'
        },
        
        // Plantillas de texto
        templates: {
            header: 'AVISO DE TÉRMINO DE CONTRATO DE TRABAJO',
            subtitle: 'Notificación Legal',
            greeting: 'Estimado señor(a):',
            closing: 'Saluda a usted,'
        }
    },

    // ===== CONFIGURACIÓN DE SEGURIDAD =====
    SECURITY: {
        // Límites de archivos
        max_file_size: 5 * 1024 * 1024, // 5MB
        allowed_image_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
        max_signature_width: 800,
        max_signature_height: 400,
        
        // Configuración de procesamiento de imágenes
        image_quality: 0.8,
        signature_background_threshold: 160,
        
        // Timeouts
        camera_timeout: 30000, // 30 segundos
        processing_timeout: 15000, // 15 segundos
        upload_timeout: 10000 // 10 segundos
    },

    // ===== CONFIGURACIÓN DE AUTOGUARDADO =====
    AUTOSAVE: {
        enabled: true,
        interval: 30000, // 30 segundos
        key: 'aviso_termino_autosave',
        max_versions: 5
    },

    // ===== CONFIGURACIÓN DE INTERFAZ =====
    UI: {
        // Animaciones
        animation_duration: 300,
        transition_timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        
        // Notificaciones
        notification_duration: 3000,
        notification_position: 'top-right',
        
        // Progreso
        progress_update_interval: 100,
        
        // Temas
        default_theme: 'dark',
        available_themes: ['dark', 'light']
    },

    // ===== CONFIGURACIÓN DE FORMULARIOS =====
    FORMS: {
        // Campos requeridos
        required_fields: [
            'ciudadAviso', 'fechaAviso', 'nombreEmpleador', 'rutEmpleador',
            'domicilioEmpleador', 'comunaEmpleador', 'ciudadEmpleador',
            'representanteLegal', 'rutRepresentante', 'nombreTrabajador',
            'rutTrabajador', 'domicilioTrabajador', 'comunaTrabajador',
            'ciudadTrabajador', 'cargoTrabajador', 'fechaInicioContrato',
            'tipoContrato', 'jornadaLaboral', 'fechaTermino', 'articuloCodigo',
            'tipoCausal', 'descripcionCausal', 'hechosFundamento',
            'estadoCotizaciones', 'certificadoCotizaciones'
        ],
        
        // Campos opcionales
        optional_fields: [
            'areaTrabajador', 'sueldoBase', 'observacionesContrato',
            'numeroInciso', 'formaEntrega', 'inspeccionTrabajo',
            'observacionesAdicionales'
        ],
        
        // Validaciones especiales
        special_validations: {
            rut_fields: ['rutEmpleador', 'rutRepresentante', 'rutTrabajador'],
            date_fields: ['fechaAviso', 'fechaInicioContrato', 'fechaTermino'],
            text_fields: ['descripcionCausal', 'hechosFundamento'],
            numeric_fields: ['sueldoBase']
        }
    },

    // ===== ARTÍCULOS DEL CÓDIGO DEL TRABAJO =====
    LABOR_CODE: {
        articles: {
            '159': {
                title: 'Mutuo acuerdo',
                description: 'Mutuo acuerdo de las partes',
                requires_advance_notice: false,
                severance_pay: false
            },
            '160': {
                title: 'Vencimiento del plazo',
                description: 'Vencimiento del plazo convenido para la duración del contrato',
                requires_advance_notice: false,
                severance_pay: false
            },
            '161': {
                title: 'Necesidades de la empresa',
                description: 'Necesidades de la empresa, establecimiento o servicio',
                requires_advance_notice: true,
                advance_notice_days: 30,
                severance_pay: true
            },
            '162': {
                title: 'Desahucio del empleador',
                description: 'Desahucio escrito del empleador',
                requires_advance_notice: true,
                advance_notice_days: 30,
                severance_pay: true
            },
            '163': {
                title: 'Renuncia del trabajador',
                description: 'Renuncia del trabajador',
                requires_advance_notice: false,
                severance_pay: false
            },
            '164': {
                title: 'Muerte del trabajador',
                description: 'Muerte del trabajador',
                requires_advance_notice: false,
                severance_pay: false
            },
            '165': {
                title: 'Caso fortuito o fuerza mayor',
                description: 'Caso fortuito o fuerza mayor',
                requires_advance_notice: false,
                severance_pay: false
            }
        }
    },

    // ===== CONFIGURACIÓN DE ERRORES =====
    ERRORS: {
        codes: {
            VALIDATION_ERROR: 'VAL_001',
            NETWORK_ERROR: 'NET_001',
            FILE_ERROR: 'FILE_001',
            PROCESSING_ERROR: 'PROC_001',
            CAMERA_ERROR: 'CAM_001',
            PDF_ERROR: 'PDF_001'
        },
        
        messages: {
            VAL_001: 'Error de validación en los datos del formulario',
            NET_001: 'Error de conexión de red',
            FILE_001: 'Error al procesar el archivo',
            PROC_001: 'Error durante el procesamiento',
            CAM_001: 'Error al acceder a la cámara',
            PDF_001: 'Error al generar el documento PDF'
        }
    },

    // ===== MESES EN ESPAÑOL =====
    MONTHS: [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ],

    // ===== DÍAS DE LA SEMANA =====
    WEEKDAYS: [
        'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
    ],

    // ===== CONFIGURACIÓN DE REGIONES CHILENAS =====
    REGIONS: {
        'Arica y Parinacota': ['Arica', 'Camarones', 'Putre', 'General Lagos'],
        'Tarapacá': ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Camiña', 'Colchane', 'Huara', 'Pica'],
        'Antofagasta': ['Antofagasta', 'Mejillones', 'Sierra Gorda', 'Taltal', 'Calama', 'Ollagüe', 'San Pedro de Atacama', 'Tocopilla', 'María Elena'],
        'Atacama': ['Copiapó', 'Caldera', 'Tierra Amarilla', 'Chañaral', 'Diego de Almagro', 'Vallenar', 'Alto del Carmen', 'Freirina', 'Huasco'],
        'Coquimbo': ['La Serena', 'Coquimbo', 'Andacollo', 'La Higuera', 'Paiguano', 'Vicuña', 'Illapel', 'Canela', 'Los Vilos', 'Salamanca', 'Ovalle', 'Combarbalá', 'Monte Patria', 'Punitaqui', 'Río Hurtado'],
        'Valparaíso': ['Valparaíso', 'Casablanca', 'Concón', 'Juan Fernández', 'Puchuncaví', 'Quintero', 'Viña del Mar', 'Isla de Pascua', 'Los Andes', 'Calle Larga', 'Rinconada', 'San Esteban', 'La Ligua', 'Cabildo', 'Papudo', 'Petorca', 'Zapallar', 'Quillota', 'Calera', 'Hijuelas', 'La Cruz', 'Nogales', 'San Antonio', 'Algarrobo', 'Cartagena', 'El Quisco', 'El Tabo', 'Santo Domingo', 'San Felipe', 'Catemu', 'Llaillay', 'Panquehue', 'Putaendo', 'Santa María', 'Quilpué', 'Limache', 'Olmué', 'Villa Alemana'],
        'Metropolitana': ['Santiago', 'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central', 'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Joaquín', 'San Miguel', 'San Ramón', 'Vitacura', 'Puente Alto', 'Pirque', 'San José de Maipo', 'Colina', 'Lampa', 'Tiltil', 'San Bernardo', 'Buin', 'Calera de Tango', 'Paine', 'Melipilla', 'Alhué', 'Curacaví', 'María Pinto', 'San Pedro', 'Talagante', 'El Monte', 'Isla de Maipo', 'Padre Hurtado', 'Peñaflor'],
        'O\'Higgins': ['Rancagua', 'Codegua', 'Coinco', 'Coltauco', 'Doñihue', 'Graneros', 'Las Cabras', 'Machalí', 'Malloa', 'Mostazal', 'Olivar', 'Peumo', 'Pichidegua', 'Quinta de Tilcoco', 'Rengo', 'Requínoa', 'San Vicente', 'Pichilemu', 'La Estrella', 'Litueche', 'Marchihue', 'Navidad', 'Paredones', 'San Fernando', 'Chépica', 'Chimbarongo', 'Lolol', 'Nancagua', 'Palmilla', 'Peralillo', 'Placilla', 'Pumanque', 'Santa Cruz'],
        'Maule': ['Talca', 'Constitución', 'Curepto', 'Empedrado', 'Maule', 'Pelarco', 'Pencahue', 'Río Claro', 'San Clemente', 'San Rafael', 'Cauquenes', 'Chanco', 'Pelluhue', 'Curicó', 'Hualañé', 'Licantén', 'Molina', 'Rauco', 'Romeral', 'Sagrada Familia', 'Teno', 'Vichuquén', 'Linares', 'Colbún', 'Longaví', 'Parral', 'Retiro', 'San Javier', 'Villa Alegre', 'Yerbas Buenas'],
        'Ñuble': ['Chillán', 'Bulnes', 'Cobquecura', 'Coelemu', 'Coihueco', 'Chillán Viejo', 'El Carmen', 'Ninhue', 'Ñiquén', 'Pemuco', 'Pinto', 'Portezuelo', 'Quillón', 'Quirihue', 'Ránquil', 'San Carlos', 'San Fabián', 'San Ignacio', 'San Nicolás', 'Treguaco', 'Yungay'],
        'Biobío': ['Concepción', 'Coronel', 'Chiguayante', 'Florida', 'Hualqui', 'Lota', 'Penco', 'San Pedro de la Paz', 'Santa Juana', 'Talcahuano', 'Tomé', 'Hualpén', 'Lebu', 'Arauco', 'Cañete', 'Contulmo', 'Curanilahue', 'Los Álamos', 'Tirúa', 'Los Ángeles', 'Antuco', 'Cabrero', 'Laja', 'Mulchén', 'Nacimiento', 'Negrete', 'Quilaco', 'Quilleco', 'San Rosendo', 'Santa Bárbara', 'Tucapel', 'Yumbel', 'Alto Biobío'],
        'Araucanía': ['Temuco', 'Carahue', 'Cunco', 'Curarrehue', 'Freire', 'Galvarino', 'Gorbea', 'Lautaro', 'Loncoche', 'Melipeuco', 'Nueva Imperial', 'Padre Las Casas', 'Perquenco', 'Pitrufquén', 'Pucón', 'Saavedra', 'Teodoro Schmidt', 'Toltén', 'Vilcún', 'Villarrica', 'Cholchol', 'Angol', 'Collipulli', 'Curacautín', 'Ercilla', 'Lonquimay', 'Los Sauces', 'Lumaco', 'Purén', 'Renaico', 'Traiguén', 'Victoria'],
        'Los Ríos': ['Valdivia', 'Corral', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco', 'Panguipulli', 'La Unión', 'Futrono', 'Lago Ranco', 'Río Bueno'],
        'Los Lagos': ['Puerto Montt', 'Calbuco', 'Cochamó', 'Fresia', 'Frutillar', 'Los Muermos', 'Llanquihue', 'Maullín', 'Puerto Varas', 'Castro', 'Ancud', 'Chonchi', 'Curaco de Vélez', 'Dalcahue', 'Puqueldón', 'Queilén', 'Quellón', 'Quemchi', 'Quinchao', 'Osorno', 'Puerto Octay', 'Purranque', 'Puyehue', 'Río Negro', 'San Juan de la Costa', 'San Pablo', 'Chaitén', 'Futaleufú', 'Hualaihué', 'Palena'],
        'Aysén': ['Coyhaique', 'Lago Verde', 'Aysén', 'Cisnes', 'Guaitecas', 'Cochrane', 'O\'Higgins', 'Tortel', 'Chile Chico', 'Río Ibáñez'],
        'Magallanes': ['Punta Arenas', 'Laguna Blanca', 'Río Verde', 'San Gregorio', 'Cabo de Hornos', 'Antártica', 'Porvenir', 'Primavera', 'Timaukel', 'Natales', 'Torres del Paine']
    }
};

// ===== UTILIDADES DE CONFIGURACIÓN =====
const ConfigUtils = {
    /**
     * Valida un RUT chileno
     * @param {string} rut - RUT a validar
     * @returns {boolean} - True si el RUT es válido
     */
    validateRUT: function(rut) {
        if (!rut || typeof rut !== 'string') return false;
        
        // Remover puntos y guión
        const cleanRut = rut.replace(/\./g, '').replace('-', '');
        
        if (cleanRut.length < 8 || cleanRut.length > 9) return false;
        
        const body = cleanRut.slice(0, -1);
        const dv = cleanRut.slice(-1).toLowerCase();
        
        // Validar que el cuerpo sean solo números
        if (!/^\d+$/.test(body)) return false;
        
        // Calcular dígito verificador
        let sum = 0;
        let multiplier = 2;
        
        for (let i = body.length - 1; i >= 0; i--) {
            sum += parseInt(body[i]) * multiplier;
            multiplier = multiplier === 7 ? 2 : multiplier + 1;
        }
        
        const expectedDv = 11 - (sum % 11);
        let calculatedDv;
        
        if (expectedDv === 11) calculatedDv = '0';
        else if (expectedDv === 10) calculatedDv = 'k';
        else calculatedDv = expectedDv.toString();
        
        return dv === calculatedDv;
    },

    /**
     * Formatea un RUT chileno
     * @param {string} rut - RUT a formatear
     * @returns {string} - RUT formateado
     */
    formatRUT: function(rut) {
        if (!rut) return '';
        
        // Remover caracteres no válidos
        const cleaned = rut.replace(/[^\dkK]/g, '');
        
        if (cleaned.length <= 1) return cleaned;
        
        const body = cleaned.slice(0, -1);
        const dv = cleaned.slice(-1);
        
        // Formatear con puntos
        let formatted = '';
        for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
            if (j > 0 && j % 3 === 0) formatted = '.' + formatted;
            formatted = body[i] + formatted;
        }
        
        return formatted + '-' + dv.toUpperCase();
    },

    /**
     * Valida una fecha
     * @param {string} date - Fecha a validar (formato YYYY-MM-DD)
     * @returns {boolean} - True si la fecha es válida
     */
    validateDate: function(date) {
        if (!date) return false;
        
        const dateObj = new Date(date);
        const minDate = new Date(CONFIG.VALIDATION.min_date);
        const maxDate = new Date(CONFIG.VALIDATION.max_date);
        
        return dateObj instanceof Date && 
               !isNaN(dateObj) && 
               dateObj >= minDate && 
               dateObj <= maxDate;
    },

    /**
     * Valida un nombre
     * @param {string} name - Nombre a validar
     * @returns {boolean} - True si el nombre es válido
     */
    validateName: function(name) {
        if (!name || typeof name !== 'string') return false;
        
        const trimmed = name.trim();
        return trimmed.length >= CONFIG.VALIDATION.name_min_length &&
               trimmed.length <= CONFIG.VALIDATION.name_max_length &&
               CONFIG.VALIDATION.name_pattern.test(trimmed);
    },

    /**
     * Valida un sueldo
     * @param {number} salary - Sueldo a validar
     * @returns {boolean} - True si el sueldo es válido
     */
    validateSalary: function(salary) {
        if (typeof salary !== 'number' || isNaN(salary)) return false;
        
        return salary >= CONFIG.VALIDATION.min_salary &&
               salary <= CONFIG.VALIDATION.max_salary;
    },

    /**
     * Formatea un precio en pesos chilenos
     * @param {number} amount - Cantidad a formatear
     * @returns {string} - Precio formateado
     */
    formatPrice: function(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) return '$0';
        
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Obtiene la configuración de un artículo del código del trabajo
     * @param {string} articleNumber - Número del artículo
     * @returns {object|null} - Configuración del artículo o null si no existe
     */
    getLaborCodeArticle: function(articleNumber) {
        return CONFIG.LABOR_CODE.articles[articleNumber] || null;
    },

    /**
     * Obtiene las comunas de una región
     * @param {string} region - Nombre de la región
     * @returns {array} - Array de comunas o array vacío si no existe
     */
    getCommunesByRegion: function(region) {
        return CONFIG.REGIONS[region] || [];
    },

    /**
     * Valida si un campo es requerido
     * @param {string} fieldName - Nombre del campo
     * @returns {boolean} - True si el campo es requerido
     */
    isRequiredField: function(fieldName) {
        return CONFIG.FORMS.required_fields.includes(fieldName);
    },

    /**
     * Obtiene el mensaje de error para un código
     * @param {string} errorCode - Código de error
     * @returns {string} - Mensaje de error
     */
    getErrorMessage: function(errorCode) {
        return CONFIG.ERRORS.messages[errorCode] || 'Error desconocido';
    }
};

// Exportar configuración globalmente
window.CONFIG = CONFIG;
window.ConfigUtils = ConfigUtils;

console.log('✅ Configuración del sistema cargada correctamente');