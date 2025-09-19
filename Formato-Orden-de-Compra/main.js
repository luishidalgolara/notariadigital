// ========================================
// 📋 SISTEMA PRINCIPAL DE ORDEN DE COMPRA
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'numeroOrden',
        'razonSocialCliente', 'rutCliente', 'ciudadCliente', 'contactoCliente', 'direccionCliente', 'telefonoCliente',
        'razonSocialProveedor', 'rutProveedor', 'ciudadProveedor', 'contactoProveedor', 'direccionProveedor', 'telefonoProveedor',
        'nombreResponsable', 'cargoResponsable', 'aceptacionOrden'
    ],
    
    firmasDigitales: {
        cliente: false,
        proveedor: false
    },
    
    fotosCarnet: {
        cliente: {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        },
        proveedor: {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        }
    },
    
    productos: [],
    productCounter: 1,
    
    initialized: {
        core: false,
        signatures: false,
        photos: false,
        theme: false
    }
};

// ===== CLASE PRINCIPAL DEL SISTEMA =====
class OrdenCompraSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 5;
        this.initializationDelay = 1000;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        console.log('📋 Inicializando Sistema de Orden de Compra...');
        
        try {
            await this.waitForDOM();
            const elementsReady = await this.ensureCriticalElements();
            
            if (!elementsReady) {
                throw new Error('Elementos críticos no disponibles después de múltiples intentos');
            }

            await this.initializeCore();
            await this.initializeSpecialSystems();
            await this.initializeTheme();
            
            systemState.initialized.core = true;
            
            console.log('✅ Sistema inicializado correctamente');
            this.showNotification('Sistema cargado y listo para usar', 'success');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema:', error);
            this.handleInitializationError(error);
        }
    }

    async waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                const checkReady = () => {
                    if (document.readyState === 'complete') {
                        resolve();
                    } else {
                        setTimeout(checkReady, 100);
                    }
                };
                checkReady();
            }
        });
    }

    async ensureCriticalElements() {
        const criticalElements = [
            'firmaModalOverlay', 'photoModalOverlay',
            'firmaCliente', 'firmaProveedor', 'photoCliente', 'photoProveedor',
            'progressFill', 'progressText', 'themeToggle', 'agregarProducto'
        ];

        for (let attempt = 1; attempt <= this.maxInitializationAttempts; attempt++) {
            console.log(`🔍 Verificando elementos críticos (intento ${attempt}/${this.maxInitializationAttempts})`);
            
            const missingElements = criticalElements.filter(id => !document.getElementById(id));
            
            if (missingElements.length === 0) {
                console.log('✅ Todos los elementos críticos encontrados');
                return true;
            }
            
            console.log(`⚠️ Elementos faltantes:`, missingElements);
            
            if (attempt < this.maxInitializationAttempts) {
                await this.delay(this.initializationDelay);
            }
        }
        
        console.error('❌ No se pudieron encontrar todos los elementos críticos');
        return false;
    }

    async initializeCore() {
        console.log('🔧 Inicializando núcleo del sistema...');
        
        this.setupEventListeners();
        this.initializeFormFields();
        this.setupProductManagement();
        this.restoreFormState();
        this.updatePreview();
        this.startAutoSave();
        
        console.log('✅ Núcleo del sistema inicializado');
    }

    async initializeSpecialSystems() {
        console.log('⚙️ Inicializando sistemas especiales...');
        
        try {
            await this.initializeSignatureSystemSafe();
            systemState.initialized.signatures = true;
            console.log('✅ Sistema de firmas digitales inicializado');
        } catch (error) {
            console.error('❌ Error inicializando firmas digitales:', error);
        }

        try {
            await this.initializePhotoSystemSafe();
            systemState.initialized.photos = true;
            console.log('✅ Sistema de fotos carnet inicializado');
        } catch (error) {
            console.error('❌ Error inicializando fotos carnet:', error);
        }

        if (!systemState.initialized.signatures || !systemState.initialized.photos) {
            console.log('🔄 Reintentando inicialización de sistemas...');
            await this.delay(2000);
            await this.retryFailedSystems();
        }
    }

    async initializeTheme() {
        console.log('🎨 Inicializando sistema de temas...');
        
        try {
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', () => this.toggleTheme());
            }
            
            const savedTheme = ConfigUtils.getThemeConfig();
            this.applyTheme(savedTheme);
            
            systemState.initialized.theme = true;
            console.log('✅ Sistema de temas inicializado');
        } catch (error) {
            console.error('❌ Error inicializando temas:', error);
        }
    }

    setupEventListeners() {
        console.log('🎧 Configurando event listeners...');
        
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('input', ConfigUtils.debounce(() => {
                    this.updatePreview();
                    this.saveFormState();
                }, CONFIG.PERFORMANCE.debounce_delay));
                
                element.addEventListener('change', () => {
                    this.updatePreview();
                    this.saveFormState();
                });
            }
        });

        this.setupSpecialFieldListeners();
        
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });

        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = CONFIG.MESSAGES.warning.unsaved_changes;
            }
        });

        console.log('✅ Event listeners configurados');
    }

    setupSpecialFieldListeners() {
        // Validación RUT Cliente
        const rutCliente = document.getElementById('rutCliente');
        if (rutCliente) {
            rutCliente.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutCliente');
            });
        }

        // Validación RUT Proveedor
        const rutProveedor = document.getElementById('rutProveedor');
        if (rutProveedor) {
            rutProveedor.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutProveedor');
            });
        }

        // Auto-generar número de orden si está vacío
        const numeroOrden = document.getElementById('numeroOrden');
        if (numeroOrden && !numeroOrden.value) {
            numeroOrden.value = ConfigUtils.generateDocumentId();
        }

        // Configurar valores por defecto
        this.setupDefaultValues();
    }

    setupDefaultValues() {
        // Generar número de orden automático
        const numeroOrden = document.getElementById('numeroOrden');
        if (numeroOrden && !numeroOrden.value) {
            numeroOrden.value = ConfigUtils.generateDocumentId();
        }
    }

    setupProductManagement() {
        console.log('📦 Configurando gestión de productos...');
        
        const agregarBtn = document.getElementById('agregarProducto');
        if (agregarBtn) {
            agregarBtn.addEventListener('click', () => this.agregarProducto());
        }

        // Configurar productos existentes
        this.setupInitialProduct();
        this.updateProductEventListeners();
        
        console.log('✅ Gestión de productos configurada');
    }

    setupInitialProduct() {
        // El primer producto ya existe en el HTML, solo necesitamos configurar sus eventos
        systemState.productCounter = 1;
        this.updateProductEventListeners();
    }

    agregarProducto() {
        if (systemState.productCounter >= CONFIG.ORDEN_COMPRA.max_productos) {
            this.showNotification(`Máximo ${CONFIG.ORDEN_COMPRA.max_productos} productos permitidos`, 'warning');
            return;
        }

        systemState.productCounter++;
        const productoNum = systemState.productCounter;
        
        const productosContainer = document.getElementById('productosContainer');
        if (!productosContainer) return;

        const productoHTML = `
            <div class="producto-item" data-producto="${productoNum}">
                <button class="remove-producto" onclick="ordenCompraSystem.eliminarProducto(${productoNum})" title="Eliminar producto">✕</button>
                <div class="form-grid">
                    <div class="form-group">
                        <label>No. Parte / Tipo Modelo</label>
                        <input type="text" id="numeroParte${productoNum}" placeholder="Ej: ABC-${productoNum}23">
                    </div>
                    <div class="form-group span-2">
                        <label>Descripción del Producto</label>
                        <input type="text" id="descripcionProducto${productoNum}" placeholder="Ej: Producto ${productoNum}">
                    </div>
                    <div class="form-group">
                        <label>Precio Unitario ($)</label>
                        <input type="number" id="precioUnitario${productoNum}" placeholder="0" step="0.01" min="0">
                    </div>
                    <div class="form-group">
                        <label>Cantidad</label>
                        <input type="number" id="cantidad${productoNum}" placeholder="1" min="1" value="1">
                    </div>
                    <div class="form-group">
                        <label>Precio Total ($)</label>
                        <input type="number" id="precioTotal${productoNum}" placeholder="0" step="0.01" readonly>
                    </div>
                </div>
            </div>
        `;

        productosContainer.insertAdjacentHTML('beforeend', productoHTML);
        this.updateProductEventListeners();
        this.showNotification('Producto agregado correctamente', 'success');
        this.updatePreview();
    }

    eliminarProducto(productoNum) {
        const productoItem = document.querySelector(`[data-producto="${productoNum}"]`);
        if (productoItem) {
            productoItem.remove();
            this.updateTotals();
            this.updatePreview();
            this.showNotification('Producto eliminado', 'success');
        }
    }

    updateProductEventListeners() {
        const productosContainer = document.getElementById('productosContainer');
        if (!productosContainer) return;

        const productos = productosContainer.querySelectorAll('.producto-item');
        productos.forEach((producto, index) => {
            const productoNum = parseInt(producto.dataset.producto) || (index + 1);
            
            const precioInput = document.getElementById(`precioUnitario${productoNum}`);
            const cantidadInput = document.getElementById(`cantidad${productoNum}`);
            const totalInput = document.getElementById(`precioTotal${productoNum}`);
            
            if (precioInput && cantidadInput && totalInput) {
                // Remover listeners existentes para evitar duplicados
                precioInput.replaceWith(precioInput.cloneNode(true));
                cantidadInput.replaceWith(cantidadInput.cloneNode(true));
                
                // Obtener las referencias actualizadas
                const newPrecioInput = document.getElementById(`precioUnitario${productoNum}`);
                const newCantidadInput = document.getElementById(`cantidad${productoNum}`);
                
                const updateTotal = () => {
                    const precio = parseFloat(newPrecioInput.value) || 0;
                    const cantidad = parseInt(newCantidadInput.value) || 0;
                    const total = precio * cantidad;
                    
                    totalInput.value = total.toFixed(2);
                    this.updateTotals();
                    this.updatePreview();
                };

                newPrecioInput.addEventListener('input', ConfigUtils.debounce(updateTotal, 300));
                newCantidadInput.addEventListener('input', ConfigUtils.debounce(updateTotal, 300));
            }
        });
    }

    updateTotals() {
        let subtotalNeto = 0;
        
        const productos = document.querySelectorAll('.producto-item');
        productos.forEach((producto, index) => {
            const productoNum = parseInt(producto.dataset.producto) || (index + 1);
            const totalInput = document.getElementById(`precioTotal${productoNum}`);
            if (totalInput) {
                subtotalNeto += parseFloat(totalInput.value) || 0;
            }
        });
        
        const iva = ConfigUtils.calculateIVA(subtotalNeto);
        const total = subtotalNeto + iva;
        
        // Actualizar campos de totales
        const subtotalInput = document.getElementById('subtotalNeto');
        const ivaInput = document.getElementById('iva');
        const totalInput = document.getElementById('total');
        
        if (subtotalInput) subtotalInput.value = subtotalNeto.toFixed(2);
        if (ivaInput) ivaInput.value = iva.toFixed(2);
        if (totalInput) totalInput.value = total.toFixed(2);
        
        // Actualizar vista previa
        this.updateTotalsPreview();
    }

    updateTotalsPreview() {
        const subtotalNeto = document.getElementById('subtotalNeto')?.value || 0;
        const iva = document.getElementById('iva')?.value || 0;
        const total = document.getElementById('total')?.value || 0;
        
        const prevSubtotal = document.getElementById('prev_subtotalNeto');
        const prevIva = document.getElementById('prev_iva');
        const prevTotal = document.getElementById('prev_total');
        
        if (prevSubtotal) prevSubtotal.textContent = ConfigUtils.formatPrice(subtotalNeto);
        if (prevIva) prevIva.textContent = ConfigUtils.formatPrice(iva);
        if (prevTotal) prevTotal.textContent = ConfigUtils.formatPrice(total);
    }

    handleRutInput(event, fieldId) {
        const formatted = ConfigUtils.formatRUT(event.target.value);
        event.target.value = formatted;
        
        if (formatted.length > 8) {
            const isValid = ConfigUtils.validateRUT(formatted);
            event.target.classList.toggle('rut-valid', isValid);
            event.target.classList.toggle('rut-invalid', !isValid);
        } else {
            event.target.classList.remove('rut-valid', 'rut-invalid');
        }
        
        this.updatePreview();
    }

    updatePreview() {
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            const preview = document.getElementById('prev_' + field);
            if (element && preview) {
                let value = element.value || '';
                if (element.type === 'checkbox') {
                    value = element.checked ? 'Sí' : 'No';
                }
                preview.textContent = value || this.getPlaceholderText(field);
            }
        });

        this.updateDuplicateReferences();
        this.updateSignatureNames();
        this.updateProductsPreview();
        this.updateTotalsPreview();
        this.updateProgress();
    }

    updateDuplicateReferences() {
        // Referencias duplicadas en el documento
        const contactoProveedor = document.getElementById('contactoProveedor').value;
        
        // Actualizar referencias múltiples del contacto del proveedor
        const prev_contactoProveedor2 = document.getElementById('prev_contactoProveedor2');
        if (prev_contactoProveedor2) prev_contactoProveedor2.textContent = contactoProveedor || '_______________';
    }

    updateSignatureNames() {
        const nombreResponsable = document.getElementById('nombreResponsable').value;
        const contactoProveedor = document.getElementById('contactoProveedor').value;
        
        const firmaCliente = document.getElementById('prev_nombreResponsable');
        const firmaProveedor = document.getElementById('prev_contactoProveedor2');
        
        if (firmaCliente) {
            firmaCliente.textContent = nombreResponsable || '_______________';
        }
        
        if (firmaProveedor) {
            firmaProveedor.textContent = contactoProveedor || '_______________';
        }
    }

    updateProductsPreview() {
        const productosPreview = document.getElementById('productosPreview');
        if (!productosPreview) return;

        let html = '';
        const productos = document.querySelectorAll('.producto-item');
        
        productos.forEach((producto, index) => {
            const productoNum = parseInt(producto.dataset.producto) || (index + 1);
            const numeroParte = document.getElementById(`numeroParte${productoNum}`)?.value || '';
            const descripcion = document.getElementById(`descripcionProducto${productoNum}`)?.value || '';
            const precio = document.getElementById(`precioUnitario${productoNum}`)?.value || '';
            const cantidad = document.getElementById(`cantidad${productoNum}`)?.value || '';
            const total = document.getElementById(`precioTotal${productoNum}`)?.value || '';

            if (numeroParte || descripcion || precio || cantidad) {
                html += `
                    <div class="productos-row">
                        <div class="table-cell">${numeroParte || '—'}</div>
                        <div class="table-cell">${descripcion || '—'}</div>
                        <div class="table-cell">$${ConfigUtils.formatPrice(precio) || '0'}</div>
                        <div class="table-cell">${cantidad || '0'}</div>
                        <div class="table-cell">$${ConfigUtils.formatPrice(total) || '0'}</div>
                    </div>
                `;
            }
        });

        if (html === '') {
            html = `
                <div class="productos-row">
                    <div class="table-cell">—</div>
                    <div class="table-cell">Sin productos agregados</div>
                    <div class="table-cell">$0</div>
                    <div class="table-cell">0</div>
                    <div class="table-cell">$0</div>
                </div>
            `;
        }

        productosPreview.innerHTML = html;
    }

    getPlaceholderText(field) {
        const placeholders = {
            'numeroOrden': 'OC-2024-001',
            'razonSocialCliente': '________________',
            'rutCliente': 'XX.XXX.XXX-X',
            'ciudadCliente': '________________',
            'contactoCliente': '________________',
            'direccionCliente': '________________',
            'telefonoCliente': '________________',
            'razonSocialProveedor': '________________',
            'rutProveedor': 'XX.XXX.XXX-X',
            'ciudadProveedor': '________________',
            'contactoProveedor': '________________',
            'direccionProveedor': '________________',
            'telefonoProveedor': '________________',
            'nombreResponsable': '________________',
            'cargoResponsable': '________________'
        };
        
        return placeholders[field] || '________';
    }

    updateProgress() {
        const totalFields = systemState.formFields.length;
        let filledFields = 0;
        
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                if (element.type === 'checkbox') {
                    if (element.checked) filledFields++;
                } else if (element.value && element.value.trim() !== '') {
                    filledFields++;
                }
            }
        });
        
        // Bonus por productos
        const productos = document.querySelectorAll('.producto-item');
        let productosCompletos = 0;
        productos.forEach((producto, index) => {
            const productoNum = parseInt(producto.dataset.producto) || (index + 1);
            const numeroParte = document.getElementById(`numeroParte${productoNum}`)?.value || '';
            const descripcion = document.getElementById(`descripcionProducto${productoNum}`)?.value || '';
            const precio = document.getElementById(`precioUnitario${productoNum}`)?.value || '';
            const cantidad = document.getElementById(`cantidad${productoNum}`)?.value || '';
            
            if (numeroParte && descripcion && precio && cantidad) {
                productosCompletos++;
            }
        });
        
        let bonusScore = 0;
        
        // Bonus por productos completos
        bonusScore += productosCompletos * 0.5;
        
        // Bonus por firmas digitales
        if (systemState.firmasDigitales.cliente) bonusScore += 1;
        if (systemState.firmasDigitales.proveedor) bonusScore += 1;
        
        // Bonus por fotos carnet
        if (systemState.fotosCarnet.cliente.completed) bonusScore += 0.5;
        if (systemState.fotosCarnet.proveedor.completed) bonusScore += 0.5;
        
        const progress = ((filledFields + bonusScore) / (totalFields + 4)) * 100;
        
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) {
            progressFill.style.width = Math.min(100, progress) + '%';
        }
        
        if (progressText) {
            progressText.textContent = `Completado: ${Math.round(Math.min(100, progress))}%`;
        }
    }

    // ===== SISTEMA DE FIRMAS DIGITALES =====
    async initializeSignatureSystemSafe() {
        console.log('🖋️ Inicializando sistema de firmas digitales...');
        
        const requiredElements = ['firmaModalOverlay', 'firmaCliente', 'firmaProveedor'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`Elementos de firma faltantes: ${missingElements.join(', ')}`);
        }
        
        if (!window.firmaProcessor) {
            window.firmaProcessor = new FirmaDigitalProcessor();
            await this.delay(500);
            
            if (!window.firmaProcessor) {
                throw new Error('No se pudo crear el procesador de firmas');
            }
        }
        
        await this.setupSignatureButtonsSafe();
        console.log('✅ Sistema de firmas digitales inicializado correctamente');
    }

    async setupSignatureButtonsSafe() {
        console.log('🖋️ Configurando botones de firma...');
        
        const btnFirmaCliente = document.getElementById('firmaCliente');
        const btnFirmaProveedor = document.getElementById('firmaProveedor');
        
        if (!btnFirmaCliente || !btnFirmaProveedor) {
            throw new Error('Botones de firma no encontrados');
        }
        
        btnFirmaCliente.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('cliente');
        });
        
        btnFirmaProveedor.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openSignatureModalSafe('proveedor');
        });
        
        console.log('✅ Botones de firma configurados correctamente');
    }

    openSignatureModalSafe(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        let nombreField;
        if (type === 'cliente') {
            nombreField = document.getElementById('nombreResponsable');
        } else {
            nombreField = document.getElementById('contactoProveedor');
        }
        
        if (!nombreField || !nombreField.value.trim()) {
            this.showNotification(`Complete el nombre del ${type === 'cliente' ? 'responsable del cliente' : 'contacto del proveedor'} antes de firmar`, 'warning');
            return;
        }
        
        if (!window.firmaProcessor) {
            this.showNotification('Sistema de firmas no disponible. Reintentando inicialización...', 'warning');
            this.retrySignatureSystem();
            return;
        }
        
        try {
            window.firmaProcessor.openModal(type);
        } catch (error) {
            console.error('❌ Error abriendo modal de firma:', error);
            this.showNotification('Error al abrir el sistema de firmas', 'error');
        }
    }

    // ===== SISTEMA DE FOTOS CARNET =====
    async initializePhotoSystemSafe() {
        console.log('📷 Inicializando sistema de fotos carnet...');
        
        const requiredElements = ['photoModalOverlay', 'photoCliente', 'photoProveedor'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`Elementos de fotos faltantes: ${missingElements.join(', ')}`);
        }
        
        if (!window.photoProcessor) {
            window.photoProcessor = new PhotoCarnetDualProcessor();
            await this.delay(500);
            
            if (!window.photoProcessor) {
                throw new Error('No se pudo crear el procesador de fotos');
            }
        }
        
        await this.setupPhotoButtonsSafe();
        console.log('✅ Sistema de fotos carnet inicializado correctamente');
    }

    async setupPhotoButtonsSafe() {
        console.log('📷 Configurando botones de foto...');
        
        const btnPhotoCliente = document.getElementById('photoCliente');
        const btnPhotoProveedor = document.getElementById('photoProveedor');
        
        if (!btnPhotoCliente || !btnPhotoProveedor) {
            throw new Error('Botones de foto no encontrados');
        }
        
        btnPhotoCliente.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('cliente');
        });
        
        btnPhotoProveedor.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openPhotoModalSafe('proveedor');
        });
        
        console.log('✅ Botones de foto configurados correctamente');
    }

    openPhotoModalSafe(type) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        let nombreField;
        if (type === 'cliente') {
            nombreField = document.getElementById('nombreResponsable');
        } else {
            nombreField = document.getElementById('contactoProveedor');
        }
        
        if (!nombreField || !nombreField.value.trim()) {
            this.showNotification(`Complete el nombre del ${type === 'cliente' ? 'responsable del cliente' : 'contacto del proveedor'} antes de tomar fotos`, 'warning');
            return;
        }
        
        if (!window.photoProcessor) {
            this.showNotification('Sistema de fotos no disponible. Reintentando inicialización...', 'warning');
            this.retryPhotoSystem();
            return;
        }
        
        try {
            window.photoProcessor.openModal(type);
        } catch (error) {
            console.error('❌ Error abriendo modal de foto:', error);
            this.showNotification('Error al abrir el sistema de fotos', 'error');
        }
    }

    // ===== SISTEMA DE TEMAS =====
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        this.applyTheme(newTheme);
        ConfigUtils.saveThemeConfig(newTheme);
        
        this.showNotification(`Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 'info');
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Añadir clase para transiciones suaves
        document.body.classList.add('theme-transition');
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 300);
    }

    // ===== AUTOGUARDADO =====
    startAutoSave() {
        if (CONFIG.AUTOSAVE.enabled) {
            this.autoSaveInterval = setInterval(() => {
                this.saveFormState();
            }, CONFIG.AUTOSAVE.interval);
        }
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    saveFormState() {
        const data = {};
        
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                if (element.type === 'checkbox') {
                    data[field] = element.checked;
                } else {
                    data[field] = element.value;
                }
            }
        });

        // Guardar productos
        const productos = ConfigUtils.getProductosFromForm();
        data.productos = productos;
        
        data.firmasDigitales = systemState.firmasDigitales;
        data.fotosCarnet = systemState.fotosCarnet;
        data.timestamp = new Date().toISOString();
        
        try {
            localStorage.setItem(CONFIG.AUTOSAVE.key, JSON.stringify(data));
        } catch (error) {
            console.warn('⚠️ No se pudo guardar automáticamente:', error);
        }
    }

    restoreFormState() {
        try {
            const savedData = localStorage.getItem(CONFIG.AUTOSAVE.key);
            if (savedData) {
                const data = JSON.parse(savedData);
                
                Object.keys(data).forEach(field => {
                    if (field === 'firmasDigitales') {
                        systemState.firmasDigitales = data.firmasDigitales || { cliente: false, proveedor: false };
                    } else if (field === 'fotosCarnet') {
                        systemState.fotosCarnet = data.fotosCarnet || systemState.fotosCarnet;
                    } else if (field === 'productos') {
                        // Restaurar productos más tarde
                    } else if (field !== 'timestamp') {
                        const element = document.getElementById(field);
                        if (element && data[field] !== undefined) {
                            if (element.type === 'checkbox') {
                                element.checked = data[field];
                            } else {
                                element.value = data[field];
                            }
                        }
                    }
                });
                
                this.updatePreview();
                console.log('📥 Formulario restaurado');
            }
        } catch (error) {
            console.warn('⚠️ No se pudo restaurar el formulario:', error);
        }
    }

    hasUnsavedChanges() {
        return false; // Por ahora, siempre guardamos automáticamente
    }

    // ===== FUNCIONES DE UTILIDAD =====
    initializeFormFields() {
        this.setupDefaultValues();
        console.log('📝 Campos del formulario inicializados');
    }

    clearForm() {
        this.showConfirmDialog(
            '¿Está seguro de que desea limpiar todos los campos?',
            'Esta acción también removerá las firmas digitales, fotos de carnet y todos los productos.',
            () => {
                systemState.formFields.forEach(field => {
                    const element = document.getElementById(field);
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = false;
                        } else {
                            element.value = '';
                        }
                        element.classList.remove('rut-valid', 'rut-invalid', 'email-valid', 'email-invalid');
                    }
                });
                
                // Limpiar productos
                const productosContainer = document.getElementById('productosContainer');
                if (productosContainer) {
                    productosContainer.innerHTML = `
                        <div class="producto-item" data-producto="1">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>No. Parte / Tipo Modelo</label>
                                    <input type="text" id="numeroParte1" placeholder="Ej: ABC-123">
                                </div>
                                <div class="form-group span-2">
                                    <label>Descripción del Producto</label>
                                    <input type="text" id="descripcionProducto1" placeholder="Ej: Computador portátil HP Pavilion">
                                </div>
                                <div class="form-group">
                                    <label>Precio Unitario ($)</label>
                                    <input type="number" id="precioUnitario1" placeholder="0" step="0.01" min="0">
                                </div>
                                <div class="form-group">
                                    <label>Cantidad</label>
                                    <input type="number" id="cantidad1" placeholder="1" min="1" value="1">
                                </div>
                                <div class="form-group">
                                    <label>Precio Total ($)</label>
                                    <input type="number" id="precioTotal1" placeholder="0" step="0.01" readonly>
                                </div>
                            </div>
                        </div>
                    `;
                }
                
                // Restaurar valores por defecto
                this.setupDefaultValues();
                systemState.productCounter = 1;
                this.updateProductEventListeners();
                
                systemState.firmasDigitales = { cliente: false, proveedor: false };
                systemState.fotosCarnet = {
                    cliente: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false },
                    proveedor: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false }
                };
                
                if (window.firmaProcessor) {
                    window.firmaProcessor.clearSignatures();
                }
                
                if (window.photoProcessor) {
                    window.photoProcessor.clearAllPhotos();
                }
                
                this.updatePreview();
                this.showNotification('Formulario limpiado correctamente', 'success');
            }
        );
    }

    async retryFailedSystems() {
        if (!systemState.initialized.signatures) {
            try {
                await this.initializeSignatureSystemSafe();
                systemState.initialized.signatures = true;
                console.log('✅ Sistema de firmas digitales inicializado en reintento');
            } catch (error) {
                console.error('❌ Fallo definitivo en firmas digitales:', error);
            }
        }

        if (!systemState.initialized.photos) {
            try {
                await this.initializePhotoSystemSafe();
                systemState.initialized.photos = true;
                console.log('✅ Sistema de fotos carnet inicializado en reintento');
            } catch (error) {
                console.error('❌ Fallo definitivo en fotos carnet:', error);
            }
        }
    }

    async retrySignatureSystem() {
        try {
            await this.initializeSignatureSystemSafe();
            this.showNotification('Sistema de firmas reactivado', 'success');
        } catch (error) {
            console.error('❌ No se pudo reactivar el sistema de firmas:', error);
            this.showNotification('Sistema de firmas no disponible', 'error');
        }
    }

    async retryPhotoSystem() {
        try {
            await this.initializePhotoSystemSafe();
            this.showNotification('Sistema de fotos reactivado', 'success');
        } catch (error) {
            console.error('❌ No se pudo reactivar el sistema de fotos:', error);
            this.showNotification('Sistema de fotos no disponible', 'error');
        }
    }

    handleInitializationError(error) {
        this.initializationAttempts++;
        
        if (this.initializationAttempts < this.maxInitializationAttempts) {
            console.log(`🔄 Reintentando inicialización (${this.initializationAttempts}/${this.maxInitializationAttempts})`);
            setTimeout(() => {
                this.init();
            }, this.initializationDelay * this.initializationAttempts);
        } else {
            console.error('❌ Inicialización fallida después de múltiples intentos');
            this.showNotification('Error al cargar el sistema. Algunos componentes pueden no funcionar.', 'error');
            this.fallbackInitialization();
        }
    }

    async fallbackInitialization() {
        console.log('🆘 Intentando inicialización de respaldo...');
        
        try {
            this.setupEventListeners();
            this.initializeFormFields();
            this.setupProductManagement();
            this.updatePreview();
            
            this.showNotification('Sistema iniciado en modo básico', 'warning');
        } catch (error) {
            console.error('❌ Falló incluso la inicialización de respaldo:', error);
            this.showNotification('Error crítico del sistema', 'error');
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== SISTEMA DE NOTIFICACIONES =====
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${CONFIG.NOTIFICATIONS.icons[type]}</div>
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '20px',
            borderRadius: '16px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '9999',
            opacity: '0',
            transform: 'translateX(400px)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            minWidth: '300px',
            maxWidth: '400px'
        });
        
        const backgrounds = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)'
        };
        
        notification.style.background = backgrounds[type] || backgrounds.info;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, CONFIG.NOTIFICATIONS.duration);
    }

    showConfirmDialog(title, message, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.innerHTML = `
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>${title}</h3>
                </div>
                <div class="dialog-body">
                    <p>${message}</p>
                </div>
                <div class="dialog-actions">
                    <button class="dialog-btn dialog-btn-cancel">Cancelar</button>
                    <button class="dialog-btn dialog-btn-confirm">Confirmar</button>
                </div>
            </div>
        `;
        
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '10000',
            opacity: '0',
            transition: 'opacity 0.3s ease',
            backdropFilter: 'blur(10px)'
        });
        
        const style = document.createElement('style');
        style.textContent = `
            .dialog-content {
                background: linear-gradient(135deg, #1e293b, #334155);
                border-radius: 16px;
                padding: 32px;
                max-width: 400px;
                width: 90%;
                color: white;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            .dialog-overlay[data-visible="true"] .dialog-content {
                transform: scale(1);
            }
            .dialog-header h3 {
                margin: 0 0 16px 0;
                font-size: 1.25rem;
                font-weight: 600;
            }
            .dialog-body p {
                margin: 0 0 24px 0;
                color: #cbd5e0;
                line-height: 1.5;
            }
            .dialog-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            .dialog-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .dialog-btn-cancel {
                background: #64748b;
                color: white;
            }
            .dialog-btn-cancel:hover {
                background: #475569;
            }
            .dialog-btn-confirm {
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
            }
            .dialog-btn-confirm:hover {
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.opacity = '1';
            overlay.setAttribute('data-visible', 'true');
        }, 10);
        
        overlay.querySelector('.dialog-btn-cancel').addEventListener('click', () => {
            this.closeDialog(overlay, style);
        });
        
        overlay.querySelector('.dialog-btn-confirm').addEventListener('click', () => {
            onConfirm();
            this.closeDialog(overlay, style);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeDialog(overlay, style);
            }
        });
    }

    closeDialog(overlay, style) {
        overlay.style.opacity = '0';
        overlay.removeAttribute('data-visible');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
                document.head.removeChild(style);
            }
        }, 300);
    }

    // ===== GENERACIÓN DE PDF =====
    async generatePDF() {
        const btn = document.querySelector('.btn-primary');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Generando PDF...</span>';
        btn.disabled = true;

        try {
            const validation = this.validateFormWithSignatures();
            
            if (!validation.valid) {
                this.showNotification(`Antes de generar el PDF: ${validation.issues.join('. ')}`, 'error');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'letter');

            this.setupPDFDocument(doc);
            await this.addPDFContent(doc);
            
            const fileName = this.generateFileName();
            
            setTimeout(() => {
                doc.save(fileName);
                this.showNotification('PDF de Orden de Compra generado exitosamente', 'success');
            }, 1500);
            
        } catch (error) {
            console.error('❌ Error generando PDF:', error);
            this.showNotification('Error al generar el PDF. Intente nuevamente.', 'error');
        } finally {
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 1500);
        }
    }

    setupPDFDocument(doc) {
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
    }

    async addPDFContent(doc) {
        let y = 30;
        const pageWidth = 190;
        const margin = 20;

        // Título centrado
        doc.setFont('times', 'bold');
        doc.setFontSize(18);
        const numeroOrden = document.getElementById('numeroOrden').value || 'N° .....';
        doc.text(`ORDEN DE COMPRA N° ${numeroOrden}`, 105, y, { align: 'center' });
        y += 30;

        // Datos del Cliente
        doc.setFontSize(14);
        doc.text('DATOS DEL CLIENTE Y DE LA FACTURA', 105, y, { align: 'center' });
        y += 20;

        doc.setFont('times', 'normal');
        doc.setFontSize(12);

        const clienteData = [
            ['Razón Social:', document.getElementById('razonSocialCliente').value || '________________', 'Ciudad:', document.getElementById('ciudadCliente').value || '________________'],
            ['Contacto:', document.getElementById('contactoCliente').value || '________________', 'RUT:', document.getElementById('rutCliente').value || '________________'],
            ['Dirección:', document.getElementById('direccionCliente').value || '________________', 'Teléfono:', document.getElementById('telefonoCliente').value || '________________']
        ];

        clienteData.forEach(row => {
            doc.text(`${row[0]} ${row[1]}`, margin, y);
            doc.text(`${row[2]} ${row[3]}`, 120, y);
            y += 8;
        });

        y += 20;

        // Datos del Proveedor
        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        doc.text('DATOS DEL PROVEEDOR', 105, y, { align: 'center' });
        y += 20;

        doc.setFont('times', 'normal');
        doc.setFontSize(12);

        const proveedorData = [
            ['Razón Social:', document.getElementById('razonSocialProveedor').value || '________________', 'Ciudad:', document.getElementById('ciudadProveedor').value || '________________'],
            ['Contacto:', document.getElementById('contactoProveedor').value || '________________', 'RUT:', document.getElementById('rutProveedor').value || '________________'],
            ['Dirección:', document.getElementById('direccionProveedor').value || '________________', 'Teléfono:', document.getElementById('telefonoProveedor').value || '________________']
        ];

        proveedorData.forEach(row => {
            doc.text(`${row[0]} ${row[1]}`, margin, y);
            doc.text(`${row[2]} ${row[3]}`, 120, y);
            y += 8;
        });

        y += 20;

        // Verificar si necesitamos nueva página
        if (y > 180) {
            doc.addPage();
            y = 30;
        }

        // Datos del Producto
        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        doc.text('DATOS DEL PRODUCTO A ADQUIRIR', 105, y, { align: 'center' });
        y += 20;

        // Tabla de productos
        doc.setFontSize(10);
        const colWidths = [35, 60, 30, 20, 30];
        const startX = margin;

        // Encabezados
        doc.setFont('times', 'bold');
        doc.text('No. Parte / Tipo', startX, y);
        doc.text('Descripción del Producto', startX + colWidths[0], y);
        doc.text('Precio Unitario', startX + colWidths[0] + colWidths[1], y);
        doc.text('Cant', startX + colWidths[0] + colWidths[1] + colWidths[2], y);
        doc.text('Precio Total', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y);
        
        y += 5;
        doc.line(startX, y, startX + colWidths.reduce((a, b) => a + b, 0), y);
        y += 5;

        // Productos
        doc.setFont('times', 'normal');
        const productos = ConfigUtils.getProductosFromForm();
        
        if (productos.length === 0) {
            doc.text('Sin productos agregados', startX, y);
            y += 8;
        } else {
            productos.forEach(producto => {
                doc.text(producto.numeroParte || '-', startX, y, { maxWidth: colWidths[0] - 2 });
                doc.text(producto.descripcion || '-', startX + colWidths[0], y, { maxWidth: colWidths[1] - 2 });
                doc.text(`$${ConfigUtils.formatPrice(producto.precio)}`, startX + colWidths[0] + colWidths[1], y);
                doc.text(producto.cantidad.toString(), startX + colWidths[0] + colWidths[1] + colWidths[2], y);
                doc.text(`$${ConfigUtils.formatPrice(producto.total)}`, startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y);
                y += 8;
            });
        }

        y += 10;
        doc.line(startX, y, startX + colWidths.reduce((a, b) => a + b, 0), y);
        y += 10;

        // Totales
        const subtotal = document.getElementById('subtotalNeto')?.value || 0;
        const iva = document.getElementById('iva')?.value || 0;
        const total = document.getElementById('total')?.value || 0;

        doc.setFont('times', 'bold');
        doc.text('NETO:', startX + colWidths[0] + colWidths[1] + colWidths[2], y);
        doc.text(`$${ConfigUtils.formatPrice(subtotal)}`, startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y);
        y += 8;

        doc.text('IVA:', startX + colWidths[0] + colWidths[1] + colWidths[2], y);
        doc.text(`$${ConfigUtils.formatPrice(iva)}`, startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y);
        y += 8;

        doc.text('TOTAL:', startX + colWidths[0] + colWidths[1] + colWidths[2], y);
        doc.text(`$${ConfigUtils.formatPrice(total)}`, startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y);
        y += 30;

        // Sección de firmas
        this.addSignatureSection(doc, y);
        
        this.addDigitalWatermark(doc);
    }

    addSignatureSection(doc, y) {
        console.log('📄 Agregando sección de firmas al PDF...');
        
        // Verificar si necesitamos nueva página
        if (y > 180) {
            doc.addPage();
            y = 40;
        }

        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        doc.text('ACEPTACIÓN DEL CLIENTE', 105, y, { align: 'center' });
        y += 30;

        const nombreResponsable = document.getElementById('nombreResponsable').value || '_______________';
        const cargoResponsable = document.getElementById('cargoResponsable').value || '_______________';
        const contactoProveedor = document.getElementById('contactoProveedor').value || '_______________';
        
        // Firmas lado a lado
        const leftX = 55;
        const rightX = 155;
        
        // Líneas de firma
        doc.line(leftX - 30, y, leftX + 30, y);
        doc.line(rightX - 30, y, rightX + 30, y);
        y += 8;
        
        // Nombres
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.text(nombreResponsable, leftX, y, { align: 'center' });
        doc.text(contactoProveedor, rightX, y, { align: 'center' });
        y += 6;
        
        // Roles
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text(cargoResponsable, leftX, y, { align: 'center' });
        doc.text('PROVEEDOR', rightX, y, { align: 'center' });
        
        // Agregar firmas digitales si existen
        if (window.firmaProcessor) {
            try {
                const firmaCliente = window.firmaProcessor.getSignatureForPDF('cliente');
                const firmaProveedor = window.firmaProcessor.getSignatureForPDF('proveedor');
                
                if (firmaCliente) {
                    doc.addImage(firmaCliente, 'PNG', leftX - 30, y - 25, 60, 15);
                    console.log('✅ Firma del cliente agregada al PDF');
                }
                
                if (firmaProveedor) {
                    doc.addImage(firmaProveedor, 'PNG', rightX - 30, y - 25, 60, 15);
                    console.log('✅ Firma del proveedor agregada al PDF');
                }
                
                if (firmaCliente || firmaProveedor) {
                    doc.setFont('times', 'italic');
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text('Documento con firmas digitales aplicadas', 105, y + 15, { align: 'center' });
                    doc.setTextColor(0, 0, 0);
                }
            } catch (error) {
                console.error('❌ Error agregando firmas digitales al PDF:', error);
            }
        }
    }

    addDigitalWatermark(doc) {
        doc.setFont('times', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Documento firmado digitalmente - Notaría Digital Chile', 105, 260, { align: 'center' });
        doc.text(`Generado el ${new Date().toLocaleString('es-CL')}`, 105, 265, { align: 'center' });
        doc.setTextColor(0, 0, 0);
    }

    generateFileName() {
        const numeroOrden = document.getElementById('numeroOrden').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const razonSocialCliente = document.getElementById('razonSocialCliente').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const timestamp = new Date().toISOString().slice(0, 10);
        return `Orden_Compra_${numeroOrden}_${razonSocialCliente}_${timestamp}.pdf`;
    }

    validateFormWithSignatures() {
        const emptyFields = [];
        
        // Campos mínimos requeridos
        const requiredFields = [
            'numeroOrden',
            'razonSocialCliente', 'rutCliente', 'ciudadCliente', 'contactoCliente', 'direccionCliente', 'telefonoCliente',
            'razonSocialProveedor', 'rutProveedor', 'ciudadProveedor', 'contactoProveedor', 'direccionProveedor', 'telefonoProveedor',
            'nombreResponsable', 'cargoResponsable'
        ];
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element || !element.value.trim()) {
                emptyFields.push(field);
            }
        });
        
        // Validar checkbox obligatorio
        const aceptacionOrden = document.getElementById('aceptacionOrden');
        if (!aceptacionOrden || !aceptacionOrden.checked) {
            emptyFields.push('aceptacionOrden');
        }
        
        const issues = [];
        
        if (emptyFields.length > 0) {
            issues.push(`Complete ${emptyFields.length} campos faltantes`);
        }
        
        // Validaciones específicas
        const rutCliente = document.getElementById('rutCliente').value;
        const rutProveedor = document.getElementById('rutProveedor').value;
        
        if (rutCliente && !ConfigUtils.validateRUT(rutCliente)) {
            issues.push('RUT del cliente inválido');
        }
        
        if (rutProveedor && !ConfigUtils.validateRUT(rutProveedor)) {
            issues.push('RUT del proveedor inválido');
        }
        
        // Validar productos
        const productos = ConfigUtils.getProductosFromForm();
        if (productos.length === 0) {
            issues.push('Debe agregar al menos un producto');
        }
        
        if (!systemState.firmasDigitales.cliente) {
            issues.push('Falta firma digital del cliente');
        }
        
        if (!systemState.firmasDigitales.proveedor) {
            issues.push('Falta firma digital del proveedor');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

// ===== PROCESADORES DE FIRMAS Y FOTOS (ACTUALIZADOS PARA NUEVOS TIPOS) =====
class FirmaDigitalProcessor {
    constructor() {
        this.processedImageData = null;
        this.currentType = null;
        this.firmasDigitales = {
            cliente: null,
            proveedor: null
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragDrop();
        console.log('🖋️ Procesador de Firmas Digitales inicializado');
    }

    setupEventListeners() {
        document.getElementById('firmaModalClose')?.addEventListener('click', () => this.closeModal());
        document.getElementById('firmaFileInput')?.addEventListener('change', (e) => {
            if (e.target.files[0]) this.handleFile(e.target.files[0]);
        });
        
        document.getElementById('firmaModalOverlay')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal();
        });
    }

    setupDragDrop() {
        const uploadArea = document.getElementById('firmaUploadArea');
        if (!uploadArea) return;
        
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
            document.getElementById('firmaFileInput')?.click();
        });
    }

    openModal(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        this.currentType = type;
        this.resetModal();
        
        const modalOverlay = document.getElementById('firmaModalOverlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'flex';
            modalOverlay.classList.add('active');
            console.log('✅ Modal de firma mostrado');
        } else {
            console.error('❌ Modal de firma no encontrado');
        }
    }

    closeModal() {
        const modalOverlay = document.getElementById('firmaModalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            setTimeout(() => {
                modalOverlay.style.display = 'none';
            }, 300);
        }
    }

    resetModal() {
        this.hideAlert();
        this.hideLoading();
        const fileInput = document.getElementById('firmaFileInput');
        if (fileInput) fileInput.value = '';
    }

    handleFile(file) {
        const validation = ConfigUtils.validateImage(file);
        if (!validation.valid) {
            this.showAlert(validation.errors.join('. '), 'error');
            return;
        }

        this.showLoading();
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.processImage(e.target.result);
        };
        reader.onerror = () => {
            this.hideLoading();
            this.showAlert('Error al leer el archivo', 'error');
        };
        reader.readAsDataURL(file);
    }

    processImage(dataURL) {
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = this.removeWhiteBackground(img);
                this.processedImageData = canvas.toDataURL('image/png');
                
                this.hideLoading();
                this.applySignature();
            } catch (error) {
                console.error('❌ Error procesando imagen:', error);
                this.hideLoading();
                this.showAlert('Error procesando imagen', 'error');
            }
        };
        img.onerror = () => {
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
            
            const isWhitish = luminosity > CONFIG.SIGNATURES.background_removal.luminosity_threshold;
            const isGrayish = average > 140 && colorDiff < CONFIG.SIGNATURES.background_removal.saturation_threshold;
            const isLightColor = minColor > CONFIG.SIGNATURES.background_removal.brightness_threshold;
            
            if (isWhitish || isGrayish || isLightColor) {
                data[i + 3] = 0;
            } else {
                const factor = CONFIG.SIGNATURES.processing.contrast_boost;
                data[i] = Math.min(255, data[i] * factor);
                data[i + 1] = Math.min(255, data[i + 1] * factor);
                data[i + 2] = Math.min(255, data[i + 2] * factor);
                data[i + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    applySignature() {
        if (this.currentType && this.processedImageData) {
            this.firmasDigitales[this.currentType] = this.processedImageData;
            
            systemState.firmasDigitales[this.currentType] = true;
            
            const buttonId = `firma${this.currentType.charAt(0).toUpperCase() + this.currentType.slice(1)}`;
            const button = document.getElementById(buttonId);
            
            if (button) {
                button.classList.add('signed');
                const textElement = button.querySelector('.signature-text');
                if (textElement) {
                    textElement.textContent = 'FIRMADO DIGITALMENTE';
                }
            }
            
            this.updateSignaturePreview(this.currentType, this.processedImageData);
            
            if (window.ordenCompraSystem) {
                window.ordenCompraSystem.updateProgress();
            }
            
            this.closeModal();
            
            if (window.ordenCompraSystem) {
                window.ordenCompraSystem.showNotification(`Firma digital del ${this.currentType} aplicada correctamente`, 'success');
            }
        }
    }

    updateSignaturePreview(type, signatureData) {
        try {
            const placeholderId = `signaturePlaceholder${type.charAt(0).toUpperCase() + type.slice(1)}`;
            const previewId = `signaturePreview${type.charAt(0).toUpperCase() + type.slice(1)}`;
            
            const placeholder = document.getElementById(placeholderId);
            const preview = document.getElementById(previewId);
            
            if (placeholder && preview) {
                placeholder.style.display = 'none';
                preview.src = signatureData;
                preview.style.display = 'block';
            }
        } catch (error) {
            console.error('❌ Error actualizando vista previa:', error);
        }
    }

    getSignatureForPDF(type) {
        return this.firmasDigitales[type];
    }

    clearSignatures() {
        this.firmasDigitales.cliente = null;
        this.firmasDigitales.proveedor = null;
        
        systemState.firmasDigitales = { cliente: false, proveedor: false };
        
        ['firmaCliente', 'firmaProveedor'].forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.classList.remove('signed');
                const textElement = button.querySelector('.signature-text');
                if (textElement) {
                    textElement.textContent = 'FIRMA DIGITAL';
                }
            }
        });
        
        ['signaturePlaceholderCliente', 'signaturePreviewCliente', 'signaturePlaceholderProveedor', 'signaturePreviewProveedor'].forEach((id, index) => {
            const element = document.getElementById(id);
            if (element) {
                if (index % 2 === 0) { // placeholder
                    element.style.display = 'inline';
                } else { // preview
                    element.style.display = 'none';
                    element.src = '';
                }
            }
        });
    }

    showAlert(message, type) {
        const alert = document.getElementById('firmaAlert');
        if (alert) {
            alert.textContent = message;
            alert.className = `firma-alert ${type}`;
            alert.style.display = 'block';
            setTimeout(() => this.hideAlert(), 5000);
        }
    }

    hideAlert() {
        const alert = document.getElementById('firmaAlert');
        if (alert) alert.style.display = 'none';
    }

    showLoading() {
        const loading = document.getElementById('firmaLoading');
        if (loading) loading.classList.add('active');
    }

    hideLoading() {
        const loading = document.getElementById('firmaLoading');
        if (loading) loading.classList.remove('active');
    }
}

// ===== CLASE PROCESADOR DE FOTOS CARNET (ACTUALIZADA PARA NUEVOS TIPOS) =====
class PhotoCarnetDualProcessor {
    constructor() {
        this.currentType = null;
        this.currentStep = 'frente';
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
        document.getElementById('photoModalClose')?.addEventListener('click', () => this.closeModal());
        document.getElementById('captureBtn')?.addEventListener('click', () => this.capturePhoto());
        document.getElementById('retryBtn')?.addEventListener('click', () => this.retryCurrentPhoto());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('restartBtn')?.addEventListener('click', () => this.restartProcess());
        document.getElementById('confirmAllBtn')?.addEventListener('click', () => this.confirmAllPhotos());
        
        document.getElementById('photoModalOverlay')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });
    }

    async openModal(type) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        this.currentType = type;
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.resetModal();
        
        const modalOverlay = document.getElementById('photoModalOverlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'flex';
            modalOverlay.classList.add('active');
            
            setTimeout(() => {
                this.startCamera();
            }, 300);
            
            console.log('✅ Modal de foto mostrado');
        } else {
            console.error('❌ Modal de foto no encontrado');
        }
    }

    resetModal() {
        document.getElementById('photoLoading').style.display = 'block';
        document.getElementById('cameraContainer').style.display = 'none';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('photosSummary').style.display = 'none';
        
        this.updateProgressSteps();
        
        const preview = document.getElementById('photoPreview');
        if (preview) preview.src = '';
        
        this.isCapturing = false;
    }

    updateProgressSteps() {
        const stepFrente = document.getElementById('stepFrente');
        const stepReverso = document.getElementById('stepReverso');
        
        if (stepFrente && stepReverso) {
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
    }

    async startCamera() {
        try {
            this.showLoading('Iniciando cámara...', 'Solicitando permisos de acceso a la cámara');

            this.stream = await navigator.mediaDevices.getUserMedia(CONFIG.CAMERA.constraints);
            
            if (this.video) {
                this.video.srcObject = this.stream;
                
                await new Promise((resolve) => {
                    this.video.onloadedmetadata = resolve;
                });

                if (this.canvas) {
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;
                }

                this.showCamera();
            }

        } catch (error) {
            console.error('❌ Error al acceder a la cámara:', error);
            this.handleCameraError(error);
        }
    }

    showLoading(title, message) {
        const loading = document.getElementById('photoLoading');
        if (loading) {
            const h3 = loading.querySelector('h3');
            const p = loading.querySelector('p');
            if (h3) h3.textContent = title;
            if (p) p.textContent = message;
            loading.style.display = 'block';
        }
        
        document.getElementById('cameraContainer').style.display = 'none';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('photosSummary').style.display = 'none';
    }

    showCamera() {
        this.updateCameraUI();
        
        document.getElementById('photoLoading').style.display = 'none';
        document.getElementById('cameraContainer').style.display = 'block';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('photosSummary').style.display = 'none';
    }

    showPreview() {
        this.updatePreviewUI();
        
        document.getElementById('photoLoading').style.display = 'none';
        document.getElementById('cameraContainer').style.display = 'none';
        document.getElementById('previewContainer').style.display = 'block';
        document.getElementById('photosSummary').style.display = 'none';
    }

    showSummary() {
        this.updateSummaryUI();
        
        document.getElementById('photoLoading').style.display = 'none';
        document.getElementById('cameraContainer').style.display = 'none';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('photosSummary').style.display = 'block';
    }

    updateCameraUI() {
        const status = document.getElementById('photoStatus');
        const overlay = document.getElementById('cameraOverlay');
        
        if (status && overlay) {
            const h3 = status.querySelector('h3');
            const p = status.querySelector('p');
            
            if (this.currentStep === 'frente') {
                if (h3) h3.textContent = 'Posicione el FRENTE de su carnet en el recuadro';
                if (p) p.textContent = 'Debe verse la foto, nombre y RUT claramente';
                overlay.className = 'camera-overlay frente';
            } else if (this.currentStep === 'reverso') {
                if (h3) h3.textContent = 'Ahora posicione el REVERSO de su carnet';
                if (p) p.textContent = 'Debe verse la dirección y fecha de vencimiento';
                overlay.className = 'camera-overlay reverso';
            }
        }
        
        this.updateProgressSteps();
    }

    updatePreviewUI() {
        const status = document.getElementById('previewStatus');
        const nextBtn = document.getElementById('nextBtn');
        
        if (status && nextBtn) {
            const h3 = status.querySelector('h3');
            const p = status.querySelector('p');
            const span = nextBtn.querySelector('span:last-child');
            
            if (this.currentStep === 'frente') {
                if (h3) h3.textContent = 'Vista previa del FRENTE';
                if (p) p.textContent = 'Verifique que se vea la foto, nombre y RUT';
                if (span) span.textContent = 'Continuar al Reverso';
            } else if (this.currentStep === 'reverso') {
                if (h3) h3.textContent = 'Vista previa del REVERSO';
                if (p) p.textContent = 'Verifique que se vea la dirección y vencimiento';
                if (span) span.textContent = 'Finalizar Capturas';
            }
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
        let errorTitle = 'Error de Cámara';
        let errorMessage = 'No se pudo acceder a la cámara';
        
        switch (error.name) {
            case 'NotAllowedError':
                errorTitle = '🚫 Acceso Denegado';
                errorMessage = 'Permisos de cámara denegados';
                break;
            case 'NotFoundError':
                errorTitle = '📷 Cámara No Encontrada';
                errorMessage = 'No se detectó ninguna cámara';
                break;
            case 'NotReadableError':
                errorTitle = '⚠️ Cámara Ocupada';
                errorMessage = 'La cámara está siendo usada por otra aplicación';
                break;
            default:
                errorTitle = '❌ Error de Cámara';
                errorMessage = 'Error inesperado al acceder a la cámara';
        }

        this.showLoading(errorTitle, errorMessage);
        
        if (window.ordenCompraSystem) {
            window.ordenCompraSystem.showNotification(errorMessage, 'error');
        }
    }

    capturePhoto() {
        if (!this.video || !this.canvas || !this.context || this.isCapturing) {
            return;
        }

        this.isCapturing = true;

        try {
            this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            const imageData = this.canvas.toDataURL(CONFIG.CAMERA.capture_format, CONFIG.CAMERA.capture_quality);
            
            this.tempImages[this.currentStep] = imageData;
            
            const preview = document.getElementById('photoPreview');
            if (preview) {
                preview.src = imageData;
            }
            
            this.showPreview();
            
            if (window.ordenCompraSystem) {
                window.ordenCompraSystem.showNotification(`Foto del ${this.currentStep} capturada`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            if (window.ordenCompraSystem) {
                window.ordenCompraSystem.showNotification('Error al capturar la foto', 'error');
            }
        }

        this.isCapturing = false;
    }

    retryCurrentPhoto() {
        this.tempImages[this.currentStep] = null;
        this.showCamera();
    }

    nextStep() {
        if (this.currentStep === 'frente' && this.tempImages.frente) {
            this.currentStep = 'reverso';
            this.showCamera();
            if (window.ordenCompraSystem) {
                window.ordenCompraSystem.showNotification('Ahora capture el reverso del carnet', 'info');
            }
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            this.currentStep = 'completed';
            this.showSummary();
            if (window.ordenCompraSystem) {
                window.ordenCompraSystem.showNotification('Ambas fotos capturadas', 'success');
            }
        }
    }

    restartProcess() {
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        if (window.ordenCompraSystem) {
            window.ordenCompraSystem.showNotification('Proceso reiniciado', 'info');
        }
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            if (window.ordenCompraSystem) {
                window.ordenCompraSystem.showNotification('Faltan fotos por capturar', 'error');
            }
            return;
        }

        try {
            const processedFrente = await this.processCarnetImage(this.tempImages.frente);
            const processedReverso = await this.processCarnetImage(this.tempImages.reverso);
            
            systemState.fotosCarnet[this.currentType] = {
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

            this.updateButton(this.currentType, true);
            
            if (window.ordenCompraSystem) {
                window.ordenCompraSystem.updateProgress();
            }

            this.closeModal();
            
            if (window.ordenCompraSystem) {
                window.ordenCompraSystem.showNotification(`Carnet completo del ${this.currentType} guardado`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al confirmar fotos:', error);
            if (window.ordenCompraSystem) {
                window.ordenCompraSystem.showNotification('Error al procesar las fotos', 'error');
            }
        }
    }

    async processCarnetImage(imageData) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                const maxWidth = CONFIG.SECURITY.max_photo_width;
                const maxHeight = CONFIG.SECURITY.max_photo_height;
                const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
                const newWidth = img.width * ratio;
                const newHeight = img.height * ratio;
                
                canvas.width = newWidth;
                canvas.height = newHeight;
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                
                resolve(canvas.toDataURL('image/jpeg', CONFIG.SECURITY.compression_quality));
            };
            
            img.onerror = () => {
                resolve(imageData);
            };
            
            img.src = imageData;
        });
    }

    updateButton(type, completed) {
        const buttonId = `photo${type.charAt(0).toUpperCase() + type.slice(1)}`;
        const button = document.getElementById(buttonId);
        
        if (button) {
            const textElement = button.querySelector('.photo-text');
            if (textElement) {
                if (completed) {
                    button.classList.add('uploaded');
                    textElement.textContent = 'FOTOS COMPLETAS';
                } else {
                    button.classList.remove('uploaded');
                    textElement.textContent = 'FOTO CARNET';
                }
            }
        }
    }

    closeModal() {
        this.stopCamera();
        
        const modalOverlay = document.getElementById('photoModalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            setTimeout(() => {
                modalOverlay.style.display = 'none';
            }, 300);
        }
        
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
        }
    }

    clearAllPhotos() {
        ['cliente', 'proveedor'].forEach(type => {
            systemState.fotosCarnet[type] = {
                frente: { captured: false, imageData: null, timestamp: null },
                reverso: { captured: false, imageData: null, timestamp: null },
                completed: false
            };
            this.updateButton(type, false);
        });
    }
}

// ===== FUNCIONES GLOBALES =====
window.clearForm = function() {
    if (window.ordenCompraSystem) {
        window.ordenCompraSystem.clearForm();
    }
};

window.generatePDF = function() {
    if (window.ordenCompraSystem) {
        window.ordenCompraSystem.generatePDF();
    }
};

// ===== INICIALIZACIÓN DEL SISTEMA =====
let ordenCompraSystem;

function initializeOrdenCompraSystem() {
    console.log('📋 Iniciando Sistema de Orden de Compra...');
    
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined') {
        console.warn('⚠️ jsPDF no está disponible, esperando...');
        setTimeout(initializeOrdenCompraSystem, 1000);
        return;
    }
    
    // Verificar que CONFIG esté disponible
    if (typeof CONFIG === 'undefined') {
        console.warn('⚠️ CONFIG no está disponible, esperando...');
        setTimeout(initializeOrdenCompraSystem, 1000);
        return;
    }
    
    try {
        ordenCompraSystem = new OrdenCompraSystem();
        window.ordenCompraSystem = ordenCompraSystem;
        
        console.log('✅ Sistema completamente inicializado');
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        setTimeout(initializeOrdenCompraSystem, 2000);
    }
}

// ===== MÚLTIPLES PUNTOS DE INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOrdenCompraSystem);
} else if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(initializeOrdenCompraSystem, 500);
}

window.addEventListener('load', () => {
    if (!window.ordenCompraSystem) {
        console.log('🔄 Inicialización de respaldo activada');
        setTimeout(initializeOrdenCompraSystem, 1000);
    }
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', (event) => {
    console.error('❌ Error global capturado:', event.error);
    
    if (window.ordenCompraSystem) {
        window.ordenCompraSystem.showNotification(
            'Se detectó un error. El sistema intentará recuperarse automáticamente.', 
            'warning'
        );
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
    
    if (window.ordenCompraSystem) {
        window.ordenCompraSystem.showNotification(
            'Error de conectividad detectado. Algunos componentes pueden funcionar de forma limitada.', 
            'warning'
        );
    }
});

// ===== LOG FINAL =====
console.log('📜 Sistema de Orden de Compra - Script principal cargado correctamente');