const User = require('../models/User.model.js'); // Importa el modelo de usuario

exports.createUser = async (userData) => { // Esta función recibe los datos del usuario y lo crea en la base de datos
    try {
        return await User.create(userData); // Crea un nuevo usuario con los datos proporcionados
        res.status(201).json({ success: true, data: userData, message: "Usuario creado correctamente" }); // Respuesta exitosa al crear el usuario
    } catch (error) {
        console.error("Error al crear el usuario", error.message); // Imprime el error en la consola
        throw error; // Propaga el error para manejarlo en el controlador
    }   
};

exports.getUserById = async (id) => { // Esta función recibe el ID del usuario y lo busca en la base de datos
    try {
        return await User.findById(id); // Busca el usuario por su ID
        res.status(200)
        .json({ 
            success: true, 
            data: 
            User, 
            message: "Usuario encontrado correctamente" }); // Respuesta exitosa al encontrar el usuario
    } catch (error) {
        console.error("Error al obtener el usuario por ID", error.message); // Imprime el error en la consola
        throw error; // Propaga el error para manejarlo en el controlador
    }
};
exports.getAllUsers = async () => { // Esta función obtiene todos los usuarios de la base de datos
    try {
        return await User.find(); // Devuelve todos los usuarios
        res.status(200)
        .json({
            success: true, 
            data: User, 
            message: "Usuarios obtenidos correctamente"
         }); // Respuesta exitosa al obtener todos los usuarios

    } catch (error) {
        console.error("Error al obtener todos los usuarios", error.message); // Imprime el error en la consola
        throw error; // Propaga el error para manejarlo en el controlador
    }
};
exports.updateUser = async (id, userData) => { // Esta función recibe el ID del usuario y los nuevos datos del usuario y lo actualiza en la base de datos
    try {
        return await User.findByIdAndUpdate(id, userData, { new: true, runValidators: true }); // Actualiza el usuario con los nuevos datos
        res.status(200)
        .json({
            success: true, 
            data: userData, 
            message: "Usuario actualizado correctamente"
        }); // Respuesta exitosa al actualizar el usuario
    } catch (error) {
        console.error("Error al actualizar el usuario", error.message); // Imprime el error en la consola
        throw error; // Propaga el error para manejarlo en el controlador
    }
};
exports.deleteUser = async (id) => { // Esta función recibe el ID del usuario y lo elimina de la base de datos
    try {
        return await User.findByIdAndDelete(id); // Elimina el usuario por su ID
        res.status(200)
        .json({
            success: true, 
            message: "Usuario eliminado correctamente"
        }); // Respuesta exitosa al eliminar el usuario
    } catch (error) {
        console.error("Error al eliminar el usuario", error.message); // Imprime el error en la consola
        throw error; // Propaga el error para manejarlo en el controlador
    }
};
