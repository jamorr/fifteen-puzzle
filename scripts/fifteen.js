// game tile HTML element constructor
class Tile extends HTMLDivElement {
  placeNStyle(row, col, size, image) {
    this.row = row;
    this.col = col;

    this.style.background = `url(${image})`;
    const x_off = -col * 100;
    const y_off = -row * 100;
    const bg_factor = size * 100;
    this.style.backgroundSize = `${bg_factor}px ${bg_factor}px`;
    this.style.backgroundPosition = `${x_off}px ${y_off}px`;
    this.style.gridRow = row + 1;
    this.style.gridColumn = col + 1;
    this.innerText = row * size + col + 1;
    this.classList.add("tile");
    // all other styling handled in CSS
  }
  getBoardPos() {
    const col = parseInt(this.style.gridColumn) - 1;
    const row = parseInt(this.style.gridRow) - 1;
    return [row, col];
  }

  render(parentElement) {
    parentElement.appendChild(this);
  }
}
customElements.define("tile-w", Tile, { extends: "div" });

// Dataclass for storing board and core functionality related to it
class Board {
  // Initialize new board of given size
  constructor(size, image, board_wrapper) {
    this.board_wrapper = board_wrapper; //html div containing grid
    this.board = Array.from(Array(size), () => Array(size)); // matrix holding html elements
    this.size = size; // board side length
    this.image = image; // board bg image

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const tile_el = document.createElement("div", { is: "tile-w" });
        tile_el.placeNStyle(i, j, size, image);

        this.board[i][j] = tile_el;
        this.board_wrapper.appendChild(tile_el);
      }
    }

    this.emptyTile = this.board_wrapper.lastChild; // empty tile
    this.emptyTile.classList.add("hidden");
  }

  // Move tiles row or column if posssible
  moveTiles(tile) {
    const [t_row, t_col] = tile.getBoardPos();
    const [e_row, e_col] = this.emptyTile.getBoardPos();
    // update internal board and then update display
    if (t_row === e_row) {
      this.moveEmptyH(t_col, e_row, e_col);
      this.updateBoardRow(e_row);
    } else if (t_col === e_col) {
      this.moveEmptyV(t_row, e_row, e_col);
      this.updateBoardCol(e_col);
    }
  }

  // Chick if the tile is movable and update hover styles
  // TODO: Make this only update tiles that changed instead of full board
  // ie. remove moveable from old row or col and add to new row or col
  updateHoverStyles() {
    const [e_row, e_col] = this.emptyTile.getBoardPos();
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const tile = this.board[i][j];

        if (i === e_row || j === e_col) {
          tile.classList.add("moveable");
        } else {
          tile.classList.remove("moveable");
        }
      }
    }
  }

  // Move empty tile horizontally
  moveEmptyH(num, row, col) {
    const r = row;

    const direction = num < col ? -1 : 1;
    for (let c = col; c !== num; c += direction) {
      [this.board[r][c], this.board[r][c + direction]] = [
        this.board[r][c + direction],
        this.board[r][c],
      ];
    }
  }
  // Move empty tile vertically
  moveEmptyV(num, row, col) {
    const c = col;
    const direction = num < row ? -1 : 1;
    for (let r = row; r !== num; r += direction) {
      [this.board[r][c], this.board[r + direction][c]] = [
        this.board[r + direction][c],
        this.board[r][c],
      ];
    }
  }
  // Update tile location in grid row
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

  // update all tile positions
  updateEntireBoard() {
    for (let i = 0; i < this.size; i++) {
      this.updateBoardCol(i);
      this.updateBoardRow(i);
    }
  }
  //shuffle board before play begins
  shuffle() {
    let [e_row, e_col] = this.emptyTile.getBoardPos();
    for (let i = 0; i < (this.size - 1) * 100; i++) {
      // move to space 1,2,3,...,size-1 of row or column
      // from left to right or top to bottom(dont allow no movement)
      let square = Math.floor(Math.random() * (this.size - 1));
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
    this.updateHoverStyles();
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
    this.size = 2;

    // this.image = "./assets/bombo.jpg";
    this.image = "./assets/real_toad.png";
    this.game = new Board(this.size, this.image, this.board_wrapper);
    this.click_handled = false;
  }

  addClickHandle() {
    this.board_wrapper.addEventListener("click", (event) =>
      this.clickHandler(event)
    );
    this.click_handled = true;
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
    this.game.updateHoverStyles();
  }

  // new game
  initGame() {
    if (!this.click_handled) {
      this.addClickHandle();
      this.click_handled = true;
    }
    this.game.shuffle();
    this.game.updateHoverStyles(-1, -1);
  }

  // end game
  isBoardSolved() {
    if (
      this.game.board[this.size - 1][this.size - 1].classList.contains("hidden")
    ) {
      let prev = 1;
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
          if (prev === parseInt(this.game.board[i][j].innerText)) {
            prev++;
          } else {
            return false;
          }
        }
      }
      return true;
    }
  }
  endGame() {
    const congratsModal = document.getElementById("modal");
    congratsModal.style.display = "block";

    const playAgain = document.getElementById("playAgainBtn");
    playAgain.addEventListener("click", () => {
      congratsModal.style.display = "none";
      game_session.initGame();
    });
  }
}

const game_session = new GameLogic();
game_session.initGame();
