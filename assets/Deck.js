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

  shuffle() {
    let m = this.deck.length
    let i
    while (m) {
      i = Math.floor(Math.random() * m--)
      this.deck[m] = [this.deck[i], (this.deck[i] = this.deck[m])][0]
    }
  }

  draw(n) {
    const cards = []
    while (n--) cards.push(this.deck.pop())

    return cards
  }
}

module.exports = Deck
