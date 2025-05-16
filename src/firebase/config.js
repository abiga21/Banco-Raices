// Importaciones
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCL-avaF_XLoKDj5OxdAOssujR3rlQwQ10",
    authDomain: "bancoraicesv1.firebaseapp.com",
    databaseURL: "https://bancoraicesv1-default-rtdb.firebaseio.com",
    projectId: "bancoraicesv1",
    storageBucket: "bancoraicesv1.firebasestorage.app",
    messagingSenderId: "430036480793",
    appId: "1:430036480793:web:20ef00e469c9be3fd74b88"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Exportar las instancias
export { app, auth, db, storage };