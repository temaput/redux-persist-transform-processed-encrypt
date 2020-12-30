
export const handleError = (handler, err) => {
  if (typeof handler === 'function') {
    handler(err)
  }
}

export const makeEncryptor = transform => (state, key) => {
  return transform(state)
}

export const makeDecryptor = (transform, onError) => (state, key) => {
  try {
    return transform(state)
  } catch (err) {
    handleError(onError, err)
    return null
  }
}
