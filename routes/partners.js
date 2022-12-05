const router = require("express").Router();
const mongoose = require("mongoose");
const isAuthenticated = require("../middlewares/jwt.middleware");
const Hook = require("../models/Hook.model");
const Partner = require("../models/Partner.model");
const User = require("../models/User.model");
const uploader = require("../config/cloudinary");
/**
 *
 * * All the routes are prefixed with `/api/partners`
 *
 */

router.post("/create", uploader.single("image"), async (req, res, next) => {
  const {
    name,
    age,
    nationality,
    comment,
    location,
    date,
    type,
    rating,
    duration,
    orgasm,
    protection,
  } = req.body;

  if (
    name === ""
    // ||
    // age === "" ||
    // date === "" ||
    // type === "" ||
    // rating === "" ||
    // duration === "" ||
    // orgasm === "" ||
    // protection === ""
  ) {
    res
      .status(400)
      .json({ message: "I need some informations to work with here!" });
  }

  const image = req.file?.path;

  try {
    const createdHook = await Hook.create({
      location,
      date,
      type,
      rating,
      duration,
      orgasm,
      protection,
    });

    const createdPartner = await Partner.create({
      name,
      age,
      nationality,
      comment,
      image: image,
      hooks: createdHook,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Sweet, sweet 500." });
  }
});

module.exports = router;
