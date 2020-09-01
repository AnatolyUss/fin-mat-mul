'use strict';

const { Readable } = require('stream');
const { handleError_500 } = require('./Util');

/**
 * TODO: add description.
 * @param generator
 * @param response
 * @param fileName
 * @param highWaterMark
 */
module.exports = (generator, response, fileName, highWaterMark) => {
  const options = {
    objectMode: true,
    highWaterMark: highWaterMark,
  };

  const downloadStream = Readable.from(generator, options);
  downloadStream.on('error', error => handleError_500(response, error));
  response.status(200).attachment(fileName).contentType('text/csv');
  downloadStream.pipe(response);
};
