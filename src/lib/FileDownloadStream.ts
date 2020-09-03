import { Readable } from 'stream';
import { Response } from 'express';
import { handleError_500 } from './Util';

/**
 * Downloads a file, containing data from given generator.
 */
export default (
    generator: AsyncGenerator<string> | Generator<string>,
    response: Response,
    fileName: string,
    highWaterMark: number
): void => {
  const options = {
    objectMode: true,
    highWaterMark: highWaterMark,
  };

  const downloadStream: Readable = Readable.from(generator, options);
  downloadStream.on('error', (error: Error) => handleError_500(response, error));
  response.status(200).attachment(fileName).contentType('text/csv');
  downloadStream.pipe(response);
};
