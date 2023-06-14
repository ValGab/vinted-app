const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  console.log("On rentre dans le middleware isA");
  try {
    console.log("header =>", req.headers);
    if (req.headers.authorization) {
      // Je récupère le token envoyé en requête avec la méthode Bearer dans Postman

      const token = req.headers.authorization.replace("Bearer ", "");
      //   Chercher dans ma BDD mongodb si un user a bien ce token
      // console.log("token =>", token);
      const user = await User.findOne({ token }).select("account _id");
      //   J'en trouve 1
      // console.log("user =>", user);
      if (user) {
        //   J'ai fait une requête à ma BDD et j'ai des infos concernant le user que j'ai trouvé, je stocke ces informations dans req, comme ça je pourrai y avoir accès dans le reste de ma route
        req.user = user;
        // Je passe à la suite de ma route avec next()
        next();
      } else {
        //   Si je ne trouve pas mon user, je renvoie une erreur
        res.status(401).json({ message: "Unauthorized - user not found" });
      }
    } else {
      // Si je ne reçois pas de token en requête
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = isAuthenticated;
