function socket(server) {
  const { Server } = require("socket.io")

  // Import utility functions
  const { newHands } = require("./assets/utils.js")

  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  })

  // Initialise global users array
  let users = []

  // Pre-connection checks for username
  io.use((socket, next) => {
    const id = socket.handshake.auth.id
    const username = socket.handshake.auth.username

    if (!id || !username) return next(new Error("invalid credentials"))

    socket.userID = id
    socket.username = username

    next()
  })

  io.on("connection", (socket) => {
    handleNewUser(socket)

    // Add listeners
    socket.on("action", fowardAction)
    socket.on("challenge", challenge)
    socket.on("accept", accept)
    socket.on("play", play)
    socket.on("emoji", emoji)
    socket.on("disconnect", () => {
      users = users.filter((user) => user.socketID !== socket.id)
    })

    // Forward various messages to another user. i.e. Used for declining, resigning etc.
    function fowardAction(action, id, callback) {
      const user = findUser(id)
      if (!user) {
        if (callback) callback("error")
        return
      }

      socket.to(user.socketID).emit(action)
      if (callback) callback("success")
    }

    // Challenge the player with ID, apply the callback function to the challenger
    function challenge(id, callback) {
      const user = findUser(id)
      if (!user) {
        callback({
          header: "Error",
          body: "User is offline. Please try again.",
        })
        return
      }

      socket.to(user.socketID).emit("challenge", socket.userID, socket.username)
      callback({
        header: "Success",
        body: "Challenge sent",
      })
    }

    // Accept the challenge from player ID, apply the callback function to the acceptor
    function accept(id, callback) {
      const user = findUser(id)
      if (!user) return

      // Create the hands to play, and determine who goes first
      const [playerOneHand, playerTwohand] = newHands(13)
      const whoGoesFirst =
        playerOneHand[0].value < playerTwohand[0].value ? 1 : 2

      socket.to(user.socketID).emit("accepted", {
        hand: playerOneHand,
        playerNumber: 1,
        activePlayer: whoGoesFirst,
        opponent: {
          id: socket.userID,
          name: socket.username,
          passed: false,
          score: 0,
          cards: 13,
        },
      })
      callback({
        hand: playerTwohand,
        playerNumber: 2,
        activePlayer: whoGoesFirst,
        opponent: {
          id: user.userID,
          name: user.username,
          passed: false,
          score: 0,
          cards: 13,
        },
      })
    }

    // Inform our opponent of our played hand
    function play(hand, id, callback) {
      const user = findUser(id)
      if (!user) {
        callback("offline")
        return
      }
      socket.to(user.socketID).emit("play", hand)
      callback("success")
    }

    function emoji(emoji, id) {
      const user = findUser(id)
      if (!user) return

      socket.to(user.socketID).emit("emoji", emoji)
    }
  }) // End of "on Connection" functions

  // Utility function to add new user to global list and emit to others
  function handleNewUser(socket) {
    // Add newly connected user to users list
    users.push({
      socketID: socket.id,
      userID: socket.userID,
      username: socket.username,
    })

    // Emit list to newly connected user
    socket.emit("users", users)

    // tell everyone else we are here
    socket.broadcast.emit("user connected", {
      userID: socket.userID,
      username: socket.username,
    })
  }

  // Utility function to find a user from the global list of users
  function findUser(id) {
    return users.find((user) => user.userID === id)
  }
}
module.exports = socket
