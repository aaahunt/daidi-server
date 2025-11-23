import Card from "./Card.js"
import { RANK_LIST } from "./ranks.js"
import { SUIT_LIST } from "./suits.js"

export default class Deck {
  constructor(shuffled = true) {
    this._deck = []

    for (const suit of SUIT_LIST) {
      for (const rank of RANK_LIST) {
        this._deck.push(new Card(suit, rank))
      }
    }

    if (shuffled) this.shuffle()
  }

  get count() {
    return this._deck.length
  }

  /**
   * Shuffle Function: Uses the Fisher-Yates algorithm
   * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
   * Essentially we iterate through the unsorted array and swap each index with another random index
   */
  shuffle() {
    let n = this._deck.length
    while (n) {
      // Get our random index, also decrement N
      let i = Math.floor(Math.random() * n--)

      // swap the position of deck[n] and deck[i]
      this._deck[n] = [this._deck[i], (this._deck[i] = this._deck[n])][0]
    }
  }

  drawOne() {
    const card = this._deck.pop()
    if (!card) throw new Error("Cannot draw from an empty deck.")
    return card
  }

  draw(n = 1) {
    if (n > this._deck.length) throw new Error(`Requested ${n} cards but only ${this._deck.length} remain.`)

    const cards = []
    while (n--) cards.push(this.drawOne())
    return cards
  }
}
