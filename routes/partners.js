const router = require("express").Router();
const mongoose = require("mongoose");
const isAuthenticated = require("../middlewares/jwt.middleware");
const Hook = require("../models/Hook.model");
const Partner = require("../models/Partner.model");
const User = require("../models/User.model");
const uploader = require("../config/cloudinary");
const jwt = require("jsonwebtoken");
const protectRoute = require("../middlewares/protectRoute");


const {
  checkAchievement,
  checkDesert,
  checkShark, checkNumber, checkGrade, checkOrgasm, checkProtection, firstHook
} = require("../Helper/AchievementFunction");

/**
 *
 * * All the routes are prefixed with `/api/partners`
 *
 */

router.use(isAuthenticated)

router.post(
  "/create",
  uploader.single("image"),
  async (req, res, next) => {
    try {
      let gain = 0;

      const {
        _id,
        name,
        age,
        comment,
        location,
        date,
        type,
        rating,
        duration,
        orgasm,
        protection,
        notes,
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

      let image = null;

      if(req.file){
        image = req.file.path;
      }
      
      // console.log('image')

      if (orgasm) {
        gain += 50;
      }

      if (protection) {
        gain += 50;
      }

      const createdHook = await Hook.create({
        location,
        date,
        type,
        rating,
        duration,
        orgasm,
        protection,
        notes,
      });

      const user = await User.findById(req.payload.id).populate({
        path: "partners",
        populate: { path: "hooks", model: "Hook" },
      });

      firstHook(user, "Sex bomb")

      gain += await checkAchievement(
        user,
        "On fire",
        "setMonth",
        "getMonth",
        1
      );




      gain += await checkAchievement(
        user,
        "Racer against time",
        "setDate",
        "getDay",
        6
      );

      checkDesert(user, "Born again virgin", "setFullYear", "getFullYear");



      checkShark(user, "Shark")


      checkNumber(user, "Professional kisser", "Kissing", 10)

      checkNumber(user, "Professional foreplayer", "Foreplay", 10)

      checkNumber(user, "Go big or go home", "Sex", 10)

      checkGrade(user, "Unfortunate")

      checkOrgasm(user, "Orgasm", 10)

      checkOrgasm(user, "Orgasm Master", 30)

      checkProtection(user, "Protector", 10)


      let createdPartner;
      // console.log({ _id });
      if (_id) {
        createdPartner = await Partner.findByIdAndUpdate(
          _id,
          {
            $push: { hooks: createdHook },
          },
          { new: true }
        );

        await User.findByIdAndUpdate(req.payload.id, {
          $inc: { score: gain },
        });
      } else {
        // console.log("created new one");
        createdPartner = await Partner.create({
          name,
          age,
          comment,
          image: image,
          hooks: createdHook,
        });

        await User.findByIdAndUpdate(req.payload.id, {
          $push: { partners: createdPartner },
          $inc: { score: gain },
        });
      }

      // console.log(req.payload.id);

      res.status(201).json({ message: "Partner created" });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
);

router.delete(
  "/:partnerId/delete/:hookId",
  async (req, res, next) => {
    try {
      await Partner.findByIdAndUpdate(req.params.partnerId, {
        $pullAll: { hooks: [{ _id: req.params.hookId }] },
      });
      await Hook.findByIdAndRemove(req.params.hookId);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:partnerId/delete", async (req, res, next) => {
  try {
    const partnerToDelete = await Partner.findById(req.params.partnerId);
    const hookPromises = partnerToDelete.hooks.map((hook) => {
      return Hook.findByIdAndRemove(hook);
    });
    await Promise.all(hookPromises);
    await Partner.findByIdAndRemove(req.params.partnerId);
    await User.findByIdAndUpdate(req.payload.id, {
      $pullAll: { partners: [{ _id: req.params.partnerId }] },
    });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/:partnerId/edit", async (req, res, next) => {
  try {
    const partnerToEdit = await Partner.findById(req.params.partnerId);
    if (req.body.name.length >= 1) {
      await Partner.findByIdAndUpdate(req.params.partnerId, {
        name: req.body.name,
        comment: req.body.comment,
      });
    }
    if (req.body.age >= 18) {
      await Partner.findByIdAndUpdate(req.params.partnerId, {
        age: req.body.age,
      });
    }
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
