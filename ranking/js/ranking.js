// Función para calcular promedios
function calcularPromedio(notas) {
    if (!notas || Object.keys(notas).length === 0) return 0;
    const valores = Object.values(notas).map(Number);
    const suma = valores.reduce((a, b) => a + b, 0);
    return parseFloat((suma / valores.length).toFixed(1));
}

// Función para actualizar estadísticas
function actualizarEstadisticas(rankingData) {
    if (rankingData.length === 0) {
        document.getElementById('total-students').textContent = '0';
        document.getElementById('top-average').textContent = '0.0';
        document.getElementById('avg-average').textContent = '0.0';
        return;
    }

    document.getElementById('total-students').textContent = rankingData.length;
    document.getElementById('top-average').textContent = rankingData[0].promedio;

    const avgTotal = rankingData.reduce((sum, est) => sum + parseFloat(est.promedio), 0) / rankingData.length;
    document.getElementById('avg-average').textContent = avgTotal.toFixed(1);
}

// Función para generar barra de progreso
function generarBarraProgreso(promedio, maxPromedio = 10) {
    const porcentaje = (promedio / maxPromedio) * 100;
    return `
        <div class="progress-container">
            <div class="progress-bar" style="width: ${porcentaje}%"></div>
            <div class="progress-value">${promedio}/${maxPromedio}</div>
        </div>
    `;
}

// Función para exportar a CSV
function exportarCSV(rankingData) {
    let csv = 'Posición,Nombre,DNI,Promedio\n';
    
    rankingData.forEach((estudiante, index) => {
        csv += `${index + 1},"${estudiante.nombre}",${estudiante.dni},${estudiante.promedio}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'ranking_academico.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Función para exportar a PDF
function exportarPDF(rankingData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.setTextColor(111, 0, 0);
    doc.text('Ranking Académico 2025', 105, 15, { align: 'center' });
    
    // Fecha
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
    
    // Tabla
    const headers = [['Posición', 'Nombre', 'DNI', 'Promedio']];
    const data = rankingData.map((est, index) => [
        index + 1,
        est.nombre,
        est.dni,
        est.promedio
    ]);
    
    doc.autoTable({
        head: headers,
        body: data,
        startY: 30,
        headStyles: {
            fillColor: [111, 0, 0],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        margin: { top: 30 }
    });
    
    doc.save('ranking_academico.pdf');
}

// Mostrar ranking con filtros
function mostrarRanking(filter = 'all') {
    const rankingList = document.getElementById('ranking-list');
    const estudiantes = JSON.parse(localStorage.getItem('estudiantesNotas')) || [];
    
    // Procesar datos
    let rankingData = estudiantes
        .filter(est => est.notas && Object.keys(est.notas).length > 0)
        .map(est => ({
            ...est,
            promedio: calcularPromedio(est.notas)
        }))
        .sort((a, b) => b.promedio - a.promedio);
    
    // Aplicar filtro
    if (filter === 'top10') {
        rankingData = rankingData.slice(0, 10);
    } else if (filter === 'top20') {
        rankingData = rankingData.slice(0, 20);
    }
    
    // Actualizar estadísticas
    actualizarEstadisticas(rankingData);
    
    // Mostrar resultados
    if (rankingData.length === 0) {
        rankingList.innerHTML = `
            <div class="no-data">
                <p>No hay datos de estudiantes disponibles</p>
                <p>Registre notas en el panel de administración</p>
            </div>
        `;
        return;
    }
    
    rankingList.innerHTML = '';
    
    // Obtener el máximo promedio para la barra de progreso
    const maxPromedio = Math.max(...rankingData.map(est => parseFloat(est.promedio)), 10);
    
    rankingData.forEach((estudiante, index) => {
        const item = document.createElement('div');
        item.className = 'ranking-item';
        
        // Asignar medallas
        let medal = '';
        if (index === 0) medal = '<span class="medal gold">🥇</span>';
        else if (index === 1) medal = '<span class="medal silver">🥈</span>';
        else if (index === 2) medal = '<span class="medal bronze">🥉</span>';
        
        // Asignar badges
        let badge = '';
        if (index < 3) {
            badge = '<span class="badge badge-top">TOP</span>';
        } else if (parseFloat(estudiante.promedio) >= 8.5) {
            badge = '<span class="badge badge-honor">HONOR</span>';
        }
        
        item.innerHTML = `
            <div class="position">
                ${medal}${index + 1}
            </div>
            <div class="student-info">
                <div class="student-name">${estudiante.nombre} ${badge}</div>
                <div class="student-details">DNI: ${estudiante.dni}</div>
            </div>
            <div class="average">${estudiante.promedio}</div>
            <div class="progress-cell">${generarBarraProgreso(parseFloat(estudiante.promedio), maxPromedio)}</div>
        `;
        
        rankingList.appendChild(item);
    });
}

// Cargar el ranking al iniciar
document.addEventListener('DOMContentLoaded', () => {
    mostrarRanking();
    
    // Event listeners para filtros
    document.getElementById('filter-by').addEventListener('change', (e) => {
        mostrarRanking(e.target.value);
    });
    
    // Event listeners para botones de exportación
    document.getElementById('download-csv').addEventListener('click', () => {
        const estudiantes = JSON.parse(localStorage.getItem('estudiantesNotas')) || [];
        const rankingData = estudiantes
            .filter(est => est.notas && Object.keys(est.notas).length > 0)
            .map(est => ({
                ...est,
                promedio: calcularPromedio(est.notas)
            }))
            .sort((a, b) => b.promedio - a.promedio);
        
        exportarCSV(rankingData);
    });
    
    document.getElementById('download-pdf').addEventListener('click', () => {
        const estudiantes = JSON.parse(localStorage.getItem('estudiantesNotas')) || [];
        const rankingData = estudiantes
            .filter(est => est.notas && Object.keys(est.notas).length > 0)
            .map(est => ({
                ...est,
                promedio: calcularPromedio(est.notas)
            }))
            .sort((a, b) => b.promedio - a.promedio);
        
        exportarPDF(rankingData);
    });
});