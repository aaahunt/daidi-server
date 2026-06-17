import { sortByRankValue } from "../assets/utils.js"
import Card from "./Card.js"

export const pokerRank = {
  HIGH_CARD: 0,
  PAIR: 1,
  TWO_PAIR: 2,
  THREE_OF_A_KIND: 3,
  STRAIGHT: 4,
  FLUSH: 5,
  FULL_HOUSE: 6,
  QUADS: 7,
  STRAIGHT_FLUSH: 8,
  ROYAL_FLUSH: 9,
}

const WHEEL_MASK = 0b1000000001111
const ROYAL_MASK = 0b1111100000000

/**
 * Return the rank of our hand
 *
 * @param {Card[]} hand - Array of Cards
 *
 * @return {Number} - The rank of the hand
 */
export const determineHandClass = (hand) => {
  let bitmask = 0
  let values = {}
  let suits = {}

  for (const card of hand) {
    bitmask |= 1 << card.rankOrder

    suits[card.suit] = (suits[card.suit] ?? 0) + 1
    values[card.rankValue] = (values[card.rankValue] ?? 0) + 1
  }

  const valueCounts = Object.values(values).sort((a, b) => b - a)
  const [highestCount, secondHighestCount] = valueCounts
  const isFlush = Object.values(suits).some((count) => count === 5)
  const isStraight = checkStraight(bitmask)
  const isRoyal = (bitmask & ROYAL_MASK) === ROYAL_MASK

  if (isFlush && isRoyal) {
    return pokerRank.ROYAL_FLUSH
  }

  if (isFlush && isStraight) {
    return pokerRank.STRAIGHT_FLUSH
  }

  if (highestCount === 4) {
    return pokerRank.QUADS
  }

  if (highestCount === 3 && secondHighestCount === 2) {
    return pokerRank.FULL_HOUSE
  }

  if (isFlush) {
    return pokerRank.FLUSH
  }

  if (isStraight) {
    return pokerRank.STRAIGHT
  }

  if (highestCount === 3) {
    return pokerRank.THREE_OF_A_KIND
  }

  if (highestCount === 2 && secondHighestCount === 2) {
    return pokerRank.TWO_PAIR
  }

  if (highestCount === 2) {
    return pokerRank.PAIR
  }

  return pokerRank.HIGH_CARD
}

const checkStraight = (bitmask) => {
  for (let i = 0; i <= 8; i++) {
    if (((bitmask >> i) & 0b11111) === 0b11111) {
      return true
    }
  }
  return (bitmask & WHEEL_MASK) === WHEEL_MASK
}

/**
 * Determine the winner between two hands
 *
 * @param {Card[]} hand1
 * @param {Card[]} hand2
 * @returns 1 if hand1 wins, -1 if hand2 wins
 */
export const compareHands = (hand1, hand2) => {
  const rank1 = determineHandClass(hand1)
  const rank2 = determineHandClass(hand2)

  console.log("compareHands", rank1, rank2)

  if (rank1 > rank2) {
    return 1
  } else if (rank1 < rank2) {
    return -1
  } else {
    return tieBreak(hand1, hand2, rank1)
  }
}

/**
 *
 * @param {Card[]} hand
 * @param {Card[]} board
 * @returns
 */
export const handBeatsBoard = (hand, board) => {
  if (!board?.length) return true
  return hand.length === board.length && compareHands(hand, board) === 1
}

/**
 *
 * @param {Card[]} hand
 * @returns {Boolean} - True if the hand is a valid Dai di hand
 */
export const handIsValidDaiDi = (hand) => {
  const count = hand.length

  if (count === 1) return true
  if (count === 4) return false

  const handClass = determineHandClass(hand)
  return (
    (count === 2 && handClass === pokerRank.PAIR) ||
    (count === 3 && handClass === pokerRank.THREE_OF_A_KIND) ||
    (count === 5 && handClass >= pokerRank.STRAIGHT)
  )
}

/**
 * Find out who ranks the highest, if the same again, use the suit to determine the winner (d < c < h < s)
 *
 * @param {Card[]} hand1
 * @param {Card[]} hand2
 * @param {rank} rank
 *
 * @returns 1 if hand1 wins, -1 if hand2 wins
 */
const tieBreak = (hand1, hand2, handClass) => {
  console.log("TIEBREAK between [", prettyPrintHand(hand1), "] and [", prettyPrintHand(hand2), "]")
  switch (handClass) {
    // Full house and quads evaluated at the same time, just looking at the highest value card for the most occuring card
    case pokerRank.FULL_HOUSE:
    case pokerRank.QUADS:
      return modeCard(hand1).value > modeCard(hand2).value ? 1 : -1
    // Most hands can be compared just by looking at highest value card
    default:
      const h1 = sortByRankValue(hand1)
      const h2 = sortByRankValue(hand2)

      for (let i = Math.max(h1.length, h2.length) - 1; i >= 0; i--) {
        if (h1[i].rankValue > h2[i].rankValue) return 1
        if (h1[i].rankValue < h2[i].rankValue) return -1
      }

      return h1[0].value - h2[0].value
  }
}

/**
 *
 * @param {Card[]} cards
 * @returns {Card} - The most occuring card in the hand
 */
const modeCard = (cards) => {
  let freq = new Map()

  for (let card of cards) {
    const rank = card.rank
    freq.set(rank, (freq.get(rank) || 0) + 1)
  }

  let maxCount = 0
  let result = null
  for (let [rank, count] of freq) {
    if (count > maxCount || (count === maxCount && rank > result)) {
      result = rank
      maxCount = count
    }
  }

  return cards.find((card) => card.rank === result)
}

const prettyPrintHand = (hand) => {
  return hand.map((card) => card.display).join(" ")
}
