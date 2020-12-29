const fs = require("fs");

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
    outputMatrix[rowNames[i]] = new Matrix(columnNames, inputMatrix[i])
  }

  return outputMatrix;
}
const maxElem = (arr) => Math.max(...arr);

//initial values
const data = fs.readFileSync('./tpr-lab1-input.txt', 'utf8');
const transformedFileData = data.split('\n')

const columnNames = transformedFileData[0].split(',');
const rowNames = transformedFileData[1].split(',');
let initMatrix = transformedFileData[2].split(',').map(el => el.split(' ').map(el => +el));
const probability = transformedFileData[3].split(',').map(el => +el);

const minAij = initMatrix.map(arr => Math.min(...arr))
const maxAij = initMatrix.map(arr => Math.max(...arr))

//Valda
const maxValdaWin = maxElem(minAij);

//Laplas
const q = 1/initMatrix.length;
const laplasArr = initMatrix.map(arr => arr.reduce((sum,el) => sum+el*q, 0));

const maxLaplasWin = maxElem(laplasArr);

// Gurvic
const kOfG = 0.5;
const gurvicArr = initMatrix.map((arr, i) => kOfG*minAij[i] + (1-kOfG)*maxAij[i]);

const maxGurvicWin = maxElem(gurvicArr);

//Bayes 

const bayesArr = initMatrix.map(arr => arr.reduce((sum, el, i) => sum + el * probability[i], 0));

const maxBayesWin = maxElem(bayesArr);

//Outputing
const allMethods = [];
let betterStrategy = [];
for (let i=0; i < 3; i++) {
  allMethods[i] = [minAij[i], bayesArr[i], gurvicArr[i], laplasArr[i]];
}
betterStrategy = [...betterStrategy, minAij.findIndex(el => el === maxValdaWin)+1]
betterStrategy = [...betterStrategy, bayesArr.findIndex(el => el === maxBayesWin)+1]
betterStrategy = [...betterStrategy, gurvicArr.findIndex(el => el === maxGurvicWin)+1]
betterStrategy = [...betterStrategy, laplasArr.findIndex(el => el === maxLaplasWin)+1]

let outputMatrix = initMatrix.map((arr, i) => [...arr, ...allMethods[i]]);
outputMatrix = [...outputMatrix, [``, ``, ``, maxValdaWin, maxBayesWin, maxGurvicWin, maxLaplasWin]]
outputMatrix = [...outputMatrix, [``, ``, ``, ...betterStrategy]]

console.table(outputTableMatrix(rowNames, columnNames, outputMatrix));