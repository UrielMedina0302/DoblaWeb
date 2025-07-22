const mongoose = require('mongoose'); //Se importa mongoose para poder trabajar con la base de datos MongoDB
const {Schema} = mongoose; //Se importa el esquema de mongoose para poder definir el modelo de usuario
const bcrypt = require('bcryptjs'); //Se importa bcryptjs para poder encriptar las contraseñas de los usuarios 
const jwt = require('jsonwebtoken'); //Se importa jsonwebtoken para poder generar tokens de autenticación
const crypto = require('crypto'); //Se importa crypto para poder generar tokens de restablecimiento de contraseña

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true 
    },
    lastname:{
        type: String,
        required:true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} no es un email válido!`
        }
    },

    password: {
        type: String,
        required: true,
        select: false,// No se selecciona por defecto al consultar el usuario
        minlength: 8 // La contraseña debe tener al menos 6 caracteres
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


//Método para encriptar la contraseña antes de guardar el usuario
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) // Verifica si la contraseña ha sido modificada
    this.password= await bcrypt.hash(this.password, 10); // Encripta la contraseña con bcrypt
    next(); // Llama a next() para continuar con el guardado del usuario
});

//Generar JWT (JSON Web Token) para el usuario
userSchema.methods.generateAuthToken = function() {
    return JsonWebTokenError.sign(
        { id: this._id, email: this.email, role: this.role }, // Payload del token
        process.env.JWT_SECRET, // Clave secreta para firmar el token
        { expiresIn: '10m' } // Tiempo de expiración del token
    )};
    
    //Método para comparar contraseñas
    userSchema.methods.comparePassword = async function(candidatePassword) {
  // Compara la contraseña ingresada (candidatePassword) con el hash almacenado
  return await bcrypt.compare(candidatePassword, this.password);
};

    // Método para crear token de reset de contraseña
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutos
    
    return resetToken;
};
    module.exports = mongoose.model('User', userSchema); //Exportar el modelo de usuario para poder usarlo en otras partes de la aplicación
    //El modelo de usuario se define con un esquema que incluye campos para el nombre de usuario, correo electrónico, contraseña y rol.