/**
 * Author: Umayr Shahid <umayrr@hotmail.com>,
 * Created: 01:53, 30/11/15.
 */

'use strict';

const _ = require('lodash');
const Endpoint = require('./endpoint');

module.exports = class Factory {
  static createEndpoints(raw) {
    if (typeof raw === 'undefined') {
      throw new Error('Must provide either an array for endpoints or a name for model');
    }

    if (Array.isArray(raw) && (raw.length > 2 || raw.length < 1)) {
      throw new Error('Invalid format for endpoints');
    }

    let base = Array.isArray(raw) ? raw[0] : `/${_.kebabCase(raw)}`;
    let withId = Array.isArray(raw) ? raw[1] : `/${base}:id`;

    let endpoints = [];

    endpoints.push(new Endpoint('GET', base));
    endpoints.push(new Endpoint('POST', base));
    endpoints.push(new Endpoint('PUT', withId));
    endpoints.push(new Endpoint('DELETE', withId));
    endpoints.push(new Endpoint('READ', withId));

    return endpoints;
  }
};
