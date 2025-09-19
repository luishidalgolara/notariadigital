// ========================================
// 🔵 SCRIPT 2 - CLASES Y INICIALIZACIÓN DEL SISTEMA
// ========================================

// ===== CLASE PROCESADOR DE FOTOS CARNET DOBLE =====
class PhotoCarnetDualProcessor {
    constructor() {
        this.currentType = null;
        this.currentStep = 'frente'; // 'frente' | 'reverso'
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.context = null;
        this.isCapturing = false;
        this.tempImages = { frente: null, reverso: null };
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        console.log('📷 Procesador de Fotos Carnet Doble inicializado');
    }

    setupElements() {
        this.video = document.getElementById('cameraVideo');
        this.canvas = document.getElementById('captureCanvas');
        if (this.canvas) {
            this.context = this.canvas.getContext('2d');
        }
    }

    setupEventListeners() {
        // Cerrar modal
        document.getElementById('photoModalClose')?.addEventListener('click', () => {
            this.closeModal();
        });

        // Capturar foto
        document.getElementById('captureBtn')?.addEventListener('click', () => {
            this.capturePhoto();
        });

        // Reintentar foto actual
        document.getElementById('retryBtn')?.addEventListener('click', () => {
            this.retryCurrentPhoto();
        });

        // Siguiente paso (frente -> reverso)
        document.getElementById('nextBtn')?.addEventListener('click', () => {
            this.nextStep();
        });

        // Reiniciar todo el proceso
        document.getElementById('restartBtn')?.addEventListener('click', () => {
            this.restartProcess();
        });

        // Confirmar todas las fotos
        document.getElementById('confirmAllBtn')?.addEventListener('click', () => {
            this.confirmAllPhotos();
        });

        // Cerrar al hacer clic fuera del modal
        document.getElementById('photoModalOverlay')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });
    }

    async openModal(type) {
        console.log(`📷 Abriendo modal de foto carnet doble para: ${type}`);
        
        if (!this.validateUserData(type)) {
            return;
        }

        this.currentType = type;
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.resetModal();
        
        // Mostrar modal
        const modalOverlay = document.getElementById('photoModalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.add('active');
            
            // Iniciar cámara después de que el modal esté visible
            setTimeout(() => {
                this.startCamera();
            }, 300);
        }
    }

    validateUserData(type) {
        const nombreField = document.getElementById(`nombre${type.charAt(0).toUpperCase() + type.slice(1)}`);
        
        if (!nombreField || !nombreField.value.trim()) {
            showNotification('Complete el nombre antes de tomar las fotos del carnet', 'warning');
            return false;
        }

        return true;
    }

    resetModal() {
        // Ocultar todos los contenedores
        document.getElementById('photoLoading').style.display = 'block';
        document.getElementById('cameraContainer').style.display = 'none';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('photosSummary').style.display = 'none';
        
        // Resetear progreso visual
        this.updateProgressSteps();
        
        // Limpiar vistas previas
        const preview = document.getElementById('photoPreview');
        if (preview) preview.src = '';
        
        this.isCapturing = false;
    }

    updateProgressSteps() {
        const stepFrente = document.getElementById('stepFrente');
        const stepReverso = document.getElementById('stepReverso');
        
        // Reset classes
        stepFrente.classList.remove('active', 'completed', 'pending');
        stepReverso.classList.remove('active', 'completed', 'pending');
        
        if (this.currentStep === 'frente') {
            stepFrente.classList.add('active');
            stepReverso.classList.add('pending');
        } else if (this.currentStep === 'reverso') {
            stepFrente.classList.add('completed');
            stepReverso.classList.add('active');
        } else if (this.currentStep === 'completed') {
            stepFrente.classList.add('completed');
            stepReverso.classList.add('completed');
        }
    }

    async startCamera() {
        console.log('📷 Iniciando cámara...');
        
        try {
            // Mostrar loading
            this.showLoading('Iniciando cámara...', 'Solicitando permisos de acceso a la cámara');

            // Configuración de la cámara
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'environment' // Cámara trasera preferida
                },
                audio: false
            };

            // Solicitar acceso a la cámara
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            if (this.video) {
                this.video.srcObject = this.stream;
                
                // Esperar a que el video esté listo
                await new Promise((resolve) => {
                    this.video.onloadedmetadata = resolve;
                });

                // Configurar canvas con las dimensiones del video
                if (this.canvas) {
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;
                }

                // Mostrar la interfaz de la cámara
                this.showCamera();
                console.log('✅ Cámara iniciada correctamente');
            }

        } catch (error) {
            console.error('❌ Error al acceder a la cámara:', error);
            this.handleCameraError(error);
        }
    }

    showLoading(title, message) {
        const loading = document.getElementById('photoLoading');
        if (loading) {
            loading.querySelector('h3').textContent = title;
            loading.querySelector('p').textContent = message;
            loading.style.display = 'block';
        }
        
        document.getElementById('cameraContainer').style.display = 'none';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('photosSummary').style.display = 'none';
    }

    showCamera() {
        // Actualizar UI según el paso actual
        this.updateCameraUI();
        
        document.getElementById('photoLoading').style.display = 'none';
        document.getElementById('cameraContainer').style.display = 'block';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('photosSummary').style.display = 'none';
    }

    showPreview() {
        // Actualizar UI de vista previa
        this.updatePreviewUI();
        
        document.getElementById('photoLoading').style.display = 'none';
        document.getElementById('cameraContainer').style.display = 'none';
        document.getElementById('previewContainer').style.display = 'block';
        document.getElementById('photosSummary').style.display = 'none';
    }

    showSummary() {
        // Mostrar ambas fotos en resumen
        this.updateSummaryUI();
        
        document.getElementById('photoLoading').style.display = 'none';
        document.getElementById('cameraContainer').style.display = 'none';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('photosSummary').style.display = 'block';
    }

    updateCameraUI() {
        const status = document.getElementById('photoStatus');
        const overlay = document.getElementById('cameraOverlay');
        
        if (this.currentStep === 'frente') {
            status.querySelector('h3').textContent = 'Posicione el FRENTE de su carnet en el recuadro';
            status.querySelector('p').textContent = 'Debe verse la foto, nombre y RUT claramente';
            overlay.className = 'camera-overlay frente';
        } else if (this.currentStep === 'reverso') {
            status.querySelector('h3').textContent = 'Ahora posicione el REVERSO de su carnet';
            status.querySelector('p').textContent = 'Debe verse la dirección y fecha de vencimiento';
            overlay.className = 'camera-overlay reverso';
        }
        
        this.updateProgressSteps();
    }

    updatePreviewUI() {
        const status = document.getElementById('previewStatus');
        const nextBtn = document.getElementById('nextBtn');
        
        if (this.currentStep === 'frente') {
            status.querySelector('h3').textContent = 'Vista previa del FRENTE';
            status.querySelector('p').textContent = 'Verifique que se vea la foto, nombre y RUT';
            nextBtn.querySelector('span:last-child').textContent = 'Continuar al Reverso';
        } else if (this.currentStep === 'reverso') {
            status.querySelector('h3').textContent = 'Vista previa del REVERSO';
            status.querySelector('p').textContent = 'Verifique que se vea la dirección y vencimiento';
            nextBtn.querySelector('span:last-child').textContent = 'Finalizar Capturas';
        }
    }

    updateSummaryUI() {
        const summaryFrente = document.getElementById('summaryFrente');
        const summaryReverso = document.getElementById('summaryReverso');
        
        if (summaryFrente && this.tempImages.frente) {
            summaryFrente.src = this.tempImages.frente;
        }
        
        if (summaryReverso && this.tempImages.reverso) {
            summaryReverso.src = this.tempImages.reverso;
        }
    }

    handleCameraError(error) {
        let errorMessage = 'Error desconocido al acceder a la cámara';
        let errorDetail = 'Intente nuevamente o verifique los permisos';

        if (error.name === 'NotAllowedError') {
            errorMessage = 'Acceso a la cámara denegado';
            errorDetail = 'Debe permitir el acceso a la cámara para tomar fotos';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'No se encontró cámara';
            errorDetail = 'Verifique que su dispositivo tenga una cámara conectada';
        } else if (error.name === 'NotSupportedError') {
            errorMessage = 'Cámara no compatible';
            errorDetail = 'Su navegador no soporta el acceso a la cámara';
        }

        this.showLoading(errorMessage, errorDetail);
        showNotification(errorMessage + ': ' + errorDetail, 'error');
    }

    capturePhoto() {
        if (!this.video || !this.canvas || !this.context || this.isCapturing) {
            return;
        }

        console.log(`📸 Capturando foto del ${this.currentStep}...`);
        this.isCapturing = true;

        try {
            // Capturar frame del video al canvas
            this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            
            // Convertir a imagen
            const imageData = this.canvas.toDataURL('image/jpeg', 0.8);
            
            // Guardar en temporal
            this.tempImages[this.currentStep] = imageData;
            
            // Mostrar vista previa
            const preview = document.getElementById('photoPreview');
            if (preview) {
                preview.src = imageData;
            }
            
            // Cambiar a vista previa
            this.showPreview();
            
            console.log(`✅ Foto del ${this.currentStep} capturada correctamente`);
            showNotification(`Foto del ${this.currentStep} capturada. Revise antes de continuar.`, 'info');

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            showNotification('Error al capturar la foto. Intente nuevamente.', 'error');
        }

        this.isCapturing = false;
    }

    retryCurrentPhoto() {
        console.log(`🔄 Reintentando captura del ${this.currentStep}...`);
        this.tempImages[this.currentStep] = null;
        this.showCamera();
    }

    nextStep() {
        if (this.currentStep === 'frente' && this.tempImages.frente) {
            // Pasar al reverso
            this.currentStep = 'reverso';
            this.showCamera();
            showNotification('Ahora capture el reverso del carnet', 'info');
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            // Completar proceso - mostrar resumen
            this.currentStep = 'completed';
            this.showSummary();
            showNotification('Ambas fotos capturadas. Revise antes de confirmar.', 'success');
        }
    }

    restartProcess() {
        console.log('🔄 Reiniciando proceso completo...');
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        showNotification('Proceso reiniciado. Capture nuevamente el frente.', 'info');
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            showNotification('Faltan fotos por capturar', 'error');
            return;
        }

        console.log('✅ Confirmando ambas fotos del carnet...');

        try {
            // Procesar ambas imágenes
            const processedFrente = await this.processCarnetImage(this.tempImages.frente);
            const processedReverso = await this.processCarnetImage(this.tempImages.reverso);
            
            // Asegurar que el estado global esté inicializado
            if (!fotosCarnet[this.currentType]) {
                fotosCarnet[this.currentType] = {
                    frente: { captured: false, imageData: null, timestamp: null },
                    reverso: { captured: false, imageData: null, timestamp: null },
                    completed: false
                };
            }
            
            // Guardar en el estado global
            fotosCarnet[this.currentType] = {
                frente: {
                    captured: true,
                    imageData: processedFrente,
                    timestamp: new Date().toISOString()
                },
                reverso: {
                    captured: true,
                    imageData: processedReverso,
                    timestamp: new Date().toISOString()
                },
                completed: true
            };

            // Actualizar botón
            this.updateButton(this.currentType, true);
            
            // Actualizar progreso
            if (typeof updateProgress === 'function') {
                updateProgress();
            }

            // Cerrar modal
            this.closeModal();
            
            showNotification(`Carnet completo de ${this.currentType} guardado correctamente`, 'success');

        } catch (error) {
            console.error('❌ Error al confirmar fotos:', error);
            showNotification('Error al procesar las fotos. Intente nuevamente.', 'error');
        }
    }

    async processCarnetImage(imageData) {
        console.log('🖼️ Procesando imagen del carnet...');
        
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calcular dimensiones optimizadas (max 800px de ancho)
                const maxWidth = 800;
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                const newWidth = img.width * ratio;
                const newHeight = img.height * ratio;
                
                // Redimensionar
                canvas.width = newWidth;
                canvas.height = newHeight;
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                
                // Mejorar contraste y nitidez básico
                const imageDataCtx = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageDataCtx.data;
                
                // Aplicar mejoras básicas
                for (let i = 0; i < data.length; i += 4) {
                    // Aumentar contraste ligeramente
                    data[i] = Math.min(255, data[i] * 1.1);     // R
                    data[i + 1] = Math.min(255, data[i + 1] * 1.1); // G
                    data[i + 2] = Math.min(255, data[i + 2] * 1.1); // B
                }
                
                ctx.putImageData(imageDataCtx, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            
            img.onerror = () => {
                console.warn('⚠️ Error en procesamiento, usando imagen original');
                resolve(imageData);
            };
            
            img.src = imageData;
        });
    }

    updateButton(type, completed) {
        const button = document.getElementById(`photo${type.charAt(0).toUpperCase() + type.slice(1)}`);
        if (button) {
            if (completed) {
                button.classList.add('uploaded');
                button.querySelector('.photo-text').textContent = 'FOTOS COMPLETAS';
            } else {
                button.classList.remove('uploaded');
                
                // Verificación defensiva del estado global
                const typeState = fotosCarnet[type];
                if (typeState && typeState.frente && typeState.reverso) {
                    const fronteStatus = typeState.frente.captured;
                    const reversoStatus = typeState.reverso.captured;
                    
                    if (fronteStatus && !reversoStatus) {
                        button.querySelector('.photo-text').textContent = '1/2 FOTOS';
                    } else if (!fronteStatus && !reversoStatus) {
                        button.querySelector('.photo-text').textContent = 'FOTO CARNET';
                    }
                } else {
                    button.querySelector('.photo-text').textContent = 'FOTO CARNET';
                }
            }
        }
    }

    closeModal() {
        console.log('📷 Cerrando modal de foto carnet doble...');
        
        // Detener cámara
        this.stopCamera();
        
        // Ocultar modal
        const modalOverlay = document.getElementById('photoModalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
        }
        
        // Limpiar estado temporal
        this.tempImages = { frente: null, reverso: null };
        this.currentType = null;
        this.currentStep = 'frente';
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
            });
            this.stream = null;
            console.log('📷 Cámara detenida');
        }
    }

    clearPhoto(type) {
        // Asegurar que el estado global fotosCarnet esté inicializado
        if (!fotosCarnet[type]) {
            fotosCarnet[type] = {
                frente: { captured: false, imageData: null, timestamp: null },
                reverso: { captured: false, imageData: null, timestamp: null },
                completed: false
            };
        } else {
            fotosCarnet[type] = {
                frente: { captured: false, imageData: null, timestamp: null },
                reverso: { captured: false, imageData: null, timestamp: null },
                completed: false
            };
        }
        this.updateButton(type, false);
        console.log(`📷 Fotos del carnet de ${type} eliminadas`);
    }

    clearAllPhotos() {
        this.clearPhoto('arrendador');
        this.clearPhoto('arrendatario');
        console.log('📷 Todas las fotos de carnet eliminadas');
    }

    getPhotoData(type, side) {
        return fotosCarnet[type]?.[side]?.imageData || null;
    }

    isCompleted(type) {
        return fotosCarnet[type]?.completed || false;
    }
}

// ===== CLASE PROCESADOR DE FIRMAS DIGITALES =====
class FirmaDigitalProcessor {
    constructor() {
        this.processedImageData = null;
        this.currentType = null;
        this.firmasDigitales = {
            arrendador: null,
            arrendatario: null
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragDrop();
        console.log('🖋️ Procesador de Firmas Digitales inicializado');
    }

    setupEventListeners() {
        document.getElementById('firmaModalClose').addEventListener('click', () => this.closeModal());
        document.getElementById('firmaFileInput').addEventListener('change', (e) => {
            if (e.target.files[0]) this.handleFile(e.target.files[0]);
        });
        
        document.getElementById('firmaModalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal();
        });
    }

    setupDragDrop() {
        const uploadArea = document.getElementById('firmaUploadArea');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files[0]) this.handleFile(e.dataTransfer.files[0]);
        });
        uploadArea.addEventListener('click', () => {
            document.getElementById('firmaFileInput').click();
        });
    }

    openModal(type) {
        console.log(`🖋️ Abriendo modal para: ${type}`);
        
        if (!this.validateUserData(type)) {
            return;
        }
        
        this.currentType = type;
        this.resetModal();
        
        setTimeout(() => {
            const modalOverlay = document.getElementById('firmaModalOverlay');
            if (modalOverlay) {
                modalOverlay.classList.add('active');
                console.log('✅ Modal abierto correctamente');
            } else {
                console.error('❌ No se encontró el modal overlay');
            }
        }, 50);
    }

    validateUserData(type) {
        const requiredFields = [
            `nombre${type.charAt(0).toUpperCase() + type.slice(1)}`,
            `nacionalidad${type.charAt(0).toUpperCase() + type.slice(1)}`,
            `estadoCivil${type.charAt(0).toUpperCase() + type.slice(1)}`,
            `profesion${type.charAt(0).toUpperCase() + type.slice(1)}`,
            `rut${type.charAt(0).toUpperCase() + type.slice(1)}`,
            `ciudad${type.charAt(0).toUpperCase() + type.slice(1)}`,
            `domicilio${type.charAt(0).toUpperCase() + type.slice(1)}`,
            `comuna${type.charAt(0).toUpperCase() + type.slice(1)}`
        ];

        const emptyFields = [];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                emptyFields.push(fieldId);
            }
        });

        if (emptyFields.length > 0) {
            showNotification(`Complete todos los datos de ${type} antes de firmar. Faltan ${emptyFields.length} campos.`, 'warning');
            return false;
        }

        return true;
    }

    closeModal() {
        document.getElementById('firmaModalOverlay').classList.remove('active');
    }

    resetModal() {
        this.hideAlert();
        this.hideLoading();
        document.getElementById('firmaFileInput').value = '';
    }

    handleFile(file) {
        console.log('📁 Procesando archivo:', file.name, file.type, file.size);
        
        if (!file.type.startsWith('image/')) {
            this.showAlert('Por favor selecciona una imagen válida (PNG, JPG, JPEG)', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            this.showAlert('La imagen es muy grande. Máximo 5MB', 'error');
            return;
        }

        this.showLoading();
        console.log('⏳ Iniciando lectura de archivo...');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('✅ Archivo leído exitosamente');
            this.processImage(e.target.result);
        };
        reader.onerror = (e) => {
            console.error('❌ Error leyendo archivo:', e);
            this.hideLoading();
            this.showAlert('Error al leer el archivo', 'error');
        };
        reader.readAsDataURL(file);
    }

    processImage(dataURL) {
        console.log('🖼️ Procesando imagen...');
        const img = new Image();
        img.onload = () => {
            console.log(`📐 Dimensiones: ${img.width}x${img.height}`);
            try {
                const canvas = this.removeWhiteBackground(img);
                this.processedImageData = canvas.toDataURL('image/png');
                console.log('✅ Imagen procesada exitosamente');
                
                this.hideLoading();
                this.applySignature();
            } catch (error) {
                console.error('❌ Error procesando imagen:', error);
                this.hideLoading();
                this.showAlert('Error procesando imagen: ' + error.message, 'error');
            }
        };
        img.onerror = () => {
            console.error('❌ Error cargando imagen');
            this.hideLoading();
            this.showAlert('Error cargando la imagen', 'error');
        };
        img.src = dataURL;
    }

    removeWhiteBackground(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            
            const luminosity = 0.299 * r + 0.587 * g + 0.114 * b;
            const average = (r + g + b) / 3;
            const maxColor = Math.max(r, g, b);
            const minColor = Math.min(r, g, b);
            const colorDiff = maxColor - minColor;
            const saturation = maxColor > 0 ? (maxColor - minColor) / maxColor : 0;
            
            const isWhitish = luminosity > 160;
            const isGrayish = average > 140 && colorDiff < 40;
            const isLightColor = minColor > 120;
            const isNearWhite = r > 180 && g > 180 && b > 180;
            const isLowSaturation = saturation < 0.15 && average > 130;
            const isBeige = r > 150 && g > 145 && b > 130 && Math.abs(r-g) < 30;
            const isPaper = luminosity > 140 && colorDiff < 50;
            const isYellowish = r > 160 && g > 150 && b < 140 && r > b;
            
            if (isWhitish || isGrayish || isLightColor || isNearWhite || isLowSaturation || isBeige || isPaper || isYellowish) {
                data[i + 3] = 0;
            } else {
                const factor = 1.8;
                const darkness = 0.6;
                
                data[i] = Math.max(0, Math.min(255, data[i] * factor * darkness));
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * factor * darkness));
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * factor * darkness));
                data[i + 3] = 255;
            }
        }
        
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) {
                const r = data[i], g = data[i + 1], b = data[i + 2];
                const luminosity = 0.299 * r + 0.587 * g + 0.114 * b;
                const average = (r + g + b) / 3;
                
                if (luminosity > 80 || average > 90) {
                    data[i + 3] = 0;
                } else {
                    if (luminosity < 40) {
                        data[i] = Math.min(data[i], 50);
                        data[i + 1] = Math.min(data[i + 1], 50);
                        data[i + 2] = Math.min(data[i + 2], 50);
                    }
                    data[i + 3] = 255;
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    applySignature() {
        if (this.currentType && this.processedImageData) {
            this.firmasDigitales[this.currentType] = this.processedImageData;
            
            if (typeof firmasEstado !== 'undefined') {
                firmasEstado[this.currentType] = true;
            }
            
            const button = document.getElementById(`firma${this.currentType.charAt(0).toUpperCase() + this.currentType.slice(1)}`);
            if (button) {
                button.classList.add('signed');
                button.querySelector('.signature-text').textContent = 'FIRMADO DIGITALMENTE';
            }
            
            this.updateSignaturePreview(this.currentType, this.processedImageData);
            
            if (typeof updateProgress === 'function') {
                updateProgress();
            }
            
            this.closeModal();
            showNotification(`Firma digital de ${this.currentType} aplicada correctamente`, 'success');
        }
    }

    updateSignaturePreview(type, signatureData) {
        try {
            const placeholder = document.getElementById(`signaturePlaceholder${type.charAt(0).toUpperCase() + type.slice(1)}`);
            const preview = document.getElementById(`signaturePreview${type.charAt(0).toUpperCase() + type.slice(1)}`);
            
            if (placeholder && preview) {
                placeholder.style.display = 'none';
                preview.src = signatureData;
                preview.style.display = 'block';
                
                console.log(`✅ Vista previa de firma actualizada para ${type}`);
            } else {
                console.warn(`⚠️ No se encontraron elementos de vista previa para ${type}`);
            }
        } catch (error) {
            console.error('❌ Error actualizando vista previa:', error);
        }
    }

    getSignatureForPDF(type) {
        return this.firmasDigitales[type];
    }

    clearSignatures() {
        this.firmasDigitales.arrendador = null;
        this.firmasDigitales.arrendatario = null;
        
        ['arrendador', 'arrendatario'].forEach(type => {
            const button = document.getElementById(`firma${type.charAt(0).toUpperCase() + type.slice(1)}`);
            if (button) {
                button.classList.remove('signed');
                button.querySelector('.signature-text').textContent = 'FIRMA DIGITAL';
            }
            
            const placeholder = document.getElementById(`signaturePlaceholder${type.charAt(0).toUpperCase() + type.slice(1)}`);
            const preview = document.getElementById(`signaturePreview${type.charAt(0).toUpperCase() + type.slice(1)}`);
            
            if (placeholder && preview) {
                placeholder.style.display = 'inline';
                preview.style.display = 'none';
                preview.src = '';
            }
        });
        
        console.log('🧹 Firmas y vistas previas limpiadas');
    }

    showAlert(message, type) {
        const alert = document.getElementById('firmaAlert');
        if (alert) {
            alert.textContent = message;
            alert.className = `firma-alert ${type}`;
            alert.style.display = 'block';
            setTimeout(() => this.hideAlert(), 5000);
        }
        console.log(`🚨 Alert ${type}: ${message}`);
    }

    hideAlert() {
        document.getElementById('firmaAlert').style.display = 'none';
    }

    showLoading() {
        document.getElementById('firmaLoading').classList.add('active');
    }

    hideLoading() {
        document.getElementById('firmaLoading').classList.remove('active');
    }
}

// ===== EVENT LISTENERS Y INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    // Asegurar inicialización completa del estado de fotos carnet
    if (!window.fotosCarnet || !fotosCarnet.arrendador || !fotosCarnet.arrendatario) {
        console.warn('⚠️ Reinicializando estado de fotosCarnet');
        fotosCarnet.arrendador = {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        };
        fotosCarnet.arrendatario = {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        };
    }
    
    // Event listeners para actualizar vista previa
    formFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', updatePreview);
            element.addEventListener('change', updatePreview);
        }
    });
    
    // Event listeners para campos de RUT
    const rutFields = ['rutArrendador', 'rutArrendatario'];
    rutFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.addEventListener('input', function(e) {
                const formatted = formatRUT(e.target.value);
                e.target.value = formatted;
                
                if (formatted.length > 8) {
                    const isValid = validateRUT(formatted);
                    e.target.classList.toggle('rut-valid', isValid);
                    e.target.classList.toggle('rut-invalid', !isValid);
                } else {
                    e.target.classList.remove('rut-valid', 'rut-invalid');
                }
                
                updatePreview();
            });
        }
    });
    
    // Inicializar firma digital y foto carnet
    initializeDigitalSignature();
    initializePhotoCarnet();
    
    // Inicializar procesador de fotos carnet doble
    setTimeout(() => {
        window.photoProcessor = new PhotoCarnetDualProcessor();
        console.log('📷 PhotoCarnetDualProcessor inicializado globalmente');
    }, 100);
    
    // Auto-save cada 30 segundos
    setInterval(saveFormState, 30000);
    
    // Prevenir envío del formulario con Enter
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    });
    
    // Inicializar vista previa
    updatePreview();
    
    // Restaurar formulario guardado
    restoreFormState();
    
    console.log('✅ Sistema de Notaría Online COMPLETO DOBLE inicializado correctamente');
    console.log('📄 addSignatureSection: Función única implementada');
    console.log('🖋️ Firmas digitales: Integración limpia MANTENIDA');
    console.log('📷 Fotos carnet: FUNCIONALIDAD DOBLE (frente + reverso) implementada');
    console.log('🎥 Cámara web: Acceso y captura dual habilitados');
    console.log('🔄 Flujo de 2 pasos: frente → reverso → confirmación');
});

// INICIALIZACIÓN LIMPIA FIRMA DIGITAL - SIN DUPLICACIONES
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.firmaProcessor = new FirmaDigitalProcessor();
        
        function setupFirmaButtons() {
            const btnFirmaArrendador = document.getElementById('firmaArrendador');
            const btnFirmaArrendatario = document.getElementById('firmaArrendatario');
            
            if (btnFirmaArrendador) {
                const newBtnArrendador = btnFirmaArrendador.cloneNode(true);
                btnFirmaArrendador.parentNode.replaceChild(newBtnArrendador, btnFirmaArrendador);
                
                newBtnArrendador.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🖋️ Botón arrendador clickeado');
                    window.firmaProcessor.openModal('arrendador');
                });
            }
            
            if (btnFirmaArrendatario) {
                const newBtnArrendatario = btnFirmaArrendatario.cloneNode(true);
                btnFirmaArrendatario.parentNode.replaceChild(newBtnArrendatario, btnFirmaArrendatario);
                
                newBtnArrendatario.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🖋️ Botón arrendatario clickeado');
                    window.firmaProcessor.openModal('arrendatario');
                });
            }
            
            console.log('✅ Botones de firma configurados correctamente');
        }
        
        // INTEGRAR CON FUNCIÓN DE LIMPIAR FORMULARIO - UNA SOLA VEZ
        if (typeof window.clearForm === 'function') {
            const originalClearForm = window.clearForm;
            window.clearForm = function() {
                if (window.firmaProcessor) {
                    window.firmaProcessor.clearSignatures();
                }
                if (originalClearForm) {
                    originalClearForm();
                }
            };
        }
        
        setupFirmaButtons();
        
    }, 600);
    
    console.log('🎉 Sistema de Firma Digital LIMPIO inicializado');
    console.log('✅ Sin duplicaciones en PDF');
    console.log('✅ Vista previa de firmas activa');
});