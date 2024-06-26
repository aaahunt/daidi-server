const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
require("dotenv").config()
const User = require("../models/user.model")

const handleLogin = async (user, password, res) => {
  user.comparePassword(password, (error, match) => {
    if (!match) return res.status(200).send("Invalid password")

    const access_token = jwt.sign(
      { user_id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    )
    user.updateOne({ access_token }).exec()

    return res.status(200).send({ user_id: user._id, access_token })
  })
}

const verifyJWT = (req, res, next) => {
  const authHeader = req.header("Authorization")

  if (!authHeader)
    return res.status(401).json({ message: "No token, access denied" })

  const token = authHeader.split(" ")[1]

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err)
        return res.status(403).json({ message: "Invalid token, access denied" })
      req.user_id = decoded.user_id
      next()
    })
  } catch (err) {
    res.status(401).json({ message: "Invalid token, access denied" })
  }
}

module.exports = { handleLogin, verifyJWT }
