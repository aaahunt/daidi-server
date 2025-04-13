import Deck from "./Deck.js"

export default class Game {
  constructor(id) {
    this.id = id
    this.players = [null, null, null, null]
    this.inProgress = false
    this.activePlayer = null
    // Initialize additional game state here
  }

  addPlayer(player, seatNumber) {
    this.players[seatNumber] = player
    console.log(`Player ${player.username} added to game ${this.id}`)
  }

  removePlayer(playerId) {
    this.players = this.players.filter((id) => id !== playerId)
  }

  hasPlayer(player) {
    return this.players.some((p) => p && p.socketId === player.socketId)
  }

  isFull() {
    return this.players.filter((p) => p !== null).length === 4
  }

  startGame() {
    this.inProgress = true

    const deck = new Deck()
    const hands = []
    let lowestCard = null
    let lowestPlayer = null

    for (let i = 0; i < this.players.length; i++) {
      const hand = deck.draw(13)
      this.sort(hand)
      hands[i] = hand
      if (lowestCard === null || hand[0].value < lowestCard.value) {
        lowestCard = hand[0]
        lowestPlayer = i
      }
    }

    this.activePlayer = this.players[lowestPlayer]
  }

  playCard(playerId, card) {
    // Implement game rules, validation, and state updates here
    console.log(`Player ${playerId} played card ${card} in game ${this.id}`)
    // For example, validate the move and update the game state.
    return { success: true } // Return a result object or game state update as needed
  }

  /**
   * Custom sorting function to sort the hand by card values
   *
   * @param {Array}   Hand            The hand to be sorted
   * @return {Array}                  Returns the sorted hand
   */
  sort(Hand) {
    return Hand.sort((a, b) => (a.value < b.value ? -1 : 1))
  }
}
