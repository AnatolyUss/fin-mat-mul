'use strict';

module.exports = class MatrixMetadata {
  /**
   * MatrixMetadata constructor.
   * @param fileAddress
   * @param numberOfRows
   * @param numberOfColumns
   */
  constructor(fileAddress, numberOfRows, numberOfColumns) {
    this.fileAddress = fileAddress;
    this.numberOfRows = numberOfRows;
    this.numberOfColumns = numberOfColumns;
  }
};
