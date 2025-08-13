
const productDao = require('../dao/product.dao');
const APIFeatures = require('../utils/APIFeactures.util.js')
const fs = require('fs');
const path = require('path');
const { createError } = require('http-errors');
const { UPLOAD_DIR } = require('../utils/upload.util');

// Helper para limpiar archivos subidos en caso de error
const cleanUploadedFiles = (files) => {
  if (files && files.length > 0) {
    files.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error(`Error al eliminar archivo ${file.path}:`, err);
      }
    });
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    let productData = {
      name: req.body.name,
      description: req.body.description,
      isActive: req.body.isActive === 'true'
    };

    // Procesar imágenes si existen
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => ({
        path: file.path,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size
      }));
    } else if (req.body.images) {
      // Para JSON con URLs de imágenes existentes
      productData.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    // Validación mejorada
    if (!productData.name || !productData.description) {
      cleanUploadedFiles(req.files);
      throw createError(400, 'Nombre y descripción son requeridos');
    }

    // Validar longitud máxima
    if (productData.name.length > 100) {
      cleanUploadedFiles(req.files);
      throw createError(400, 'El nombre no puede exceder los 100 caracteres');
    }

    // Guardar en BD
    const newProduct = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: newProduct
    });

  } catch (error) {
    cleanUploadedFiles(req.files);
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const id = req.params.product_id;
    const productData = req.body;

    // Validación básica
    if (!productData || Object.keys(productData).length === 0) {
      throw createError(400, 'Datos de actualización requeridos');
    }

    const updatedProduct = await productDao.updateProduct(id, productData);

    if (!updatedProduct) {
      throw createError(404, 'Producto no encontrado');
    }

    res.status(200).json({
      success: true,
      data: {
        message: "Producto actualizado correctamente",
        product: updatedProduct
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const query = productDao.getAllProductsQuery();
    const features = new APIFeatures(query, req.query)
      .filter()
      .sort()
      .paginate();

    const products = await features.query;

    if (!products?.length) {
      return res.status(200).json({
        success: true,
        results: 0,
        message: 'No se encontraron productos',
        data: []
      });
    }

    res.status(200).json({
      success: true,
      results: products.length,
      data: products
    });

  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await productDao.getProductById(req.params.product_id);

    if (!product) {
      throw createError(404, 'Producto no encontrado');
    }

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.product_id;
    const deletedProduct = await productDao.deleteProduct(id);

    if (!deletedProduct) {
      throw createError(404, 'Producto no encontrado');
    }

    // Eliminar imágenes asociadas si existen
    if (deletedProduct.images && deletedProduct.images.length > 0) {
      deletedProduct.images.forEach(image => {
        const filePath = path.join(UPLOAD_DIR, image.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    res.status(200).json({
      success: true,
      message: "Producto eliminado correctamente"
    });

  } catch (error) {
    next(error);
  }
};

exports.uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw createError(400, 'No se subieron archivos');
    }

    const uploadedFiles = req.files.map(file => ({
      path: file.path,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/products/${file.filename}`
    }));

    res.status(200).json({
      success: true,
      data: uploadedFiles,
      message: "Imágenes subidas correctamente"
    });

  } catch (error) {
    cleanUploadedFiles(req.files);
    next(error);
  }
};