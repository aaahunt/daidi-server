import express from "express"
import path from "path"

import User from "../models/user.model.js"
import { handleLogin, verifyJWT } from "../controllers/authController.js"

const router = express.Router()

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

export default router
