const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const { handleLogin, verifyJWT } = require("../controllers/authController")

let express = require("express")
let router = express.Router()
const path = require("path")

const User = require("../models/user.model")

router.get("/", async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.user_id }).exec()
    if (!user) return res.status(200).send("The username does not exist")
    res.send({ username: user.username, user_id: user._id })
  } catch (error) {
    res.status(500).send(error)
  }
})

router.post("/logout", async (req, res) => {
  try {
    let result = await User.updateOne(
      { _id: req.user_id },
      {
        $set: {
          access_token: "",
        },
      }
    ).exec()
    res.send(result)
  } catch (error) {
    res.sendStatus(500)
  }
})

router.post("/win", async (req, res) => {
  try {
    console.log(req.body)
    let winner = await User.findOne({ _id: req.user_id }).exec()
    let opponent = await User.findOne({ _id: req.body.opponent }).exec()

    if (!winner || !opponent)
      return res.status(400).send({ message: "Invalid user ID" })

    // First see if there is a record of a game between the two players.
    let existing_game = null
    Object.entries(winner.games).forEach(([key, value]) => {
      if (value.opponent_id === req.body.opponent) existing_game = value._id
    })

    // Update existing game record
    if (existing_game) {
      User.updateOne(
        { "games._id": existing_game },
        {
          $inc: {
            "games.$.our_score": req.body.points,
          },
        }
      ).exec()

      // Get opposing record
      let oppRecord
      Object.entries(opponent.games).forEach(([key, value]) => {
        if (value.opponent_id === req.body.user_id) oppRecord = value._id
      })

      User.updateOne(
        { "games._id": oppRecord },
        {
          $inc: {
            "games.$.opponent_score": req.body.points,
          },
        }
      ).exec()
      return res.send({ message: "Success" })
    }
    // Create new game record
    else {
      const ourRecord = {
        opponent_id: opponent._id,
        opponent_name: opponent.username,
        opponent_score: 0,
        our_score: req.body.points,
      }

      // Add the game record to our record
      User.findOneAndUpdate(
        { _id: req.body.user_id },
        {
          $push: {
            games: ourRecord,
          },
        }
      ).exec()

      // Create opponent record
      const theirRecord = {
        opponent_id: winner._id,
        opponent_name: winner.username,
        opponent_score: req.body.points,
        our_score: 0,
      }

      // Add the game record to opponent's record
      User.findOneAndUpdate(
        { _id: req.body.opponent },
        {
          $push: {
            games: theirRecord,
          },
        }
      ).exec()

      return res.send({ message: "Success" })
    }
  } catch (err) {
    console.log(err)
    res.send({ message: "Error" })
  }
})

// Route list of games that user has played
router.get("/games", async (req, res) => {
  try {
    let result = await User.findOne({ _id: req.user_id }).exec()
    if (result.games.length < 1)
      return res.status(204).send({ message: "No games found" })
    res.send(result.games)
  } catch (error) {
    res.status(500).send(error)
  }
})

module.exports = router
