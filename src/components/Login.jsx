import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase/config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import QRCode from 'qrcode.react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [curso, setCurso] = useState('');
  const [rol, setRol] = useState('estudiante');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const navigate = useNavigate();

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoPerfil(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setUploadProgress(0);
    
    console.log("Login: Iniciando proceso de", isRegistering ? "registro" : "inicio de sesión");
    console.log("Login: Datos del formulario:", { email, nombre, curso, rol });

    try {
      if (!isRegistering) {
        console.log("Login: Intentando iniciar sesión con:", email);
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          console.log("Login: Autenticación exitosa, obteniendo datos del usuario");
          
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("Login: Datos del usuario obtenidos:", userData);
            console.log("Login: Estado de verificación del email:", user.emailVerified);
            
            // Verificar si es profesor y su correo no está verificado
            if (userData.rol === 'profesor' && !user.emailVerified) {
              console.log("Login: Profesor con correo no verificado");
              setError('Por favor, verifica tu correo electrónico antes de iniciar sesión');
              await auth.signOut();
              return;
            }

            // Forzar la redirección después de un breve retraso
            setTimeout(() => {
              console.log("Login: Redirigiendo a:", userData.rol === 'profesor' ? '/profesor' : '/estudiante');
              if (userData.rol === 'profesor') {
                navigate('/profesor', { replace: true });
              } else {
                navigate('/estudiante', { replace: true });
              }
            }, 1000);
          } else {
            throw new Error('No se encontraron datos del usuario');
          }
        } catch (authError) {
          console.error("Login: Error en la autenticación:", authError);
          if (authError.code === 'auth/user-not-found') {
            setError('No existe una cuenta con este correo electrónico');
          } else if (authError.code === 'auth/wrong-password') {
            setError('Contraseña incorrecta');
          } else if (authError.code === 'auth/invalid-email') {
            setError('Correo electrónico inválido');
          } else if (authError.code === 'auth/too-many-requests') {
            setError('Demasiados intentos fallidos. Por favor, intenta más tarde.');
          } else {
            setError('Error al iniciar sesión: ' + authError.message);
          }
        }
      } else {
        console.log("Login: Iniciando registro de usuario");
        let fotoURL = null;
        
        if (fotoPerfil) {
          try {
            // Validar el tamaño y tipo de archivo
            if (fotoPerfil.size > 5 * 1024 * 1024) { // 5MB
              throw new Error('La imagen no debe superar los 5MB');
            }
            
            if (!fotoPerfil.type.startsWith('image/')) {
              throw new Error('El archivo debe ser una imagen');
            }

            // Subir foto a Storage
            console.log("Login: Subiendo foto a Storage");
            const fotoRef = ref(storage, `fotos/${Date.now()}_${fotoPerfil.name}`);
            console.log("Login: Referencia de Storage creada:", fotoRef);
            
            // Subir el archivo con metadata
            const metadata = {
              contentType: fotoPerfil.type,
              customMetadata: {
                'uploadedBy': 'user'
              }
            };
            
            const uploadResult = await uploadBytes(fotoRef, fotoPerfil, metadata);
            console.log("Login: Archivo subido exitosamente:", uploadResult);
            
            // Obtener la URL
            fotoURL = await getDownloadURL(fotoRef);
            console.log("Login: URL de la foto obtenida:", fotoURL);
          } catch (storageError) {
            console.error("Login: Error detallado al subir foto:", {
              code: storageError.code,
              message: storageError.message,
              serverResponse: storageError.serverResponse
            });
            
            if (storageError.code === 'storage/unauthorized') {
              setError('Error de autorización al subir la foto. Por favor, inicia sesión nuevamente.');
            } else if (storageError.code === 'storage/canceled') {
              setError('La subida de la foto fue cancelada.');
            } else if (storageError.code === 'storage/unknown') {
              setError('Error desconocido al subir la foto. Por favor, intenta nuevamente.');
            } else {
              setError('Error al subir la foto: ' + storageError.message);
            }
            
            // Continuar con el registro incluso si falla la subida de la foto
            console.log("Login: Continuando con el registro sin foto de perfil");
          }
        }

        try {
          // Crear usuario
          console.log("Login: Creando usuario con email:", email);
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          console.log("Login: Usuario creado exitosamente, UID:", user.uid);

          // Actualizar el perfil con el nombre
          await updateProfile(user, {
            displayName: nombre
          });

          // Si es profesor, enviar verificación de correo
          if (rol === 'profesor') {
            try {
              await sendEmailVerification(user);
              setVerificationSent(true);
              console.log("Login: Email de verificación enviado");
            } catch (verificationError) {
              console.error("Login: Error al enviar email de verificación:", verificationError);
              setVerificationError('Error al enviar el email de verificación. Por favor, intenta nuevamente.');
            }
          }

          // Guardar datos adicionales en Firestore
          const userData = {
            nombre,
            curso: rol === 'estudiante' ? curso : '',
            rol,
            raices: 0,
            premios: [],
            canjes: [],
            fotoURL,
            emailVerified: false,
            createdAt: new Date().toISOString()
          };
          console.log("Login: Intentando guardar datos en Firestore:", userData);
          
          // Intentar guardar los datos varias veces si es necesario
          let retryCount = 0;
          const maxRetries = 3;
          let success = false;
          
          while (retryCount < maxRetries && !success) {
            try {
              await setDoc(doc(db, 'users', user.uid), userData);
              console.log("Login: Datos guardados en Firestore exitosamente");
              success = true;
            } catch (firestoreError) {
              retryCount++;
              console.error(`Login: Intento ${retryCount} fallido:`, firestoreError);
              if (retryCount === maxRetries) {
                throw firestoreError;
              }
              // Esperar un momento antes de reintentar
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          if (success) {
            if (rol === 'profesor') {
              // No redirigir inmediatamente si es profesor
              setVerificationSent(true);
            } else {
              // Redirigir inmediatamente si es estudiante
              setTimeout(() => {
                navigate('/estudiante', { replace: true });
              }, 1000);
            }
          }
        } catch (authError) {
          console.error("Login: Error en la autenticación:", authError);
          if (authError.code === 'auth/email-already-in-use') {
            setError('Este correo electrónico ya está registrado. Por favor, inicie sesión.');
          } else if (authError.code === 'auth/invalid-email') {
            setError('Correo electrónico inválido.');
          } else if (authError.code === 'auth/operation-not-allowed') {
            setError('La autenticación por correo electrónico no está habilitada.');
          } else if (authError.code === 'auth/weak-password') {
            setError('La contraseña es demasiado débil.');
          } else if (authError.code === 'permission-denied') {
            setError('Error de permisos al guardar los datos. Por favor, contacta al administrador.');
          } else {
            setError('Error al registrar usuario: ' + authError.message);
          }
        }
      }
    } catch (error) {
      console.error('Login: Error general:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <div>
          <img
            className="mx-auto h-24 w-24 rounded-full"
            src="https://img.freepik.com/vector-gratis/arbol-raiz-verde_23-2147505463.jpg"
            alt="Logo"
          />
          <h2 className="titulo-principal text-center">
            {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
          <p className="text-gray-300 text-center">
            {isRegistering 
              ? 'Únete a nuestra comunidad educativa' 
              : 'Bienvenido de nuevo'}
          </p>
        </div>
        {verificationSent ? (
          <div className="text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Verificación de Correo Requerida</h2>
            <p className="text-gray-300 mb-4">
              Se ha enviado un correo de verificación a {email}. Por favor, verifica tu correo electrónico para completar el registro.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Si no recibes el correo, verifica tu carpeta de spam o solicita un nuevo correo de verificación.
            </p>
            <button
              onClick={() => {
                setVerificationSent(false);
                setIsRegistering(false);
              }}
              className="text-yellow-400 hover:text-yellow-300"
            >
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {isRegistering && (
              <>
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    className="input-field w-full"
                    placeholder="Nombre completo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="rol">
                    Rol
                  </label>
                  <select
                    id="rol"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Selecciona un rol</option>
                    <option value="profesor">Profesor</option>
                    <option value="estudiante">Estudiante</option>
                  </select>
                </div>

                {rol === 'estudiante' && (
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="curso">
                      Curso
                    </label>
                    <input
                      type="text"
                      id="curso"
                      value={curso}
                      onChange={(e) => setCurso(e.target.value)}
                      className="input-field"
                      required={rol === 'estudiante'}
                      placeholder="Ej: 1A, 2B, etc."
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="foto" className="block text-sm font-medium text-gray-300 mb-1">Foto de Perfil</label>
                  <div className="mt-1 flex items-center space-x-4">
                    {fotoPreview && (
                      <img
                        src={fotoPreview}
                        alt="Preview"
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    )}
                    <input
                      id="foto"
                      name="foto"
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="input-field w-full"
                    />
                  </div>
                </div>
              </>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field w-full"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field w-full"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                className="btn-primary w-full"
              >
                {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                className="text-yellow-400 hover:text-yellow-300"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering 
                  ? '¿Ya tienes cuenta? Inicia sesión' 
                  : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>
          </form>
        )}

        {verificationError && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mt-4">
            {verificationError}
          </div>
        )}

        {!isRegistering && (
          <div className="mt-6 text-center">
            <p className="mb-2">Escanea el código QR para acceder:</p>
            <QRCode value={window.location.href} size={128} />
          </div>
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="mt-4 text-yellow-400">
                {uploadProgress > 0 ? `Subiendo foto: ${Math.round(uploadProgress)}%` : 'Procesando...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login; 