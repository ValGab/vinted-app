const express = require("express");
const { is } = require("express/lib/request");
const isAuthenticated = require("../middlewares/isAuthenticated");
const cloudinary = require("cloudinary").v2;
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const router = express.Router();

// Import du modèle Offer
const Offer = require("../models/Offer");

// Route pour créer une annonce

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    const { title, description, price, brand, size, city, condition, color } =
      req.fields;

    if (description.length < 500) {
      if (price < 100000) {
        if (title.length < 50) {
          const newOffer = new Offer({
            product_name: title,
            product_description: description,
            product_price: price,
            product_details: [
              { MARQUE: brand },
              { TAILLE: size },
              { ETAT: condition },
              { COULEUR: color },
              { EMPLACEMENT: city },
            ],
            owner: req.user,
          });

          // J'upload l'image sur cloudinary
          const result = await cloudinary.uploader.upload(
            req.files.picture.path,
            {
              // Je rajoute une option pour enregistrer l'image dans un dossier spécial avec l'id de l'offre
              folder: `/vinted/offers/${newOffer._id}`,
            }
          );

          // J'ajoute la clé product_image avec les infos de l'image à ma nouvelle offre
          newOffer.product_image = result;

          // Je sauvegarde l'offre avec l'image associée
          await newOffer.save();

          res.status(201).json(newOffer);
        } else {
          res
            .status(400)
            .json({ message: "Title must be under 50 characters" });
        }
      } else {
        res.status(400).json({ message: "Price must be under 100000" });
      }
    } else {
      res
        .status(400)
        .json({ message: "Description must be under 500 characters" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route pour modifier une annonce
router.put("/offer/modify", isAuthenticated, async (req, res) => {
  try {
    const {
      id,
      title,
      description,
      price,
      brand,
      size,
      city,
      condition,
      color,
    } = req.fields;

    const offerToUpdate = await Offer.findById(id);

    if (String(req.user._id) === String(offerToUpdate.owner._id)) {
      if (title) {
        if (title.length < 50) {
          offerToUpdate.product_name = title;
        } else {
          return res
            .status(400)
            .json({ message: "Title must be under 50 characters" });
        }
      }
      if (description) {
        if (description.length < 500) {
          offerToUpdate.product_description = description;
        } else {
          return res
            .status(400)
            .json({ message: "Description must be under 500 characters" });
        }
      }
      if (price) {
        if (price < 100000) {
          offerToUpdate.product_price = price;
        } else {
          return res
            .status(400)
            .json({ message: "Price must be under 100000" });
        }
      }
      if (brand) {
        offerToUpdate.product_details[0].MARQUE = brand;
      }
      if (size) {
        offerToUpdate.product_details[1].TAILLE = size;
      }
      if (condition) {
        offerToUpdate.product_details[2].ETAT = condition;
      }
      if (color) {
        offerToUpdate.product_details[3].COULEUR = color;
      }
      if (city) {
        offerToUpdate.product_details[4].EMPLACEMENT = city;
      }

      offerToUpdate.markModified("product_details");

      const { picture } = req.files;

      if (picture) {
        await cloudinary.api.delete_resources_by_prefix(`vinted/offers/${id}`);

        const newPic = await cloudinary.uploader.upload(
          req.files.picture.path,
          {
            // Je rajoute une option pour enregistrer l'image dans un dossier spécial avec l'id de l'offre
            folder: `/vinted/offers/${id}`,
          }
        );

        offerToUpdate.product_image = newPic;
      }
      // console.log(offerToUpdate);
      await offerToUpdate.save();

      res.status(200).json(offerToUpdate);
    } else {
      res.status(401).json({ message: "Bad user" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route pour supprimer une annonce
router.delete("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.fields;

    const offerToRemove = await Offer.findById(id);

    if (String(req.user._id) === String(offerToRemove.owner._id)) {
      const removePic = await cloudinary.api.delete_resources_by_prefix(
        `vinted/offers/${id}`
      );
      const removeFolder = await cloudinary.api.delete_folder(
        `/vinted/offers/${id}`
      );

      await offerToRemove.delete();

      res.status(200).json({ message: "Offer successfully deleted" });
    } else {
      res.status(401).json({ message: "Bad user" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route pour afficher les annonces
router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, limit } = req.query;

    let { page, sort } = req.query;
    if (!page) {
      page = 1;
    }

    if (sort && sort === "price-desc") {
      sort = "desc";
    } else if (sort && sort === "price-asc") {
      sort = "asc";
    }

    const filters = {};

    if (title) {
      filters.product_name = new RegExp(title, "i");
    }

    if (priceMin) {
      filters.product_price = { $gte: Number(priceMin) };
    }

    if (priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(priceMax);
      } else {
        filters.product_price = { $lte: Number(priceMax) };
      }
    }

    if (limit) {
      filters.limit = limit;
    }

    // const perPage = 5; // ou const limit

    const offers = await Offer.find(filters) // variable filters avec l'ajout des clés correspondantes aux query reçues
      .sort({ product_price: sort }) // ou variable sort avec l'ajout de clé à sort.product_price avec asc ou desc
      .select(
        "product_name product_details product_price product_image.secure_url"
      )
      .skip(limit * page - limit)
      .limit(limit)
      .populate("owner", "_id account");

    const count = await Offer.countDocuments(filters);

    res.status(200).json({ count, offers });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route pour récupérer les détails d'une annonce en fonction de l'id reçu
router.get("/offer/:id", async (req, res) => {
  try {
    const offerToFind = await Offer.findById(req.params.id).populate(
      "owner",
      "account _id"
    );
    res.status(200).json(offerToFind);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route pour payer
router.post("/offer/payment", isAuthenticated, async (req, res) => {
  try {
    // console.log("Données reçues =>", req.fields);
    const response = await stripe.charges.create({
      amount: req.fields.amount * 100,
      currency: "eur",
      description: req.fields.description,
      // On envoie ici le token
      source: req.fields.stripeToken,
    });
    // console.log("response du back =>", response);
    if (response.status === "succeeded") {
      res.status(200).json("Le paiement a bien été effectué");
    } else {
      // console.log("réponse else =>", response);
      res.status(400).json(response.status);
    }
  } catch (error) {
    // console.log("catch =>", error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
