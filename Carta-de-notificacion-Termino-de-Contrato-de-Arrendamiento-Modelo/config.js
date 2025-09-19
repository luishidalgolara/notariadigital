// ===== CONFIGURACIÓN DEL SISTEMA DE NOTARÍA ONLINE =====

/**
 * Configuración general del sistema
 */
const CONFIG = {
    // Información de la empresa/notaría
    COMPANY: {
        name: 'Notaría Online Chile',
        address: 'Santiago, Chile',
        phone: '+56 2 2XXX XXXX',
        email: 'contacto@notariaonline.cl',
        website: 'www.notariaonline.cl'
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
            'nombreArrendador', 'nacionalidadArrendador', 'estadoCivilArrendador', 
            'profesionArrendador', 'rutArrendador', 'ciudadArrendador', 
            'domicilioArrendador', 'comunaArrendador',
            'nombreArrendatario', 'nacionalidadArrendatario', 'estadoCivilArrendatario',
            'profesionArrendatario', 'rutArrendatario', 'ciudadArrendatario',
            'domicilioArrendatario', 'comunaArrendatario',
            'fechaContrato', 'fechaAnexo', 'direccionInmueble', 'clausulaIncluir'
        ],
        rut_pattern: /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,
        min_clause_length: 10,
        max_clause_length: 1000
    },
    
    // Opciones predefinidas para formularios
    OPTIONS: {
        nacionalidades: [
            { value: 'chilena', label: 'Chilena' },
            { value: 'argentina', label: 'Argentina' },
            { value: 'peruana', label: 'Peruana' },
            { value: 'boliviana', label: 'Boliviana' },
            { value: 'colombiana', label: 'Colombiana' },
            { value: 'venezolana', label: 'Venezolana' },
            { value: 'ecuatoriana', label: 'Ecuatoriana' },
            { value: 'brasileña', label: 'Brasileña' },
            { value: 'uruguaya', label: 'Uruguaya' },
            { value: 'paraguaya', label: 'Paraguaya' },
            { value: 'otra', label: 'Otra' }
        ],
        
        estados_civiles: [
            { value: 'soltero(a)', label: 'Soltero(a)' },
            { value: 'casado(a)', label: 'Casado(a)' },
            { value: 'divorciado(a)', label: 'Divorciado(a)' },
            { value: 'separado(a)', label: 'Separado(a)' },
            { value: 'viudo(a)', label: 'Viudo(a)' },
            { value: 'conviviente civil', label: 'Conviviente Civil' }
        ],
        
        profesiones_comunes: [
            'Ingeniero Civil', 'Contador Auditor', 'Abogado', 'Médico', 'Profesor',
            'Arquitecto', 'Psicólogo', 'Enfermero(a)', 'Administrador', 'Economista',
            'Periodista', 'Diseñador', 'Comerciante', 'Empresario', 'Jubilado(a)',
            'Estudiante', 'Dueña de casa', 'Técnico', 'Funcionario público'
        ],
        
        comunas_santiago: [
            'Santiago', 'Providencia', 'Las Condes', 'Vitacura', 'Ñuñoa',
            'La Reina', 'Macul', 'Peñalolén', 'La Florida', 'Puente Alto',
            'San Miguel', 'San Joaquín', 'La Granja', 'La Pintana', 'El Bosque',
            'Pedro Aguirre Cerda', 'Lo Espejo', 'Estación Central', 'Maipú',
            'Pudahuel', 'Cerro Navia', 'Lo Prado', 'Quinta Normal', 'Independencia',
            'Recoleta', 'Conchalí', 'Huechuraba', 'Quilicura'
        ]
    },
    
    // Configuración de autogurdado
    AUTOSAVE: {
        enabled: true,
        interval: 30000, // 30 segundos
        key: 'notariaOnlineForm'
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
        get_templates: '/api/templates'
    },
    
    // Configuración de seguridad
    SECURITY: {
        max_file_size: 5 * 1024 * 1024, // 5MB
        allowed_file_types: ['pdf', 'doc', 'docx'],
        session_timeout: 30 * 60 * 1000, // 30 minutos
        max_attempts: 3
    },
    
    // Textos y mensajes predefinidos
    MESSAGES: {
        success: {
            pdf_generated: '¡PDF generado exitosamente!',
            form_saved: 'Formulario guardado correctamente',
            form_cleared: 'Formulario limpiado correctamente'
        },
        errors: {
            validation_failed: 'Por favor complete todos los campos requeridos',
            pdf_generation_failed: 'Error al generar el PDF. Intente nuevamente.',
            invalid_rut: 'El RUT ingresado no es válido',
            connection_error: 'Error de conexión. Verifique su conexión a internet.'
        },
        warnings: {
            unsaved_changes: 'Tiene cambios sin guardar. ¿Desea continuar?',
            clear_form: '¿Está seguro de que desea limpiar todos los campos?'
        }
    },
    
    // Configuración de tema/apariencia
    THEME: {
        primary_color: '#3498db',
        secondary_color: '#2ecc71',
        accent_color: '#e74c3c',
        background_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        text_colors: {
            primary: '#2c3e50',
            secondary: '#34495e',
            muted: '#7f8c8d'
        }
    },
    
    // Configuración de analytics (opcional)
    ANALYTICS: {
        enabled: false,
        google_analytics_id: 'GA-XXXXXXXXX',
        track_form_completion: true,
        track_pdf_generation: true
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
            'VALIDATION.required_fields'
        ];
        
        return required.every(path => this.get(path) !== undefined);
    },
    
    /**
     * Carga configuración desde localStorage
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('notaria_config');
            if (saved) {
                const config = JSON.parse(saved);
                Object.assign(CONFIG, config);
            }
        } catch (error) {
            console.warn('No se pudo cargar configuración guardada:', error);
        }
    },
    
    /**
     * Guarda configuración en localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('notaria_config', JSON.stringify(CONFIG));
        } catch (error) {
            console.warn('No se pudo guardar configuración:', error);
        }
    }
};

// Exportar configuración para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ConfigUtils };
} else {
    window.CONFIG = CONFIG;
    window.ConfigUtils = ConfigUtils;
}

// Auto-cargar configuración guardada al inicializar
ConfigUtils.loadFromStorage();