'use strict';

const { EOL } = require('os');
const fs = require('fs-extra');

/**
 * TODO: add description.
 * @param firstMatrixMetadata
 * @param secondMatrixMetadata
 * @returns {AsyncGenerator<*, void, *>}
 */
module.exports = async function* (firstMatrixMetadata, secondMatrixMetadata) {
  const {
    fileAddress: firstFileAddress,
    numberOfRows: firstMatrixNumberOfRows,
    numberOfColumns: firstMatrixNumberOfColumns
  } = firstMatrixMetadata;

  const secondMatrixReadGenerator = getSecondMatrixReadGenerator(secondMatrixMetadata);

  // Loop through first matrix's rows.
  for (let rowIndex = 0; rowIndex < firstMatrixNumberOfRows; ++rowIndex) {
    let eolCounter = 0;

    // The number of times, that each row of the first matrix must be traversed, is equal to the number of columns of the second matrix.
    for (let b = 0; b < secondMatrixMetadata.numberOfColumns; ++b) {
      const firstMatrixReadableStream = getReadStream(firstFileAddress, { encoding: 'utf-8' });

      for await (const firstMatrixChunk of firstMatrixReadableStream) {
        // The firstMatrixChunk may contain:
        // 1. One or more EOLs.
        // Action: split chunk by EOL, then
        //
        // 2. No EOLs.
        // Action: read an entire chunk unconditionally.

        const eolIndex = firstMatrixChunk.indexOf(EOL);

        if (eolIndex === -1 && eolCounter === 0) {
          // EOL not found in the first chunk.
          const numbers = firstMatrixChunk.split(',').map(x => +x);
          let resultMatrixValue = 0;

          // Loop through chunk of row numbers.
          for (let c = 0; c < numbers.length; ++c) {
            // Multiply numbers[c] by corresponding value from the secondMatrixReadGenerator().
            // Yield the result.
            const elementFromSecondMatrix = secondMatrixReadGenerator.next();

            if (elementFromSecondMatrix.done) {
              console.log('secondMatrixReadGenerator yields no more values. Execution should never get here.');
              process.exit(1);
            }

            const numberFromSecondMatrix = elementFromSecondMatrix.value;
            resultMatrixValue += numbers[c] * numberFromSecondMatrix;
          }

          yield `${ resultMatrixValue },`;
        }

        //
      }

      if (secondMatrixMetadata.numberOfColumns === b + 1) {
        // The last number of current row, at the result matrix.
        yield `${ EOL }`;
      }
    }
  }

  // for await (const firstMatrixChunk of firstMatrixReadableStream) {
  //   const firstMatrixChunkNumberStrings = firstMatrixChunk.toString(); // Converts Buffer to string.
  //
  //   // Possible cases where current chunk starts:
  //   // 1. Beginning of a row (currentColumnIndex = 0).
  //   // Read each number until EOL encountered, or till the end of the chunk.
  //   //
  //   // 2. At the middle of a row (currentColumnIndex > 0).
  //   //
  //   // 3. At the end of a row (currentColumnIndex = rows's length - 1).
  //
  //   const rows = firstMatrixChunkNumberStrings.split(EOL);
  //
  //   rows.forEach(row => {
  //     const numbers = row.split(',').map(x => +x);
  //
  //     numbers.forEach(number => {
  //       //
  //     });
  //   });
  //
  //   // const rows = firstMatrixChunkNumberStrings.split(EOL);
  //   //
  //   // rows.forEach(row => {
  //   //   const numbers = row.split(',');
  //   //   //
  //   // });
  //
  //   //
  // }
};

/**
 * TODO: add description.
 * @param secondMatrixMetadata
 * @returns {AsyncGenerator<*, void, *>}
 */
async function* getSecondMatrixReadGenerator(secondMatrixMetadata) {
  const {
    fileAddress: secondFileAddress,
    numberOfRows: secondMatrixNumberOfRows,
    numberOfColumns: secondMatrixNumberOfColumns
  } = secondMatrixMetadata;

  const secondMatrixReadableStream = getReadStream(secondFileAddress, { encoding: 'utf-8' });

  for await(const secondMatrixChunk of secondMatrixReadableStream) {
    // TODO: implement traversing.
  }
}

/**
 * TODO: add description.
 * @param fileAddress
 * @param options
 * @returns {*}
 */
const getReadStream = (fileAddress, options) => {
  const readStream = fs.createReadStream(fileAddress, options);

  readStream.on('error', error => {
    throw new Error(error)
  });

  return readStream;
};
