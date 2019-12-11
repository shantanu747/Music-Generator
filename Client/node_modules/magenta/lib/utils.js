/**
 * Author: Umayr Shahid <umayrr@hotmail.com>,
 * Created: 01:40, 30/11/15.
 */

'use strict';

const chalk = require('chalk');

const utils = module.exports = {};

/**
 * Iterate through any iteratable object.
 *
 * @param object
 */
utils.entries = function* entries(object) {
  for (let key of Object.keys(object)) {
    yield {key, value: object[key]};
  }
};

/**
 * Returns a new object that beautifies `console` a bit.
 *
 * @param prefix
 */
utils.debug = function debug(prefix) {
  const colors = {
    'info': 'cyan',
    'warn': 'yellow',
    'error': 'red',
    'log': 'gray'
  };

  const methods = ['info', 'warn', 'error', 'log'];
  let base = (type, str, prefix) => {
    if (process.env.NODE_ENV === 'development') {
      console[type].call(
        this,
        `${chalk[colors[type]](`[${type}]`)}${prefix !== 'undefined' ? chalk.white(`[${prefix}]`) : null} ${str}`
      );
    }
  };

  return (() => {
    let debug = {};

    methods.forEach((method) => {
      debug[method] = function caller(message) {
        base(method, message, prefix);
      };
    });

    return debug;
  })();
};
