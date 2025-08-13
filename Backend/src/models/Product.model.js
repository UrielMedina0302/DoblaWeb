const mongoose = require('mongoose'); //Se importa moongose para poder trabajar con mongoDB
const {Schema} = mongoose; //Se importa el esquema de mongoose para poder definir el modelo de producto

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Este campo es obligatorio
        trim: true // Elimina espacios en blanco al inicio y al final
    },
    description: {
        type: String,
        required: true,
        trim: true// Elimina espacios en blanco al inicio y al final
    },
    images: [{
        type: String,
        required: true,
        }],
    isActive:{
        type: Boolean,
        default: true // Por defecto, el producto está activo
    }
    },{
        versionKey: false,// Desactiva el campo __v de Mongoose
        timestamps: true // Agrega campos createdAt y updatedAt automáticamente
    
    });

// Exportar el modelo de producto para poder usarlo en otras partes de la aplicación
module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);