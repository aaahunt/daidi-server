var express = require("express")
var router = express.Router()
const path = require("path")

// User MongoDB model
const User = require("../models/user.model")

router.post("/register", async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  try {
    var request = new User(req.body)
    var user = await request.save()
    res.status(200).send({ user })
  } catch (error) {
    res.status(400).send()
  }
})

router.post("/login", async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  try {
    // Search for the user
    var user = await User.findOne({ username: req.body.username }).exec()

    if (!user) return res.status(200).send("The username does not exist")

    // If user found, compare passwords
    user.comparePassword(req.body.password, (error, match) => {
      if (!match) return res.status(200).send("Invalid password")
      else return res.status(200).send({ user })
    })
  } catch (error) {
    res.status(500).send(error)
  }
})

// Route for allowing user to increment his points in the database
router.post("/win", async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  try {
    // Get our record
    var record = await User.findOne({
      _id: req.body.id,
    }).exec()

    // Get opponent record
    var opponent = await User.findOne({
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
        if (value.opponent_id === req.body.id) oppRecord = value._id
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
        { _id: req.body.id },
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
router.get("/games", async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  try {
    var result = await User.findOne({ _id: req.query.id }).exec()
    if (result.games.length < 1)
      return res.status(204).send({ message: "No games found" })
    res.send(result.games)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.get("/user", async (req, res) => {
  try {
    var result = await User.find({ _id: req.query.id }).exec()
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
