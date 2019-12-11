/**
 * Author: Umayr Shahid <umayrr@hotmail.com>,
 * Created: 01:54, 30/11/15.
 */

'use strict';

const dictionary = require('./dictionary');
const utils = require('./utils');

module.exports = class Endpoint {
  constructor(type, uri) {
    this.type = type;
    this.uri = uri;

    this.dict = dictionary[this.type];
    this.debug = utils.debug('Magenta:Endpoint');
  }

  register(server, model) {
    this.debug.info(`Registering route ${this.type}:${this.uri}.`);
    this.debug.info(`Calling REST[${this.type.toLowerCase()}]`);

    return server[this.dict.verb](this.uri, this.dict.call(model, this.dict.method));
  }
};
