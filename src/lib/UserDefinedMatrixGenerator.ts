import { EOL } from 'os';

/**
 * Returns a generator, that produces requested matrix in the "csv" format.
 */
export default function* (rowsRequired: number, columnsRequired: number, highWaterMark: number): Generator<string> {
  const chunkSize: number = columnsRequired <= highWaterMark ? columnsRequired : highWaterMark;

  for (let rows: number = 0; rows < rowsRequired; ++rows) {
    for (let columns: number = 0; columns < columnsRequired; columns += chunkSize) {
      let data: string = '';

      for (let columnsInChunk: number = 0; columnsInChunk < chunkSize; ++columnsInChunk) {
        const random: number = Math.random() * 10;
        data += columnsInChunk % 3 === 0 ? `${ random.toFixed(2) },` : `${ Math.floor(random) },`;
      }

      yield data;
    }

    yield EOL;
  }
};
