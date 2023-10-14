const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    ad: {
      type: String,
      required: true,
      trim: true,
    },
    soyad: {
      type: String,
      required: true,
      trim: true,
    },
    emailAktif: {
      type: Boolean,
      default: false,
    },
    avatar: {
      required: true,
      type: String,
      trim: true,
      default: "/assets/indir.png",
    },
    sifre: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { collection: "kullanicilar", timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
