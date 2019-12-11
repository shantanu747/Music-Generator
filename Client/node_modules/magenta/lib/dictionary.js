/**
 * Author: Umayr Shahid <umayrr@hotmail.com>,
 * Created: 01:54, 30/11/15.
 */

'use strict';

let dictionary = module.exports = {};

dictionary.GET = {
  verb: 'get',
  method: 'all',
  call(model, method) {
    return function handler(req, res, next) {
      model[method]()
        .then(docs => {
          res.send(docs);
          next();
        })
        .catch(next);
    };
  }
};
dictionary.POST = {
  verb: 'post',
  method: 'create',
  call(model, method) {
    return function handler(req, res, next) {
      model[method](req.params)
        .then(() => {
          res.send({
            success: true
          });
          next();
        })
        .catch(next);
    };
  }
};
dictionary.PUT = {
  verb: 'put',
  method: 'update',
  call(model, method) {
    return function handler(req, res, next) {
      res.send({
        model: model,
        method: method
      });
      next();
    };
  }
};
dictionary.DELETE = {
  verb: 'del',
  method: 'destroy',
  call(model, method) {
    return function handler(req, res, next) {
      res.send({
        model: model,
        method: method
      });
      next();
    };
  }
};
dictionary.READ = {
  verb: 'get',
  method: 'read',
  call(model, method) {
    return function handler(req, res, next) {
      res.send({
        model: model,
        method: method
      });
      next();
    };
  }
};
