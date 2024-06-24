// JWT and bcrypt for authentication
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const { handleLogin, verifyJWT } = require("../controllers/authController")

let express = require("express")
let router = express.Router()
const path = require("path")

// User MongoDB model
const User = require("../models/user.model")

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body
  } catch (error) {
    res.sendStatus(400)
  }

  try {
    const existing_user = await User.findOne({ username })
    if (existing_user) return res.status(409).send("Username already exists")

    const new_user_request = new User(req.body)
    const new_user = await new_user_request.save()

    res.sendStatus(200)
  } catch (error) {
    res.sendStatus(500)
  }
})

router.post("/login", async (req, res) => {
  const { username, password } = req.body

  try {
    let user = await User.findOne({ username }).exec()
    if (!user) return res.status(200).send("The username does not exist")

    handleLogin(user, password, res)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.get("/auth", verifyJWT, async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.user_id }).exec()
    if (!user) return res.status(200).send("The username does not exist")
    res.send({ username: user.username, user_id: user._id })
  } catch (error) {
    res.status(500).send(error)
  }
})

// Route for allowing user to increment his points in the database
router.post("/win", async (req, res) => {
  // res.set("Access-Control-Allow-Origin", "*")
  try {
    // Get our record
    let record = await User.findOne({
      _id: req.body.user_id,
    }).exec()

    // Get opponent record
    let opponent = await User.findOne({
      _id: req.body.opponent,
    }).exec()

    // If there is no users with that ID, return
    if (!record || !opponent)
      return res.status(400).send({ message: "Invalid user ID" })

    // First see if there is a record of a game between the two players.
    let gameID
    Object.entries(record.games).forEach(([key, value]) => {
      if (value.opponent_id === req.body.opponent) gameID = value._id
    })

    // Update existing game record
    if (gameID) {
      User.updateOne(
        { "games._id": gameID },
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
      // Create our record
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
        opponent_id: record._id,
        opponent_name: record.username,
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
router.get("/games", verifyJWT, async (req, res) => {
  try {
    let result = await User.findOne({ _id: req.user_id }).exec()
    if (result.games.length < 1)
      return res.status(204).send({ message: "No games found" })
    res.send(result.games)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.get("/user", async (req, res) => {
  try {
    let result = await User.find({ _id: req.query.user_id }).exec()
    res.send(result)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.get("/clear", async (req, res) => {
  try {
    let result = await User.updateMany(
      {},
      {
        $set: {
          games: [],
        },
      }
    ).exec()
    res.send(result)
  } catch (error) {
    res.status(500).send(error)
  }
})

// If accessed directly, serve 404 page
router.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"))
})

module.exports = router
