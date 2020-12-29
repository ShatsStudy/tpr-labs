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
    outputMatrix[rowNames[i]] = new Matrix(columnNames, inputMatrix)
  }

  return outputMatrix;
}

const nodeValue = (node) => {
  node[0][0] = -node[0][0];

  return node.reduce((sum, el) => {
    if (el.length > 1) {
      return sum + el.reduce((res, el) => res*el, 1)
    }

    return sum + el[0];
  }, 0)
}

const cAndDNodeCreationHelper = (el, i) => {
  if (el.length > 1) {
    el[1] = addInfo[addInfo.length-1][0];
    el[el.length-1] = addInfo[1][i-1];
    
    return el
  }

  return [-el];
}

//initial values
const data = fs.readFileSync('./tpr-lab2-input.txt', 'utf8');
const transformedFileData = data.split('\n')

const columnNames = transformedFileData[0].split(',');
const rowNames = transformedFileData[1].split(',');
const A = transformedFileData[2].split(',').map(el => el.split(' ').map(el => +el));
const B = transformedFileData[3].split(',').map(el => el.split(' ').map(el => +el));
const addInfo = transformedFileData[4].split(',').map(el => el.split(' ').map(el => +el));

// Оцінка вузла А
const nodeAValue = nodeValue(A);

// Оцінка вузла Б
const nodeBValue = nodeValue(B);

// Оцінка вузла Д
const D = A.map((el, i) => cAndDNodeCreationHelper(el, i));
const nodeDValue = nodeValue(D);

// Оцінка вузла Е
const E = B.map((el, i) => cAndDNodeCreationHelper(el, i));
const nodeEValue = nodeValue(E);

// Оцінка вузла 2
const nodeSecondValue = Math.max(nodeDValue, nodeEValue);

// Оцінка вузла В
const C = [[0], [nodeSecondValue, addInfo[0][0]], [0, addInfo[0][1]]];
const nodeCValue = nodeValue(C);

// Оцінка вузла 1
const nodeFirstValue = Math.max(nodeAValue, nodeBValue, nodeCValue);

const outputMatrix = [nodeAValue, nodeBValue, nodeCValue, nodeFirstValue]
console.table(outputTableMatrix(rowNames, columnNames, outputMatrix));

const decision = [
  { name: 'А', value: nodeAValue }, 
  { name: 'Б', value: nodeBValue }, 
  { name: 'В', value: nodeCValue }
].find(el => el.value === nodeFirstValue);

console.log(`Найкраще вирішення задачі лежить у вузлі ${decision.name} з оцінкою ${decision.value}`);