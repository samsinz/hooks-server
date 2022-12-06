const router = require("express").Router();
const mongoose = require("mongoose");
const isAuthenticated = require("../middlewares/jwt.middleware");
const Hook = require("../models/Hook.model");
const Partner = require("../models/Partner.model");
const User = require("../models/User.model");
const uploader = require("../config/cloudinary");
const jwt = require("jsonwebtoken");
const Achievement = require("../models/Achievement.model");
/**
 *
 * * All the routes are prefixed with `/api/partners`
 *
 */

router.post("/create", isAuthenticated, uploader.single("image"), async (req, res, next) => {
  let gain = 0;

  const { name, age, nationality, comment, location, date, type, rating, duration, orgasm, protection } = req.body;

  if (name === "" || age === "" || date === "" || type === "" || rating === "" || duration === "" || orgasm === "" || protection === "") {
    res.status(400).json({ message: "I need some informations to work with here!" });
  }

  const image = req.file?.path;

  if (orgasm) {
    gain += 50;
  }

  if (protection) {
    gain += 50;
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

    const user = await User.findById(req.payload.id).populate({ path: "partners", populate: { path: "hooks", model: "Hook" } });

    // checkAchievement({user})

    const onFire = await Achievement.findOne({ name: "On fire" });

    if (!onFire) {
      const lastMonthHooks = user.partners
        .reduce((acc, cur) => {
          return [...acc, ...cur.hooks];
        }, [])
        .filter((hook) => hook.date > lastMonthDate);

      if (lastMonthHooks.length >= 5) {
        gain += 50;

        await User.findByIdAndUpdate(req.payload.id, { $push: { achievements: onFire.id } });
      }
    }

    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

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
      $inc: { score: gain },
    });

    res.status(201).json({ message: "Partner created" });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Sweet, sweet 500." });
  }
});

router.delete("/:partnerId/delete/:hookId", isAuthenticated, async (req, res, next) => {
  try {
    await Partner.findByIdAndUpdate(req.params.partnerId, { $pullAll: { hooks: [{ _id: req.params.hookId }] } });
    await Hook.findByIdAndRemove(req.params.hookId);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.delete("/:partnerId/delete", isAuthenticated, async (req, res, next) => {
  try {

    const partnerToDelete = await Partner.findById(req.params.partnerId);
    const hookPromises = partnerToDelete.hooks.map((hook)=> {
      return Hook.findByIdAndRemove(hook)
    })
    await Promise.all(hookPromises)
    await Partner.findByIdAndRemove(req.params.partnerId)
    res.sendStatus(200);

  } catch (error) {
    next(error);
  }
});

module.exports = router;
