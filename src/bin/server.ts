import * as path from 'path';
import * as fs from 'fs';

import * as express from 'express';
import { Express } from 'express-serve-static-core';
import * as bodyParser from 'body-parser';
import * as Busboy from 'busboy';
import * as connectTimeout from 'connect-timeout';

import getMultiplicationGenerator from '../lib/MultiplicationGenerator';
import getMatrixGenerator from '../lib/UserDefinedMatrixGenerator';
import downloadFile from '../lib/FileDownloadStream';
import {
  handleError_500,
  matricesAreEligibleForMultiplication,
  getUploadsDirectory,
  getMatrixDimensions,
  handleUncaughtErrors,
  ensureDirectoryExists,
} from '../lib/Util';

handleUncaughtErrors();
const port: number | string = process.env.PORT || 3000;
const app: Express = express();

app.use(connectTimeout('10m'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * The "/generate" endpoint handler.
 * Generates a matrix according to a size provided by the user, and returns downloadable .csv file.
 * Utilizes js generators behind the scenes to avoid unnecessary memory consumption.
 * Successfully generated and downloaded ~7 GB file without any memory spike.
 *
 * Notice:
 * For the sake of simplicity, there are no rows or columns number limit.
 *
 * Sample:
 * GET http://localhost:3000/generate?columns=700&rows=650
 */
app.get('/generate', (request: express.Request, response: express.Response) => {
  const columnsRequired: string = <string>request.query.columns;
  const rowsRequired: string = <string>request.query.rows;

  try {
    const fileName: string = `matrix-rows_${ rowsRequired }-columns_${ columnsRequired }-${ new Date().getTime() }.csv`;
    const highWaterMark: number = 1000;
    const generator: Generator<string> = getMatrixGenerator(+rowsRequired, +columnsRequired, highWaterMark);
    downloadFile(generator, response, fileName, highWaterMark);
  } catch (error) {
    handleError_500(response, error);
  }
});

/**
 * The "/upload" endpoint handler.
 * Uploads one or more files to the server.
 * Utilizes Node.js streams behind the scenes to avoid unnecessary memory consumption.
 *
 * Notice:
 * For the sake of simplicity, there is no file size limit check.
 * Successfully uploaded ~7 GB file without any memory spike.
 *
 * Sample:
 * POST: http://localhost:3000/upload
 * Remark: you need to send one or more files as a part of form-data.
 */
app.post('/upload', async (request: express.Request, response: express.Response) => {
  const busboyOptions = {
    headers: request.headers,
    highWaterMark: 2 * 1024 * 1024 // Sets 2 MB buffer.
  };

  try {
    const busboy = new Busboy(busboyOptions);
    const uploadPath: string = getUploadsDirectory(); // Registers the upload path.
    await ensureDirectoryExists(uploadPath); // Validates the upload path exits.

    busboy
      .on('file', (fieldName, file, fileName) => {
        console.log(`Upload of '${ fileName }' started.`);
        const fileAddress: string = path.join(uploadPath, fileName);
        const writeStream: fs.WriteStream = fs.createWriteStream(fileAddress);
        file.pipe(writeStream);
      })
      .on('error', (error: Error) => handleError_500(response, error))
      .on('finish', () => {
        console.log(`Upload is finished.`);
        response.status(201).send({ success: true });
      });

    request.pipe(busboy);
  } catch (error) {
    handleError_500(response, error);
  }
});

/**
 * The "/multiply" endpoint handler.
 * Multiply two matrices from previously uploaded files.
 *
 * Sample:
 * GET localhost:3000/multiply?matrix-1=matrix-rows_1200-columns_1000-1599090639875.csv&matrix-2=matrix-rows_1000-columns_2000-1599090657968.csv
 */
app.get('/multiply', (request: express.Request, response: express.Response) => {
  const firstMatrixName: string = <string>request.query['matrix-1'];
  const secondMatrixName: string = <string>request.query['matrix-2'];

  try {
    const [ numberOfRowsFirstMatrix, numberOfColumnsFirstMatrix ] = getMatrixDimensions(firstMatrixName);
    const [ numberOfRowsSecondMatrix, numberOfColumnsSecondMatrix ] = getMatrixDimensions(secondMatrixName);

    if (!matricesAreEligibleForMultiplication(numberOfColumnsFirstMatrix, numberOfRowsSecondMatrix)) {
      const responseObject = {
        success: false,
        message: 'The number of columns of the first matrix must equal the number of rows of the second matrix.',
      };

      response.status(400).send(responseObject);
      return;
    }

    const uploadsDirectory: string = getUploadsDirectory();
    const firstFileAddress: string = path.join(uploadsDirectory, firstMatrixName);
    const secondFileAddress: string = path.join(uploadsDirectory, secondMatrixName);
    const multiplicationGenerator: AsyncGenerator<string> = getMultiplicationGenerator(firstFileAddress, secondFileAddress);

    const resultFileName: string = `matrices-multiplication-result ${ new Date().getTime() }.csv`;
    const highWaterMark: number = 1000;
    downloadFile(multiplicationGenerator, response, resultFileName, highWaterMark);
  } catch (error) {
    handleError_500(response, error);
  }
});

/**
 * Handles any route, which wasn't mapped to one of endpoint handlers.
 */
app.all('*', (request: express.Request, response: express.Response) => {
  response.status(404).json({
    success: false,
    message: `Can't find ${ request.method } ${ request.originalUrl } on this server.`
  });
});

app.listen(port, () => console.log(`Listening on http://localhost: ${ port }`));
