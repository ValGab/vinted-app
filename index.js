const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
// Import de cloudinary
const cloudinary = require("cloudinary").v2;

const app = express();

app.use(formidable());

mongoose.connect("mongodb://localhost/vinted");

// Connexion à mon compte cloudinary
cloudinary.config({
  cloud_name: "dohratw0j",
  api_key: "781322292736855",
  api_secret: "yXbhGO9TyzLSYtHXw6pTc3Xg4cM",
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
