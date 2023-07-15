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
    this.board_wrapper.lastChild.remove();
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
    this.board_wrapper.removeEventListener("click", this.clickHandler);
  }

  // handles player click on board
  // finds tile clicked using target
  // returns tile if found or null if not
  clickHandler(event) {
    const element = event.target.closest(".tile");
    if (element === null) {
      return;
    }
    console.log(element);

    if (element.classList.contains("movable")) {
      this.movePiece(element);
    }
  }
  // new game
  initGame() {}

  // end game
  endGame() {}

  // make move
  movePiece(tile) {
    if (tile.row === this.game.emptyRow || tile.col === this.game.emptyCol) {
      console.log("clicked movable");
    }
  }
}

var game_session = new GameLogic();
