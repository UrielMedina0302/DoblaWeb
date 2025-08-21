const userDao = require('../dao/user.dao'); // Importa el DAO de usuario para interactuar con la base de datos
exports.createUser = (req, res) => { // Esta función recibe los datos del usuario y lo crea en la base de datos
    const userData = req.body; // Obtiene los datos del usuario del cuerpo de la solicitud
    try {
        then(user => {
            console.log(`Usuario creado con el id: ${user._id}`);
            res.status(201).json({ success: true, data: user, message: "Usuario creado correctamente" });
        })
        .catch(error => {
            console.error("Error al crear el usuario:", error.message);
            res.status(500).json({ success: false, error: error.message, message: "Error al crear el usuario" });
        })
     } catch (error) {
        console.error("Error al crear el usuario:", error.message);
        res.status(500).json({ success: false, error: error.message, message: "Error al crear el usuario" }); // Respuesta de error al crear el usuario
    }
};
exports.getUserById = (req, res) => { // Esta función recibe el ID del usuario y lo busca en la base de datos
    const id = req.params.user_id; // El ID del usuario viene de los parámetros de la URL
    try {
        userDao.getUserById(id); // Llama a la función del DAO para obtener el usuario por ID
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' }); // Respuesta si el usuario no existe
            console.log(`Usuarios no encontrados `); // Imprime el resultado en consola
        }
        res.status(200).json({ success: true, data: User, message: "Usuario encontrado correctamente" }); // Respuesta exitosa al encontrar el usuario
    } catch (error) {
        console.error("Error al obtener el usuario por ID:", error.message);
        res.status(500).json({ success: false, error: error.message, message: "Error al obtener el usuario por ID" }); // Respuesta de error al obtener el usuario por ID
    }
};
exports.getAllUsers = (req, res) => {
    try{
    userDao.getAllUsers()
        .then(users => {
            if (!users || users.length === 0) {
                console.log("No hay usuarios registrados");
                return res.status(404).json({ success: false, message: 'No hay usuarios registrados' });
            }
            res.status(200).json({ success: true, data: users, message: "Usuarios obtenidos correctamente" });
        })
        .catch(error => {
            console.error("Error al obtener los usuarios:", error.message);
            res.status(500).json({ success: false, error: error.message, message: "Error al obtener los usuarios" });
        })
    } catch (error) {
        console.error("Error al obtener todos los usuarios:", error.message);
    }
};
exports.updateUser = (req, res) => { // Esta función recibe el ID del usuario y los nuevos datos del usuario y lo actualiza en la base de datos
    const id = req.params.user_id; // El ID del usuario viene de los parámetros de la URL
    const userData = req.body; // Los nuevos datos vienen del cuerpo de la solicitud
    try {
        userDao.updateUser(id, userData)
        .then(user => {
            if (!user) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }
            console.log(`Usuario actualizado con el id: ${id}`);
            res.status(200).json({ success: true, data: user, message: "Usuario actualizado correctamente" });
        })
        .catch(error => {
            console.error("Error al actualizar el usuario:", error.message);
            res.status(500).json({ success: false, error: error.message, message: "Error al actualizar el usuario" });
        })
    } catch (error) {
        console.error("Error al actualizar el usuario:", error.message);
    }};

exports.deleteUser =(req, res) => { // Esta función recibe el ID del usuario y lo elimina de la base de datos
    const id = req.params.user_id; // El ID del usuario viene de los parámetros de la URL
    try {
        userDao.deleteUser(id) // Llama a la función del DAO para eliminar el usuario
        .then(user => {
            if (!user) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }
            res.status(200).json({ success: true, message: "Usuario eliminado correctamente" });
        })
        .catch(error => {
            console.error("Error al eliminar el usuario:", error.message);
            res.status(500).json({ success: false, error: error.message, message: "Error al eliminar el usuario" });
        })
    } catch (error) {
        console.error("Error al eliminar el usuario:", error.message);
        res.status(500).json({ success: false, error: error.message, message: "Error al eliminar el usuario" }); // Respuesta de error al eliminar el usuario
    }
};
