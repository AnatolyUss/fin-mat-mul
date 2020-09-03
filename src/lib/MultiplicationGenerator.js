'use strict';

const { EOL } = require('os');
const fs = require('fs');
const mathjs = require('mathjs');
const { fileOrDirectoryExists } = require('./Util');

/**
 * TODO: add description.
 * @param firstFileAddress
 * @param secondFileAddress
 * @returns {AsyncGenerator<string, void, *>}
 */
module.exports = async function* (firstFileAddress, secondFileAddress) {
  const firstMatrix = await readMatrixFromFile(firstFileAddress);
  const secondMatrix = await readMatrixFromFile(secondFileAddress);
  const resultMatrix = mathjs.multiply(firstMatrix, secondMatrix);

  for (let rowIndex = 0; rowIndex < resultMatrix.length; ++rowIndex) {
    let rowAsString = '';

    for (let columnIndex = 0; columnIndex < resultMatrix[rowIndex].length; ++columnIndex) {
      rowAsString += `${ resultMatrix[rowIndex][columnIndex].toFixed(2) },`;
    }

    yield rowAsString + EOL;
  }
};

/**
 * TODO: add description.
 * @param fileAddress
 * @returns {*}
 */
const readMatrixFromFile = async fileAddress => {
  const exists = await fileOrDirectoryExists(fileAddress);

  if (!exists) {
    throw new Error(`File "${ fileAddress }" either doesn't exist, or not readable for current user.`);
  }

  const readStream = fs.createReadStream(fileAddress, { encoding: 'utf-8' });

  readStream.on('error', error => {
    throw new Error(error);
  });

  let data = '';

  for await (const chunk of readStream) {
    data += chunk;
  }

  return data
    .split(EOL)
    .slice(0, -1)
    .map(row => row.slice(0, -1)
    .split(',')
    .map(column => +column));
};
