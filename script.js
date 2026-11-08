
const board = document.getElementById("game-board");
const movesDisplay = document.getElementById("moves");
const matchesDisplay = document.getElementById("matches");
const message = document.getElementById("message");
const restartButton = document.getElementById("restart");
const difficultySelect = document.getElementById("difficulty");


let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;

let moves = 0;
let matches = 0;

let cardBack = "";

// Load cards from JSON
async function loadCards() {
    try {
        const response = await fetch("data/cards.json");

        if (!response.ok) {
            throw new Error("Could not load cards.json");
        }

        const data = await response.json();

        cardBack = data.cardBack;
        cards = data.cards;

        startGame();

    } catch (error) {
        console.error("Error loading cards:", error);
        message.textContent = "Could not load the cards.";
    }
}

// Shuffle array (Fisher-Yates)
function shuffle(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] =
        [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

// Create pairs and start game

function startGame() {

    board.innerHTML = "";

    moves = 0;
    matches = 0;

    firstCard = null;
    secondCard = null;
    lockBoard = false;

    movesDisplay.textContent = moves;
    matchesDisplay.textContent = matches;
    message.textContent = "";

    // Get selected difficulty
    const pairsCount = Number(difficultySelect.value);

    // Randomly select cards based on difficulty
    const selectedCards = shuffle(cards).slice(0, pairsCount);

    // Create two copies of each selected card
    const cardPairs = selectedCards.flatMap(card => [
        { ...card, uniqueId: card.id + "_1" },
        { ...card, uniqueId: card.id + "_2" }
    ]);

    // Shuffle all cards
    const shuffledCards = shuffle(cardPairs);

    // Display cards
    shuffledCards.forEach(card => {
        createCard(card);
    });
}

// Create one card element

function createCard(card) {

    const cardElement = document.createElement("div");

    cardElement.classList.add("card");

    cardElement.dataset.id = card.id;
    cardElement.dataset.uniqueId = card.uniqueId;

    const image = document.createElement("img");

    image.src = cardBack;
    image.alt = "";

    cardElement.appendChild(image);

    cardElement.addEventListener("click", () => {
        flipCard(cardElement, card);
    });

    board.appendChild(cardElement);
}


// Flip card
function flipCard(cardElement, card) {

    if (lockBoard) return;

    if (cardElement.classList.contains("matched")) return;

    if (cardElement === firstCard?.element) return;

    const image = cardElement.querySelector("img");

    // Show only the hieroglyph illustration
    image.src = card.image;
    image.alt = "";

    if (!firstCard) {

        firstCard = {
            element: cardElement,
            id: card.id
        };

        return;
    }

    secondCard = {
        element: cardElement,
        id: card.id
    };

    moves++;
    movesDisplay.textContent = moves;

    checkMatch();
}


// Check if cards match
function checkMatch() {

    if (firstCard.id === secondCard.id) {

        // Correct match
        firstCard.element.classList.add("matched");
        secondCard.element.classList.add("matched");

        matches++;
        matchesDisplay.textContent = matches;

        resetTurn();

        // Check if game is finished
        if (matches === cards.length) {
            message.textContent =
                "Congratulations! You found all the pairs!";
        }

    } else {

        // Wrong match
        lockBoard = true;

        setTimeout(() => {

            firstCard.element.querySelector("img").src = cardBack;
            secondCard.element.querySelector("img").src = cardBack;

            resetTurn();

        }, 1000);
    }
}

// Reset selection
function resetTurn() {

    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

// Restart button
restartButton.addEventListener("click", startGame);


// Restart when difficulty changes
difficultySelect.addEventListener("change", startGame);


// Load game
loadCards();
