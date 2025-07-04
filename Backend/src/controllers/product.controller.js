const productDao = require('../dao/product.dao.js');
exports.createProduct = async (productData, userId) => {
    productData.createdBy = userId; // Asignar el ID del usuario que creó/añadio el producto
    try {
        return await productDao.createProduct(productData);
        res.status(201).json({ success:true, data:req.body, message: "Producto creado correctamente" }); // Respuesta exitosa al crear el producto
    } catch (error) {
        console.error("Error al crear el producto:", error.message);
        res.status(500).json({ success: false, error:error.message, message: "Error al crear el producto" }); // Respuesta de error al crear el producto
    }
}
exports.updateProduct = async (productId, productData, userId) => {// Esta función recibe el ID del producto, los nuevos datos del producto y el ID del usuario que lo actualiza
    return await productDao.updateProduct(productId, productData, userId); // Llama a la función del DAO para actualizar el producto

};

exports.getAllProducts = async () => {// Esta función obtiene todos los productos de la base de datos
    return await productDao.getAllProducts(); // Llama a la función del DAO para obtener todos los productos
}