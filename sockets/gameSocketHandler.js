/**
 * @typedef {import("../game/GameManager.js").default} GameManager
 * @typedef {import("../game/Player.js").default} Player
 * @typedef {import("socket.io").Server} Server
 * @typedef {import("socket.io").Socket} Socket
 */

/**
 * @typedef {import("../game/GameManager.js").default} GameManager
 * @typedef {import("../game/Player.js").default} Player
 * @typedef {import("socket.io").Server} Server
 * @typedef {import("socket.io").Socket} Socket
 */

import gameManager from "../game/GameManager.js" // This is now a class instance
import Player from "../game/Player.js"
import actions from "./actions.js"

export default (socket, io) => {
  let timeNow = new Date()
  console.log(`User connected: ${socket.username} at ${timeNow.toLocaleTimeString()}`)

  // Send the current games state to the newly connected client
  socket.emit(actions.GAMES, gameManager.getGames())

  const handlers = createGameHandlers(io, socket, gameManager)

  // Add event listeners
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
/**
 * @param {Server} io
 * @param {Socket} socket
 * @param {GameManager} gameManager
 */
function createGameHandlers(io, socket, gameManager) {
  function joinRoom(payload) {
    const player = new Player(socket.id, socket.user_id, socket.username)
    const room = payload.room
    const seat = payload.seat

    console.log(`${player.username} is attempting to join room ${room}, seat #${seat}`)

    const result = gameManager.seatPlayer(room, seat, player)

    if (!result.success) {
      console.log(`User ${player.username} failed to join room ${room} seat ${seat}: ${result.message}`)
      socket.emit(actions.JOIN_FAILED, result.message)
      return
    }

    socket.join(room)
    io.to(room).emit(actions.GAMES, gameManager.getGames())

    if (gameManager.gameReady(room)) {
      console.log(`Game ${room} is ready to start`)

      gameManager.startGame(room)

      gameManager.getPlayers(room).forEach(([seat, player]) => {
        console.log("sending game state to ", player)
        io.to(player.socketId).emit("game/startGame", gameManager.gamePlayerGameState(room, player))

      gameManager.getPlayers(room).forEach(([seat, player]) => {
        console.log("sending game state to ", player.username)
        const playersGameState = gameManager.gamePlayerGameState(room, player)
        io.to(player.socketId).emit("startGame", playersGameState)
      })
    }
  }

  function action(payload) {
    console.log("on action", payload)
  }

  function play(payload) {
    console.log("on play", payload)
  }

  function leaveRoom() {
    console.log(`User left game: ${socket.username} / ${socket.user_id}`)
  function leaveRoom() {
    console.log(`User left game: ${socket.username} / ${socket.user_id}`)
    let room = gameManager.removePlayerFromGame(socket.user_id)

    console.log(`removed from ${room}`)

    console.log(`removed from ${room}`)
    socket.emit(actions.GAMES, gameManager.getGames())

    if (room != null) {
      io.to(room).emit(actions.GAMES, gameManager.getGames())
    }
  }

  function disconnect() {
    console.log(`User disconnected: ${socket.username}`)
    console.log(`User disconnected: ${socket.username}`)
  }

  function logout() {
    leaveRoom()
    console.log(`User disconnected: ${socket.username}`)
  }

  return { action, joinRoom, leaveRoom, disconnect, logout }
}
