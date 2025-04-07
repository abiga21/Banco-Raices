<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Banco Raíces</title>
  <style>
    :root {
      --primary: #00796b;
      --primary-dark: #004d40;
      --danger: #c62828;
      --secondary: #616161;
      --background: #e0f7fa;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(to bottom, var(--background), #fff);
      min-height: 100vh;
      padding: 20px;
      color: #333;
      max-width: 1000px;
      margin: 0 auto;
    }
    
    h1, h2, h3 {
      color: var(--primary);
      margin: 15px 0;
    }
    
    button, input, select {
      padding: 10px;
      border-radius: 5px;
      border: 1px solid #ccc;
      font-size: 16px;
      margin: 5px 0;
    }
    
    button {
      background-color: var(--primary);
      color: white;
      cursor: pointer;
      border: none;
      transition: background-color 0.3s;
    }
    
    button:hover {
      background-color: var(--primary-dark);
    }
    
    button.secondary {
      background-color: var(--secondary);
    }
    
    button.danger {
      background-color: var(--danger);
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    th, td {
      padding: 12px;
      text-align: center;
      border: 1px solid #ddd;
    }
    
    th {
      background-color: var(--primary-dark);
      color: white;
    }
    
    .curso-1 { background-color: #ffebee; }
    .curso-2 { background-color: #e8f5e9; }
    .curso-3 { background-color: #fffde7; }
    .curso-4 { background-color: #e3f2fd; }
    .curso-5 { background-color: #f3e5f5; }
    .curso-6 { background-color: #ede7f6; }
    
    .login-container {
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .hidden {
      display: none !important;
    }
    
    .user-info {
      text-align: right;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
    }
    
    .premio-personalizado {
      margin: 5px 0;
      padding: 5px;
      background: #f5f5f5;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .acciones {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .acciones button {
      width: 100%;
    }
  </style>
</head>
<body>
  <!-- Pantalla de Login -->
  <div id="loginScreen" class="login-container">
    <h2>🔒 Banco Raíces</h2>
    <p>Sistema de gestión de premios escolares</p>
    <div style="margin: 20px 0;">
      <input type="text" id="inputUsuario" placeholder="Usuario" style="width: 100%;">
      <input type="password" id="inputPassword" placeholder="Contraseña" style="width: 100%;">
    </div>
    <button onclick="iniciarSesion()" style="width: 100%;">Ingresar</button>
    <p id="loginError" style="color: var(--danger); margin-top: 10px;"></p>
  </div>

  <!-- Aplicación Principal -->
  <div id="app" class="hidden">
    <div class="user-info">
      Conectado como: <strong id="currentUser"></strong>
      <button onclick="cerrarSesion()" class="secondary">Cerrar sesión</button>
    </div>

    <h1>🏦 Banco Raíces</h1>
    
    <div id="adminSection">
      <h2>🎁 Configuración de Premios</h2>
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 20px;">
        <input type="text" id="premioNombre" placeholder="Nombre del premio general" value="Premio especial">
        <input type="number" id="premioCosto" placeholder="Costo" value="30" min="1">
      </div>

      <h2>👨‍🎓 Gestión de Estudiantes</h2>
      <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px; margin-bottom: 20px;">
        <input type="text" id="nombreEstudiante" placeholder="Nombre del estudiante">
        <input type="number" id="raicesIniciales" placeholder="Raíces" value="0" min="0">
        <select id="cursoEstudiante">
          <option value="">Curso</option>
          <option value="1">1° año</option>
          <option value="2">2° año</option>
          <option value="3">3° año</option>
          <option value="4">4° año</option>
          <option value="5">5° año</option>
          <option value="6">6° año</option>
        </select>
      </div>
      <button onclick="agregarEstudiante()" style="width: 100%;">Agregar Estudiante</button>
    </div>

    <div style="margin: 30px 0; display: flex; gap: 10px;">
      <button onclick="mostrarRanking()">📊 Mostrar Ranking</button>
      <button onclick="mostrarModalReinicio()" class="danger">🧼 Reiniciar Sistema</button>
      <button onclick="exportarDatos()" class="secondary">💾 Exportar Datos</button>
    </div>

    <!-- Tabla de Estudiantes -->
    <div id="rankingSection" class="hidden">
      <h2>Ranking por Curso</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Curso</th>
            <th>Raíces</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="tablaEstudiantes"></tbody>
      </table>
    </div>

    <!-- Historial -->
    <div id="historialSection" style="margin-top: 30px;" class="hidden">
      <h2>📝 Historial de Canjes</h2>
      <ul id="listaHistorial" style="list-style: none;"></ul>
    </div>
  </div>

  <!-- Modal para Reiniciar -->
  <div id="reiniciarModal" class="modal hidden">
    <div class="modal-content">
      <h3>⚠️ Reiniciar Sistema</h3>
      <p>¿Estás seguro que deseas borrar todos los datos? Esta acción no se puede deshacer.</p>
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button onclick="reiniciarSistema()" class="danger">Sí, Reiniciar</button>
        <button onclick="ocultarModal('reiniciarModal')" class="secondary">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- Modal para Premio Personalizado -->
  <div id="premioModal" class="modal hidden">
    <div class="modal-content">
      <h3>✨ Nuevo Premio Personalizado</h3>
      <input type="text" id="nombrePremioPersonal" placeholder="Nombre del premio" style="width: 100%; margin: 10px 0;">
      <input type="number" id="costoPremioPersonal" placeholder="Costo en raíces" min="1" style="width: 100%;">
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button onclick="canjearPremioPersonal()">Confirmar</button>
        <button onclick="ocultarModal('premioModal')" class="secondary">Cancelar</button>
      </div>
    </div>
  </div>

  <script>
    // Datos del sistema
    let estudiantes = [];
    let historial = [];
    let usuarioActual = null;
    let estudianteSeleccionado = null;
    
    // Usuarios válidos (en producción deberías usar un sistema más seguro)
    const usuarios = {
      "admin": "admin123",
      "profesor": "clave123",
      "director": "educacion2024"
    };

    // Iniciar sesión
    function iniciarSesion() {
      const usuario = document.getElementById("inputUsuario").value.trim();
      const password = document.getElementById("inputPassword").value;
      const errorElement = document.getElementById("loginError");
      
      if (usuarios[usuario] && usuarios[usuario] === password) {
        usuarioActual = {
          nombre: usuario,
          rol: usuario === "admin" ? "administrador" : "profesor"
        };
        
        // Mostrar aplicación
        document.getElementById("loginScreen").classList.add("hidden");
        document.getElementById("app").classList.remove("hidden");
        document.getElementById("currentUser").textContent = usuarioActual.nombre;
        
        // Cargar datos guardados
        cargarDatos();
        mostrarRanking();
      } else {
        errorElement.textContent = "Usuario o contraseña incorrectos";
      }
    }

    // Cerrar sesión
    function cerrarSesion() {
      if (confirm("¿Estás seguro que deseas cerrar la sesión?")) {
        usuarioActual = null;
        document.getElementById("app").classList.add("hidden");
        document.getElementById("loginScreen").classList.remove("hidden");
        document.getElementById("inputPassword").value = "";
        document.getElementById("loginError").textContent = "";
      }
    }

    // Cargar datos desde localStorage
    function cargarDatos() {
      const datosGuardados = localStorage.getItem("bancoRaicesData");
      const historialGuardado = localStorage.getItem("bancoRaicesHistorial");
      
      if (datosGuardados) {
        estudiantes = JSON.parse(datosGuardados);
      }
      
      if (historialGuardado) {
        historial = JSON.parse(historialGuardado);
      }
    }

    // Guardar datos en localStorage
    function guardarDatos() {
      localStorage.setItem("bancoRaicesData", JSON.stringify(estudiantes));
      localStorage.setItem("bancoRaicesHistorial", JSON.stringify(historial));
    }

    // Agregar nuevo estudiante
    function agregarEstudiante() {
      const nombre = document.getElementById("nombreEstudiante").value.trim();
      const raices = parseInt(document.getElementById("raicesIniciales").value) || 0;
      const curso = document.getElementById("cursoEstudiante").value;
      
      if (nombre && curso) {
        estudiantes.push({
          nombre,
          raices,
          curso,
          premiosPersonalizados: []
        });
        
        guardarDatos();
        mostrarRanking();
        
        // Limpiar formulario
        document.getElementById("nombreEstudiante").value = "";
        document.getElementById("raicesIniciales").value = "0";
        document.getElementById("cursoEstudiante").value = "";
      } else {
        alert("Por favor completa todos los campos correctamente");
      }
    }

    // Mostrar ranking de estudiantes
    function mostrarRanking() {
      const tbody = document.getElementById("tablaEstudiantes");
      tbody.innerHTML = "";
      
      // Ordenar por curso y luego por raíces (descendente)
      estudiantes.sort((a, b) => a.curso - b.curso || b.raices - a.raices);
      
      estudiantes.forEach((estudiante, index) => {
        const row = document.createElement("tr");
        row.className = `curso-${estudiante.curso}`;
        
        // Premios personalizados
        const premiosHTML = estudiante.premiosPersonalizados.map(premio => `
          <div class="premio-personalizado">
            ${premio.nombre} (${premio.costo} raíces)
            <small>${premio.fecha}</small>
          </div>
        `).join("");
        
        row.innerHTML = `
          <td>${estudiante.nombre}</td>
          <td>${estudiante.curso}°</td>
          <td>
            ${estudiante.raices}
            <div style="display: flex; gap: 5px; margin-top: 5px;">
              <button onclick="modificarRaices(${index}, 1)" style="padding: 2px 5px;">➕</button>
              <button onclick="modificarRaices(${index}, -1)" style="padding: 2px 5px;">➖</button>
            </div>
          </td>
          <td class="acciones">
            <button onclick="canjearPremioGeneral(${index})">
              🎁 ${document.getElementById("premioNombre").value} (${document.getElementById("premioCosto").value} raíces)
            </button>
            <button onclick="mostrarModalPremioPersonal(${index})" class="secondary">
              ✨ Premio personalizado
            </button>
            <button onclick="eliminarEstudiante(${index})" class="danger">
              🗑 Eliminar
            </button>
            ${premiosHTML}
          </td>
        `;
        
        tbody.appendChild(row);
      });
      
      // Mostrar secciones
      document.getElementById("rankingSection").classList.remove("hidden");
      document.getElementById("historialSection").classList.remove("hidden");
      actualizarHistorial();
    }

    // Modificar raíces (sumar o restar)
    function modificarRaices(index, cantidad) {
      const nuevaCantidad = estudiantes[index].raices + cantidad;
      
      if (nuevaCantidad >= 0) {
        estudiantes[index].raices = nuevaCantidad;
        guardarDatos();
        mostrarRanking();
      } else {
        alert("No se pueden tener raíces negativas");
      }
    }

    // Canjear premio general
    function canjearPremioGeneral(index) {
      const nombrePremio = document.getElementById("premioNombre").value;
      const costoPremio = parseInt(document.getElementById("premioCosto").value);
      
      if (estudiantes[index].raices >= costoPremio) {
        estudiantes[index].raices -= costoPremio;
        
        // Registrar en historial
        const fecha = new Date().toLocaleString();
        historial.push(`${fecha} - ${estudiantes[index].nombre} canjeó: ${nombrePremio} (${costoPremio} raíces)`);
        
        guardarDatos();
        mostrarRanking();
      } else {
        alert(`${estudiantes[index].nombre} no tiene suficientes raíces para este premio`);
      }
    }

    // Mostrar modal para premio personalizado
    function mostrarModalPremioPersonal(index) {
      estudianteSeleccionado = index;
      document.getElementById("nombrePremioPersonal").value = "";
      document.getElementById("costoPremioPersonal").value = "";
      document.getElementById("premioModal").classList.remove("hidden");
    }

    // Canjear premio personalizado
    function canjearPremioPersonal() {
      const nombre = document.getElementById("nombrePremioPersonal").value.trim();
      const costo = parseInt(document.getElementById("costoPremioPersonal").value);
      
      if (nombre && costo > 0 && estudianteSeleccionado !== null) {
        if (estudiantes[estudianteSeleccionado].raices >= costo) {
          estudiantes[estudianteSeleccionado].raices -= costo;
          
          // Agregar premio personalizado
          estudiantes[estudianteSeleccionado].premiosPersonalizados.push({
            nombre,
            costo,
            fecha: new Date().toLocaleDateString()
          });
          
          // Registrar en historial
          const fecha = new Date().toLocaleString();
          historial.push(`${fecha} - ${estudiantes[estudianteSeleccionado].nombre} canjeó: ${nombre} (${costo} raíces)`);
          
          guardarDatos();
          ocultarModal("premioModal");
          mostrarRanking();
        } else {
          alert("No tiene suficientes raíces para este premio");
        }
      } else {
        alert("Por favor completa todos los campos correctamente");
      }
    }

    // Eliminar estudiante
    function eliminarEstudiante(index) {
      if (confirm(`¿Estás seguro de eliminar a ${estudiantes[index].nombre}?`)) {
        estudiantes.splice(index, 1);
        guardarDatos();
        mostrarRanking();
      }
    }

    // Mostrar modal de reinicio
    function mostrarModalReinicio() {
      document.getElementById("reiniciarModal").classList.remove("hidden");
    }

    // Reiniciar sistema
    function reiniciarSistema() {
      if (confirm("¿CONFIRMAS QUE QUIERES BORRAR TODOS LOS DATOS? ESTA ACCIÓN NO SE PUEDE DESHACER.")) {
        estudiantes = [];
        historial = [];
        guardarDatos();
        ocultarModal("reiniciarModal");
        mostrarRanking();
      }
    }

    // Ocultar modal
    function ocultarModal(id) {
      document.getElementById(id).classList.add("hidden");
    }

    // Actualizar historial
    function actualizarHistorial() {
      const lista = document.getElementById("listaHistorial");
      lista.innerHTML = "";
      
      if (historial.length === 0) {
        lista.innerHTML = "<li>No hay registros en el historial</li>";
        return;
      }
      
      // Mostrar los últimos 20 registros (los más recientes primero)
      const historialReciente = [...historial].reverse().slice(0, 20);
      
      historialReciente.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        li.style.margin = "5px 0";
        li.style.padding = "5px";
        li.style.backgroundColor = "#f5f5f5";
        li.style.borderRadius = "4px";
        lista.appendChild(li);
      });
    }

    // Exportar datos
    function exportarDatos() {
      let csv = "Nombre,Curso,Raíces,Premios personalizados\n";
      
      estudiantes.forEach(est => {
        const premios = est.premiosPersonalizados.map(p => `${p.nombre} (${p.costo} raíces)`).join("; ");
        csv += `"${est.nombre}",${est.curso},${est.raices},"${premios}"\n`;
      });
      
      csv += "\nHistorial de Canjes\n";
      historial.forEach(h => {
        csv += `${h}\n`;
      });
      
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `banco_raices_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // Inicialización
    document.addEventListener("DOMContentLoaded", function() {
      // Asignar eventos a los inputs para actualizar en tiempo real
      document.getElementById("premioNombre").addEventListener("input", mostrarRanking);
      document.getElementById("premioCosto").addEventListener("input", mostrarRanking);
    });
  </script>
</body>
</html>
