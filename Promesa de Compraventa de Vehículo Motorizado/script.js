// ========================================
// 🚗 SISTEMA DE PROMESA DE COMPRAVENTA - SCRIPT PRINCIPAL
// ========================================

// ===== ESTADO GLOBAL DEL SISTEMA =====
const systemState = {
    formFields: [
        'nombreVendedor', 'rutVendedor', 'domicilioVendedor', 'comunaVendedor',
        'nombreComprador', 'rutComprador', 'domicilioComprador', 'comunaComprador',
        'tipoVehiculo', 'marcaVehiculo', 'modeloVehiculo', 'anoVehiculo', 
        'colorVehiculo', 'patenteVehiculo', 'motorVehiculo', 'chasisVehiculo',
        'lugarContrato', 'fechaContrato', 'precioNumeros', 'precioLetras', 
        'formaPago', 'fechaEntrega', 'fechaVentaDefinitiva', 'condicionesAdicionales',
        'montoMulta', 'domicilioLegal'
    ],
    
    firmasDigitales: {
        vendedor: false,
        comprador: false
    },
    
    fotosCarnet: {
        vendedor: {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        },
        comprador: {
            frente: { captured: false, imageData: null, timestamp: null },
            reverso: { captured: false, imageData: null, timestamp: null },
            completed: false
        }
    }
};

// ===== CLASE PRINCIPAL DEL SISTEMA =====
class PromesaCompraventaSystem {
    constructor() {
        this.mesesEspanol = CONFIG.MONTHS;
        this.init();
    }

    async init() {
        console.log('🚗 Inicializando Sistema de Promesa de Compraventa...');
        
        try {
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            this.setupEventListeners();
            this.initializeFormFields();
            this.restoreFormState();
            this.updatePreview();
            
            // Inicializar sistemas especiales con delay
            setTimeout(() => {
                this.initializeSignatureSystem();
                this.initializePhotoSystem();
            }, 1000);
            
            console.log('✅ Sistema inicializado correctamente');
            this.showNotification('Sistema cargado y listo para usar', 'success');
            
        } catch (error) {
            console.error('❌ Error inicializando sistema:', error);
            this.showNotification('Error al cargar el sistema', 'error');
        }
    }

    setupEventListeners() {
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('input', () => this.updatePreview());
                element.addEventListener('change', () => this.updatePreview());
            }
        });

        this.setupSpecialFieldListeners();
        
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });

        console.log('🎧 Event listeners configurados');
    }

    setupSpecialFieldListeners() {
        const rutVendedor = document.getElementById('rutVendedor');
        if (rutVendedor) {
            rutVendedor.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutVendedor');
            });
        }

        const rutComprador = document.getElementById('rutComprador');
        if (rutComprador) {
            rutComprador.addEventListener('input', (e) => {
                this.handleRutInput(e, 'rutComprador');
            });
        }

        const patente = document.getElementById('patenteVehiculo');
        if (patente) {
            patente.addEventListener('input', (e) => {
                this.handlePatenteInput(e);
            });
        }

        const precioNumeros = document.getElementById('precioNumeros');
        if (precioNumeros) {
            precioNumeros.addEventListener('input', (e) => {
                this.handlePriceInput(e);
            });
        }
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

    handlePatenteInput(event) {
        const formatted = ConfigUtils.formatPatente(event.target.value);
        event.target.value = formatted;
        
        if (formatted.length >= 6) {
            const isValid = ConfigUtils.validatePatente(formatted);
            event.target.classList.toggle('rut-valid', isValid);
            event.target.classList.toggle('rut-invalid', !isValid);
        }
        
        this.updatePreview();
    }

    handlePriceInput(event) {
        const price = parseInt(event.target.value);
        
        if (price > 0) {
            const precioLetras = document.getElementById('precioLetras');
            if (precioLetras && !precioLetras.value) {
                const palabras = this.convertNumberToWords(price);
                precioLetras.value = palabras;
            }
        }
        
        this.updatePreview();
    }

    convertNumberToWords(number) {
        if (number === 0) return 'cero pesos';
        
        if (number < 1000) {
            return `${number} pesos`;
        }
        
        if (number < 1000000) {
            return `${Math.floor(number / 1000)} mil pesos`;
        }
        
        if (number < 1000000000) {
            return `${Math.floor(number / 1000000)} ${Math.floor(number / 1000000) === 1 ? 'millón' : 'millones'} de pesos`;
        }
        
        return 'cantidad en pesos';
    }

    updatePreview() {
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            const preview = document.getElementById('prev_' + field);
            if (element && preview) {
                let value = element.value || '';
                
                if (field.includes('precio') && value) {
                    value = this.formatPrice(value);
                }
                
                preview.textContent = value || this.getPlaceholderText(field);
            }
        });

        this.updateCrossReferences();
        this.updateDatePreview();
        this.updateSignatureNames();
        this.updateProgress();
    }

    updateCrossReferences() {
        const nombreVendedor = document.getElementById('nombreVendedor').value;
        const refs = ['prev_nombreVendedor2', 'prev_nombreVendedor3'];
        refs.forEach(refId => {
            const element = document.getElementById(refId);
            if (element) {
                element.textContent = nombreVendedor || '.........................';
            }
        });

        const nombreComprador = document.getElementById('nombreComprador').value;
        const refComprador = document.getElementById('prev_nombreComprador2');
        if (refComprador) {
            refComprador.textContent = nombreComprador || '.........................';
        }

        const comunaVendedor = document.getElementById('comunaVendedor').value;
        const prevComunaContrato = document.getElementById('prev_comunaContrato');
        if (prevComunaContrato) {
            prevComunaContrato.textContent = comunaVendedor || 'xxx';
        }
    }

    updateDatePreview() {
        const fechaContrato = document.getElementById('fechaContrato').value;
        
        if (fechaContrato) {
            const date = new Date(fechaContrato);
            
            document.getElementById('prev_dia').textContent = date.getDate();
            document.getElementById('prev_mes').textContent = this.mesesEspanol[date.getMonth()];
            document.getElementById('prev_anio').textContent = date.getFullYear();
        } else {
            document.getElementById('prev_dia').textContent = '...';
            document.getElementById('prev_mes').textContent = '........';
            document.getElementById('prev_anio').textContent = '20..';
        }

        this.updateFormattedDate('fechaEntrega', 'prev_fechaEntrega');
        this.updateFormattedDate('fechaVentaDefinitiva', 'prev_fechaVentaDefinitiva');
    }

    updateFormattedDate(sourceId, targetId) {
        const sourceElement = document.getElementById(sourceId);
        const targetElement = document.getElementById(targetId);
        
        if (sourceElement && targetElement) {
            const dateValue = sourceElement.value;
            if (dateValue) {
                const date = new Date(dateValue);
                const formatted = `${date.getDate()} de ${this.mesesEspanol[date.getMonth()]} de ${date.getFullYear()}`;
                targetElement.textContent = formatted;
            } else {
                targetElement.textContent = '... de .......... de 20..';
            }
        }
    }

    updateSignatureNames() {
        const nombreVendedor = document.getElementById('nombreVendedor').value;
        const nombreComprador = document.getElementById('nombreComprador').value;
        
        const firmaVendedor = document.getElementById('prev_firmaVendedor');
        const firmaComprador = document.getElementById('prev_firmaComprador');
        
        if (firmaVendedor) {
            firmaVendedor.textContent = nombreVendedor || '_______________';
        }
        
        if (firmaComprador) {
            firmaComprador.textContent = nombreComprador || '_______________';
        }
    }

    getPlaceholderText(field) {
        const placeholders = {
            'nombreVendedor': '.........................',
            'nombreComprador': '.........................',
            'rutVendedor': '................',
            'rutComprador': '................',
            'tipoVehiculo': '............',
            'marcaVehiculo': '................',
            'modeloVehiculo': '................',
            'anoVehiculo': '.......',
            'colorVehiculo': '................',
            'patenteVehiculo': '.........',
            'motorVehiculo': '............',
            'chasisVehiculo': '................',
            'precioNumeros': '............',
            'precioLetras': '.........................',
            'montoMulta': '...........',
            'domicilioLegal': '...........'
        };
        
        return placeholders[field] || '...........';
    }

    formatPrice(price) {
        const number = parseInt(price);
        if (isNaN(number)) return price;
        
        return new Intl.NumberFormat('es-CL').format(number);
    }

    updateProgress() {
        const totalFields = systemState.formFields.length;
        let filledFields = 0;
        
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            if (element && element.value.trim() !== '') {
                filledFields++;
            }
        });
        
        let bonusScore = 0;
        
        if (systemState.firmasDigitales.vendedor) bonusScore += 0.3;
        if (systemState.firmasDigitales.comprador) bonusScore += 0.3;
        
        if (systemState.fotosCarnet.vendedor.completed) bonusScore += 0.4;
        if (systemState.fotosCarnet.comprador.completed) bonusScore += 0.4;
        
        const progress = ((filledFields + bonusScore) / (totalFields + 1.4)) * 100;
        
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
    initializeSignatureSystem() {
        console.log('🖋️ Inicializando sistema de firmas digitales...');
        
        // Crear procesador
        window.firmaProcessor = new FirmaDigitalProcessor();
        
        // Configurar botones
        this.setupSignatureButtons();
    }

    setupSignatureButtons() {
        console.log('🖋️ Configurando botones de firma...');
        
        const btnFirmaVendedor = document.getElementById('firmaVendedor');
        const btnFirmaComprador = document.getElementById('firmaComprador');
        
        if (btnFirmaVendedor) {
            btnFirmaVendedor.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🖋️ Clic en firma vendedor');
                this.openSignatureModal('vendedor');
            });
            console.log('✅ Botón firma vendedor configurado');
        }
        
        if (btnFirmaComprador) {
            btnFirmaComprador.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🖋️ Clic en firma comprador');
                this.openSignatureModal('comprador');
            });
            console.log('✅ Botón firma comprador configurado');
        }
    }

    openSignatureModal(type) {
        console.log(`🖋️ Abriendo modal de firma para: ${type}`);
        
        const nombreField = document.getElementById(`nombre${type.charAt(0).toUpperCase() + type.slice(1)}`);
        
        if (!nombreField || !nombreField.value.trim()) {
            this.showNotification(`Complete el nombre del ${type} antes de firmar`, 'warning');
            return;
        }
        
        if (window.firmaProcessor) {
            window.firmaProcessor.openModal(type);
        } else {
            this.showNotification('Sistema de firmas no disponible', 'error');
        }
    }

    // ===== SISTEMA DE FOTOS CARNET =====
    initializePhotoSystem() {
        console.log('📷 Inicializando sistema de fotos carnet...');
        
        // Crear procesador
        window.photoProcessor = new PhotoCarnetDualProcessor();
        
        // Configurar botones
        this.setupPhotoButtons();
    }

    setupPhotoButtons() {
        console.log('📷 Configurando botones de foto...');
        
        const btnPhotoVendedor = document.getElementById('photoVendedor');
        const btnPhotoComprador = document.getElementById('photoComprador');
        
        if (btnPhotoVendedor) {
            btnPhotoVendedor.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📷 Clic en foto vendedor');
                this.openPhotoModal('vendedor');
            });
            console.log('✅ Botón foto vendedor configurado');
        }
        
        if (btnPhotoComprador) {
            btnPhotoComprador.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📷 Clic en foto comprador');
                this.openPhotoModal('comprador');
            });
            console.log('✅ Botón foto comprador configurado');
        }
    }

    openPhotoModal(type) {
        console.log(`📷 Abriendo modal de foto para: ${type}`);
        
        const nombreField = document.getElementById(`nombre${type.charAt(0).toUpperCase() + type.slice(1)}`);
        
        if (!nombreField || !nombreField.value.trim()) {
            this.showNotification(`Complete el nombre del ${type} antes de tomar fotos`, 'warning');
            return;
        }
        
        if (window.photoProcessor) {
            window.photoProcessor.openModal(type);
        } else {
            this.showNotification('Sistema de fotos no disponible', 'error');
        }
    }

    // ===== FUNCIONES DE UTILIDAD =====
    initializeFormFields() {
        console.log('📝 Campos del formulario inicializados');
    }

    saveFormState() {
        const data = {};
        
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                data[field] = element.value;
            }
        });
        
        data.firmasDigitales = systemState.firmasDigitales;
        data.fotosCarnet = systemState.fotosCarnet;
        
        try {
            localStorage.setItem(CONFIG.AUTOSAVE.key, JSON.stringify(data));
        } catch (error) {
            console.warn('⚠️ No se pudo guardar automáticamente');
        }
    }

    restoreFormState() {
        try {
            const savedData = localStorage.getItem(CONFIG.AUTOSAVE.key);
            if (savedData) {
                const data = JSON.parse(savedData);
                
                Object.keys(data).forEach(field => {
                    if (field === 'firmasDigitales') {
                        systemState.firmasDigitales = data.firmasDigitales || { vendedor: false, comprador: false };
                    } else if (field === 'fotosCarnet') {
                        systemState.fotosCarnet = data.fotosCarnet || systemState.fotosCarnet;
                    } else {
                        const element = document.getElementById(field);
                        if (element && data[field]) {
                            element.value = data[field];
                        }
                    }
                });
                
                this.updatePreview();
                console.log('📥 Formulario restaurado');
            }
        } catch (error) {
            console.warn('⚠️ No se pudo restaurar el formulario');
        }
    }

    clearForm() {
        this.showConfirmDialog(
            '¿Está seguro de que desea limpiar todos los campos?',
            'Esta acción también removerá las firmas digitales y fotos de carnet.',
            () => {
                systemState.formFields.forEach(field => {
                    const element = document.getElementById(field);
                    if (element) {
                        element.value = '';
                        element.classList.remove('rut-valid', 'rut-invalid');
                    }
                });
                
                systemState.firmasDigitales = { vendedor: false, comprador: false };
                systemState.fotosCarnet = {
                    vendedor: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false },
                    comprador: { frente: { captured: false, imageData: null, timestamp: null }, reverso: { captured: false, imageData: null, timestamp: null }, completed: false }
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

    // ===== SISTEMA DE NOTIFICACIONES =====
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${this.getNotificationIcon(type)}</div>
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
            success: 'linear-gradient(135deg, #48bb78, #38a169)',
            error: 'linear-gradient(135deg, #f56565, #e53e3e)',
            info: 'linear-gradient(135deg, #4299e1, #3182ce)',
            warning: 'linear-gradient(135deg, #ed8936, #dd6b20)'
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
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        return icons[type] || icons.info;
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
                background: linear-gradient(135deg, #2d3748, #4a5568);
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
                background: #718096;
                color: white;
            }
            .dialog-btn-cancel:hover {
                background: #4a5568;
            }
            .dialog-btn-confirm {
                background: linear-gradient(135deg, #ed8936, #dd6b20);
                color: white;
            }
            .dialog-btn-confirm:hover {
                background: linear-gradient(135deg, #dd6b20, #c05621);
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
        const btn = event.target;
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
            const doc = new jsPDF();

            this.setupPDFDocument(doc);
            await this.addPDFContent(doc);
            
            const fileName = this.generateFileName();
            
            setTimeout(() => {
                doc.save(fileName);
                this.showNotification('¡PDF de Promesa de Compraventa generado exitosamente!', 'success');
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

        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.text('PROMESA DE COMPRAVENTA', 105, y, { align: 'center' });
        y += 8;
        
        doc.setFontSize(12);
        doc.text('Vehículo Motorizado', 105, y, { align: 'center' });
        y += 20;

        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        
        const introText = this.generateIntroText();
        const splitIntro = doc.splitTextToSize(introText, pageWidth - 2 * margin);
        doc.text(splitIntro, margin, y);
        y += splitIntro.length * 5 + 15;

        y = this.addClausePrimero(doc, y, pageWidth, margin);
        y = this.addClauseSegundo(doc, y, pageWidth, margin);
        y = this.addClauseTercero(doc, y, pageWidth, margin);
        y = this.addClauseCuarto(doc, y, pageWidth, margin);
        y = this.addClauseQuinto(doc, y, pageWidth, margin);
        y = this.addClauseSexto(doc, y, pageWidth, margin);
        y = this.addClauseSeptimo(doc, y, pageWidth, margin);
        y = this.addClauseOctavo(doc, y, pageWidth, margin);
        y = this.addClauseNoveno(doc, y, pageWidth, margin);
        
        this.addSignatureSection(doc, y + 20);
        this.addDigitalWatermark(doc);
    }

    generateIntroText() {
        const lugarContrato = document.getElementById('lugarContrato').value;
        const comunaVendedor = document.getElementById('comunaVendedor').value;
        const fechaContrato = new Date(document.getElementById('fechaContrato').value);
        
        return `En ${lugarContrato}, comuna de ${comunaVendedor}, a ${fechaContrato.getDate()} de ${this.mesesEspanol[fechaContrato.getMonth()]} de ${fechaContrato.getFullYear()}, entre don(ña) ${document.getElementById('nombreVendedor').value}, C.I. N° ${document.getElementById('rutVendedor').value}, domiciliado(a) en ${document.getElementById('domicilioVendedor').value}, comuna de ${document.getElementById('comunaVendedor').value}, en adelante el promitente vendedor(a); y don(ña) ${document.getElementById('nombreComprador').value}, C.I. N° ${document.getElementById('rutComprador').value}, domiciliado(a) en ${document.getElementById('domicilioComprador').value}, comuna de ${document.getElementById('comunaComprador').value}, en adelante el promitente comprador(a). Han convenido en el siguiente contrato de Promesa de Compraventa Vehículo Motorizado:`;
    }

    addClausePrimero(doc, y, pageWidth, margin) {
        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.text('PRIMERO:', margin, y);
        y += 10;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        const clauseText = `Don(ña) ${document.getElementById('nombreVendedor').value}, declara ser dueño de un vehículo tipo: ${document.getElementById('tipoVehiculo').value}; marca: ${document.getElementById('marcaVehiculo').value}; modelo: ${document.getElementById('modeloVehiculo').value}; N° motor: ${document.getElementById('motorVehiculo').value}, N° chasis: ${document.getElementById('chasisVehiculo').value}; color: ${document.getElementById('colorVehiculo').value}; año: ${document.getElementById('anoVehiculo').value}, Patente e Inscripción: ${document.getElementById('patenteVehiculo').value}`;
        
        const splitText = doc.splitTextToSize(clauseText, pageWidth - 2 * margin);
        doc.text(splitText, margin, y);
        
        return y + splitText.length * 5 + 15;
    }

    addClauseSegundo(doc, y, pageWidth, margin) {
        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.text('SEGUNDO:', margin, y);
        y += 10;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        const clauseText = `Por el presente instrumento don(ña) ${document.getElementById('nombreVendedor').value}, promete vender, ceder y transferir a don(ña) ${document.getElementById('nombreComprador').value}, quien promete comprar, aceptar y adquirir para sí, el vehículo antes singularizado.`;
        
        const splitText = doc.splitTextToSize(clauseText, pageWidth - 2 * margin);
        doc.text(splitText, margin, y);
        
        return y + splitText.length * 5 + 15;
    }

    addClauseTercero(doc, y, pageWidth, margin) {
        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.text('TERCERO:', margin, y);
        y += 10;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        const clauseText = `El precio de la venta es la suma de $ ${document.getElementById('precioNumeros').value} (${document.getElementById('precioLetras').value}), los que se pagan de la siguiente manera: ${document.getElementById('formaPago').value}`;
        
        const splitText = doc.splitTextToSize(clauseText, pageWidth - 2 * margin);
        doc.text(splitText, margin, y);
        
        return y + splitText.length * 5 + 15;
    }

    addClauseCuarto(doc, y, pageWidth, margin) {
        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.text('CUARTO:', margin, y);
        y += 10;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        const clauseText = CONFIG.DOCUMENT.legal_texts.saneamiento;
        
        const splitText = doc.splitTextToSize(clauseText, pageWidth - 2 * margin);
        doc.text(splitText, margin, y);
        
        return y + splitText.length * 5 + 15;
    }

    addClauseQuinto(doc, y, pageWidth, margin) {
        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.text('QUINTO:', margin, y);
        y += 10;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        const fechaEntrega = new Date(document.getElementById('fechaEntrega').value);
        const clauseText = `La entrega del vehículo y sus llaves, se hace con fecha ${fechaEntrega.getDate()} de ${this.mesesEspanol[fechaEntrega.getMonth()]} de ${fechaEntrega.getFullYear()}, recibiendo el promitente comprador a entera satisfacción del promitente comprador.`;
        
        const splitText = doc.splitTextToSize(clauseText, pageWidth - 2 * margin);
        doc.text(splitText, margin, y);
        
        return y + splitText.length * 5 + 15;
    }

    addClauseSexto(doc, y, pageWidth, margin) {
        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.text('SEXTO:', margin, y);
        y += 10;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        const fechaVenta = new Date(document.getElementById('fechaVentaDefinitiva').value);
        const clauseText = `La venta definitiva se efectuará el día ${fechaVenta.getDate()} de ${this.mesesEspanol[fechaVenta.getMonth()]} del ${fechaVenta.getFullYear()}, una vez ${document.getElementById('condicionesAdicionales').value}`;
        
        const splitText = doc.splitTextToSize(clauseText, pageWidth - 2 * margin);
        doc.text(splitText, margin, y);
        
        return y + splitText.length * 5 + 15;
    }

    addClauseSeptimo(doc, y, pageWidth, margin) {
        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.text('SÉPTIMO:', margin, y);
        y += 10;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        const clauseText = CONFIG.DOCUMENT.legal_texts.no_enajenacion;
        
        const splitText = doc.splitTextToSize(clauseText, pageWidth - 2 * margin);
        doc.text(splitText, margin, y);
        
        return y + splitText.length * 5 + 15;
    }

    addClauseOctavo(doc, y, pageWidth, margin) {
        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.text('OCTAVO:', margin, y);
        y += 10;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        const clauseText = CONFIG.DOCUMENT.legal_texts.multa_incumplimiento.replace('[MONTO_MULTA]', document.getElementById('montoMulta').value);
        
        const splitText = doc.splitTextToSize(clauseText, pageWidth - 2 * margin);
        doc.text(splitText, margin, y);
        
        return y + splitText.length * 5 + 15;
    }

    addClauseNoveno(doc, y, pageWidth, margin) {
        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.text('NOVENO:', margin, y);
        y += 10;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        const clauseText = CONFIG.DOCUMENT.legal_texts.domicilio_legal.replace('[DOMICILIO_LEGAL]', document.getElementById('domicilioLegal').value);
        
        const splitText = doc.splitTextToSize(clauseText, pageWidth - 2 * margin);
        doc.text(splitText, margin, y);
        
        return y + splitText.length * 5 + 15;
    }

    addSignatureSection(doc, y) {
        console.log('📄 Agregando sección de firmas al PDF...');
        
        doc.line(25, y, 100, y);
        doc.line(120, y, 195, y);
        y += 8;
        
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.text(document.getElementById('nombreVendedor').value, 62.5, y, { align: 'center' });
        doc.text(document.getElementById('nombreComprador').value, 157.5, y, { align: 'center' });
        y += 6;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.text('PROMITENTE VENDEDOR', 62.5, y, { align: 'center' });
        doc.text('PROMITENTE COMPRADOR', 157.5, y, { align: 'center' });
        
        if (window.firmaProcessor) {
            try {
                const firmaVendedor = window.firmaProcessor.getSignatureForPDF('vendedor');
                const firmaComprador = window.firmaProcessor.getSignatureForPDF('comprador');
                
                if (firmaVendedor) {
                    doc.addImage(firmaVendedor, 'PNG', 25, y - 45, 75, 35);
                    console.log('✅ Firma del vendedor agregada al PDF');
                }
                
                if (firmaComprador) {
                    doc.addImage(firmaComprador, 'PNG', 120, y - 45, 75, 35);
                    console.log('✅ Firma del comprador agregada al PDF');
                }
                
                if (firmaVendedor && firmaComprador) {
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
        doc.text('Documento firmado digitalmente - Notaría Digital Chile', 105, 280, { align: 'center' });
        doc.text(`Generado el ${new Date().toLocaleString('es-CL')}`, 105, 285, { align: 'center' });
        doc.setTextColor(0, 0, 0);
    }

    generateFileName() {
        const nombreVendedor = document.getElementById('nombreVendedor').value
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]/g, '');
        const patente = document.getElementById('patenteVehiculo').value;
        const timestamp = new Date().toISOString().slice(0, 10);
        return `Promesa_Compraventa_${nombreVendedor}_${patente}_${timestamp}.pdf`;
    }

    validateFormWithSignatures() {
        const emptyFields = [];
        
        systemState.formFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element || !element.value.trim()) {
                emptyFields.push(field);
            }
        });
        
        const issues = [];
        
        if (emptyFields.length > 0) {
            issues.push(`Complete ${emptyFields.length} campos faltantes`);
        }
        
        if (!systemState.firmasDigitales.vendedor || !systemState.firmasDigitales.comprador) {
            const firmasFaltantes = [];
            if (!systemState.firmasDigitales.vendedor) firmasFaltantes.push('Vendedor');
            if (!systemState.firmasDigitales.comprador) firmasFaltantes.push('Comprador');
            issues.push(`Falta firma digital de: ${firmasFaltantes.join(', ')}`);
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}

// ===== CLASES AUXILIARES =====

class FirmaDigitalProcessor {
    constructor() {
        this.processedImageData = null;
        this.currentType = null;
        this.firmasDigitales = {
            vendedor: null,
            comprador: null
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
        if (!file.type.startsWith('image/')) {
            this.showAlert('Por favor selecciona una imagen válida (PNG, JPG, JPEG)', 'error');
            return;
        }
        if (file.size > CONFIG.SECURITY.max_file_size) {
            this.showAlert('La imagen es muy grande. Máximo 5MB', 'error');
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
            
            const isWhitish = luminosity > 160;
            const isGrayish = average > 140 && colorDiff < 40;
            const isLightColor = minColor > 120;
            
            if (isWhitish || isGrayish || isLightColor) {
                data[i + 3] = 0;
            } else {
                const factor = 1.2;
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
            
            if (window.promesaSystem) {
                window.promesaSystem.updateProgress();
            }
            
            this.closeModal();
            
            if (window.promesaSystem) {
                window.promesaSystem.showNotification(`Firma digital del ${this.currentType} aplicada correctamente`, 'success');
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
        this.firmasDigitales.vendedor = null;
        this.firmasDigitales.comprador = null;
        
        systemState.firmasDigitales = { vendedor: false, comprador: false };
        
        ['vendedor', 'comprador'].forEach(type => {
            const buttonId = `firma${type.charAt(0).toUpperCase() + type.slice(1)}`;
            const button = document.getElementById(buttonId);
            if (button) {
                button.classList.remove('signed');
                const textElement = button.querySelector('.signature-text');
                if (textElement) {
                    textElement.textContent = 'FIRMA DIGITAL';
                }
            }
            
            const placeholderId = `signaturePlaceholder${type.charAt(0).toUpperCase() + type.slice(1)}`;
            const previewId = `signaturePreview${type.charAt(0).toUpperCase() + type.slice(1)}`;
            
            const placeholder = document.getElementById(placeholderId);
            const preview = document.getElementById(previewId);
            
            if (placeholder && preview) {
                placeholder.style.display = 'inline';
                preview.style.display = 'none';
                preview.src = '';
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

            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'environment'
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
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
        let errorMessage = 'Error al acceder a la cámara';
        let errorDetail = 'Intente nuevamente o verifique los permisos';

        if (error.name === 'NotAllowedError') {
            errorMessage = 'Acceso a la cámara denegado';
            errorDetail = 'Debe permitir el acceso a la cámara para tomar fotos';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'No se encontró cámara';
            errorDetail = 'Verifique que su dispositivo tenga una cámara conectada';
        }

        this.showLoading(errorMessage, errorDetail);
        
        if (window.promesaSystem) {
            window.promesaSystem.showNotification(errorMessage, 'error');
        }
    }

    capturePhoto() {
        if (!this.video || !this.canvas || !this.context || this.isCapturing) {
            return;
        }

        this.isCapturing = true;

        try {
            this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            const imageData = this.canvas.toDataURL('image/jpeg', 0.8);
            
            this.tempImages[this.currentStep] = imageData;
            
            const preview = document.getElementById('photoPreview');
            if (preview) {
                preview.src = imageData;
            }
            
            this.showPreview();
            
            if (window.promesaSystem) {
                window.promesaSystem.showNotification(`Foto del ${this.currentStep} capturada`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al capturar foto:', error);
            if (window.promesaSystem) {
                window.promesaSystem.showNotification('Error al capturar la foto', 'error');
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
            if (window.promesaSystem) {
                window.promesaSystem.showNotification('Ahora capture el reverso del carnet', 'info');
            }
        } else if (this.currentStep === 'reverso' && this.tempImages.reverso) {
            this.currentStep = 'completed';
            this.showSummary();
            if (window.promesaSystem) {
                window.promesaSystem.showNotification('Ambas fotos capturadas', 'success');
            }
        }
    }

    restartProcess() {
        this.currentStep = 'frente';
        this.tempImages = { frente: null, reverso: null };
        this.showCamera();
        if (window.promesaSystem) {
            window.promesaSystem.showNotification('Proceso reiniciado', 'info');
        }
    }

    async confirmAllPhotos() {
        if (!this.tempImages.frente || !this.tempImages.reverso || !this.currentType) {
            if (window.promesaSystem) {
                window.promesaSystem.showNotification('Faltan fotos por capturar', 'error');
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
            
            if (window.promesaSystem) {
                window.promesaSystem.updateProgress();
            }

            this.closeModal();
            
            if (window.promesaSystem) {
                window.promesaSystem.showNotification(`Carnet completo del ${this.currentType} guardado`, 'success');
            }

        } catch (error) {
            console.error('❌ Error al confirmar fotos:', error);
            if (window.promesaSystem) {
                window.promesaSystem.showNotification('Error al procesar las fotos', 'error');
            }
        }
    }

    async processCarnetImage(imageData) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                const maxWidth = 800;
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                const newWidth = img.width * ratio;
                const newHeight = img.height * ratio;
                
                canvas.width = newWidth;
                canvas.height = newHeight;
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                
                resolve(canvas.toDataURL('image/jpeg', 0.85));
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
        ['vendedor', 'comprador'].forEach(type => {
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
    if (window.promesaSystem) {
        window.promesaSystem.clearForm();
    }
};

window.generatePDF = function() {
    if (window.promesaSystem) {
        window.promesaSystem.generatePDF();
    }
};

// ===== INICIALIZACIÓN DEL SISTEMA =====
let promesaSystem;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚗 Iniciando Sistema de Promesa de Compraventa...');
    
    const criticalElements = [
        'firmaModalOverlay', 'photoModalOverlay',
        'firmaVendedor', 'firmaComprador',
        'photoVendedor', 'photoComprador'
    ];
    
    const missingElements = criticalElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('❌ Elementos críticos faltantes:', missingElements);
    } else {
        console.log('✅ Todos los elementos críticos encontrados');
    }
    
    promesaSystem = new PromesaCompraventaSystem();
    window.promesaSystem = promesaSystem;
    
    console.log('✅ Sistema completamente inicializado');
});

console.log('📜 Script principal de Promesa de Compraventa cargado');