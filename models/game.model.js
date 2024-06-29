const mongoose = require("mongoose")

const activeGameSchema = new mongoose.Schema(
  {
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    board: {
      type: Array,
    },
  },
  {
    timestamps: true,
    collection: "games", // redundant, but good to be explicit
  }
)

const ActiveGame = mongoose.model("Game", activeGameSchema)

module.exports = ActiveGame
