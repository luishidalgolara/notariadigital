// ============================================
// NOTARÍAS BIO BIO - PARTE 2: FUNCIONES PRINCIPALES UI
// ============================================

// Función para inicializar la página con parámetros URL
function initializePage() {
    try {
        const comunaParam = getURLParameter('comuna');
        
        if (comunaParam && notariasData[comunaParam]) {
            // Si hay parámetro de comuna específica, filtrar esa comuna
            currentState.selectedComuna = comunaParam;
            filterByComuna(comunaParam);
            
            // Actualizar título
            const comunaName = comunaNames[comunaParam];
            const titleElement = DOMUtils.safeGetElement('region-title');
            if (titleElement) {
                titleElement.textContent = `Notarías de ${comunaName}`;
            }
            
            const subtitleElement = DOMUtils.safeGetElement('region-subtitle');
            if (subtitleElement) {
                subtitleElement.textContent = `Encuentra tu notaría ideal en ${comunaName}`;
            }
        } else {
            // Mostrar todas las notarías del Bio Bio
            loadAllNotarias();
        }
        
    } catch (error) {
        ErrorHandler.log(error, 'initializePage');
        // Fallback: cargar todas las notarías
        loadAllNotarias();
    }
}

// Función para cargar todas las notarías del Bio Bio
function loadAllNotarias() {
    try {
        currentState.allNotarias = [];
        currentState.displayedNotarias = {};
        
        // Combinar todas las notarías de todas las comunas
        Object.keys(notariasData).forEach(comunaKey => {
            const notarias = notariasData[comunaKey];
            notarias.forEach((notaria, index) => {
                const notariaWithComuna = {
                    ...notaria,
                    comunaKey: comunaKey,
                    originalIndex: index
                };
                currentState.allNotarias.push(notariaWithComuna);
            });
        });
        
        displayNotarias(currentState.allNotarias);
        
        // Activar filtro "todas"
        const allFilters = document.querySelectorAll('.filter-btn');
        allFilters.forEach(btn => btn.classList.remove('active'));
        const allBtn = document.querySelector('[data-comuna="todas"]');
        if (allBtn) allBtn.classList.add('active');
        
    } catch (error) {
        ErrorHandler.log(error, 'loadAllNotarias');
    }
}

// Función para filtrar por comuna
function filterByComuna(comuna) {
    try {
        // Actualizar botones de filtro
        const allFilters = document.querySelectorAll('.filter-btn');
        allFilters.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-comuna="${comuna}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        let notariasToShow = [];
        let titleText = '';
        
        if (comuna === 'todas') {
            notariasToShow = currentState.allNotarias;
            titleText = 'Todas las Notarías del Bío Bío';
        } else if (notariasData[comuna]) {
            notariasToShow = notariasData[comuna].map((notaria, index) => ({
                ...notaria,
                comunaKey: comuna,
                originalIndex: index
            }));
            const comunaName = comunaNames[comuna];
            titleText = `Notarías de ${comunaName}`;
        }
        
        // Actualizar título
        const titleElement = DOMUtils.safeGetElement('notariasTitle');
        if (titleElement) {
            titleElement.textContent = titleText;
        }
        
        displayNotarias(notariasToShow);
        
    } catch (error) {
        ErrorHandler.log(error, 'filterByComuna');
    }
}

function displayNotarias(notarias) {
    try {
        const container = DOMUtils.safeGetElement('notariasContainer');
        if (!container) {
            ErrorHandler.logWarning('Container de notarías no encontrado', 'displayNotarias');
            return;
        }
        
        container.innerHTML = '';
        currentState.displayedNotarias = {};

        notarias.forEach((notaria, index) => {
            try {
                const notariaId = generateNotariaId(notaria.name);
                
                currentState.displayedNotarias[notariaId] = {
                    ...notaria,
                    index: index
                };
                
                const customData = getCustomNotariaData(notariaId) || {};
                
                const finalNotaria = {
                    ...notaria,
                    banner: customData.banner || notaria.banner,
                    fotos: customData.fotos || notaria.fotos || [],
                    serviciosOnline: customData.serviciosOnline || notaria.serviciosOnline || []
                };
                
                const notariaCard = createNotariaCard(finalNotaria, notariaId, notaria.comunaKey);
                if (notariaCard) {
                    container.appendChild(notariaCard);
                }
            } catch (error) {
                ErrorHandler.log(error, `displayNotarias - Notaría ${index}`);
            }
        });
    } catch (error) {
        ErrorHandler.log(error, 'displayNotarias');
    }
}

function createNotariaCard(notaria, notariaId, comunaKey) {
    try {
        const notariaCard = document.createElement('div');
        notariaCard.className = 'notaria-card';
        notariaCard.setAttribute('data-notaria-id', notariaId);
        notariaCard.setAttribute('data-comuna', comunaKey);
        
        const bannerStyle = notaria.banner ? 
            `background-image: url('${notaria.banner}'); background-size: cover; background-position: center;` : 
            '';
        
        const mosaicoFotosHTML = createMosaicoFotos(notaria, notariaId);
        const serviciosCompactosHTML = createServiciosCompactos(notaria, notariaId);
        
        notariaCard.innerHTML = `
            <div class="notaria-banner" style="${bannerStyle}">
                <div class="notaria-header">
                    <div class="notaria-main-info">
                        <div class="notaria-name">${notaria.name}</div>
                        <div class="notario-name">${notaria.notario}</div>
                        ${notaria.descripcion ? `<div class="notaria-description">${notaria.descripcion}</div>` : ''}
                    </div>
                    <div class="banner-customize">
                        <button class="customize-banner-btn" onclick="directFileUpload('banner', '${notariaId}')" title="Subir banner directamente">
                            ${notaria.banner ? 'Cambiar' : 'Subir'} banner
                        </button>
                        ${notaria.banner ? `<button class="remove-banner-btn" onclick="removeBanner('${notariaId}')" title="Eliminar banner">Eliminar</button>` : ''}
                        <button class="banner-specs-btn" onclick="showPhotoSpecs('banner', '${notaria.name}')" title="Ver especificaciones del banner">⚙</button>
                    </div>
                </div>
            </div>
            
            <div class="notaria-content-grid">
                <div class="notaria-left-column">
                    <div class="notaria-info-section">
                        <div class="info-section-header">
                            <span class="info-section-title">Información de Contacto</span>
                        </div>
                        <div class="info-items-grid">
                            <div class="info-item">
                                <span class="info-icon">DIRECCIÓN</span>
                                <span class="info-text">${notaria.direccion}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-icon">TELÉFONO</span>
                                <a href="tel:${notaria.telefono.replace(/\s/g, '')}" class="info-link phone-link">${notaria.telefono}</a>
                            </div>
                            <div class="info-item">
                                <span class="info-icon">EMAIL</span>
                                <a href="mailto:${notaria.email}" class="info-link email-link">${notaria.email}</a>
                            </div>
                            ${notaria.horario ? `<div class="info-item">
                                <span class="info-icon">HORARIO</span>
                                <span class="info-text">${notaria.horario}</span>
                            </div>` : ''}
                            ${notaria.website ? `<div class="info-item">
                                <span class="info-icon">WEB</span>
                                <a href="http://${notaria.website}" target="_blank" class="info-link website-link">${notaria.website}</a>
                            </div>` : ''}
                        </div>
                    </div>
                    
                    ${serviciosCompactosHTML}
                    
                    <div class="notaria-location-section">
                        <div class="location-section-header">
                            <span class="location-section-title">Ubicación</span>
                        </div>
                        <div class="location-map-container">
                            <div class="map-placeholder" onclick="openGoogleMaps('${notaria.direccion}')">
                                <div class="map-preview-content">
                                    <div class="map-icon">MAPA</div>
                                    <div class="map-text-content">
                                        <div class="map-address">${notaria.direccion}</div>
                                        <div class="map-instruction">Haz clic para ver en Google Maps</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="notaria-actions-section">
                        <div class="actions-grid">
                            <button onclick="verTramitesDigitales('${notaria.name}', '${notaria.notario}', '${comunaKey}', '${comunaNames[comunaKey]}')" class="action-btn tramites-btn">
                                TRÁMITES VIRTUALES
                            </button>
                            <div class="secondary-actions">
                                <button onclick="window.open('tel:${notaria.telefono.replace(/\s/g, '')}', '_self')" class="action-btn call-btn">
                                    Llamar
                                </button>
                                <button onclick="getDirections('${notaria.direccion}')" class="action-btn directions-btn">
                                    Cómo llegar
                                </button>
                                ${notaria.website ? `<button onclick="window.open('http://${notaria.website}', '_blank')" class="action-btn website-btn">
                                    Sitio Web
                                </button>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="notaria-right-column">
                    ${mosaicoFotosHTML}
                </div>
            </div>
        `;
        
        return notariaCard;
    } catch (error) {
        ErrorHandler.log(error, 'createNotariaCard');
        return null;
    }
}

function createMosaicoFotos(notaria, notariaId) {
    try {
        return `
            <div class="photos-mosaic-container">
                <div class="mosaic-header">
                    <div class="mosaic-title-section">
                        <span class="mosaic-title">Galería Visual</span>
                        <span class="mosaic-count">${notaria.fotos.length}/${PHOTO_LIMITS.GALLERY}</span>
                    </div>
                    <div class="mosaic-actions">
                        <button class="mosaic-upload-btn" onclick="directFileUpload('gallery', '${notariaId}')" title="Subir fotos">
                            SUBIR FOTOS
                        </button>
                        ${notaria.fotos.length > 0 ? `
                            <button class="mosaic-delete-mode-btn" onclick="toggleDeleteMode('${notariaId}')" title="Eliminar fotos" id="delete-mode-${notariaId}">
                                ELIMINAR
                            </button>
                        ` : ''}
                        <button class="mosaic-specs-btn" onclick="showPhotoSpecs('gallery', '${notaria.name}')" title="Ver especificaciones de fotos">⚙</button>
                    </div>
                </div>
                
                <div class="photos-mosaic-grid" id="mosaic-grid-${notariaId}">
                    ${notaria.fotos.length > 0 ? 
                        notaria.fotos.map((foto, i) => `
                            <div class="mosaic-photo-item mosaic-item-${(i % 4) + 1}" onclick="openPhotoModal('${foto}', '${notaria.name}')" data-photo-index="${i}" data-notaria-id="${notariaId}">
                                <img src="${foto}" alt="Foto ${i + 1} - ${notaria.name}" onerror="this.style.display='none'; this.parentElement.style.display='none';">
                                <div class="mosaic-photo-overlay">
                                    <span class="mosaic-photo-number">${i + 1}</span>
                                </div>
                                <div class="mosaic-delete-overlay" onclick="event.stopPropagation(); confirmDeletePhoto('${notariaId}', ${i}, '${notaria.name}')">
                                    <span class="delete-icon">×</span>
                                </div>
                            </div>
                        `).join('') :
                        `<div class="mosaic-empty-state">
                            <div class="mosaic-empty-content">
                                <span class="mosaic-empty-icon">FOTOS</span>
                                <span class="mosaic-empty-title">Sin fotos aún</span>
                                <span class="mosaic-empty-subtitle">Sube hasta ${PHOTO_LIMITS.GALLERY} fotos para mostrar tu notaría</span>
                                <button class="mosaic-empty-btn" onclick="directFileUpload('gallery', '${notariaId}')">
                                    Subir Primera Foto
                                </button>
                            </div>
                        </div>`
                    }
                    
                    ${notaria.fotos.length < PHOTO_LIMITS.GALLERY && notaria.fotos.length > 0 ? `
                        <div class="mosaic-add-item mosaic-item-add" onclick="directFileUpload('gallery', '${notariaId}')">
                            <div class="mosaic-add-content">
                                <span class="mosaic-add-icon">+</span>
                                <span class="mosaic-add-text">Agregar Foto</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    } catch (error) {
        ErrorHandler.log(error, 'createMosaicoFotos');
        return '<div class="photos-mosaic-container">Error creando galería</div>';
    }
}

function createServiciosCompactos(notaria, notariaId) {
    try {
        return `
            <div class="servicios-compact">
                <div class="servicios-compact-header">
                    <span class="servicios-compact-title">Servicios Digitales</span>
                    <button class="servicios-compact-edit" onclick="showServicesEditor('${notariaId}', '${notaria.name}')" title="Editar servicios">
                        ✏
                    </button>
                </div>
                <div class="servicios-compact-list">
                    ${notaria.serviciosOnline.length > 0 ? 
                        notaria.serviciosOnline.slice(0, 4).map(servicio => `
                            <div class="servicio-compact-item">
                                <span class="servicio-compact-check">✓</span>
                                <span class="servicio-compact-text">${servicio}</span>
                            </div>
                        `).join('') :
                        `<div class="servicio-compact-empty" onclick="showServicesEditor('${notariaId}', '${notaria.name}')">
                            <span class="servicio-compact-add">+</span>
                            <span class="servicio-compact-placeholder">Agregar servicios digitales</span>
                        </div>`
                    }
                    ${notaria.serviciosOnline.length > 4 ? `
                        <div class="servicios-compact-more">
                            <span class="servicios-more-text">+${notaria.serviciosOnline.length - 4} servicios más</span>
                            <button class="servicios-more-btn" onclick="showServicesEditor('${notariaId}', '${notaria.name}')">Ver todos</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    } catch (error) {
        ErrorHandler.log(error, 'createServiciosCompactos');
        return '<div class="servicios-compact">Error creando servicios</div>';
    }
}

function refreshNotariaDisplay(notariaId) {
    try {
        const notariaInfo = getNotariaByIdFromState(notariaId);
        if (!notariaInfo) {
            ErrorHandler.logWarning(`No se puede refrescar: notaría ${notariaId} no encontrada en estado`, 'refreshNotariaDisplay');
            return;
        }
        
        const notariaCard = DOMUtils.safeGetElement(`[data-notaria-id="${notariaId}"]`);
        if (!notariaCard) {
            ErrorHandler.logWarning(`No se encontró tarjeta en DOM para: ${notariaId}`, 'refreshNotariaDisplay');
            return;
        }
        
        const customData = getCustomNotariaData(notariaId) || {};
        const updatedNotaria = {
            ...notariaInfo,
            banner: customData.banner || notariaInfo.banner,
            fotos: customData.fotos || notariaInfo.fotos || [],
            serviciosOnline: customData.serviciosOnline || notariaInfo.serviciosOnline || []
        };
        
        const newCard = createNotariaCard(updatedNotaria, notariaId, notariaInfo.comunaKey);
        
        if (newCard && notariaCard.parentNode) {
            notariaCard.parentNode.replaceChild(newCard, notariaCard);
        }
    } catch (error) {
        ErrorHandler.log(error, 'refreshNotariaDisplay');
    }
}

// Funciones de enlaces externos
function openGoogleMaps(address) {
    try {
        if (!address || typeof address !== 'string') {
            ErrorHandler.logWarning('Dirección inválida para Google Maps', 'External Links');
            return;
        }
        
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
        ErrorHandler.log(error, 'openGoogleMaps');
    }
}

function getDirections(address) {
    try {
        if (!address || typeof address !== 'string') {
            ErrorHandler.logWarning('Dirección inválida para direcciones', 'External Links');
            return;
        }
        
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
        ErrorHandler.log(error, 'getDirections');
    }
}

// Función para trámites digitales
function verTramitesDigitales(notariaName, notarioName, comunaKey, comunaName) {
    try {
        if (!notariaName || !notarioName || !comunaKey || !comunaName) {
            ErrorHandler.logWarning('Parámetros incompletos para trámites digitales', 'Tramites');
            fallbackRedirect();
            return;
        }
        
        const notaryInfo = {
            name: notariaName,
            notario: notarioName,
            comuna: comunaName,
            comunaKey: comunaKey,
            timestamp: new Date().toISOString(),
            sessionId: generateSessionId()
        };
        
        if (!isSessionStorageAvailable()) {
            ErrorHandler.logWarning('SessionStorage no disponible, usando método de respaldo', 'SessionStorage');
            fallbackRedirect();
            return;
        }
        
        try {
            sessionStorage.setItem('selectedNotary', JSON.stringify(notaryInfo));
            
            const verification = sessionStorage.getItem('selectedNotary');
            if (verification) {
                showUploadNotification('✅ Notaría seleccionada: ' + notariaName, 'success');
                
                setTimeout(() => {
                    window.open('tramites-virtuales.html', '_blank', 'noopener,noreferrer');
                }, 1000);
                
            } else {
                fallbackRedirect();
            }
            
        } catch (sessionError) {
            ErrorHandler.log(sessionError, 'verTramitesDigitales - sessionStorage');
            fallbackRedirect();
        }
        
    } catch (error) {
        ErrorHandler.log(error, 'verTramitesDigitales');
        fallbackRedirect();
    }
}

function isSessionStorageAvailable() {
    try {
        const test = 'sessionStorage_test';
        sessionStorage.setItem(test, test);
        sessionStorage.removeItem(test);
        return true;
    } catch (error) {
        return false;
    }
}

function fallbackRedirect() {
    try {
        showUploadNotification('⚠️ Continuando sin selección específica', 'warning');
        setTimeout(() => {
            window.open('tramites-virtuales.html', '_blank', 'noopener,noreferrer');
        }, 1500);
    } catch (error) {
        ErrorHandler.log(error, 'fallbackRedirect');
    }
}

function generateSessionId() {
    try {
        return 'NOTARY_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    } catch (error) {
        ErrorHandler.log(error, 'generateSessionId');
        return 'NOTARY_' + Date.now();
    }
}

// Funciones de testing y debug simplificadas
function testSessionStorage() {
    try {
        const testData = {
            name: "Test Notaría",
            notario: "Test Notario",
            comuna: "Test Comuna",
            timestamp: new Date().toISOString()
        };
        
        if (!isSessionStorageAvailable()) {
            return false;
        }
        
        sessionStorage.setItem('test', JSON.stringify(testData));
        const retrieved = JSON.parse(sessionStorage.getItem('test'));
        sessionStorage.removeItem('test');
        return true;
    } catch (error) {
        ErrorHandler.log(error, 'testSessionStorage');
        return false;
    }
}

console.log('✅ Notarías Bio Bio - Funciones Principales UI cargado correctamente');