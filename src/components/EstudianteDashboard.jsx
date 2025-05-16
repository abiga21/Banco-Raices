import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const EstudianteDashboard = () => {
  const [estudianteData, setEstudianteData] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        console.log("EstudianteDashboard: Iniciando carga de datos");
        
        // Cargar datos del estudiante actual
        console.log("EstudianteDashboard: Cargando datos del estudiante actual:", auth.currentUser?.uid);
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log("EstudianteDashboard: Datos del estudiante cargados:", data);
          setEstudianteData(data);
        } else {
          console.error("EstudianteDashboard: No se encontraron datos del estudiante");
          setError("No se encontraron datos del estudiante");
        }

        // Cargar ranking de estudiantes
        console.log("EstudianteDashboard: Iniciando carga del ranking");
        const estudiantesRef = collection(db, 'users');
        const q = query(
          estudiantesRef,
          where('rol', '==', 'estudiante'),
          orderBy('raices', 'desc'),
          limit(10)
        );
        
        console.log("EstudianteDashboard: Ejecutando consulta del ranking");
        const querySnapshot = await getDocs(q);
        console.log("EstudianteDashboard: Número de estudiantes encontrados:", querySnapshot.size);
        
        const rankingData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("EstudianteDashboard: Datos del estudiante en ranking:", {
            id: doc.id,
            nombre: data.nombre,
            raices: data.raices
          });
          return {
            id: doc.id,
            ...data
          };
        });
        
        console.log("EstudianteDashboard: Ranking cargado:", rankingData);
        setRanking(rankingData);
      } catch (error) {
        console.error('EstudianteDashboard: Error al cargar datos:', error);
        if (error.message.includes('requires an index')) {
          // Extraer el enlace del índice del mensaje de error
          const indexLinkMatch = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
          const indexLink = indexLinkMatch ? indexLinkMatch[0] : null;
          
          setError({
            type: 'index',
            message: 'Se requiere crear un índice en Firestore para mostrar el ranking. Por favor, haz clic en el enlace para crearlo.',
            link: indexLink
          });
        } else {
          setError({
            type: 'general',
            message: error.message
          });
        }
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-yellow-400 text-xl">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Error: {error.message}</div>
          {error.type === 'index' && (
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

  if (!estudianteData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-yellow-400 text-xl">No se encontraron datos del estudiante</div>
      </div>
    );
  }

  const primerLugar = ranking[0];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="titulo-principal mb-8">Dashboard del Estudiante</h1>
        
        {/* Sección de Perfil */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
              <img 
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FCD34D'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E"
                alt="Foto por defecto"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-yellow-400">{estudianteData?.nombre}</h2>
              <p className="text-gray-400">{estudianteData?.curso}</p>
            </div>
          </div>
        </div>

        {/* Destacado del primer lugar */}
        {primerLugar && (
          <div className="bg-yellow-900/30 p-6 rounded-xl border border-yellow-700/50 mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                <img 
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FCD34D'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E"
                  alt="Foto por defecto"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{primerLugar.nombre}</div>
                <div className="text-lg text-gray-400">{primerLugar.curso}</div>
                <div className="text-3xl font-bold text-yellow-500">{primerLugar.raices} raíces</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información del estudiante */}
          <div className="card">
            <h2 className="card-titulo">Mis Raíces</h2>
            <div className="text-4xl font-bold text-yellow-400 mb-4">
              {estudianteData?.raices || 0} 🌱
            </div>
            
            <h3 className="titulo-terciario">Premios Disponibles</h3>
            {estudianteData?.premios?.length > 0 ? (
              <ul className="space-y-2">
                {estudianteData.premios.map((premio, index) => (
                  <li key={index} className="text-gray-300">
                    {premio.tipo} - {premio.valor} raíces
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No hay premios disponibles</p>
            )}
          </div>

          {/* Ranking */}
          <div className="card">
            <h2 className="card-titulo">Ranking de Estudiantes</h2>
            <div className="space-y-4">
              {ranking.map((estudiante, index) => (
                <div
                  key={estudiante.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    estudiante.id === auth.currentUser.uid
                      ? 'bg-yellow-500/20 border border-yellow-500/50'
                      : 'bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                      <img 
                        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FCD34D'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E"
                        alt="Foto por defecto"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-yellow-400">{estudiante.nombre}</div>
                      <div className="text-sm text-gray-400">{estudiante.curso}</div>
                    </div>
                  </div>
                  <div className="text-yellow-400 font-bold">
                    {estudiante.raices} 🌱
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Historial de canjes */}
        <div className="card mt-8">
          <h2 className="card-titulo">Historial de Canjes</h2>
          {estudianteData?.canjes?.length > 0 ? (
            <div className="space-y-4">
              {estudianteData.canjes.map((canje, index) => (
                <div
                  key={index}
                  className="bg-gray-700/50 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white">{canje.premio}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(canje.fecha).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-yellow-400 font-bold">
                      -{canje.valor} 🌱
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No hay canjes registrados</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstudianteDashboard;