/**
 * @typedef {import("../game/GameManager.js").default} GameManager
 * @typedef {import("../game/Player.js").default} Player
 * @typedef {import("socket.io").Server} Server
 * @typedef {import("socket.io").Socket} Socket
 */

import gameManager from "../game/GameManager.js"
import Game from "../game/Game.js"
import Player from "../game/Player.js"

export default (socket, io) => {
  io.on("error", (error) => {
    console.error("Socket.IO server error:", error)
  })

  const handlers = createGameHandlers(io, socket, gameManager)

  handlers.init()

  socket.on("quit", handlers.leaveRoom)
  socket.on("disconnect", handlers.disconnect)
  socket.on("logout", handlers.logout)
  socket.on("app/room/join", handlers.joinRoom)
  socket.on("app/room/leave", handlers.leaveRoom)
  socket.on("app/seat/join", handlers.joinSeat)
  socket.on("app/seat/leave", handlers.leaveSeat)
  socket.on("app/ready", handlers.ready)
  socket.on("game/play", handlers.play)
  socket.on("game/pass", handlers.pass)
}

/**
 * @param {Server} io
 * @param {Socket} socket
 * @param {GameManager} gameManager
 */
function createGameHandlers(io, socket, gameManager) {
  const player = new Player(socket)
  console.log(`User connected: ${player.username} at ${new Date().toLocaleTimeString()}`)

  function init() {
    socket.emit("app/games", gameManager.getGames())
    restoreGameState()
  }

  function joinRoom(room) {
    socket.join(room)
    gameManager.addPlayer(room, player)
    socket.emit("game/update", gameManager.sharedGameState(room))
  }

  function leaveRoom() {
    const room = gameManager.findPlayerRoom(player)
    console.log(`${player.username} leaving room: ${room}`)

    if (room != null) {
      gameManager.removePlayerFromGame(room, player)

      if (gameManager.gameOver(room)) {
        gameManager.resetGame(room)
      }

      io.in(room).emit("game/update", gameManager.sharedGameState(room))
      io.emit("app/games", gameManager.getGames())
      socket.leave(room)
    }
  }

  function joinSeat({ room, seat }) {
    gameManager.seatPlayer(room, seat, player)

    socket.join(room)

    socket.broadcast.emit("app/games", gameManager.getGames())
    io.to(room).emit("game/update", gameManager.sharedGameState(room))
  }

  function leaveSeat({ room, seat }) {
    gameManager.unseatPlayer(room, seat, player)

    socket.broadcast.emit("app/games", gameManager.getGames())
    io.to(room).emit("game/update", gameManager.sharedGameState(room))
  }

  function restoreGameState() {
    const room = gameManager.findPlayerRoom(player)
    if (!room) {
      return
    }

    socket.join(room)
    socket.emit("game/state", gameManager.gamePlayerGameState(room, player))
  }

  function ready(ready) {
    const room = gameManager.findPlayerRoom(player)

    gameManager.playerReady(room, player, ready)

    setTimeout(() => {
      attemptGameStart(room)
    }, 3000)
  }

  function attemptGameStart(room) {
    if (gameManager.gameReady(room)) {
      gameManager.startGame(room)

      gameManager.getPlayersInHand(room).forEach((player) => {
        io.to(player.socketId).emit("game/state", gameManager.gamePlayerGameState(room, player))
      })
    }

    io.in(room).emit("game/update", gameManager.sharedGameState(room))
  }

  function play(cards) {
    const room = gameManager.findPlayerRoom(player)

    try {
      gameManager.playCards(room, player, cards)
    } catch (e) {
      socket.emit("app/message", e.message)
    }

    if (gameManager.playerWins(room, player)) {
      gameManager.resetGame(room, player)
      socket.emit("app/message", "You win")
      socket.to(room).emit("app/message", "Game over. You lose.")
      io.to(room).emit("game/over")

      setTimeout(() => {
        attemptGameStart(room)
      }, 3000)
    }

    socket.emit("game/state", gameManager.gamePlayerGameState(room, player))
    io.to(room).emit("game/update", gameManager.sharedGameState(room))
  }

  function pass() {
    const room = gameManager.findPlayerRoom(player)

    gameManager.passTurn(room, player)
    io.in(room).emit("game/update", gameManager.sharedGameState(room))
  }

  function disconnect() {
    console.log(`User disconnected: ${player.username}`)
  }

  function logout() {
    leaveRoom()
    console.log(`User logged out: ${player.username}`)
  }

  function withError(handler) {
    return (...args) => {
      try {
        handler(...args)
      } catch (e) {
        socket.emit("app/message", e.message)
      }
    }
  }

  return {
    init,
    joinRoom: joinRoom,
    leaveRoom: leaveRoom,
    joinSeat: joinSeat,
    leaveSeat: leaveSeat,
    disconnect,
    logout,
    play: play,
    pass: pass,
    ready: ready,
    restoreGameState,
  }
}
