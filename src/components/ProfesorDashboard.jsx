import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';

const ProfesorDashboard = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudiantesPorCurso, setEstudiantesPorCurso] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cantidadRaices, setCantidadRaices] = useState(5);
  const [premioTipo, setPremioTipo] = useState('');
  const [premioValor, setPremioValor] = useState('');
  const [sugerenciasPremios] = useState([
    'Libro',
    'Material Escolar',
    'Actividad Especial',
    'Reconocimiento',
    'Otro'
  ]);
  const [cantidadQuitar, setCantidadQuitar] = useState(1);

  useEffect(() => {
    console.log("ProfesorDashboard: Iniciando carga de estudiantes");
    cargarEstudiantes();
  }, []);

  const cargarEstudiantes = async () => {
    try {
      console.log("ProfesorDashboard: Cargando estudiantes...");
      // Primero obtenemos todos los estudiantes
      const q = query(
        collection(db, 'users'),
        where('rol', '==', 'estudiante')
      );
      
      const querySnapshot = await getDocs(q);
      const estudiantesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Ordenamos los estudiantes en memoria
      estudiantesData.sort((a, b) => {
        // Primero ordenar por curso
        if (a.curso !== b.curso) {
          return (a.curso || 'ZZZ').localeCompare(b.curso || 'ZZZ');
        }
        // Si el curso es igual, ordenar por nombre
        return (a.nombre || '').localeCompare(b.nombre || '');
      });

      // Agrupar estudiantes por curso
      const agrupados = estudiantesData.reduce((acc, estudiante) => {
        const curso = estudiante.curso || 'Sin Curso';
        if (!acc[curso]) {
          acc[curso] = [];
        }
        acc[curso].push(estudiante);
        return acc;
      }, {});

      // Ordenar los cursos alfabéticamente
      const cursosOrdenados = Object.keys(agrupados).sort();

      // Crear un nuevo objeto con los cursos ordenados
      const estudiantesOrdenados = {};
      cursosOrdenados.forEach(curso => {
        estudiantesOrdenados[curso] = agrupados[curso];
      });

      console.log("ProfesorDashboard: Estudiantes cargados y agrupados:", estudiantesOrdenados);
      setEstudiantes(estudiantesData);
      setEstudiantesPorCurso(estudiantesOrdenados);
    } catch (error) {
      console.error("ProfesorDashboard: Error al cargar estudiantes:", error);
      if (error.message.includes('requires an index')) {
        // Extraer el enlace del índice del mensaje de error
        const indexLinkMatch = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
        const indexLink = indexLinkMatch ? indexLinkMatch[0] : null;
        
        setError({
          type: 'index',
          message: 'Se requiere crear un índice en Firestore. Por favor, haz clic en el enlace para crearlo.',
          link: indexLink
        });
      } else {
        setError({
          type: 'general',
          message: 'Error al cargar estudiantes: ' + error.message
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const agregarRaices = async (estudianteId, cantidad) => {
    try {
      console.log("ProfesorDashboard: Agregando raíces:", cantidad, "al estudiante:", estudianteId);
      const estudianteRef = doc(db, 'users', estudianteId);
      const estudiante = estudiantes.find(e => e.id === estudianteId);
      
      if (!estudiante) {
        throw new Error('Estudiante no encontrado');
      }

      const nuevasRaices = (estudiante.raices || 0) + cantidad;
      
      await updateDoc(estudianteRef, {
        raices: nuevasRaices
      });

      // Actualizar el estado local
      const estudiantesActualizados = estudiantes.map(e => 
        e.id === estudianteId 
          ? { ...e, raices: nuevasRaices }
          : e
      );
      setEstudiantes(estudiantesActualizados);

      // Actualizar el estado agrupado por curso
      const nuevosEstudiantesPorCurso = { ...estudiantesPorCurso };
      Object.keys(nuevosEstudiantesPorCurso).forEach(curso => {
        nuevosEstudiantesPorCurso[curso] = nuevosEstudiantesPorCurso[curso].map(e =>
          e.id === estudianteId
            ? { ...e, raices: nuevasRaices }
            : e
        );
      });
      setEstudiantesPorCurso(nuevosEstudiantesPorCurso);

      console.log("ProfesorDashboard: Raíces agregadas con éxito");
    } catch (error) {
      console.error('ProfesorDashboard: Error al agregar raíces:', error);
      setError('Error al agregar raíces: ' + error.message);
    }
  };

  const actualizarPremio = async (estudianteId) => {
    if (!premioTipo || !premioValor) return;

    try {
      console.log("ProfesorDashboard: Actualizando premio para estudiante:", estudianteId);
      const estudianteRef = doc(db, 'users', estudianteId);
      const estudiante = estudiantes.find(e => e.id === estudianteId);
      const premios = estudiante.premios || [];
      
      await updateDoc(estudianteRef, {
        premios: [...premios, {
          tipo: premioTipo,
          valor: parseInt(premioValor),
          fecha: new Date().toISOString()
        }]
      });

      setPremioTipo('');
      setPremioValor('');
      await cargarEstudiantes();
      console.log("ProfesorDashboard: Premio actualizado con éxito");
    } catch (error) {
      console.error('ProfesorDashboard: Error al actualizar premio:', error);
    }
  };

  const canjearRaices = async (estudianteId) => {
    if (!premioTipo || !premioValor) return;

    try {
      console.log("ProfesorDashboard: Canjeando raíces para estudiante:", estudianteId);
      const estudianteRef = doc(db, 'users', estudianteId);
      const estudiante = estudiantes.find(e => e.id === estudianteId);
      const valorPremio = parseInt(premioValor);
      
      if ((estudiante.raices || 0) < valorPremio) {
        alert('El estudiante no tiene suficientes raíces');
        return;
      }

      const nuevasRaices = (estudiante.raices || 0) - valorPremio;
      const canjes = estudiante.canjes || [];
      
      await updateDoc(estudianteRef, {
        raices: nuevasRaices,
        canjes: [...canjes, {
          premio: premioTipo,
          valor: valorPremio,
          fecha: new Date().toISOString()
        }]
      });

      setPremioTipo('');
      setPremioValor('');
      await cargarEstudiantes();
      console.log("ProfesorDashboard: Canje realizado con éxito");
    } catch (error) {
      console.error('ProfesorDashboard: Error al canjear raíces:', error);
    }
  };

  const quitarRaices = async (estudianteId, cantidad) => {
    try {
      console.log("ProfesorDashboard: Quitando raíces:", cantidad, "al estudiante:", estudianteId);
      const estudianteRef = doc(db, 'users', estudianteId);
      const estudiante = estudiantes.find(e => e.id === estudianteId);
      
      if (!estudiante) {
        throw new Error('Estudiante no encontrado');
      }

      if ((estudiante.raices || 0) < cantidad) {
        throw new Error('El estudiante no tiene suficientes raíces');
      }

      const nuevasRaices = (estudiante.raices || 0) - cantidad;
      
      await updateDoc(estudianteRef, {
        raices: nuevasRaices
      });

      // Registrar el canje en el historial
      const canjes = estudiante.canjes || [];
      await updateDoc(estudianteRef, {
        canjes: [...canjes, {
          premio: 'Quita de raíces',
          valor: cantidad,
          fecha: new Date().toISOString()
        }]
      });

      // Actualizar el estado local
      const estudiantesActualizados = estudiantes.map(e => 
        e.id === estudianteId 
          ? { ...e, raices: nuevasRaices }
          : e
      );
      setEstudiantes(estudiantesActualizados);

      // Actualizar el estado agrupado por curso
      const nuevosEstudiantesPorCurso = { ...estudiantesPorCurso };
      Object.keys(nuevosEstudiantesPorCurso).forEach(curso => {
        nuevosEstudiantesPorCurso[curso] = nuevosEstudiantesPorCurso[curso].map(e =>
          e.id === estudianteId
            ? { ...e, raices: nuevasRaices }
            : e
        );
      });
      setEstudiantesPorCurso(nuevosEstudiantesPorCurso);

      console.log("ProfesorDashboard: Raíces quitadas con éxito");
    } catch (error) {
      console.error('ProfesorDashboard: Error al quitar raíces:', error);
      setError('Error al quitar raíces: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-yellow-400 text-xl">Cargando estudiantes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">
            {error.type === 'index' ? error.message : error.message}
          </div>
          {error.type === 'index' && error.link && (
            <a 
              href={error.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 underline"
            >
              Crear índice en Firestore
            </a>
          )}
        </div>
      </div>
    );
  }

  if (estudiantes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="titulo-principal text-center">Panel del Profesor</h1>
          <div className="card mt-8">
            <p className="text-gray-400 text-center">No hay estudiantes registrados</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="titulo-principal text-center mb-8">Panel del Profesor</h1>
        
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Controles globales */}
        <div className="card mb-8">
          <h2 className="card-titulo mb-4">Controles Globales</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCantidadRaices(Math.max(5, cantidadRaices - 5))}
              className="btn-secondary"
            >
              -
            </button>
            <span className="text-white font-bold">{cantidadRaices}</span>
            <button
              onClick={() => setCantidadRaices(cantidadRaices + 5)}
              className="btn-secondary"
            >
              +
            </button>
          </div>
        </div>

        {/* Lista de estudiantes agrupados por curso */}
        <div className="space-y-8">
          {Object.entries(estudiantesPorCurso).map(([curso, estudiantesDelCurso]) => (
            <div key={curso} className="card">
              <h2 className="card-titulo mb-4">Curso {curso}</h2>
              <div className="space-y-4">
                {estudiantesDelCurso.map(estudiante => (
                  <div key={estudiante.id} className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-yellow-400">{estudiante.nombre}</h3>
                        <p className="text-gray-400">{estudiante.curso}</p>
                        <p className="text-yellow-400 font-bold text-xl mt-2">
                          {estudiante.raices || 0} 🌱
                        </p>
                      </div>

                      <div className="mt-4 md:mt-0 space-y-4">
                        {/* Controles de raíces */}
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => agregarRaices(estudiante.id, cantidadRaices)}
                            className="btn-primary"
                          >
                            Agregar {cantidadRaices} Raíces
                          </button>
                        </div>

                        {/* Controles para quitar raíces */}
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => setCantidadQuitar(Math.max(1, cantidadQuitar - 1))}
                            className="btn-secondary"
                          >
                            -
                          </button>
                          <span className="text-white font-bold">{cantidadQuitar}</span>
                          <button
                            onClick={() => setCantidadQuitar(cantidadQuitar + 1)}
                            className="btn-secondary"
                          >
                            +
                          </button>
                          <button
                            onClick={() => quitarRaices(estudiante.id, cantidadQuitar)}
                            className="btn-danger"
                          >
                            Quitar {cantidadQuitar} Raíz{cantidadQuitar !== 1 ? 'es' : ''}
                          </button>
                        </div>

                        {/* Configuración de premio */}
                        <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                          <h3 className="titulo-terciario">Configurar Premio</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <input
                                type="text"
                                value={premioTipo}
                                onChange={(e) => setPremioTipo(e.target.value)}
                                placeholder="Tipo de premio"
                                className="input-field w-full"
                              />
                              <div className="mt-2 flex flex-wrap gap-2">
                                {sugerenciasPremios.map((sugerencia) => (
                                  <button
                                    key={sugerencia}
                                    onClick={() => setPremioTipo(sugerencia)}
                                    className="text-sm bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded-full"
                                  >
                                    {sugerencia}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <input
                                type="number"
                                value={premioValor}
                                onChange={(e) => setPremioValor(e.target.value)}
                                placeholder="Valor (raíces)"
                                min="1"
                                className="input-field w-full"
                              />
                            </div>
                          </div>

                          {premioTipo && premioValor && (
                            <div className="mt-4 flex space-x-4">
                              <button
                                onClick={() => actualizarPremio(estudiante.id)}
                                className="btn-secondary flex-1"
                                disabled={!premioTipo || !premioValor}
                              >
                                Agregar Premio
                              </button>
                              <button
                                onClick={() => canjearRaices(estudiante.id)}
                                className="btn-primary flex-1"
                                disabled={!premioTipo || !premioValor}
                              >
                                Canjear Raíces
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfesorDashboard; 