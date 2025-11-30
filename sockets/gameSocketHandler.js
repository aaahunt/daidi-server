/**
 * @typedef {import("../game/GameManager.js").default} GameManager
 * @typedef {import("../game/Player.js").default} Player
 * @typedef {import("socket.io").Server} Server
 * @typedef {import("socket.io").Socket} Socket
 */

import gameManager from "../game/GameManager.js"
import Player from "../game/Player.js"
import actions from "./actions.js"

export default (socket, io) => {
  console.log(`User connected: ${socket.username} at ${new Date().toLocaleTimeString()}`)

  // Send the current games state to the newly connected client
  socket.emit(actions.GAMES, gameManager.getGames())

  const handlers = createGameHandlers(io, socket, gameManager)

  // If user is already in a room, add him to the socket group and send him the game state again
  handlers.getGameState()

  // Event Listeners
  socket.on(actions.JOIN, handlers.joinRoom)
  socket.on(actions.LEAVE, handlers.leaveRoom)
  socket.on(actions.GAME_ACTION, handlers.action)
  socket.on(actions.LOGOUT, handlers.logout)
  socket.on("disconnect", handlers.disconnect)
}

/**
 * @param {Server} io
 * @param {Socket} socket
 * @param {GameManager} gameManager
 */
function createGameHandlers(io, socket, gameManager) {
  const player = new Player(socket.id, socket.userId, socket.username)

  function joinRoom(payload) {
    const room = payload.room
    const seat = payload.seat

    console.log(`${player.username} is attempting to join room ${room}, seat #${seat}`)

    try {
      gameManager.seatPlayer(room, seat, player)
    } catch (e) {
      console.log(`User ${player.username} failed to join room ${room} seat ${seat}: ${e.message}`)
      socket.emit(actions.MESSAGE, e.message)
      return
    }

    socket.join(room)
    // io.to(room).emit(actions.GAMES, gameManager.getGames())

    if (gameManager.gameReady(room)) {
      console.log(`Game ${room} is ready to start`)

      gameManager.startGame(room)

      gameManager.getPlayers(room).forEach(([seat, player]) => {
        console.log("sending game state to", player.username)

        const playersGameState = gameManager.gamePlayerGameState(room, player)

        io.to(player.socketId).emit(actions.GAME_STATE, playersGameState)
      })
    }
  }

  function getGameState() {
    const userId = socket.userId

    console.log(`Is user ${userId} already in a room?`)
    const room = gameManager.findPlayerRoom(userId)
    console.log("room", room)
    if (!room) {
      return
    }

    console.log(`${socket.username} is already in room ${room}, restoring game state`)

    // ensure they join the socket.io room
    socket.join(room)

    const playersGameState = gameManager.gamePlayerGameState(room, userId)
    socket.emit(actions.GAME_STATE, playersGameState)
  }

  // -------------------------------------------------------
  // GAME ACTION
  // -------------------------------------------------------
  function action(payload) {
    console.log("on action", payload)
  }

  function play(payload) {
    console.log("on play", payload)
  }

  // -------------------------------------------------------
  // LEAVE ROOM
  // -------------------------------------------------------
  function leaveRoom() {
    console.log(`User left game: ${socket.username} / ${socket.userId}`)

    const room = gameManager.removePlayerFromGame(socket.userId)
    console.log(`removed from ${room}`)

    socket.emit(actions.GAMES, gameManager.getGames())

    if (room != null) {
      io.to(room).emit(actions.GAMES, gameManager.getGames())
    } else {
      socket.emit(actions.MESSAGE, "You are not sat at that game")
    }
  }

  // -------------------------------------------------------
  // DISCONNECT
  // -------------------------------------------------------
  function disconnect() {
    console.log(`User disconnected: ${socket.username}`)
  }

  // -------------------------------------------------------
  // LOGOUT
  // -------------------------------------------------------
  function logout() {
    leaveRoom()
    console.log(`User logged out: ${socket.username}`)
  }

  return { action, joinRoom, leaveRoom, disconnect, logout, play, getGameState }
}
