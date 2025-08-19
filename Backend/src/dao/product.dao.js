const Product = require('../models/Product.model.js');

exports.createProduct = async (productData) => {// Esta función recibe los datos del producto y lo crea en la base de datos

    try{
    return await Product.create(productData);
     res.status(201).json({ success:true, data:req.body, message: "Producto creado correctamente" }); // Respuesta exitosa al crear el producto
    } catch (error) {
        console.error("Error al subir el producto", error.message);
        throw error; // Propagar el error para manejarlo en el controlador
    }
};

exports.getProductById = async (id) => {// Esta función recibe el ID del producto y lo busca en la base de datos
    try {
        return await Product.findById(id)
    } 
    catch (error) {
        console.error("Error al obtener el producto por ID",  error.message);
    }
};

exports.getAllProductsQuery = () => {
    return Product.find(); // Devuelve la Query sin ejecutar
};

exports.getAllProducts = async () => {// Esta función obtiene todos los productos de la base de datos
    try {
        return await Product.find().exec();
    } catch (error) {
        console.error("Error al obtener todos los productos", error.message);
    }
};
exports.updateProduct = async (id, productData) => {
    try {
        // Validación básica del ID
        if (!id || typeof id !== 'string') {
            throw new Error('ID de producto inválido');
        }

        // Clonar los datos para no modificar el objeto original
        const updateData = { ...productData };

        // Si hay nuevas imágenes, procesarlas
        if (updateData.images && Array.isArray(updateData.images)) {
            // Mantener las imágenes existentes si no se especifica reemplazo
            if (!updateData.replaceImages) {
                const existingProduct = await Product.findById(id).select('images');
                if (existingProduct && existingProduct.images) {
                    updateData.images = [...existingProduct.images, ...updateData.images];
                }
            }
            
            // Limitar a 5 imágenes como máximo
            updateData.images = updateData.images.slice(0, 5);
        }

        // Actualizar el producto
        const updatedProduct = await Product.findByIdAndUpdate(
            id, 
            updateData, 
            { 
                new: true, 
                runValidators: true 
            }
        );

        if (!updatedProduct) {
            throw new Error('Producto no encontrado');
        }

        return updatedProduct;
        
    } catch (error) {
        console.error("Error al actualizar el producto:", error.message);
        throw error; // Propagar el error para manejarlo en el controlador
    }
};

exports.deleteProduct = async (id) => {// Esta función recibe el ID del producto y lo elimina de la base de datos
    try {
        return await Product.findByIdAndDelete(id);
    } catch (error) {
        console.error("Error al eliminar el producto", error.message);
        throw error; // Propagar el error para manejarlo en el controlador
    }   
};