const router = require("express").Router();
const mongoose = require("mongoose");
const isAuthenticated = require("../middlewares/jwt.middleware");
const Hook = require("../models/Hook.model");
const Partner = require("../models/Partner.model");
const User = require("../models/User.model");
const uploader = require("../config/cloudinary");
const jwt = require("jsonwebtoken");

const { checkAchievement } = require("../Helper/AchievementFunction");
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
      });

      const user = await User.findById(req.payload.id).populate({
        path: "partners",
        populate: { path: "hooks", model: "Hook" },
      });

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

      let createdPartner;
      console.log({ _id });
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
        console.log("created new one");
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

      console.log(req.payload.id);

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
  isAuthenticated,
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

router.delete("/:partnerId/delete", isAuthenticated, async (req, res, next) => {
  try {
    const partnerToDelete = await Partner.findById(req.params.partnerId);
    const hookPromises = partnerToDelete.hooks.map((hook) => {
      return Hook.findByIdAndRemove(hook);
    });
    await Promise.all(hookPromises);
    await Partner.findByIdAndRemove(req.params.partnerId);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
