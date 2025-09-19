// Variables globales para estado de navegación
let currentState = {
    selectedRegion: null,
    selectedComuna: null
};

// Mapeo de comunas para URLs
const comunaUrls = {
    'concepcion': 'notarias-biobio.html?comuna=concepcion',
    'sanpedro': 'notarias-biobio.html?comuna=sanpedro',
    'talcahuano': 'notarias-biobio.html?comuna=talcahuano',
    'coronel': 'notarias-biobio.html?comuna=coronel',
    'chiguayante': 'notarias-biobio.html?comuna=chiguayante',
    'hualpen': 'notarias-biobio.html?comuna=hualpen',
    'tome': 'notarias-biobio.html?comuna=tome'
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

// Sistema de manejo de errores simplificado
const ErrorHandler = {
    log: (error, context = '') => {
        console.error(`[ERROR${context ? ' - ' + context : ''}]:`, error);
    },
    
    logWarning: (warning, context = '') => {
        console.warn(`[WARNING${context ? ' - ' + context : ''}]:`, warning);
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

// ============================================
// FUNCIONES DEL ASISTENTE VIRTUAL
// ============================================

function openAssistant() {
    try {
        const modal = DOMUtils.safeGetElement('assistantModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevenir scroll del body
            
            // Agregar listener para cerrar con ESC
            document.addEventListener('keydown', handleEscapeKey);
            
            // Animación suave
            setTimeout(() => {
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.style.transform = 'translateY(0) scale(1)';
                    modalContent.style.opacity = '1';
                }
            }, 10);
            
            console.log('Asistente virtual abierto');
        }
    } catch (error) {
        ErrorHandler.log(error, 'openAssistant');
    }
}

function closeAssistant(event) {
    try {
        // Si se hace clic en el contenido del modal, no cerrar
        if (event && event.target.closest('.modal-content')) {
            return;
        }
        
        const modal = DOMUtils.safeGetElement('assistantModal');
        if (modal && modal.classList.contains('active')) {
            // Animación de salida
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.transform = 'translateY(30px) scale(0.95)';
                modalContent.style.opacity = '0';
            }
            
            // Remover clases y restaurar scroll después de la animación
            setTimeout(() => {
                modal.classList.remove('active');
                document.body.style.overflow = ''; // Restaurar scroll del body
                
                // Resetear estilos para la próxima apertura
                if (modalContent) {
                    modalContent.style.transform = '';
                    modalContent.style.opacity = '';
                }
            }, 300);
            
            // Remover listener de ESC
            document.removeEventListener('keydown', handleEscapeKey);
            
            console.log('Asistente virtual cerrado');
        }
    } catch (error) {
        ErrorHandler.log(error, 'closeAssistant');
    }
}

function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        closeAssistant();
    }
}

// ============================================
// FUNCIONES PRINCIPALES DE NAVEGACIÓN
// ============================================

function selectRegion(region) {
    try {
        if (region === 'biobio') {
            currentState.selectedRegion = region;
            currentState.selectedComuna = null;
            
            const regionSelection = DOMUtils.safeGetElement('regionSelection');
            const comunaSelection = DOMUtils.safeGetElement('comunaSelection');
            
            if (regionSelection) regionSelection.classList.add('hidden');
            if (comunaSelection) comunaSelection.classList.remove('hidden');
            
            updateBreadcrumb(['Inicio', 'Región del Bío Bío']);
        }
    } catch (error) {
        ErrorHandler.log(error, 'selectRegion');
    }
}

function selectComuna(comuna) {
    try {
        currentState.selectedComuna = comuna;
        
        // Verificar si existe la URL para la comuna
        if (comunaUrls[comuna]) {
            const comunaName = comunaNames[comuna];
            
            // Mostrar mensaje de redirección
            showBuscadorNotification(`Accediendo a notarías de ${comunaName}...`, 'info');
            
            // Redireccionar al archivo específico después de un breve delay
            setTimeout(() => {
                window.location.href = comunaUrls[comuna];
            }, 1000);
            
        } else {
            ErrorHandler.logWarning(`Comuna no encontrada: ${comuna}`, 'selectComuna');
            showBuscadorNotification('Comuna no disponible temporalmente', 'error');
        }
        
    } catch (error) {
        ErrorHandler.log(error, 'selectComuna');
        showBuscadorNotification('Error al acceder a la comuna', 'error');
    }
}

// Funciones de navegación y breadcrumb
function updateBreadcrumb(items) {
    try {
        const breadcrumb = DOMUtils.safeGetElement('breadcrumb');
        if (!breadcrumb) return;
        
        breadcrumb.innerHTML = items.map((item, index) => {
            if (index === 0) {
                return `<span class="breadcrumb-item" onclick="resetToRegion()">${item}</span>`;
            } else if (index === 1) {
                return `<span>→</span><span class="breadcrumb-item" onclick="resetToComuna()">${item}</span>`;
            } else {
                return `<span>→</span><span class="breadcrumb-item">${item}</span>`;
            }
        }).join(' ');
    } catch (error) {
        ErrorHandler.log(error, 'updateBreadcrumb');
    }
}

function resetToRegion() {
    try {
        currentState = {
            selectedRegion: null,
            selectedComuna: null
        };
        
        const regionSelection = DOMUtils.safeGetElement('regionSelection');
        const comunaSelection = DOMUtils.safeGetElement('comunaSelection');
        const header = DOMUtils.safeGetElement('.header');
        
        if (regionSelection) regionSelection.classList.remove('hidden');
        if (comunaSelection) comunaSelection.classList.add('hidden');
        if (header) header.classList.remove('hidden-content');
        
        updateBreadcrumb(['Inicio']);
    } catch (error) {
        ErrorHandler.log(error, 'resetToRegion');
    }
}

function resetToComuna() {
    try {
        currentState.selectedComuna = null;
        
        const comunaSelection = DOMUtils.safeGetElement('comunaSelection');
        const header = DOMUtils.safeGetElement('.header');
        
        if (comunaSelection) comunaSelection.classList.remove('hidden');
        if (header) header.classList.remove('hidden-content');
        
        updateBreadcrumb(['Inicio', 'Región del Bío Bío']);
    } catch (error) {
        ErrorHandler.log(error, 'resetToComuna');
    }
}

// Sistema de notificaciones optimizado
let buscadorNotificationTimeout = null;

function showBuscadorNotification(message, type = 'info') {
    try {
        if (buscadorNotificationTimeout) {
            clearTimeout(buscadorNotificationTimeout);
            buscadorNotificationTimeout = null;
        }
        
        const existingNotification = DOMUtils.safeGetElement('.buscador-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `buscador-notification buscador-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        const bgColor = type === 'success' ? '#10b981' : 
                       type === 'error' ? '#ef4444' : 
                       type === 'warning' ? '#f59e0b' : '#667eea';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 420px;
            font-family: 'Century Gothic', sans-serif;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            font-weight: 600;
        `;
        
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.style.cssText = `
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
                line-height: 1;
                margin-left: 10px;
            `;
        }
        
        const messageSpan = notification.querySelector('.notification-message');
        if (messageSpan) {
            messageSpan.style.cssText = `
                flex: 1;
                line-height: 1.4;
            `;
        }
        
        const content = notification.querySelector('.notification-content');
        if (content) {
            content.style.cssText = `
                display: flex;
                align-items: center;
                gap: 10px;
            `;
        }
        
        document.body.appendChild(notification);
        
        buscadorNotificationTimeout = setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
            buscadorNotificationTimeout = null;
        }, 4000);
        
    } catch (error) {
        ErrorHandler.log(error, 'showBuscadorNotification');
    }
}

// ============================================
// INICIALIZACIÓN OPTIMIZADA
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    try {
        // Resetear estado inicial
        currentState = {
            selectedRegion: null,
            selectedComuna: null
        };
        
        // Configurar eventos del asistente
        const floatingBtn = document.querySelector('.floating-instructions-btn');
        if (floatingBtn) {
            floatingBtn.addEventListener('click', openAssistant);
        }
        
        // Configurar cierre del modal al hacer clic en el overlay
        const assistantModal = DOMUtils.safeGetElement('assistantModal');
        if (assistantModal) {
            assistantModal.addEventListener('click', closeAssistant);
        }
        
        // Prevenir cierre al hacer clic en el contenido del modal
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
        
        // Configurar botón de cerrar del modal
        const closeBtn = document.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                closeAssistant();
            });
        }
        
        console.log('Buscador Principal inicializado correctamente con Asistente');
        
    } catch (error) {
        ErrorHandler.log(error, 'DOMContentLoaded');
    }
});

// Configuración del botón de registro
document.addEventListener('DOMContentLoaded', function() {
    const btnRegistro = document.querySelector('.register-btn');
    if (btnRegistro) {
        btnRegistro.onclick = function() {
            window.location.href = 'registro.html';
        };
    }
    
    const btnRegistroNotario = document.querySelector('.register-notary-btn');
    if (btnRegistroNotario) {
        btnRegistroNotario.onclick = function() {
            window.location.href = 'registro-notario.html';
        };
    }
});

// ============================================
// FUNCIONES ADICIONALES PARA MEJORAR UX
// ============================================

// Función para mostrar mensaje de ayuda del asistente
function showInstructionsHelp() {
    showBuscadorNotification('💡 ¿Necesitas ayuda? Haz clic en "Ver instrucciones" para ver los pasos detallados', 'info');
}

// Auto-mostrar ayuda después de 30 segundos de inactividad (opcional)
let inactivityTimer = null;

function resetInactivityTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    inactivityTimer = setTimeout(() => {
        showInstructionsHelp();
    }, 30000); // 30 segundos
}

// Detectar actividad del usuario
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);

// Inicializar timer de inactividad
document.addEventListener('DOMContentLoaded', function() {
    resetInactivityTimer();
});