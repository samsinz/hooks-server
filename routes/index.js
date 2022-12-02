const router = require("express").Router();
const protectRoute = require("../middlewares/protectRoute");
const User = require("./../models/User.model");
const Partner = require("./../models/Partner.model");
const Hook = require("./../models/Hook.model");
const Achievement = require('./../models/Achievement.model')

router.get("/", (req, res, next) => {
  res.send("Server is running... 🏃‍♂️");
});

router.get("/private", protectRoute, (req, res, next) => {
  res.send("Protection passed !");
});



// router.get("/dashboard/:userId", async (req, res, next) => {
//   const user = await User.findById(req.params.userId).populate({ path: "partners", populate: { path: "hooks", model: "Hook" } });
//   // console.log(user)
//   res.status(200).json(user);
// });

// router.get("/achievements/:userId", async (req, res, next) => {
//   const user = await User.findById(req.params.userId).populate("achievements");
//   const achievements = [];
//   for (let i = 0; i < user.achievements.length; i++) {
//     achievements.push(user.achievements[i]);
//   }
//   res.status(200).json(achievements);
// });



module.exports = router;
