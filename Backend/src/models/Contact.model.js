const moongose = require('mongoose');
const { Schema } = moongose;

const contactSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true // Asegura que el correo electrónico esté en minúsculas
    },
    phone: {
        type: String,
        required: true,
        trim: true // Elimina espacios en blanco al inicio y al final
    },
    businessHours: {
        type: String,
        required: true,
    },
    lastUpdated:{
        type: Date,
        default: Date.now // Por defecto, la fecha de actualización es la fecha actual
    },
    updatedBy: {// Campo para almacenar el ID del usuario que actualizó el contacto
        type: ObjectId,// Asegúrate de importar ObjectId desde mongoose
        ref: 'User', // Referencia al modelo de usuario
        required: true // Este campo es obligatorio
    }
    },{
        versionKey: false,// Desactiva el campo __v de Mongoose
        timestamps: true // Agrega campos createdAt y updatedAt automáticamente
    
    });

    module.exports = moongose.model('Contact', contactSchema); // Exportar el modelo de contacto para poder usarlo en otras partes de la aplicación