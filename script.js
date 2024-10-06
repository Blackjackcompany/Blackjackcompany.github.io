// Blackjack Game Logic

let deck = [];
let playerHand = [];
let dealerHand = [];
let isGameOver = false;
let hasPlayerStood = false;
let numberOfDecks = 8; // Using 8 decks of 52 cards
let previousDeck = [];

const suits = ['Hearts', 'Spades', 'Clubs', 'Diamonds'];
const values = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];

// Create a deck of 8 standard 52-card decks
const createDeck = () => {
    deck = [];
    for (let i = 0; i < numberOfDecks; i++) {
        for (let suit of suits) {
            for (let value of values) {
                deck.push({ suit, value });
            }
        }
    }
};

// Shuffle deck
const shuffleDeck = () => {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
};

// Deal a card to a hand
const dealCard = (hand) => {
    const card = deck.pop();
    hand.push(card);
};

// Get card value for Blackjack
const getCardValue = (card) => {
    if (['Jack', 'Queen', 'King'].includes(card.value)) {
        return 10;
    } else if (card.value === 'Ace') {
        return 11;
    } else {
        return parseInt(card.value);
    }
};

// Calculate hand value, treating Ace as 1 or 11
const getHandValue = (hand, isDealer = false) => {
    let value = 0;
    let aceCount = 0;

    for (let i = 0; i < hand.length; i++) {
        if (isDealer && i === 1 && !hasPlayerStood) {
            // Skip the second dealer card until the player stands
            continue;
        }
        value += getCardValue(hand[i]);
        if (hand[i].value === 'Ace') {
            aceCount++;
        }
    }

    while (value > 21 && aceCount > 0) {
        value -= 10;
        aceCount--;
    }

    return value;
};

// Update game status and check win/lose conditions
const updateGameStatus = () => {
    const playerValue = getHandValue(playerHand);
    const dealerValue = getHandValue(dealerHand, true);
    
    document.getElementById('player-score').textContent = playerValue;
    if (hasPlayerStood) {
        document.getElementById('dealer-score').textContent = getHandValue(dealerHand);
    } else {
        document.getElementById('dealer-score').textContent = getHandValue(dealerHand, true);
    }

    if (playerValue > 21) {
        document.getElementById('status').textContent = "Player busts! Dealer wins!";
        isGameOver = true;
    } else if (dealerValue > 21 && hasPlayerStood) {
        document.getElementById('status').textContent = "Dealer busts! Player wins!";
        isGameOver = true;
    } else if (hasPlayerStood) {
        if (dealerValue > playerValue) {
            document.getElementById('status').textContent = "Dealer wins!";
        } else if (dealerValue < playerValue) {
            document.getElementById('status').textContent = "Player wins!";
        } else {
            document.getElementById('status').textContent = "It's a tie!";
        }
        isGameOver = true;
    }

    updateProbabilities();
};

// Calculate probability of busting (going over 21) if the player hits
const calculateBustProbability = () => {
    const playerValue = getHandValue(playerHand);
    const cardsLeft = deck.length;
    const bustingCards = deck.filter(card => getCardValue(card) + playerValue > 21).length;
    const bustProbability = (bustingCards / cardsLeft) * 100;
    return bustProbability.toFixed(2);
};

// Calculate win/loss probability based on remaining cards
const calculateWinProbability = () => {
    const playerValue = getHandValue(playerHand);
    const dealerValue = getHandValue(dealerHand, true); // Dealer's second card is hidden

    const cardsLeft = deck.length;
    
    // Estimate probability that player can still win
    const favorableOutcomes = deck.filter(card => {
        const hypotheticalDealerValue = getCardValue(card) + dealerValue;
        return hypotheticalDealerValue <= 21 && hypotheticalDealerValue < playerValue;
    }).length;

    const winProbability = (favorableOutcomes / cardsLeft) * 100;
    const loseProbability = (100 - winProbability).toFixed(2);

    return {
        win: winProbability.toFixed(2),
        lose: loseProbability
    };
};

// Update probabilities for both player and dealer
const updateProbabilities = () => {
    const playerProbs = calculateWinProbability();
    const bustProb = calculateBustProbability();

    document.getElementById('player-win-probability').textContent = `${playerProbs.win}%`;
    document.getElementById('player-lose-probability').textContent = `${playerProbs.lose}%`;

    document.getElementById('bust-probability').textContent = `${bustProb}%`;
    document.getElementById('next-win-probability').textContent = `${(100 - bustProb).toFixed(2)}%`;
};

// Start a new game with either the existing or a new deck
const startNewGame = () => {
    if (previousDeck.length > 0) {
        deck = [...previousDeck];
    } else {
        createDeck();
        shuffleDeck();
    }

    playerHand = [];
    dealerHand = [];
    isGameOver = false;
    hasPlayerStood = false;

    dealCard(playerHand);
    dealCard(playerHand);
    dealCard(dealerHand);
    dealCard(dealerHand);

    document.getElementById('status').textContent = '';
    document.getElementById('cards-left').textContent = deck.length;

    renderHands();
    updateGameStatus();
};

// Reset game with a new deck (8 decks)
const resetWithNewDeck = () => {
    createDeck();
    shuffleDeck();
    startNewGame();
};

// Render player's and dealer's hands
const renderHands = () => {
    const playerHandElem = document.querySelector('#player-hand .cards');
    const dealerHandElem = document.querySelector('#dealer-hand .cards');

    playerHandElem.innerHTML = '';
    dealerHandElem.innerHTML = '';

    playerHand.forEach(card => {
        const cardElem = document.createElement('div');
        cardElem.textContent = `${card.value} of ${card.suit}`;
        playerHandElem.appendChild(cardElem);
    });

    dealerHand.forEach((card, index) => {
        const cardElem = document.createElement('div');
        if (index === 1 && !hasPlayerStood) {
            cardElem.textContent = "Hidden";
        } else {
            cardElem.textContent = `${card.value} of ${card.suit}`;
        }
        dealerHandElem.appendChild(cardElem);
    });
};

// Event listeners for buttons
document.getElementById('hit-btn').addEventListener('click', () => {
    if (!isGameOver) {
        dealCard(playerHand);
        renderHands();
        updateGameStatus();
    }
});

document.getElementById('stand-btn').addEventListener('click', () => {
    if (!isGameOver) {
        hasPlayerStood = true;
        while (getHandValue(dealerHand) < 17) {
            dealCard(dealerHand);
        }
        renderHands();
        updateGameStatus();
    }
});

document.getElementById('reset-btn').addEventListener('click', () => {
    previousDeck = deck.slice();
    startNewGame();
});

document.getElementById('new-deck-btn').addEventListener('click', resetWithNewDeck);

// Start the game
startNewGame();
