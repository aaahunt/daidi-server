import { sortByValue, Status } from "../assets/utils.js"
import Deck from "./Deck.js"
import { handBeatsBoard, handIsValidDaiDi } from "./handRanking.js"

export default class Game {
  constructor() {
    this.players = new Map()
    this.inProgress = false
    this.board = []
    this.history = []
  }

  selectPlayers(func) {
    return [...this.players.values()].filter(func)
  }

  getPlayer(player) {
    return this.players.get(player.id)
  }

  setPlayer(player) {
    this.players.set(player.id, player)
  }

  updatePlayer(player, updates) {
    const p = this.getPlayer(player)
    if (p) {
      Object.assign(p, updates)
    }
  }

  hasPlayer(player) {
    return this.players.has(player.id)
  }

  addPlayer(player) {
    if (!this.hasPlayer(player)) {
      this.setPlayer(player)
    }
  }

  removePlayer(player) {
    this.players.delete(player.id)
  }

  seatPlayer(player, seat) {
    this.updatePlayer(player, { seat })
  }

  unseatPlayer(player, seat) {
    this.updatePlayer(player, { seat: null })
  }

  playerIsSat(player) {
    return this.getPlayer(player)?.seat != null
  }

  getPlayersSat() {
    return this.selectPlayers((player) => player.seat != null)
  }

  getNumberOfPlayersSat() {
    return this.getPlayersSat().length
  }

  getReadyPlayers() {
    return this.selectPlayers((player) => player.status === Status.READY)
  }

  getNumberOfActivePlayers() {
    return this.getReadyPlayers().length
  }

  playerIsInHand(player) {
    const p = this.getPlayer(player)
    return p?.status === Status.TAKING_TURN || p?.status === Status.WAITING_FOR_TURN || p?.status === Status.PASSED
  }

  getPlayersInHand() {
    return this.selectPlayers(
      (p) => p.status === Status.TAKING_TURN || p.status === Status.WAITING_FOR_TURN || p.status === Status.PASSED,
    )
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

  setPlayerReady(player, ready) {
    this.updatePlayer(player, { status: ready ? Status.READY : Status.SAT_OUT })
  }

  getPlayerBySeat(seat) {
    return this.selectPlayers((player) => player.seat === seat)[0]
  }

  seatTaken(seat) {
    return !!this.getPlayerBySeat(seat)
  }

  getPlayerHand(player) {
    return this.getPlayer(player)?.hand
  }

  isPlayersTurn(player) {
    return this.getPlayer(player)?.status === Status.TAKING_TURN
  }

  getPublicSeats() {
    const entries = this.selectPlayers((player) => player?.seat != null).map((player) => {
      const { socketId, hand, ...publicPlayer } = player
      return [player.seat, publicPlayer]
    })

    return Object.fromEntries(entries)
  }

  getObservers() {
    return this.selectPlayers((player) => player?.seat == null).length
  }

  removeCards(player, cards) {
    const p = this.getPlayer(player)
    if (!this.playerIsInHand(player) || this.getPlayerHand(player).length === 0) {
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
    return {
      ...this.getSharedGameState(),
      hand: this.getPlayerHand(player),
    }
  }

  startGame() {
    this.inProgress = true

    const deck = new Deck()
    let lowest = Number.MAX_VALUE
    let starting = null

    for (const player of this.getReadyPlayers()) {
      const hand = deck.draw(13)
      sortByValue(hand)

      if (hand[0].value < lowest) {
        lowest = hand[0].value
        starting = parseInt(player.seat, 10)
      }

      player.hand = hand
      player.status = Status.WAITING_FOR_TURN
    }

    const startingPlayer = this.getPlayerBySeat(starting)
    startingPlayer.status = Status.TAKING_TURN
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
    this.updatePlayer(player, { status: Status.WAITING_FOR_TURN })
    this.nextPlayer(player)
  }

  passTurn(player) {
    console.log(`Player ${player.username} is passing their turn`)
    this.updatePlayer(player, { status: Status.PASSED })
    const nextPlayer = this.nextPlayer(player)

    if (this.allPlayersPassed()) {
      this.getPlayersInHand().forEach((p) => (p.status = Status.WAITING_FOR_TURN))
      nextPlayer.status = Status.TAKING_TURN
      this.history.push(this.board)
      this.board = []
    }
  }

  updateBoard(cards) {
    this.history.push(this.board)
    this.board = cards
  }

  nextPlayer(player) {
    const players = this.getPlayersInHand().sort((a, b) => a.seat - b.seat)
    const activePlayer = players.find((p) => p?.seat === player.seat)

    // If the active player is the last in the array, we want to loop back to the first player, otherwise we just want to get the next player in the array
    const nextPlayerIndex = (players.indexOf(activePlayer) + 1) % players.length
    const nextPlayer = players[nextPlayerIndex]

    this.updatePlayer(nextPlayer, { status: Status.TAKING_TURN })
    return nextPlayer
  }

  allPlayersPassed() {
    const playersInHand = this.getPlayersInHand()
    const passedCount = playersInHand.filter((player) => player.status === Status.PASSED).length

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
    this.inProgress = false

    for (const player of this.getPlayersSat()) {
      player.hand = []
      player.status = Status.READY
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
