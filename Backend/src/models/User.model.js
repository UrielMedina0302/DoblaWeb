const mongoose = require('mongoose'); //Se importa mongoose para poder trabajar con la base de datos MongoDB
const {Schema} = mongoose; //Se importa el esquema de mongoose para poder definir el modelo de usuario
const bcrypt = require('bcryptjs'); //Se importa bcryptjs para poder encriptar las contraseñas de los usuarios 

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false // No se selecciona por defecto al consultar el usuario
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
    },{
        versionKey: false,// Desactiva el campo __v de Mongoose
        timestamps: true // Agrega campos createdAt y updatedAt automáticamente
    
    });

    //Método para comparar contraseñas
    userSchema.methods.compareContraseña = async function (Repitepassword) {
        return await bcrypt.compare(Repitepassword, this.password);
    }
    module.exports = mongoose.model('User', userSchema); //Exportar el modelo de usuario para poder usarlo en otras partes de la aplicación
    //El modelo de usuario se define con un esquema que incluye campos para el nombre de usuario, correo electrónico, contraseña y rol.