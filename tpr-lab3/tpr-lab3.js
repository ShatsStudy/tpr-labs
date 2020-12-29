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

const amountOfPreferences = (regExp, mapKeyes, kondorseMap) => {
  return mapKeyes
          .filter(el => regExp.test(el))
          .reduce((sum, el) => sum + kondorseMap.get(el), 0);
} 

const arrElementsCount = (matrix) => {
  let counts = [];
  for (const arr of matrix) {
    const elIndex = counts.findIndex(el => el.title === arr[0]);
    if (elIndex !== -1) {
      counts[elIndex].value = counts[elIndex].value + arr[1];
    } else {
      counts = [...counts, { title: arr[0], value: arr[1]}]
    }
  }

  return counts;
}

/* initial values **/ 

const data = fs.readFileSync('./tpr-lab3-input.txt', 'utf8');
const transformedFileData = data.split('\n')
const initialMatrix = transformedFileData[0].split(',')
                                            .map(el => el.split(' ')
                                            .map(el => isNaN(el) ? el.replace(/'/g,'') : +el));
// для метода Кондорсе
const kondorseMap = new Map(initialMatrix);
const mapKeyes = [...kondorseMap.keys()];

/* Метод Кондорсе **/ 

// A>B та B>A
const aMoreB = { title: 'A>B', value: amountOfPreferences(/A>(\w+)>(B$)|A>B/, mapKeyes, kondorseMap) }; 
const bMoreA = { title: 'B>A', value: amountOfPreferences(/B>(\w+)>(A$)|B>A/, mapKeyes, kondorseMap) }; 

// B>C та C>B
const bMoreC = { title: 'B>C', value: amountOfPreferences(/B>(\w+)>(C$)|B>C/, mapKeyes, kondorseMap) };
const cMoreB = { title: 'C>B', value: amountOfPreferences(/C>(\w+)>(B$)|C>B/, mapKeyes, kondorseMap) };

// A>C та C>A
const aMoreC = { title: 'A>C', value: amountOfPreferences(/A>(\w+)>(C$)|A>C/, mapKeyes, kondorseMap) };
const cMoreA = { title: 'C>A', value: amountOfPreferences(/C>(\w+)>(A$)|C>A/, mapKeyes, kondorseMap) };

//Вивід результатів в табличному вигляді
const outputMatrixKondorse = [
  [`${aMoreB.value}-${bMoreA.value}`, `${aMoreC.value}-${cMoreA.value}`], 
  ['-', `${bMoreC.value}-${cMoreB.value}`]
]
const rowNamesKondorse = ['A', 'B'];
const colNamesKondorse = ['B', 'C'];
const decisions = [aMoreB, bMoreA, cMoreB, bMoreC, aMoreC, cMoreA].sort((A,B) => B.value-A.value);
console.table(outputTableMatrix(rowNamesKondorse, colNamesKondorse, outputMatrixKondorse));

//Вивід переможця
let kondorseMatrix = [];
for (let i=0; i<3; i++) {
  kondorseMatrix = [...kondorseMatrix, [decisions[i].title[0], 1]];
}
const kondorseDecision = arrElementsCount(kondorseMatrix);
const kondorseWinner = kondorseDecision.sort((A, B) => B.value - A.value)[0].title;
console.log(`Переможець за методом Кондорса - кандидат ${kondorseWinner}`);

/* Метод Борда **/ 

const bordMatrix = initialMatrix.map(arr => arr.map(el => el.length ? el[0] : el));
const bordDecision = arrElementsCount(bordMatrix);

//Вивід результатів в табличному вигляді
const rowNamesBor = ['Score']
const colNamesBor = bordDecision.map(el => el.title);
const outputMatrixBor = bordDecision.map(el => el.value);
console.table(outputTableMatrix(rowNamesBor, colNamesBor, outputMatrixBor));

//Вивід переможця
const bordWinner = bordDecision.sort((A, B) => B.value - A.value)[0].title;
console.log(`Переможець за методом Борда - кандидат ${bordWinner}`);