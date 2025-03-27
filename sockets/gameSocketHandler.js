import gameManager from "../game/gameManager.js"

export default (io, socket) => {
  //   handleNewUser(socket)

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

  // Add listeners
  //   socket.on("action", (action, id, callback) => fowardAction(socket, action, id, callback))
  //   socket.on("challenge", (id, callback) => challenge(socket, id, callback))
  //   socket.on("accept", (id, callback) => accept(socket, id, callback))
  //   socket.on("play", (hand, id, callback) => play(socket, hand, id, callback))
  //   socket.on("resign", (id, callback) => resign(socket, id, callback))
  //   socket.on("emoji", (emoji, id) => sendEmoji(socket, emoji, id))
  //   socket.on("createRoom", (callback) => createRoom(socket, callback))
  //   socket.on("leaveRoom", (name, callback) => leaveRoom(socket, name, callback))
  //   socket.on("joinRoom", (name, callback) => joinRoom(socket, name, callback))
  //   socket.on("disconnect", () => {
  //     users = users.filter((user) => user.socketID !== socket.id)
  //   })
}
