'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateEncryptionKey = generateEncryptionKey;
exports.generatePassphraseHash = generatePassphraseHash;

var _reduxPersist = require('redux-persist');

var _core = require('crypto-js/core');

var _core2 = _interopRequireDefault(_core);

var _aes = require('crypto-js/aes');

var _aes2 = _interopRequireDefault(_aes);

var _pbkdf = require('crypto-js/pbkdf2');

var _pbkdf2 = _interopRequireDefault(_pbkdf);

var _sha = require('crypto-js/sha256');

var _sha2 = _interopRequireDefault(_sha);

var _jsonStringifySafe = require('json-stringify-safe');

var _jsonStringifySafe2 = _interopRequireDefault(_jsonStringifySafe);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (config) {
  var onError = config.onError;
  var inProcessor = config.inProcessor;
  var outProcessor = config.outProcessor;

  var inbound = (0, _helpers.makeEncryptor)(function (state) {
    var encryptor = function encryptor(data, secretKey) {
      var result = _aes2.default.encrypt((0, _jsonStringifySafe2.default)(data), secretKey).toString();
      return result;
    };
    return inProcessor(state, encryptor);
  });

  var outbound = (0, _helpers.makeDecryptor)(function (state) {
    var decryptor = function decryptor(data, secretKey) {
      var result = JSON.parse(_aes2.default.decrypt(data, secretKey).toString(_core2.default.enc.Utf8));
      return result;
    };
    try {
      var decryptedState = outProcessor(state, decryptor);
      return decryptedState;
    } catch (err) {
      console.error("Decryptor error", err);
      throw new Error('Could not decrypt state. Please verify that you are using the correct secret key.');
    }
  }, onError);

  return {
    create: function create(externalConfig) {
      return (0, _reduxPersist.createTransform)(inbound, outbound, externalConfig);
    }
  };
};

function generateEncryptionKey(passphrase, savedSalt) {
  var salt = savedSalt ? savedSalt : _core2.default.lib.WordArray.random(128 / 8);
  // const passphrase = CryptoJSCore.lib.WordArray.random(128 / 8).toString();
  var key128Bits = (0, _pbkdf2.default)(passphrase, salt, {
    keySize: 128 / 32
  });

  return [key128Bits.toString(), salt.toString()];
}

function generatePassphraseHash(passphrase, savedSalt) {
  return (0, _sha2.default)(passphrase + savedSalt).toString(_core2.default.enc.Base64);
}