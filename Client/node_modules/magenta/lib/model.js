/**
 * Author: Umayr Shahid <umayrr@hotmail.com>,
 * Created: 01:57, 30/11/15.
 */

'use strict';

const Factory = require('./factory');

module.exports = class Model {
  constructor(model) {
    this.Model = model;
    this.name = this.Model.modelName;

    this.endpoints = Factory.createEndpoints(this.name);
  }

  create(object) {
    let model = new this.Model(object);
    return model.save();
  }

  update() {
  }

  destroy() {
  }

  read() {
  }

  all() {
    return this.Model.find({});
  }
};
