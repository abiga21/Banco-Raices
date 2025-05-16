import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import EstudianteDashboard from "./components/EstudianteDashboard";
import ProfesorDashboard from "./components/ProfesorDashboard";
import RankingPublico from './pages/RankingPublico'; 

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("App: Iniciando verificación de autenticación");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("App: Estado de autenticación cambiado:", user ? "Usuario autenticado" : "Usuario no autenticado");
      
      try {
        if (user) {
          console.log("App: Usuario autenticado, verificando datos en Firestore");
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("App: Datos del usuario obtenidos:", userData);
            console.log("App: Estado de verificación del email:", user.emailVerified);
            
            // Actualizar el estado de verificación en Firestore si es necesario
            if (user.emailVerified !== userData.emailVerified) {
              console.log("App: Actualizando estado de verificación en Firestore");
              await updateDoc(doc(db, 'users', user.uid), {
                emailVerified: user.emailVerified
              });
            }

            // Verificar si es profesor y su correo no está verificado
            if (userData.rol === 'profesor' && !user.emailVerified) {
              console.log("App: Profesor con correo no verificado, cerrando sesión");
              await auth.signOut();
              setUser(null);
              setUserRole(null);
            } else {
              console.log("App: Usuario verificado, estableciendo estado");
              setUser(user);
              setUserRole(userData.rol);
            }
          } else {
            console.log("App: No se encontraron datos del usuario en Firestore");
            setUser(null);
            setUserRole(null);
          }
        } else {
          console.log("App: No hay usuario autenticado");
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error("App: Error en el proceso de autenticación:", error);
        setUser(null);
        setUserRole(null);
      } finally {
        console.log("App: Finalizando proceso de autenticación");
        setLoading(false);
      }
    });

    return () => {
      console.log("App: Limpiando suscripción de autenticación");
      unsubscribe();
    };
  }, []);

  if (loading) {
    console.log("App: Mostrando pantalla de carga");
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-yellow-400 text-xl">Cargando...</div>
      </div>
    );
  }

  console.log("App: Renderizando con estado:", { user: !!user, userRole, loading });

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        {user && <Navbar />}
        <Routes>
          <Route 
            path="/" 
            element={
              !user ? (
                <Login />
              ) : (
                <Navigate to={userRole === 'profesor' ? '/profesor' : '/estudiante'} />
              )
            } 
          />
          <Route 
            path="/login" 
            element={
              !user ? (
                <Login />
              ) : (
                <Navigate to={userRole === 'profesor' ? '/profesor' : '/estudiante'} />
              )
            } 
          />
          <Route 
            path="/profesor" 
            element={
              user && userRole === 'profesor' && user.emailVerified ? (
                <ProfesorDashboard />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/estudiante" 
            element={
              user && userRole === 'estudiante' ? (
                <EstudianteDashboard />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route path="/ranking" element={<RankingPublico />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;




