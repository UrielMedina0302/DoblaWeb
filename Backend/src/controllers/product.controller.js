const productDao = require('../dao/product.dao.js');
const APIFeatures = require('../utils/APIFeactures.util.js');
const upload = require('../utils/upload.util.js');

exports.createProduct = (req, res) => {
    try {
        // Combina los datos del body con el usuario autenticado
        const productData = {
            ...req.body,
            user: req.user.id, // Asignamos el usuario que crea el producto
            images: req.files?.map(file => file.path) // Si usas Multer para subir imágenes
        };

        return productDao.createProduct(productData)
            .then(product => {
                console.log(`Producto creado con el id: ${product._id}`);
                res.status(201).json({ 
                    success: true,
                    data: product,
                    message: "Producto creado correctamente"
                });
            })
            .catch(error => {
                console.error("Error al crear el producto:", error.message);
                res.status(500).json({ 
                    success: false, 
                    error: error.message, 
                    message: "Error al crear el producto" 
                });
            });
            
    } catch (error) {
        console.error("Error inesperado al crear el producto:", error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message, 
            message: "Error inesperado al crear el producto" 
        });
    }
};

exports.updateProduct = (req, res) => {
    const id = req.params.product_id;
    const productData = req.body;

    try {
        return productDao.updateProduct(id, productData) 
            .then(product => {
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: 'Producto no encontrado'
                    });
                }

                console.log(`✅ Producto actualizado con el id: ${id}`);
                res.status(200).json({ 
                    success: true, 
                    data: { 
                        message: "Producto actualizado correctamente",
                        product: product
                    }
                });
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

exports.getAllProducts = (req, res) => {
    try {
        const features = new APIFeatures(productDao.getAllProducts(), req.query)
            .filter()
            .sort()
            .paginate();

        return features.query
            .then(products => {
                if (!products || products.length === 0) {
                    return res.status(404).json({ 
                        success: false, 
                        message: 'No se encontraron productos' 
                    });
                }
                console.log(`✅ Productos obtenidos correctamente`);
                res.status(200).json({ 
                    success: true, 
                    results: products.length,
                    data: products 
                });
            })
            .catch(error => {
                console.error("Error al obtener los productos:", error.message);
                res.status(500).json({ 
                    success: false, 
                    error: error.message, 
                    message: "Error al obtener los productos" 
                });
            });
    } catch (error) {
        console.error("Error inesperado al obtener los productos:", error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message, 
            message: "Error inesperado al obtener los productos" 
        });
    }
};

exports.deleteProduct = (req, res) => {
    const id = req.params.product_id;

    try {
        return productDao.deleteProduct(id)
            .then(deleted => {
                if (!deleted) {
                    return res.status(404).json({
                        success: false,
                        message: 'Producto no encontrado'
                    });
                }

                console.log(`Producto eliminado con el id: ${id}`);
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
};

// Opcional: Endpoint para subir imágenes
exports.uploadProductImages = (req, res) => {
    try {
        const uploadMiddleware = upload.array('images', 5); // Máximo 5 imágenes
        
        uploadMiddleware(req, res, (error) => {
            if (error) {
                console.error("Error al subir imágenes:", error.message);
                return res.status(400).json({
                    success: false,
                    error: error.message,
                    message: "Error al subir imágenes"
                });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No se subieron archivos"
                });
            }

            const filePaths = req.files.map(file => file.path);
            res.status(200).json({
                success: true,
                data: filePaths,
                message: "Imágenes subidas correctamente"
            });
        });
    } catch (error) {
        console.error("Error inesperado al subir imágenes:", error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Error inesperado al subir imágenes"
        });
    }
};