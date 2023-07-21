"use strict";

/**
 * @class
 * @classdesc-Class representing a moveable tile on the game board.
 */
class Tile extends HTMLDivElement {
  /**
   * Place and style the tile in the board
   * @param {number} row - tile row in board matrix
   * @param {number} col - tile column in board matrix
   * @param {number} size - side length of the board
   * @param {string} image - image file to use as bg
   */
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
  /**
   * Get the tile board position in the board matrix
   * @returns {Number[]} - row and column of tile
   */
  getBoardPos() {
    const col = parseInt(this.style.gridColumn) - 1;
    const row = parseInt(this.style.gridRow) - 1;
    return [row, col];
  }
  /**
   * Get the tile number stored in its inner text
   * @returns {number} - tile number as an integer
   */
  getTileNum() {
    return parseInt(this.innerText);
  }
  /**
   * Change the location of the tile in the grid and stop animation
   * @param {number} n_row - new row position of tile
   * @param {number} n_col - new column position of tile
   */
  updateBoardPos(n_row, n_col) {
    // this.style.translate = "0px 0px";
    this.style.translate = "";
    this.style.gridRow = n_row + 1;
    this.style.gridColumn = n_col + 1;
  }
  /**
   * Activate the tile move animation then update the tile board position
   * @param {number} n_row - new row position of tile
   * @param {number} n_col - new column position of tile
   */
  translateUpdate(n_row, n_col) {
    const [c_row, c_col] = this.getBoardPos();
    const diff_x = n_col - c_col - 1;
    const diff_y = n_row - c_row - 1;
    // const diff_x = n_col - c_col;
    // const diff_y = n_row - c_row;
    // this.style.translate = "50px 50px";
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

/** class for storing board and core functionality related to it */
class Board {
  /**
   * Construct and display new board in sorted order
   * @constructor
   * @param {number} size - side length of the board
   * @param {string} image - background image to use for board
   * @param {HTMLDivElement} board_wrapper - div to place tiles into
   */
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
  /**
   * Iterates over tiles in the board
   * @generator
   * @yields {[number, number, Tile]} - tile row and column and
   * tiles on board from top to bottom left to right
   */
  *tileIter() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        yield [i, j, this.board[i][j]];
      }
    }
  }
  /**
   *  Swap location of empty tile and tile clicked by user
   *  by shifting column/row of tiles between them towards
   *  empty tiles current location
   * @param {Tile} tile - tile to clicked on by user
   */
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
  /**
   * Add and remove hover style from tiles based on location of
   * empty tile
   * @param {boolean} [remove=false] - remove hover style from all tiles
   */
  updateHoverStyles(remove = false) {
    // TODO: Make this only update tiles that changed instead of full board
    // ie. remove moveable from old row or col and add to new row or col
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
  /**
   * Move a group of tiles horizontally
   * @param {number} num - new column location for empty tile
   * @param {number} row - current empty tile row
   * @param {number} col - current empty tile column
   */
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
  /**
   * Move a group of tiles vertically
   * @param {number} num - new row location for empty tile
   * @param {number} row - current empty tile row
   * @param {number} col - current empty tile column
   */
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
  /**
   * Update tile positions for all tiles on the board
   * to match with backend representation
   */
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
  /**
   * Shuffles game board internal representation and
   * updates frontend representation
   */
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
  /**
   * Checks if game board is solved
   * @returns {boolean} - true if board is solved
   */
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
  /**
   * Construct game logic class to manage game session
   * @constructor
   */
  // initializes all instance variables
  constructor() {
    // get from player inputs or set a default
    this.board_wrapper = document.getElementsByClassName("game-board")[0];
    this.size = 3;

    // this.image = "./assets/bombo.jpg";
    this.image = "./assets/1.png";
    this.game = new Board(this.size, this.image, this.board_wrapper);
    this.click_handle_ref = false;
    this.click_handled = false;

    const boardSizeInput = document.getElementById("board_size");
    const boardSizeValueElement = document.getElementById("board_size_value");

    boardSizeInput.addEventListener("input", () => {
      const newSize = parseInt(boardSizeInput.value);
      boardSizeValueElement.textContent = `${newSize}x${newSize}`;
      game_session.changeBoardSize(newSize);
    });

    const boardImageInput = document.getElementById("board_img");
    let prev = 1;
    boardImageInput.addEventListener("click", () => {
      prev++;
      let newImg;
      if (prev > 4) {
        prev = 1;
      }
      newImg = `./assets/${prev}.png`;

      game_session.changeBoardImage(newImg);
    });
  }

  changeBoardImage(newImg) {
    if (this.image !== newImg) {
      this.image = newImg;
      this.removeClickHandle();
      this.board_wrapper.innerHTML = "";
      this.game = new Board(this.size, this.image, this.board_wrapper);
      this.addClickHandle();
    }
  }

  changeBoardSize(newSize) {
    if (this.size !== newSize) {
      this.size = newSize;
      this.removeClickHandle();
      this.board_wrapper.innerHTML = "";
      this.game = new Board(this.size, this.image, this.board_wrapper);
      this.addClickHandle();
    }
    
  }
  /**
   * Add click handling for tiles
   */
  addClickHandle() {
    this.click_handle_ref = (event) => {
      this.clickHandler(event);
    };
    this.board_wrapper.addEventListener("click", this.click_handle_ref);
  }
  /**
   * Remove click handling for tiles
   */
  removeClickHandle() {
    this.board_wrapper.removeEventListener("click", this.click_handle_ref);
    this.click_handle_ref = false;
  }
  /**
   * Handles clicks on tiles. Finds closest tile clicked
   * and attempts to move tile. Check if game is over after
   * moving
   * @param {event} click
   */
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
  /**
   * Initialize a new game board and add click handling
   * and shuffle board until shuffled
   */
  initGame() {
    if (!this.click_handler_ref) {
      this.addClickHandle();
    }
    while (this.game.isSolved()) {
      this.game.shuffle();
    }
  }
  /**
   * Display splash and remove click handling for board
   */
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