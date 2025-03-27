import Game from "./Game.js"

const games = {}

export const joinGame = (gameId, playerId) => {
  if (!games[gameId]) {
    games[gameId] = new Game(gameId)
  }
  games[gameId].addPlayer(playerId)
}

export const playCard = (gameId, playerId, card) => {
  if (!games[gameId]) {
    return { success: false, message: "Game not found" }
  }
  return games[gameId].playCard(playerId, card)
}

export const leaveGame = (playerId) => {
  // Loop over all games and remove the player
  Object.values(games).forEach((game) => {
    game.removePlayer(playerId)
  })
}

const gameManager = { joinGame, playCard, leaveGame }

export default gameManager
