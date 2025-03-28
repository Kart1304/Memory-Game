document.addEventListener("DOMContentLoaded", function() {
    // Theme toggle functionality
    const themeSwitch = document.getElementById("theme-switch");
    const body = document.body;

    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem("memory-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Set initial theme based on saved preference or system preference
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        body.classList.add("dark");
        themeSwitch.checked = true;
    }

    // Toggle theme when switch is clicked
    themeSwitch.addEventListener("change", function() {
        if (this.checked) {
            body.classList.add("dark");
            localStorage.setItem("memory-theme", "dark");
        } else {
            body.classList.remove("dark");
            localStorage.setItem("memory-theme", "light");
        }
    });

    // Memory Game functionality
    const gameBoard = document.getElementById("game-board");
    const startBtn = document.getElementById("start-btn");
    const restartBtn = document.getElementById("restart-btn");
    const difficultySelect = document.getElementById("difficulty");
    const timeElement = document.getElementById("time");
    const movesElement = document.getElementById("moves");
    const scoreElement = document.getElementById("score");
    
    // Game over modal elements
    const gameOverModal = document.getElementById("game-over-modal");
    const closeModal = document.querySelector(".close-modal");
    const resultTimeElement = document.getElementById("result-time");
    const resultMovesElement = document.getElementById("result-moves");
    const resultScoreElement = document.getElementById("result-score");
    const highScoreMessage = document.getElementById("high-score-message");
    const playAgainBtn = document.getElementById("play-again-btn");
    
    // Game state variables
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let totalPairs = 0;
    let moves = 0;
    let score = 0;
    let gameStarted = false;
    let gameTimer;
    let seconds = 0;
    let canFlip = true;
    
    // Card icons (using Font Awesome)
    const cardIcons = [
        'fa-heart', 'fa-star', 'fa-smile', 'fa-bell', 'fa-moon', 'fa-sun',
        'fa-cloud', 'fa-car', 'fa-tree', 'fa-gift', 'fa-music', 'fa-home',
        'fa-key', 'fa-crown', 'fa-gem', 'fa-bolt', 'fa-fire', 'fa-snowflake'
    ];
    
    // Difficulty settings
    const difficulties = {
        easy: { rows: 3, cols: 4 },
        medium: { rows: 4, cols: 4 },
        hard: { rows: 4, cols: 6 }
    };
    
    // Start the game
    function startGame() {
        // Reset game state
        resetGame();
        
        // Get difficulty settings
        const difficulty = difficultySelect.value;
        const { rows, cols } = difficulties[difficulty];
        totalPairs = (rows * cols) / 2;
        
        // Add difficulty class to game board
        gameBoard.className = "game-board " + difficulty;
        
        // Clear game board
        gameBoard.innerHTML = "";
        
        // Create cards
        createCards(rows, cols);
        
        // Start timer
        startTimer();
        
        // Update UI
        updateUI();
        
        // Enable restart button
        restartBtn.disabled = false;
        
        // Set game as started
        gameStarted = true;
    }
    
    // Create cards for the game
    function createCards(rows, cols) {
        const totalCards = rows * cols;
        const cardCount = totalCards / 2;
        
        // Select icons for this game
        const gameIcons = cardIcons.slice(0, cardCount);
        
        // Create pairs of cards
        cards = [];
        for (let i = 0; i < cardCount; i++) {
            cards.push(createCard(gameIcons[i]));
            cards.push(createCard(gameIcons[i]));
        }
        
        // Shuffle cards
        shuffleCards(cards);
        
        // Add cards to the game board
        cards.forEach(card => {
            gameBoard.appendChild(card);
        });
    }
    
    // Create a single card
    function createCard(icon) {
        const card = document.createElement("div");
        card.classList.add("memory-card");
        
        const cardFront = document.createElement("div");
        cardFront.classList.add("card-front");
        
        const cardContent = document.createElement("div");
        cardContent.classList.add("card-content");
        cardContent.innerHTML = `<i class="fas ${icon}"></i>`;
        
        const cardBack = document.createElement("div");
        cardBack.classList.add("card-back");
        cardBack.innerHTML = `<i class="fas fa-question"></i>`;
        
        cardFront.appendChild(cardContent);
        card.appendChild(cardFront);
        card.appendChild(cardBack);
        
        // Add click event
        card.addEventListener("click", () => flipCard(card, icon));
        
        return card;
    }
    
    // Shuffle cards using Fisher-Yates algorithm
    function shuffleCards(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Flip a card
    function flipCard(card, icon) {
        // Check if card can be flipped
        if (!canFlip || card.classList.contains("flipped") || card.classList.contains("matched")) {
            return;
        }
        
        // Flip the card
        card.classList.add("flipped");
        
        // Add to flipped cards
        flippedCards.push({ card, icon });
        
        // Check for match if two cards are flipped
        if (flippedCards.length === 2) {
            // Increment moves
            moves++;
            updateUI();
            
            // Check for match
            checkForMatch();
        }
    }
    
    // Check if the two flipped cards match
    function checkForMatch() {
        const [card1, card2] = flippedCards;
        
        // Prevent further card flips until check is complete
        canFlip = false;
        
        if (card1.icon === card2.icon) {
            // Cards match
            setTimeout(() => {
                card1.card.classList.add("matched");
                card2.card.classList.add("matched");
                
                // Update matched pairs
                matchedPairs++;
                
                // Update score
                score += 10 * (1 + Math.floor(100 / (seconds + 1)));
                updateUI();
                
                // Clear flipped cards
                flippedCards = [];
                
                // Allow flipping again
                canFlip = true;
                
                // Check if game is over
                if (matchedPairs === totalPairs) {
                    gameOver();
                }
            }, 500);
        } else {
            // Cards don't match
            setTimeout(() => {
                card1.card.classList.remove("flipped");
                card2.card.classList.remove("flipped");
                
                // Clear flipped cards
                flippedCards = [];
                
                // Allow flipping again
                canFlip = true;
            }, 1000);
        }
    }
    
    // Start the timer
    function startTimer() {
        seconds = 0;
        clearInterval(gameTimer);
        
        gameTimer = setInterval(() => {
            seconds++;
            updateUI();
        }, 1000);
    }
    
    // Format time as MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Update UI elements
    function updateUI() {
        timeElement.textContent = formatTime(seconds);
        movesElement.textContent = moves;
        scoreElement.textContent = score;
    }
    
    // Reset the game
    function resetGame() {
        cards = [];
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        score = 0;
        seconds = 0;
        canFlip = true;
        
        clearInterval(gameTimer);
        
        updateUI();
    }
    
    // Game over
    function gameOver() {
        // Stop timer
        clearInterval(gameTimer);
        
        // Update result elements
        resultTimeElement.textContent = formatTime(seconds);
        resultMovesElement.textContent = moves;
        resultScoreElement.textContent = score;
        
        // Check for high score
        const difficulty = difficultySelect.value;
        const highScore = localStorage.getItem(`memory-high-score-${difficulty}`);
        
        if (!highScore || score > parseInt(highScore)) {
            // New high score
            localStorage.setItem(`memory-high-score-${difficulty}`, score);
            highScoreMessage.style.display = "block";
        } else {
            highScoreMessage.style.display = "none";
        }
        
        // Show modal
        gameOverModal.classList.add("show");
    }
    
    // Event listeners
    startBtn.addEventListener("click", startGame);
    
    restartBtn.addEventListener("click", startGame);
    
    closeModal.addEventListener("click", () => {
        gameOverModal.classList.remove("show");
    });
    
    playAgainBtn.addEventListener("click", () => {
        gameOverModal.classList.remove("show");
        startGame();
    });
    
    // Close modal when clicking outside
    window.addEventListener("click", function(e) {
        if (e.target === gameOverModal) {
            gameOverModal.classList.remove("show");
        }
    });
});