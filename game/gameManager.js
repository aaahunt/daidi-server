import Game from "./Game.js"

class GameManager {
  constructor() {
    /** @type {Record<string, Game>} */
    this.games = {
      diamond: new Game("diamond"),
      club: new Game("club"),
      heart: new Game("heart"),
      spade: new Game("spade"),
    }
  }

  seatPlayer(roomName, seatNumber, player) {
    for (const [gameName, game] of Object.entries(this.games)) {
      if (game.hasPlayer(player.userId)) {
        throw new Error(`Player is already seated at ${gameName}`)
      }
    }

    const game = this.games[roomName]
    if (!game) {
      throw new Error(`Game ${roomName} does not exist`)
    }

    if (game.isFull()) {
      throw new Error(`Game ${roomName} is full`)
    }

    if (game.seatTaken(seatNumber)) {
      throw new Error(`Seat ${seatNumber} is already taken`)
    }

    console.log(`adding player to game ${roomName}`)
    game.addPlayer(player, seatNumber)
  }

  playCard(gameId, playerId, card) {
    if (!this.games[gameId]) {
      return { success: false, message: "Game not found" }
    }

    return this.games[gameId].playCard(playerId, card)
  }

  removePlayerFromGame(playerId) {
    for (const [roomName, game] of Object.entries(this.games)) {
      const removed = game.removePlayer(playerId)
      if (removed) return roomName
    }

    return null
  }

  findPlayerRoom(userId) {
    for (const [roomId, game] of Object.entries(this.games)) {
      if (game.hasPlayer(userId)) {
        return roomId
      }
    }
    return null
  }

  getGame(gameId) {
    return this.games[gameId]
  }

  getGames() {
    return this.games
  }

  gameReady(gameId) {
    console.log(`is ${gameId} ready?`)
    return this.games[gameId].ready()
  }

  getPlayers(gameId) {
    return this.games[gameId].occupiedSeats()
  }

  startGame(gameId) {
    this.games[gameId].initGame()
  }

  gamePlayerGameState(room, userId) {
    return this.games[room].getPlayerGameState(userId)
  }
}

const gameManager = new GameManager()
export default gameManager
