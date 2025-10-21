const cells = document.querySelectorAll('[data-cell]');
const statusElement = document.querySelector('#game-status');
const restartButton = document.querySelector('#restart-button');

const gameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  isGameActive: true,
  winner: null,
  isDraw: false,
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

function handleCellClick(event) {
  if (!gameState.isGameActive) {
    return;
  }

  const cell = event.currentTarget;
  const cellIndex = Number(cell.dataset.index);

  if (Number.isNaN(cellIndex) || gameState.board[cellIndex]) {
    return;
  }

  const currentPlayer = gameState.currentPlayer;

  gameState.board[cellIndex] = currentPlayer;
  cell.textContent = currentPlayer;

  if (checkWin(currentPlayer)) {
    gameState.isGameActive = false;
    gameState.winner = currentPlayer;
    gameState.isDraw = false;
    updateStatusMessage();
    return;
  }

  if (checkDraw()) {
    gameState.isGameActive = false;
    gameState.winner = null;
    gameState.isDraw = true;
    updateStatusMessage();
    return;
  }

  gameState.currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  gameState.winner = null;
  gameState.isDraw = false;
  updateStatusMessage();
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

cells.forEach((cell, index) => {
  cell.dataset.index = index;
  cell.addEventListener('click', handleCellClick);
});

function restartGame() {
  gameState.board.fill(null);
  gameState.currentPlayer = 'X';
  gameState.isGameActive = true;
  gameState.winner = null;
  gameState.isDraw = false;

  cells.forEach((cell) => {
    cell.textContent = '';
  });

  updateStatusMessage();
}

if (restartButton) {
  restartButton.addEventListener('click', restartGame);
}

updateStatusMessage();
