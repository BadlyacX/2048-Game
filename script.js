document.addEventListener("DOMContentLoaded", initGame);

const SIZE = 4; // 4x4的盤面
let grid = [];
let score = 0;
let bestScore = 0;
let gameOver = false;
let gameWon = false;

function initGame() {
    const container = document.getElementById("grid-container");

    // 初始化空格子
    for (let i = 0; i < SIZE; i++) {
        grid[i] = [];
        for (let j = 0; j < SIZE; j++) {
            grid[i][j] = 0;
        }
    }

    // 新增兩個初始數字
    addRandomTile();
    addRandomTile();

    updateBoard();
    setupKeyControls();
    document.getElementById("new-game").addEventListener("click", resetGame);
    document.getElementById("keep-going").addEventListener("click", keepGoing);
    document.getElementById("try-again").addEventListener("click", resetGame);
    loadBestScore();
    updateScoreDisplay();
}

function addRandomTile() {
    let availableCells = [];
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (grid[i][j] === 0) {
                availableCells.push({ x: i, y: j });
            }
        }
    }

    if (availableCells.length === 0) return false;

    let chosen = availableCells[Math.floor(Math.random() * availableCells.length)];
    grid[chosen.x][chosen.y] = Math.random() < 0.9 ? 2 : 4;
    return true;
}

function updateBoard() {
    const container = document.getElementById("grid-container");
    container.innerHTML = "";

    for (let i = 0; i < SIZE * SIZE; i++) {
        const cellDiv = document.createElement("div");
        const x = Math.floor(i / SIZE);
        const y = i % SIZE;
        let value = grid[x][y];
        cellDiv.classList.add("cell");
        if (value > 0) {
            cellDiv.textContent = value;
            cellDiv.setAttribute("data-value", value);
        } else {
            cellDiv.textContent = "";
        }
        container.appendChild(cellDiv);
    }
}

function setupKeyControls() {
    document.addEventListener("keydown", handleKeyPress);
    // 手機觸控可加上手勢事件
    setupTouchControls();
}

function handleKeyPress(e) {
    if (gameOver || gameWon) return;
    let moved = false;
    switch (e.key) {
        case "ArrowUp":
            moved = moveUp();
            break;
        case "ArrowDown":
            moved = moveDown();
            break;
        case "ArrowLeft":
            moved = moveLeft();
            break;
        case "ArrowRight":
            moved = moveRight();
            break;
    }

    if (moved) {
        let added = addRandomTile();
        updateBoard();
        updateScoreDisplay();

        if (!canMove()) {
            showMessage("遊戲結束");
            gameOver = true;
        }

        if (checkWin() && !gameWon) {
            showMessage("達到2048！", true);
            gameWon = true;
        }
    }
}

function moveLeft() {
    let moved = false;
    for (let i = 0; i < SIZE; i++) {
        let row = grid[i].slice();
        let newRow = compress(row);
        if (!arraysEqual(row, newRow)) moved = true;
        grid[i] = newRow;
    }
    return moved;
}

function moveRight() {
    let moved = false;
    for (let i = 0; i < SIZE; i++) {
        let row = grid[i].slice().reverse();
        let newRow = compress(row).reverse();
        if (!arraysEqual(grid[i], newRow)) moved = true;
        grid[i] = newRow;
    }
    return moved;
}

function moveUp() {
    let moved = false;
    for (let j = 0; j < SIZE; j++) {
        let col = [];
        for (let i = 0; i < SIZE; i++) {
            col.push(grid[i][j]);
        }
        let newCol = compress(col);
        for (let i = 0; i < SIZE; i++) {
            if (grid[i][j] !== newCol[i]) moved = true;
            grid[i][j] = newCol[i];
        }
    }
    return moved;
}

function moveDown() {
    let moved = false;
    for (let j = 0; j < SIZE; j++) {
        let col = [];
        for (let i = 0; i < SIZE; i++) {
            col.push(grid[i][j]);
        }
        let newCol = compress(col.reverse()).reverse();
        for (let i = 0; i < SIZE; i++) {
            if (grid[i][j] !== newCol[i]) moved = true;
            grid[i][j] = newCol[i];
        }
    }
    return moved;
}

function compress(row) {
    // 移除0
    let filtered = row.filter(v => v !== 0);
    // 合併
    for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
            filtered[i] = filtered[i] * 2;
            score += filtered[i];
            filtered[i + 1] = 0;
        }
    }
    filtered = filtered.filter(v => v !== 0);
    while (filtered.length < SIZE) {
        filtered.push(0);
    }
    return filtered;
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function canMove() {
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (grid[i][j] === 0) return true;
            if (j < SIZE - 1 && grid[i][j] === grid[i][j + 1]) return true;
            if (i < SIZE - 1 && grid[i][j] === grid[i + 1][j]) return true;
        }
    }
    return false;
}

function checkWin() {
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (grid[i][j] === 2048) return true;
        }
    }
    return false;
}

function showMessage(msg, win = false) {
    const gameMessage = document.getElementById("game-message");
    const messageText = document.getElementById("message-text");
    messageText.textContent = msg;
    gameMessage.style.display = "flex";
    if (win) {
        document.getElementById("keep-going").style.display = "inline-block";
    } else {
        document.getElementById("keep-going").style.display = "none";
    }
}

function keepGoing() {
    const gameMessage = document.getElementById("game-message");
    gameMessage.style.display = "none";
    // 達到2048後繼續遊玩
    // gameWon設定為true，可以繼續遊玩直到不能再移動
    // 不會再彈出 "達到2048！" 訊息
    gameWon = true;
}

function resetGame() {
    gameOver = false;
    gameWon = false;
    score = 0;
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            grid[i][j] = 0;
        }
    }
    addRandomTile();
    addRandomTile();
    updateBoard();
    updateScoreDisplay();
    document.getElementById("game-message").style.display = "none";
}

function updateScoreDisplay() {
    document.getElementById("score").textContent = score;
    if (score > bestScore) {
        bestScore = score;
        saveBestScore();
    }
    document.getElementById("best-score").textContent = bestScore;
}

function saveBestScore() {
    localStorage.setItem("2048-bestScore", bestScore);
}

function loadBestScore() {
    bestScore = parseInt(localStorage.getItem("2048-bestScore")) || 0;
    document.getElementById("best-score").textContent = bestScore;
}

// 手機觸控支援
let startX, startY;
function setupTouchControls() {
    const container = document.getElementById("grid-container");

    container.addEventListener("touchstart", function (e) {
        if (e.touches.length > 1) return; 
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });

    container.addEventListener("touchend", function (e) {
        if (gameOver || gameWon) return;
        let endX = e.changedTouches[0].clientX;
        let endY = e.changedTouches[0].clientY;

        let deltaX = endX - startX;
        let deltaY = endY - startY;
        let moved = false;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 左右移動
            if (deltaX > 0) {
                moved = moveRight();
            } else {
                moved = moveLeft();
            }
        } else {
            // 上下移動
            if (deltaY > 0) {
                moved = moveDown();
            } else {
                moved = moveUp();
            }
        }

        if (moved) {
            let added = addRandomTile();
            updateBoard();
            updateScoreDisplay();

            if (!canMove()) {
                showMessage("遊戲結束");
                gameOver = true;
            }

            if (checkWin() && !gameWon) {
                showMessage("達到2048！", true);
                gameWon = true;
            }
        }
    });
}
