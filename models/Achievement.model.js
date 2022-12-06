const { Schema, model } = require("mongoose");

const achievementSchema = new Schema(
	{
		name: {
			type: String,
		},
		description: {
			type: String,
		},
		image: {
			type: String,
		},

	}
);

module.exports = model("Achievement", achievementSchema);
