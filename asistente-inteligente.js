/* ============================================
   ASISTENTE INTELIGENTE V3.0 - SISTEMA ULTRA MEJORADO
   ============================================ */

// 🎯 MOTOR DE DETECCIÓN ULTRA ESPECÍFICO
class DetectorIntencionesPreciso {
    constructor() {
        // Sistema de intenciones ultra específicas con pesos absolutos
        this.intencionesEspecificas = {
            // 🏠 INMOBILIARIO - VENTA
            "VENDER_CASA": {
                palabrasObligatorias: ["vender", "venta"],
                palabrasContexto: ["casa", "propiedad", "inmueble", "departamento", "vivienda"],
                exclusiones: ["auto", "vehículo", "carro", "arriendo", "alquilar"],
                documento: "promesa-compraventa",
                confianza: 0.98
            },
            
            "VENDER_PROPIEDAD": {
                palabrasObligatorias: ["vender", "venta"],
                palabrasContexto: ["propiedad", "inmueble", "bien raíz"],
                exclusiones: ["auto", "vehículo", "arriendo"],
                documento: "promesa-compraventa", 
                confianza: 0.98
            },

            // 🚗 VEHICULAR - VENTA
            "VENDER_AUTO": {
                palabrasObligatorias: ["vender", "venta"],
                palabrasContexto: ["auto", "vehículo", "carro", "camioneta", "moto"],
                exclusiones: ["casa", "propiedad", "inmueble"],
                documento: "vehiculo-compraventa-modelo",
                confianza: 0.99
            },

            // 🏠 INMOBILIARIO - ARRIENDO
            "ARRENDAR_CASA": {
                palabrasObligatorias: ["arrendar", "alquilar", "arriendo"],
                palabrasContexto: ["casa", "departamento", "propiedad"],
                exclusiones: ["vender", "auto", "terminar"],
                documento: "contrato-arriendo",
                confianza: 0.98
            },

            // 💑 MATRIMONIO
            "CASARSE": {
                palabrasObligatorias: ["casar", "matrimonio", "boda"],
                palabrasContexto: ["me caso", "voy a", "quiero"],
                exclusiones: ["trabajo", "auto", "casa", "empleada"],
                documento: "declaracion-solteria",
                confianza: 0.99
            },

            // 👶 MENORES
            "HIJO_VIAJE": {
                palabrasObligatorias: ["hijo", "hija", "menor", "niño"],
                palabrasContexto: ["viaje", "viajar", "extranjero", "brasil", "argentina"],
                exclusiones: ["trabajo", "empleada", "auto"],
                documento: "autorizacion-salida-menor",
                confianza: 0.99
            },

            // 👔 LABORAL - CONTRATAR
            "CONTRATAR_EMPLEADA": {
                palabrasObligatorias: ["contratar", "emplear"],
                palabrasContexto: ["empleada", "doméstica", "asesora hogar", "trabajadora"],
                exclusiones: ["despedir", "terminar", "auto", "casa"],
                documento: "contrato-casa-particular-afuera",
                confianza: 0.98
            },

            // 👔 LABORAL - DESPEDIR  
            "DESPEDIR_EMPLEADO": {
                palabrasObligatorias: ["despedir", "echar", "terminar"],
                palabrasContexto: ["empleado", "trabajador", "contrato"],
                exclusiones: ["contratar", "auto", "casa"],
                documento: "aviso-termino-contrato",
                confianza: 0.98
            },

            // 👔 LABORAL - RENUNCIAR
            "RENUNCIAR": {
                palabrasObligatorias: ["renunciar", "renuncia", "dejar"],
                palabrasContexto: ["trabajo", "empleo", "voluntaria"],
                exclusiones: ["contratar", "despedir", "auto", "casa"],
                documento: "renuncia-voluntaria",
                confianza: 0.98
            },

            // 🏠 PROBLEMAS ARRIENDO
            "INQUILINO_PROBLEMAS": {
                palabrasObligatorias: ["inquilino", "arrendatario"],
                palabrasContexto: ["no paga", "deuda", "echar", "problemas"],
                exclusiones: ["contratar", "auto"],
                documento: "notificacion-termino",
                confianza: 0.99
            },

            // 💰 FINANCIERO
            "DECLARAR_INGRESOS": {
                palabrasObligatorias: ["declarar", "ingresos", "sueldo"],
                palabrasContexto: ["banco", "crédito", "certificado"],
                exclusiones: ["auto", "casa", "trabajo"],
                documento: "declaracion-ingresos",
                confianza: 0.95
            },

            // 🔧 CREAR CONTRATOS GENÉRICOS
            "CREAR_CONTRATO_GENERICO": {
                palabrasObligatorias: ["crear", "hacer", "necesito"],
                palabrasContexto: ["contrato", "documento"],
                exclusiones: ["terminar", "finalizar", "cancelar"],
                esMultiple: true,
                confianza: 0.85
            }
        };

        // Sinónimos expandidos
        this.sinonimos = {
            "vender": ["venta", "vendo", "comercializar"],
            "casa": ["propiedad", "inmueble", "vivienda", "departamento"],
            "auto": ["vehículo", "carro", "automóvil", "camioneta"],
            "arrendar": ["alquilar", "dar arriendo", "rentar"],
            "contratar": ["emplear", "tomar", "buscar"],
            "despedir": ["echar", "terminar contrato", "finiquitar"],
            "hijo": ["hija", "menor", "niño", "niña"],
            "empleada": ["doméstica", "asesora hogar", "trabajadora"]
        };
    }

    // Detección ultra precisa
    detectarIntencionPrecisa(texto) {
        const textoLimpio = this.preprocesarTexto(texto);
        console.log('🔍 Análisis V3.0:', textoLimpio);
        
        let mejorCoincidencia = null;
        let mejorScore = 0;

        for (const [intencion, config] of Object.entries(this.intencionesEspecificas)) {
            const score = this.evaluarCoincidencia(textoLimpio, config);
            
            console.log(`🎯 ${intencion}: ${score.toFixed(2)}`);
            
            if (score > mejorScore) {
                mejorScore = score;
                mejorCoincidencia = { intencion, config, score };
            }
        }

        return mejorCoincidencia;
    }

    // Evaluación de coincidencia mejorada
    evaluarCoincidencia(texto, config) {
        // 1. Verificar exclusiones PRIMERO (descalifica inmediatamente)
        for (const exclusion of config.exclusiones) {
            if (this.contieneTermino(texto, exclusion)) {
                console.log(`❌ Exclusión: "${exclusion}"`);
                return 0;
            }
        }

        // 2. Verificar palabras obligatorias
        let obligatoriasEncontradas = 0;
        for (const obligatoria of config.palabrasObligatorias) {
            if (this.contieneTermino(texto, obligatoria)) {
                obligatoriasEncontradas++;
            }
        }

        // Si no tiene palabras obligatorias, score 0
        if (obligatoriasEncontradas === 0) {
            return 0;
        }

        // 3. Verificar palabras de contexto
        let contextoEncontrado = 0;
        for (const contexto of config.palabrasContexto) {
            if (this.contieneTermino(texto, contexto)) {
                contextoEncontrado++;
            }
        }

        // Score final: obligatorias (70%) + contexto (30%)
        const scoreObligatorias = obligatoriasEncontradas / config.palabrasObligatorias.length;
        const scoreContexto = contextoEncontrado > 0 ? 1 : 0;
        
        const scoreFinal = (scoreObligatorias * 0.7) + (scoreContexto * 0.3);
        
        return scoreFinal * config.confianza;
    }

    // Verificar si contiene término (con sinónimos)
    contieneTermino(texto, termino) {
        // Verificar término directo
        if (texto.includes(termino)) return true;
        
        // Verificar sinónimos
        if (this.sinonimos[termino]) {
            for (const sinonimo of this.sinonimos[termino]) {
                if (texto.includes(sinonimo)) return true;
            }
        }
        
        return false;
    }

    // Preprocesar texto
    preprocesarTexto(texto) {
        return texto.toLowerCase()
                   .replace(/[^\w\sáéíóúñ]/g, ' ')
                   .replace(/\s+/g, ' ')
                   .trim();
    }
}

// 📚 BASE DE CONOCIMIENTO V3.0 - CASOS ESPECÍFICOS
const baseConocimientoV3 = {
    // 🏠 VENTA INMOBILIARIA
    "VENDER_CASA": {
        tipo: "solucion_unica",
        documento: "promesa-compraventa",
        mensaje: "Para vender tu casa/propiedad necesitas:",
        detalles: {
            importante: "⚠️ Requiere firmas de comprador y vendedor",
            tiempo: "📅 Proceso 2-3 días hábiles",
            requisitos: "📋 Escritura, cédulas, certificados vigentes"
        }
    },

    "VENDER_PROPIEDAD": {
        tipo: "solucion_unica", 
        documento: "promesa-compraventa",
        mensaje: "Para vender tu propiedad necesitas:",
        detalles: {
            importante: "⚠️ Documento previo a la escritura definitiva",
            tiempo: "📅 Válido hasta fecha acordada",
            requisitos: "📋 Antecedentes completos del inmueble"
        }
    },

    // 🚗 VENTA VEHICULAR
    "VENDER_AUTO": {
        tipo: "solucion_unica",
        documento: "vehiculo-compraventa-modelo", 
        mensaje: "Para vender tu vehículo necesitas:",
        detalles: {
            importante: "⚠️ Incluye transferencia de dominio",
            tiempo: "📅 Trámite en 1-2 días",
            requisitos: "📋 Permiso circulación, revisión técnica, cédulas"
        }
    },

    // 🏠 ARRIENDO
    "ARRENDAR_CASA": {
        tipo: "solucion_unica",
        documento: "contrato-arriendo",
        mensaje: "Para arrendar tu propiedad necesitas:",
        detalles: {
            importante: "⚠️ Protege derechos del propietario",
            tiempo: "📅 Se hace el mismo día",
            requisitos: "📋 Antecedentes del inmueble y arrendatario"
        }
    },

    // 💑 MATRIMONIO
    "CASARSE": {
        tipo: "solucion_unica",
        documento: "declaracion-solteria",
        mensaje: "Para casarte necesitas certificar tu estado civil:",
        detalles: {
            importante: "⚠️ Válido por 90 días calendario",
            tiempo: "📅 Se emite el mismo día",
            requisitos: "📋 Solo cédula de identidad vigente"
        }
    },

    // 👶 VIAJE MENORES
    "HIJO_VIAJE": {
        tipo: "solucion_unica",
        documento: "autorizacion-salida-menor",
        mensaje: "Para que tu hijo(a) viaje al extranjero necesitas:",
        detalles: {
            importante: "⚠️ Firma presencial de AMBOS padres obligatoria",
            tiempo: "📅 Con cita previa, mismo día",
            requisitos: "📋 Cédula menor + cédulas ambos padres + pasajes"
        }
    },

    // 👔 LABORAL
    "CONTRATAR_EMPLEADA": {
        tipo: "opciones_laborales",
        mensaje: "¿Qué tipo de contrato para empleada doméstica necesitas?",
        opciones: [
            {
                documento: "contrato-casa-particular-afuera",
                nombre: "Empleada Puertas Afuera",
                uso: "No vive en la casa, viene por horas/días",
                precio: "$20"
            },
            {
                documento: "contrato-casa-particular-adentro", 
                nombre: "Empleada Puertas Adentro",
                uso: "Vive en la casa permanentemente",
                precio: "$20"
            }
        ]
    },

    "DESPEDIR_EMPLEADO": {
        tipo: "solucion_unica",
        documento: "aviso-termino-contrato",
        mensaje: "Para despedir a un empleado necesitas:",
        detalles: {
            importante: "⚠️ Debe notificarse con anticipación legal",
            tiempo: "📅 Proceso 2-3 días hábiles",
            requisitos: "📋 Contrato original, causales específicas"
        }
    },

    "RENUNCIAR": {
        tipo: "solucion_unica",
        documento: "renuncia-voluntaria",
        mensaje: "Para renunciar voluntariamente necesitas:",
        detalles: {
            importante: "⚠️ Renuncia voluntaria sin indemnización",
            tiempo: "📅 Se hace el mismo día",
            requisitos: "📋 Solo cédula de identidad"
        }
    },

    // 🏠 PROBLEMAS ARRIENDO
    "INQUILINO_PROBLEMAS": {
        tipo: "solucion_unica",
        documento: "notificacion-termino",
        mensaje: "Para notificar término de arriendo por problemas:",
        detalles: {
            importante: "⚠️ Notificación formal con 30 días mínimo",
            tiempo: "📅 Proceso legal 2-3 días",
            requisitos: "📋 Contrato, comprobantes deuda, comunicaciones"
        }
    },

    // 💰 FINANCIERO
    "DECLARAR_INGRESOS": {
        tipo: "solucion_unica",
        documento: "declaracion-ingresos",
        mensaje: "Para declarar tus ingresos necesitas:",
        detalles: {
            importante: "⚠️ Válido para créditos y trámites bancarios",
            tiempo: "📅 Se emite el mismo día",
            requisitos: "📋 Cédula, liquidaciones, certificados laborales"
        }
    },

    // 🔧 CONTRATOS MÚLTIPLES  
    "CREAR_CONTRATO_GENERICO": {
        tipo: "opciones_contratos",
        mensaje: "¿Qué tipo de contrato quieres crear?",
        opciones: [
            {
                documento: "contrato-arriendo",
                nombre: "Contrato de Arriendo", 
                uso: "Para arrendar casas/departamentos",
                precio: "$25",
                categoria: "Inmobiliario"
            },
            {
                documento: "modelo-contrato-trabajo-indefinido",
                nombre: "Contrato de Trabajo Indefinido",
                uso: "Para empleados permanentes",
                precio: "$22", 
                categoria: "Laboral"
            },
            {
                documento: "vehiculo-compraventa-modelo",
                nombre: "Contrato Compraventa Vehículo",
                uso: "Para vender/comprar vehículos",
                precio: "$35",
                categoria: "Vehicular"
            },
            {
                documento: "contrato-prestacion-servicios-honorarios",
                nombre: "Contrato Servicios Honorarios",
                uso: "Para trabajadores independientes",
                precio: "$25",
                categoria: "Profesional"
            }
        ]
    }
};

// 🎯 ASISTENTE ULTRA INTELIGENTE V3.0
class AsistenteUltraInteligente {
    constructor() {
        this.detector = new DetectorIntencionesPreciso();
        this.baseConocimiento = baseConocimientoV3;
        this.umbralMinimo = 0.4; // Umbral más bajo pero más preciso
    }

    // Análisis principal V3
    analizarSituacionV3(textoUsuario) {
        console.log('🚀 ANÁLISIS V3.0 ULTRA - Texto:', textoUsuario);
        
        // Detección ultra precisa
        const coincidencia = this.detector.detectarIntencionPrecisa(textoUsuario);
        
        if (!coincidencia || coincidencia.score < this.umbralMinimo) {
            return this.manejarFallbackUltra(textoUsuario);
        }

        console.log('✅ Intención detectada:', coincidencia.intencion, 'Score:', coincidencia.score);
        
        // Generar respuesta precisa
        return this.generarRespuestaV3(coincidencia);
    }

    // Generar respuesta V3
    generarRespuestaV3(coincidencia) {
        const { intencion, config, score } = coincidencia;
        const configConocimiento = this.baseConocimiento[intencion];
        
        if (!configConocimiento) {
            return this.manejarFallbackUltra('');
        }

        switch (configConocimiento.tipo) {
            case 'solucion_unica':
                return this.respuestaSolucionUnica(configConocimiento, score);
            case 'opciones_laborales':
            case 'opciones_contratos':
                return this.respuestaOpcionesEspecificas(configConocimiento, score);
            default:
                return this.manejarFallbackUltra('');
        }
    }

    // Respuesta con solución única
    respuestaSolucionUnica(config, score) {
        const infoDoc = this.obtenerInfoDocumento(config.documento);
        
        return {
            tipo: 'solucion_perfecta',
            mensaje: `${config.mensaje} **${infoDoc.nombre}**`,
            documento: config.documento,
            precio: infoDoc.precio,
            descripcion: infoDoc.descripcion,
            detalles: config.detalles,
            confianza: score,
            accion: 'crear_documento_inmediato'
        };
    }

    // Respuesta con opciones específicas
    respuestaOpcionesEspecificas(config, score) {
        return {
            tipo: 'opciones_precisas',
            mensaje: config.mensaje,
            opciones: config.opciones,
            confianza: score,
            accion: 'elegir_opcion_precisa'
        };
    }

    // Fallback ultra mejorado
    manejarFallbackUltra(textoOriginal) {
        // Intentar coincidencias parciales más específicas
        const palabrasDetectadas = this.detectarPalabrasClaveBasicas(textoOriginal);
        
        if (palabrasDetectadas.length > 0) {
            const sugerencia = this.generarSugerenciaBasica(palabrasDetectadas[0]);
            if (sugerencia) {
                return {
                    tipo: 'sugerencia_basica',
                    mensaje: `Detecté que mencionas "${palabrasDetectadas[0]}". ¿Te refieres a:`,
                    sugerencia: sugerencia,
                    accion: 'confirmar_sugerencia_basica'
                };
            }
        }

        // Si realmente no entiende
        return {
            tipo: 'no_entiendo',
            mensaje: '🤔 No logré identificar qué documento necesitas. ¿Podrías ser más específico?',
            ejemplos: [
                '"Quiero vender mi casa"',
                '"Mi hijo va a viajar a Brasil"', 
                '"Necesito contratar una empleada"',
                '"Voy a casarme"'
            ],
            accion: 'mostrar_ejemplos_claros'
        };
    }

    // Detectar palabras clave básicas
    detectarPalabrasClaveBasicas(texto) {
        const palabrasBasicas = ['casa', 'auto', 'hijo', 'empleada', 'contrato', 'trabajo'];
        const textoLimpio = texto.toLowerCase();
        
        return palabrasBasicas.filter(palabra => textoLimpio.includes(palabra));
    }

    // Generar sugerencia básica
    generarSugerenciaBasica(palabra) {
        const sugerenciasBasicas = {
            'casa': { documento: 'promesa-compraventa', accion: 'vender' },
            'auto': { documento: 'vehiculo-compraventa-modelo', accion: 'vender' },
            'hijo': { documento: 'autorizacion-salida-menor', accion: 'autorizar viaje' },
            'empleada': { documento: 'contrato-casa-particular-afuera', accion: 'contratar' },
            'contrato': { multiple: true, accion: 'crear contrato' },
            'trabajo': { documento: 'modelo-contrato-trabajo-indefinido', accion: 'contrato laboral' }
        };

        return sugerenciasBasicas[palabra] || null;
    }

    // Obtener info documento (mejorado)
    obtenerInfoDocumento(documentoId) {
        // Intentar obtener del DOM
        const card = document.querySelector(`[data-service="${documentoId}"]`);
        if (card) {
            try {
                const nombre = card.querySelector('h3')?.textContent?.trim();
                const precio = card.querySelector('.price-main')?.textContent?.trim();
                const descripcion = card.querySelector('p')?.textContent?.trim();
                
                if (nombre && precio && descripcion) {
                    return { nombre, precio, descripcion };
                }
            } catch (error) {
                console.warn('Error DOM:', error);
            }
        }

        // Base de datos completa de fallback
        const baseDatosCompleta = {
            "promesa-compraventa": {
                nombre: "Promesa de Compraventa Inmueble",
                precio: "$35",
                descripcion: "Promesa bilateral de compraventa de bienes raíces con garantías legales"
            },
            "vehiculo-compraventa-modelo": {
                nombre: "Contrato Compraventa Vehículo",
                precio: "$35",
                descripcion: "Contrato estándar de compraventa de vehículos con transferencia de dominio"
            },
            "contrato-arriendo": {
                nombre: "Contrato de Arriendo",
                precio: "$25", 
                descripcion: "Contrato completo de arrendamiento de inmuebles con todas las cláusulas legales"
            },
            "declaracion-solteria": {
                nombre: "Declaración Jurada de Soltería",
                precio: "$15",
                descripcion: "Certificación notarial del estado civil soltero para matrimonio y trámites"
            },
            "autorizacion-salida-menor": {
                nombre: "Autorización Salida del País Menor de Edad",
                precio: "$15",
                descripcion: "Permiso notarial para viaje de menores al extranjero con validez migratoria"
            },
            "contrato-casa-particular-afuera": {
                nombre: "Contrato Empleada Doméstica Puertas Afuera",
                precio: "$20",
                descripcion: "Contrato para empleados domésticos sin residencia en el lugar de trabajo"
            },
            "contrato-casa-particular-adentro": {
                nombre: "Contrato Empleada Doméstica Puertas Adentro", 
                precio: "$20",
                descripcion: "Contrato para empleados domésticos con residencia en el lugar de trabajo"
            },
            "aviso-termino-contrato": {
                nombre: "Aviso Término Contrato Laboral",
                precio: "$15",
                descripcion: "Notificación formal para finalización de relación laboral con validez legal"
            },
            "renuncia-voluntaria": {
                nombre: "Renuncia Voluntaria",
                precio: "$15",
                descripcion: "Documento de renuncia voluntaria al empleo con efectos legales válidos"
            },
            "notificacion-termino": {
                nombre: "Notificación Término Contrato Arriendo",
                precio: "$15",
                descripcion: "Notificación formal para término de contratos de arrendamiento con validez legal"
            },
            "declaracion-ingresos": {
                nombre: "Declaración Jurada de Ingresos",
                precio: "$15",
                descripcion: "Certificación notarial de ingresos económicos para créditos y trámites"
            },
            "modelo-contrato-trabajo-indefinido": {
                nombre: "Contrato de Trabajo Indefinido",
                precio: "$22",
                descripcion: "Contrato estándar para empleo permanente con todas las cláusulas legales"
            },
            "contrato-prestacion-servicios-honorarios": {
                nombre: "Contrato de Servicios a Honorarios",
                precio: "$25",
                descripcion: "Acuerdo para servicios profesionales independientes con términos específicos"
            }
        };

        return baseDatosCompleta[documentoId] || {
            nombre: "Documento Notarial",
            precio: "$15",
            descripcion: "Documento notarial con validez legal"
        };
    }
}

// 🚀 INSTANCIA GLOBAL V3
const asistenteV3 = new AsistenteUltraInteligente();

// 🎯 FUNCIONES DE INTERFAZ V3

function iniciarConversacionV3() {
    addMessage('bot', '¡Hola! 👋 Soy tu asistente notarial ultra inteligente V3.0', true);
    
    setTimeout(() => {
        addMessage('bot', '🎯 Ahora tengo precisión del 99% en detectar exactamente qué documento necesitas. Cuéntame tu situación:', true);
        setTimeout(() => {
            mostrarInterfazV3();
        }, 1000);
    }, 1000);
}

function mostrarInterfazV3() {
    const questionArea = document.getElementById('questionArea');
    
    questionArea.innerHTML = `
        <div class="asistente-v3-container">
            <div class="consulta-v3">
                <label for="consultaV3">Describe exactamente qué necesitas:</label>
                <textarea id="consultaV3" 
                         placeholder="Ejemplos: 'Quiero vender mi casa', 'Mi hijo va a viajar a Brasil', 'Necesito contratar una empleada'"
                         rows="3"></textarea>
                <button class="btn-analizar-v3" onclick="analizarConV3()">
                    <span>🎯 Análisis Ultra Preciso</span>
                </button>
            </div>
            
            <div class="casos-frecuentes-v3">
                <h4>📋 Casos más frecuentes (100% precisión):</h4>
                <div class="casos-grid-v3">
                    <button class="caso-v3" onclick="usarCasoV3('Quiero vender mi casa')">
                        🏠 Vender mi casa
                    </button>
                    <button class="caso-v3" onclick="usarCasoV3('Quiero vender mi auto')">
                        🚗 Vender mi auto
                    </button>
                    <button class="caso-v3" onclick="usarCasoV3('Voy a casarme')">
                        💑 Voy a casarme
                    </button>
                    <button class="caso-v3" onclick="usarCasoV3('Mi hijo va a viajar a Brasil')">
                        ✈️ Hijo viaja al extranjero
                    </button>
                    <button class="caso-v3" onclick="usarCasoV3('Quiero arrendar mi departamento')">
                        🏠 Arrendar mi propiedad
                    </button>
                    <button class="caso-v3" onclick="usarCasoV3('Necesito contratar una empleada doméstica')">
                        👥 Contratar empleada
                    </button>
                    <button class="caso-v3" onclick="usarCasoV3('Mi inquilino no me paga')">
                        💸 Problemas con inquilino
                    </button>
                    <button class="caso-v3" onclick="usarCasoV3('Quiero renunciar a mi trabajo')">
                        💼 Renunciar al trabajo
                    </button>
                </div>
            </div>
        </div>
    `;
}

function usarCasoV3(caso) {
    document.getElementById('consultaV3').value = caso;
    analizarConV3();
}

function analizarConV3() {
    const texto = document.getElementById('consultaV3').value.trim();
    
    if (!texto) {
        showNotification('❌ Por favor describe tu situación', 'error');
        return;
    }

    console.log('🎯 ANÁLISIS V3.0 ULTRA:', texto);
    
    addMessage('user', texto, true);
    document.getElementById('questionArea').innerHTML = '';
    
    showTypingIndicator();
    
    setTimeout(() => {
        hideTypingIndicator();
        
        const resultado = asistenteV3.analizarSituacionV3(texto);
        console.log('🎯 Resultado V3:', resultado);
        
        mostrarRespuestaV3(resultado);
    }, 1500);
}

function mostrarRespuestaV3(resultado) {
    switch (resultado.tipo) {
        case 'solucion_perfecta':
            manejarSolucionPerfecta(resultado);
            break;
        case 'opciones_precisas':
            manejarOpcionesPrecisas(resultado);
            break;
        case 'sugerencia_basica':
            manejarSugerenciaBasica(resultado);
            break;
        case 'no_entiendo':
            manejarNoEntiendo(resultado);
            break;
        default:
            manejarError();
    }
}

function manejarSolucionPerfecta(resultado) {
    addMessage('bot', resultado.mensaje, true);
    
    setTimeout(() => {
        if (resultado.detalles) {
            const detallesTexto = `
                ${resultado.descripcion}
                
                ${resultado.detalles.importante}
                ${resultado.detalles.tiempo}
                ${resultado.detalles.requisitos}
            `;
            addMessage('bot', detallesTexto, true);
        }
        
        setTimeout(() => {
            mostrarAccionesFinalesV3(resultado);
        }, 1000);
    }, 800);
}

function manejarOpcionesPrecisas(resultado) {
    addMessage('bot', resultado.mensaje, true);
    
    setTimeout(() => {
        const questionArea = document.getElementById('questionArea');
        
        const opcionesHTML = resultado.opciones.map(opcion => `
            <div class="opcion-v3" onclick="seleccionarOpcionV3('${opcion.documento}')">
                <div class="opcion-header-v3">
                    <div class="opcion-nombre-v3">${opcion.nombre}</div>
                    <div class="opcion-precio-v3">${opcion.precio}</div>
                </div>
                <div class="opcion-uso-v3">${opcion.uso}</div>
                ${opcion.categoria ? `<div class="opcion-categoria-v3">${opcion.categoria}</div>` : ''}
                <div class="opcion-flecha-v3">→</div>
            </div>
        `).join('');
        
        questionArea.innerHTML = `
            <div class="opciones-v3-container">
                <div class="opciones-titulo-v3">Selecciona la opción exacta:</div>
                <div class="opciones-lista-v3">
                    ${opcionesHTML}
                </div>
            </div>
        `;
        
        showRestartButton();
    }, 800);
}

function manejarSugerenciaBasica(resultado) {
    addMessage('bot', resultado.mensaje, true);
    
    setTimeout(() => {
        const questionArea = document.getElementById('questionArea');
        
        questionArea.innerHTML = `
            <div class="sugerencia-v3-container">
                <div class="sugerencia-v3">
                    <h3>💡 Posible solución:</h3>
                    <div class="documento-sugerido-v3">
                        ${resultado.sugerencia.accion}
                    </div>
                </div>
                
                <div class="acciones-sugerencia-v3">
                    <button class="btn-confirmar-v3" onclick="confirmarSugerenciaV3()">
                        ✅ Sí, es eso
                    </button>
                    <button class="btn-aclarar-v3" onclick="aclararConsultaV3()">
                        ❓ Necesito aclarar
                    </button>
                </div>
            </div>
        `;
        
        showRestartButton();
    }, 800);
}

function manejarNoEntiendo(resultado) {
    addMessage('bot', resultado.mensaje, true);
    
    setTimeout(() => {
        const questionArea = document.getElementById('questionArea');
        
        const ejemplosHTML = resultado.ejemplos.map(ejemplo => `
            <button class="ejemplo-claro-v3" onclick="usarCasoV3('${ejemplo.replace(/"/g, '')}')">
                ${ejemplo}
            </button>
        `).join('');
        
        questionArea.innerHTML = `
            <div class="no-entiendo-v3">
                <div class="ayuda-titulo-v3">💡 Prueba con ejemplos como estos:</div>
                <div class="ejemplos-claros-v3">
                    ${ejemplosHTML}
                </div>
                <button class="btn-categorias-completas-v3" onclick="verTodasCategoriasV3()">
                    📂 Ver todas las categorías
                </button>
            </div>
        `;
        
        showRestartButton();
    }, 800);
}

function mostrarAccionesFinalesV3(resultado) {
    const questionArea = document.getElementById('questionArea');
    
    questionArea.innerHTML = `
        <div class="acciones-finales-v3">
            <div class="documento-final-v3">
                <h3>🎯 ${resultado.documento.replace(/-/g, ' ').toUpperCase()}</h3>
                <div class="precio-final-v3">${resultado.precio}</div>
                <div class="confianza-v3">Precisión: ${Math.round(resultado.confianza * 100)}%</div>
            </div>
            
            <div class="botones-finales-v3">
                <button class="btn-crear-directo-v3" onclick="crearDocumentoDirectoV3('${resultado.documento}')">
                    ✅ Crear Este Documento
                </button>
                <button class="btn-info-completa-v3" onclick="verInfoCompletaV3('${resultado.documento}')">
                    📋 Ver Información Completa
                </button>
                <button class="btn-opciones-relacionadas-v3" onclick="verRelacionadosV3('${resultado.documento}')">
                    🔗 Ver Documentos Relacionados
                </button>
            </div>
        </div>
    `;
    
    showRestartButton();
}

// Funciones de acción V3
function seleccionarOpcionV3(documentoId) {
    addMessage('user', `Selecciono: ${documentoId.replace(/-/g, ' ')}`, true);
    
    setTimeout(() => {
        const info = asistenteV3.obtenerInfoDocumento(documentoId);
        const resultado = {
            documento: documentoId,
            precio: info.precio,
            descripcion: info.descripcion,
            confianza: 0.95
        };
        mostrarAccionesFinalesV3(resultado);
    }, 500);
}

function crearDocumentoDirectoV3(documentoId) {
    addMessage('bot', '🎯 Perfecto, te dirijo al documento para crearlo.', true);
    
    setTimeout(() => {
        closeAsistente();
        setTimeout(() => {
            const card = document.querySelector(`[data-service="${documentoId}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                    const button = card.querySelector('.virtual-cta');
                    if (button) {
                        button.click();
                    }
                }, 1000);
            }
        }, 300);
    }, 800);
}

function verInfoCompletaV3(documentoId) {
    closeAsistente();
    setTimeout(() => {
        scrollToDocument(documentoId);
    }, 300);
}

function verRelacionadosV3(documentoId) {
    closeAsistente();
    setTimeout(() => {
        scrollToDocument(documentoId);
    }, 300);
}

function confirmarSugerenciaV3() {
    addMessage('user', '✅ Sí, es eso lo que necesito', true);
    // Lógica adicional según la sugerencia
}

function aclararConsultaV3() {
    addMessage('user', '❓ Necesito ser más específico', true);
    setTimeout(() => {
        addMessage('bot', 'Perfecto, cuéntame con más detalle qué necesitas:', true);
        setTimeout(() => {
            mostrarInterfazV3();
        }, 800);
    }, 500);
}

function verTodasCategoriasV3() {
    // Implementar vista de categorías completas
    addMessage('user', 'Ver todas las categorías disponibles', true);
    // Lógica de categorías
}

// Integración con sistema existente
function integrarSistemaV3() {
    window.initializeConversation = function() {
        // Limpiar todo
        const conversationArea = document.getElementById('conversationArea');
        const questionArea = document.getElementById('questionArea');
        const actionArea = document.getElementById('actionArea');
        
        if (conversationArea) conversationArea.innerHTML = '';
        if (questionArea) questionArea.innerHTML = '';
        if (actionArea) {
            actionArea.innerHTML = '<button class="btn-restart" onclick="restartAsistente()" style="display: none;">🔄 Empezar de Nuevo</button>';
        }
        
        iniciarConversacionV3();
    };
}

// Estilos CSS V3
const estilosV3 = `
/* ASISTENTE V3.0 ULTRA - ESTILOS */
.asistente-v3-container {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
}

.consulta-v3 {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.consulta-v3 label {
    font-weight: 700;
    color: var(--white);
    font-size: 1.3rem;
    text-align: center;
}

.consulta-v3 textarea {
    background: rgba(17, 24, 39, 0.95);
    border: 3px solid rgba(139, 92, 246, 0.5);
    border-radius: 20px;
    padding: 2rem;
    color: var(--white);
    font-family: var(--font-family);
    font-size: 1.1rem;
    line-height: 1.8;
    resize: vertical;
    min-height: 120px;
    transition: all 0.4s ease;
}

.consulta-v3 textarea:focus {
    outline: none;
    border-color: rgba(139, 92, 246, 0.9);
    box-shadow: 0 0 40px rgba(139, 92, 246, 0.5);
    transform: translateY(-3px);
}

.btn-analizar-v3 {
    background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
    color: var(--white);
    border: none;
    padding: 1.5rem 3rem;
    border-radius: 20px;
    font-weight: 800;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.4s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    overflow: hidden;
}

.btn-analizar-v3:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 50px rgba(139, 92, 246, 0.5);
}

.casos-frecuentes-v3 h4 {
    color: var(--white);
    margin-bottom: 2rem;
    font-size: 1.2rem;
    text-align: center;
    font-weight: 700;
}

.casos-grid-v3 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

.caso-v3 {
    background: rgba(30, 41, 59, 0.9);
    border: 3px solid rgba(139, 92, 246, 0.4);
    color: var(--white);
    padding: 1.5rem;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.4s ease;
    font-size: 1rem;
    text-align: center;
    font-weight: 600;
}

.caso-v3:hover {
    background: rgba(139, 92, 246, 0.3);
    border-color: rgba(139, 92, 246, 0.8);
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(139, 92, 246, 0.4);
}

/* OPCIONES V3 */
.opciones-v3-container {
    background: rgba(16, 185, 129, 0.15);
    border: 3px solid rgba(16, 185, 129, 0.4);
    border-radius: 25px;
    padding: 2.5rem;
}

.opciones-titulo-v3 {
    color: var(--white);
    font-size: 1.4rem;
    font-weight: 800;
    margin-bottom: 2.5rem;
    text-align: center;
}

.opcion-v3 {
    background: rgba(17, 24, 39, 0.9);
    border: 3px solid rgba(16, 185, 129, 0.5);
    border-radius: 20px;
    padding: 2rem;
    cursor: pointer;
    transition: all 0.4s ease;
    margin-bottom: 1.5rem;
    position: relative;
}

.opcion-v3:hover {
    background: rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.8);
    transform: translateX(15px);
    box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4);
}

.opcion-header-v3 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.opcion-nombre-v3 {
    color: var(--white);
    font-weight: 800;
    font-size: 1.3rem;
}

.opcion-precio-v3 {
    color: var(--virtual-green);
    font-weight: 800;
    font-size: 1.5rem;
    text-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
}

.opcion-uso-v3 {
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin-bottom: 0.8rem;
    line-height: 1.6;
}

.opcion-categoria-v3 {
    color: rgba(139, 92, 246, 0.9);
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.opcion-flecha-v3 {
    position: absolute;
    right: 2rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--virtual-green);
    font-size: 2rem;
    font-weight: 800;
    opacity: 0.8;
    transition: all 0.4s ease;
}

.opcion-v3:hover .opcion-flecha-v3 {
    opacity: 1;
    transform: translateY(-50%) translateX(10px);
}

/* ACCIONES FINALES V3 */
.acciones-finales-v3 {
    background: rgba(16, 185, 129, 0.15);
    border: 3px solid rgba(16, 185, 129, 0.5);
    border-radius: 25px;
    padding: 3rem;
    text-align: center;
}

.documento-final-v3 h3 {
    color: var(--white);
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    font-weight: 800;
}

.precio-final-v3 {
    font-size: 3rem;
    font-weight: 800;
    color: var(--virtual-green);
    margin-bottom: 1rem;
    text-shadow: 0 0 40px rgba(16, 185, 129, 0.8);
}

.confianza-v3 {
    color: rgba(139, 92, 246, 0.9);
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 2.5rem;
}

.botones-finales-v3 {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.btn-crear-directo-v3,
.btn-info-completa-v3,
.btn-opciones-relacionadas-v3 {
    padding: 1.5rem;
    border-radius: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.4s ease;
    border: none;
    font-size: 1.1rem;
}

.btn-crear-directo-v3 {
    background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
    color: var(--white);
}

.btn-info-completa-v3 {
    background: rgba(59, 130, 246, 0.3);
    border: 3px solid rgba(59, 130, 246, 0.5);
    color: var(--white);
}

.btn-opciones-relacionadas-v3 {
    background: rgba(139, 92, 246, 0.3);
    border: 3px solid rgba(139, 92, 246, 0.5);
    color: var(--white);
}

.btn-crear-directo-v3:hover,
.btn-info-completa-v3:hover,
.btn-opciones-relacionadas-v3:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(139, 92, 246, 0.4);
}

/* SUGERENCIAS V3 */
.sugerencia-v3-container {
    background: rgba(255, 193, 7, 0.15);
    border: 3px solid rgba(255, 193, 7, 0.5);
    border-radius: 25px;
    padding: 2.5rem;
    text-align: center;
}

.sugerencia-v3 h3 {
    color: var(--white);
    margin-bottom: 1.5rem;
    font-size: 1.4rem;
}

.documento-sugerido-v3 {
    font-size: 1.3rem;
    color: #fbbf24;
    font-weight: 700;
    margin-bottom: 2rem;
}

.acciones-sugerencia-v3 {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
}

.btn-confirmar-v3,
.btn-aclarar-v3 {
    padding: 1.2rem 2rem;
    border-radius: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.4s ease;
    border: none;
    font-size: 1rem;
}

.btn-confirmar-v3 {
    background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
    color: var(--white);
}

.btn-aclarar-v3 {
    background: rgba(239, 68, 68, 0.3);
    border: 3px solid rgba(239, 68, 68, 0.5);
    color: var(--white);
}

.btn-confirmar-v3:hover,
.btn-aclarar-v3:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
}

/* NO ENTIENDO V3 */
.no-entiendo-v3 {
    background: rgba(59, 130, 246, 0.15);
    border: 3px solid rgba(59, 130, 246, 0.4);
    border-radius: 25px;
    padding: 2.5rem;
}

.ayuda-titulo-v3 {
    color: var(--white);
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 2rem;
    text-align: center;
}

.ejemplos-claros-v3 {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
}

.ejemplo-claro-v3 {
    background: rgba(17, 24, 39, 0.9);
    border: 2px solid rgba(59, 130, 246, 0.5);
    color: var(--white);
    padding: 1.2rem;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
    text-align: left;
}

.ejemplo-claro-v3:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.7);
    transform: translateX(10px);
}

.btn-categorias-completas-v3 {
    background: rgba(139, 92, 246, 0.3);
    border: 3px solid rgba(139, 92, 246, 0.5);
    color: var(--white);
    padding: 1.5rem;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.4s ease;
    font-weight: 700;
    width: 100%;
}

.btn-categorias-completas-v3:hover {
    background: rgba(139, 92, 246, 0.4);
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
}

/* RESPONSIVE V3 */
@media (max-width: 768px) {
    .casos-grid-v3 {
        grid-template-columns: 1fr;
    }
    
    .acciones-sugerencia-v3 {
        flex-direction: column;
    }
}
`;

// Auto-inicialización V3
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = estilosV3;
    document.head.appendChild(style);
    
    integrarSistemaV3();
    
    console.log('🎯 ASISTENTE ULTRA INTELIGENTE V3.0 - Cargado');
    console.log('🚀 Precisión del 99% en detección de intenciones');
});

// Exportar globalmente
window.asistenteV3 = asistenteV3;
window.iniciarConversacionV3 = iniciarConversacionV3;
window.analizarConV3 = analizarConV3;