import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

import User from "../models/user.model.js"

dotenv.config()

export const handleLogin = async (user, password, res) => {
  user.comparePassword(password, (error, match) => {
    if (!match) return res.status(200).send("Invalid password")

    const expiresInSeconds = 60 * 60 * 24 // 1 day in seconds
    const now = Math.floor(Date.now() / 1000) // current time in seconds
    const ttl = now + expiresInSeconds // expiry time in seconds

    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    })
    user.updateOne({ access_token: token }).exec()

    return res.status(200).send({ token })
  })
}

export const verifyJWT = (req, res, next) => {
  const authHeader = req.header("Authorization")

  if (!authHeader) return res.status(401).json({ message: "No token, access denied" })

  const token = authHeader.split(" ")[1]

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid token, access denied" })
      req.userId = decoded.userId
      req.username = decoded.username
      next()
    })
  } catch (err) {
    res.status(401).json({ message: "Invalid token, access denied" })
  }
}
