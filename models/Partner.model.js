const { Schema, model } = require("mongoose");

const partnerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
    },
    image: {
      type: String,
      // default: "image.png"
    },
    comment: {
      type: String,
    },
    hooks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Hook",
      },
    ],
  },

  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

module.exports = model("Partner", partnerSchema);
