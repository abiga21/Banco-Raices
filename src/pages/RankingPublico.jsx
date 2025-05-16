import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const RankingPublico = () => {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const fetchRanking = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const estudiantes = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.rol === 'estudiante') {
          estudiantes.push({ id: doc.id, ...data });
        }
      });

      estudiantes.sort((a, b) => b.raices - a.raices);
      setRanking(estudiantes);
    };

    fetchRanking();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-yellow-400">🏆 Ranking de Estudiantes</h1>
      <div className="max-w-2xl mx-auto space-y-4">
        {ranking.map((estudiante, index) => (
          <div key={estudiante.id} className="bg-gray-800 p-4 rounded-xl flex items-center space-x-4 border border-yellow-600">
            <span className="text-2xl font-bold text-yellow-400">{index + 1}°</span>
            <div className="flex-1">
              <p className="text-lg font-semibold">{estudiante.nombre}</p>
              <p className="text-sm text-gray-400">Curso: {estudiante.curso}</p>
            </div>
            <span className="text-xl font-bold text-green-400">{estudiante.raices} 🌱</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingPublico;
