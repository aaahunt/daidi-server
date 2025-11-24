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
      if (game.hasPlayer(player)) {
        return { success: false, message: `Player is already seated at ${gameName}` }
      }
    }

    if (this.games[roomName].isFull()) {
      return { success: false, message: "Game is full" }
    }

    if (this.games[roomName].seatTaken(seatNumber)) {
      return { success: false, message: "Seat is already taken" }
    }

    console.log(`adding player to game ${roomName}`)
    this.games[roomName].addPlayer(player, seatNumber)
    return { success: true, message: "Player added to game" }
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

  getGame(gameId) {
    return this.games[gameId]
  }

  getGames() {
    return this.games
  }

  gameReady(gameId) {
    return this.games[gameId].ready()
  }

  getPlayers(gameId) {
    return this.games[gameId].occupiedSeats()
  }

  startGame(gameId) {
    this.games[gameId].initGame()
  }

  gamePlayerGameState(room, player) {
    return this.games[room].getPlayerGameState(player)
  }
}

const gameManager = new GameManager()
export default gameManager
