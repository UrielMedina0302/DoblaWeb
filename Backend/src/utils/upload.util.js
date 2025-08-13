const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createError } = require('http-errors');

// Configuración
const UPLOAD_DIR = 'uploads/products/';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const ALLOWED_EXTENSIONS = ['.jpeg', '.jpg', '.png'];

// Crear directorio con permisos
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true, mode: 0o755 });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext)
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9\-_]/g, '')
      .substring(0, 50);
    cb(null, `${Date.now()}-${baseName}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeValid = ALLOWED_TYPES.includes(file.mimetype);
  const isExtValid = ALLOWED_EXTENSIONS.includes(ext);

  if (isMimeValid && isExtValid) {
    return cb(null, true);
  }
  
  cb(createError(400, `Solo se permiten archivos: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
};

// Middleware principal
const upload = multer({
  storage,
  limits: { 
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES
  },
  fileFilter
});

// Middleware inteligente que detecta el tipo de contenido
const smartUpload = (fieldName, maxCount) => (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  
  if (contentType.includes('multipart/form-data')) {
    return upload.array(fieldName, maxCount)(req, res, next);
  }
  
  // Si no es FormData, continuar sin Multer
  next();
};

// Manejador de errores
const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(createError(413, `Tamaño máximo por archivo: ${MAX_FILE_SIZE/1024/1024}MB`));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(createError(400, `Máximo ${MAX_FILES} archivos permitidos`));
    }
    if (err.message.includes('Solo se permiten')) {
      return next(createError(400, err.message));
    }
    return next(createError(500, 'Error al procesar archivos'));
  }
  next();
};

module.exports = {
  upload,
  smartUpload,
  handleUploadErrors,
  UPLOAD_DIR
};