const mongoose = require("mongoose")
const Bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 3,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    games: [
      {
        opponent_id: String,
        opponent_name: String,
        opponent_score: Number,
        our_score: Number,
      },
    ],
  },
  {
    timestamps: true,
    collection: "users", // redundant, but good to be explicit
  }
)

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next()
  }
  this.password = Bcrypt.hashSync(this.password, 10)
  next()
})

userSchema.methods.comparePassword = function (plaintext, callback) {
  return callback(null, Bcrypt.compareSync(plaintext, this.password))
}

userSchema.index({ username: "text" })

const User = mongoose.model("User", userSchema)

module.exports = User
