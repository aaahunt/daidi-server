import Deck from "./Deck.js"

const CAPACITY = 4

export default class Game {
  constructor(id) {
    this.id = id
    this.inProgress = false
    this.activePlayer = null
    this.seats = Object.fromEntries(Array.from({ length: CAPACITY }, (_, i) => [i + 1, null]))
    // Initialize additional game state here
  }

  addPlayer(player, seatNumber) {
    this.seats[seatNumber] = player
    console.log(`Player ${player.username} added to game ${this.id}`)
  }

  removePlayer(playerId) {
    for (const n in this.seats) {
      if (this.seats[n]?.userId === playerId) {
        this.seats[n] = null
        return true
      }
    }
    return false
  }

  hasPlayer(player) {
    return Object.values(this.seats).some((p) => p && p.userId === player.userId)
  }

  isFull() {
    return this.numberOfPlayers() === CAPACITY
  }

  numberOfPlayers() {
    return Object.values(this.seats).filter((p) => p !== null).length
  }

  ready() {
    return this.numberOfPlayers() >= 2 && !this.inProgress
  }

  seatTaken(seatNumber) {
    this.seats[seatNumber] != null
  }

  players() {
    return Object.entries(this.seats).filter(([seat, occupant]) => occupant !== null)
  }

  findPlayerSeat(player) {
    const entry = Object.entries(this.seats).find(([seat, occupant]) => occupant && occupant.userId === player.userId)

    return entry ? entry[0] : null
  }

  getPlayerHand(player) {
    return Object.entries(this.seats).find(([seat, occupant]) => occupant && occupant.userId === player.userId)?.hand
  }

  getPlayerGameState(player) {
    return {
      inProgress: this.inProgress,
      activePlayer: this.activePlayer,
      hand: this.getPlayerHand(player),
    }
  }

  initGame() {
    this.inProgress = true

    const deck = new Deck()
    const hands = []
    let lowestCard = null
    let lowestSeat = null

    for (let [seat, player] of this.players()) {
      console.log("Game::startGame", player)
      const hand = deck.draw(13)
      this.sort(hand)
      if (lowestCard === null || hand[0].value < lowestCard.value) {
        lowestCard = hand[0]
        lowestSeat = seat
      }
      player.hand = hand
    }

    this.activePlayer = this.seats[lowestSeat]
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

  determinePoints(cards) {
    return cards === 13
      ? cards * config.GAME.TOP_MULTIPLIER
      : cards > 9
      ? cards * config.GAME.MIDDLE_MULTIPLIER
      : cards * config.GAME.BOTTOM_MULTIPLIER
  }
}
