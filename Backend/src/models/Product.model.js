const mongoose = require('mongoose');
const {Schema} = mongoose;

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100 // Añade validación de longitud máxima
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    images: [{
        path: {
            type: String,
            required: true
        },
        filename: {
            type: String,
            required: true
        },
        mimetype: String,
        size: Number,
        url: String // URL pública accesible
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);