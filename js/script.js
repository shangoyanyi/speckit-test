const cells = document.querySelectorAll('[data-cell]');
const statusElement = document.getElementById('status');
const restartButton = document.getElementById('restartButton');
const modePvpRadio = document.getElementById('modePvp');
const modePveRadio = document.getElementById('modePve');
const difficultyControls = document.querySelector('.difficulty-controls');
const difficultyEasyRadio = document.getElementById('difficultyEasy');
const difficultyHardRadio = document.getElementById('difficultyHard');

const gameState = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    isGameActive: true,
    winner: null,
    isDraw: false,
    gameMode: 'PvP', // 'PvP' or 'PvE'
    aiDifficulty: 'Easy' // 'Easy' or 'Hard'
};

function updateStatusMessage() {
  if (!statusElement) {
    return;
  }

  if (gameState.isGameActive) {
    statusElement.textContent = `輪到玩家 ${gameState.currentPlayer} 下棋`;
    return;
  }

  if (gameState.winner) {
    statusElement.textContent = `玩家 ${gameState.winner} 獲勝！`;
    return;
  }

  if (gameState.isDraw) {
    statusElement.textContent = '平手！';
  }
}

function setCellMark(cell, player, index) {
  cell.textContent = player;
  cell.classList.remove('cell--x', 'cell--o');
  cell.classList.add(player === 'X' ? 'cell--x' : 'cell--o');
  cell.disabled = true;
  cell.setAttribute('aria-disabled', 'true');
  cell.setAttribute('aria-label', `第 ${index + 1} 格，玩家 ${player} 已落子`);
}

function updateEmptyCellLabels() {
  cells.forEach((cell, index) => {
    if (gameState.board[index]) {
      return;
    }

    if (gameState.isGameActive) {
      cell.disabled = false;
      cell.removeAttribute('aria-disabled');
      cell.setAttribute('aria-label', `第 ${index + 1} 格，等待玩家 ${gameState.currentPlayer} 落子`);
    } else {
      cell.disabled = true;
      cell.setAttribute('aria-disabled', 'true');
      cell.setAttribute('aria-label', `第 ${index + 1} 格，遊戲已結束`);
    }
  });
}

function handleCellClick(event) {
    if (!gameState.isGameActive || (gameState.gameMode === 'PvE' && gameState.currentPlayer === 'O')) {
        return;
    }

    const cell = event.currentTarget;
    const cellIndex = Number(cell.dataset.index);

    if (Number.isNaN(cellIndex) || gameState.board[cellIndex]) {
        return;
    }

    const currentPlayer = gameState.currentPlayer;

    gameState.board[cellIndex] = currentPlayer;
    setCellMark(cell, currentPlayer, cellIndex);

    if (checkWin(currentPlayer)) {
        gameState.isGameActive = false;
        gameState.winner = currentPlayer;
        gameState.isDraw = false;
        updateStatusMessage();
        updateEmptyCellLabels();
        return;
    }

    if (checkDraw()) {
        gameState.isGameActive = false;
        gameState.winner = null;
        gameState.isDraw = true;
        updateStatusMessage();
        updateEmptyCellLabels();
        return;
    }

    gameState.currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    gameState.winner = null;
    gameState.isDraw = false;
    updateStatusMessage();
    updateEmptyCellLabels();

    if (gameState.gameMode === 'PvE' && gameState.currentPlayer === 'O' && gameState.isGameActive) {
        setTimeout(makeAIMove, 1000);
    }
}

function makeAIMove() {
    if (!gameState.isGameActive) return;

    const availableCells = gameState.board
        .map((cell, index) => (cell === null ? index : null))
        .filter(index => index !== null);

    if (availableCells.length === 0) {
        return;
    }

    let aiMoveIndex;
    if (gameState.aiDifficulty === 'Hard') {
        aiMoveIndex = findBestMove();
    } else {
        aiMoveIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
    }

    const aiPlayer = 'O';
    const cell = cells[aiMoveIndex];

    gameState.board[aiMoveIndex] = aiPlayer;
    setCellMark(cell, aiPlayer, aiMoveIndex);

    if (checkWin(aiPlayer)) {
        gameState.isGameActive = false;
        gameState.winner = aiPlayer;
        updateStatusMessage();
        updateEmptyCellLabels();
        return;
    }

    if (checkDraw()) {
        gameState.isGameActive = false;
        gameState.isDraw = true;
        updateStatusMessage();
        updateEmptyCellLabels();
        return;
    }

    gameState.currentPlayer = 'X';
    updateStatusMessage();
    updateEmptyCellLabels();
}

function findBestMove() {
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < 9; i++) {
        if (gameState.board[i] === null) {
            gameState.board[i] = 'O'; // AI is 'O'
            let score = minimax(gameState.board, 0, false);
            gameState.board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    const winner = checkWinForMinimax(board);
    if (winner !== null) {
        const scores = { X: -10, O: 10 };
        return scores[winner];
    }
    if (checkDrawForMinimax(board)) {
        return 0;
    }

    if (isMaximizing) { // AI's turn ('O')
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else { // Player's turn ('X')
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinForMinimax(board) {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function checkDrawForMinimax(board) {
    return board.every(cell => cell !== null);
}

function checkWin(player) {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  return winningCombinations.some((combination) =>
    combination.every((index) => gameState.board[index] === player)
  );
}

function checkDraw() {
  return gameState.board.every((cell) => cell !== null);
}

function resetBoard() {
  cells.forEach((cell, index) => {
    cell.textContent = '';
    cell.classList.remove('cell--x', 'cell--o');
    cell.disabled = false;
    cell.removeAttribute('aria-disabled');
    cell.setAttribute('aria-label', `第 ${index + 1} 格`);
  });
}

function restartGame() {
    gameState.board.fill(null);
    gameState.currentPlayer = 'X';
    gameState.isGameActive = true;
    gameState.winner = null;
    gameState.isDraw = false;

    // Don't reset mode or difficulty
    // gameState.gameMode = 'PvP'; 
    // gameState.aiDifficulty = 'Easy';

    resetBoard();
    updateEmptyCellLabels();
    updateStatusMessage();
}

cells.forEach((cell, index) => {
  cell.dataset.index = index;
  cell.addEventListener('click', handleCellClick);
});

if (restartButton) {
    restartButton.addEventListener('click', restartGame);
}

modePvpRadio.addEventListener('change', (e) => {
    if (e.target.checked) {
        gameState.gameMode = 'PvP';
        difficultyControls.classList.add('hidden');
        restartGame();
    }
});

modePveRadio.addEventListener('change', (e) => {
    if (e.target.checked) {
        gameState.gameMode = 'PvE';
        difficultyControls.classList.remove('hidden');
        restartGame();
    }
});

difficultyEasyRadio.addEventListener('change', (e) => {
    if (e.target.checked) {
        gameState.aiDifficulty = 'Easy';
        restartGame();
    }
});

difficultyHardRadio.addEventListener('change', (e) => {
    if (e.target.checked) {
        gameState.aiDifficulty = 'Hard';
        restartGame();
    }
});

updateEmptyCellLabels();
updateStatusMessage();
