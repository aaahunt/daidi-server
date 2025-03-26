import express from "express"
import cors from "cors"

import { verifyJWT } from "./controllers/authController.js"
import corsOptions from "./config/corsOptions.js"
import indexRouter from "./routes/index.js"
import authRouter from "./routes/auth.js"

const app = express()

app.use(cors(corsOptions))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use("/", indexRouter)
app.use(verifyJWT)
app.use("/auth", authRouter)

export default app
