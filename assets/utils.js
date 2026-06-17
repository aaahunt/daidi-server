import Deck from "../game/Deck.js"
import config from "./config.js"

export const newHands = (players, cards) => {
  const deck = new Deck()

  if (players * cards > deck.count) {
    throw new Error("Deck does not have enough cards")
  }

  let hands = []
  for (let i = 0; i < players; i++) {
    hands.push(sortByValue(deck.draw(n)))
  }

  return hands
}

export const sortByValue = (array) => {
  return array.sort((a, b) => a.value - b.value)
}

export const sortByRankValue = (array) => {
  return array.sort((a, b) => {
    if (a.rankValue !== b.rankValue) {
      return a.rankValue - b.rankValue
    }
    return a.value - b.value
  })
}
