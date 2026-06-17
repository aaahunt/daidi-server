import { sortByValue } from "../assets/utils.js"
import Deck from "./Deck.js"
import { handBeatsBoard, handIsValidDaiDi } from "./handRanking.js"

export default class Game {
  constructor() {
    this.inProgress = false
    this.players = new Map()
    this.board = []
    this.history = []
  }

  addPlayer(player) {
    this.players.set(player.id, player)
  }

  removePlayer(player) {
    this.players.delete(player.id)
  }

  seatPlayer(player, seat) {
    player.seat = seat
    this.players.set(player.id, player)
  }

  unseatPlayer(player, seat) {
    const p = this.players.get(player.id)
    if (p) {
      p.seat = null
    }
  }

  filterPlayers(func) {
    return [...this.players.values()].filter(func)
  }

  playerIsSat(player) {
    const p = this.players.get(player.id)
    return p?.seat != null
  }

  getOccupiedSeats() {
    return this.filterPlayers((player) => player.seat)
  }

  getNumberOfPlayersSat() {
    return this.getOccupiedSeats().length
  }

  getReadyPlayers() {
    return this.filterPlayers((player) => player.ready)
  }

  getNumberOfActivePlayers() {
    return this.getReadyPlayers().length
  }

  getPlayersInHand() {
    return this.filterPlayers((player) => player.inHand)
  }

  isFull() {
    return this.getNumberOfPlayersSat() === 4
  }

  isReady() {
    return this.getNumberOfActivePlayers() > 1 && !this.inProgress
  }

  isInProgress() {
    return this.inProgress
  }

  setPlayerReady(player, status) {
    const p = this.players.get(player.id)
    if (p) {
      p.ready = status
    }
  }

  getPlayerBySeat(seat) {
    return this.filterPlayers((player) => player.seat === seat)
  }

  seatTaken(seat) {
    return this.getPlayerBySeat(seat).length === 1
  }

  getPlayerHand(player) {
    return this.players.get(player.id)?.hand
  }

  playerActive(player) {
    return this.players.get(player.id)?.active
  }

  getPublicSeats() {
    const entries = this.filterPlayers((player) => player?.seat != null).map((player) => {
      const { socketId, hand, ...publicPlayer } = player
      return [player.seat, publicPlayer]
    })

    return Object.fromEntries(entries)
  }

  getObservers() {
    return [...this.players.entries()].filter((player) => player?.seat == null).length
  }

  removeCards(player, cards) {
    const p = this.players.get(player.id)
    if (!p.inHand || !p.hand?.length > 0) {
      throw new Error("Player is not in a hand")
    }

    const toRemove = new Set(cards.map((c) => c.value))
    p.hand = p?.hand.filter((c) => !toRemove.has(c.value))
  }

  getSharedGameState() {
    return {
      inProgress: this.inProgress,
      board: this.board,
      history: this.history,
      seats: this.getPublicSeats(),
      observers: this.getObservers(),
    }
  }

  getPlayerGameState(player) {
    const p = this.players.get(player.id)

    return {
      ...this.getSharedGameState(),
      hand: p?.hand,
    }
  }

  startGame() {
    this.inProgress = true

    const deck = new Deck()
    const hands = []
    let lowest = Number.MAX_VALUE
    let starting = null

    for (const player of Object.entries(this.getReadyPlayers())) {
      const hand = deck.draw(13)
      sortByValue(hand)
      if (hand[0].value < lowest) {
        lowest = hand[0].value
        starting = parseInt(seat)
      }
      player.hand = hand
      player.inHand = true
    }

    const startingPlayer = getPlayerBySeat(starting)
    startingPlayer.active = true
  }

  playCard(player, cards) {
    if (!handIsValidDaiDi(cards)) {
      throw new Error("Hand is not a valid Dai Di poker hand")
    }

    if (!handBeatsBoard(cards, this.board)) {
      throw new Error("Hand does not beat the current board")
    }

    this.updateBoard(cards)
    this.removeCards(player, cards)
    this.nextPlayer()
  }

  passTurn(player) {
    const p = this.players.get(player.id)
    if (p) {
      p.passed = true
    }

    this.nextPlayer()

    if (this.allPlayersPassed()) {
      this.getPlayersInHand().forEach((p) => (p.passed = false))
      this.history.push(this.board)
      this.board = []
    }
  }

  updateBoard(cards) {
    this.history.push(this.board)
    this.board = cards
  }

  nextPlayer() {
    const players = this.getPlayersInHand()
    const currentIndex = players.find((seat) => seat?.active)
    // @TODO: add logic
  }

  allPlayersPassed() {
    const playersInHand = this.getPlayersInHand()
    const passedCount = playersInHand.filter((player) => player.passed).length

    return passedCount === playersInHand.length - 1
  }

  gameOver() {
    console.log("gameOver?", this.getPlayersInHand().length, this.isInProgress())
    return this.getPlayersInHand().length < 2 && this.isInProgress()
  }

  playerWins(player) {
    return this.getPlayerHand(player).length === 0
  }

  resetGame() {
    this.board = []
    this.history = []

    for (let [seat, occupant] of Object.entries(this.getReadyPlayers())) {
      occupant.hand = []
      occupant.inHand = false
    }
  }

  determinePoints(cards) {
    return cards === 13
      ? cards * config.GAME.TOP_MULTIPLIER
      : cards > 9
      ? cards * config.GAME.MIDDLE_MULTIPLIER
      : cards * config.GAME.BOTTOM_MULTIPLIER
  }
}
