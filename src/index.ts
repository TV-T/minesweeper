interface Cell {
  mine: boolean;
  flagged: boolean;
  revealed: boolean;
  neighborMineCount: number;
};

const defaultCell = { mine: false, flagged: false, revealed: false, neighborMineCount: 0 };

const boardSize = 8 * 8;
const mineCount = 10;

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
  const minefieldString = mineField.map((cell, index) => {
    // Add a newline every 8 cells
    let cellString = '';
    if (index % 8 === 0) cellString = '\n';
    else cellString = '|';

    cellString += formatCell(cell);
    return cellString;
  }).join('');

  console.log(minefieldString);
}

function formatCell(cell: Cell) {
  switch (true) {
    case cell.flagged:
      return 'F';
    case cell.revealed:
      return cell.mine ? 'X' : cell.neighborMineCount.toString();
    default: return ' ';
  }
}

printMinefield(createMinefield());