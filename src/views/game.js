import Game from '../models/game';
import Hit from '../sounds/hit.flac';
import Miss from '../sounds/miss.mp3';

class GameView {
  constructor(size = 10) {
    this.size = size;
    this.game = new Game('You', 'Enemy', size);
    this.game.player1.targetBoard.placeAllShips();
    this.game.player2.targetBoard.placeAllShips();
    this.playerBoardNode = document.getElementById('PlayerBoard');
    this.enemyBoardNode = document.getElementById('EnemyBoard');
    this.enemyMoves = [...Array(this.size ** 2).keys()];
    this.hit = new Audio(Hit);
    this.miss = new Audio(Miss);
    this.initHeader();
  }

  run() {
    GameView.renderBoard(this.playerBoardNode, this.game.player2.targetBoard.board);
    this.playerBoardNode.classList.toggle('PausedBoard');

    GameView.renderBoard(this.enemyBoardNode, this.game.player1.targetBoard.board, true);

    this.enemyBoardNode.childNodes.forEach(cell => {
      cell.addEventListener('click', async (e) => {
        const board = e.target.parentNode;
        if (!this.game.over && !board.classList.contains('PausedBoard')) {
          const playerResult = this.playerPlay(cell);
          if (playerResult === 'missed') {
            let enemyResult = null;
            this.toggleBoards();
            do {
              await new Promise(r => setTimeout(r, 1500));
              enemyResult = this.enemyPlay();
            } while (enemyResult === 'hit' && !this.game.over);
            this.toggleBoards();
          }

          if (this.game.over) {
            if (this.game.winner.name === 'You') this.gameOver('Congratulations, you win!');
            else {
              this.gameOver('Uh oh, the Enemy wins!');
            }
          }
        }
      });
    });
  }

  playerPlay(cell) {
    const result = this.game.play(cell.dataset);
    if (result) {
      cell.classList.add(result);
      this.playSound(result);
    }

    return result;
  }

  enemyPlay() {
    const move = this.enemyMoves.splice(Math.floor(Math.random() * this.enemyMoves.length), 1)[0];
    const coords = { x: Math.floor(move / this.size), y: move % this.size };
    const result = this.game.play(coords);
    const cell = this.playerBoardNode
      .querySelector(`[data-x="${coords.x}"][data-y="${coords.y}"]`);
    cell.classList.add(result);
    this.playSound(result);

    return result;
  }

  playSound(result) {
    const sound = result === 'hit' ? this.hit : this.miss;
    sound.pause();
    sound.currentTime = 0;
    sound.play();
  }

  toggleBoards() {
    this.playerBoardNode.classList.toggle('PausedBoard');
    this.enemyBoardNode.classList.toggle('PausedBoard');
  }

  static renderBoard(boardNode, board, enemy = false) {
    board.forEach((row, i) => {
      row.forEach((cell, j) => {
        const cellNode = document.createElement('div');
        cellNode.classList.add('cell');
        cellNode.dataset.x = i;
        cellNode.dataset.y = j;
        if (!enemy && board[i][j].shipId) {
          cellNode.classList.add('ship');
        }
        boardNode.appendChild(cellNode);
      });
    });
    const boardMessage = document.createElement('div');
    boardMessage.className = 'BoardMessage';
    boardMessage.innerHTML = enemy ? 'The enemy is playing...' : 'Your turn';
    boardNode.appendChild(boardMessage);
  }

  initHeader() {
    const headerNode = document.getElementById('header');
    const h1 = document.createElement('h1');
    h1.innerHTML = 'Battleships';
    this.messageContainer = document.createElement('div');
    this.messageContainer.classList.toggle('hidden');
    this.message = document.createElement('p');
    const button = document.createElement('button');
    button.innerHTML = 'Play again?';
    button.addEventListener('click', () => { window.location.reload(); });
    this.messageContainer.appendChild(this.message);
    this.messageContainer.appendChild(button);

    headerNode.appendChild(h1);
    headerNode.appendChild(this.messageContainer);
  }

  gameOver(message) {
    this.message.innerHTML = message;
    this.messageContainer.classList.toggle('hidden');
  }
}

export default GameView;
