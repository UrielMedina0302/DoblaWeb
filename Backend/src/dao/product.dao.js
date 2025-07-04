const Product = require('../models/Product.model.js');

exports.createProduct = async (productData) => {// Esta función recibe los datos del producto y lo crea en la base de datos

    try{
    return await Product.create(productData);
    } catch (error) {
        console.error("Error al subir el producto", error.message);
        throw error; // Propagar el error para manejarlo en el controlador
    }
};

exports.getProductById = async (productId) => {// Esta función recibe el ID del producto y lo busca en la base de datos
    try {
        return await Product.findById(productId).populate('createdBy','email'); // Utiliza populate para obtener el email del usuario que creó el producto
    } catch (error) {
        console.error("Error al obtener el producto por ID",  error.message);
    }
};
exports.getAllProducts = async () => {// Esta función obtiene todos los productos de la base de datos
    try {
        return await Product.find().populate('createdBy','email'); // Utiliza populate para obtener el email del usuario que creó el producto
    } catch (error) {
        console.error("Error al obtener todos los productos", error.message);
    }
};
exports.updateProduct = async (productId, productData) => {// Esta función recibe el ID del producto y los nuevos datos del producto y lo actualiza en la base de datos
    try {
        return await Product.findByIdAndUpdate(productId, productData, { new: true });
    } catch (error) {
        console.error("Error al actualizar el producto", error.message);
        throw error; // Propagar el error para manejarlo en el controlador
    }
};

exports.deleteProduct = async (productId) => {// Esta función recibe el ID del producto y lo elimina de la base de datos
    try {
        return await Product.findByIdAndDelete(productId);
    } catch (error) {
        console.error("Error al eliminar el producto", error.message);
        throw error; // Propagar el error para manejarlo en el controlador
    }   
};
