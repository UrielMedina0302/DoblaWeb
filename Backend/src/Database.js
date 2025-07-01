const mongoose = require('mongoose');
// require('dotenv').config(); // Cargar las variables de entorno desde el archivo .env

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI|| "mongodb+srv://valienteua17:METU050302@cluster230768.uubu1.mongodb.net/DoblaWeb?retryWrites=true&w=majority&appName=Cluster230768");
    console.log("Connected to mongoDB")
    
  } catch (error) {
    console.error("Error connecting to mongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;