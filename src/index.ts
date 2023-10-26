import { createInterface } from 'readline';
import { stdin, stdout } from 'process';

interface Cell {
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
    minefield[i] = {...defaultCell};
    if (mineIndexes.has(i)) {
      minefield[i].mine = true;
    }
  }

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
      return '🚩';
    case cell.revealed:
      return cell.mine ? '💣' : ` ${cell.neighborMineCount}`;
    default: return '⬜';
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
      default: {
        const [x, y, action] = answer.split(' ');
        const index = (Number(y) - 1) * rowLength + (Number(x) - 1);
        const cell = minefield[index];
    
        if (cell.mine && action !== 'flag') {
          cell.revealed = true;
          printMinefield(minefield);
          console.log('You lose!');
          readlineInterface.close();
        }
    
        if (action === 'flag') cell.flagged = !cell.flagged;
        else cell.revealed = true;
      }
    }

    prompt();
  });
}

prompt();