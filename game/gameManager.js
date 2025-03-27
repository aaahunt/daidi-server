import Game from "./Game.js"

const games = {
  room1: null,
  room2: null,
  room3: null,
}

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
    if (game) {
      game.removePlayer(playerId)
    }
  })
}

export const getGame = (gameId) => {
  return games[gameId]
}

export const getGameIds = () => {
  return Object.keys(games)
}

const gameManager = { joinGame, playCard, leaveGame, getGame, getGameIds }

export default gameManager
