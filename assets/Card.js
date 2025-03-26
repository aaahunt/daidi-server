import { rankMap, suitMap } from "./utils.js"

export default class Card {
  constructor(suit, rank) {
    this.suit = suit
    this.rank = rank
  }

  get value() {
    return this.rankValue + this.suitValue
  }

  get display() {
    return `${this.rank}${this.suit.charAt(0)}`
  }

  get suitAscii() {
    return suitMap[this.suit].symbol
  }

  get suitValue() {
    return suitMap[this.suit].value
  }

  get rankValue() {
    return rankMap[this.rank].value
  }

  get rankOrder() {
    return rankMap[this.rank].order
  }
}
