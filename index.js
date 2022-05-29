const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
require("dotenv").config(); // Permet d'activer les variables d'environnement qui se trouvent dans le fichier `.env`
const cors = require("cors");

// Import de cloudinary
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(cors());
app.use(formidable());

mongoose.connect(process.env.MONGODB_URI);

// Connexion à mon compte cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Import du fichier user.js
const userRoutes = require("./routes/user");
// Je demande à mon serveur d'utiliser les routes présentes dans ce fichier
app.use(userRoutes);

// Import du fichier offer.js
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json("Route introuvable");
});

app.listen(3000, () => {
  console.log("Server started");
});
