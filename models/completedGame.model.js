const mongoose = require("mongoose")

const completedGameSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    players: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        points: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
    collection: "completedGames",
  }
)

const CompletedGame = mongoose.model("CompletedGame", completedGameSchema)

module.exports = CompletedGame
