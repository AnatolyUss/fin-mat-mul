import { EOL } from 'os';
import * as fs from 'fs';
import * as mathjs from 'mathjs';
import { fileOrDirectoryExists } from './Util';

/**
 * Returns an AsyncGenerator, which yields a result of two matrices multiplication in the form of a string.
 */
export default async function* (firstFileAddress: string, secondFileAddress: string): AsyncGenerator<string> {
  const firstMatrix: number[][] = await readMatrixFromFile(firstFileAddress);
  const secondMatrix: number[][] = await readMatrixFromFile(secondFileAddress);
  const resultMatrix: number[][] = mathjs.multiply(firstMatrix, secondMatrix);

  for (let rowIndex: number = 0; rowIndex < resultMatrix.length; ++rowIndex) {
    let rowAsString: string = '';

    for (let columnIndex: number = 0; columnIndex < resultMatrix[rowIndex].length; ++columnIndex) {
      rowAsString += `${ resultMatrix[rowIndex][columnIndex].toFixed(2) },`;
    }

    yield rowAsString + EOL;
  }
};

/**
 * Reads contents from given file address and parses them to the form of number[][].
 */
const readMatrixFromFile = async (fileAddress: string): Promise<number[][]> => {
  const exists: boolean = await fileOrDirectoryExists(fileAddress);

  if (!exists) {
    throw new Error(`File "${ fileAddress }" either doesn't exist, or not readable for current user.`);
  }

  const readStream: fs.ReadStream = fs.createReadStream(fileAddress, { encoding: 'utf-8' });

  readStream.on('error', (error: Error) => {
    throw error;
  });

  let data: string = '';

  for await (const chunk of readStream) {
    data += chunk;
  }

  return data
    .split(EOL)
    .slice(0, -1)
    .map((row: string) => row.slice(0, -1)
    .split(',')
    .map((column: string) => +column));
};
