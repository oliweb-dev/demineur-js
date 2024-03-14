const levelSelect = document.getElementById('level-select');
const btnPlay = document.getElementById('btnPlay');
const scoreHtml = document.getElementById('score');
const gridHtml = document.getElementById('grid');
let grid = 0;
let mine = 0;
let gridArray = [];
const widthCell = 30;
let numberCell = grid * grid;
let win = false;
let lose = false;

btnPlay.addEventListener('click', () => {
   const level = levelSelect.value;

   switch(level) {
      case '1':
         grid = 10;
         mine = 10;
         break;
      case '2':
         grid = 15;
         mine = 40;
        break;
      case '3':
         grid = 20;
         mine = 99;
        break;
      default:
        grid = 10;
        mine = 10;
    }

    numberCell = grid * grid;
    createGridArray();
});

function createGridArray() {
   gridArray = [];
   //btnPlay.textContent = (win || lose) ? 'Rejouer' : 'Jouer';
   scoreHtml.textContent = '';
   scoreHtml.classList.remove('text-success');
   scoreHtml.classList.remove('text-danger');
   win = false;
   lose = false;

   const getRandomInt = max => Math.floor(Math.random() * max);

   const setValueCell = cellTarget => {
      if (cellTarget.v !== 9) cellTarget.v += 1;
   };

   // Build the array
   for (let y = 0; y < grid; y++) {
      for (let x = 0; x < grid; x++) {
         gridArray.push({
            x,
            y,
            id: `${x}_${y}`,
            v: 0,
            w: false,
         });
      }
   }

   // Add mines
   let NumberMineBuffer = mine;
   while (NumberMineBuffer > 0) {
      let x = getRandomInt(grid);
      let y = getRandomInt(grid);
      let index = gridArray.findIndex(g => g.x === x && g.y === y && g.v !== 9);
      if (index !== -1) {
         // Already exist ?
         gridArray[index].v = 9;
         NumberMineBuffer--;
      }
   }

   // Add clues
   for (let y = 0; y < grid; y++) {
      for (let x = 0; x < grid; x++) {
         let index = gridArray.findIndex(g => g.x === x && g.y === y);
         let cell = gridArray.at(index);
         // Mine ?
         if (cell.v === 9) {
            // Cell right -------------
            if (cell.x !== grid - 1) {
               let indexCell = gridArray.findIndex(g => g.x === x + 1 && g.y === y);
               setValueCell(gridArray[indexCell]);
            }
            // Cell left -------------
            if (cell.x !== 0) {
               let indexCell = gridArray.findIndex(g => g.x === x - 1 && g.y === y);
               setValueCell(gridArray[indexCell]);
            }
            // Cell top -------------
            if (cell.y !== 0) {
               let indexCell = gridArray.findIndex(g => g.x === x && g.y === y - 1);
               setValueCell(gridArray[indexCell]);
            }
            // Cell Bottom -------------
            if (cell.y !== grid - 1) {
               let indexCell = gridArray.findIndex(g => g.x === x && g.y === y + 1);
               setValueCell(gridArray[indexCell]);
            }
            // --------------------------------------------------------------------------
            // Cell top right -------------
            if (cell.y !== 0 && cell.x !== grid - 1) {
               let indexCell = gridArray.findIndex(g => g.x === x + 1 && g.y === y - 1);
               setValueCell(gridArray[indexCell]);
            }
            // Cell top left -------------
            if (cell.y !== 0 && cell.x !== 0) {
               let indexCell = gridArray.findIndex(g => g.x === x - 1 && g.y === y - 1);
               setValueCell(gridArray[indexCell]);
            }
            // Cell bottom right -------------
            if (cell.y !== grid - 1 && cell.x !== grid - 1) {
               let indexCell = gridArray.findIndex(g => g.x === x + 1 && g.y === y + 1);
               setValueCell(gridArray[indexCell]);
            }
            // Cell bottom left -------------
            if (cell.y !== grid - 1 && cell.x !== 0) {
               let indexCell = gridArray.findIndex(g => g.x === x - 1 && g.y === y + 1);
               setValueCell(gridArray[indexCell]);
            }
         }
      }
   }

   gridHtml.innerHTML = '';

   gridHtml.style.width = `${grid * widthCell}px`;
   
   for (let g of gridArray) {
      let cell = document.createElement('div');
      cell.classList.add('grey');
      cell.id = g.id;
      cell.addEventListener('click', handleClick);
      cell.addEventListener('contextmenu', handleRightClick);
      gridHtml.append(cell);
   }
}

function gameVisible() {
   for (let y = 0; y < grid; y++) {
      for (let x = 0; x < grid; x++) {
         const index = gridArray.findIndex(g => g.w !== true && g.x === x && g.y === y);
         if (index !== -1) {
            removeClass(gridArray[index]);
         }
      }
   }
}

function removeClass(cellTarget) {
   cellTarget.w = true;
   const cellHtml = document.getElementById(cellTarget.id);
   cellHtml.classList.remove('grey');
   // Clue
   if (cellTarget.v !== 0) {
      cellHtml.innerText = cellTarget.v;
      if (cellTarget.v === 1) cellHtml.classList.add('text-secondary');
      else if (cellTarget.v === 2) cellHtml.classList.add('text-success');
      else if (cellTarget.v === 9) {
         cellHtml.innerText = '💣';
      } else {
         cellHtml.classList.add('text-danger');
      }
   }

   const countFalseW = gridArray.filter(item => item.w === false).length;
   // Check if only mines are left
   if (countFalseW === mine) win = true;

   if (win && !lose) {
      gameVisible();
      scoreHtml.textContent = '👏 Bravo, vous avez gagné !';
      scoreHtml.classList.add('text-success');
      btnPlay.textContent = 'Rejouer';
   }
}

function propagation(cell) {
   removeClass(cell);
   let x = cell.x;
   let y = cell.y;

   // Cell right -------------
   if (x !== grid - 1 && cell.v === 0) {
      let indexCell = gridArray.findIndex(g => g.x === x + 1 && g.y === y && g.w === false);
      if (indexCell !== -1) propagation(gridArray[indexCell]);
   }
   // Cell left -------------
   if (cell.x !== 0 && cell.v === 0) {
      let indexCell = gridArray.findIndex(g => g.x === x - 1 && g.y === y && g.w === false);
      if (indexCell !== -1) propagation(gridArray[indexCell]);
   }
   // Cell top -------------
   if (cell.y !== 0 && cell.v === 0) {
      let indexCell = gridArray.findIndex(g => g.x === x && g.y === y - 1 && g.w === false);
      if (indexCell !== -1) propagation(gridArray[indexCell]);
   }
   // Cell Bottom -------------
   if (cell.y !== grid - 1 && cell.v === 0) {
      let indexCell = gridArray.findIndex(g => g.x === x && g.y === y + 1 && g.w === false);
      if (indexCell !== -1) propagation(gridArray[indexCell]);
   }
   // --------------------------------------------------------------------------
   // Cell top right -------------
   if (cell.y !== 0 && cell.x !== grid - 1 && cell.v === 0) {
      let indexCell = gridArray.findIndex(g => g.x === x + 1 && g.y === y - 1 && g.w === false);
      if (indexCell !== -1) propagation(gridArray[indexCell]);
   }
   // Cell top left -------------
   if (cell.y !== 0 && cell.x !== 0 && cell.v === 0) {
      let indexCell = gridArray.findIndex(g => g.x === x - 1 && g.y === y - 1 && g.w === false);
      if (indexCell !== -1) propagation(gridArray[indexCell]);
   }
   // Cell bottom right -------------
   if (cell.y !== grid - 1 && cell.x !== grid - 1 && cell.v === 0) {
      let indexCell = gridArray.findIndex(g => g.x === x + 1 && g.y === y + 1 && g.w === false);
      if (indexCell !== -1) propagation(gridArray[indexCell]);
   }
   // Cell bottom left -------------
   if (cell.y !== grid - 1 && cell.x !== 0 && cell.v === 0) {
      let indexCell = gridArray.findIndex(g => g.x === x - 1 && g.y === y + 1 && g.w === false);
      if (indexCell !== -1) propagation(gridArray[indexCell]);
   }
}

function getIndex(idHtml) {
   const x = parseInt(idHtml.split('_')[0]);
   const y = parseInt(idHtml.split('_')[1]);
   return gridArray.findIndex(g => g.x === x && g.y === y);
}

function handleClick(event) {
   if (win || lose) return;

   const idHtml = event.currentTarget.id;
   const index = getIndex(idHtml);

   if (index === -1) return;

   let cell = gridArray[index];
   // Mine = 9, empty = 0, Clue = [1-8]
   if (cell.v === 9) {
      // Discover a mine
      lose = true;
      scoreHtml.textContent = '💣 Malheureusement, vous avez perdu.';
      scoreHtml.classList.add('text-danger');  
      btnPlay.textContent = 'Rejouer';
      gameVisible();
   } else if (cell.v === 0) {
      // Discover a empty box
      propagation(cell);
   } else {
      // Discover a clue
      removeClass(gridArray[index]);
   }
}

function handleRightClick(event) {
   event.preventDefault();
   if (win || lose) return;
   const idHtml = event.currentTarget.id;
   const cellContent = event.currentTarget.innerText;
   const cellHtml = document.getElementById(idHtml);
   const index = getIndex(idHtml);
   if (index === -1) return;
   let cell = gridArray[index];

   switch (cellContent) {
      case '🚩':
         cellHtml.innerText = '❔';
         break;
      case '❔':
         // Set to initial value
         cellHtml.innerText = cell.v;
         break;
      default:
         cellHtml.innerText = '🚩';
   }
}