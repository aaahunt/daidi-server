import Deck from "./Deck.js"

const CAPACITY = 4

export default class Game {
  constructor(id) {
    this.id = id
    this.inProgress = false
    this.activeSeatNumber = null
    this.seats = Object.fromEntries(Array.from({ length: CAPACITY }, (_, i) => [i + 1, null]))
    this.board = null
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
        if (this.numberOfPlayers() == 0) this.inProgress = false
        return true
      }
    }
    return false
  }

  hasPlayer(playerId) {
    return Object.values(this.seats).some((p) => p && p.userId === playerId)
  }

  isFull() {
    return this.numberOfPlayers() === CAPACITY
  }

  numberOfPlayers() {
    return Object.values(this.seats).filter((p) => p !== null).length
  }

  ready() {
    console.log(`game ready?`, this.numberOfPlayers(), this.inProgress)
    return this.numberOfPlayers() >= 2 && !this.inProgress
  }

  seatTaken(seatNumber) {
    this.seats[seatNumber] != null
  }

  occupiedSeats() {
    return Object.entries(this.seats).filter(([seat, occupant]) => occupant !== null)
  }

  findPlayerSeat(player) {
    const entry = Object.entries(this.seats).find(([seat, occupant]) => occupant && occupant.userId === player.userId)

    return entry ? entry[0] : null
  }

  getPlayerHand(userId) {
    return Object.values(this.seats).find((occupant) => occupant && occupant.userId === userId)?.hand
  }

  getPlayerGameState(userId) {
    return {
      inProgress: this.inProgress,
      activePlayer: this.activeSeatNumber,
      hand: this.getPlayerHand(userId),
      board: this.board,
    }
  }

  initGame() {
    this.inProgress = true

    const deck = new Deck()
    const hands = []
    let lowestCard = null
    let lowestSeat = null

    for (let [seat, occupant] of this.occupiedSeats()) {
      console.log("Game::startGame", occupant)
      const hand = deck.draw(13)
      this.sort(hand)
      if (lowestCard === null || hand[0].value < lowestCard.value) {
        console.log(`seat ${seat} has the now lowest card of ${hand[0].display} beating ${lowestCard?.display}`)
        lowestCard = hand[0]
        lowestSeat = seat
      }
      occupant.hand = hand
    }

    console.log("first player is ", lowestSeat)
    this.activeSeatNumber = lowestSeat
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
