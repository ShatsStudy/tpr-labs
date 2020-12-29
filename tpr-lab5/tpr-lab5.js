const fs = require("fs");
const SimpleSimplex = require('simple-simplex');

//helper functions
const outputTableMatrix = (rowNames, columnNames, inputMatrix) => {
  let outputMatrix = {};
  class Matrix {
    constructor(rowName, inputMatrixArr) {
      for (let i = 0; i < columnNames.length; i++) {
        this[rowName[i]] = inputMatrixArr[i];
      }
    }
  }

  for (let i = 0; i < rowNames.length; i++) {
    outputMatrix[rowNames[i]] = new Matrix(columnNames, inputMatrix[0].length ? inputMatrix[i] : inputMatrix)
  }

  return outputMatrix;
}

const findDominatedRow = (arr, checkIndex, initMatrix) => { 
  let x = -1;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] >= initMatrix[checkIndex][i]) {
      x = checkIndex;
    } else if (checkIndex < initMatrix.length - 1) {
      x = -1;
      return findDominatedRow(arr, checkIndex + 1, initMatrix);
    } else {
      x = -1;
      return x;
    }
  }
  return x;
}

const findDominatedCol = (index, checkIndex, initMatrix) => { 
  let x = -1;
  for (let i = 0; i < initMatrix.length; i++) {
    if (initMatrix[i][index] <= initMatrix[i][checkIndex]) {
      x = checkIndex;
    } else if (checkIndex < initMatrix[0].length-1) {
      x = -1;
      return findDominatedCol(index, checkIndex + 1, initMatrix);
    } else {
      x = -1;
      return x;
    }
  }
  return x;
}

const symplexSolution = (matrix) => {
  const constraints = matrix.map(arr => {
      const namedVector = arr.reduce((acc, cur, i) => {
        acc[`x${i+1}`] = cur;
        return acc;
      }, {});
      return {
        namedVector: namedVector,
        constraint: '<=',
        constant: 1,
      }
    })
    
    const solver = new SimpleSimplex({
      objective: {
        x1: 1,
        x2: 1,
        x3: 1,
        x4: 1,
        x5: 1,
      },
      constraints: constraints,
      optimizationType: 'max',
    });
     
    const result = solver.solve({
      methodName: 'simplex',
    });
     
    return {
      solution: result.solution,
      isOptimal: result.details.isOptimal,
    };
}


/* initial values **/ 

const data = fs.readFileSync('./tpr-lab5-input.txt', 'utf8');
const transformedFileData = data.split('\n');

const colNames = ['B1', 'B2', 'B3', 'B4', 'B5'];
const rowNames = ['A1', 'A2', 'A3', 'A4', 'A5'];
let initialMatrix = [];
for (let i = 0; i <= 4; i++) {
  initialMatrix = [...initialMatrix, transformedFileData[i].split(',').map(el => +el)]
}

console.table(outputTableMatrix(rowNames, colNames, initialMatrix));

/* Пошук сідлової точки **/ 

const minA = initialMatrix.map(arr => Math.min(...arr));
let maxB = [];
for (let i = 0; i < initialMatrix[0].length; i++) {
  const iCol = initialMatrix.map(arr => arr[i])
  maxB = [...maxB, Math.max(...iCol)];
}

const downGameValue = Math.max(...minA);
const upGameValue = Math.min(...maxB);

if (downGameValue !== upGameValue) {
  console.log('\n Сідлова точка відсутня, гравці вибирають змішані стратегії. \n')
} else {
  console.log(`\n Сідлова точка - ${downGameValue}. Ціна гри: ${downGameValue} \n`)
}
/* Спрощення матриці (перевірка на домінуючі рядки і стовбці) **/ 

let dominatedRowIndex = -1;
for (let index = 0; index < initialMatrix.length - 1; index++) {
  const domRow = findDominatedRow(initialMatrix[index], index + 1, initialMatrix);
  dominatedRowIndex = domRow !== -1 ? domRow : dominatedRowIndex;
}

let simplifiedMatrix = initialMatrix.filter((_, i) => i !== dominatedRowIndex);

if (dominatedRowIndex !== -1) {
  console.log(`Матриця має домінуючий рядок під номером ${dominatedRowIndex + 1} та спрощується до виду: `)
  onsole.table(outputTableMatrix(rowNames, colNames, simplifiedMatrix))
} else {
  console.log(`Матриця не має домінуючих рядків.`)
}

let dominatedColIndex = -1;
for (let index = 0; index < simplifiedMatrix[0].length - 1; index++) {
  const domCol = findDominatedCol(index, index + 1, simplifiedMatrix);
  dominatedColIndex = domCol !== -1 ? domCol : dominatedColIndex;
}

simplifiedMatrix = simplifiedMatrix.map(arr => arr.filter((_, i) => i !== dominatedColIndex));


if (dominatedRowIndex !== -1) {
  console.log(`Матриця має домінуючу колонку під номером ${dominatedColIndex + 1} та спрощується до виду: `)
  onsole.table(outputTableMatrix(rowNames, colNames, simplifiedMatrix))
} else {
  console.log(`Матриця не має домінуючих колонок. \n`)
}

const simplifiedMatrixB = Object.keys(simplifiedMatrix[0]).map(c => simplifiedMatrix.map(r => r[c]));

console.log(`Шукаємо рішення у змішаних стратегіях. \n`)
// Симплекс метод для гравця А
const solutionPlayerA = symplexSolution(simplifiedMatrix);
// Симплекс метод для гравця B
const solutionPlayerB = symplexSolution(simplifiedMatrixB);

// Вивід результатів гри
const optimalStrategyA = [
  ...Object.values(solutionPlayerA.solution.coefficients), 
  solutionPlayerA.solution.optimum
].map(el => +parseFloat(el).toFixed(4));

const optimalStrategyB = [
  ...Object.values(solutionPlayerB.solution.coefficients), 
  solutionPlayerB.solution.optimum
].map(el => +parseFloat(el).toFixed(4));

let resultsColA = [];
let resultsColB = [];
const resultsRow = [`value`];
for (let i = 1; i < optimalStrategyA.length; i++) {
  resultsColA = [...resultsColA, `p${i}`]
  resultsColB = [...resultsColB, `q${i}`]
}
resultsColA = [...resultsColA, `Game value`]
resultsColB = [...resultsColB, `Game value`]

console.log(`Оптимальна стратегія гравця А: `)
console.table(outputTableMatrix(resultsRow, resultsColA, optimalStrategyA))

console.log(`Оптимальна стратегія гравця B: `)
console.table(outputTableMatrix(resultsRow, resultsColB, optimalStrategyB))

console.log(`Ціна гри: ${+parseFloat(solutionPlayerA.solution.optimum).toFixed(4)}`)
