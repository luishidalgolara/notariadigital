/* ============================================
   VARIABLES GLOBALES - TRÁMITES VIRTUALES
   ============================================ */
const elements = {
    header: document.getElementById('header'),
    mobileToggle: document.getElementById('mobile-toggle'),
    navMenu: document.getElementById('nav-menu'),
    backToTop: document.getElementById('back-to-top'),
    virtualCards: document.querySelectorAll('.virtual-card'),
    virtualCtas: document.querySelectorAll('.virtual-cta'),
    supportBtns: document.querySelectorAll('.support-btn')
};

const state = {
    isMenuOpen: false,
    scrollPosition: 0,
    selectedService: null
};

// Variables globales del sistema de pago
let currentPayment = {
    service: null,
    amount: 0,
    redirectUrl: null
};

// ============================================
// NUEVAS VARIABLES - SISTEMA PAGO EN CAJA
// ============================================
let pagoEnCaja = {
    numeroServicio: null,
    codigoAcceso: null,
    fechaGeneracion: null,
    notariaInfo: null,
    servicioInfo: null,
    monto: 0,
    estado: 'pendiente' // pendiente, pagado, vencido
};

// ============================================
// NUEVA VARIABLE: INFORMACIÓN DE NOTARÍA
// ============================================
let selectedNotaryInfo = null;
let clientData = {
    name: '',
    email: '',
    phone: '',
    rut: ''
};

/* ============================================
   INICIALIZACIÓN MODIFICADA
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeAnimations();
    initializeIntersectionObserver();
    initializeVirtualServices();
    
    // NUEVO: Leer información de notaría desde sessionStorage
    loadSelectedNotaryInfo();
});

// ============================================
// FUNCIÓN NUEVA: CARGAR INFORMACIÓN DE NOTARÍA
// ============================================
function loadSelectedNotaryInfo() {
    try {
        const notaryData = sessionStorage.getItem('selectedNotary');
        
        if (notaryData) {
            selectedNotaryInfo = JSON.parse(notaryData);
            console.log('🏛️ Notaría cargada desde sessionStorage:', selectedNotaryInfo);
            
            // Mostrar información de la notaría seleccionada
            displaySelectedNotaryInfo();
            
            // Notificación de confirmación
            showNotification(`🏛️ Conectado con: ${selectedNotaryInfo.name}`, 'success');
            
        } else {
            console.warn('⚠️ No se encontró información de notaría en sessionStorage');
            selectedNotaryInfo = {
                name: 'Notaría General',
                notario: 'Sistema Virtual',
                comuna: 'Región del Bío Bío',
                comunaKey: 'general',
                timestamp: new Date().toISOString(),
                sessionId: 'FALLBACK_' + Date.now()
            };
            
            showNotification('⚠️ Continuando con configuración general', 'warning');
        }
        
    } catch (error) {
        console.error('❌ Error al cargar información de notaría:', error);
        
        // Fallback en caso de error
        selectedNotaryInfo = {
            name: 'Notaría Sistema',
            notario: 'Administrador Virtual',
            comuna: 'Sistema General',
            comunaKey: 'system',
            timestamp: new Date().toISOString(),
            sessionId: 'ERROR_FALLBACK_' + Date.now()
        };
        
        showNotification('❌ Error de conexión - Usando modo sistema', 'error');
    }
}

// ============================================
// FUNCIÓN NUEVA: MOSTRAR INFO DE NOTARÍA
// ============================================
function displaySelectedNotaryInfo() {
    if (!selectedNotaryInfo) return;
    
    // Crear o actualizar banner de notaría seleccionada
    let notaryBanner = document.getElementById('notary-banner');
    
    if (!notaryBanner) {
        notaryBanner = document.createElement('div');
        notaryBanner.id = 'notary-banner';
        
        // Insertar después del header
        const header = document.querySelector('.header');
        if (header && header.nextSibling) {
            header.parentNode.insertBefore(notaryBanner, header.nextSibling);
        } else {
            document.body.insertBefore(notaryBanner, document.body.firstChild);
        }
    }
    
    notaryBanner.innerHTML = `
        <div class="notary-banner-content">
            <div class="notary-info">
                <span class="notary-icon">🏛️</span>
                <div class="notary-details">
                    <div class="notary-name">${selectedNotaryInfo.name}</div>
                    <div class="notary-location">📍 ${selectedNotaryInfo.comuna}</div>
                </div>
            </div>
            <div class="notary-status">
                <span class="status-badge">✅ Conectado</span>
            </div>
        </div>
    `;
    
    // Agregar estilos si no existen
    if (!document.querySelector('#notary-banner-styles')) {
        const style = document.createElement('style');
        style.id = 'notary-banner-styles';
        style.textContent = `
            #notary-banner {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 0;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                position: relative;
                z-index: 900;
            }
            
            .notary-banner-content {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 20px;
            }
            
            .notary-info {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .notary-icon {
                font-size: 2rem;
                text-shadow: 0 2px 10px rgba(0,0,0,0.3);
            }
            
            .notary-details {
                line-height: 1.4;
            }
            
            .notary-name {
                font-size: 1.2rem;
                font-weight: 700;
                text-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            
            .notary-location {
                font-size: 0.9rem;
                opacity: 0.9;
            }
            
            .status-badge {
                background: rgba(255, 255, 255, 0.2);
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            @media (max-width: 768px) {
                .notary-banner-content {
                    flex-direction: column;
                    gap: 10px;
                    text-align: center;
                }
                
                .notary-name {
                    font-size: 1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/* ============================================
   EVENT LISTENERS (sin modificar)
   ============================================ */
function initializeEventListeners() {
    // Scroll events
    window.addEventListener('scroll', throttle(handleScroll, 16));
    window.addEventListener('scroll', throttle(handleBackToTop, 16));
    
    // Navigation events
    elements.mobileToggle?.addEventListener('click', toggleMobileMenu);
    elements.backToTop?.addEventListener('click', scrollToTop);
    
    // Virtual services events
    elements.virtualCtas.forEach(btn => {
        btn.addEventListener('click', handleVirtualService);
    });
    
    elements.virtualCards.forEach(card => {
        card.addEventListener('click', handleCardClick);
        card.addEventListener('mouseenter', handleCardHover);
        card.addEventListener('mouseleave', handleCardLeave);
    });
    
    // Support buttons events
    elements.supportBtns.forEach(btn => {
        btn.addEventListener('click', handleSupportClick);
    });
    
    // Resize events
    window.addEventListener('resize', debounce(handleResize, 250));
    
    // Navigation smooth scroll
    initializeSmoothScroll();
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
}

/* ============================================
   SERVICIOS VIRTUALES - FUNCIONALIDAD (sin modificar)
   ============================================ */
function initializeVirtualServices() {
    // Agregar efectos especiales a las cards
    elements.virtualCards.forEach((card, index) => {
        // Delay progresivo para animaciones
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Agregar data attributes para tracking
        const serviceType = card.getAttribute('data-service');
        card.setAttribute('data-index', index);
        
        // Efecto de typing en hover (opcional)
        const title = card.querySelector('h3');
        if (title) {
            title.setAttribute('data-original', title.textContent);
        }
    });
}

function handleVirtualService(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const button = e.currentTarget;
    const serviceType = button.getAttribute('data-service');
    const card = button.closest('.virtual-card');
    
    // Efecto visual en el botón
    addButtonClickEffect(button);
    
    // Guardar servicio seleccionado
    state.selectedService = serviceType;
    
    // Tracking del evento
    trackVirtualServiceClick(serviceType);
    
    // Simular inicio de trámite (aquí se conectaría con el sistema real)
    initiateVirtualService(serviceType, card);
}

function handleCardClick(e) {
    // Solo si no se hizo click en el botón CTA
    if (!e.target.closest('.virtual-cta')) {
        const card = e.currentTarget;
        const serviceType = card.getAttribute('data-service');
        
        // Efecto de selección
        highlightCard(card);
        
        // Mostrar detalles expandidos
        showServiceDetails(serviceType);
    }
}

function handleCardHover(e) {
    const card = e.currentTarget;
    
    // Efecto de elevación adicional
    card.style.transform = 'translateY(-12px) scale(1.02)';
    
    // Efecto en el icono
    const icon = card.querySelector('.virtual-icon');
    if (icon) {
        icon.style.transform = 'scale(1.15) rotate(10deg)';
    }
}

function handleCardLeave(e) {
    const card = e.currentTarget;
    
    // Resetear transformaciones
    card.style.transform = '';
    
    const icon = card.querySelector('.virtual-icon');
    if (icon) {
        icon.style.transform = '';
    }
}

function addButtonClickEffect(button) {
    // Efecto ripple
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        width: 20px;
        height: 20px;
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    button.appendChild(ripple);
    
    // Remover después de la animación
    setTimeout(() => {
        ripple.remove();
    }, 600);
    
    // Agregar CSS de animación si no existe
    if (!document.querySelector('#ripple-animation')) {
        const style = document.createElement('style');
        style.id = 'ripple-animation';
        style.textContent = `
            @keyframes ripple {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                100% {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function highlightCard(card) {
    // Remover highlight previo
    elements.virtualCards.forEach(c => c.classList.remove('highlighted'));
    
    // Agregar highlight a la card seleccionada
    card.classList.add('highlighted');
    
    // Efecto de pulso
    card.style.animation = 'pulse 0.6s ease';
    
    setTimeout(() => {
        card.style.animation = '';
    }, 600);
    
    // CSS para highlight y pulse
    if (!document.querySelector('#card-effects')) {
        const style = document.createElement('style');
        style.id = 'card-effects';
        style.textContent = `
            .virtual-card.highlighted {
                border: 2px solid var(--virtual-purple) !important;
                box-shadow: 0 0 30px rgba(139, 92, 246, 0.4) !important;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
        `;
        document.head.appendChild(style);
    }
}

function initiateVirtualService(serviceType, card) {
    // Mostrar loading en el botón
    const button = card.querySelector('.virtual-cta');
    const originalText = button.innerHTML;
    
    button.innerHTML = `
        <span class="loading-spinner"></span>
        <span>Iniciando...</span>
    `;
    button.disabled = true;
    
    // CSS para spinner
    if (!document.querySelector('#loading-spinner')) {
        const style = document.createElement('style');
        style.id = 'loading-spinner';
        style.textContent = `
            .loading-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Simular procesamiento
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
        
        // Mostrar resultado
        showServiceInitiated(serviceType);
    }, 2000);
}

function showServiceDetails(serviceType) {
    const serviceInfo = getServiceInfo(serviceType);
    
    showNotification(
        `📋 ${serviceInfo.name}: ${serviceInfo.description}`,
        'info'
    );
}

function showServiceInitiated(serviceType) {
    const serviceInfo = getServiceInfo(serviceType);
    
    showNotification(
        `✅ ¡${serviceInfo.name} iniciado! Te contactaremos en breve para continuar con el proceso.`,
        'success'
    );
}

function getServiceInfo(serviceType) {
    const services = {
        declaraciones: {
            name: 'Declaraciones Juradas',
            description: 'Certificación de firmas y documentos digitales'
        },
        consultas: {
            name: 'Consultas Jurídicas Virtuales',
            description: 'Asesoría legal por videoconferencia'
        },
        poderes: {
            name: 'Poderes Digitales',
            description: 'Otorgamiento de poderes mediante plataforma digital'
        },
        certificaciones: {
            name: 'Certificaciones Online',
            description: 'Certificados de existencia y representación legal'
        },
        escrituras: {
            name: 'Escrituras Básicas Digitales',
            description: 'Elaboración de escrituras mediante formularios inteligentes'
        },
        apostillas: {
            name: 'Apostillas Digitales',
            description: 'Apostillado de documentos para uso internacional'
        }
    };
    
    return services[serviceType] || { name: 'Servicio Virtual', description: 'Servicio notarial digital' };
}

/* ============================================
   SOPORTE - FUNCIONALIDAD (sin modificar)
   ============================================ */
function handleSupportClick(e) {
    e.preventDefault();
    
    const supportType = e.currentTarget.classList.contains('chat') ? 'chat' :
                       e.currentTarget.classList.contains('video') ? 'video' :
                       e.currentTarget.classList.contains('phone') ? 'phone' : 'general';
    
    // Tracking del evento
    trackSupportClick(supportType);
    
    // Mostrar modalidad de soporte correspondiente
    initiateSupportContact(supportType);
}

function initiateSupportContact(supportType) {
    const supportMessages = {
        chat: '💬 Iniciando chat en vivo... Un agente te atenderá en segundos.',
        video: '📹 Preparando videollamada... Te redirigiremos a la sala virtual.',
        phone: '📞 Generando llamada... Recibirás una llamada en los próximos minutos.',
        general: '🎧 Conectando con soporte... Te atenderemos inmediatamente.'
    };
    
    showNotification(supportMessages[supportType], 'info');
    
    // Aquí se conectaría con el sistema real de soporte
    console.log(`Iniciando soporte tipo: ${supportType}`);
}

/* ============================================
   NAVEGACIÓN Y HEADER (sin modificar)
   ============================================ */
function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    state.scrollPosition = scrollTop;
    
    // Header scroll effect
    if (scrollTop > 100) {
        elements.header?.classList.add('scrolled');
    } else {
        elements.header?.classList.remove('scrolled');
    }
}

function toggleMobileMenu() {
    state.isMenuOpen = !state.isMenuOpen;
    
    if (elements.navMenu) {
        elements.navMenu.classList.toggle('active');
        elements.mobileToggle.textContent = state.isMenuOpen ? '✕' : '☰';
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
        
        // Add ARIA attributes for accessibility
        elements.mobileToggle.setAttribute('aria-expanded', state.isMenuOpen);
        elements.navMenu.setAttribute('aria-hidden', !state.isMenuOpen);
    }
}

function closeMobileMenu() {
    if (state.isMenuOpen) {
        toggleMobileMenu();
    }
}

function initializeSmoothScroll() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId.startsWith('#') && targetId.length > 1) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    closeMobileMenu();
                }
            }
        });
    });
}

/* ============================================
   BOTÓN VOLVER ARRIBA (sin modificar)
   ============================================ */
function handleBackToTop() {
    if (elements.backToTop) {
        if (state.scrollPosition > 300) {
            elements.backToTop.classList.add('visible');
        } else {
            elements.backToTop.classList.remove('visible');
        }
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/* ============================================
   ANIMACIONES Y EFECTOS VISUALES (sin modificar)
   ============================================ */
function initializeAnimations() {
    // Configurar elementos para animación de fade-in
    const animatedElements = document.querySelectorAll('.virtual-card, .benefit-card, .step-item, .stat');
    animatedElements.forEach(element => {
        element.classList.add('fade-in');
    });
}

function initializeIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animaciones especiales para ciertos elementos
                if (entry.target.classList.contains('virtual-card')) {
                    animateVirtualCard(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observar elementos con animación
    const elementsToObserve = document.querySelectorAll('.fade-in');
    elementsToObserve.forEach(element => {
        observer.observe(element);
    });
}

function animateVirtualCard(card) {
    // Animación especial para las cards virtuales
    const features = card.querySelectorAll('.feature');
    features.forEach((feature, index) => {
        setTimeout(() => {
            feature.style.transform = 'translateX(0)';
            feature.style.opacity = '1';
        }, index * 100);
    });
}

/* ============================================
   NOTIFICACIONES (sin modificar)
   ============================================ */
function showNotification(message, type = 'info') {
    // Remover notificación existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Estilos específicos para trámites virtuales
    const bgColor = type === 'success' ? '#10b981' : 
                   type === 'error' ? '#ef4444' : 
                   type === 'warning' ? '#f59e0b' : '#8b5cf6';
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 15px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 420px;
        font-family: var(--font-family);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 6 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 6000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        default: return '💻';
    }
}

/* ============================================
   TRACKING Y ANALYTICS AMPLIADO
   ============================================ */

function trackPaymentSuccess(serviceType, amount) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'purchase', {
            'transaction_id': generateTransactionId(),
            'value': amount,
            'currency': 'USD',
            'items': [{
                'item_id': serviceType,
                'item_name': getServiceInfo(serviceType).name,
                'category': 'Virtual Services',
                'quantity': 1,
                'price': amount
            }]
        });
    }
    
    // NUEVO: Tracking específico con notaría
    if (selectedNotaryInfo) {
        console.log('💰 Pago exitoso tracked:', {
            service: serviceType,
            amount: amount,
            notary: selectedNotaryInfo.name,
            client: clientData.name
        });
    }
}

function trackPaymentError(serviceType, amount) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'payment_error', {
            'event_category': 'Payment',
            'event_label': serviceType,
            'value': amount
        });
    }
    
    console.log('❌ Error de pago tracked:', serviceType, amount);
}

// NUEVO: Tracking específico para demo
function trackDemoSkip(serviceType) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'demo_skip', {
            'event_category': 'Demo',
            'event_label': serviceType,
            'value': 1
        });
    }
    
    // NUEVO: Tracking con notaría
    if (selectedNotaryInfo) {
        console.log('🎯 Demo skip tracked:', {
            service: serviceType,
            notary: selectedNotaryInfo.name
        });
    }
}

function generateTransactionId() {
    return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function trackVirtualServiceClick(serviceType) {
    // Tracking para analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'virtual_service_click', {
            'event_category': 'Virtual Services',
            'event_label': serviceType,
            'value': 1
        });
    }
    
    console.log('Virtual service clicked:', serviceType);
}

function trackSupportClick(supportType) {
    // Tracking para soporte
    if (typeof gtag !== 'undefined') {
        gtag('event', 'support_click', {
            'event_category': 'Support',
            'event_label': supportType,
            'value': 1
        });
    }
    
    console.log('Support clicked:', supportType);
}

function trackPageView() {
    // Tracking de vista de página
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_TRACKING_ID', {
            page_title: 'Trámites Virtuales',
            page_location: window.location.href
        });
    }
}

/* ============================================
   UTILIDADES Y HELPERS (sin modificar)
   ============================================ */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/* ============================================
   RESPONSIVE Y RESIZE HANDLING (sin modificar)
   ============================================ */
function handleResize() {
    // Cerrar menú móvil si la pantalla se hace más grande
    if (window.innerWidth > 768 && state.isMenuOpen) {
        closeMobileMenu();
    }
    
    // Reajustar animaciones de cards
    elements.virtualCards.forEach(card => {
        card.style.transform = '';
    });
}

/* ============================================
   ACCESIBILIDAD (sin modificar)
   ============================================ */
function handleKeyboardNavigation(e) {
    // Navegación con teclado
    if (e.key === 'Escape' && state.isMenuOpen) {
        closeMobileMenu();
    }
    
    // Cerrar modal de pago con ESC
    if (e.key === 'Escape' && document.getElementById('paymentModal').classList.contains('active')) {
        closePaymentModal();
    }
    
    // NUEVO: Activar demo con Ctrl+D
    if ((e.ctrlKey || e.metaKey) && e.key === 'd' && document.getElementById('paymentModal').classList.contains('active')) {
        e.preventDefault();
        continueDemo();
    }
    
    // Ir arriba con Ctrl/Cmd + Home
    if ((e.ctrlKey || e.metaKey) && e.key === 'Home') {
        e.preventDefault();
        scrollToTop();
    }
    
    // Enter para activar servicios virtuales
    if (e.key === 'Enter' && e.target.classList.contains('virtual-card')) {
        handleCardClick(e);
    }
}