'use strict';

const restify = require('restify');
const mongoose = require('mongoose');
const pkg = require('./package.json');

const Magenta = require('../lib/index');

let server = restify.createServer({
  name: pkg.name,
  version: pkg.version
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.authorizationParser());
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());

let schema = new mongoose.Schema({name: 'string', size: 'string'});
let Tank = mongoose.model('Tank', schema);

mongoose.connect('mongodb://localhost/test');

new Magenta(server, mongoose);

server.listen(3000, function () {
  console.log('%s listening at %s', server.name, server.url);
});
