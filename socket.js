function socket(server) {
  const { Server } = require("socket.io")
  const jwt = require("jsonwebtoken")

  const { generateSlug, totalUniqueSlugs } = require("random-word-slugs")
  const { newHands } = require("./assets/utils.js")
  const config = require("./assets/config")

  // create IO object, allow all CORS requests
  const io = new Server(server, {
    cors: { origin: "*" },
  })

  // Initialise global users array
  let users = []

  // Pre-connection checks for username
  io.use((socket, next) => {
    const id = socket.handshake.auth.user_id
    const username = socket.handshake.auth.username
    const token = socket.handshake.auth.access_token

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return next(new Error("invalid token"))
    })

    if (!id || !username) return next(new Error("invalid credentials"))

    socket.user_id = id
    socket.username = username

    next()
  })

  io.on("connection", (socket) => {
    handleNewUser(socket)

    // Add listeners
    socket.on("action", (action, id, callback) =>
      fowardAction(socket, action, id, callback)
    )
    socket.on("challenge", (id, callback) => challenge(socket, id, callback))
    socket.on("accept", (id, callback) => accept(socket, id, callback))
    socket.on("play", (hand, id, callback) => play(socket, hand, id, callback))
    socket.on("emoji", (emoji, id) => sendEmoji(socket, emoji, id))
    socket.on("createRoom", (callback) => createRoom(socket, callback))
    socket.on("leaveRoom", (name, callback) =>
      leaveRoom(socket, name, callback)
    )
    socket.on("joinRoom", (name, callback) => joinRoom(socket, name, callback))
    socket.on("disconnect", () => {
      users = users.filter((user) => user.socketID !== socket.id)
    })
  })

  // Utility function to add new user to global list and emit to others
  function handleNewUser(socket) {
    // Add newly connected user to users list
    users.push({
      socketID: socket.id,
      user_id: socket.user_id,
      username: socket.username,
    })

    // Emit list to newly connected user
    socket.emit("users", users, getRooms())

    // tell everyone else we are here
    socket.broadcast.emit("user connected", {
      user_id: socket.user_id,
      username: socket.username,
    })
  }

  // Simple function to create a game object for a given player
  // Args: player number, hands object, player who goes first, opponent object (could be socket or user)
  function createGameObject(player, hands, first, opponent) {
    return {
      hand: hands[player - 1],
      playerNumber: player,
      activePlayer: first,
      opponent: {
        user_id: opponent.user_id,
        name: opponent.username,
        passed: false,
        score: 0,
        cards: 13,
      },
    }
  }

  // Get the list of player created rooms and return as array of objects which includes name and number of players
  function getRooms() {
    let rooms = []
    let socketRooms = io.of("/").adapter.rooms

    outter: for (let [key, value] of socketRooms) {
      let players = []
      for (let socketID of value) {
        if (key == socketID) continue outter
        players.push(findUserBySocket(socketID))
      }
      rooms.push({ name: key, players })
    }

    return rooms
  }

  function getRoom(name) {
    let rooms = getRooms()
    return rooms.find((room) => room.name == name)
  }

  function leaveRoom(socket, name, callback) {
    socket.leave(name)
    callback(getRooms())
  }

  function joinRoom(socket, room, callback) {
    socket.join(room)
    callback(getRooms())
  }

  function createRoom(socket, callback) {
    let roomName
    do {
      roomName = generateSlug(3, config.ROOM.NAME_OPTIONS)
    } while (typeof getRoom(roomName) != "undefined")

    socket.join(roomName)
    callback(roomName, getRooms())
  }

  // Inform our opponent of our played hand
  function play(socket, hand, id, callback) {
    const opponent = findUserById(id)
    if (!opponent) {
      callback("offline")
      return
    }
    socket.to(opponent.socketID).emit("play", hand)
    callback("success")
  }

  // Emit the emoji to our opponent
  const sendEmoji = (socket, emoji, id) => {
    const opponent = findUserById(id)
    if (!opponent) return

    socket.to(opponent.socketID).emit("emoji", emoji)
  }

  // Accept the challenge from player ID, apply the callback function to the acceptor
  function accept(socket, id, callback) {
    const opponent = findUserById(id)
    if (!opponent) return

    // Create the hands to play, and determine who goes first (player with lowest ranked card)
    const hands = newHands(13)
    const first = hands[0][0].value < hands[1][0].value ? 1 : 2

    // Emit game object to our opponent, with initial state
    socket
      .to(opponent.socketID)
      .emit("accepted", createGameObject(1, hands, first, socket))

    // Callback to user with their game object
    callback(createGameObject(2, hands, first, opponent))
  }
  // Forward various messages to another user. i.e. Used for declining, resigning etc.
  function fowardAction(socket, action, id, callback) {
    const opponent = findUserById(id)
    if (!opponent) {
      if (callback) callback("error")
      return
    }

    socket.to(opponent.socketID).emit(action)
    if (callback) callback("success")
  }

  // Challenge the player with ID, apply the callback function to the challenger
  function challenge(socket, id, callback) {
    const opponent = findUserById(id)
    if (!opponent) {
      callback({
        header: "Error",
        body: "User is offline. Please try again.",
      })
      return
    }

    socket
      .to(opponent.socketID)
      .emit("challenge", socket.user_id, socket.username)
    callback({
      header: "Success",
      body: "Challenge sent",
    })
  }

  // Utility function to find a user by ID
  function findUserById(id) {
    return users.find((user) => user.user_id === id)
  }

  // Utility function to find a user by socket ID
  function findUserBySocket(socketID) {
    return users.find((user) => user.socketID === socketID)
  }
}
module.exports = socket
