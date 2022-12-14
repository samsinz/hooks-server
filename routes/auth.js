const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const isAuthenticated = require("../middlewares/jwt.middleware");
const User = require("../models/User.model");
const Achievement = require("../models/Achievement.model");
const Hook = require("../models/Hook.model");
const Partner = require("../models/Partner.model");
const saltRounds = 10;
const uploader = require("./../config/cloudinary");
const protectRoute = require("../middlewares/protectRoute");

/**
 *
 * * All the routes are prefixed with `/api/auth`
 *
 */

router.post("/signup", uploader.single("image"), async (req, res, next) => {
  console.log("signup");

  const { name, email, password, birth } = req.body;
  if (email === "" || name === "" || password === "" || birth === "") {
    res
      .status(400)
      .json({ message: "I need some informations to work with here!" });
  }

  // ! To use only if you want to enforce strong password (not during dev-time)

  // const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

  // if (!regex.test(password)) {
  // 	return res
  // 		.status(400)
  // 		.json({
  // 			message:
  // 				"Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
  // 		});
  // }

  try {
    const foundUser = await User.findOne({ email });
    if (foundUser) {
      res
        .status(400)
        .json({ message: "There's another one of you, somewhere." });
      return;
    }
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPass = bcrypt.hashSync(password, salt);
    const image = req.file?.path;

    const createdUser = await User.create({
      name,
      email,
      password: hashedPass,
      birth,
      image: image,
    });

    const user = createdUser.toObject();
    delete user.password;
    // ! Sending the user as json to the client
    res.status(201).json({ user });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
    res.status(500).json({ message: "Sweet, sweet 500." });
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    res
      .status(400)
      .json({ message: "I need some informations to work with here!" });
  }
  try {
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      res.status(401).json({ message: "You're not yourself." });
      return;
    }
    const goodPass = bcrypt.compareSync(password, foundUser.password);
    if (goodPass) {
      const user = foundUser.toObject();
      delete user.password;

      /**
       * Sign method allow you to create the token.
       *
       * ---
       *
       * - First argument: user, should be an object. It is our payload !
       * - Second argument: A-really-long-random-string...
       * - Third argument: Options...
       */

      const authToken = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "2d",
      });

      //! Sending the authToken to the client !

      res.status(200).json({ authToken });
    } else {
      res.status(401).json("Can you check your typos ?");
    }
  } catch (error) {
    next(error);
    res
      .status(500)
      .json({ message: "Oh noes ! Something went terribly wrong !" });
  }
});

router.get("/me", isAuthenticated, async (req, res, next) => {
  try{
  // console.log("req payload", req.payload);

  const user = await User.findById(req.payload.id)
    .select("-password")
    .populate({ path: "partners", populate: { path: "hooks", model: "Hook" } })
    .populate("achievements")
    .populate("favorites");
  // console.log(user);
  res.status(200).json(user);
  }catch(error){
    next(error)
  }
});

router.patch(
  "/me",
  isAuthenticated,
  uploader.single("image"),
  async (req, res, next) => {
    const { name, birth } = req.body;

    let image = req.file?.path;

    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.payload.id,
        { name, birth, image },
        { new: true }
      ).select("-password");

      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/me", isAuthenticated, async (req, res, next) => {
  try {
    const userToDelete = await User.findById(req.payload.id).populate(
      "partners"
    );

    const hookPromises = userToDelete.partners.map((partner) => {
      const partnerHooks = partner.hooks.map((id) => {
        return Hook.findByIdAndDelete(id);
      });
      return partnerHooks;
    });

    await Promise.all(hookPromises.flat());

    const partnerPromises = userToDelete.partners.map((id) => {
      return Partner.findByIdAndDelete(id);
    });
    await Promise.all(partnerPromises);

    await User.findByIdAndDelete(req.payload.id);
    res.status(200).json({ message: "deleted" });

    // await Partner.findByIdAndDelete(req.params.id);
    // await Hook.findByIdAndDelete(req.params.id);
    // await Achievement.findByIdAndDelete(req.params.id)
  } catch (error) {
    next(error);
  }
});

module.exports = router;
