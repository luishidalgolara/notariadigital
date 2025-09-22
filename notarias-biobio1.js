// ============================================
// NOTARÍAS BIO BIO - PARTE 1: BASE Y UTILIDADES
// ============================================

const notariasData = {
    concepcion: [
        {
           name: "Primera Notaría de Concepción",
           notario: "Ricardo Salgado Sepúlveda",
           direccion: "Barros Arana N° 989, Concepción",
           telefono: "+56 41 210 7130",
           email: "notario@notariasalgado.cl",
           horario: "Lunes a Viernes 8:30-17:00",
           lat: -36.8270,
           lng: -73.0503,
           descripcion: "Primera Notaría de Concepción y Conservador de Minas, con amplia experiencia en servicios notariales.",
           banner: "BANNER1CP.png",
           fotos: [],
           serviciosOnline: ["Escrituras Públicas Digitales", "Poderes Especiales", "Legalizaciones", "Testamentos Online"]
        },
        {
            name: "Segunda Notaría de Concepción", 
            notario: "Pedro Hidalgo Sarzosa",
            direccion: "San Martín N° 906, Concepción",
            telefono: "+56 41 224 9068",
            email: "notaria@bambach.cl",
            horario: "Lunes a Viernes 8:30-17:00",
            lat: -36.8271,
            lng: -73.0502,
            descripcion: "Segunda Notaría de Concepción con servicios especializados en trámites civiles y comerciales.",
            banner: "BANNER2CP.png",
            fotos: [],
            serviciosOnline: ["Documentos Comerciales", "Constitución de Sociedades", "Poderes Digitales", "Certificados Online"]
        },
        {
            name: "Tercera Notaría de Concepción",
            notario: "Juan Espinosa Bancalari", 
            direccion: "O'Higgins N° 528, Concepción",
            telefono: "+56 41 279 6800",
            email: "escrituras@notariaespinosa.cl",
            horario: "Lunes a Viernes 8:30-17:00",
            lat: -36.8272,
            lng: -73.0504,
            descripcion: "Tercera Notaría de Concepción especializada en escrituras públicas y documentos legales.",
            banner: "BANNER3CP.png",
            fotos: [],
            serviciosOnline: ["Escrituras de Compraventa", "Mandatos Especiales", "Documentos Inmobiliarios", "Autorizaciones Digitales"]
        },
        {
            name: "Cuarta Notaría de Concepción",
            notario: "Heraclio Rojas Vergara",
            direccion: "O'Higgins N° 820, Concepción", 
            telefono: "+56 41 267 0526",
            email: "rojasnotariaconcepcion@hotmail.com",
            horario: "Lunes a Viernes 9:00-17:30, Sábados 9:00-13:00",
            lat: -36.8273,
            lng: -73.0505,
            website: "www.rojasnotaria.cl",
            descripcion: "Cuarta Notaría de Concepción con servicios de turno los sábados y atención especializada.",
            banner: "BANNER4CP.png",
            fotos: [],
            serviciosOnline: ["Servicios de Turno Digital", "Urgencias Notariales", "Poderes de Emergencia", "Documentos Express"]
        },
        {
            name: "Quinta Notaría de Concepción",
            notario: "Mauro Fabián Aroca Guerrero",
            direccion: "O'Higgins N° 599, Concepción",
            telefono: "+56 41 221 5089", 
            email: "contacto@quintanotariaconcepcion.cl",
            horario: "Lunes a Viernes 8:30-17:00",
            lat: -36.8274,
            lng: -73.0506,
            descripcion: "Quinta Notaría de Concepción con atención personalizada y servicios integrales.",
            banner: "BANNER5CP.png",
            fotos: [],
            serviciosOnline: ["Atención Personalizada Online", "Consultas Virtuales", "Documentos Integrales", "Asesoría Digital"]
        },
        {
            name: "Sexta Notaría de Concepción",
            notario: "Mario Patricio Aburto Contardo",
            direccion: "Colo-Colo N° 304 Oficina 101, Concepción",
            telefono: "+56 41 210 6640",
            email: "info@notariaaburto.cl", 
            horario: "Lunes a Viernes 8:30-17:00",
            lat: -36.8275,
            lng: -73.0507,
            descripcion: "Sexta Notaría de Concepción ubicada en el centro de la ciudad.",
            banner: "BANNER6CP.png",
            fotos: [],
            serviciosOnline: ["Documentos Centralizados", "Gestión Digital", "Trámites Remotos", "Firma Electrónica"]
        },
        {
            name: "Séptima Notaría de Concepción",
            notario: "Ramón García Carrasco",
            direccion: "Rengo N° 444, Concepción",
            telefono: "+56 41 244 3600",
            email: "infor@notariagarcia.cl",
            horario: "Lunes a Viernes 8:30-17:00", 
            lat: -36.8276,
            lng: -73.0508,
            website: "www.notariagarcia.cl",
            descripcion: "Séptima Notaría de Concepción con más de 20 servicios notariales y módulos virtuales de atención.",
            banner: "BANNER7CP.png",
            fotos: [],
            serviciosOnline: ["20+ Servicios Digitales", "Módulos Virtuales", "Plataforma Integral", "Automatización de Trámites", "Centro de Atención Virtual"]
        },
        {
            name: "Undécima Notaría de Concepción",
            notario: "René Marcelo Arriagada Basaur",
            direccion: "Cochrane N° 829, Concepción",
            telefono: "+56 41 339 04163",
            email: "11notariaconcepcion@gmail.com",
            horario: "Lunes a Viernes 8:30-17:00",
            lat: -36.8277,
            lng: -73.0509,
            website: "www.11notariaconcepcion.cl",
            descripcion: "Undécima Notaría de Concepción con servicios modernos y eficientes.",
            banner: "BANNER11CP.png",
            fotos: [],
            serviciosOnline: ["Servicios Modernos", "Eficiencia Digital", "Trámites Ágiles", "Tecnología Avanzada"]
        },
        {
            name: "Duodécima Notaría de Concepción",
            notario: "Juan Eduardo Avello San Martín",
            direccion: "Chacabuco N° 980, Concepción",
            telefono: "+56 41 273 0177",
            email: "info@notariaavello.cl",
            horario: "Lunes a Viernes 8:30-17:00",
            lat: -36.8278,
            lng: -73.0510,
            website: "www.notariaavello.cl",
            descripcion: "Duodécima Notaría de Concepción Centro con servicios integrales y atención especializada.",
            banner: "BANNER12CP.png",
            fotos: [],
            serviciosOnline: ["Servicios Integrales Online", "Atención Especializada", "Centro de Documentos", "Gestión Completa"]
        }
    ],
    sanpedro: [
        {
            name: "Novena Notaría de Concepción - San Pedro de la Paz",
            notario: "Rodrigo Rojas Castillo",
            direccion: "Avda. Michimalonco N° 1015, San Pedro de la Paz",
            telefono: "+56 41 279 1537",
            email: "contacto@notariasanpedrodelapaz.cl",
            horario: "Lunes a Viernes 8:30-16:00",
            lat: -36.8413,
            lng: -73.1057,
            website: "www.notariasanpedrodelapaz.cl",
            descripcion: "Notaría oficial de San Pedro de la Paz, brindando servicios notariales completos con más de 15 años de experiencia. Ubicada frente a supermercado con fácil acceso.",
            banner: "BANNER9SP.png",
            fotos: [],
            serviciosOnline: ["Notaría Digital Completa", "Experiencia 15+ Años", "Acceso Fácil y Rápido", "Servicios Especializados", "Atención Prioritaria", "Trámites Express"]
        }
    ],
    talcahuano: [
        {
            name: "Primera Notaría de Talcahuano",
            notario: "Omar Retamal Becerra",
            direccion: "Av. Colón N° 599, Talcahuano",
            telefono: "+56 41 313 2400",
            email: "notariaretamaltalcahuano@gmail.com",
            horario: "Lunes a Viernes 8:30-17:00",
            lat: -36.7236,
            lng: -73.1169,
            descripcion: "Primera Notaría de Talcahuano con amplia experiencia en servicios portuarios y navales.",
            banner: "BANNER1TALC.png",
            fotos: [],
            serviciosOnline: ["Servicios Portuarios", "Documentos Navales", "Trámites Marítimos", "Gestión Especializada"]
        },
        {
            name: "Segunda Notaría de Talcahuano",
            notario: "Gastón Santibáñez Torres",
            direccion: "J. Alessandri N° 3177 Loc.G-103 Mall El Trébol, Talcahuano",
            telefono: "+56 41 256 3797",
            email: "contacto@notariasantibanez.cl",
            horario: "Lunes a Viernes 8:30-17:00",
            lat: -36.7237,
            lng: -73.1170,
            website: "www.notariasantibanez.cl",
            descripcion: "Segunda Notaría de Talcahuano y Conservador de Minas, ubicada en Mall El Trébol.",
            banner: "",
            fotos: [],
            serviciosOnline: ["Conservador de Minas", "Ubicación Mall Trébol", "Acceso Comercial", "Servicios Integrados"]
        },
        {
            name: "Tercera Notaría de Talcahuano",
            notario: "Néstor Alejandro Avila Urrutia",
            direccion: "Covadonga N° 55, Talcahuano",
            telefono: "+56 41 254 7010",
            email: "contacto@notarianestoravila.cl",
            horario: "Lunes a Viernes 8:30-17:00",
            lat: -36.7238,
            lng: -73.1171,
            descripcion: "Tercera Notaría de Talcahuano y Archivero Judicial con servicios especializados.",
            banner: "",
            fotos: [],
            serviciosOnline: ["Archivero Judicial", "Servicios Especializados", "Gestión Judicial", "Documentos Legales"]
        }
    ],
    coronel: [
        {
            name: "Primera Notaría de Coronel",
            notario: "Gonzalo Camiruaga Pizarro",
            direccion: "Sotomayor N° 520, Coronel",
            telefono: "+56 41 271 4926",
            email: "contacto@primeranotariacoronel.cl",
            horario: "Lunes a Viernes 8:30-16:30 continuado",
            lat: -37.0317,
            lng: -73.1564,
            website: "www.primeranotariacoronel.cl",
            descripcion: "Primera Notaría de Coronel con servicios rápidos, eficaces y seguros. Acepta pagos con tarjeta débito, crédito y transferencia electrónica.",
            banner: "BANNER1CR.png",
            fotos: [],
            serviciosOnline: ["Servicios Rápidos y Seguros", "Pagos Digitales", "Tarjetas y Transferencias", "Gestión Eficaz"]
        },
        {
            name: "Segunda Notaría de Coronel",
            notario: "Gonzalo Ali Arcas",
            direccion: "Cochrane N° 130 Piso 2, Coronel",
            telefono: "+56 41 218 3731",
            email: "notaria.coronel@gmail.com",
            horario: "Lunes a Viernes 9:00-17:00, Sábados 10:00-13:00",
            lat: -37.0318,
            lng: -73.1565,
            website: "www.notaria-coronel.cl",
            descripcion: "Segunda Notaría de Coronel ubicada en el centro de la ciudad con atención los sábados.",
            banner: "BANNER2CR.png",
            fotos: [],
            serviciosOnline: ["Atención Sábados", "Centro Ciudad", "Horarios Extendidos", "Flexibilidad Total"]
        }
    ],
    chiguayante: [
        {
            name: "Octava Notaría de Concepción - Chiguayante",
            notario: "Rodrigo Wunkhaus Rigart",
            direccion: "Bernardo O'Higgins N° 2228, Chiguayante", 
            telefono: "+56 2 2516 6855",
            email: "notariochiguayante@gmail.com",
            horario: "Lunes a Viernes 8:30-17:00",
            lat: -36.9127,
            lng: -73.0294,
            descripcion: "Octava Notaría de Concepción con asiento en Chiguayante, atendiendo la comuna completa.",
            banner: "",
            fotos: [],
            serviciosOnline: ["Atención Comuna Completa", "Servicios Locales", "Gestión Comunitaria", "Trámites Vecinales"]
        }
    ],
    hualpen: [
        {
            name: "Cuarta Notaría de Talcahuano - Hualpén",
            notario: "Victor Toledo Machucha",
            direccion: "Autopista Concepción 9000 Loc. 22, Hualpén",
            telefono: "+56 9 9163 2867",
            email: "notario@notariahualpen.cl",
            horario: "Lunes a Viernes 8:30-17:00",
            lat: -36.7851,
            lng: -73.1614,
            descripcion: "Cuarta Notaría de Talcahuano con asiento en Hualpén, comuna moderna del Gran Concepción.",
            banner: "",
            fotos: [],
            serviciosOnline: ["Comuna Moderna", "Gran Concepción", "Servicios Actualizados", "Tecnología Moderna"]
        }
    ],
    tome: [
        {
            name: "Notaría de Tomé",
            notario: "Gonzalo Esteban Míguez Núñez",
            direccion: "Sotomayor N° 1265, Tomé",
            telefono: "+56 41 265 1330",
            email: "notariamiguez@gmail.com",
            horario: "Lunes a Viernes 8:30-17:00",
            lat: -36.6163,
            lng: -72.9569,
            descripcion: "Notaría de Tomé al servicio de la comuna costera con tradición textil.",
            banner: "BANNERTOME.png",
            fotos: [],
            serviciosOnline: ["Servicios Costeros", "Tradición Textil", "Comuna Especializada", "Gestión Local"]
        }
    ]
};

const comunaNames = {
    concepcion: "Concepción",
    sanpedro: "San Pedro de la Paz",
    talcahuano: "Talcahuano",
    coronel: "Coronel",
    chiguayante: "Chiguayante", 
    hualpen: "Hualpén",
    tome: "Tomé"
};

// Variables globales para estado
let currentState = {
    selectedComuna: null,
    currentNotarias: [],
    displayedNotarias: {},
    allNotarias: []
};

// Configuración de límites
const PHOTO_LIMITS = {
    BANNER: 1,
    GALLERY: 5,
    TOTAL: 6
};

const COMPRESSION_SETTINGS = {
    banner: {
        maxWidth: 1600,
        maxHeight: 400,
        quality: 0.92
    },
    gallery: {
        maxWidth: 1000,
        maxHeight: 750,
        quality: 0.88
    }
};

const PHOTO_SPECS = {
    banner: {
        optimal: { width: 1600, height: 400, ratio: 4 },
        acceptable: { minWidth: 1200, maxWidth: 2000, minHeight: 300, maxHeight: 500 },
        title: "Banner Principal",
        tips: "Usa imágenes horizontales de tu oficina, fachada o equipo. Mejor calidad: 1600x400px"
    },
    gallery: {
        optimal: { width: 1000, height: 750, ratio: 1.33 },
        acceptable: { minWidth: 800, maxWidth: 1200, minHeight: 600, maxHeight: 900 },
        title: "Fotos de Galería",
        tips: "Máximo 5 fotos - Interior de oficina, equipo de trabajo, servicios. Mejor calidad: 1000x750px"
    }
};

// Sistema de manejo de errores simplificado
const ErrorHandler = {
    log: (error, context = '') => {
        console.error(`[ERROR${context ? ' - ' + context : ''}]:`, error);
    },
    
    logWarning: (warning, context = '') => {
        console.warn(`[WARNING${context ? ' - ' + context : ''}]:`, warning);
    },
    
    handleAsync: async (asyncFn, context = '', fallback = null) => {
        try {
            return await asyncFn();
        } catch (error) {
            ErrorHandler.log(error, context);
            return fallback;
        }
    }
};

const DOMUtils = {
    safeGetElement: (selector, required = false) => {
        try {
            const element = document.getElementById(selector) || document.querySelector(selector);
            if (!element && required) {
                ErrorHandler.logWarning(`Elemento requerido no encontrado: ${selector}`, 'DOM');
            }
            return element;
        } catch (error) {
            ErrorHandler.log(error, `DOM Query: ${selector}`);
            return null;
        }
    },
    
    safeRemove: (element) => {
        try {
            if (element && element.parentElement) {
                element.remove();
                return true;
            }
        } catch (error) {
            ErrorHandler.log(error, 'DOM Remove');
        }
        return false;
    },
    
    safeSetStyle: (element, property, value) => {
        try {
            if (element && element.style) {
                element.style[property] = value;
                return true;
            }
        } catch (error) {
            ErrorHandler.log(error, 'DOM Style');
        }
        return false;
    }
};

// Sistema de debounce simplificado
const debounceMap = new Map();
const DebounceUtils = {
    debounce: (func, delay, key) => {
        return (...args) => {
            if (debounceMap.has(key)) {
                clearTimeout(debounceMap.get(key));
            }
            
            const timeoutId = setTimeout(() => {
                debounceMap.delete(key);
                func.apply(this, args);
            }, delay);
            
            debounceMap.set(key, timeoutId);
        };
    },
    
    clear: (key) => {
        if (debounceMap.has(key)) {
            clearTimeout(debounceMap.get(key));
            debounceMap.delete(key);
        }
    },
    
    clearAll: () => {
        debounceMap.forEach(timeoutId => clearTimeout(timeoutId));
        debounceMap.clear();
    }
};

// Sistema de gestión de memoria optimizado
const MemoryManager = {
    canvasCache: new Set(),
    imageCache: new Set(),
    eventListeners: new Map(),
    
    trackCanvas: (canvas) => {
        if (canvas instanceof HTMLCanvasElement) {
            MemoryManager.canvasCache.add(canvas);
        }
    },
    
    trackImage: (image) => {
        if (image instanceof Image) {
            MemoryManager.imageCache.add(image);
        }
    },
    
    cleanupCanvas: (canvas) => {
        try {
            if (canvas instanceof HTMLCanvasElement) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
                canvas.width = 1;
                canvas.height = 1;
                MemoryManager.canvasCache.delete(canvas);
            }
        } catch (error) {
            ErrorHandler.log(error, 'Canvas Cleanup');
        }
    },
    
    cleanupImage: (image) => {
        try {
            if (image instanceof Image) {
                if (image.src && image.src.startsWith('blob:')) {
                    URL.revokeObjectURL(image.src);
                }
                image.src = '';
                image.onload = null;
                image.onerror = null;
                MemoryManager.imageCache.delete(image);
            }
        } catch (error) {
            ErrorHandler.log(error, 'Image Cleanup');
        }
    },
    
    addEventListenerTracked: (element, event, handler, options = false) => {
        try {
            if (element && typeof element.addEventListener === 'function') {
                element.addEventListener(event, handler, options);
                
                const key = `${element.constructor.name}_${event}_${Date.now()}`;
                MemoryManager.eventListeners.set(key, {
                    element,
                    event,
                    handler,
                    options
                });
                
                return key;
            }
        } catch (error) {
            ErrorHandler.log(error, 'Event Listener Add');
        }
        return null;
    },
    
    removeEventListenerTracked: (key) => {
        try {
            const listener = MemoryManager.eventListeners.get(key);
            if (listener) {
                listener.element.removeEventListener(listener.event, listener.handler, listener.options);
                MemoryManager.eventListeners.delete(key);
                return true;
            }
        } catch (error) {
            ErrorHandler.log(error, 'Event Listener Remove');
        }
        return false;
    },
    
    cleanupAll: () => {
        MemoryManager.canvasCache.forEach(canvas => {
            MemoryManager.cleanupCanvas(canvas);
        });
        MemoryManager.canvasCache.clear();
        
        MemoryManager.imageCache.forEach(image => {
            MemoryManager.cleanupImage(image);
        });
        MemoryManager.imageCache.clear();
        
        MemoryManager.eventListeners.forEach((listener, key) => {
            MemoryManager.removeEventListenerTracked(key);
        });
        
        DebounceUtils.clearAll();
    }
};

// Sistema de storage optimizado
const StorageManager = {
    isAvailable: () => {
        try {
            const test = 'storage_test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            ErrorHandler.logWarning('localStorage no disponible', 'Storage');
            return false;
        }
    },
    
    getQuotaUsage: () => {
        if (!StorageManager.isAvailable()) {
            return { used: '0KB', quota: '0MB', percentage: '0%', bytesUsed: 0, bytesQuota: 0 };
        }
        
        try {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            
            const quota = 5 * 1024 * 1024; // 5MB estimado
            
            return {
                used: (total / 1024).toFixed(1) + 'KB',
                quota: (quota / 1024 / 1024).toFixed(1) + 'MB',
                percentage: ((total / quota) * 100).toFixed(1) + '%',
                bytesUsed: total,
                bytesQuota: quota
            };
        } catch (error) {
            ErrorHandler.log(error, 'Storage Usage');
            return { used: '0KB', quota: '0MB', percentage: '0%', bytesUsed: 0, bytesQuota: 0 };
        }
    },
    
    safeSetItem: (key, value) => {
        if (!StorageManager.isAvailable()) return false;
        
        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            
            const usage = StorageManager.getQuotaUsage();
            if (parseFloat(usage.percentage) > 90) {
                ErrorHandler.logWarning('Storage casi lleno', 'Storage');
                StorageManager.cleanOldData();
            }
            
            localStorage.setItem(key, stringValue);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                ErrorHandler.logWarning('Storage quota exceeded, cleaning old data', 'Storage');
                StorageManager.cleanOldData();
                try {
                    localStorage.setItem(key, stringValue);
                    return true;
                } catch (retryError) {
                    ErrorHandler.log(retryError, 'Storage Retry');
                    return false;
                }
            } else {
                ErrorHandler.log(error, 'Storage Set');
                return false;
            }
        }
    },
    
    safeGetItem: (key, defaultValue = null) => {
        if (!StorageManager.isAvailable()) return defaultValue;
        
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            
            try {
                return JSON.parse(item);
            } catch (parseError) {
                return item;
            }
        } catch (error) {
            ErrorHandler.log(error, `Storage Get: ${key}`);
            return defaultValue;
        }
    },
    
    safeRemoveItem: (key) => {
        if (!StorageManager.isAvailable()) return false;
        
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            ErrorHandler.log(error, `Storage Remove: ${key}`);
            return false;
        }
    },
    
    cleanOldData: () => {
        if (!StorageManager.isAvailable()) return 0;
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        let cleaned = 0;
        const keys = [];
        
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('custom_notaria_')) {
                    keys.push(key);
                }
            }
            
            keys.forEach(key => {
                try {
                    const data = StorageManager.safeGetItem(key);
                    if (data && data.lastModified) {
                        const lastModified = new Date(data.lastModified);
                        if (lastModified < thirtyDaysAgo) {
                            StorageManager.safeRemoveItem(key);
                            cleaned++;
                        }
                    }
                } catch (error) {
                    StorageManager.safeRemoveItem(key);
                    cleaned++;
                }
            });
        } catch (error) {
            ErrorHandler.log(error, 'Storage Clean');
        }
        
        return cleaned;
    }
};

// Función para obtener parámetros URL
function getURLParameter(name) {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    } catch (error) {
        ErrorHandler.log(error, 'getURLParameter');
        return null;
    }
}

// Funciones básicas de estado y storage
function generateNotariaId(notariaName) {
    try {
        if (!notariaName || typeof notariaName !== 'string') {
            ErrorHandler.logWarning('generateNotariaId: Nombre de notaría inválido', 'ID Generation');
            return 'notaria_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        }
        
        const id = notariaName.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/ñ/g, 'n')
            .replace(/[^a-z0-9\s]/g, '')
            .trim()
            .replace(/\s+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        
        const finalId = id || 'notaria_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        
        return finalId;
    } catch (error) {
        ErrorHandler.log(error, 'generateNotariaId');
        return 'notaria_error_' + Date.now();
    }
}

function getNotariaByIdFromState(notariaId) {
    try {
        if (!notariaId || typeof notariaId !== 'string') {
            ErrorHandler.logWarning('getNotariaByIdFromState: ID inválido', 'State Management');
            return null;
        }
        
        const notaria = currentState.displayedNotarias[notariaId];
        if (notaria) {
            return notaria;
        }
        
        return null;
    } catch (error) {
        ErrorHandler.log(error, 'getNotariaByIdFromState');
        return null;
    }
}

function getCustomNotariaData(notariaId) {
    try {
        if (!notariaId || typeof notariaId !== 'string') {
            return null;
        }
        
        const data = StorageManager.safeGetItem(`custom_notaria_${notariaId}`);
        return data;
    } catch (error) {
        ErrorHandler.log(error, 'getCustomNotariaData');
        return null;
    }
}

function saveCustomNotariaData(notariaId, customData) {
    try {
        if (!notariaId || typeof notariaId !== 'string' || !customData) {
            ErrorHandler.logWarning('saveCustomNotariaData: Parámetros inválidos', 'Storage');
            return false;
        }
        
        customData.lastModified = new Date().toISOString();
        
        const storageEstimate = StorageManager.getQuotaUsage();
        
        if (parseFloat(storageEstimate.percentage) > 85) {
            StorageManager.cleanOldData();
        }
        
        StorageManager.safeRemoveItem(`custom_notaria_${notariaId}`);
        
        const success = StorageManager.safeSetItem(`custom_notaria_${notariaId}`, customData);
        
        return success;
        
    } catch (error) {
        ErrorHandler.log(error, 'saveCustomNotariaData');
        return false;
    }
}

console.log('✅ Notarías Bio Bio - Base y Utilidades cargado correctamente');