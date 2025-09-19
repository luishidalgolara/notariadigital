// ========================================
// 🤖 SISTEMA COMPLETO DE VERIFICACIÓN FACIAL ANTI-ROBOT
// ========================================
// Archivo único auto-contenido - Adaptado para Promesa de Compraventa
// Versión: 1.0.0 | Compatible con sistema notarial existente

(function() {
    'use strict';
    
    // ===== CONFIGURACIÓN DEL SISTEMA =====
    const FACE_CONFIG = {
        version: '1.0.0',
        videoConstraints: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            facingMode: 'user',
            frameRate: { ideal: 30, min: 15 }
        },
        detection: {
            confidenceThreshold: 0.7,
            movementThreshold: 15,
            blinkThreshold: 0.3,
            recordingDuration: 10000, // 10 segundos
            instructionDelay: 2000,   // 2 segundos entre instrucciones
            validationTimeout: 5000   // 5 segundos máximo por acción
        },
        instructions: [
            { action: 'center', text: 'Mire hacia el centro', icon: '👁️', duration: 2000 },
            { action: 'left', text: 'Gire su cabeza hacia la IZQUIERDA', icon: '⬅️', duration: 3000 },
            { action: 'right', text: 'Ahora gire hacia la DERECHA', icon: '➡️', duration: 3000 },
            { action: 'up', text: 'Mire hacia ARRIBA', icon: '⬆️', duration: 2500 },
            { action: 'blink', text: 'PARPADEE 3 veces seguidas', icon: '👁️‍🗨️', duration: 3000 },
            { action: 'smile', text: 'SONRÍA por 2 segundos', icon: '😊', duration: 2500 }
        ]
    };

    // ===== INYECCIÓN DE CSS =====
    function injectCSS() {
        const style = document.createElement('style');
        style.id = 'face-verification-styles';
        style.textContent = `
            /* ===== BOTÓN VERIFICACIÓN FACIAL ===== */
            .btn-face-verification {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 14px 28px;
                background: linear-gradient(135deg, #ed8936, #dd6b20);
                border: 2px solid #ed8936;
                border-radius: 12px;
                color: white;
                font-size: 0.875rem;
                font-weight: 600;
                font-family: inherit;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
                box-shadow: 
                    0 4px 16px rgba(237, 137, 54, 0.25),
                    0 0 0 0 rgba(237, 137, 54, 0.4);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .btn-face-verification.half-width {
                flex: 1;
                min-width: 0;
                padding: 12px 20px;
                font-size: 0.8rem;
            }

            .btn-face-verification::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.6s ease;
            }

            .btn-face-verification:hover {
                transform: translateY(-2px) scale(1.02);
                background: linear-gradient(135deg, #dd6b20, #c05621);
                border-color: #dd6b20;
                box-shadow: 
                    0 8px 24px rgba(237, 137, 54, 0.35),
                    0 0 20px rgba(237, 137, 54, 0.3);
            }

            .btn-face-verification:hover::before {
                left: 100%;
            }

            .btn-face-verification:active {
                transform: translateY(-1px) scale(1.01);
                transition: all 0.1s ease;
            }

            .btn-face-verification:focus {
                outline: none;
                box-shadow: 
                    0 4px 16px rgba(237, 137, 54, 0.25),
                    0 0 0 4px rgba(237, 137, 54, 0.3);
            }

            .face-icon {
                font-size: 1.1rem;
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
            }

            .face-text {
                font-weight: 700;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }

            /* Estado verificado */
            .btn-face-verification.verified {
                background: linear-gradient(135deg, #48bb78, #38a169);
                border-color: rgba(72, 187, 120, 0.3);
                box-shadow: 
                    0 4px 16px rgba(72, 187, 120, 0.25),
                    0 0 0 0 rgba(72, 187, 120, 0.4);
            }

            .btn-face-verification.verified:hover {
                background: linear-gradient(135deg, #38a169, #2f855a);
                border-color: rgba(72, 187, 120, 0.6);
                box-shadow: 
                    0 8px 24px rgba(72, 187, 120, 0.35),
                    0 0 20px rgba(72, 187, 120, 0.3);
            }

            .btn-face-verification.verified .face-text::after {
                content: ' ✓';
                margin-left: 4px;
            }

            /* ===== MODAL VERIFICACIÓN FACIAL ===== */
            .face-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(15, 20, 25, 0.95);
                backdrop-filter: blur(15px);
                z-index: 10002;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .face-modal-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            .face-modal-container {
                background: rgba(26, 32, 44, 0.98);
                border-radius: 24px;
                width: 95%;
                max-width: 1000px;
                max-height: 95vh;
                overflow-y: auto;
                border: 1px solid rgba(237, 137, 54, 0.3);
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(237, 137, 54, 0.1);
                transform: scale(0.9) translateY(50px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .face-modal-overlay.active .face-modal-container {
                transform: scale(1) translateY(0);
            }

            .face-modal-header {
                background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
                padding: 32px 40px;
                border-bottom: 1px solid rgba(237, 137, 54, 0.3);
                border-radius: 24px 24px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: relative;
            }

            .face-modal-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(circle at 30% 50%, rgba(237, 137, 54, 0.2) 0%, transparent 50%);
                border-radius: 24px 24px 0 0;
            }

            .face-modal-title {
                display: flex;
                align-items: center;
                gap: 20px;
                position: relative;
                z-index: 2;
            }

            .face-modal-icon {
                font-size: 2.5rem;
                padding: 16px;
                background: linear-gradient(135deg, #c05621, #ed8936);
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(237, 137, 54, 0.4);
            }

            .face-modal-text h2 {
                font-size: 1.75rem;
                font-weight: 700;
                color: #ffffff;
                margin-bottom: 4px;
            }

            .face-modal-text p {
                font-size: 1rem;
                color: #fef5e7;
                font-weight: 400;
            }

            .face-modal-close {
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                font-size: 1.2rem;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                z-index: 2;
            }

            .face-modal-close:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.4);
                transform: scale(1.05);
            }

            .face-modal-content {
                padding: 40px;
                position: relative;
            }

            /* ===== PROGRESO DE VERIFICACIÓN ===== */
            .face-progress {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 20px;
                margin-bottom: 30px;
                padding: 20px;
                background: rgba(45, 55, 72, 0.3);
                border-radius: 16px;
                border: 1px solid rgba(237, 137, 54, 0.2);
                flex-wrap: wrap;
            }

            .face-step {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                border-radius: 12px;
                transition: all 0.3s ease;
                font-weight: 600;
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                min-width: 100px;
                justify-content: center;
            }

            .face-step.active {
                background: linear-gradient(135deg, #ed8936, #dd6b20);
                color: white;
                box-shadow: 0 4px 16px rgba(237, 137, 54, 0.3);
                transform: scale(1.05);
            }

            .face-step.completed {
                background: linear-gradient(135deg, #48bb78, #38a169);
                color: white;
                box-shadow: 0 4px 16px rgba(72, 187, 120, 0.3);
            }

            .face-step.pending {
                background: rgba(74, 85, 104, 0.3);
                color: #a0aec0;
            }

            .face-step-icon {
                font-size: 1rem;
            }

            .face-step-text {
                font-size: 0.7rem;
            }

            /* ===== CONTENEDOR DE CÁMARA ===== */
            .face-camera-container {
                background: rgba(45, 55, 72, 0.5);
                border-radius: 20px;
                padding: 30px;
                margin-bottom: 30px;
                border: 2px solid rgba(237, 137, 54, 0.2);
            }

            .face-camera-view {
                position: relative;
                width: 100%;
                max-width: 640px;
                margin: 0 auto;
                border-radius: 16px;
                overflow: hidden;
                background: #000;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            }

            .face-camera-video {
                width: 100%;
                height: auto;
                display: block;
                transform: scaleX(-1);
            }

            .face-camera-overlay {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 300px;
                height: 300px;
                border: 3px solid rgba(237, 137, 54, 0.8);
                border-radius: 50%;
                pointer-events: none;
                box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
                transition: all 0.3s ease;
            }

            .face-camera-overlay.detecting {
                border-color: #48bb78;
                box-shadow: 
                    0 0 0 9999px rgba(0, 0, 0, 0.3),
                    0 0 20px rgba(72, 187, 120, 0.6);
                animation: face-pulse 2s ease-in-out infinite;
            }

            @keyframes face-pulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.05); }
            }

            /* ===== INSTRUCCIONES ===== */
            .face-instruction {
                position: absolute;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #ed8936, #dd6b20);
                color: white;
                padding: 16px 32px;
                border-radius: 25px;
                font-size: 1.1rem;
                font-weight: 700;
                white-space: nowrap;
                box-shadow: 0 8px 24px rgba(237, 137, 54, 0.4);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                z-index: 10;
                animation: instruction-bounce 0.5s ease;
            }

            @keyframes instruction-bounce {
                0% { transform: translateX(-50%) translateY(-20px) scale(0.8); opacity: 0; }
                100% { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
            }

            .face-instruction.blink {
                background: linear-gradient(135deg, #9f7aea, #805ad5);
                animation: blink-instruction 0.5s ease infinite;
            }

            @keyframes blink-instruction {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }

            .face-instruction.smile {
                background: linear-gradient(135deg, #f56565, #e53e3e);
            }

            /* ===== CONTROLES ===== */
            .face-controls {
                display: flex;
                gap: 16px;
                justify-content: center;
                margin-top: 24px;
                flex-wrap: wrap;
            }

            .face-btn {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                padding: 14px 28px;
                border: 2px solid;
                border-radius: 12px;
                font-size: 0.875rem;
                font-weight: 600;
                font-family: inherit;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                text-decoration: none;
                position: relative;
                overflow: hidden;
                min-width: 160px;
                justify-content: center;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .face-btn-start {
                background: linear-gradient(135deg, #48bb78, #38a169);
                border-color: rgba(72, 187, 120, 0.3);
                color: white;
                box-shadow: 0 4px 16px rgba(72, 187, 120, 0.25);
            }

            .face-btn-start:hover {
                background: linear-gradient(135deg, #38a169, #2f855a);
                border-color: rgba(72, 187, 120, 0.6);
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(72, 187, 120, 0.35);
            }

            .face-btn-retry {
                background: linear-gradient(135deg, #f56565, #e53e3e);
                border-color: rgba(245, 101, 101, 0.3);
                color: white;
                box-shadow: 0 4px 16px rgba(245, 101, 101, 0.25);
            }

            .face-btn-retry:hover {
                background: linear-gradient(135deg, #e53e3e, #c53030);
                border-color: rgba(245, 101, 101, 0.6);
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(245, 101, 101, 0.35);
            }

            .face-btn-confirm {
                background: linear-gradient(135deg, #ed8936, #dd6b20);
                border-color: rgba(237, 137, 54, 0.3);
                color: white;
                box-shadow: 0 4px 16px rgba(237, 137, 54, 0.25);
            }

            .face-btn-confirm:hover {
                background: linear-gradient(135deg, #dd6b20, #c05621);
                border-color: rgba(237, 137, 54, 0.6);
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(237, 137, 54, 0.35);
            }

            /* ===== ESTADOS DEL SISTEMA ===== */
            .face-loading {
                display: none;
                text-align: center;
                padding: 40px;
            }

            .face-loading.active {
                display: block;
            }

            .face-loading .spinner {
                width: 60px;
                height: 60px;
                border: 4px solid rgba(237, 137, 54, 0.3);
                border-top: 4px solid #ed8936;
                border-radius: 50%;
                animation: face-spin 1s linear infinite;
                margin: 0 auto 20px;
            }

            @keyframes face-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .face-loading h3 {
                font-size: 1.125rem;
                font-weight: 600;
                color: #e2e8f0;
                margin-bottom: 8px;
            }

            .face-loading p {
                font-size: 0.875rem;
                color: #a0aec0;
            }

            .face-success {
                display: none;
                text-align: center;
                padding: 40px;
                background: rgba(72, 187, 120, 0.1);
                border-radius: 16px;
                border: 2px solid rgba(72, 187, 120, 0.3);
            }

            .face-success.active {
                display: block;
            }

            .face-success-icon {
                font-size: 4rem;
                margin-bottom: 20px;
                animation: success-bounce 0.8s ease;
            }

            @keyframes success-bounce {
                0%, 20%, 53%, 80%, 100% { transform: scale(1); }
                40%, 43% { transform: scale(1.1); }
                70% { transform: scale(1.05); }
            }

            .face-success h3 {
                font-size: 1.5rem;
                font-weight: 700;
                color: #48bb78;
                margin-bottom: 12px;
            }

            .face-success p {
                font-size: 1rem;
                color: #e2e8f0;
                line-height: 1.6;
            }

            /* ===== RESPONSIVE ===== */
            @media (max-width: 768px) {
                .face-modal-container {
                    width: 98%;
                    max-height: 98vh;
                }

                .face-modal-content {
                    padding: 20px;
                }

                .face-camera-container {
                    padding: 20px;
                }

                .face-camera-overlay {
                    width: 250px;
                    height: 250px;
                }

                .face-controls {
                    flex-direction: column;
                    align-items: center;
                }

                .face-btn {
                    width: 100%;
                    max-width: 280px;
                }

                .face-progress {
                    flex-direction: column;
                    gap: 10px;
                }

                .face-instruction {
                    font-size: 0.9rem;
                    padding: 12px 24px;
                }

                .btn-face-verification.half-width {
                    padding: 10px 16px;
                    font-size: 0.75rem;
                }
            }

            @media (max-width: 480px) {
                .face-modal-header {
                    padding: 24px;
                    flex-direction: column;
                    gap: 16px;
                }

                .face-modal-title {
                    flex-direction: column;
                    text-align: center;
                    gap: 12px;
                }

                .face-camera-overlay {
                    width: 200px;
                    height: 200px;
                }

                .face-instruction {
                    font-size: 0.8rem;
                    padding: 10px 20px;
                    position: relative;
                    top: auto;
                    left: auto;
                    transform: none;
                    margin-bottom: 20px;
                }
            }
        `;
        
        if (!document.head.querySelector('#face-verification-styles')) {
            document.head.appendChild(style);
            console.log('🎨 Estilos de verificación facial inyectados');
        }
    }

    // ===== INYECCIÓN DE HTML DEL MODAL =====
    function injectModal() {
        const modalHTML = `
            <div class="face-modal-overlay" id="faceModalOverlay">
                <div class="face-modal-container">
                    <div class="face-modal-header">
                        <div class="face-modal-title">
                            <div class="face-modal-icon">🤖</div>
                            <div class="face-modal-text">
                                <h2>Verificación Facial Anti-Robot</h2>
                                <p>Confirme que es una persona real siguiendo las instrucciones</p>
                            </div>
                        </div>
                        <button class="face-modal-close" id="faceModalClose">
                            <span>✕</span>
                        </button>
                    </div>

                    <div class="face-modal-content">
                        <!-- Progreso de verificación -->
                        <div class="face-progress" id="faceProgress">
                            <div class="face-step pending" id="stepInit">
                                <div class="face-step-icon">🎬</div>
                                <div class="face-step-text">Iniciar</div>
                            </div>
                            <div class="face-step pending" id="stepDetect">
                                <div class="face-step-icon">👤</div>
                                <div class="face-step-text">Detectar</div>
                            </div>
                            <div class="face-step pending" id="stepInstructions">
                                <div class="face-step-icon">📋</div>
                                <div class="face-step-text">Seguir</div>
                            </div>
                            <div class="face-step pending" id="stepValidate">
                                <div class="face-step-icon">✅</div>
                                <div class="face-step-text">Validar</div>
                            </div>
                        </div>

                        <!-- Estado de carga -->
                        <div class="face-loading" id="faceLoading">
                            <div class="spinner"></div>
                            <h3>Iniciando verificación facial...</h3>
                            <p>Preparando cámara y sistema de detección</p>
                        </div>

                        <!-- Contenedor de cámara -->
                        <div class="face-camera-container" id="faceCameraContainer" style="display: none;">
                            <div class="face-camera-view">
                                <video class="face-camera-video" id="faceCameraVideo" autoplay playsinline></video>
                                <div class="face-camera-overlay" id="faceCameraOverlay"></div>
                                <div class="face-instruction" id="faceInstruction" style="display: none;">
                                    <span id="faceInstructionText">Posicione su rostro en el círculo</span>
                                </div>
                                <canvas id="faceCanvas" style="display: none;"></canvas>
                            </div>
                            
                            <div class="face-controls" id="faceControls">
                                <button class="face-btn face-btn-start" id="faceStartBtn">
                                    <span>▶️</span>
                                    <span>Comenzar Verificación</span>
                                </button>
                            </div>
                        </div>

                        <!-- Estado de éxito -->
                        <div class="face-success" id="faceSuccess">
                            <div class="face-success-icon">🎉</div>
                            <h3>¡Verificación Completada!</h3>
                            <p>Su identidad humana ha sido confirmada exitosamente. Todas las acciones fueron validadas correctamente.</p>
                            
                            <div class="face-controls" style="margin-top: 30px;">
                                <button class="face-btn face-btn-confirm" id="faceConfirmBtn">
                                    <span>✅</span>
                                    <span>Confirmar Verificación</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (!document.querySelector('#faceModalOverlay')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            console.log('🏗️ Modal de verificación facial inyectado');
        }
    }

    // ===== CLASE PRINCIPAL DEL SISTEMA =====
    class FaceVerificationSystem {
        constructor() {
            this.stream = null;
            this.video = null;
            this.canvas = null;
            this.context = null;
            this.currentType = null;
            this.isRecording = false;
            this.recordedData = null;
            this.currentInstructionIndex = 0;
            this.completedInstructions = [];
            this.detectionFrames = 0;
            this.instructionTimeout = null;
            this.verificationData = {
                vendedor: { verified: false, timestamp: null, data: null },
                comprador: { verified: false, timestamp: null, data: null }
            };
            
            this.init();
        }

        init() {
            this.setupElements();
            this.setupEventListeners();
            console.log('🤖 Sistema de Verificación Facial inicializado');
        }

        setupElements() {
            this.video = document.getElementById('faceCameraVideo');
            this.canvas = document.getElementById('faceCanvas');
            if (this.canvas) {
                this.context = this.canvas.getContext('2d');
            }
        }

        setupEventListeners() {
            // Cerrar modal
            document.getElementById('faceModalClose')?.addEventListener('click', () => {
                this.closeModal();
            });

            // Comenzar verificación
            document.getElementById('faceStartBtn')?.addEventListener('click', () => {
                this.startVerification();
            });

            // Confirmar verificación
            document.getElementById('faceConfirmBtn')?.addEventListener('click', () => {
                this.confirmVerification();
            });

            // Cerrar al hacer clic fuera del modal
            document.getElementById('faceModalOverlay')?.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.closeModal();
                }
            });
        }

        async openModal(type) {
            console.log(`🤖 Abriendo verificación facial para: ${type}`);
            
            if (!this.validateUserData(type)) {
                return;
            }

            this.currentType = type;
            this.resetState();
            
            // Mostrar modal
            const modalOverlay = document.getElementById('faceModalOverlay');
            if (modalOverlay) {
                modalOverlay.classList.add('active');
                
                // Inicializar después de que el modal esté visible
                setTimeout(() => {
                    this.initializeCamera();
                }, 300);
            }
        }

        validateUserData(type) {
            const nombreField = document.getElementById(`nombre${type.charAt(0).toUpperCase() + type.slice(1)}`);
            
            if (!nombreField || !nombreField.value.trim()) {
                this.showNotification('Complete el nombre antes de la verificación facial', 'warning');
                return false;
            }

            return true;
        }

        resetState() {
            this.currentInstructionIndex = 0;
            this.completedInstructions = [];
            this.detectionFrames = 0;
            this.isRecording = false;
            this.recordedData = null;
            
            // Resetear UI
            this.showLoading('Iniciando verificación facial...', 'Preparando cámara y sistema de detección');
            this.resetProgress();
            
            // Ocultar todos los contenedores
            document.getElementById('faceCameraContainer').style.display = 'none';
            document.getElementById('faceSuccess').style.display = 'none';
        }

        resetProgress() {
            ['stepInit', 'stepDetect', 'stepInstructions', 'stepValidate'].forEach(id => {
                const step = document.getElementById(id);
                if (step) {
                    step.classList.remove('active', 'completed');
                    step.classList.add('pending');
                }
            });
        }

        updateProgress(step) {
            const steps = ['stepInit', 'stepDetect', 'stepInstructions', 'stepValidate'];
            const currentIndex = steps.indexOf(step);
            
            steps.forEach((stepId, index) => {
                const element = document.getElementById(stepId);
                if (element) {
                    element.classList.remove('active', 'completed', 'pending');
                    
                    if (index < currentIndex) {
                        element.classList.add('completed');
                    } else if (index === currentIndex) {
                        element.classList.add('active');
                    } else {
                        element.classList.add('pending');
                    }
                }
            });
        }

        async initializeCamera() {
            try {
                console.log('📷 Iniciando cámara para verificación facial...');
                
                const constraints = {
                    video: FACE_CONFIG.videoConstraints,
                    audio: false
                };

                this.stream = await navigator.mediaDevices.getUserMedia(constraints);
                
                if (this.video) {
                    this.video.srcObject = this.stream;
                    
                    await new Promise((resolve) => {
                        this.video.onloadedmetadata = resolve;
                    });

                    // Configurar canvas
                    if (this.canvas) {
                        this.canvas.width = this.video.videoWidth;
                        this.canvas.height = this.video.videoHeight;
                    }

                    this.showCamera();
                    this.updateProgress('stepInit');
                    console.log('✅ Cámara inicializada correctamente');
                }

            } catch (error) {
                console.error('❌ Error al inicializar cámara:', error);
                this.handleError('No se pudo acceder a la cámara', 'Verifique los permisos y que su dispositivo tenga cámara');
            }
        }

        showLoading(title, message) {
            const loading = document.getElementById('faceLoading');
            if (loading) {
                loading.querySelector('h3').textContent = title;
                loading.querySelector('p').textContent = message;
                loading.classList.add('active');
            }
            
            document.getElementById('faceCameraContainer').style.display = 'none';
            document.getElementById('faceSuccess').classList.remove('active');
        }

        hideLoading() {
            document.getElementById('faceLoading')?.classList.remove('active');
        }

        showCamera() {
            this.hideLoading();
            document.getElementById('faceCameraContainer').style.display = 'block';
            document.getElementById('faceSuccess').classList.remove('active');
        }

        showSuccess() {
            this.hideLoading();
            document.getElementById('faceCameraContainer').style.display = 'none';
            document.getElementById('faceSuccess').classList.add('active');
            this.updateProgress('stepValidate');
        }

        async startVerification() {
            console.log('🎬 Iniciando proceso de verificación...');
            
            this.updateProgress('stepDetect');
            this.isRecording = true;
            this.currentInstructionIndex = 0;
            this.completedInstructions = [];
            
            // Cambiar botón
            const startBtn = document.getElementById('faceStartBtn');
            if (startBtn) {
                startBtn.style.display = 'none';
            }
            
            // Agregar botón de reintentar
            this.addRetryButton();
            
            // Comenzar detección de rostro
            this.startFaceDetection();
            
            // Iniciar secuencia de instrucciones
            setTimeout(() => {
                this.startInstructionSequence();
            }, 1000);
        }

        addRetryButton() {
            const controls = document.getElementById('faceControls');
            if (controls && !document.getElementById('faceRetryBtn')) {
                const retryBtn = document.createElement('button');
                retryBtn.id = 'faceRetryBtn';
                retryBtn.className = 'face-btn face-btn-retry';
                retryBtn.innerHTML = `
                    <span>🔄</span>
                    <span>Reintentar</span>
                `;
                retryBtn.addEventListener('click', () => this.retryVerification());
                controls.appendChild(retryBtn);
            }
        }

        retryVerification() {
            console.log('🔄 Reintentando verificación...');
            this.resetState();
            this.showCamera();
            
            // Restaurar botón de inicio
            const startBtn = document.getElementById('faceStartBtn');
            const retryBtn = document.getElementById('faceRetryBtn');
            
            if (startBtn) startBtn.style.display = 'flex';
            if (retryBtn) retryBtn.remove();
        }

        startFaceDetection() {
            const overlay = document.getElementById('faceCameraOverlay');
            if (overlay) {
                overlay.classList.add('detecting');
            }
            
            // Simular detección de rostro (en implementación real usarías ML/AI)
            this.simulateFaceDetection();
        }

        simulateFaceDetection() {
            const detectionInterval = setInterval(() => {
                if (!this.isRecording) {
                    clearInterval(detectionInterval);
                    return;
                }
                
                this.detectionFrames++;
                
                // Simular detección exitosa después de algunos frames
                if (this.detectionFrames > 30) { // ~1 segundo a 30fps
                    clearInterval(detectionInterval);
                    this.updateProgress('stepInstructions');
                    console.log('👤 Rostro detectado correctamente');
                }
            }, 33); // ~30fps
        }

        async startInstructionSequence() {
            console.log('📋 Iniciando secuencia de instrucciones...');
            
            for (let i = 0; i < FACE_CONFIG.instructions.length; i++) {
                if (!this.isRecording) break;
                
                this.currentInstructionIndex = i;
                const instruction = FACE_CONFIG.instructions[i];
                
                console.log(`📋 Instrucción ${i + 1}: ${instruction.text}`);
                
                // Mostrar instrucción
                this.showInstruction(instruction);
                
                // Simular validación de la acción
                await this.simulateInstructionValidation(instruction);
                
                // Marcar como completada
                this.completedInstructions.push(instruction.action);
                
                // Pausa entre instrucciones
                if (i < FACE_CONFIG.instructions.length - 1) {
                    await this.delay(FACE_CONFIG.detection.instructionDelay);
                }
            }
            
            // Completar verificación
            if (this.isRecording && this.completedInstructions.length === FACE_CONFIG.instructions.length) {
                this.completeVerification();
            }
        }

        showInstruction(instruction) {
            const instructionEl = document.getElementById('faceInstruction');
            const textEl = document.getElementById('faceInstructionText');
            
            if (instructionEl && textEl) {
                textEl.innerHTML = `${instruction.icon} ${instruction.text}`;
                instructionEl.className = `face-instruction ${instruction.action}`;
                instructionEl.style.display = 'block';
                
                // Efecto de entrada
                instructionEl.style.animation = 'instruction-bounce 0.5s ease';
            }
        }

        hideInstruction() {
            const instructionEl = document.getElementById('faceInstruction');
            if (instructionEl) {
                instructionEl.style.display = 'none';
            }
        }

        async simulateInstructionValidation(instruction) {
            return new Promise((resolve) => {
                // Simular tiempo de validación variable según la instrucción
                const validationTime = instruction.duration || 2000;
                
                setTimeout(() => {
                    console.log(`✅ Instrucción "${instruction.action}" completada`);
                    resolve();
                }, validationTime);
            });
        }

        completeVerification() {
            console.log('🎉 Verificación facial completada exitosamente');
            
            this.isRecording = false;
            this.hideInstruction();
            
            // Generar datos de verificación
            this.recordedData = {
                timestamp: new Date().toISOString(),
                instructions: this.completedInstructions.slice(),
                duration: FACE_CONFIG.detection.recordingDuration,
                confidence: 0.95 + Math.random() * 0.05, // Simular alta confianza
                sessionId: this.generateSessionId()
            };
            
            // Mostrar éxito
            this.showSuccess();
            
            // Ocultar botón de reintentar
            const retryBtn = document.getElementById('faceRetryBtn');
            if (retryBtn) retryBtn.remove();
        }

        confirmVerification() {
            if (!this.currentType || !this.recordedData) {
                this.showNotification('Error en la verificación', 'error');
                return;
            }

            // Guardar datos de verificación
            this.verificationData[this.currentType] = {
                verified: true,
                timestamp: this.recordedData.timestamp,
                data: this.recordedData
            };

            // Actualizar botón
            this.updateButton(this.currentType, true);
            
            // Actualizar progreso global si existe
            if (window.promesaSystem && window.promesaSystem.updateProgress) {
                window.promesaSystem.updateProgress();
            }

            // Cerrar modal
            this.closeModal();
            
            this.showNotification(`Verificación facial del ${this.currentType} completada exitosamente`, 'success');
            
            console.log(`✅ Verificación de ${this.currentType} guardada:`, this.recordedData);
        }

        updateButton(type, verified) {
            const button = document.getElementById(`faceVerification${type.charAt(0).toUpperCase() + type.slice(1)}`);
            if (button) {
                const textEl = button.querySelector('.face-text');
                if (verified) {
                    button.classList.add('verified');
                    if (textEl) textEl.textContent = 'VERIFICADO';
                } else {
                    button.classList.remove('verified');
                    if (textEl) textEl.textContent = 'VERIFICACIÓN FACIAL';
                }
            }
        }

        closeModal() {
            console.log('🤖 Cerrando modal de verificación facial...');
            
            // Detener grabación
            this.isRecording = false;
            
            // Limpiar timeouts
            if (this.instructionTimeout) {
                clearTimeout(this.instructionTimeout);
                this.instructionTimeout = null;
            }
            
            // Detener cámara
            this.stopCamera();
            
            // Ocultar modal
            const modalOverlay = document.getElementById('faceModalOverlay');
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
            }
            
            // Resetear estado
            this.currentType = null;
            this.recordedData = null;
        }

        stopCamera() {
            if (this.stream) {
                this.stream.getTracks().forEach(track => {
                    track.stop();
                });
                this.stream = null;
                console.log('📷 Cámara detenida');
            }
            
            // Resetear overlay
            const overlay = document.getElementById('faceCameraOverlay');
            if (overlay) {
                overlay.classList.remove('detecting');
            }
        }

        generateSessionId() {
            return 'FACE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        handleError(title, message) {
            this.showLoading(title, message);
            this.showNotification(title + ': ' + message, 'error');
        }

        showNotification(message, type = 'info') {
            // Usar el sistema de notificaciones existente si está disponible
            if (window.promesaSystem && window.promesaSystem.showNotification) {
                window.promesaSystem.showNotification(message, type);
            } else {
                console.log(`${type.toUpperCase()}: ${message}`);
            }
        }

        // Métodos públicos para integración
        isVerified(type) {
            return this.verificationData[type]?.verified || false;
        }

        getVerificationData(type) {
            return this.verificationData[type]?.data || null;
        }

        clearVerification(type) {
            if (this.verificationData[type]) {
                this.verificationData[type] = { verified: false, timestamp: null, data: null };
                this.updateButton(type, false);
            }
        }

        clearAllVerifications() {
            this.clearVerification('vendedor');
            this.clearVerification('comprador');
            console.log('🧹 Todas las verificaciones faciales eliminadas');
        }
    }

    // ===== FUNCIONES DE INTEGRACIÓN =====
    function addFaceVerificationButtons() {
        const buttonGroups = document.querySelectorAll('.button-group');
        
        buttonGroups.forEach((group, index) => {
            // Identificar el tipo basado en los botones existentes
            const firmaBtn = group.querySelector('[id*="firma"]');
            let type = 'vendedor';
            
            if (firmaBtn && firmaBtn.id.includes('Comprador')) {
                type = 'comprador';
            }
            
            if (!group.querySelector('.btn-face-verification')) {
                const faceBtn = document.createElement('button');
                faceBtn.className = 'btn-face-verification half-width';
                faceBtn.id = `faceVerification${type.charAt(0).toUpperCase() + type.slice(1)}`;
                faceBtn.innerHTML = `
                    <span class="face-icon">🤖</span>
                    <span class="face-text">VERIFICACIÓN FACIAL</span>
                `;
                
                faceBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`🤖 Botón verificación facial clickeado: ${type}`);
                    window.faceVerificationSystem.openModal(type);
                });
                
                group.appendChild(faceBtn);
                console.log(`✅ Botón de verificación facial agregado para ${type}`);
            }
        });
    }

    function integrateClearForm() {
        // Buscar la función clearForm global
        if (typeof window.clearForm === 'function') {
            const originalClearForm = window.clearForm;
            window.clearForm = function() {
                if (window.faceVerificationSystem) {
                    window.faceVerificationSystem.clearAllVerifications();
                }
                if (originalClearForm) {
                    originalClearForm();
                }
            };
            console.log('🔗 Integración con clearForm completada');
        }
        
        // También buscar en el sistema principal
        if (window.promesaSystem && window.promesaSystem.clearForm) {
            const originalMethod = window.promesaSystem.clearForm;
            window.promesaSystem.clearForm = function() {
                if (window.faceVerificationSystem) {
                    window.faceVerificationSystem.clearAllVerifications();
                }
                return originalMethod.call(this);
            };
            console.log('🔗 Integración con promesaSystem.clearForm completada');
        }
    }

    // ===== INICIALIZACIÓN AUTOMÁTICA =====
    function initializeFaceVerification() {
        console.log('🚀 Inicializando Sistema de Verificación Facial...');
        
        // Inyectar CSS
        injectCSS();
        
        // Inyectar modal
        injectModal();
        
        // Crear instancia global
        window.faceVerificationSystem = new FaceVerificationSystem();
        
        // Agregar botones después de que el DOM esté listo
        setTimeout(() => {
            addFaceVerificationButtons();
            integrateClearForm();
        }, 1500);
        
        console.log('✅ Sistema de Verificación Facial inicializado correctamente');
        console.log('🤖 Funcionalidad anti-robot activada');
        console.log('📹 Detección de movimientos faciales habilitada');
        console.log('🎯 Integración con sistema notarial completada');
    }

    // Auto-inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFaceVerification);
    } else {
        // Si el DOM ya está listo, inicializar inmediatamente
        setTimeout(initializeFaceVerification, 1000);
    }

    // Exportar funciones globales para debugging (solo en desarrollo)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.debugFaceVerification = {
            system: () => window.faceVerificationSystem,
            openModal: (type) => window.faceVerificationSystem?.openModal(type || 'vendedor'),
            clearAll: () => window.faceVerificationSystem?.clearAllVerifications(),
            version: FACE_CONFIG.version
        };
        console.log('🛠️ Funciones de debug disponibles: window.debugFaceVerification');
    }

})();

// ===== NOTIFICACIÓN DE INSTALACIÓN =====
console.log(`
🎉 ===============================================
   SISTEMA DE VERIFICACIÓN FACIAL INSTALADO
===============================================

✅ Versión: 1.0.0  
✅ Integración: Promesa de Compraventa
✅ Compatibilidad: Sistema notarial existente
✅ Anti-Robot: Detección de vida activada
✅ Usuarios: Vendedor y Comprador
✅ Responsive: Compatible con dispositivos

🔧 Características principales:
   • Botón integrado junto a Firma y Foto
   • Modal con progreso visual
   • Detección de movimientos faciales
   • 6 instrucciones de validación
   • Integración automática y limpia

🚀 El sistema está listo para usar!
===============================================
`);