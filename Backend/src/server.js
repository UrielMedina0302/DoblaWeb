//En este apartado se configura Express y se definen las rutas de la aplicación
require('dotenv').config(); // Cargar las variables de entorno desde el archivo .env
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./Database'); // Importar la función para conectar a la base de datos
connectDB(); // Llamar a la función para conectar a la base de datos
// Importar las dependencias necesarias para la aplicación Express
const app = express(); // Crear una instancia de Express
//Settings
app.set('port', process.env.PORT || 3000); // Configurar el puerto de la aplicación, usando una variable de entorno o el puerto 3000 por defecto
// app.set('view engine', 'ejs'); // Configurar el motor de plantillas EJS para renderizar vistas
//Middleware para el mejor manejo de express
app.use(cors()); // Habilitación CORS para todas las rutas
app.use(helmet()); // Proteger la aplicación con Helmet
app.use(express.json()); // Parsear el cuerpo de las solicitudes para que pueda entender JSON
app.use(express.urlencoded({ extended: true })); // Parsear datos URL-encoded
app.use(morgan('dev')); // Registrar las solicitudes HTTP en la consola


 

// Exportar la aplicación para usarla en otros archivos
module.exports = app; // Exportar la instancia de Express para usarla en el servidor 