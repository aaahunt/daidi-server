var app = require("./app")
var http = require("http")

// dotenv module required to access .env variables
require("dotenv").config()

// Get port from environment and store in Express.
var port = normalizePort(process.env.PORT || "4000")
app.set("port", port)

// Create HTTP server.
var server = http.createServer(app)

// Listen on provided port, on all network interfaces.
server.listen(port)
server.on("listening", onListening)

// Functionality for socket interactions
var socket = require("./socket.js")
socket(server)

// Functionality for interacting with MongoDB
const mongoose = require("mongoose")
const uri = process.env.ATLAS_URI
mongoose.connect(uri)

const connection = mongoose.connection
connection.once("open", () => {
  console.log("Connected to MongoDB")
})

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10)

  if (isNaN(port)) return val
  if (port >= 0) return port

  return false
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address()
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port
  console.log("Listening on " + bind + "...")
}
