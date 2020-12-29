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
    outputMatrix[rowNames[i]] = new Matrix(columnNames, inputMatrix[0].length ? inputMatrix[i] : inputMatrix)
  }

  return outputMatrix;
}

/* initial values **/ 

const data = fs.readFileSync('./tpr-lab4-input.txt', 'utf8');
const transformedFileData = data.split('\n');

let colNames = transformedFileData[0].split(',');
colNames = ['Weight', ...colNames, 'Max'];
let rowNames = transformedFileData[1].split(',');
rowNames = [...rowNames, 'Sum'];
let initialMatrix = [];
for (let i = 2; i <= 6; i++) {
  initialMatrix = [...initialMatrix, transformedFileData[i].split(',').map(el => +el)]
}

/* Experts method **/ 
const outputMatrix = initialMatrix.map(arr => arr.map((el, i) => i !== 0 ? parseFloat((el * arr[0]).toFixed(4)) : el ));

for (const arr of outputMatrix) {
  arr[arr.length] = Math.max(...arr);
}
let sum = [];
for (let i=0; i < initialMatrix[0].length; i++) {
  const sumValue = outputMatrix.reduce((sum, arr) => sum + arr[i], 0)
  sum = [...sum, +parseFloat(sumValue).toFixed(2)];
}
const winSum = Math.max(...sum);
const winSumIndex = sum.indexOf(winSum);

outputMatrix[outputMatrix.length] = sum;
console.table(outputTableMatrix(rowNames, colNames, outputMatrix));
console.log(`Найкращий вибір за методом експертів - ${colNames[winSumIndex]} з оцінкою ${winSum}`)