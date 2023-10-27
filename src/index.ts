import { createInterface } from 'readline';
import { stdin, stdout } from 'process';

interface Cell {
  index: number;
  mine: boolean;
  flagged: boolean;
  revealed: boolean;
  neighborMineCount: number;
};

const defaultCell = { mine: false, flagged: false, revealed: false, neighborMineCount: 0 };
const rowLength = 8;
const boardSize = rowLength * rowLength;
const mineCount = 10;
const minefield = createMinefield();

const readlineInterface = createInterface({ input: stdin, output: stdout });
readlineInterface.on('close', () => process.exit(0));

function createMinefield() {
  // Fill a set with unique indexes for mines
  const mineIndexes = new Set<number>();
  while (mineIndexes.size < mineCount) {
    mineIndexes.add(Math.floor(Math.random() * boardSize));
  }

  // Create the minefield and populate with mines
  const minefield = new Array<Cell>(boardSize);
  for (let i = 0; i < boardSize; i++) {
    minefield[i] = {index: i, ...defaultCell};
    if (mineIndexes.has(i)) {
      minefield[i].mine = true;
    }
  }

  // Populate neighborMineCount
  minefield.forEach((cell, index) => {
    const neighbors = cellNeighbors(index, minefield);

    cell.neighborMineCount = neighbors.filter(neighbor => neighbor && neighbor.mine).length;
  });

  return minefield;
}

function printMinefield(mineField: Cell[]) {
  let minefieldString = '   1  2  3  4  5  6  7  8';
  minefieldString += mineField.map((cell, index) => {
    // Add a newline every 8 cells
    let cellString = '';
    if (index % rowLength === 0) cellString = `\n${index / rowLength + 1} `;
    else cellString = ' ';

    cellString += formatCell(cell);
    return cellString;
  }).join('');

  console.log(minefieldString);
}

function formatCell(cell: Cell) {
  switch (true) {
    case cell.flagged:
      return ' 🚩';
    case cell.revealed:
      return cell.mine ? '💣' : ` ${cell.neighborMineCount}`;
    default: return '⬜';
  }
}

function cellNeighbors(index: number, _minefield = minefield) {
  const checks = {
    topLeft: true,
    top: true,
    topRight: true,
    left: true,
    right: true,
    bottomLeft: true,
    bottom: true,
    bottomRight: true,
  };

  // if it's less than 7, it's on the top row
  if (index < rowLength) {
    checks.topLeft = false;
    checks.top = false;
    checks.topRight = false;
  }

  // if it's greater than 55, it's on the bottom row
  if (index > boardSize - rowLength) {
    checks.bottomLeft = false;
    checks.bottom = false;
    checks.bottomRight = false;
  }

  // if it's divisible by 8, it's on the left column
  if (index % rowLength === 0) {
    checks.topLeft = false;
    checks.left = false;
    checks.bottomLeft = false;
  }

  // if it's 7 more than a multiple of 8, it's on the right column
  if ((index + 1) % rowLength === 0) {
    checks.topRight = false;
    checks.right = false;
    checks.bottomRight = false;
  }

  const neighbors: Cell[] = [];

  if (checks.topLeft) neighbors.push(_minefield[index - rowLength - 1]);
  if (checks.top) neighbors.push(_minefield[index - rowLength]);
  if (checks.topRight) neighbors.push(_minefield[index - rowLength + 1]);
  if (checks.left) neighbors.push(_minefield[index - 1]);
  if (checks.right) neighbors.push(_minefield[index + 1]);
  if (checks.bottomLeft) neighbors.push(_minefield[index + rowLength - 1]);
  if (checks.bottom) neighbors.push(_minefield[index + rowLength]);
  if (checks.bottomRight) neighbors.push(_minefield[index + rowLength + 1]);

  return neighbors;
}

function crawl(index: number) {
  const cell = minefield[index];

  // If the cell is already revealed, return
  if (cell.revealed) {
    console.log('Cell already revealed');
    return;
  };

  // Reveal the cell
  cell.revealed = true;

  const cellsToCrawl = cellNeighbors(index).map((cell) => cell.index);
  const cellsCrawled = [index];

  while(cellsToCrawl.length) {
    const cell = minefield[cellsToCrawl[0]];
    cellsToCrawl.shift();

    // Cell has already been crawled
    if (cellsCrawled.includes(cell.index)) return;

    cellsCrawled.push(cell.index);

    // Cell is a mine
    if (cell.mine) return;

    // Has a count, reveal it
    if (cell.neighborMineCount > 0) cell.revealed = true;
    else {
      // Doesn't have a count, reveal and add neighbors to crawl
      cell.revealed = true;
      const neighbors = cellNeighbors(cell.index)
      const neighborIndexes = neighbors
        .filter((cell) => !cellsCrawled.includes(cell.index) && !cellsToCrawl.includes(cell.index))
        .map((cell) => cell.index);
      neighborIndexes.forEach((neighborIndex) => cellsToCrawl.push(neighborIndex));
    }
  }
}

function prompt() {
  printMinefield(minefield);
  readlineInterface.question('Enter coordinates to reveal:\n', (answer) => {
    switch(true) {
      case answer === 'q':
        readlineInterface.close();
        return;
      case answer === 'reveal':
        minefield.forEach(cell => cell.revealed = true);
        break;
      case answer === 'hide':
        minefield.forEach(cell => cell.revealed = false);
        break;
      case answer === 'reset':
        minefield.forEach(cell => {
          cell.revealed = false;
          cell.flagged = false;
        });
        break;
      default: {
        const [x, y, action] = answer.split(' ');
        // Convert coordinates to zero based index
        const index = (Number(y) - 1) * rowLength + (Number(x) - 1);
        const cell = minefield[index];
    
        if (cell.mine && action !== 'flag') {
          cell.revealed = true;
          printMinefield(minefield);
          console.log('You lose!');
          readlineInterface.close();
        }
    
        if (action === 'flag') cell.flagged = !cell.flagged;
        else crawl(index);
      }
    }

    prompt();
  });
}

prompt();