const express = require("express")

// Import middleware
const cors = require("cors")
const BodyParser = require("body-parser")

// Routes
var routes = require("./routes/all")

// Initialise
const app = express()

// Apply middleware
app.use(express.json())

const corsOptions = require("./config/corsOptions")
app.use(cors(corsOptions))

app.use(BodyParser.json())
app.use(BodyParser.urlencoded({ extended: true }))

// Serve static HTML files
app.use(express.static(__dirname + "/public"))

// Apply routes
app.use("/", routes)

module.exports = app
