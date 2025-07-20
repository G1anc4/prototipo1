// ==============================================
// SISTEMA DE AUTENTICACIÓN Y DATOS DEL ESTUDIANTE
// ==============================================

// Verificar sesión y redireccionar si no es estudiante
const sesion = JSON.parse(localStorage.getItem('sesionActiva'));
if (!sesion || sesion.rol !== 'estudiante') {
    window.location.href = '../../login/login.html';
    throw new Error('Acceso no autorizado');
}

// Cargar y actualizar datos del usuario desde localStorage
const actualizarDatosUsuario = () => {
    const usuarios = JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
    const usuarioActual = usuarios.find(u => u.dni === sesion.dni);
    
    if (usuarioActual) {
        // Fusionar datos actualizados
        const sesionActualizada = { 
            ...sesion, 
            ...usuarioActual,
            ultimaActualizacion: new Date().toISOString()
        };
        
        localStorage.setItem('sesionActiva', JSON.stringify(sesionActualizada));
        
        // Recargar solo si hay cambios importantes
        if (JSON.stringify(sesion.notas) !== JSON.stringify(usuarioActual.notas)) {
            window.location.reload();
        }
    }
};

actualizarDatosUsuario();

// ==============================================
// CONFIGURACIÓN INICIAL DEL CHATBOT
// ==============================================

// Elementos del DOM
const elementosChatbot = {
    toggle: document.getElementById('chatbotToggle'),
    window: document.getElementById('chatbotWindow'),
    messages: document.getElementById('chatbotMessages'),
    input: document.getElementById('userMessage'),
    sendBtn: document.getElementById('sendMessage'),
    nameDisplay: document.getElementById('studentNameChat')
};

// Estado del chatbot
const estadoChatbot = {
    userName: sesion.usuario || 'Estudiante',
    isTyping: false,
    messageCount: 0,
    lastInteraction: null,
    conversationHistory: [],
    typingTimeout: null
};

// ==============================================
// FUNCIONES DEL CHATBOT
// ==============================================

/**
 * Inicializa el chatbot con configuración básica
 */
const inicializarChatbot = () => {
    elementosChatbot.nameDisplay.textContent = estadoChatbot.userName;
    
    if (!window.chatbotDB) {
        console.error("Base de datos del chatbot no cargada");
        window.chatbotDB = {
            default: {
                responses: [
                    { text: "⚠️ Error en el sistema. Recarga la página." }
                ]
            }
        };
    }
};

/**
 * Obtiene respuesta del chatbot para un mensaje dado
 * @param {string} message - Mensaje del usuario
 * @returns {object} Respuesta del chatbot
 */
const obtenerRespuestaChatbot = (message) => {
    if (estadoChatbot.isTyping) return null;
    
    estadoChatbot.messageCount++;
    estadoChatbot.lastInteraction = new Date();
    
    // Registrar en historial
    estadoChatbot.conversationHistory.push({
        type: 'user',
        content: message,
        timestamp: new Date()
    });

    const mensajeNormalizado = message.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    // Buscar coincidencia en la base de conocimientos
    let comandoEncontrado = null;
    for (const [clave, datos] of Object.entries(window.chatbotDB)) {
        if (clave === "default") continue;
        
        if (datos.keywords.some(palabraClave => 
            mensajeNormalizado.includes(palabraClave))) {
            comandoEncontrado = datos;
            break;
        }
    }

    // Seleccionar respuesta aleatoria
    const respuestas = comandoEncontrado?.responses || window.chatbotDB.default.responses;
    let respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];

    // Formatear respuesta
    if (typeof respuesta === 'string') {
        respuesta = { text: respuesta };
    }

    // Reemplazar variables dinámicas
    if (respuesta.text) {
        respuesta.text = respuesta.text
            .replace(/{nombre}/g, estadoChatbot.userName)
            .replace(/{fecha}/g, new Date().toLocaleDateString())
            .replace(/{hora}/g, new Date().toLocaleTimeString());
    }

    return respuesta;
};

/**
 * Muestra un mensaje en la interfaz del chat
 * @param {string} text - Texto del mensaje
 * @param {string} sender - 'user' o 'bot'
 */
const mostrarMensaje = (text, sender) => {
    // Crear contenedor principal
    const contenedorMensaje = document.createElement('div');
    contenedorMensaje.className = `message ${sender}-message`;
    
    // Contenido del mensaje
    const contenido = document.createElement('div');
    contenido.className = 'message-content';
    contenido.textContent = text;
    contenedorMensaje.appendChild(contenido);
    
    // Hora del mensaje (formato 12h)
    const hora = document.createElement('span');
    hora.className = 'message-time';
    hora.textContent = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    contenedorMensaje.appendChild(hora);
    
    // Agregar al chat
    elementosChatbot.messages.appendChild(contenedorMensaje);
    elementosChatbot.messages.scrollTop = elementosChatbot.messages.scrollHeight;
    
    // Registrar en historial
    estadoChatbot.conversationHistory.push({
        type: sender,
        content: text,
        timestamp: new Date()
    });
};

/**
 * Muestra indicador de que el bot está escribiendo
 */
const mostrarEscribiendo = () => {
    if (estadoChatbot.typingTimeout) {
        clearTimeout(estadoChatbot.typingTimeout);
    }
    
    const indicador = document.createElement('div');
    indicador.className = 'message bot-message typing-indicator';
    indicador.id = 'typingIndicator';
    indicador.innerHTML = '<span></span><span></span><span></span>';
    elementosChatbot.messages.appendChild(indicador);
    elementosChatbot.messages.scrollTop = elementosChatbot.messages.scrollHeight;
    
    estadoChatbot.isTyping = true;
};

/**
 * Oculta el indicador de escritura
 */
const ocultarEscribiendo = () => {
    const indicador = document.getElementById('typingIndicator');
    if (indicador) {
        indicador.remove();
    }
    estadoChatbot.isTyping = false;
};

/**
 * Procesa y envía un mensaje del usuario
 */
const enviarMensajeUsuario = () => {
    const mensaje = elementosChatbot.input.value.trim();
    if (!mensaje || estadoChatbot.isTyping) return;
    
    // Mostrar mensaje del usuario
    mostrarMensaje(mensaje, 'user');
    elementosChatbot.input.value = '';
    
    // Mostrar indicador de escritura
    mostrarEscribiendo();
    
    // Simular tiempo de respuesta (800-1800ms)
    estadoChatbot.typingTimeout = setTimeout(() => {
        ocultarEscribiendo();
        
        const respuesta = obtenerRespuestaChatbot(mensaje);
        if (respuesta) {
            mostrarMensaje(respuesta.text, 'bot');
        }
    }, 800 + Math.random() * 1000);
};

// ==============================================
// EVENT LISTENERS DEL CHATBOT
// ==============================================

// Toggle para mostrar/ocultar el chatbot
elementosChatbot.toggle.addEventListener('click', () => {
    elementosChatbot.window.classList.toggle('active');
    
    if (elementosChatbot.window.classList.contains('active')) {
        setTimeout(() => elementosChatbot.input.focus(), 100);
        
        // Inicializar solo la primera vez
        if (estadoChatbot.messageCount === 0) {
            inicializarChatbot();
        }
    }
});

// Enviar mensaje al hacer clic
elementosChatbot.sendBtn.addEventListener('click', enviarMensajeUsuario);

// Enviar mensaje al presionar Enter
elementosChatbot.input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        enviarMensajeUsuario();
    }
});

// ==============================================
// SISTEMA DE COMPETENCIAS Y NOTAS CON LETRAS (C, B, A, AD)
// ==============================================

const configuracionAreas = {
    iconos: {
        "Ciencia y tecnología": "🔬",
        "Matemática": "🧮",
        "Comunicación": "📝",
        "DPCC": "🏛️",
        "Inglés": "🌎",
        "Ciencias sociales": "🏙️",
        "Arte": "🎨",
        "Religión": "🙏",
        "EPT": "🛠️",
        "Educación física": "⚽"
    },
    
    competencias: {
        "Ciencia y tecnología": ["Investigación", "Experimentación", "Análisis"],
        "Matemática": ["Resolución de problemas", "Pensamiento lógico", "Precisión"],
        "Comunicación": ["Expresión oral", "Redacción", "Comprensión lectora"],
        "DPCC": ["Valores", "Ciudadanía", "Reflexión crítica"],
        "Inglés": ["Comprensión auditiva", "Expresión escrita", "Conversación"],
        "Ciencias sociales": ["Análisis histórico", "Interpretación", "Contextualización"],
        "Arte": ["Creatividad", "Técnica", "Expresión"],
        "Religión": ["Reflexión", "Respeto", "Ética"],
        "EPT": ["Habilidades técnicas", "Innovación", "Trabajo en equipo"],
        "Educación física": ["Destreza física", "Cooperación", "Salud"]
    },

    crearTarjetaArea: function(area, notas) {
        const icono = this.iconos[area] || "📚";
        const esAreaPrincipal = area === sesion.area;
        const competencias = this.competencias[area] || [];
        
        // Calcular promedio y letra
        let promedio = 0;
        let cantidadNotas = 0;
        
        if (notas && typeof notas === 'object') {
            for (const competencia in notas) {
                const nota = parseFloat(notas[competencia]);
                if (!isNaN(nota)) {
                    promedio += nota;
                    cantidadNotas++;
                }
            }
            promedio = cantidadNotas > 0 ? Math.round(promedio / cantidadNotas) : 0;
        }
        
        const letra = promedio >= 18 ? "AD" : 
                      promedio >= 15 ? "A" : 
                      promedio >= 11 ? "B" : "C";

        // Crear HTML de competencias
        let competenciasHTML = competencias.map(comp => {
            const nota = notas && notas[comp] ? notas[comp] : "--";
            return `
                <div class="competencia-item">
                    <span>${comp}</span>
                    <strong>${nota}</strong>
                </div>
            `;
        }).join('');

        const tarjeta = document.createElement('div');
        tarjeta.className = 'area-card';
        tarjeta.innerHTML = `
            <div class="area-title">
                <span>${icono} ${area}</span>
                <div class="nota-final ${letra}">${letra}</div>
            </div>
            <div class="competencias-container">
                ${competenciasHTML}
            </div>
            <div class="promedio">
                Promedio: <strong>${promedio || "--"}</strong> (${letra})
            </div>
        `;
        return tarjeta;
    }
};

/**
 * Carga y muestra las notas del estudiante por área
 */
const cargarNotasEstudiante = () => {
    const contenedor = document.getElementById('areasContainer');
    contenedor.innerHTML = '';
    
    Object.keys(configuracionAreas.iconos).forEach(area => {
        const nota = sesion.notas && sesion.notas[area] ? sesion.notas[area] : null;
        contenedor.appendChild(configuracionAreas.crearTarjetaArea(area, nota));
    });
};

// ==============================================
// SISTEMA DE ARCHIVOS
// ==============================================

/**
 * Carga y muestra el último archivo enviado por el estudiante
 */
const cargarUltimoArchivo = () => {
    const contenedorInfo = document.getElementById('ultimoArchivoInfo');
    const archivos = JSON.parse(localStorage.getItem('archivosEstudiante') || []);
    const archivosEstudiante = archivos.filter(a => a.dni === sesion.dni);
    
    if (archivosEstudiante.length > 0) {
        const ultimo = archivosEstudiante[archivosEstudiante.length - 1];
        
        document.getElementById('nombreArchivo').textContent = `📄 ${ultimo.nombre || 'Sin nombre'}`;
        document.getElementById('fechaArchivo').textContent = `📅 ${ultimo.fecha || 'Sin fecha'}`;
        document.getElementById('areaArchivo').textContent = `📚 ${ultimo.area || 'Sin área'}`;
        
        contenedorInfo.style.display = 'block';
    } else {
        contenedorInfo.style.display = 'none';
    }
};

/**
 * Maneja el envío de un nuevo archivo
 */
const manejarEnvioArchivo = () => {
    const area = document.getElementById('areaTrabajo').value;
    const archivoInput = document.getElementById('archivoTrabajo');
    const archivo = archivoInput.files[0];
    const boton = document.getElementById('submitBtn');
    const textoBoton = document.getElementById('btnText');
    const loader = document.getElementById('btnLoading');
    
    // Validaciones
    if (!area) return alert('Selecciona un área');
    if (!archivo) return alert('Selecciona un archivo');
    
    // Configurar estado de carga
    textoBoton.textContent = 'Enviando...';
    loader.style.display = 'inline-block';
    boton.disabled = true;
    
    // Simular envío (en producción sería una petición AJAX)
    setTimeout(() => {
        const lector = new FileReader();
        lector.onload = function(e) {
            // Actualizar base de datos local
            const archivos = JSON.parse(localStorage.getItem('archivosEstudiante') || '[]');
            const nuevosArchivos = archivos.filter(a => !(a.dni === sesion.dni && a.area === area));
            
            nuevosArchivos.push({
                usuario: sesion.usuario,
                dni: sesion.dni,
                area: area,
                nombre: archivo.name,
                contenido: e.target.result,
                fecha: new Date().toISOString()
            });
            
            localStorage.setItem('archivosEstudiante', JSON.stringify(nuevosArchivos));
            
            // Restaurar botón
            textoBoton.textContent = 'Enviar archivo';
            loader.style.display = 'none';
            boton.disabled = false;
            
            // Mostrar notificación
            mostrarNotificacion(`✅ Archivo enviado para ${area}`);
            
            // Actualizar vista
            cargarUltimoArchivo();
            archivoInput.value = '';
        };
        lector.readAsDataURL(archivo);
    }, 1000);
};

/**
 * Muestra una notificación temporal
 * @param {string} mensaje - Texto a mostrar
 */
const mostrarNotificacion = (mensaje) => {
    const notificacion = document.createElement('div');
    notificacion.className = 'notification';
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('fade-out');
        setTimeout(() => notificacion.remove(), 500);
    }, 3000);
};

// ==============================================
// INICIALIZACIÓN DE LA PÁGINA
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    // Mostrar datos del estudiante
    document.getElementById('nombreEstudiante').textContent = sesion.usuario || 'Estudiante';
    document.getElementById('dniEstudiante').textContent = sesion.dni || 'No registrado';
    document.getElementById('areaEstudianteBadge').textContent = sesion.area || 'Área no asignada';
    
    // Cargar datos académicos
    cargarNotasEstudiante();
    cargarUltimoArchivo();
    
    // Configurar event listeners adicionales
    document.getElementById('submitBtn').addEventListener('click', manejarEnvioArchivo);
    document.getElementById('cerrarSesionBtn').addEventListener('click', () => {
        localStorage.removeItem('sesionActiva');
        window.location.href = '../../login/login.html';
    });
    
    // Inicializar chatbot si está visible
    if (elementosChatbot.window.classList.contains('active')) {
        inicializarChatbot();
    }
});

async function obtenerPost(postId) {
  const res = await fetch(`/.netlify/functions/getPost?id=${postId}`);
  const data = await res.json();
  console.log(data);
}

obtenerPost(2009);