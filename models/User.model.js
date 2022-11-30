const { Schema, model } = require("mongoose");

const userSchema = new Schema(
	{
		name: {
			type: String,
			required: true
		},
		email: {
			type: String,
			unique: true,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		birth: {
			type: Date,
			required: true
		},
		image: {
			type: String,
			// default: "image.png"
		},
		score: {
			type: Number,
			default: 0
		},
		achievements: [{
			type: Schema.Types.ObjectId,
			ref: 'Achievement'
		}],
		partners: [{
			type: Schema.Types.ObjectId,
			ref: 'Partner'
		}],
		favorites: [{
			type: Schema.Types.ObjectId,
			ref: 'Partner'
		}]
	},

	{
		// this second object adds extra properties: `createdAt` and `updatedAt`
		timestamps: true,
	}
);

module.exports = model("User", userSchema);
