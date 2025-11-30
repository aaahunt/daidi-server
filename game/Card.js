import { RANKS } from "./ranks.js"
import { SUITS } from "./suits.js"

export default class Card {
  constructor(suit, rank) {
    this.suit = suit
    this.rank = rank
    Object.freeze(this)
  }

  get rankInfo() {
    return RANKS[this.rank]
  }
  get suitInfo() {
    return SUITS[this.suit]
  }

  get value() {
    return this.rankInfo.value + this.suitInfo.value
  }

  get rankValue() {
    return this.rankInfo.value
  }

  get suitValue() {
    return this.suitInfo.value
  }

  get rankOrder() {
    return this.rankInfo.order
  }

  get display() {
    return `${this.rank}${this.suit[0]}`
  }

  get suitAscii() {
    return this.suitInfo.symbol
  }

  toJSON() {
    return {
      suit: this.suit,
      rank: this.rank,
      value: this.value,
      display: this.display,
    }
  }
}
