import gameManager from "../game/GameManager.js" // This is now a class instance
import Player from "../game/Player.js"

export default (socket, io) => {
  let timeNow = new Date()
  console.log(`User connected: ${socket.username} at ${timeNow.toLocaleTimeString()}`)

  // Send the current games state to the newly connected client
  socket.emit("games", gameManager.getGames())

  const handlers = createGameHandlers(io, socket, gameManager)

  // Add event listeners
  socket.on("joinRoom", handlers.joinRoom)
  socket.on("leaveRoom", handlers.leaveRoom)
  socket.on("action", handlers.action)
  socket.on("play", handlers.play)
  socket.on("disconnect", handlers.disconnect)
}

function createGameHandlers(io, socket, gameManager) {
  function joinRoom(payload) {
    const player = new Player(socket.id, socket.user_id, socket.username)
    const room = payload.room
    const seat = payload.seat

    console.log(JSON.stringify(payload))
    console.log(`${player.username} is attempting to join room ${room}, seat #${seat}`)

    const result = gameManager.seatPlayer(room, seat, player)

    if (!result.success) {
      console.log(`User ${player.username} failed to join room ${room} seat ${seat}: ${result.message}`)
      return
    }

    socket.join(room)
    io.to(room).emit("games", gameManager.getGames())

    if (gameManager.gameReady(room)) {
      console.log(`Game ${room} is ready to start`)

      gameManager.startGame(room)
      // send each player in the game their hand
      gameManager.getGame(room).players.forEach((player) => {
        io.to(player).emit("gameState", gameManager.getGame(room))
      })
    }
  }

  function action(payload) {
    console.log("on action", payload)
  }

  function play(payload) {
    console.log("on play", payload)
  }

  function leaveRoom(payload) {
    console.log(`User left game: ${socket.username} / ${socket.user_id}`, payload)
    let room = gameManager.removePlayerFromGame(socket.user_id)

    if (room != null) {
      io.to(room).emit("games", gameManager.getGames())
    }
  }

  function disconnect() {
    console.log(`User disconnected: ${socket.username}, removing ${socket.user_id}`)
    gameManager.removePlayerFromGame(socket.user_id)
  }

  return { action, play, joinRoom, leaveRoom, disconnect }
}
