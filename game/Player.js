import { Status } from "../assets/utils.js"

export default class Player {
  constructor(socket) {
    const { id, userId, username } = socket
    this.id = userId
    this.socketId = id
    this.username = username
    this.status = Status.SAT_OUT
    this.seat = null
  }
}
