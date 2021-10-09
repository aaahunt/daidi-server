/**
 * Deck class used for creating deck of cards object
 */
class Deck {
  constructor() {
    this.deck = []
    const suitValues = [0, 0.25, 0.5, 0.75]
    const suitAscii = ["♦", "♣", "♥", "♠"]
    const suits = ["diamond", "club", "heart", "spade"]
    const rankValues = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    const ranks = [
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "T",
      "J",
      "Q",
      "K",
      "A",
      "2",
    ]
    // Loop through each suit and rank to generate the deck oject
    for (let s in suits)
      for (let r in ranks)
        this.deck.push({
          rank: ranks[r],
          rankValue: rankValues[r],
          suit: suits[s],
          suitAscii: suitAscii[s],
          suitValue: suitValues[s],
          value: rankValues[r] + suitValues[s],
          display: `${ranks[r]}${suits[s].charAt(0)}`,
        })
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

      // This scary looking line is just swapping the position of deck[n] and deck[i]
      this.deck[n] = [this.deck[i], (this.deck[i] = this.deck[n])][0]
    }
  }

  /**
   *
   * @param {Number} n The number of cards we want to draw from the deck object
   * @returns {Array} N cards
   */
  draw(n) {
    const cards = []
    // Pop first card in the deck and push to cards array
    while (n--) cards.push(this.deck.pop())

    return cards
  }
}

module.exports = Deck
