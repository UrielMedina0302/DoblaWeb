const mongoose = require('mongoose'); //Se importa moongose para poder trabajar con mongoDB
const {Schema} = mongoose; //Se importa el esquema de mongoose para poder definir el modelo de producto

const productSchema = new mongoose.Schema({
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
    },
    updateAt: {//Campo para la fecha de actualización
        type: Date,
        default: Date.now // Por defecto, la fecha de actualización es la fecha actual
    },

    });
// Exportar el modelo de producto para poder usarlo en otras partes de la aplicación
module.exports = mongoose.model('Product', productSchema); //El modelo de producto se define con  