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
  const { username, password } = req.body

  try {
    const existing_user = await User.findOne({ username })
    if (existing_user) return res.status(409).send("Username already exists")

    const new_user_request = new User(req.body)
    const new_user = await new_user_request.save()

    res.sendStatus(200)
  } catch (error) {
    console.log(error)
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

module.exports = router
