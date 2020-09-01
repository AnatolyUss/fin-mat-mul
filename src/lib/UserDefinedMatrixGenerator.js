'use strict';

const { EOL } = require('os');

/**
 * Returns a generator, that produces requested matrix in the "csv" format.
 * @param rowsRequired
 * @param columnsRequired
 * @param highWaterMark
 * @returns {Generator<string, void, *>}
 */
module.exports = function* (rowsRequired, columnsRequired, highWaterMark) {
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
