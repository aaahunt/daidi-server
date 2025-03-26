import { determineHandClass, compareHands, pokerRank } from "../assets/handRanking.js"
import Card from "../assets/Card.js"
import Deck from "../assets/Deck.js"

const royalFlush = [
  new Card("diamond", "10"),
  new Card("diamond", "J"),
  new Card("diamond", "Q"),
  new Card("diamond", "K"),
  new Card("diamond", "A"),
]

const straightFlushD = [
  new Card("diamond", "2"),
  new Card("diamond", "3"),
  new Card("diamond", "4"),
  new Card("diamond", "5"),
  new Card("diamond", "6"),
]

const fourOfAKind = [
  new Card("diamond", "2"),
  new Card("club", "2"),
  new Card("heart", "2"),
  new Card("spade", "2"),
  new Card("diamond", "3"),
]

const fullHouse = [
  new Card("diamond", "K"),
  new Card("club", "K"),
  new Card("heart", "K"),
  new Card("spade", "3"),
  new Card("diamond", "3"),
]

const fullHouseLower = [
  new Card("diamond", "2"),
  new Card("club", "2"),
  new Card("diamond", "3"),
  new Card("club", "3"),
  new Card("heart", "3"),
]

const flush = [
  new Card("diamond", "2"),
  new Card("diamond", "4"),
  new Card("diamond", "6"),
  new Card("diamond", "8"),
  new Card("diamond", "10"),
]

const straight = [
  new Card("diamond", "2"),
  new Card("club", "3"),
  new Card("heart", "4"),
  new Card("spade", "5"),
  new Card("diamond", "6"),
]

const threeOfAKind = [new Card("diamond", "2"), new Card("club", "2"), new Card("heart", "2")]

const biggestPair = [new Card("spade", "2"), new Card("club", "2")]
const biggerPair = [new Card("diamond", "2"), new Card("heart", "2")]
const pair = [new Card("diamond", "A"), new Card("club", "A")]

const highCard = [new Card("club", "7")]
const higherCard = [new Card("heart", "7")]
const highestCard = [new Card("club", "8")]

const straightFlushWheel = [
  new Card("diamond", "A"),
  new Card("diamond", "2"),
  new Card("diamond", "3"),
  new Card("diamond", "4"),
  new Card("diamond", "5"),
]

const straightFlushC = [
  new Card("club", "2"),
  new Card("club", "3"),
  new Card("club", "4"),
  new Card("club", "5"),
  new Card("club", "6"),
]

const wheel = [
  new Card("diamond", "A"),
  new Card("heart", "2"),
  new Card("heart", "3"),
  new Card("heart", "4"),
  new Card("heart", "5"),
]

describe("handRanking", () => {
  test("correctly identifies each hand class", () => {
    expect(determineHandClass(royalFlush)).toBe(pokerRank.ROYAL_FLUSH)
    expect(determineHandClass(straightFlushD)).toBe(pokerRank.STRAIGHT_FLUSH)
    expect(determineHandClass(fourOfAKind)).toBe(pokerRank.QUADS)
    expect(determineHandClass(fullHouse)).toBe(pokerRank.FULL_HOUSE)
    expect(determineHandClass(flush)).toBe(pokerRank.FLUSH)
    expect(determineHandClass(straight)).toBe(pokerRank.STRAIGHT)
    expect(determineHandClass(threeOfAKind)).toBe(pokerRank.THREE_OF_A_KIND)
    expect(determineHandClass(pair)).toBe(pokerRank.PAIR)
    expect(determineHandClass(highCard)).toBe(pokerRank.HIGH_CARD)

    expect(determineHandClass(straightFlushWheel)).toBe(pokerRank.STRAIGHT_FLUSH)
    expect(determineHandClass(wheel)).toBe(pokerRank.STRAIGHT)
  })
})

describe("CompareHands", () => {
  test("correctly identifies the winner", () => {
    expect(compareHands(royalFlush, straightFlushD)).toBe(1)
    expect(compareHands(straightFlushD, royalFlush)).toBe(-1)

    expect(compareHands(straightFlushD, straightFlushC)).toBe(-1)

    expect(compareHands(fullHouse, fullHouseLower)).toBe(1)

    expect(compareHands(highCard, higherCard)).toBe(-1)
    expect(compareHands(higherCard, highestCard)).toBe(-1)
    expect(compareHands(highestCard, highCard)).toBe(1)

    expect(compareHands(pair, biggerPair)).toBe(-1)
    expect(compareHands(biggerPair, biggestPair)).toBe(-1)
    expect(compareHands(biggestPair, pair)).toBe(1)
  })
})
