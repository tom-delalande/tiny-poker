package logic

import (
	"sort"
)

type HandRating struct {
	HandStrength string
	Score        float64
}

func RateHand(cards []Card) HandRating {
	hands := calculateHands(cards)
	highCards := hands.HighCard
	if len(hands.StraightFlush) > 0 {
		score := calculateHandScore("Straight Flush", hands.StraightFlush, highCards)
		return HandRating{
			HandStrength: "Straight Flush",
			Score:        score,
		}
	}
	if len(hands.Straight) > 0 {
		score := calculateHandScore("Straight", hands.Straight, highCards)
		return HandRating{
			HandStrength: "Straight",
			Score:        score,
		}
	}
	if len(hands.Flush) > 0 {
		score := calculateHandScore("Flush", hands.Flush, highCards)
		return HandRating{
			HandStrength: "Flush",
			Score:        score,
		}
	}
	if len(hands.FourOfAKind) > 0 {
		score := calculateHandScore("Four of a Kind", hands.FourOfAKind, highCards)
		return HandRating{
			HandStrength: "Four of a Kind",
			Score:        score,
		}
	}
	if len(hands.FullHouse) > 0 {
		score := calculateHandScore("Full House", []int{hands.FullHouse[0].ThreeOfAKind, hands.FullHouse[0].Pair}, highCards)
		return HandRating{
			HandStrength: "Full House",
			Score:        score,
		}
	}
	if len(hands.ThreeOfAKind) > 0 {
		score := calculateHandScore("Three of a Kind", hands.ThreeOfAKind, highCards)
		return HandRating{
			HandStrength: "Three of a Kind",
			Score:        score,
		}
	}
	if len(hands.Pair) > 1 {
		score := calculateHandScore("Two Pair", hands.Pair, highCards)
		return HandRating{
			HandStrength: "Two Pair",
			Score:        score,
		}
	}
	if len(hands.Pair) > 0 {
		score := calculateHandScore("Pair", hands.Pair, highCards)
		return HandRating{
			HandStrength: "Pair",
			Score:        score,
		}
	}
	score := calculateHandScore("High Card", hands.HighCard, highCards)
	return HandRating{
		HandStrength: "High Card",
		Score:        score,
	}
}

type FullHouse struct {
	ThreeOfAKind int
	Pair         int
}
type ScoredHands struct {
	HighCard      []int
	Pair          []int
	ThreeOfAKind  []int
	FullHouse     []FullHouse
	Flush         []int
	FourOfAKind   []int
	Straight      []int
	StraightFlush []int
}

func calculateHands(cards []Card) ScoredHands {
	cardScore := []int{-1, 14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13}

	sortedCards := []Card{}
	for _, card := range cards {
		sortedCards = append(sortedCards, Card{Suit: card.Suit, Rank: cardScore[card.Rank]})
	}

	sort.SliceStable(sortedCards, func(i, j int) bool {
		return sortedCards[i].Rank > sortedCards[j].Rank
	})

	rankFrequency := toRankFrequency(sortedCards)
	suitFrequency := toSuitFrequency(sortedCards)

	highCard := []int{}
	for _, card := range sortedCards {
		highCard = append(highCard, card.Rank)
	}
	pairCombinations := calculatePairCombinations(rankFrequency)
	flush := calculateFlushes(suitFrequency, sortedCards)
	straight := calculateStraights(rankFrequency)
	straightFlushes := calculateStraightFlushes(straight, flush)

	return ScoredHands{
		HighCard:      highCard,
		Pair:          pairCombinations.Pair,
		ThreeOfAKind:  pairCombinations.ThreeOfAKind,
		FullHouse:     pairCombinations.FullHouse,
		FourOfAKind:   pairCombinations.FourOfAKind,
		Straight:      straight,
		StraightFlush: straightFlushes,
	}
}

type PairCombinations struct {
	Pair         []int
	ThreeOfAKind []int
	FourOfAKind  []int
	FullHouse    []FullHouse
}

func calculatePairCombinations(rankFrequency map[int]int) PairCombinations {
	pair := []int{}
	threeOfAKind := []int{}
	fourOfAKind := []int{}
	fullHouse := []FullHouse{}

	for key, _ := range rankFrequency {
		if len(pair) > 0 && rankFrequency[key] >= 3 {
			fullHouse = append(fullHouse, FullHouse{ThreeOfAKind: key, Pair: pair[0]})
		}

		if len(threeOfAKind) > 0 && rankFrequency[key] >= 2 {
			fullHouse = append(fullHouse, FullHouse{ThreeOfAKind: threeOfAKind[0], Pair: key})
		}

		if rankFrequency[key] >= 2 {
			pair = append(pair, key)
		}

		if rankFrequency[key] >= 3 {
			threeOfAKind = append(threeOfAKind, key)
		}

		if rankFrequency[key] >= 4 {
			fourOfAKind = append(fourOfAKind, key)
		}
	}

	return PairCombinations{Pair: pair, ThreeOfAKind: threeOfAKind, FourOfAKind: fourOfAKind, FullHouse: fullHouse}
}

func calculateFlushes(suitFrequency map[string]int, sortedCards []Card) []int {
	flush := []int{}
	for key, _ := range suitFrequency {
		if suitFrequency[key] >= 5 {
			for _, card := range sortedCards {
				if card.Suit == key {
					flush = append(flush, card.Rank)
					break
				}
			}
		}
	}
	return flush
}

func calculateStraights(rankFrequency map[int]int) []int {
	straight := []int{}
	frequencyKeys := []int{}
	for key, _ := range rankFrequency {
		// Ace counts for 14 and 1
		if key == 14 {
			frequencyKeys = append([]int{1}, frequencyKeys...)
		}
		frequencyKeys = append(frequencyKeys, key)
	}
	for index, key := range frequencyKeys {
		if len(frequencyKeys) < index+5 {

		} else {
			if frequencyKeys[index+1] == key+1 &&
				frequencyKeys[index+2] == key+2 &&
				frequencyKeys[index+3] == key+3 &&
				frequencyKeys[index+4] == key+4 {
				straight = append(straight, key+4)
			}
		}
	}
	return straight
}

func calculateStraightFlushes(straight []int, flush []int) []int {
	straightFlushes := []int{}
	for _, s := range straight {
		for _, f := range flush {
			if s == f {
				straightFlushes = append(straightFlushes, s)
			}
		}
	}
	return straightFlushes
}

func toRankFrequency(cards []Card) map[int]int {
	m := make(map[int]int)
	for _, card := range cards {
		if m[card.Rank] > 0 {
			m[card.Rank]++
		} else {
			m[card.Rank] = 1
		}
	}
	return m
}

func toSuitFrequency(cards []Card) map[string]int {
	m := make(map[string]int)
	for _, card := range cards {
		if m[card.Suit] > 0 {
			m[card.Suit]++
		} else {
			m[card.Suit] = 1
		}
	}
	return m
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
