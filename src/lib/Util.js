'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Checks if the file (or directory) under given address exists and is writeable.
 * @param path
 * @returns {Promise<boolean>}
 */
const fileOrDirectoryExists = async path => {
  return new Promise(resolve => {
    fs.access(path, fs.constants.W_OK, error => {
      const existsAndWriteable = !error;
      resolve(!!existsAndWriteable); // Cast to boolean.
    });
  });
};

module.exports.fileOrDirectoryExists = fileOrDirectoryExists;

/**
 * Checks if a directory exists under given path.
 * If not, a directory will be created.
 * @param path
 * @returns {Promise<void | Error>}
 */
module.exports.ensureDirectoryExists = async path => {
  const exists = await fileOrDirectoryExists(path);

  if (exists) {
    return;
  }

  return new Promise((resolve, reject) => {
    fs.mkdir(path, error => error ? reject(error) : resolve());
  });
};

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
