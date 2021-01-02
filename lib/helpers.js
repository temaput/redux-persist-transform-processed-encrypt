'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var handleError = exports.handleError = function handleError(handler, err) {
  if (typeof handler === 'function') {
    handler(err);
  }
};

var makeEncryptor = exports.makeEncryptor = function makeEncryptor(transform) {
  return function (state, key) {
    return transform(state);
  };
};

var makeDecryptor = exports.makeDecryptor = function makeDecryptor(transform, onError) {
  return function (state, key) {
    try {
      return transform(state);
    } catch (err) {
      handleError(onError, err);
      return null;
    }
  };
};