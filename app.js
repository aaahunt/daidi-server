var express = require("express")
const cors = require("cors")
const { verifyJWT } = require("./controllers/authController")

var app = express()

app.use(cors(require("./config/corsOptions")))
app.use(logger("dev"))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use("/", require("./routes/index"))
app.use(verifyJWT)
app.use("/auth", require("./routes/auth"))

module.exports = app
