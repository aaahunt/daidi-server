import gameManager from "../game/gameManager.js" // This is now a class instance
import Player from "../game/Player.js"

export default (socket, io) => {
  console.log(`User connected: ${socket.username}`)

  // Send the current games state to the newly connected client
  socket.emit("games", gameManager.getGames())

  // Add event listeners for the various actions
  socket.on("joinRoom", (roomName, seatNumber, callback) => joinRoom(io, socket, roomName, seatNumber, callback))
  socket.on("action", (action, id, callback) => fowardAction(socket, action, id, callback))
  socket.on("play", (hand, id, callback) => play(socket, hand, id, callback))
  socket.on("disconnect", () => disconnect(socket))
}

function joinRoom(io, socket, roomName, seatNumber, callback) {
  const player = new Player(socket.id, socket.user_id, socket.username)
  console.log(`${player.username} is attempting to join room ${roomName}, seat #${seatNumber}`)

  const result = gameManager.seatPlayer(roomName, seatNumber, player)

  callback(result)

  if (!result.success) {
    console.log(`User ${player.username} failed to join room ${roomName} seat ${seatNumber}: ${result.message}`)
    return
  }

  socket.join(roomName)
  io.to(roomName).emit("games", gameManager.getGames())

  if (gameManager.gameReady(roomName)) {
    console.log(`Game ${roomName} is ready to start`)

    gameManager.startGame(roomName)
    // send each player in the game their hand
    gameManager.getGame(roomName).players.forEach((player) => {
      io.to(player).emit("gameState", gameManager.getGame(roomName))
    })
  }
}

function disconnect(socket) {
  console.log(`User disconnected: ${socket.username}`)
  gameManager.removePlayerFromGame(socket.id)
}
