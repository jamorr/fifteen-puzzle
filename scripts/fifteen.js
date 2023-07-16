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
    this.size = size;

    this.updateBackground(image);
    this.updateBoardPos(row, col);
    this.innerText = row * size + col + 1;
    this.classList.add("tile");
    // all other styling handled in CSS
  }

  /**
   * Update background image with new image file
   * @param {string} image - image realtive url
   */
  updateBackground(image) {
    this.style.background = `url(${image})`;
    const x_off = -this.col * 100;
    const y_off = -this.row * 100;
    const bg_factor = this.size * 100;
    this.style.backgroundSize = `${bg_factor}px ${bg_factor}px`;
    this.style.backgroundPosition = `${x_off}px ${y_off}px`;
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

    this.empty_tile = [size - 1, size - 1]; // store location of empty tile
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
    const [e_row, e_col] = this.empty_tile;
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
      [e_row, e_col] = this.empty_tile;
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
      this.empty_tile[1] += direction;
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
      this.empty_tile[0] += direction;
    }
  }

  /**
   * Update tile backgrounds based on originial positions
   * @param {string} image - new background image
   */
  changeBackgroundImage(image) {
    this.image = image;
    let count = this.size * this.size - 1;
    for (const [_, __, tile] of this.tileIter()) {
      tile.updateBackground(image);
      count--;
      if (count === 0) {
        break;
      }
    }
  }

  /**
   * Shuffles game board internal representation and
   * updates frontend representation
   */
  shuffle() {
    let [e_row, e_col] = this.empty_tile;
    for (
      let i = Math.round(Math.random());
      i < Math.pow(this.size, 2) * 10;
      i++
    ) {
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
   * Reset board back to original state visually and
   * internally
   */
  reset() {
    const new_board = Array.from(Array(this.size), () => Array(this.size));
    for (const [__, _, tile] of this.tileIter()) {
      if (tile === null) {
        continue;
      }

      tile.translateUpdate(tile.row, tile.col);
      new_board[tile.row][tile.col] = tile;
    }
    new_board[this.size - 1][this.size - 1] = null;
    this.empty_tile = [this.size - 1, this.size - 1];
    this.board = new_board;
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
}

// manages starting/ending game
class GameLogic {
  /**
   * Construct game logic class to manage game session
   * @constructor
   */
  constructor() {
    // get from player inputs or set a default
    this.board_wrapper = document.getElementsByClassName("game-board")[0];

    this.shuffle_button = document.getElementById("shuffle-button");
    this.reset_button = document.getElementById("reset-button");

    this.size = 3;

    const random_img_num = Math.floor(Math.random() * 4);

    this.image = `./assets/${random_img_num}.png`;

    this.game = new Board(this.size, this.image, this.board_wrapper);
    this.click_handle_ref = false;

    this.board_size_input = document.getElementById("board_size");
    this.board_image_input = document.getElementById("board_img_btn");

    this.handleBoardImageInput();
    this.handleBoardSizeInput();
  }

  /**
   * sets up event handling for the board size input element.
   * When the input value changes, it updates the board size and displays it
   * @function
   * @memberof Gamelogic
   */
  handleBoardSizeInput() {
    const board_size_input = document.getElementById("board_size");
    const board_size_value_element =
      document.getElementById("board_size_value");

    document.addEventListener("DOMContentLoaded", () => {
      board_size_input.value = 3;
    });

    board_size_input.addEventListener("input", () => {
      const new_size = parseInt(board_size_input.value);
      board_size_value_element.textContent = `${new_size}x${new_size}`;
      this.changeBoardSize(new_size);
    });
  }

  /**sets up event handling for the board image input button.
   * When the button is clicked, it cycles through different images for the board background.
   * @function
   * @memberof Gamelogic
   */
  handleBoardImageInput() {
    const board_image_input = document.getElementById("board_img_btn");
    let prev = 1;
    board_image_input.addEventListener("click", () => {
      prev++;
      prev %= 4;

      this.changeBoardImage(`./assets/${prev}.png`);
    });
  }

  /**
   * Changes the image of the board and updates the game accordingly.
   * @param {string} new_img - The URL or path to the new image for the board.
   */
  changeBoardImage(new_img) {
    if (this.image !== new_img) {
      this.game.changeBackgroundImage(new_img);
      this.image = new_img;
    }
  }

  /**
   * Changes the size of the board and updates the game accordingly.
   * @param {number} new_size - The new size for the board. It represents the number of rows and columns.
   */
  changeBoardSize(new_size) {
    if (this.size !== new_size) {
      this.size = new_size;
      this.board_wrapper.innerHTML = "";
      this.game = new Board(this.size, this.image, this.board_wrapper);
    }
  }

  /**
   * Add click handling for tiles
   */
  addClickHandle() {
    if (this.click_handle_ref) {
      return;
    }
    this.click_handle_ref = (event) => {
      this.clickHandler(event);
    };
    this.board_wrapper.addEventListener("click", this.click_handle_ref);
  }

  /**
   * Remove click handling for tiles
   */
  removeClickHandle() {
    if (!this.click_handle_ref) {
      return;
    }
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
   * Invert state of reset and shuffle buttons
   */
  invertButtons() {
    this.shuffle_button.disabled = !this.shuffle_button.disabled;
    this.reset_button.disabled = !this.reset_button.disabled;
  }

  /**
   * Initialize a new game board and add click handling
   * and shuffle board until shuffled
   */
  initGame() {
    this.addClickHandle();
    this.invertButtons();
    this.board_image_input.disabled = true;
    this.board_size_input.disabled = true;

    this.board_image_input.classList.add("after_shuffle");

    while (this.game.isSolved()) {
      this.game.shuffle();
    }
  }

  /**
   * Reset the game board to solved state
   */
  resetGame() {
    this.board_size_input.disabled = false;
    this.board_image_input.disabled = false;
    this.board_image_input.classList.remove("after_shuffle");
    this.board_image_input.classList.add("before_shuffle");
    this.removeClickHandle();
    this.game.updateHoverStyles(true);
    // this.game.reset();
    this.invertButtons();
  }

  /**
   * Display splash and remove click handling for board
   */
  endGame() {
    const congrats_modal = document.getElementById("modal");
    congrats_modal.style.display = "block";
  }
}

const game_session = new GameLogic();

const instructions = document.getElementById("instructions");
const instructions_ok = document.getElementById("instructions_ok");
instructions.addEventListener("click", () => {
  const instructions_pop_up = document.getElementById("instructions_popup");
  instructions_pop_up.style.display = "block";
});

instructions_ok.addEventListener("click", () => {
  const instructions_pop_up = document.getElementById("instructions_popup");
  instructions_pop_up.style.display = "none";
});

const shuffle_button = document.getElementById("shuffle-button");
shuffle_button.setAttribute("onclick", "game_session.initGame();");
shuffle_button.disabled = false;

const reset_button = document.getElementById("reset-button");
reset_button.setAttribute(
  "onclick",
  "game_session.resetGame(); game_session.game.reset()"
);
reset_button.disabled = true;

const congrats_modal = document.getElementById("modal");

congrats_modal.addEventListener("click", () => {
  congrats_modal.style.display = "none";
  game_session.resetGame();
});

const play_again = document.getElementById("playAgainBtn");
play_again.addEventListener("click", () => {
  congrats_modal.style.display = "none";
  game_session.initGame();
});
