import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';  // Importar Firebase

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await redirectBasedOnRole(user.uid);  // Redirige según el rol
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
        }
    };

    const redirectBasedOnRole = async (userId) => {
        const role = await checkUserRole(userId);
        if (role === 'student') {
            navigate('/student-dashboard'); // Redirige a la página de estudiante
        } else if (role === 'professor') {
            navigate('/professor-dashboard'); // Redirige a la página de profesor
        }
    };

    const checkUserRole = async (userId) => {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            return userDoc.data().role;  // Retorna el rol (student o professor)
        }
        return null;
    };

    return (
        <form onSubmit={handleLogin}>
            <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            <button type="submit">Login</button>
        </form>
    );
};

export default Login;




