import * as fs from 'fs';
import * as path from 'path';
import { Response } from 'express';

/**
 * Checks if the file (or directory) under given address exists and is writeable.
 */
const fileOrDirectoryExists = async (path: string): Promise<boolean> => {
  return new Promise(resolve => {
    fs.access(path, fs.constants.W_OK, error => {
      const existsAndWriteable: boolean = !error;
      resolve(!!existsAndWriteable); // Cast to boolean.
    });
  });
};

export { fileOrDirectoryExists };

/**
 * Checks if a directory exists under given path.
 * If not, a directory will be created.
 */
export const ensureDirectoryExists = async (path: string): Promise<Error | void> => {
  const exists: boolean = await fileOrDirectoryExists(path);

  if (exists) {
    return;
  }

  return new Promise<Error | void>((resolve, reject) => {
    fs.mkdir(path, error => error ? reject(error) : resolve());
  });
};

/**
 * Handles uncaught exceptions and promise rejections.
 */
export const handleUncaughtErrors = (): void => {
  process
    .on('unhandledRejection', (reason, promise) => {
      console.error(reason, 'Unhandled Promise rejection', promise);
    })
    .on('uncaughtException', (error: Error) => {
      console.error(error, 'Uncaught Exception thrown');
      process.exit(1);
    });
};

/**
 * Handles the "500" error.
 * This method is intentionally oversimplified.
 */
export const handleError_500 = (response: Response, error: Error): void => {
  console.log(error);
  response.status(500).send({ success: false });
};

/**
 * Returns a path to the "uploads" directory.
 */
export const getUploadsDirectory = (): string => path.join(__dirname, '..', '..', 'uploads');

/**
 * Returns a number of rows and a number of columns of given matrix.
 */
export const getMatrixDimensions = (matrixName: string): string[] => {
  const [ _, rows, columns ] = matrixName.split('-');
  const numberOfRows: string = rows.split('_')[1];
  const numberOfColumns: string = columns.split('_')[1];
  return [ numberOfRows, numberOfColumns ];
};

/**
 * Checks if given matrices are eligible for multiplication.
 */
export const matricesAreEligibleForMultiplication = (numberOfColumnsFirstMatrix: string, numberOfRowsSecondMatrix: string): boolean => {
  return numberOfColumnsFirstMatrix === numberOfRowsSecondMatrix;
};
