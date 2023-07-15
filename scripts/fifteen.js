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
    this.size = size;
    this.image = image;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const tile_el = document.createElement("div", { is: "tile-w" });
        tile_el.placeNStyle(i, j, size, image);
        this.board[i][j] = tile_el;
        this.board_wrapper.appendChild(tile_el);
      }
    }

    this.emptyTile = this.board_wrapper.lastChild;
    this.emptyTile.classList.add("hidden");
  }

  // move tiles row or column if posssible
  moveTiles(tile) {
    const t_row = parseInt(tile.style.gridRow);
    const t_col = parseInt(tile.style.gridColumn);
    const e_row = parseInt(this.emptyTile.style.gridRow);
    const e_col = parseInt(this.emptyTile.style.gridColumn);
    if (t_row === e_row) {
      this.moveEmptyH(t_col - 1, e_row - 1, e_col - 1);
      this.updateBoardRow(e_row - 1);
    } else if (t_col === e_col) {
      this.moveEmptyV(t_row - 1, e_row - 1, e_col - 1);
      this.updateBoardCol(e_col - 1);
    }
  }

  moveEmptyH(num, row, col) {
    const r = row;
    let c = col;
    const direction = num < col ? -1 : 1;
    for (; c !== num; c += direction) {
      const temp = this.board[r][c];
      this.board[r][c] = this.board[r][c + direction];
      this.board[r][c + direction] = temp;
    }
  }
  moveEmptyV(num, row, col) {
    let r = row;
    const c = col;
    const direction = num < row ? -1 : 1;
    for (; r !== num; r += direction) {
      const temp = this.board[r][c];
      this.board[r][c] = this.board[r + direction][c];
      this.board[r + direction][c] = temp;
    }
  }
  // update tile location in grid row
  updateBoardRow(row) {
    const row_up = this.board[row];
    for (let i = 0; i < this.size; i++) {
      row_up[i].style.gridColumn = i + 1;
    }
  }

  // update tile location in grid column
  updateBoardCol(col) {
    for (let i = 0; i < this.size; i++) {
      this.board[i][col].style.gridRow = i + 1;
    }
  }
  updateEntireBoard() {
    for (let i = 0; i < this.size; i++) {
      this.updateBoardCol(i);
      this.updateBoardRow(i);
    }
  }
  //shuffle board before play begins
  shuffle() {
    let e_row = parseInt(this.emptyTile.style.gridRow) - 1;
    let e_col = parseInt(this.emptyTile.style.gridColumn) - 1;
    for (let i = 0; i < (this.size - 1) * 100; i++) {
      // move to space 1,2,3,...,size-1 of row or column
      // from left to right or top to bottom(dont allow no movement)
      let square = Math.floor(Math.random() * (this.size - 1));
      console.log(square);
      if (Math.floor(i % 2) === 0) {
        //move vertically
        if (square === e_row) {
          square++;
        }
        this.moveEmptyV(square, e_row, e_col);
        e_row = square;
      } else {
        //move horizontally
        if (square === e_col) {
          square++;
        }
        this.moveEmptyH(square, e_row, e_col);
        e_col = square;
      }
    }
    this.updateEntireBoard();
  }
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
  }
  addClickHandle() {
    this.board_wrapper.addEventListener("click", (event) =>
      this.clickHandler(event)
    );
  }

  removeClickHandle() {
    this.board_wrapper.removeEventListener("click", (event) =>
      this.clickHandler(event)
    );
  }

  // handles player click on board
  // finds tile clicked using target
  // returns tile if found or null if not
  clickHandler(event) {
    const element = event.target.closest(".tile");
    if (element === null) {
      return;
    }

    this.game.moveTiles(element);
  }
  // new game
  initGame() {
    this.game.shuffle();
    this.addClickHandle();
  }

  // end game
  endGame() {}
}

var game_session = new GameLogic();
