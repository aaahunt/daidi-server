export default class Player {
  constructor(socket) {
    const { id, userId, username } = socket
    this.id = userId
    this.socketId = id
    this.username = username
    this.seat = null
    this.ready = false
    this.active = false
    this.inHand = false
  }
}
