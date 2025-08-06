const multer = require('multer');
const path = require('path');

// Crear directorio si no existe (podrías agregar esto)
const fs = require('fs');
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Mejorar nombre de archivo: quitar espacios y caracteres especiales
    const cleanName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-.]/g, '');
    cb(null, `${Date.now()}-${cleanName}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPEG/PNG'), false);
      // Agregar 'false' como segundo parámetro es más explícito
    }
  }
});

module.exports = upload;