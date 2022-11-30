const router = require("express").Router();
const protectRoute = require("../middlewares/protectRoute");
const User = require('./../models/User.model')
const Partner = require('./../models/Partner.model')
const Hook = require('./../models/Hook.model')

router.get("/", (req, res, next) => {
	res.send("Server is running... 🏃‍♂️");
});

router.get("/private", protectRoute, (req, res, next) => {
	res.send("Protection passed !");
});

router.get('/dashboard', async (req,res, next)=> {
	res.status(200).json(await User.find()
	.populate({path: "partners", populate: {path: "hooks", model: "Hook"}}))
})

module.exports = router;
