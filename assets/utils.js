import Deck from "./Deck.js"
import config from "./config.js"

/**
 * Generates an array of exactly two sorted objects of N cards to make up a hand.
 *
 * @param {Number}   n            Number of cards per hand
 * @return {Array}                Returns an array of hand objects
 */
export const newHands = (n) => {
  const deck = new Deck()

  const playerOneHand = sort(deck.draw(n))
  const playerTwohand = sort(deck.draw(n))

  return [playerOneHand, playerTwohand]
}

/**
 * Custom sorting function to sort the hand by card values
 *
 * @param {Array}   Hand            The hand to be sorted
 * @return {Array}                  Returns the sorted hand
 */
const sort = (Hand) => {
  return Hand.sort((a, b) => (a.value < b.value ? -1 : 1))
}

/**
 * Determines the number of points a hand is worth
 */
const determinePoints = (cards) => {
  return cards === 13
    ? cards * config.GAME.TOP_MULTIPLIER
    : cards > 9
    ? cards * config.GAME.MIDDLE_MULTIPLIER
    : cards * config.GAME.BOTTOM_MULTIPLIER
}

export const rankMap = {
  2: { value: 15, order: 0 },
  3: { value: 3, order: 1 },
  4: { value: 4, order: 2 },
  5: { value: 5, order: 3 },
  6: { value: 6, order: 4 },
  7: { value: 7, order: 5 },
  8: { value: 8, order: 6 },
  9: { value: 9, order: 7 },
  10: { value: 10, order: 8 },
  J: { value: 11, order: 9 },
  Q: { value: 12, order: 10 },
  K: { value: 13, order: 11 },
  A: { value: 14, order: 12 },
}

export const suitMap = {
  diamond: { symbol: "♦", value: 0 },
  club: { symbol: "♣", value: 0.25 },
  heart: { symbol: "♥", value: 0.5 },
  spade: { symbol: "♠", value: 0.75 },
}
