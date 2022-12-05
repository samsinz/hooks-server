const { Schema, model } = require("mongoose");

const hookSchema = new Schema(
  {
    location: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Kissing", "Foreplay", "Sex"],
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    duration: {
      type: Number,
      min: 0,
      max: 2,
    },
    orgasm: {
      type: Boolean,
    },
    protection: {
      type: Boolean,
    },
  },

  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

module.exports = model("Hook", hookSchema);
