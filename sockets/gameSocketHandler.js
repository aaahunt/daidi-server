import gameManager from "../game/gameManager.js"

export default (socket, io) => {
  console.log(`User connected: ${socket.username}`)

  // Emit list to newly connected user
  socket.emit("rooms", gameManager.getGameIds())

  socket.on("joinGame", ({ roomName }) => {
    gameManager.joinGame(roomName, socket.id)
    socket.join(roomName)
    io.to(roomName).emit("playerJoined", { playerId: socket.id })
    console.log(`Socket ${socket.id} joined game ${gameId}`)
  })

  socket.on("joinRoom", (name, callback) => joinRoom(socket, name, callback))

  socket.on("disconnect", () => {
    gameManager.leaveGame(socket.id)
    console.log(`Socket disconnected: ${socket.id}`)
  })
}
