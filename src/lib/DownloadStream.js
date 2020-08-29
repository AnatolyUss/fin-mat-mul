// 'use strict';
//
// const { Readable } = require('stream');
//
// module.exports = class DownloadStream extends Readable {
//   /**
//    * DownloadStream constructor.
//    * @param generator
//    * @param options
//    */
//   constructor(generator, options) {
//     super(options);
//     this._generator = generator;
//   }
//
//   /**
//    * Pushes data onto underlying buffer.
//    * @param size
//    * @private
//    */
//   _read(size) {
//     let data;
//
//     do {
//       data = this._generator.next();
//
//       if (data.done) {
//         this.push(null);
//         break;
//       }
//
//     } while(this.push(data.value));
//   }
// };
