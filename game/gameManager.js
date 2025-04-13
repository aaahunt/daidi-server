import Game from "./Game.js"

class GameManager {
  constructor() {
    this.games = {
      diamond: new Game("diamond"),
      club: new Game("club"),
      heart: new Game("heart"),
      spade: new Game("spade"),
    }
  }

  seatPlayer(roomName, seatNumber, player) {
    // check if player is already in a game
    for (const [gameName, game] of Object.entries(this.games)) {
      if (game.hasPlayer(player)) {
        return { success: false, message: `player is already seated at ${gameName}` }
      }
    }

    // check if the room is full
    if (this.games[roomName].isFull()) {
      return { success: false, message: "Game is full" }
    }

    // check if seat is already taken
    if (this.games[roomName].players[seatNumber] !== null) {
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
    Object.values(this.games).forEach((game) => {
      game.removePlayer(playerId)
    })
  }

  getGame(gameId) {
    return this.games[gameId]
  }

  getGames() {
    return this.games
  }

  gameReady(gameId) {
    return this.games[gameId].players.length >= 2 && !this.games[gameId].inProgress
  }

  startGame(gameId) {
    this.games[gameId].startGame()
  }
}

const gameManager = new GameManager()
export default gameManager
