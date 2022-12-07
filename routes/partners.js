const router = require("express").Router();
const mongoose = require("mongoose");
const isAuthenticated = require("../middlewares/jwt.middleware");
const Hook = require("../models/Hook.model");
const Partner = require("../models/Partner.model");
const User = require("../models/User.model");
const uploader = require("../config/cloudinary");
const jwt = require("jsonwebtoken");

const { checkAchievement } = require("../Helper/AchievementFunction")
/**
 *
 * * All the routes are prefixed with `/api/partners`
 *
 */

router.post(
  "/create",
  isAuthenticated,
  uploader.single("image"),
  async (req, res, next) => {
    let gain = 0;

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
      name === "" ||
      age === "" ||
      date === "" ||
      type === "" ||
      rating === "" ||
      duration === "" ||
      orgasm === "" ||
      protection === ""
    ) {
      res
        .status(400)
        .json({ message: "I need some informations to work with here!" });
    }

    const image = req.file?.path;

    if (orgasm) {
      gain += 50
    }

    if (protection) {
      gain += 50
    }

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



      const user = await User.findById(req.payload.id).populate({ path: "partners", populate: { path: "hooks", model: "Hook" } })


      gain += await checkAchievement(user, "On fire", 'setMonth', 'getMonth', 1)


      gain += await checkAchievement(user, "Racer against time", 'setDate', 'getDay', 6)





      const createdPartner = await Partner.create({
        name,
        age,
        nationality,
        comment,
        image: image,
        hooks: createdHook,
      });



      console.log(req.payload.id);
      await User.findByIdAndUpdate(req.payload.id, {
        $push: { partners: createdPartner },
        $inc: { score: gain }
      });

      res.status(201).json({ message: "Partner created" });



    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({ message: error.message });
      }
      next(error)
    }
  }
);

module.exports = router;
