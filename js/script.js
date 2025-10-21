const cells = document.querySelectorAll('[data-cell]');
const statusElement = document.querySelector('#game-status');

const gameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  isGameActive: true,
};

function updateStatusMessage() {
  if (!statusElement) {
    return;
  }

  if (gameState.isGameActive) {
    statusElement.textContent = `輪到玩家 ${gameState.currentPlayer} 下棋`; 
  } else {
    statusElement.textContent = '遊戲已結束';
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

  gameState.board[cellIndex] = gameState.currentPlayer;
  cell.textContent = gameState.currentPlayer;

  gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
  updateStatusMessage();
}

cells.forEach((cell, index) => {
  cell.dataset.index = index;
  cell.addEventListener('click', handleCellClick);
});

updateStatusMessage();
