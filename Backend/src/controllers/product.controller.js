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

// controllers/product.controller.js
exports.createProduct = async (req, res, next) => {
  try {
    console.log('Body recibido:', req.body);
    console.log('Archivos recibidos:', req.files);

    const { name, description } = req.body;

    if (!name || !description) {
      // Limpiar archivos subidos si hay error de validación
      if (req.files && req.files.length > 0) {
        cleanUploadedFiles(req.files);
      }
      return res.status(400).json({ 
        message: 'Faltan datos obligatorios: nombre y descripción son requeridos' 
      });
    }

    // Procesar imágenes si hay archivos
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        url: `${baseUrl}/api/product/image/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      }));
      console.log('Imágenes procesadas:', images);
    }

    const newProduct = {
      name,
      description,
      images,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Guardar en la base de datos (debes implementar productDao.createProduct)
    const createdProduct = await productDao.createProduct(newProduct);

    res.status(201).json({ 
      message: 'Producto creado exitosamente', 
      data: createdProduct 
    });
  } catch (error) {
    console.error('Error en createProduct:', error);
    // Limpiar archivos subidos en caso de error
    if (req.files && req.files.length > 0) {
      cleanUploadedFiles(req.files);
    }
    res.status(500).json({ message: 'Error interno del servidor al crear producto' });
  }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const id = req.params.product_id;
        
        // Validación básica
        if (!req.body || Object.keys(req.body).length === 0) {
            throw createError(400, 'Datos de actualización requeridos');
        }

        // Preparar datos de actualización
        const updateData = { ...req.body };

        // Procesar imágenes si hay archivos nuevos
        if (req.files && req.files.length > 0) {
          const uploadedFiles = req.files.map(file => ({
            filename: file.filename,
            originalname: file.originalname,
            path: file.path,
            url: `${baseUrl}/api/product/image/${file.filename}`,
            size: file.size,
            mimetype: file.mimetype
          }));
          
          // Si ya hay imágenes, agregar las nuevas, sino crear el array
          if (updateData.images && Array.isArray(updateData.images)) {
            updateData.images = [...updateData.images, ...uploadedFiles];
          } else {
            updateData.images = uploadedFiles;
          }
        }

        // Actualizar el producto en la base de datos
        const updatedProduct = await productDao.updateProduct(id, updateData);

        if (!updatedProduct) {
            throw createError(404, 'Producto no encontrado');
        }

        res.status(200).json({
            success: true,
            data: updatedProduct
        });

    } catch (error) {
        // Limpiar archivos subidos en caso de error
        if (req.files && req.files.length > 0) {
            cleanUploadedFiles(req.files);
        }
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