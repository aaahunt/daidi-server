const express = require("express")

// Middleware
const cors = require("cors")
const BodyParser = require("body-parser")

// Routes
var routes = require("./routes/all")

const app = express()

// Apply middleware
app.use(cors())
app.use(express.json())
app.use(BodyParser.json())
app.use(BodyParser.urlencoded({ extended: true }))

// Server static HTML files
app.use(express.static(__dirname + "/public"))

// Apply routes
app.use("/", routes)

module.exports = app
