'use strict';

const path = require('path');
const { Readable } = require('stream');
const fs = require('fs-extra');
const express = require('express');
const bodyParser = require('body-parser');
const Busboy = require('busboy');
const connectTimeout = require('connect-timeout');
const { getMatrixGenerator, matricesAreEligibleForMultiplication } = require('../lib/Util');

const port = process.env.PORT || 3000;
const app = express();

app.use(connectTimeout(1000 * 60 * 10)); // Sets response timeout limit is 10 minutes.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/generate', (request, response) => {
  const columnsRequired = request.query.columns;
  const rowsRequired = request.query.rows;

  try {
    const options = {
      objectMode: true,
      highWaterMark: 1000,
    };

    const generator = getMatrixGenerator(+rowsRequired, +columnsRequired, options.highWaterMark);
    const downloadStream = Readable.from(generator, options);
    downloadStream.on('error', error => console.log(error));

    const fileName = `matrix-rows_${ rowsRequired }-columns_${ columnsRequired }-${ new Date().toString() }.csv`;
    response.status(200).attachment(fileName).contentType('text/csv');
    downloadStream.pipe(response);

  } catch (error) {
    response.status(500).send('Server error occurred.');
  }
});

app.post('/upload', (request, response) => {
  const busboyOptions = {
    headers: request.headers,
    highWaterMark: 2 * 1024 * 1024 // Sets 2 MB buffer.
  };

  const busboy = new Busboy(busboyOptions);
  const uploadPath = path.join(__dirname, '..', '..', 'uploads'); // Registers the upload path.
  fs.ensureDir(uploadPath); // Validates the upload path exits.

  busboy
    .on('file', (fieldName, file, fileName) => {
      console.log(`Upload of '${ fileName }' started.`);
      const saveTo = path.join(uploadPath, fileName);
      const writeStream = fs.createWriteStream(saveTo); // Successfully uploaded ~7GB file without memory spike.
      file.pipe(writeStream);
    })
    .on('error', error => {
      console.log(error);
      response.status(500).send({ success: false });
    })
    .on('finish', () => {
      console.log(`Upload is finished.`);
      response.status(201).send({ success: true });
    });

  request.pipe(busboy);
});

app.get('/multiply', (request, response) => {
  const firstMatrixName = request.query['matrix-1'];
  const secondMatrixName = request.query['matrix-2'];

  if (!matricesAreEligibleForMultiplication(firstMatrixName, secondMatrixName)) {
    const responseObject = {
      success: false,
      message: 'The number of columns of the first matrix must equal the number of rows of the second matrix.',
    };

    response.status(400).send(responseObject);
    return;
  }

  // TODO
  // Multiply matrices.
});

app.all('*', (request, response, next) => {
  response.status(404).json({
    status: 'fail',
    message: `Can't find ${ request.method } ${ request.originalUrl } on this server!`
  });
});

app.listen(port, () => console.log(`Listening on http://localhost: ${ port }`));
