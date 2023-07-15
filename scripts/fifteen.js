// handles player click on board
// finds tile clicked using target
// returns tile if found or null if not
function clickHandler(event) {}

// game tile HTML element constructor
class Tile extends HTMLDivElement {
  constructor(row, col, image) {
    super();
    this.style.background = `url(${image})`;
    const x_off = -100 * col;
    const y_off = -100 * row;
    this.style.backgroundPosition = `${x_off}px ${y_off}px`;
    this.row = row;
    this.col = col;
  }
}

// dataclass for storing board and core functionality related to it
class Board {
  // initialize new board of given size
  constructor(size, image) {
    this.board = Array.from(Array(size), () => {
      Array(size);
    });
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        this.board[i][j] = new Tile(i, j, image);
      }
    }
  }
  // shuffle board before play begins
  shuffle() {}
  // solve the board for the player
  solve() {}
}

// manages starting/ending game
class GameLogic {
  // initializes all instance variables
  constructor() {}

  // new game
  initGame() {}

  // end game
  endGame() {}

  // make move
  movePiece() {}
}
