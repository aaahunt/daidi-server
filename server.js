const app = require("./app")
const http = require("http")

// dotenv module required to access .env variables
require("dotenv").config()

// Get port from environment and store in Express.
const port = normalizePort(process.env.PORT || "4000")
app.set("port", port)

// Create HTTP server.
const server = http.createServer(app)

// Listen on provided port, on all network interfaces.
server.listen(port)
server.on("listening", onListening)

// Functionality for socket interactions
const socket = require("./socket.js")
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
  let portNum = parseInt(val, 10)

  if (isNaN(portNum)) return val
  if (portNum >= 0) return portNum

  return false
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address()
  let bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port
  console.log("Listening on " + bind + "...")
}
