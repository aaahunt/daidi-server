import Card from "./Card.js"

export const pokerRank = {
  HIGH_CARD: 0,
  PAIR: 1,
  THREE_OF_A_KIND: 2,
  STRAIGHT: 3,
  FLUSH: 4,
  FULL_HOUSE: 5,
  QUADS: 6,
  STRAIGHT_FLUSH: 7,
  ROYAL_FLUSH: 8,
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

  const counts = Object.values(values).sort((a, b) => b - a)
  const isFlush = Object.values(suits).some((count) => count === 5)
  const straight = isStraight(bitmask)

  if (isFlush && (bitmask & ROYAL_MASK) === ROYAL_MASK) {
    return pokerRank.ROYAL_FLUSH
  }

  if (isFlush && straight) {
    return pokerRank.STRAIGHT_FLUSH
  }

  if (counts[0] === 4) {
    return pokerRank.QUADS
  }

  if (counts[0] === 3 && counts[1] === 2) {
    return pokerRank.FULL_HOUSE
  }

  if (isFlush) {
    return pokerRank.FLUSH
  }

  if (straight) {
    return pokerRank.STRAIGHT
  }

  if (counts[0] === 3) {
    return pokerRank.THREE_OF_A_KIND
  }

  if (counts[0] === 2) {
    return pokerRank.PAIR
  }

  return pokerRank.HIGH_CARD
}

const isStraight = (bitmask) => {
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

  if (rank1 > rank2) {
    return 1
  } else if (rank1 < rank2) {
    return -1
  } else {
    let winner = tieBreak(hand1, hand2, rank1)
    return winner
  }
}

/**
 *
 * @param {Card[]} hand
 * @param {Card[]} board
 * @returns
 */
export const handBeatsBoard = (hand, board) => {
  return compareHands(hand, board) === 1
}

/**
 *
 * @param {Card[]} hand
 * @param {Card[]} board
 * @returns {Boolean} - True if the hand is valid, false if not
 */
export const handIsValid = (hand, board) => {
  return hand.length === board.length && handBeatsBoard(hand, board)
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
const tieBreak = (hand1, hand2, handRanking) => {
  console.log("TIEBREAK between [", prettyPrintHand(hand1), "] and [", prettyPrintHand(hand2), "]")
  switch (handRanking) {
    // Full house and quads evaluated at the same time, just looking at the highest value card for the most occuring card
    case pokerRank.FULL_HOUSE:
    case pokerRank.QUADS:
      return modeCard(hand1).value > modeCard(hand2).value ? 1 : -1
    // Most hands can be compared just by looking at highest value card
    default:
      const h1BestCard = Math.max(...hand1.map((card) => card.value))
      const h2BestCard = Math.max(...hand2.map((card) => card.value))

      return h1BestCard > h2BestCard ? 1 : -1
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
