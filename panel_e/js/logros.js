// ===== SISTEMA DE LOGROS ===== //
const logrosData = {
    "primer_login": {
        titulo: "Bienvenido a Poliweb",
        descripcion: "Iniciaste sesión por primera vez",
        icono: "👋",
        desbloqueado: false
    },
    "archivo_subido": {
        titulo: "Tarea entregada",
        descripcion: "Enviaste tu primer archivo",
        icono: "📤",
        desbloqueado: false
    },
    "nota_perfecta": {
        titulo: "¡Nota perfecta!",
        descripcion: "Obtuviste 20 en un área",
        icono: "💯",
        desbloqueado: false
    },
    "consistencia": {
        titulo: "Estudiante consistente",
        descripcion: "Entregaste 5 tareas seguidas",
        icono: "📅",
        desbloqueado: false
    },
    "chatbot_experto": {
        titulo: "Experto en chatbots",
        descripcion: "Hiciste 10 preguntas al asistente",
        icono: "🤖",
        desbloqueado: false
    },
    "multitarea": {
        titulo: "Estudiante multitarea",
        descripcion: "Tienes 3 logros desbloqueados",
        icono: "🌟",
        desbloqueado: false
    }
};

// Cargar logros desde localStorage
function cargarLogros() {
    const logrosGuardados = localStorage.getItem('logrosEstudiante');
    if (logrosGuardados) {
        const logrosParseados = JSON.parse(logrosGuardados);
        for (const key in logrosParseados) {
            if (logrosData[key]) {
                logrosData[key].desbloqueado = logrosParseados[key];
            }
        }
    }
    actualizarListaLogros();
    verificarLogroMultitarea();
}

// Mostrar logros en el modal
function actualizarListaLogros() {
    const lista = document.getElementById('listaLogros');
    lista.innerHTML = '';
    
    for (const [key, logro] of Object.entries(logrosData)) {
        const logroElement = document.createElement('div');
        logroElement.className = `logro-item ${logro.desbloqueado ? '' : 'logro-bloqueado'}`;
        logroElement.innerHTML = `
            <div class="logro-icon">${logro.icono}</div>
            <div>
                <h3>${logro.titulo}</h3>
                <p>${logro.descripcion}</p>
                ${logro.desbloqueado ? 
                    '<small class="badge" style="background: var(--success-color); color: white;">Desbloqueado</small>' : 
                    '<small class="badge">No desbloqueado</small>'}
            </div>
        `;
        lista.appendChild(logroElement);
    }
}

// Desbloquear logro
function desbloquearLogro(logroKey) {
    if (logrosData[logroKey] && !logrosData[logroKey].desbloqueado) {
        logrosData[logroKey].desbloqueado = true;
        localStorage.setItem('logrosEstudiante', JSON.stringify(
            Object.fromEntries(
                Object.entries(logrosData).map(([key, val]) => [key, val.desbloqueado])
        )));
        
        // Mostrar notificación
        document.getElementById('logroDesbloqueadoTitulo').textContent = logrosData[logroKey].titulo;
        const notificacion = document.getElementById('notificacionLogro');
        notificacion.style.display = 'block';
        
        setTimeout(() => {
            notificacion.style.display = 'none';
        }, 3000);
        
        actualizarListaLogros();
        verificarLogroMultitarea();
        return true;
    }
    return false;
}

// Verificar logro "multitarea"
function verificarLogroMultitarea() {
    const logrosDesbloqueados = Object.values(logrosData).filter(l => l.desbloqueado).length;
    if (logrosDesbloqueados >= 3 && !logrosData.multitarea.desbloqueado) {
        desbloquearLogro('multitarea');
    }
}

// Control del modal
document.getElementById('verLogrosBtn').addEventListener('click', () => {
    document.getElementById('logrosContainer').style.display = 'flex';
});

function cerrarLogros() {
    document.getElementById('logrosContainer').style.display = 'none';
}

// Inicialización del sistema de logros
document.addEventListener('DOMContentLoaded', () => {
    cargarLogros();
    
    // Desbloquear logro de primer inicio después de un breve retraso
    setTimeout(() => {
        desbloquearLogro('primer_login');
    }, 1500);
});