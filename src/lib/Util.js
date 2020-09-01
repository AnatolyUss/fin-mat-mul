'use strict';

const path = require('path');

/**
 * Handles uncaught exceptions and promise rejections.
 */
module.exports.handleUncaughtErrors = () => {
  process
    .on('unhandledRejection', (reason, promise) => {
      console.error(reason, 'Unhandled Promise rejection', promise);
    })
    .on('uncaughtException', error => {
      console.error(error, 'Uncaught Exception thrown');
      process.exit(1);
    });
};

/**
 * Handles the "500" error.
 * This method is intentionally oversimplified.
 * @param response
 * @param error
 */
module.exports.handleError_500 = (response, error) => {
  console.log(error);
  response.status(500).send({ success: false });
};

/**
 * Returns a path to the "uploads" directory.
 * @returns {string}
 */
module.exports.getUploadsDirectory = () => path.join(__dirname, '..', '..', 'uploads');

/**
 * Returns a number of rows and a number of columns of given matrix.
 * @param matrixName
 */
module.exports.getMatrixDimensions = matrixName => {
  const [ _, rows, columns ] = matrixName.split('-');
  const numberOfRows = rows.split('_')[1];
  const numberOfColumns = columns.split('_')[1];
  return [ numberOfRows, numberOfColumns ];
};

/**
 * Checks if given matrices are eligible for multiplication.
 * @param numberOfColumnsFirstMatrix
 * @param numberOfRowsSecondMatrix
 * @returns {boolean}
 */
module.exports.matricesAreEligibleForMultiplication = (numberOfColumnsFirstMatrix, numberOfRowsSecondMatrix) => {
  return numberOfColumnsFirstMatrix === numberOfRowsSecondMatrix;
};
