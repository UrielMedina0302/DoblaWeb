//En este apartado se configura Express y se definen las rutas de la aplicación
require('dotenv').config(); // Cargar las variables de entorno desde el archivo .env
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const productRouter = require('./routes/product.route.js'); // Importar las rutas de productos
const userRouter = require('./routes/user.route.js'); // Importar las rutas de usuarios
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
app.use(express.json()) ; // Parsear el cuerpo de las solicitudes para que pueda entender JSON
app.use(express.urlencoded({ extended: true })); // Parsear datos URL-encoded
app.use(morgan('dev')); // Registrar las solicitudes HTTP en la consola
// Importar las rutas de productos
app.use('/api/product', productRouter); // Usar las rutas de productos bajo el prefijo /api/products
app.use('/api/user', userRouter); // Usar las rutas de usuarios bajo el prefijo /api/users

app.listen(app.get('port'), () => { // Iniciar el servidor en el puerto configurado
    console.log(`Server running on port ${app.get('port')}`); // Mensaje en la consola indicando que el servidor está corriendo
});
// Exportar la aplicación para usarla en otros archivos
module.exports = app; // Exportar la instancia de Express para usarla en el servidor 