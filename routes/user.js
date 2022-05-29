const express = require("express");
const cloudinary = require("cloudinary").v2;

const router = express.Router();

// Import du modèle User
const User = require("../models/User");

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

// Route pour créer un nouvel utilisateur en BDD
router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.fields;

    if (username && email && password && newsletter) {
      const userEmail = await User.findOne({ email });
      if (!userEmail) {
        const salt = uid2(16);
        const hash = SHA256(password + salt).toString(encBase64);
        const token = uid2(16);
        const newUser = new User({
          account: { username },
          email,
          newsletter,
          salt,
          hash,
          token,
        });
        // Upload de l'avatar sur cloudinary
        const avatar = await cloudinary.uploader.upload(req.files.avatar.path, {
          // Je rajoute une option pour enregistrer l'image dans un dossier spécial avec l'id de l'user
          folder: `/vinted/users/${newUser._id}`,
        });

        newUser.account.avatar = avatar;

        await newUser.save();
        // J'envoie une réponse au client
        const response = {
          _id: newUser._id,
          token: newUser.token,
          account: newUser.account,
        };

        res.status(200).json(response);
      } else {
        res.status(409).json({ message: "User already exist" });
      }
    } else {
      res.status(400).json({ message: "Missing parameters" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route pour se connecter
router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.fields;

    const userToFind = await User.findOne({ email });

    if (userToFind) {
      const newHash = SHA256(password + userToFind.salt).toString(encBase64);

      if (newHash === userToFind.hash) {
        // J'envoie une réponse au client
        const response = {
          _id: userToFind._id,
          token: userToFind.token,
          account: { username: userToFind.account.username }, // ou account:newUser.account,
        };
        res.status(200).json(response);
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
