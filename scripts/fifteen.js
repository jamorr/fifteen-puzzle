// game tile HTML element constructor
class Tile extends HTMLDivElement {
  constructor() {
    super();
  }
  placeNStyle(row, col, size, image) {
    this.row = row;
    this.col = col;

    this.style.background = `url(${image})`;
    const x_off = Math.floor((1 / size) * col * 100);
    const y_off = Math.floor((1 / size) * row * 100);
    this.style.backgroundPosition = `${x_off}% ${y_off}%`;
    this.style.gridRow = row + 1;
    this.style.gridColumn = col + 1;
    this.innerText = row * size + col + 1;
    this.classList.add("tile");
    // all other styling handled in CSS
  }
  render(parentElement) {
    parentElement.appendChild(this);
  }
}
customElements.define("tile-w", Tile, { extends: "div" });
// dataclass for storing board and core functionality related to it
class Board {
  // initialize new board of given size
  constructor(size, image, board_wrapper) {
    this.board_wrapper = board_wrapper;
    this.board = Array.from(Array(size), () => Array(size));
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const tile_el = document.createElement("div", { is: "tile-w" });
        tile_el.placeNStyle(i, j, size, image);
        this.board[i][j] = tile_el;
        this.board_wrapper.appendChild(tile_el);
      }
    }
    // handling the bottom right piece of the puzzle
    this.empty_piece = this.board_wrapper.lastChild;
    this.empty_piece.classList.add("hidden");
  }

  // shuffle board before play begins
  shuffle() {}
  // solve the board for the player
  solve() {}
}

// manages starting/ending game
class GameLogic {
  // initializes all instance variables
  constructor() {
    // get from player inputs or set a default
    this.board_wrapper = document.getElementsByClassName("game-board")[0];
    this.size = 4;
    this.image = "./assets/real_toad.png";
    this.game = new Board(this.size, this.image, this.board_wrapper);
    this.addClickHandle();
  }
  addClickHandle() {
    this.board_wrapper.addEventListener("click", (event) =>
      this.clickHandler(event)
    );
  }

  removeClickHandle() {
    this.board_wrapper.removeEventListener("click", (event) => {
      this.clickHandler;
    });
  }

  // handles player click on board
  // finds tile clicked using target
  // returns tile if found or null if not
  clickHandler(event) {
    const element = event.target.closest(".tile");
    const elementRow = parseInt(element.style.gridRow[0]);
    const elementCol = parseInt(element.style.gridColumn[0]);

    const emptyRow = parseInt(this.game.empty_piece.style.gridRow);
    const emptyCol = parseInt(this.game.empty_piece.style.gridColumn);

    if (element === null) {
      return;
    }
    if (
      (elementRow === emptyRow && Math.abs(elementCol - emptyCol) === 1) ||
      (elementCol === emptyCol && Math.abs(elementRow - emptyRow) === 1)
    ) {
      element.classList.add("movable");
      this.movePiece(element);
      console.log("movable");
    } else {
      console.log("not movable");
    }

    // console.log(element);
  }
  // new game
  initGame() {
    // Shuffle the board
    this.game.shuffle();
    this.addClickHandle();
  }

  // end game
  endGame() {}

  // make move
  movePiece(tile) {
    const element = tile;
    const elementRow = parseInt(element.style.gridRow);
    const elementCol = parseInt(element.style.gridColumn);
    const emptyRow = parseInt(this.game.empty_piece.style.gridRow);
    const emptyCol = parseInt(this.game.empty_piece.style.gridColumn);

    // swapping the grid row and column values between the clicked element and the empty piece
    element.style.gridRow = emptyRow;
    element.style.gridColumn = emptyCol;
    this.game.empty_piece.style.gridRow = elementRow;
    this.game.empty_piece.style.gridColumn = elementCol;

    // update the board to reflect the new positions of the clicked element and the empty piece
    this.game.board[elementRow - 1][elementCol - 1] = this.game.empty_piece;
    this.game.board[emptyRow - 1][emptyCol - 1] = element;
  }
}

var game_session = new GameLogic();
