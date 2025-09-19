// ============================================
// NOTARÍAS BIO BIO - PARTE 3: MODALES, UPLOAD Y EVENTOS
// ============================================

// Función para eliminar banner
function replaceBanner(notariaId, newBannerData) {
    try {
        const customData = getCustomNotariaData(notariaId) || {};
        const oldBannerExists = !!customData.banner;
        
        customData.banner = newBannerData;
        
        const success = saveCustomNotariaData(notariaId, customData);
        
        return success;
    } catch (error) {
        ErrorHandler.log(error, 'replaceBanner');
        return false;
    }
}

// Sistema de upload optimizado
let activeUploads = new Set();

function directFileUpload(type, notariaId) {
    try {
        const uploadKey = `${type}_${notariaId}`;
        
        if (activeUploads.has(uploadKey)) {
            showUploadNotification('Upload ya en proceso...', 'warning');
            return;
        }
        
        const notariaInfo = getNotariaByIdFromState(notariaId);
        if (!notariaInfo) {
            showUploadNotification(`Error: Notaría no encontrada (${notariaId})`, 'error');
            return;
        }
        
        activeUploads.add(uploadKey);
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/png,image/webp';
        input.multiple = type === 'gallery';
        
        const actionText = type === 'banner' ? 'banner' : 'foto(s)';
        showUploadNotification(`Selecciona tu ${actionText} para ${notariaInfo.name}...`, 'info');
        
        const cleanup = () => {
            activeUploads.delete(uploadKey);
            if (input.parentElement) {
                input.remove();
            }
        };
        
        input.onchange = async (e) => {
            try {
                const files = Array.from(e.target.files);
                
                if (files.length === 0) {
                    showUploadNotification('No se seleccionaron archivos', 'warning');
                    cleanup();
                    return;
                }
                
                const customData = getCustomNotariaData(notariaId) || {};
                
                if (type === 'gallery') {
                    const currentGalleryCount = (customData.fotos || []).length;
                    const totalAfterUpload = currentGalleryCount + files.length;
                    if (totalAfterUpload > PHOTO_LIMITS.GALLERY) {
                        showUploadNotification(`Límite excedido para ${notariaInfo.name}. Máximo ${PHOTO_LIMITS.GALLERY} fotos. Actuales: ${currentGalleryCount}`, 'error');
                        cleanup();
                        return;
                    }
                }
                
                await processDirectUpload(files, type, notariaId, notariaInfo);
                cleanup();
                
            } catch (error) {
                ErrorHandler.log(error, 'directFileUpload - onchange');
                cleanup();
            }
        };
        
        input.oncancel = cleanup;
        input.onerror = cleanup;
        
        input.click();
        
    } catch (error) {
        ErrorHandler.log(error, 'directFileUpload');
        activeUploads.delete(`${type}_${notariaId}`);
    }
}

async function processDirectUpload(files, type, notariaId, notariaInfo) {
    try {
        showUploadNotification(`Procesando ${files.length} imagen(es) para ${notariaInfo.name}...`, 'info');
        
        const validFiles = [];
        const errors = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            try {
                if (file.size > 20 * 1024 * 1024) {
                    errors.push(`${file.name}: Archivo muy pesado (${(file.size / (1024 * 1024)).toFixed(1)}MB). Máximo: 20MB`);
                    continue;
                }
                
                if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                    errors.push(`${file.name}: Formato no soportado. Usa JPG, PNG o WebP`);
                    continue;
                }
                
                const validation = await validateImageSpecs(file, type);
                
                if (validation.isValid || validation.status === 'acceptable' || validation.status === 'too-large' || validation.status === 'wrong-ratio') {
                    const compressedBlob = await compressImage(file, type);
                    const imageData = await compressedFileToBase64(compressedBlob);
                    
                    validFiles.push({
                        data: imageData,
                        name: file.name,
                        specs: validation.specs,
                        message: validation.message,
                        originalSize: file.size,
                        compressedSize: compressedBlob.size
                    });
                } else {
                    errors.push(`${file.name}: ${validation.message}`);
                }
            } catch (error) {
                ErrorHandler.log(error, `Processing file: ${file.name}`);
                errors.push(`${file.name}: Error procesando archivo`);
            }
        }
        
        if (validFiles.length > 0) {
            const success = await saveCustomImages(notariaId, validFiles, type);
            
            if (success) {
                const totalOriginal = validFiles.reduce((total, file) => total + file.originalSize, 0);
                const totalCompressed = validFiles.reduce((total, file) => total + file.compressedSize, 0);
                const savings = totalOriginal > 0 ? ((totalOriginal - totalCompressed) / totalOriginal * 100).toFixed(1) : 0;
                
                if (type === 'banner') {
                    showUploadNotification(`Banner actualizado para ${notariaInfo.name}! (Compresión: ${savings}%)`, 'success');
                } else {
                    if (errors.length > 0) {
                        showUploadNotification(`${validFiles.length} imagen(es) subida(s) a ${notariaInfo.name} (${savings}% compresión). ${errors.length} rechazada(s)`, 'warning');
                    } else {
                        showUploadNotification(`${validFiles.length} imagen(es) subida(s) a ${notariaInfo.name}! (Compresión: ${savings}%)`, 'success');
                    }
                }
                
                const debouncedRefresh = DebounceUtils.debounce(() => {
                    refreshNotariaDisplay(notariaId);
                }, 1000, `refresh_upload_${notariaId}`);
                
                debouncedRefresh();
            }
        } else {
            const firstError = errors[0] || 'Ninguna imagen válida';
            const itemType = type === 'banner' ? 'banner' : 'imágenes';
            showUploadNotification(`No se pudo actualizar ${itemType} de ${notariaInfo.name}. ${firstError}`, 'error');
        }
    } catch (error) {
        ErrorHandler.log(error, 'processDirectUpload');
        showUploadNotification('Error procesando imágenes', 'error');
    }
}

async function saveCustomImages(notariaId, images, type) {
    try {
        if (type === 'banner') {
            return replaceBanner(notariaId, images[0].data);
        } else if (type === 'gallery') {
            const customData = getCustomNotariaData(notariaId) || {};
            customData.fotos = customData.fotos || [];
            
            images.forEach(img => {
                customData.fotos.push(img.data);
            });
            
            return saveCustomNotariaData(notariaId, customData);
        }
        
        return false;
    } catch (error) {
        ErrorHandler.log(error, 'saveCustomImages');
        return false;
    }
}

// Funciones de validación optimizadas
function validateImageSpecs(file, type) {
    return new Promise((resolve) => {
        try {
            const img = new Image();
            
            const cleanup = () => {
                MemoryManager.cleanupImage(img);
            };
            
            const handleLoad = () => {
                try {
                    const specs = PHOTO_SPECS[type];
                    const imageSpecs = {
                        width: img.width,
                        height: img.height,
                        ratio: Math.round((img.width / img.height) * 100) / 100,
                        size: file.size
                    };
                    
                    let status = 'optimal';
                    let message = `Imagen perfecta: ${imageSpecs.width}x${imageSpecs.height}px`;
                    
                    if (imageSpecs.width < specs.acceptable.minWidth / 2 || 
                        imageSpecs.height < specs.acceptable.minHeight / 2) {
                        status = 'too-small';
                        message = `Imagen muy pequeña. Mínimo: ${specs.acceptable.minWidth}x${specs.acceptable.minHeight}px`;
                    } else if (imageSpecs.width > specs.acceptable.maxWidth * 3 || 
                               imageSpecs.height > specs.acceptable.maxHeight * 3) {
                        status = 'too-large';
                        message = `Imagen grande (será comprimida automáticamente): ${imageSpecs.width}x${imageSpecs.height}px`;
                    } else if (Math.abs(imageSpecs.ratio - specs.optimal.ratio) > 1.5) {
                        status = 'wrong-ratio';
                        message = `Ratio no óptimo (será ajustado): Recomendado ${specs.optimal.ratio}:1, actual ${imageSpecs.ratio}:1`;
                    } else if (imageSpecs.width !== specs.optimal.width || 
                               imageSpecs.height !== specs.optimal.height) {
                        status = 'acceptable';
                        message = `Dimensiones aceptables: ${imageSpecs.width}x${imageSpecs.height}px`;
                    }
                    
                    if (file.size > 25 * 1024 * 1024) {
                        status = 'file-too-large';
                        message = `Archivo muy pesado: ${(file.size / (1024 * 1024)).toFixed(1)}MB. Máximo: 25MB`;
                    } else if (file.size > 10 * 1024 * 1024) {
                        message += ` (será comprimida para optimizar espacio)`;
                    }
                    
                    cleanup();
                    resolve({ 
                        specs: imageSpecs, 
                        status, 
                        message,
                        isValid: status !== 'too-small' && status !== 'file-too-large'
                    });
                } catch (error) {
                    cleanup();
                    ErrorHandler.log(error, 'validateImageSpecs - onload');
                    resolve({ 
                        specs: {}, 
                        status: 'error', 
                        message: 'Error validando imagen',
                        isValid: false
                    });
                }
            };
            
            const handleError = () => {
                cleanup();
                resolve({ 
                    specs: {}, 
                    status: 'error', 
                    message: 'Error cargando imagen',
                    isValid: false
                });
            };
            
            img.onload = handleLoad;
            img.onerror = handleError;
            
            MemoryManager.trackImage(img);
            img.src = URL.createObjectURL(file);
            
        } catch (error) {
            ErrorHandler.log(error, 'validateImageSpecs');
            resolve({ 
                specs: {}, 
                status: 'error', 
                message: 'Error en validación',
                isValid: false
            });
        }
    });
}

function compressImage(file, type) {
    return new Promise((resolve) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            MemoryManager.trackCanvas(canvas);
            MemoryManager.trackImage(img);
            
            const cleanup = () => {
                MemoryManager.cleanupImage(img);
                MemoryManager.cleanupCanvas(canvas);
            };
            
            const handleLoad = () => {
                try {
                    const settings = COMPRESSION_SETTINGS[type];
                    
                    let { width, height } = img;
                    const ratio = width / height;
                    
                    if (width > settings.maxWidth) {
                        width = settings.maxWidth;
                        height = width / ratio;
                    }
                    
                    if (height > settings.maxHeight) {
                        height = settings.maxHeight;
                        width = height * ratio;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const tryWebP = () => {
                        canvas.toBlob((blob) => {
                            if (blob && blob.size > 0) {
                                cleanup();
                                resolve(blob);
                            } else {
                                fallbackToJPEG();
                            }
                        }, 'image/webp', settings.quality);
                    };
                    
                    const fallbackToJPEG = () => {
                        canvas.toBlob((blob) => {
                            cleanup();
                            resolve(blob);
                        }, 'image/jpeg', settings.quality);
                    };
                    
                    const testWebP = () => {
                        const testCanvas = document.createElement('canvas');
                        testCanvas.width = 1;
                        testCanvas.height = 1;
                        testCanvas.toBlob((testBlob) => {
                            if (testBlob && testBlob.type === 'image/webp') {
                                tryWebP();
                            } else {
                                fallbackToJPEG();
                            }
                            testCanvas.width = testCanvas.height = 1;
                        }, 'image/webp', 0.8);
                    };
                    
                    testWebP();
                    
                } catch (error) {
                    ErrorHandler.log(error, 'compressImage - processing');
                    cleanup();
                    resolve(file);
                }
            };
            
            const handleError = () => {
                ErrorHandler.log('Error loading image for compression', 'compressImage');
                cleanup();
                resolve(file);
            };
            
            img.onload = handleLoad;
            img.onerror = handleError;
            img.src = URL.createObjectURL(file);
            
        } catch (error) {
            ErrorHandler.log(error, 'compressImage');
            resolve(file);
        }
    });
}

function compressedFileToBase64(blob) {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => {
                ErrorHandler.log(error, 'compressedFileToBase64');
                reject(error);
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            ErrorHandler.log(error, 'compressedFileToBase64');
            reject(error);
        }
    });
}

// Función para eliminar banner
function removeBanner(notariaId) {
    try {
        const notariaInfo = getNotariaByIdFromState(notariaId);
        if (!notariaInfo) {
            showUploadNotification('Error: Notaría no encontrada', 'error');
            return;
        }
        
        const customData = getCustomNotariaData(notariaId) || {};
        
        // Confirmar eliminación
        const confirmed = confirm(`¿Estás seguro de que quieres eliminar el banner de ${notariaInfo.name}?`);
        
        if (confirmed) {
            // Eliminar el banner
            customData.banner = '';
            
            const success = saveCustomNotariaData(notariaId, customData);
            
            if (success) {
                showUploadNotification(`Banner eliminado de ${notariaInfo.name}`, 'success');
                
                // Refrescar la tarjeta
                const debouncedRefresh = DebounceUtils.debounce(() => {
                    refreshNotariaDisplay(notariaId);
                }, 500, `refresh_remove_banner_${notariaId}`);
                
                debouncedRefresh();
            } else {
                showUploadNotification('Error eliminando el banner', 'error');
            }
        }
    } catch (error) {
        ErrorHandler.log(error, 'removeBanner');
        showUploadNotification('Error eliminando el banner', 'error');
    }
}

// Sistema de eliminación de fotos
let deleteMode = {};

function toggleDeleteMode(notariaId) {
    try {
        const notariaInfo = getNotariaByIdFromState(notariaId);
        if (!notariaInfo) {
            showUploadNotification('Error: Notaría no encontrada', 'error');
            return;
        }
        
        deleteMode[notariaId] = !deleteMode[notariaId];
        
        const mosaicGrid = DOMUtils.safeGetElement(`mosaic-grid-${notariaId}`);
        const deleteBtn = DOMUtils.safeGetElement(`delete-mode-${notariaId}`);
        
        if (deleteMode[notariaId]) {
            if (mosaicGrid) mosaicGrid.classList.add('delete-mode-active');
            if (deleteBtn) {
                deleteBtn.textContent = 'CANCELAR';
                deleteBtn.classList.add('delete-mode-active');
                deleteBtn.title = 'Cancelar eliminación';
            }
            
            showUploadNotification(`Modo eliminar activado para ${notariaInfo.name}. Haz clic en las fotos para eliminarlas.`, 'warning');
        } else {
            if (mosaicGrid) mosaicGrid.classList.remove('delete-mode-active');
            if (deleteBtn) {
                deleteBtn.textContent = 'ELIMINAR';
                deleteBtn.classList.remove('delete-mode-active');
                deleteBtn.title = 'Eliminar fotos';
            }
            
            showUploadNotification(`Modo eliminar desactivado para ${notariaInfo.name}`, 'info');
        }
    } catch (error) {
        ErrorHandler.log(error, 'toggleDeleteMode');
    }
}

function confirmDeletePhoto(notariaId, photoIndex, notariaName) {
    try {
        const notariaInfo = getNotariaByIdFromState(notariaId);
        if (!notariaInfo) {
            showUploadNotification('Error: Notaría no encontrada', 'error');
            return;
        }
        
        const customData = getCustomNotariaData(notariaId) || {};
        const currentPhotos = customData.fotos || notariaInfo.fotos || [];
        
        if (photoIndex >= currentPhotos.length || photoIndex < 0) {
            showUploadNotification('Error: Foto no encontrada', 'error');
            return;
        }
        
        // Eliminar directamente sin modal - más simple
        const confirmed = confirm(`¿Eliminar esta foto de ${notariaName}?\n\nFoto ${photoIndex + 1} de ${currentPhotos.length}`);
        
        if (confirmed) {
            deletePhoto(notariaId, photoIndex);
        }
        
    } catch (error) {
        ErrorHandler.log(error, 'confirmDeletePhoto');
        showUploadNotification('Error al confirmar eliminación', 'error');
    }
}

function deletePhoto(notariaId, photoIndex) {
    try {
        const notariaInfo = getNotariaByIdFromState(notariaId);
        if (!notariaInfo) {
            showUploadNotification('Error: Notaría no encontrada', 'error');
            return;
        }
        
        const customData = getCustomNotariaData(notariaId) || {};
        const currentPhotos = [...(customData.fotos || notariaInfo.fotos || [])];
        
        if (photoIndex >= currentPhotos.length || photoIndex < 0) {
            showUploadNotification('Error: Foto no encontrada', 'error');
            return;
        }
        
        currentPhotos.splice(photoIndex, 1);
        
        customData.fotos = currentPhotos;
        
        const success = saveCustomNotariaData(notariaId, customData);
        
        if (success) {
            showUploadNotification(`Foto eliminada de ${notariaInfo.name}. Quedan ${currentPhotos.length} fotos.`, 'success');
            
            // Desactivar modo eliminar
            deleteMode[notariaId] = false;
            
            const debouncedRefresh = DebounceUtils.debounce(() => {
                refreshNotariaDisplay(notariaId);
            }, 500, `refresh_${notariaId}`);
            
            debouncedRefresh();
            
        } else {
            showUploadNotification('Error eliminando la foto. Intenta de nuevo.', 'error');
        }
    } catch (error) {
        ErrorHandler.log(error, 'deletePhoto');
        showUploadNotification('Error eliminando la foto', 'error');
    }
}

// Funciones de modales y UI
function openPhotoModal(foto, notariaName) {
    try {
        const existingModal = DOMUtils.safeGetElement('.photo-modal');
        if (existingModal) {
            DOMUtils.safeRemove(existingModal);
        }
        
        const modal = document.createElement('div');
        modal.className = 'photo-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="closePhotoModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <span class="modal-title">${notariaName}</span>
                    <button class="modal-close" onclick="closePhotoModal()">×</button>
                </div>
                <div class="modal-image">
                    <img src="${foto}" alt="${notariaName}" onerror="this.style.display='none';">
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        DOMUtils.safeSetStyle(document.body, 'overflow', 'hidden');
    } catch (error) {
        ErrorHandler.log(error, 'openPhotoModal');
    }
}

function closePhotoModal() {
    try {
        const modal = DOMUtils.safeGetElement('.photo-modal');
        if (modal) {
            DOMUtils.safeRemove(modal);
            DOMUtils.safeSetStyle(document.body, 'overflow', 'auto');
        }
    } catch (error) {
        ErrorHandler.log(error, 'closePhotoModal');
    }
}

// NUEVA FUNCIONALIDAD MEJORADA: EDITOR DE SERVICIOS CON EDICIÓN INLINE
function showServicesEditor(notariaId, notariaName) {
    try {
        const existingModal = DOMUtils.safeGetElement('.services-editor-modal');
        if (existingModal) {
            DOMUtils.safeRemove(existingModal);
        }
        
        const customData = getCustomNotariaData(notariaId) || {};
        const currentServices = customData.serviciosOnline || [];
        
        const modal = document.createElement('div');
        modal.className = 'services-editor-modal';
        modal.innerHTML = `
            <div class="editor-backdrop" onclick="closeServicesEditor()"></div>
            <div class="editor-content">
                <div class="editor-header">
                    <h3>📋 Editar Servicios Digitales</h3>
                    <button class="editor-close" onclick="closeServicesEditor()">×</button>
                </div>
                
                <div class="editor-body">
                    <div class="editor-subtitle">
                        <span class="notaria-name-highlight">${notariaName}</span>
                        <span class="services-count">${currentServices.length}/10 servicios</span>
                    </div>
                    
                    <!-- Input para agregar nuevo servicio -->
                    <div class="services-input-area">
                        <div class="input-container">
                            <input type="text" id="new-service-input" placeholder="Ej: Escrituras Públicas Digitales" maxlength="60">
                            <span class="char-counter">0/60</span>
                        </div>
                        <button onclick="addNewService()" class="add-service-btn" id="add-service-btn">
                            ➕ Agregar
                        </button>
                    </div>
                    
                    <!-- Lista de servicios editables -->
                    <div class="current-services" id="current-services-list">
                        <!-- Se genera dinámicamente -->
                    </div>
                    
                    <!-- Templates rápidos -->
                    <div class="services-templates">
                        <h4>🚀 Plantillas Rápidas</h4>
                        <div class="template-services">
                            ${getServiceTemplates().map(template => `
                                <span class="template-service" onclick="addServiceFromTemplate('${template}')">${template}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Consejos -->
                    <div class="services-tips">
                        <div class="tip-icon">💡</div>
                        <div class="tip-content">
                            <strong>Consejos:</strong> Usa nombres claros y específicos. Máximo 60 caracteres por servicio.
                        </div>
                    </div>
                </div>
                
                <div class="editor-footer">
                    <button class="save-services-btn" onclick="saveServices('${notariaId}')">
                        💾 Guardar Cambios
                    </button>
                    <button class="cancel-services-btn" onclick="closeServicesEditor()">Cancelar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        DOMUtils.safeSetStyle(document.body, 'overflow', 'hidden');
        
        // Configurar datos temporales
        if (!window.tempServicesData) {
            window.tempServicesData = {};
        }
        
        window.tempServicesData = {
            notariaId: notariaId,
            services: [...currentServices]
        };
        
        // Configurar eventos del input
        setupServiceInputEvents();
        
        // Mostrar servicios actuales
        updateServicesDisplay();
        
        // Focus en el input
        const input = DOMUtils.safeGetElement('new-service-input');
        if (input) {
            setTimeout(() => input.focus(), 100);
        }
        
    } catch (error) {
        ErrorHandler.log(error, 'showServicesEditor');
    }
}

function setupServiceInputEvents() {
    try {
        const input = DOMUtils.safeGetElement('new-service-input');
        const addBtn = DOMUtils.safeGetElement('add-service-btn');
        const charCounter = document.querySelector('.char-counter');
        
        if (input) {
            // Contador de caracteres
            const updateCharCounter = () => {
                if (charCounter) {
                    const length = input.value.length;
                    charCounter.textContent = `${length}/60`;
                    charCounter.style.color = length > 50 ? '#f59e0b' : length > 55 ? '#ef4444' : '#94a3b8';
                }
            };
            
            // Validación en tiempo real
            const validateInput = () => {
                const value = input.value.trim();
                const isValid = value.length > 0 && value.length <= 60;
                const isDuplicate = window.tempServicesData && window.tempServicesData.services.includes(value);
                const isAtLimit = window.tempServicesData && window.tempServicesData.services.length >= 10;
                
                if (addBtn) {
                    addBtn.disabled = !isValid || isDuplicate || isAtLimit;
                    addBtn.style.opacity = addBtn.disabled ? '0.5' : '1';
                    
                    if (isDuplicate) {
                        addBtn.textContent = '⚠️ Duplicado';
                    } else if (isAtLimit) {
                        addBtn.textContent = '🚫 Límite';
                    } else {
                        addBtn.textContent = '➕ Agregar';
                    }
                }
                
                // Estilo del input
                input.style.borderColor = isDuplicate ? '#ef4444' : '#4dff00';
            };
            
            input.addEventListener('input', () => {
                updateCharCounter();
                validateInput();
            });
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !addBtn.disabled) {
                    addNewService();
                }
            });
            
            // Llamadas iniciales
            updateCharCounter();
            validateInput();
        }
    } catch (error) {
        ErrorHandler.log(error, 'setupServiceInputEvents');
    }
}

function updateServicesDisplay() {
    try {
        const container = DOMUtils.safeGetElement('current-services-list');
        if (!container || !window.tempServicesData) return;
        
        const services = window.tempServicesData.services;
        
        // Actualizar contador
        const countElement = document.querySelector('.services-count');
        if (countElement) {
            countElement.textContent = `${services.length}/10 servicios`;
            countElement.style.color = services.length >= 10 ? '#ef4444' : services.length >= 8 ? '#f59e0b' : '#4dff00';
        }
        
        container.innerHTML = services.length > 0 ? 
            services.map((service, index) => `
                <div class="service-edit-item" data-index="${index}">
                    <div class="service-item-content">
                        <span class="service-number">${index + 1}.</span>
                        <div class="service-text-container">
                            <span class="service-text" id="service-text-${index}" onclick="startEditingService(${index})">${service}</span>
                            <input type="text" class="service-edit-input hidden" id="service-input-${index}" value="${service}" maxlength="60" onblur="finishEditingService(${index})" onkeypress="handleServiceEditKeypress(event, ${index})">
                        </div>
                        <div class="service-actions">
                            <button class="edit-service-btn" onclick="startEditingService(${index})" title="Editar servicio">✏️</button>
                            <button class="remove-service-btn" onclick="removeService(${index})" title="Eliminar servicio">🗑️</button>
                        </div>
                    </div>
                </div>
            `).join('') :
            `<div class="no-services-message">
                <div class="no-services-icon">📝</div>
                <div class="no-services-content">
                    <span class="no-services-title">No hay servicios agregados</span>
                    <span class="no-services-subtitle">Agrega servicios para mostrar las capacidades digitales de la notaría</span>
                </div>
            </div>`;
            
        // Reconfigurar eventos después de actualizar el DOM
        setTimeout(() => {
            setupServiceInputEvents();
        }, 100);
            
    } catch (error) {
        ErrorHandler.log(error, 'updateServicesDisplay');
    }
}

// NUEVAS FUNCIONES PARA EDICIÓN INLINE
function startEditingService(index) {
    try {
        if (!window.tempServicesData || index < 0 || index >= window.tempServicesData.services.length) {
            return;
        }
        
        const textSpan = DOMUtils.safeGetElement(`service-text-${index}`);
        const input = DOMUtils.safeGetElement(`service-input-${index}`);
        
        if (textSpan && input) {
            textSpan.classList.add('hidden');
            input.classList.remove('hidden');
            input.focus();
            input.select();
        }
    } catch (error) {
        ErrorHandler.log(error, 'startEditingService');
    }
}

function finishEditingService(index) {
    try {
        if (!window.tempServicesData || index < 0 || index >= window.tempServicesData.services.length) {
            return;
        }
        
        const textSpan = DOMUtils.safeGetElement(`service-text-${index}`);
        const input = DOMUtils.safeGetElement(`service-input-${index}`);
        
        if (textSpan && input) {
            const newValue = input.value.trim();
            
            if (newValue && newValue !== window.tempServicesData.services[index]) {
                // Verificar si no es duplicado
                const isDuplicate = window.tempServicesData.services.some((service, i) => 
                    i !== index && service === newValue
                );
                
                if (!isDuplicate) {
                    window.tempServicesData.services[index] = newValue;
                    textSpan.textContent = newValue;
                    showUploadNotification('Servicio actualizado', 'success');
                } else {
                    input.value = window.tempServicesData.services[index];
                    showUploadNotification('Ese servicio ya existe', 'warning');
                }
            } else {
                input.value = window.tempServicesData.services[index];
            }
            
            textSpan.classList.remove('hidden');
            input.classList.add('hidden');
        }
    } catch (error) {
        ErrorHandler.log(error, 'finishEditingService');
    }
}

function handleServiceEditKeypress(event, index) {
    try {
        if (event.key === 'Enter') {
            finishEditingService(index);
        } else if (event.key === 'Escape') {
            const textSpan = DOMUtils.safeGetElement(`service-text-${index}`);
            const input = DOMUtils.safeGetElement(`service-input-${index}`);
            
            if (textSpan && input && window.tempServicesData) {
                input.value = window.tempServicesData.services[index];
                textSpan.classList.remove('hidden');
                input.classList.add('hidden');
            }
        }
    } catch (error) {
        ErrorHandler.log(error, 'handleServiceEditKeypress');
    }
}

function getServiceTemplates() {
    return [
        'Escrituras Públicas Digitales',
        'Poderes Especiales Online',
        'Legalizaciones Remotas',
        'Testamentos Digitales',
        'Certificados Online',
        'Mandatos Especiales',
        'Documentos Comerciales',
        'Autorizaciones Digitales',
        'Consultas Virtuales',
        'Firma Electrónica',
        'Trámites Express',
        'Atención 24/7 Online',
        'Gestión Inmobiliaria',
        'Contratos Digitales',
        'Autenticaciones Remotas'
    ];
}

function addNewService() {
    try {
        const input = DOMUtils.safeGetElement('new-service-input');
        if (!input || !window.tempServicesData) return;
        
        const service = input.value.trim();
        
        if (service && window.tempServicesData.services.length < 10) {
            if (!window.tempServicesData.services.includes(service)) {
                window.tempServicesData.services.push(service);
                input.value = '';
                updateServicesDisplay();
                showUploadNotification(`Servicio "${service}" agregado`, 'success');
                
                // Focus en el input para agregar más
                setTimeout(() => input.focus(), 100);
            } else {
                showUploadNotification('Ese servicio ya existe', 'warning');
                input.focus();
            }
        } else if (window.tempServicesData.services.length >= 10) {
            showUploadNotification('Máximo 10 servicios permitidos', 'error');
        } else if (!service) {
            showUploadNotification('Escribe el nombre del servicio', 'warning');
            input.focus();
        }
    } catch (error) {
        ErrorHandler.log(error, 'addNewService');
    }
}

function addServiceFromTemplate(template) {
    try {
        if (!window.tempServicesData) return;
        
        if (window.tempServicesData.services.length < 10) {
            if (!window.tempServicesData.services.includes(template)) {
                window.tempServicesData.services.push(template);
                updateServicesDisplay();
                showUploadNotification(`Servicio "${template}" agregado`, 'success');
            } else {
                showUploadNotification('Ese servicio ya existe', 'warning');
            }
        } else {
            showUploadNotification('Máximo 10 servicios permitidos', 'error');
        }
    } catch (error) {
        ErrorHandler.log(error, 'addServiceFromTemplate');
    }
}

function removeService(index) {
    try {
        if (!window.tempServicesData || index < 0 || index >= window.tempServicesData.services.length) {
            return;
        }
        
        const serviceName = window.tempServicesData.services[index];
        const confirmed = confirm(`¿Eliminar "${serviceName}"?`);
        
        if (confirmed) {
            window.tempServicesData.services.splice(index, 1);
            updateServicesDisplay();
            showUploadNotification(`Servicio eliminado`, 'success');
        }
    } catch (error) {
        ErrorHandler.log(error, 'removeService');
    }
}

function saveServices(notariaId) {
    try {
        if (!window.tempServicesData) {
            showUploadNotification('Error: Datos temporales no encontrados', 'error');
            return;
        }
        
        const customData = getCustomNotariaData(notariaId) || {};
        customData.serviciosOnline = window.tempServicesData.services;
        
        if (saveCustomNotariaData(notariaId, customData)) {
            const count = window.tempServicesData.services.length;
            showUploadNotification(`✅ ${count} servicios guardados correctamente`, 'success');
            closeServicesEditor();
            
            const debouncedRefresh = DebounceUtils.debounce(() => {
                refreshNotariaDisplay(notariaId);
            }, 500, `refresh_services_${notariaId}`);
            
            debouncedRefresh();
        } else {
            showUploadNotification('Error guardando servicios', 'error');
        }
    } catch (error) {
        ErrorHandler.log(error, 'saveServices');
        showUploadNotification('Error guardando servicios', 'error');
    }
}

function closeServicesEditor() {
    try {
        const modal = DOMUtils.safeGetElement('.services-editor-modal');
        if (modal) {
            const listenerId = modal.getAttribute('data-listener-id');
            if (listenerId) {
                MemoryManager.removeEventListenerTracked(listenerId);
            }
            
            DOMUtils.safeRemove(modal);
            DOMUtils.safeSetStyle(document.body, 'overflow', 'auto');
        }
        
        if (window.tempServicesData) {
            delete window.tempServicesData;
        }
    } catch (error) {
        ErrorHandler.log(error, 'closeServicesEditor');
    }
}

function showPhotoSpecs(type, notariaName = '') {
    try {
        const existingModal = DOMUtils.safeGetElement('.photo-specs-modal');
        if (existingModal) {
            DOMUtils.safeRemove(existingModal);
        }
        
        const specs = PHOTO_SPECS[type];
        const modal = document.createElement('div');
        modal.className = 'photo-specs-modal';
        modal.innerHTML = `
            <div class="specs-backdrop" onclick="closePhotoSpecs()"></div>
            <div class="specs-content">
                <div class="specs-header">
                    <h3>📐 Especificaciones de Imagen</h3>
                    <button class="specs-close" onclick="closePhotoSpecs()">×</button>
                </div>
                
                <div class="specs-body">
                    <div class="spec-section">
                        <h4>${specs.title}</h4>
                        ${notariaName ? `<p class="notaria-context">Para: <strong>${notariaName}</strong></p>` : ''}
                        
                        <div class="dimensions-info">
                            <div class="dimension-item optimal">
                                <span class="dimension-label">ÓPTIMO:</span>
                                <span class="dimension-value">${specs.optimal.width} x ${specs.optimal.height} px</span>
                            </div>
                            
                            <div class="dimension-item acceptable">
                                <span class="dimension-label">ACEPTABLE:</span>
                                <span class="dimension-value">${specs.acceptable.minWidth}-${specs.acceptable.maxWidth} x ${specs.acceptable.minHeight}-${specs.acceptable.maxHeight} px</span>
                            </div>
                            
                            <div class="dimension-item ratio">
                                <span class="dimension-label">RATIO:</span>
                                <span class="dimension-value">${specs.optimal.ratio}:1 (ancho:alto)</span>
                            </div>
                        </div>
                        
                        <div class="specs-tips">
                            <div class="tip-icon">💡</div>
                            <div class="tip-text">
                                <strong>Consejos:</strong><br>
                                ${specs.tips}
                            </div>
                        </div>
                        
                        <div class="specs-limits">
                            <div class="limit-item">
                                <span class="limit-icon">📏</span>
                                <span class="limit-text">Tamaño máximo: 20MB por imagen (alta calidad)</span>
                            </div>
                            <div class="limit-item">
                                <span class="limit-icon">🖼️</span>
                                <span class="limit-text">Formatos: JPG, PNG, WebP</span>
                            </div>
                            ${type === 'gallery' ? `
                            <div class="limit-item">
                                <span class="limit-icon">📸</span>
                                <span class="limit-text">Máximo ${PHOTO_LIMITS.GALLERY} fotos en galería</span>
                            </div>` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="specs-footer">
                    <button class="cancel-btn" onclick="closePhotoSpecs()">Cerrar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        DOMUtils.safeSetStyle(document.body, 'overflow', 'hidden');
    } catch (error) {
        ErrorHandler.log(error, 'showPhotoSpecs');
    }
}

function closePhotoSpecs() {
    try {
        const modal = DOMUtils.safeGetElement('.photo-specs-modal');
        if (modal) {
            DOMUtils.safeRemove(modal);
            DOMUtils.safeSetStyle(document.body, 'overflow', 'auto');
        }
    } catch (error) {
        ErrorHandler.log(error, 'closePhotoSpecs');
    }
}

// ============================================
// NUEVA FUNCIONALIDAD: BOTÓN DE SCROLL HACIA ARRIBA
// ============================================

let scrollToTopButton = null;
let scrollThreshold = 300; // Pixeles de scroll antes de mostrar el botón

function createScrollToTopButton() {
    try {
        if (scrollToTopButton) {
            return; // Ya existe
        }
        
        scrollToTopButton = document.createElement('button');
        scrollToTopButton.id = 'scroll-to-top';
        scrollToTopButton.className = 'scroll-to-top-btn hidden';
        scrollToTopButton.innerHTML = '';  // Vacío para que CSS tome control
        scrollToTopButton.title = 'Volver al inicio';
        scrollToTopButton.setAttribute('aria-label', 'Volver al inicio de la página');
        
        // Agregar al body
        document.body.appendChild(scrollToTopButton);
        
        // Evento click
        scrollToTopButton.addEventListener('click', scrollToTop);
        
        console.log('Botón de scroll hacia arriba creado');
    } catch (error) {
        ErrorHandler.log(error, 'createScrollToTopButton');
    }
}

function scrollToTop() {
    try {
        // Scroll suave hacia arriba
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Feedback visual
        showUploadNotification('📍 Volviendo al inicio...', 'info');
        
        // Ocultar el botón temporalmente después del click
        if (scrollToTopButton) {
            scrollToTopButton.style.transform = 'translateY(100px) scale(0.8)';
            scrollToTopButton.style.opacity = '0.3';
            
            setTimeout(() => {
                if (scrollToTopButton) {
                    scrollToTopButton.style.transform = '';
                    scrollToTopButton.style.opacity = '';
                }
            }, 1000);
        }
        
    } catch (error) {
        ErrorHandler.log(error, 'scrollToTop');
    }
}

function handleScroll() {
    try {
        if (!scrollToTopButton) {
            return;
        }
        
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        
        if (scrollY > scrollThreshold) {
            // Mostrar botón
            if (scrollToTopButton.classList.contains('hidden')) {
                scrollToTopButton.classList.remove('hidden');
                scrollToTopButton.classList.add('visible');
            }
        } else {
            // Ocultar botón
            if (scrollToTopButton.classList.contains('visible')) {
                scrollToTopButton.classList.remove('visible');
                scrollToTopButton.classList.add('hidden');
            }
        }
    } catch (error) {
        ErrorHandler.log(error, 'handleScroll');
    }
}

function initializeScrollButton() {
    try {
        createScrollToTopButton();
        
        // Debounced scroll handler para mejor performance
        const debouncedScrollHandler = DebounceUtils.debounce(handleScroll, 100, 'scroll_handler');
        
        // Agregar event listener al scroll
        MemoryManager.addEventListenerTracked(window, 'scroll', debouncedScrollHandler, { passive: true });
        
        console.log('Sistema de scroll hacia arriba inicializado');
    } catch (error) {
        ErrorHandler.log(error, 'initializeScrollButton');
    }
}

// Sistema de notificaciones optimizado
let notificationTimeout = null;

function showUploadNotification(message, type = 'info') {
    try {
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
            notificationTimeout = null;
        }
        
        const existingNotification = DOMUtils.safeGetElement('.upload-notification');
        if (existingNotification) {
            DOMUtils.safeRemove(existingNotification);
        }
        
        const notification = document.createElement('div');
        notification.className = `upload-notification upload-notification-${type}`;
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
            top: 80px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10001;
            animation: slideInRight 0.3s ease;
            max-width: 420px;
            font-family: 'Segoe UI', sans-serif;
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
        
        notificationTimeout = setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    DOMUtils.safeRemove(notification);
                }, 300);
            }
            notificationTimeout = null;
        }, 5000);
        
    } catch (error) {
        ErrorHandler.log(error, 'showUploadNotification');
    }
}

// Inicialización optimizada
document.addEventListener('DOMContentLoaded', function() {
    try {
        if (testSessionStorage()) {
            console.log('✅ Sistema SessionStorage listo');
        } else {
            console.warn('⚠️ Problema con SessionStorage - usando método de respaldo');
        }
        
        if (isSessionStorageAvailable()) {
            try {
                sessionStorage.removeItem('selectedNotary');
            } catch (error) {
                ErrorHandler.log(error, 'SessionStorage cleanup');
            }
        }
        
        const storageUsage = StorageManager.getQuotaUsage();
        
        if (parseFloat(storageUsage.percentage) > 80) {
            StorageManager.cleanOldData();
        }
        
        // Inicializar estado
        currentState = {
            selectedComuna: null,
            currentNotarias: [],
            displayedNotarias: {},
            allNotarias: []
        };
        
        deleteMode = {};
        
        if (typeof activeUploads !== 'undefined') {
            activeUploads.clear();
        }
        
        // Inicializar página basado en parámetros URL
        initializePage();
        
        // Inicializar botón de scroll hacia arriba
        initializeScrollButton();
        
        console.log('🚀 Notarías Bio Bio inicializado correctamente');
        console.log('📱 Botón de scroll hacia arriba activado');
        
    } catch (error) {
        ErrorHandler.log(error, 'DOMContentLoaded');
    }
});

// Cleanup al cerrar la página
window.addEventListener('beforeunload', function() {
    try {
        MemoryManager.cleanupAll();
        
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
        }
        
        // Cleanup del botón de scroll
        if (scrollToTopButton) {
            scrollToTopButton.remove();
            scrollToTopButton = null;
        }
        
    } catch (error) {
        ErrorHandler.log(error, 'beforeunload cleanup');
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
    
    const btnBack = document.querySelector('.back-btn');
    if (btnBack) {
        btnBack.onclick = function() {
            window.location.href = 'index.html';
        };
    }
});

console.log('✅ Notarías Bio Bio - Modales, Upload y Eventos cargado correctamente');