import Game from "./Game.js"

class GameManager {
  constructor() {
    /** @type {Record<string, Game>} */
    this.games = {
      diamond: new Game(),
      club: new Game(),
      heart: new Game(),
      spade: new Game(),
    }
  }

  seatPlayer(room, seat, player) {
    if (this.games[room].playerIsSat(player)) {
      throw new Error(`Player is already seated at ${room}`)
    }

    const game = this.games[room]

    if (game.isFull()) {
      throw new Error(`Game ${room} is full`)
    }

    if (game.seatTaken(seat)) {
      throw new Error(`Seat ${seat} is already taken`)
    }

    game.seatPlayer(player, seat)
  }

  addPlayer(room, player) {
    this.games[room].addPlayer(player)
  }

  playCards(room, player, cards) {
    if (this.games[room].playerActive(player)) {
      this.games[room].playCard(player, cards)
    }
  }

  passTurn(room, player) {
    if (!this.games[room]) {
      throw new Error("Player is not in that game")
    }

    return this.games[room].passTurn(player)
  }

  removePlayerFromGame(room, player) {
    this.games[room].removePlayer(player)
  }

  findPlayerRoom(player) {
    for (const [roomId, game] of Object.entries(this.games)) {
      if (game.playerIsSat(player)) {
        return roomId
      }
    }
    return null
  }

  getGame(room) {
    return this.games[room]
  }

  getGames() {
    return Object.fromEntries(
      Object.entries(this.games).map(([key, game]) => [
        key,
        {
          inProgress: game.inProgress,
          players: game.getNumberOfPlayersSat().length,
        },
      ]),
    )
  }
  gameReady(room) {
    return this.games[room].isReady()
  }

  gameInProgress(room) {
    return this.games[room].isInProgress()
  }

  playerReady(room, player, status) {
    this.games[room].setPlayerReady(player, status)
  }

  getPlayersInHand(room) {
    return this.games[room].getPlayersInHand()
  }

  getReadyPlayers(room) {
    return this.games[room].getReadyPlayers()
  }

  startGame(room) {
    this.games[room].startGame()
  }

  gamePlayerGameState(room, player) {
    return this.games[room].getPlayerGameState(player)
  }

  sharedGameState(room) {
    return this.games[room].getSharedGameState()
  }

  gameOver(room) {
    return this.games[room].gameOver()
  }

  playerWins(room, player) {
    return this.games[room].playerWins(player)
  }

  resetGame(room) {
    return this.games[room].resetGame()
  }
}

const gameManager = new GameManager()
export default gameManager
