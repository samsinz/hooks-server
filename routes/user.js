const router = require("express").Router();
const isAuthenticated = require("../middlewares/jwt.middleware");
const User = require("../models/User.model");

router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.id, { partners: 1 }).populate(
      "partners"
    );
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
