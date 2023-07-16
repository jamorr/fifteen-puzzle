"use strict";

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

  getTileNum() {
    return parseInt(this.innerText);
  }

  updateBoardPos(n_row, n_col) {
    this.style.translate = "";
    this.style.gridRow = n_row + 1;
    this.style.gridColumn = n_col + 1;
  }

  // TODO: add working tile animations here -tis cursed rn
  translateUpdate(n_row, n_col) {
    const [c_row, c_col] = this.getBoardPos();
    const diff_x = n_col - c_col - 1;
    const diff_y = n_row - c_row - 1;
    this.style.translate = `${diff_x * 100}px ${diff_y * 100}px`;
    setTimeout(() => {
      this.updateBoardPos(n_row, n_col);
    }, 100);
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

    for (const [i, j, _] of this.tileIter()) {
      const tile_el = document.createElement("div", { is: "tile-w" });
      tile_el.placeNStyle(i, j, size, image);

      this.board[i][j] = tile_el;
      this.board_wrapper.appendChild(tile_el);
    }

    this.emptyTile = [size - 1, size - 1]; // store location of empty tile
    this.board_wrapper.lastChild.remove();
    this.board[size - 1][size - 1] = null;
  }

  // iterator that yields tiles and their board pos
  *tileIter() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        yield [i, j, this.board[i][j]];
      }
    }
  }
  // Move tiles row or column if posssible
  moveTiles(tile) {
    const [t_row, t_col] = tile.getBoardPos();
    const [e_row, e_col] = this.emptyTile;
    // update internal board and then update display
    if (t_row === e_row) {
      this.moveEmptyH(t_col, e_row, e_col);
    } else if (t_col === e_col) {
      this.moveEmptyV(t_row, e_row, e_col);
    }
  }

  // Chick if the tile is movable and update hover styles
  // TODO: Make this only update tiles that changed instead of full board
  // ie. remove moveable from old row or col and add to new row or col
  updateHoverStyles(remove = false) {
    let e_row;
    let e_col;
    if (remove === true) {
      [e_row, e_col] = [-1, -1];
    } else {
      [e_row, e_col] = this.emptyTile;
    }
    for (const [i, j, tile] of this.tileIter()) {
      if (tile === null) {
        continue;
      }
      if (i === e_row || j === e_col) {
        tile.classList.add("moveable");
      } else {
        tile.classList.remove("moveable");
      }
    }
  }

  // Move empty tile horizontally
  moveEmptyH(num, row, col) {
    const r = row;
    const direction = num < col ? -1 : 1;
    for (let c = col; c !== num; c += direction) {
      this.board[r][c + direction].translateUpdate(r, c);
      this.board[r][c] = this.board[r][c + direction];
      this.board[r][c + direction] = null;
      this.emptyTile[1] += direction;
    }
  }
  // Move empty tile vertically
  moveEmptyV(num, row, col) {
    const c = col;
    const direction = num < row ? -1 : 1;
    for (let r = row; r !== num; r += direction) {
      this.board[r + direction][c].translateUpdate(r, c);
      this.board[r][c] = this.board[r + direction][c];
      this.board[r + direction][c] = null;
      this.emptyTile[0] += direction;
    }
  }

  // update all tile positions
  updateEntireBoard() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] === null) {
          continue;
        }
        this.board[i][j].updateBoardPos(i, j);
      }
    }
  }
  //shuffle board before play begins
  shuffle() {
    let [e_row, e_col] = this.emptyTile;
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
    this.updateHoverStyles();
  }
  // end game
  isSolved() {
    if (this.board[this.size - 1][this.size - 1] !== null) {
      return false;
    }
    let prev = 0;
    for (const [_, __, tile] of this.tileIter()) {
      prev++;
      if (tile !== null && prev !== tile.getTileNum()) {
        return false;
      }
    }
    return true;
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
    this.click_handle_ref = false;
  }

  addClickHandle() {
    this.click_handle_ref = (event) => {
      this.clickHandler(event);
    };
    this.board_wrapper.addEventListener("click", this.click_handle_ref);
  }

  removeClickHandle() {
    this.board_wrapper.removeEventListener("click", this.click_handle_ref);
    this.click_handle_ref = false;
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
    // check if game is over
    if (this.game.isSolved()) {
      this.endGame();
    }
  }

  // new game
  initGame() {
    if (!this.click_handler_ref) {
      this.addClickHandle();
    }
    while (this.game.isSolved()) {
      this.game.shuffle();
    }
  }

  endGame() {
    const congratsModal = document.getElementById("modal");
    congratsModal.style.display = "block";
    congratsModal.addEventListener("click", () => {
      congratsModal.style.display = "none";
      this.removeClickHandle();
      this.game.updateHoverStyles(true);
    });

    const playAgain = document.getElementById("playAgainBtn");
    playAgain.addEventListener("click", () => {
      congratsModal.style.display = "none";
      game_session.initGame();
    });
  }
}

const game_session = new GameLogic();
// game_session.initGame();
// game_session.endGame();
