const productDao = require('../dao/product.dao.js');
exports.createProduct = (req, res) => {
    const productData = req.body; // Obtiene los datos del producto del cuerpo de la solicitud
    try {

        productDao.createProduct(productData);
        console.log(`Producto creado con el id:, ${product._id}`); // Imprime el resultado de la creación del producto en la consola
        return productDao.createProduct(req.body) // Llama a la función del DAO para crear el producto
            .then(product => {
                res.status(201)
                .json({ 
                    success: true,
                    data: product,
                    message: "Producto creado correctamente"
                }); // Respuesta exitosa al crear el producto
            })
            .catch(error => {
                console.error("Error al crear el producto:", error.message);
                res.status(500).json({ success: false, error: error.message, message: "Error al crear el producto" }); // Respuesta de error al crear el producto
            });
            
    } catch (error) {
        console.error("Error al crear el producto:", error.message);
        res.status(500).json({ success: false, error:error.message, message: "Error al crear el producto" }); // Respuesta de error al crear el producto
    }
}
exports.updateProduct = (req, res) => {// Esta función recibe el ID del producto, los nuevos datos del producto y el ID del usuario que lo actualiza
    const id = req.params.product_id; // El ID del producto viene de los parámetros de la URL
    const productData = req.body; // Los nuevos datos vienen del cuerpo de la solicitud

    try {
        // Llama a la función del DAO para actualizar el producto
        return productDao.updateProduct(id, productData) 
            .then(product => {
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: 'Producto no encontrado'
                    });
                }

                console.log(`✅ Producto actualizado con el id: ${id}`); // Imprime el resultado en consola
                res.status(200)
                .json({ 
                    success: true, 
                    data: { 
                        message: "Producto actualizado correctamente",
                        product: product
                    }
                }); // Respuesta exitosa al actualizar el producto
            })
            .catch(error => { 
                console.error("Error al actualizar el producto:", error.message);
                res.status(500).json({ 
                    success: false, 
                    error: error.message, 
                    message: "Error al actualizar el producto" 
                });
            });

    } catch (error) {
        console.error("Error inesperado al actualizar el producto:", error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message, 
            message: "Error inesperado al actualizar el producto" 
        });
    }
};

exports.getAllProducts = (req,res) => {// Esta función obtiene todos los productos de la base de datos
    try{
    return  productDao.getAllProducts() // Llama a la función del DAO para obtener todos los productos
    .then(products => {
        if (!products || products.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontraron productos' });
        }
        console.log(`✅ Productos obtenidos correctamente`);
        res.status(200).json({ success: true, data: products }); // Respuesta exitosa al obtener los productos
    })
    .catch(error => {
        console.error("Error al obtener los productos:", error.message);
        res.status(500).json({ success: false, error: error.message, message: "Error al obtener los productos" }); // Respuesta de error al obtener los productos
    });
}catch (error) {
        console.error("Error inesperado al obtener los productos:", error.message);
        res.status(500).json({ success: false, error: error.message, message: "Error inesperado al obtener los productos" }); // Respuesta de error inesperado al obtener los productos
    }
}

exports.deleteProduct = (req, res) => { // Esta función recibe el ID del producto y lo elimina de la base de datos
    // Elimina un producto de la base de datos
    const id = req.params.product_id; // El ID del producto viene de los parámetros de la URL

    try {
        // Llama a la función del DAO para eliminar el producto
        return productDao.deleteProduct(id)
            .then(deleted => {
                if (!deleted) {
                    return res.status(404).json({
                        success: false,
                        message: 'Producto no encontrado'
                    });
                }

                console.log(`Producto eliminado con el id: ${id}`); // Imprime el resultado en consola
                res.status(200).json({
                    success: true,
                    message: "Producto eliminado correctamente"
                });
            })
            .catch(error => {
                console.error("Error al eliminar el producto:", error.message);
                res.status(500).json({
                    success: false,
                    error: error.message,
                    message: "Error al eliminar el producto"
                });
            });
    } catch (error) {
        console.error("Error inesperado al eliminar el producto:", error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Error inesperado al eliminar el producto"
        });
    }
}