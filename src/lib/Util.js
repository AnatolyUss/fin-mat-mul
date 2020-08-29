'use strict';

const { EOL } = require('os');

/**
 * Returns a generator, that produces requested matrix in the "csv" format.
 * @param rowsRequired
 * @param columnsRequired
 * @param highWaterMark
 * @returns {Generator<string, void, *>}
 */
module.exports.getMatrixGenerator = function* (rowsRequired, columnsRequired, highWaterMark) {
  const chunkSize = columnsRequired <= highWaterMark ? columnsRequired : highWaterMark;

  for (let rows = 0; rows < rowsRequired; ++rows) {
    for (let columns = 0; columns < columnsRequired; columns += chunkSize) {
      let data = '';

      for (let columnsInChunk = 0; columnsInChunk < chunkSize; ++columnsInChunk) {
        const random = Math.random() * 10;
        data += columnsInChunk % 3 === 0 ? `${ random.toFixed(2) },` : `${ Math.floor(random) },`;
      }

      yield data;
    }

    yield EOL;
  }
};

/**
 * Returns a number of rows and a number of columns of given matrix.
 * @param matrixName
 */
const getMatrixDimensions = matrixName => {
  const [ _, rows, columns ] = matrixName.split('-');
  const numberOfRows = rows.split('_')[1];
  const numberOfColumns = columns.split('_')[1];
  return [ numberOfRows, numberOfColumns ];
};

/**
 * Checks if given matrices are eligible for multiplication.
 * @param firstMatrixName
 * @param secondMatrixName
 */
module.exports.matricesAreEligibleForMultiplication = (firstMatrixName, secondMatrixName) => {
  const [ _, numberOfColumnsFirstMatrix ] = getMatrixDimensions(firstMatrixName);
  const [ numberOfRowsSecondMatrix ] = getMatrixDimensions(secondMatrixName);
  return numberOfColumnsFirstMatrix === numberOfRowsSecondMatrix;
};
