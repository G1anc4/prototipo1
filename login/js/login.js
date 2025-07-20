// Inicializar datos si no existen
if (!localStorage.getItem('usuariosRegistrados')) {
  const usuariosIniciales = [{
    usuario: 'admin',
    dni: '00000000',
    password: 'admin123',
    rol: 'admin'
  }];
  localStorage.setItem('usuariosRegistrados', JSON.stringify(usuariosIniciales));
}

function login() {
  const tipo = document.getElementById('tipo').value;
  const dni = document.getElementById('dni').value;
  const usuario = document.getElementById('usuario').value;
  const password = document.getElementById('password').value;
  const mensaje = document.getElementById('mensaje');

  if (!dni || !usuario || !password) {
    mensaje.textContent = 'Por favor complete todos los campos';
    return;
  }

  const usuariosRegistrados = JSON.parse(localStorage.getItem('usuariosRegistrados') || '[]');
  const usuarioEncontrado = usuariosRegistrados.find(
    u => u.usuario === usuario && u.password === password && u.dni === dni && u.rol === tipo
  );

  if (usuarioEncontrado) {
    localStorage.setItem('sesionActiva', JSON.stringify(usuarioEncontrado));
    const redirecciones = {
      estudiante: '../panel_e/estudiante.html',
      profesor: '../../panel_p/profesor.html',
      admin: '../panel_a/admin.html'
    };
    window.location.href = redirecciones[tipo];
  } else {
    mensaje.textContent = 'Credenciales incorrectas. Verifique sus datos.';
  }
}

document.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    login();
  }
});
