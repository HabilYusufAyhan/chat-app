const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    person: {
      type: String,
      required: [true, "Ad alanı boş olamaz"],
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    contact: {
      type: Number,
      required: true,
      trim: true,
      minlength: 2,
    },
    degree: {
      type: String,
      required: true,
      trim: true,
    },

    datapersonid: {
      type: String,
      required: true,
    },
  },
  { collection: "guide", timestamps: true }
);

const guide = mongoose.model("guide", UserSchema);

module.exports = guide;
