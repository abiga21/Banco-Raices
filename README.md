# Banco de Raíces

Aplicación web para gestionar un sistema de recompensas para estudiantes.

## Características

- Autenticación de usuarios (profesores y estudiantes)
- Gestión de raíces (moneda virtual) para estudiantes
- Premios personalizables
- Sistema de canje de raíces
- Ranking de estudiantes
- Historial de canjes
- Código QR para acceso rápido

## Tecnologías utilizadas

- React
- Vite
- Firebase (Autenticación y Firestore)
- Tailwind CSS
- React Router

## Configuración

1. Clona este repositorio
2. Instala las dependencias con `npm install`
3. Configura Firebase:
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilita la autenticación por correo electrónico/contraseña
   - Crea una base de datos en Firestore
   - Obtén las credenciales de configuración y actualiza el archivo `src/firebase/config.js`
4. Inicia la aplicación con `npm run dev`

## Estructura del proyecto

- `src/components/`: Componentes de React
- `src/firebase/`: Configuración de Firebase
- `public/`: Archivos estáticos

## Licencia

MIT 