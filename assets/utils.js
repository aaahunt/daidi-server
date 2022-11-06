const Deck = require("./Deck.js")

/**
 * Generates an array of exactly two sorted objects of N cards to make up a hand.
 *
 * @param {Number}   numberOfCards            Number of cards per hand
 *
 * @return {Array}                            Returns an array of hand objects
 */
function newHands(numberOfCards) {
  const deck = new Deck()
  deck.shuffle()

  const playerOneHand = sort(deck.draw(numberOfCards))
  const playerTwohand = sort(deck.draw(numberOfCards))

  return [playerOneHand, playerTwohand]
}

/**
 * Custom sorting function to sort the hand by card values
 *
 * @param {Object}   Hand            Hand object, consisting of cards
 *
 * @return {Object}                  Returns an array of sorted hand objects
 */
function sort(Hand) {
  return Hand.sort((card1, card2) => {
    return (card1.value < card2.value) ? -1 : 1
  })
}

module.exports = { newHands }
