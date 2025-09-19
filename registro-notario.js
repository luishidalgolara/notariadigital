class NotaryRegistrationForm {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 2;
        this.form = document.getElementById('notaryForm');
        this.formData = new FormData();
        this.init();
    }

    init() {
        this.setupFileHandlers();
        this.setupValidation();
        this.setupStepper();
        this.setupDragAndDrop();
        this.setupFormSubmission();
        this.updateProgress();
        this.setupAutoSave();
        this.loadSavedData();
    }

    // Configurar manejo de archivos
    setupFileHandlers() {
        const fileInputs = [
            { input: 'cedulaFile', display: 'cedulaFileName' },
            { input: 'nombramientoFile', display: 'nombramientoFileName' },
            { input: 'certificadoVigencia', display: 'certificadoVigenciaName' }
        ];

        fileInputs.forEach(({ input, display }) => {
            const inputElement = document.getElementById(input);
            const displayElement = document.getElementById(display);
            
            if (inputElement && displayElement) {
                inputElement.addEventListener('change', (e) => {
                    this.handleFileSelection(e, displayElement);
                });
            }
        });
    }

    handleFileSelection(event, displayElement) {
        const files = event.target.files;
        const span = displayElement.querySelector('span');
        
        if (files.length > 0) {
            if (files.length === 1) {
                span.textContent = files[0].name;
            } else {
                span.textContent = `${files.length} archivos seleccionados`;
            }
            displayElement.classList.add('show');
            this.validateFile(event.target, files);
        } else {
            displayElement.classList.remove('show');
            span.textContent = '';
        }
        this.updateProgress();
        this.autoSave();
    }

    validateFile(input, files) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
        
        for (let file of files) {
            if (file.size > maxSize) {
                this.showFieldError(input.id, 'El archivo es demasiado grande (máximo 10MB)');
                input.value = '';
                return false;
            }
            
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            const inputAccept = input.getAttribute('accept').split(',');
            
            if (!inputAccept.some(type => type.trim() === extension)) {
                this.showFieldError(input.id, 'Tipo de archivo no permitido');
                input.value = '';
                return false;
            }
        }
        
        this.hideFieldError(input.id);
        return true;
    }

    // Configurar drag and drop
    setupDragAndDrop() {
        const fileLabels = document.querySelectorAll('.file-label');
        
        fileLabels.forEach(label => {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                label.addEventListener(eventName, this.preventDefaults, false);
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                label.addEventListener(eventName, () => label.classList.add('drag-over'), false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                label.addEventListener(eventName, () => label.classList.remove('drag-over'), false);
            });

            label.addEventListener('drop', (e) => {
                const input = label.previousElementSibling;
                if (input && input.type === 'file') {
                    input.files = e.dataTransfer.files;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, false);
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Configurar validaciones
    setupValidation() {
        // Validación de RUT
        const rutInputs = ['rutNotario', 'rutNotaria'];
        rutInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', (e) => {
                    this.formatRUT(e.target);
                    if (e.target.value && id === 'rutNotario') {
                        this.validateRUT(e.target);
                    } else if (e.target.value && id === 'rutNotaria') {
                        this.validateRUT(e.target);
                    }
                    this.autoSave();
                });
                input.addEventListener('blur', () => this.validateRUT(input));
            }
        });

        // Validación de email
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => this.validateEmail(emailInput));
            emailInput.addEventListener('input', () => {
                this.hideFieldError('email');
                this.autoSave();
            });
        }

        // Validación de teléfono
        const phoneInput = document.getElementById('telefono');
        if (phoneInput) {
            phoneInput.addEventListener('blur', () => this.validatePhone(phoneInput));
            phoneInput.addEventListener('input', () => {
                this.hideFieldError('telefono');
                this.autoSave();
            });
        }

        // Validación de URL
        const urlInput = document.getElementById('sitioWeb');
        if (urlInput) {
            urlInput.addEventListener('blur', () => this.validateURL(urlInput));
            urlInput.addEventListener('input', () => {
                this.hideFieldError('sitioWeb');
                this.autoSave();
            });
        }

        // Validación en tiempo real para campos requeridos
        const requiredInputs = this.form.querySelectorAll('input[required], select[required], textarea[required]');
        requiredInputs.forEach(input => {
            if (input.type !== 'file' && input.type !== 'checkbox') {
                input.addEventListener('input', () => {
                    if (input.value.trim()) {
                        input.classList.add('valid');
                        this.hideFieldError(input.id);
                    } else {
                        input.classList.remove('valid');
                    }
                    this.updateProgress();
                    this.autoSave();
                });
            }

            if (input.type === 'checkbox') {
                input.addEventListener('change', () => {
                    this.updateProgress();
                    this.autoSave();
                });
            }
        });
    }

    formatRUT(input) {
        let value = input.value.replace(/\./g, '').replace('-', '');
        if (value.length > 1) {
            const body = value.slice(0, -1);
            const dv = value.slice(-1);
            value = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
        }
        input.value = value;
    }

    validateRUT(input) {
        const rut = input.value.replace(/\./g, '').replace('-', '');
        if (!rut) return true;
        
        if (rut.length < 8) {
            this.showFieldError(input.id, 'RUT demasiado corto');
            input.classList.add('error');
            return false;
        }
        
        const body = rut.slice(0, -1);
        const dv = rut.slice(-1).toLowerCase();
        
        let sum = 0;
        let multiplier = 2;
        
        for (let i = body.length - 1; i >= 0; i--) {
            sum += parseInt(body[i]) * multiplier;
            multiplier = multiplier === 7 ? 2 : multiplier + 1;
        }
        
        const calculatedDV = 11 - (sum % 11);
        const finalDV = calculatedDV === 11 ? '0' : calculatedDV === 10 ? 'k' : calculatedDV.toString();
        
        if (dv === finalDV) {
            this.hideFieldError(input.id);
            input.classList.remove('error');
            input.classList.add('valid');
            return true;
        } else {
            this.showFieldError(input.id, 'RUT inválido');
            input.classList.add('error');
            return false;
        }
    }

    validateEmail(input) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!input.value) return true;
        
        if (emailPattern.test(input.value)) {
            this.hideFieldError(input.id);
            input.classList.remove('error');
            input.classList.add('valid');
            return true;
        } else {
            this.showFieldError(input.id, 'Email inválido');
            input.classList.add('error');
            return false;
        }
    }

    validatePhone(input) {
        const phonePattern = /^(\+56|56)?[\s]?[2-9][\s]?[0-9]{4}[\s]?[0-9]{4}$/;
        if (!input.value) return true;
        
        if (phonePattern.test(input.value.replace(/\s+/g, ''))) {
            this.hideFieldError(input.id);
            input.classList.remove('error');
            input.classList.add('valid');
            return true;
        } else {
            this.showFieldError(input.id, 'Teléfono inválido');
            input.classList.add('error');
            return false;
        }
    }

    validateURL(input) {
        if (!input.value) return true;
        
        try {
            new URL(input.value);
            this.hideFieldError(input.id);
            input.classList.remove('error');
            input.classList.add('valid');
            return true;
        } catch {
            this.showFieldError(input.id, 'URL inválida');
            input.classList.add('error');
            return false;
        }
    }

    showFieldError(fieldId, message) {
        const errorElement = document.getElementById(`error${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);
        if (errorElement) {
            errorElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
            errorElement.classList.add('show');
        }
    }

    hideFieldError(fieldId) {
        const errorElement = document.getElementById(`error${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)}`);
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    // Configurar stepper
    setupStepper() {
        this.updateStepperDisplay();
        
        // Auto-advance when sections are completed
        this.form.addEventListener('input', () => {
            setTimeout(() => this.checkSectionCompletion(), 100);
        });
        
        this.form.addEventListener('change', () => {
            setTimeout(() => this.checkSectionCompletion(), 100);
        });

        // Click en steps para navegar
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => {
            step.addEventListener('click', () => {
                const stepNum = parseInt(step.dataset.step);
                if (stepNum <= this.currentStep) {
                    this.currentStep = stepNum;
                    this.updateStepperDisplay();
                }
            });
        });
    }

    checkSectionCompletion() {
        for (let step = 1; step <= this.totalSteps; step++) {
            const section = document.querySelector(`[data-section="${step}"]`);
            const requiredFields = section.querySelectorAll('[required]');
            let allValid = true;

            requiredFields.forEach(field => {
                if (field.type === 'file') {
                    if (field.files.length === 0) allValid = false;
                } else if (field.type === 'checkbox') {
                    if (!field.checked) allValid = false;
                } else {
                    if (!field.value.trim()) allValid = false;
                }
            });

            const stepElement = document.querySelector(`[data-step="${step}"]`);
            if (allValid) {
                stepElement.classList.add('completed');
                if (step === this.currentStep && step < this.totalSteps) {
                    // Auto-advance to next step after a delay
                    setTimeout(() => {
                        this.currentStep = step + 1;
                        this.updateStepperDisplay();
                    }, 500);
                }
            } else {
                stepElement.classList.remove('completed');
            }
        }
    }

    updateStepperDisplay() {
        const steps = document.querySelectorAll('.step');
        const progress = document.getElementById('stepperProgress');
        
        steps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle('active', stepNum === this.currentStep);
        });
        
        const progressPercent = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
        if (progress) {
            progress.style.width = `${progressPercent}%`;
        }

        // Update progress indicator
        this.updateGlobalProgress();
    }

    updateProgress() {
        const allInputs = this.form.querySelectorAll('input[required], select[required], textarea[required]');
        let completed = 0;

        allInputs.forEach(input => {
            if (input.type === 'file') {
                if (input.files.length > 0) completed++;
            } else if (input.type === 'checkbox') {
                if (input.checked) completed++;
            } else if (input.value.trim()) {
                completed++;
            }
        });

        // Update section indicators
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            const sectionInputs = section.querySelectorAll('input[required], select[required], textarea[required]');
            const sectionCompleted = Array.from(sectionInputs).every(input => {
                if (input.type === 'file') return input.files.length > 0;
                if (input.type === 'checkbox') return input.checked;
                return input.value.trim();
            });

            if (sectionCompleted) {
                section.classList.add('active');
            }
        });

        this.updateGlobalProgress();
    }

    updateGlobalProgress() {
        const progressIndicator = document.getElementById('progressIndicator');
        const allInputs = this.form.querySelectorAll('input[required], select[required], textarea[required]');
        let completed = 0;

        allInputs.forEach(input => {
            if (input.type === 'file') {
                if (input.files.length > 0) completed++;
            } else if (input.type === 'checkbox') {
                if (input.checked) completed++;
            } else if (input.value.trim()) {
                completed++;
            }
        });

        const progress = (completed / allInputs.length) * 100;
        progressIndicator.style.width = `${progress}%`;
    }

    // Auto-save functionality
    setupAutoSave() {
        this.autoSaveTimeout = null;
    }

    autoSave() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        this.autoSaveTimeout = setTimeout(() => {
            this.saveFormData();
        }, 1000);
    }

    saveFormData() {
        const formData = {};
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'file') return; // Don't save files to localStorage
            if (input.type === 'checkbox') {
                formData[input.name] = input.checked;
            } else {
                formData[input.name] = input.value;
            }
        });

        try {
            localStorage.setItem('notaryFormData', JSON.stringify(formData));
            localStorage.setItem('notaryFormStep', this.currentStep.toString());
            console.log('Form data auto-saved');
        } catch (e) {
            console.warn('Could not save form data to localStorage', e);
        }
    }

    loadSavedData() {
        try {
            const savedData = localStorage.getItem('notaryFormData');
            const savedStep = localStorage.getItem('notaryFormStep');

            if (savedData) {
                const formData = JSON.parse(savedData);
                
                Object.keys(formData).forEach(key => {
                    const input = this.form.querySelector(`[name="${key}"]`);
                    if (input) {
                        if (input.type === 'checkbox') {
                            input.checked = formData[key];
                        } else {
                            input.value = formData[key];
                        }
                        
                        // Trigger validation for populated fields
                        if (input.value && input.type !== 'checkbox') {
                            input.classList.add('valid');
                        }
                    }
                });

                console.log('Form data loaded from auto-save');
            }

            if (savedStep) {
                this.currentStep = parseInt(savedStep);
                this.updateStepperDisplay();
            }
        } catch (e) {
            console.warn('Could not load saved form data', e);
        }
    }

    // Configurar envío del formulario
    setupFormSubmission() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    async handleSubmit() {
        const submitBtn = document.getElementById('submitBtn');
        const spinner = document.getElementById('loadingSpinner');
        const btnText = submitBtn.querySelector('span');

        // Validar formulario completo
        if (!this.validateForm()) {
            this.showErrorMessage('Por favor, complete todos los campos obligatorios correctamente.');
            return;
        }

        // Mostrar loading
        submitBtn.disabled = true;
        spinner.style.display = 'block';
        btnText.textContent = 'Enviando...';

        try {
            // Preparar datos del formulario
            const formData = this.prepareFormData();
            
            // Simular envío (aquí integrarías con tu backend)
            await this.simulateSubmission(formData);
            
            // Éxito
            this.showSuccessMessage();
            this.clearSavedData();
            
            // Opcional: redireccionar después de unos segundos
            setTimeout(() => {
                // window.location.href = 'confirmation.html';
                console.log('Redirecting to confirmation page...');
            }, 3000);

        } catch (error) {
            this.showErrorMessage('Ocurrió un error al enviar el formulario. Por favor, inténtelo nuevamente.');
            console.error('Error submitting form:', error);
        } finally {
            // Restaurar botón
            submitBtn.disabled = false;
            spinner.style.display = 'none';
            btnText.textContent = 'Enviar Solicitud de Registro';
        }
    }

    validateForm() {
        const requiredInputs = this.form.querySelectorAll('[required]');
        let isValid = true;
        let firstError = null;

        requiredInputs.forEach(input => {
            let valid = true;

            if (input.type === 'file') {
                valid = input.files.length > 0;
            } else if (input.type === 'checkbox') {
                valid = input.checked;
            } else if (input.type === 'email') {
                valid = input.value.trim() && this.validateEmail(input);
            } else if (input.id.includes('rut') || input.id.includes('Rut')) {
                valid = input.value.trim() && this.validateRUT(input);
            } else if (input.type === 'tel') {
                valid = input.value.trim() && this.validatePhone(input);
            } else if (input.type === 'url') {
                valid = !input.value || this.validateURL(input);
            } else {
                valid = input.value.trim() !== '';
            }

            if (!valid) {
                isValid = false;
                input.classList.add('error');
                if (!firstError) {
                    firstError = input;
                }
                
                // Mostrar error específico
                if (input.type === 'file') {
                    this.showFieldError(input.id, 'Este archivo es obligatorio');
                } else if (input.type === 'checkbox') {
                    this.showFieldError(input.id, 'Debe aceptar este campo');
                } else {
                    this.showFieldError(input.id, 'Este campo es obligatorio');
                }
            } else {
                input.classList.remove('error');
                this.hideFieldError(input.id);
            }
        });

        // Scroll al primer error
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => firstError.focus(), 500);
        }

        return isValid;
    }

    prepareFormData() {
        const formData = new FormData();
        const inputs = this.form.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            if (input.type === 'file') {
                for (let file of input.files) {
                    formData.append(input.name, file);
                }
            } else if (input.type === 'checkbox') {
                formData.append(input.name, input.checked);
            } else if (input.value.trim()) {
                formData.append(input.name, input.value.trim());
            }
        });

        // Agregar metadata
        formData.append('timestamp', new Date().toISOString());
        formData.append('userAgent', navigator.userAgent);
        formData.append('currentStep', this.currentStep);

        return formData;
    }

    async simulateSubmission(formData) {
        // Simular tiempo de procesamiento realista
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

        // Simular posibles errores (descomenta para probar)
        // if (Math.random() < 0.1) {
        //     throw new Error('Simulated server error');
        // }

        console.log('Form submitted successfully with data:', formData);
        
        // Log de archivos enviados
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`File: ${key} - ${value.name} (${(value.size / 1024 / 1024).toFixed(2)} MB)`);
            } else {
                console.log(`Field: ${key} = ${value}`);
            }
        }
        
        // En una implementación real, aquí harías:
        /*
        const response = await fetch('/api/notary-registration', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
        */
    }

    showSuccessMessage() {
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        
        errorMessage.style.display = 'none';
        successMessage.style.display = 'flex';
        
        // Scroll suave al mensaje
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Efecto de confeti (opcional)
        this.showConfetti();
    }

    showErrorMessage(message) {
        const errorMessage = document.getElementById('errorMessage');
        const errorMessageText = document.getElementById('errorMessageText');
        const successMessage = document.getElementById('successMessage');
        
        successMessage.style.display = 'none';
        errorMessageText.innerHTML = `<strong>Error en el formulario</strong><br>${message}`;
        errorMessage.style.display = 'flex';
        
        // Scroll suave al mensaje
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    showConfetti() {
        // Simple confetti effect
        const colors = ['#4dff00', '#7fff00', '#a855f7', '#10b981'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
            }, i * 50);
        }
    }

    createConfettiPiece(color) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${color};
            left: ${Math.random() * 100}vw;
            top: -10px;
            z-index: 10000;
            border-radius: 50%;
            pointer-events: none;
            animation: confetti-fall 3s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        // Remover después de la animación
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 3000);
    }

    clearSavedData() {
        try {
            localStorage.removeItem('notaryFormData');
            localStorage.removeItem('notaryFormStep');
            console.log('Auto-saved data cleared');
        } catch (e) {
            console.warn('Could not clear saved data', e);
        }
    }

    // Métodos utilitarios
    debounce(func, wait) {
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

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Agregar estilos de animación de confeti
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize form when page loads
document.addEventListener('DOMContentLoaded', () => {
    const form = new NotaryRegistrationForm();
    
    // Hacer la instancia global para debugging
    window.notaryForm = form;
    
    console.log('Notary Registration Form initialized');
});

// Handle page unload for auto-save
window.addEventListener('beforeunload', (e) => {
    // Auto-save before leaving
    if (window.notaryForm) {
        window.notaryForm.saveFormData();
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    console.log('Connection restored');
    // Aquí podrías intentar enviar datos guardados offline
});

window.addEventListener('offline', () => {
    console.log('Connection lost - form will continue to work offline');
});

// Prevenir pérdida de datos en navegadores móviles
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && window.notaryForm) {
        window.notaryForm.saveFormData();
    }
});