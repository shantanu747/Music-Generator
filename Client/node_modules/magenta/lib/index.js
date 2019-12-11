/**
 * Author: Umayr Shahid <umayrr@hotmail.com>,
 * Created: 21:45, 29/11/15.
 */

'use strict';

const utils = require('./utils');
const Model = require('./model');

module.exports = class Magenta {
  constructor(server, database) {
    this.Model = server;
    this.database = database;
    this.database.Promise = Promise;

    this.debug = utils.debug('Magenta');
    this.models = [];

    this._extract();
    this._register();
  }

  _extract() {
    for (let model of utils.entries(this.database.models)) {
      this.debug.info(`Creating Model instance of ${model.value.modelName}`);

      this.models.push(new Model(model.value));
    }
  }

  _register() {

    this.models.forEach((model) => {
      model.endpoints.forEach((endpoint) => {
        endpoint.register(this.Model, model);
      });
    });
  }
};
