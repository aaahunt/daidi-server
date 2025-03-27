import Card from "./Card.js"

/**
 * Deck Class: Represents a deck of 52 playing cards
 *
 * @param {Boolean} shuffled - Whether the deck should be shuffled initially
 * @returns {Deck} - A new deck object
 */
export default class Deck {
  constructor(shuffled = true) {
    this.deck = []
    const suits = ["diamond", "club", "heart", "spade"]
    const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

    for (let suit of suits) {
      for (let rank of ranks) {
        this.deck.push(new Card(suit, rank))
      }
    }

    if (shuffled) {
      this.shuffle()
    }
  }

  /**
   * Shuffle Function: Uses the Fisher-Yates algorithm
   * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
   * Essentially we iterate through the unsorted array and swap each index with another random index
   */
  shuffle() {
    let n = this.deck.length
    while (n) {
      // Get our random index, also decrement N
      let i = Math.floor(Math.random() * n--)

      // swap the position of deck[n] and deck[i]
      this.deck[n] = [this.deck[i], (this.deck[i] = this.deck[n])][0]
    }
  }

  /**
   *
   * @param {Integer} n The number of cards we want to draw from the deck object
   * @returns {Array} N cards
   */
  draw(n) {
    const cards = []
    while (n--) {
      let card = this.deck.pop()
      if (!card) {
        throw new Error("Not enough cards in the deck, you requested " + n + " but the deck only had " + cards.length)
      }
      cards.push(card)
    }

    return cards
  }
}
