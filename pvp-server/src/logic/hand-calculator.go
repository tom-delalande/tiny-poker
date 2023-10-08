package logic

import "math/rand"

type HandRating struct {
	HandStrength string
	Score        float64
}

func RateHand(cards []Card) HandRating {
	// TODO: Hand rating is currently completely random
	random := rand.Float64()
	return HandRating{
		HandStrength: "Pair",
		Score:        random,
	}
}

func calculateHandScore(handStrength string, highCards []int, sortedCards []int) float64 {
	freeSortedCards := []int{}
	for _, sortedCard := range sortedCards {
		isHighCard := false
		for _, card := range highCards {
			if card == sortedCard {
				isHighCard = true
			}
		}
		if !isHighCard {
			freeSortedCards = append(freeSortedCards, sortedCard)
		}
	}

	for len(freeSortedCards) < 4 {
		freeSortedCards = append(freeSortedCards, 0)
	}

	if handStrength == "High Card" {
		return 0.007*float64(highCards[0]) +
			0.00007*float64(sortedCards[0]) +
			0.0000007*float64(sortedCards[1]) +
			0.000000007*float64(sortedCards[2]) +
			0.00000000007*float64(sortedCards[3])
	}

	if handStrength == "Pair" {
		return 0.2 + 0.007*float64(highCards[0]) +
			0.00007*float64(sortedCards[0]) +
			0.0000007*float64(sortedCards[1]) +
			0.000000007*float64(sortedCards[2])
	}

	if handStrength == "Two Pair" {
		return 0.3 + 0.007*float64(highCards[0]) +
			0.00007*float64(highCards[1]) +
			0.0000007*float64(sortedCards[0])
	}

	if handStrength == "Three of a Kind" {
		return 0.4 + 0.007*float64(highCards[0]) +
			0.00007*float64(sortedCards[0]) +
			0.0000007*float64(sortedCards[1])
	}

	if handStrength == "Straight" {
		return 0.5 + 0.007*float64(highCards[0])
	}

	if handStrength == "Flush" {
		return 0.6 + 0.007*float64(highCards[0])
	}

	if handStrength == "Full House" {
		return 0.7 + 0.007*float64(highCards[0]) +
			0.00007*float64(highCards[1])
	}

	if handStrength == "Four of a Kind" {
		return 0.8 + 0.007*float64(highCards[0]) +
			0.00007*float64(sortedCards[0])
	}

	if handStrength == "Straight Flush" {
		return 0.9 + 0.007*float64(highCards[0])
	}

	return 0
}
