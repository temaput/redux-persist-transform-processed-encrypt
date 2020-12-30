import { createTransform } from 'redux-persist'
import CryptoJSCore from 'crypto-js/core'
import AES from 'crypto-js/aes'
import PBKDF2 from "crypto-js/pbkdf2";
import SHA256 from "crypto-js/sha256";

import stringify from 'json-stringify-safe'
import { makeEncryptor, makeDecryptor } from './helpers'

export default config => {
  let onError = config.onError
  const inProcessor = config.inProcessor
  const outProcessor = config.outProcessor

  const inbound = makeEncryptor(state => {
    const encryptor = (data, secretKey) => {
      console.log("encrypting with key: ", secretKey);
      const result = AES.encrypt(stringify(data), secretKey).toString()
      return result;
    };
    return inProcessor(state, encryptor);
  })

  const outbound = makeDecryptor(state => {
    const decryptor = (data, secretKey) => {
      console.log("decrypting with key: ", secretKey);
      const result = JSON.parse(AES.decrypt(data, secretKey).toString(CryptoJSCore.enc.Utf8));
      return result;
    }
    try {
      const decryptedState = outProcessor(state, decryptor);
      return decryptedState;
    } catch (err) {
      console.error("Decryptor error", err);
      throw new Error(
        'Could not decrypt state. Please verify that you are using the correct secret key.'
      )
    }
  }, onError)

  return {
    create(externalConfig) {
      return createTransform(inbound, outbound, externalConfig)
    }
  }
}


export function generateEncryptionKey(passphrase, savedSalt) {
  const salt = savedSalt ? savedSalt: CryptoJSCore.lib.WordArray.random(128 / 8);
  // const passphrase = CryptoJSCore.lib.WordArray.random(128 / 8).toString();
  const key128Bits = PBKDF2(passphrase, salt, {
    keySize: 128 / 32
  });

  return [key128Bits.toString(), salt.toString()];
}

export function generatePassphraseHash(passphrase, savedSalt) {
  return SHA256(passphrase + savedSalt).toString(CryptoJSCore.enc.Base64);
}