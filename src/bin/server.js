'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const Busboy = require('busboy');
const connectTimeout = require('connect-timeout');
const getMultiplicationGenerator = require('../lib/MultiplicationGenerator');
const getMatrixGenerator = require('../lib/UserDefinedMatrixGenerator');
const downloadFile = require('../lib/FileDownloadStream');
const {
  handleError_500,
  matricesAreEligibleForMultiplication,
  getUploadsDirectory,
  getMatrixDimensions,
  handleUncaughtErrors,
  ensureDirectoryExists,
} = require('../lib/Util');

handleUncaughtErrors();
const port = process.env.PORT || 3000;
const app = express();

app.use(connectTimeout(1000 * 60 * 10)); // Sets response timeout limit is 10 minutes.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * TODO: add description.
 */
app.get('/generate', (request, response) => {
  const columnsRequired = request.query.columns;
  const rowsRequired = request.query.rows;

  try {
    const fileName = `matrix-rows_${ rowsRequired }-columns_${ columnsRequired }-${ new Date().getTime() }.csv`;
    const highWaterMark = 1000;
    const generator = getMatrixGenerator(+rowsRequired, +columnsRequired, highWaterMark);
    downloadFile(generator, response, fileName, highWaterMark);
  } catch (error) {
    handleError_500(response, error);
  }
});

/**
 * TODO: add description.
 */
app.post('/upload', async (request, response) => {
  const busboyOptions = {
    headers: request.headers,
    highWaterMark: 2 * 1024 * 1024 // Sets 2 MB buffer.
  };

  try {
    const busboy = new Busboy(busboyOptions);
    const uploadPath = getUploadsDirectory(); // Registers the upload path.
    await ensureDirectoryExists(uploadPath); // Validates the upload path exits.

    busboy
    .on('file', (fieldName, file, fileName) => {
      console.log(`Upload of '${ fileName }' started.`);
      const fileAddress = path.join(uploadPath, fileName);
      const writeStream = fs.createWriteStream(fileAddress); // Successfully uploaded ~7GB file without memory spike.
      file.pipe(writeStream);
    })
    .on('error', error => handleError_500(response, error))
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
 * Multiply two matrices from previously uploaded files.
 */
app.get('/multiply', (request, response) => {
  const firstMatrixName = request.query['matrix-1'];
  const secondMatrixName = request.query['matrix-2'];

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

    const uploadsDirectory = getUploadsDirectory();
    const firstFileAddress = path.join(uploadsDirectory, firstMatrixName);
    const secondFileAddress = path.join(uploadsDirectory, secondMatrixName);
    const multiplicationGenerator = getMultiplicationGenerator(firstFileAddress, secondFileAddress);

    const resultFileName = `matrices-multiplication-result ${ new Date().getTime() }.csv`;
    const highWaterMark = 1000;
    downloadFile(multiplicationGenerator, response, resultFileName, highWaterMark);
  } catch (error) {
    handleError_500(response, error);
  }
});

/**
 * TODO: add description.
 */
app.all('*', (request, response) => {
  response.status(404).json({
    success: false,
    message: `Can't find ${ request.method } ${ request.originalUrl } on this server.`
  });
});

app.listen(port, () => console.log(`Listening on http://localhost: ${ port }`));
