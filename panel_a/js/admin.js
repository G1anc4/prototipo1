const AREAS = [
    "Ciencia y tecnología", "Matemática", "Comunicación", "DPCC", "Inglés",
    "Ciencias sociales", "Arte", "Religión", "EPT", "Educación física"
];

const MATERIAS = [
    "Matemática", "Comunicación", "Ciencia y tecnología", "Historia", "Inglés",
    "Arte", "Educación física", "DPCC", "Religión", "EPT"
];

if (!localStorage.getItem('usuariosRegistrados')) {
    localStorage.setItem('usuariosRegistrados', JSON.stringify([{
        usuario: 'admin',
        dni: '00000000',
        password: 'admin123',
        rol: 'admin'
    }]));
}

if (!localStorage.getItem('estudiantesNotas')) {
    localStorage.setItem('estudiantesNotas', JSON.stringify([]));
}

let usuariosRegistrados = JSON.parse(localStorage.getItem('usuariosRegistrados'));
let estudiantesNotas = JSON.parse(localStorage.getItem('estudiantesNotas'));

function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
    if (tabName === 'usuarios') mostrarUsuarios();
    if (tabName === 'ranking') mostrarRanking();
}

function mostrarSelectorArea() {
    const tipo = document.getElementById('tipoUsuario').value;
    document.getElementById('areaProfesorGroup').style.display = (tipo === 'profesor') ? 'block' : 'none';
}

function registrarUsuario() {
    const dni = document.getElementById('nuevoDni').value;
    const usuario = document.getElementById('nuevoUsuario').value;
    const password = document.getElementById('nuevoPassword').value;
    const rol = document.getElementById('tipoUsuario').value;
    const area = rol === 'profesor' ? document.getElementById('areaProfesor').value : null;
    if (!dni || !usuario || !password) {
        alert("Por favor complete todos los campos");
        return;
    }
    const nuevoUsuario = { dni, usuario, password, rol };
    if (area) nuevoUsuario.area = area;
    usuariosRegistrados.push(nuevoUsuario);
    localStorage.setItem('usuariosRegistrados', JSON.stringify(usuariosRegistrados));
    if (rol === 'estudiante') {
        estudiantesNotas.push({ dni, nombre: usuario, notas: {} });
        localStorage.setItem('estudiantesNotas', JSON.stringify(estudiantesNotas));
    }
    alert("Usuario registrado exitosamente!");
    document.getElementById('nuevoDni').value = '';
    document.getElementById('nuevoUsuario').value = '';
    document.getElementById('nuevoPassword').value = '';
}

function mostrarUsuarios() {
    const lista = document.getElementById('listaUsuarios');
    lista.innerHTML = '';
    if (usuariosRegistrados.length === 0) {
        lista.innerHTML = '<p>No hay usuarios registrados</p>';
        return;
    }
    usuariosRegistrados.forEach((user, index) => {
        const item = document.createElement('div');
        item.className = 'list-item';
        let userInfo = `<strong>${user.rol.toUpperCase()}</strong> - ${user.usuario} (DNI: ${user.dni})`;
        if (user.area) userInfo += ` | Área: ${user.area}`;
        item.innerHTML = `
            <div>${userInfo}</div>
            <div class="actions">
                <button onclick="editarUsuario(${index})">Editar</button>
                <button onclick="eliminarUsuario(${index})">Eliminar</button>
            </div>`;
        lista.appendChild(item);
    });
}

function eliminarUsuario(index) {
    if (confirm("¿Está seguro de eliminar este usuario?")) {
        const usuario = usuariosRegistrados[index];
        usuariosRegistrados.splice(index, 1);
        localStorage.setItem('usuariosRegistrados', JSON.stringify(usuariosRegistrados));
        if (usuario.rol === 'estudiante') {
            estudiantesNotas = estudiantesNotas.filter(e => e.dni !== usuario.dni);
            localStorage.setItem('estudiantesNotas', JSON.stringify(estudiantesNotas));
        }
        mostrarUsuarios();
    }
}

function calcularPromedio(notas) {
    const valores = Object.values(notas);
    if (valores.length === 0) return 0;
    const suma = valores.reduce((total, nota) => total + parseFloat(nota), 0);
    return (suma / valores.length).toFixed(2);
}

function mostrarRanking() {
    const rankingList = document.getElementById('rankingList');
    rankingList.innerHTML = '';
    const estudiantesConNotas = estudiantesNotas.filter(e => Object.keys(e.notas).length > 0);
    if (estudiantesConNotas.length === 0) {
        rankingList.innerHTML = '<p>No hay estudiantes con notas registradas</p>';
        return;
    }
    estudiantesConNotas.sort((a, b) => calcularPromedio(b.notas) - calcularPromedio(a.notas));
    estudiantesConNotas.forEach((e, i) => {
        const promedio = calcularPromedio(e.notas);
        const item = document.createElement('div');
        item.className = 'ranking-item';
        item.innerHTML = `
            <div>
                <span class="ranking-position">#${i + 1}</span> ${e.nombre} (DNI: ${e.dni})
            </div>
            <div><strong>Promedio: ${promedio}</strong></div>`;
        rankingList.appendChild(item);
    });
}

function buscarEstudiante() {
    const busqueda = document.getElementById('buscarEstudiante').value.toLowerCase();
    const resultado = document.getElementById('resultadoBusqueda');
    resultado.innerHTML = '';
    if (!busqueda) {
        resultado.innerHTML = '<p>Ingrese un nombre o DNI para buscar</p>';
        return;
    }
    const encontrados = estudiantesNotas.filter(e => e.nombre.toLowerCase().includes(busqueda) || e.dni.includes(busqueda));
    if (encontrados.length === 0) {
        resultado.innerHTML = '<p>No se encontraron estudiantes</p>';
        return;
    }
    encontrados.forEach(e => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `<div>${e.nombre} (DNI: ${e.dni})</div>
            <button onclick="cargarFormularioNotas('${e.dni}')">Editar Notas</button>`;
        resultado.appendChild(item);
    });
}

function cargarFormularioNotas(dni) {
    const estudiante = estudiantesNotas.find(e => e.dni === dni);
    const camposNotas = document.getElementById('camposNotas');
    camposNotas.innerHTML = `<h4>${estudiante.nombre} (DNI: ${estudiante.dni})</h4>`;
    MATERIAS.forEach(materia => {
        const notaActual = estudiante.notas[materia] || '';
        camposNotas.innerHTML += `
            <div class="form-group">
                <label for="nota_${materia.replace(/\s+/g, '_')}">${materia}:</label>
                <input type="number" id="nota_${materia.replace(/\s+/g, '_')}" value="${notaActual}" min="0" max="100" step="0.1">
            </div>`;
    });
    document.getElementById('formularioEdicion').style.display = 'block';
    document.getElementById('formularioEdicion').setAttribute('data-dni', dni);
}

function guardarNotas() {
    const dni = document.getElementById('formularioEdicion').getAttribute('data-dni');
    const estudianteIndex = estudiantesNotas.findIndex(e => e.dni === dni);
    if (estudianteIndex === -1) return;
    const nuevasNotas = {};
    MATERIAS.forEach(materia => {
        const input = document.getElementById(`nota_${materia.replace(/\s+/g, '_')}`);
        if (input && input.value) {
            nuevasNotas[materia] = parseFloat(input.value);
        }
    });
    estudiantesNotas[estudianteIndex].notas = nuevasNotas;
    localStorage.setItem('estudiantesNotas', JSON.stringify(estudiantesNotas));
    alert("Notas actualizadas correctamente");
    document.getElementById('formularioEdicion').style.display = 'none';
    mostrarRanking();
}

function cerrarSesion() {
    window.location.href = "../../login/login.html";
}

mostrarUsuarios();
