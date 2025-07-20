const chatbotDB = {
    "hola": {
        keywords: ["hola", "buenos días", "buenas tardes", "buenas noches"],
        responses: [
            { text: "¡Hola {nombre}! ¿Cómo estás hoy? 😊" },
            { text: "¡Hola! Soy Bianca, tu asistente. ¿En qué puedo ayudarte?" },
            { text: "¡Buen día {nombre}! Dime en qué puedo asistirte hoy." }
        ]
    },
    "notas": {
        keywords: ["nota", "notas", "calificacion", "calificaciones", "puntaje"],
        responses: [
            { text: "📊 Tus notas se actualizan automáticamente. Si no ves cambios, recarga la página." },
            { text: "Puedes ver tus calificaciones en el panel principal. ¿Necesitas algo específico sobre tus notas?" }
        ]
    },
    "archivo": {
        keywords: ["archivo", "subir", "entregar", "trabajo", "documento"],
        responses: [
            { text: "📤 Para enviar archivos: 1) Selecciona el área 2) Elige el archivo 3) Haz clic en 'Enviar'" },
            { text: "¿Quieres subir un trabajo? Ve a la sección 'Entregar trabajo' y sigue los pasos." }
        ]
    },
    "default": {
        responses: [
            { text: "No entendí. Prueba con: 'notas', 'tareas' o 'horarios'" },
            { text: "Vaya, no capté eso. ¿Podrías reformularlo? 😅" },
            { text: "¿Podrías decirlo de otra forma? No logro entenderte." }
        ]
    }
};


// Exportar para uso global
if (typeof window !== 'undefined') {
    window.chatbotDB = chatbotDB;
}