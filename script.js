const board = document.getElementById("game-board");
const movesDisplay = document.getElementById("moves");
const matchesDisplay = document.getElementById("matches");
const message = document.getElementById("message");

const restartButton = document.getElementById("restart");
const difficultySelect = document.getElementById("difficulty");
const startButton = document.getElementById("start-game");

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const startError = document.getElementById("start-error");

const victoryScreen = document.getElementById("victory-screen");

const finalMatches = document.getElementById("final-matches");
const finalMoves = document.getElementById("final-moves");

const playAgainButton = document.getElementById("play-again");

const returnMenuButton = document.getElementById("return-menu");

// Sounds
const sounds = {
    right: new Audio("audio/right.wav"),
    wrong: new Audio("audio/wrong.wav"),
    start: new Audio("audio/start.wav"),
    win: new Audio("audio/win.wav"),
    select: new Audio("audio/select.wav")
};

function playSound(sound) {
    sound.currentTime = 0;

    sound.play().catch(error => {
        console.log("Sound could not play:", error);
    });
}

function playSoundAfter(currentSound, nextSound, callback) {

    function continueSequence() {
        if (callback) {
            callback();
        }

        playSound(nextSound);
    }

    if (currentSound.paused || currentSound.ended) {
        continueSequence();
        return;
    }

    currentSound.addEventListener(
        "ended",
        continueSequence,
        { once: true }
    );
}

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;

let moves = 0;
let matches = 0;

let cardBack = "";
let gameStarted = false;


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

        startButton.disabled = false;
        startButton.textContent = "Start Game";

    } catch (error) {
        console.error("Error loading cards:", error);
        startError.textContent = "Could not load the cards.";
    }
}


// Start button
startButton.addEventListener("click", () => {
    if (gameStarted || cards.length === 0) return;

    gameStarted = true;

    playSound(sounds.start);

    startScreen.classList.add("fade-out");

    setTimeout(() => {
        startScreen.hidden = true;
        gameScreen.hidden = false;

        requestAnimationFrame(() => {
            gameScreen.classList.add("visible");
        });

        startGame();
    }, 500);
});


// Shuffle array
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

    const pairsCount = Number(difficultySelect.value);

    const selectedCards = shuffle(cards).slice(0, pairsCount);

    const cardPairs = selectedCards.flatMap(card => [
        { ...card, uniqueId: card.id + "_1" },
        { ...card, uniqueId: card.id + "_2" }
    ]);

    const shuffledCards = shuffle(cardPairs);

    shuffledCards.forEach((card, index) => {
        createCard(card, index);
    });
}


// Create one card
function createCard(card, index) {
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

    // Cards appear one after another
    cardElement.style.animationDelay = `${index * 0.035}s`;

    board.appendChild(cardElement);
}


// Flip card
function flipCard(cardElement, card) {
    if (!gameStarted || lockBoard) return;

    if (cardElement.classList.contains("matched")) return;

    if (cardElement === firstCard?.element) return;

    playSound(sounds.select);

    const image = cardElement.querySelector("img");

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

        playSound(sounds.right);

        firstCard.element.classList.add("matched");
        secondCard.element.classList.add("matched");

        matches++;
        matchesDisplay.textContent = matches;

        if (matches === Number(difficultySelect.value)) {

            lockBoard = true;

            playSoundAfter(
                sounds.right,
                sounds.win,
                showVictory
            );

        } else {
            resetTurn();
        }

    } else {

        playSound(sounds.wrong);

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
restartButton.addEventListener("click", () => {
    startGame();
});


// Difficulty selection sound
difficultySelect.addEventListener("change", () => {
    playSound(sounds.select);
});

function showVictory() {

    finalMatches.textContent = matches;
    finalMoves.textContent = moves;

    gameScreen.classList.remove("visible");
    gameScreen.classList.add("fade-out");

    setTimeout(() => {

        gameScreen.hidden = true;

        victoryScreen.hidden = false;

        requestAnimationFrame(() => {
            victoryScreen.classList.add("visible");
        });

    }, 500);
}

playAgainButton.addEventListener("click", () => {

    playSound(sounds.start);

    victoryScreen.classList.remove("visible");
    victoryScreen.classList.add("fade-out");

    setTimeout(() => {

        victoryScreen.hidden = true;

        gameScreen.hidden = false;
        gameScreen.classList.remove("fade-out");

        requestAnimationFrame(() => {
            gameScreen.classList.add("visible");
        });

        startGame();

    }, 500);
});

returnMenuButton.addEventListener("click", () => {
    playSound(sounds.start);

    victoryScreen.classList.remove("visible");
    victoryScreen.classList.add("fade-out");

    setTimeout(() => {
        victoryScreen.hidden = true;
        victoryScreen.classList.remove("fade-out");

        gameScreen.hidden = true;
        gameScreen.classList.remove("visible");
        gameScreen.classList.remove("fade-out");

        startScreen.hidden = false;
        startScreen.classList.remove("fade-out");

        requestAnimationFrame(() => {
            startScreen.classList.add("visible");
        });

    }, 500);
});

// Load game data
loadCards();