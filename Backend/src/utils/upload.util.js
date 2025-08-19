const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createError } = require('http-errors');
const mime = require('mime-types');

// Configuración mejorada con rutas absolutas
const UPLOAD_DIR = path.join(__dirname, '../uploads/products/');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const ALLOWED_EXTENSIONS = ['.jpeg', '.jpg', '.png'];

// Crear directorio con mejores prácticas
const ensureUploadDirExists = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { 
      recursive: true, 
      mode: 0o755 // Permisos adecuados
    });
    console.log(`Directorio de uploads creado: ${UPLOAD_DIR}`);
  }
};
ensureUploadDirExists();

// Configuración de almacenamiento mejorada
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname
      .replace(ext, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9\-_]/g, '')
      .substring(0, 50);
    cb(null, `${uniqueSuffix}-${sanitizedName}${ext}`);
  }
});

// Filtro de archivos mejorado
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = mime.lookup(ext);

  const isMimeValid = ALLOWED_TYPES.includes(file.mimetype) && 
                     ALLOWED_TYPES.includes(mimeType);
  const isExtValid = ALLOWED_EXTENSIONS.includes(ext);

  if (isMimeValid && isExtValid) {
    return cb(null, true);
  }
  
  cb(createError(400, `Tipo de archivo no permitido. Solo: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
};

// Configuración principal de Multer
const upload = multer({
  storage,
  limits: { 
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES
  },
  fileFilter
});

// Middleware inteligente mejorado
const smartUpload = (fieldName, maxCount) => (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  
  if (contentType.includes('multipart/form-data')) {
    return upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        // Limpiar archivos subidos si hay error
        if (req.files) {
          req.files.forEach(file => {
            try {
              fs.unlinkSync(file.path);
            } catch (cleanupError) {
              console.error('Error limpiando archivos:', cleanupError);
            }
          });
        }
        return handleUploadErrors(err, req, res, next);
      }
      next();
    });
  }
  
  next();
};

// Manejador de errores mejorado
const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    console.error('Error en upload:', err);
    
    const errors = {
      LIMIT_FILE_SIZE: {
        status: 413,
        message: `Tamaño máximo por archivo: ${MAX_FILE_SIZE/1024/1024}MB`
      },
      LIMIT_FILE_COUNT: {
        status: 400,
        message: `Máximo ${MAX_FILES} archivos permitidos`
      },
      default: {
        status: 500,
        message: 'Error al procesar archivos'
      }
    };
    
    const errorInfo = errors[err.code] || errors.default;
    return next(createError(errorInfo.status, errorInfo.message));
  }
  next();
};

module.exports = {
  upload,
  smartUpload,
  handleUploadErrors,
  UPLOAD_DIR
};