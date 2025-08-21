//En esta sección se configura como Punto de entrada de la aplicación, se define el puerto y se inicia el servidor

const connectDB = require('./Database'); // Importar la función para poder conectar de manera correcta a la base de datos
const server = require('./server'); // Importar las funciones declaradas en app.js para poder hacer uso de ellas

app.listen(app.get('port'),()=>console.log("server listening on port 3000"));//escucha el servidor peticiones HTTP en el puerto especifico. 