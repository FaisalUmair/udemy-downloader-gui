const { normalize, dirname } = require('path')

exports.getDevFolder = (path) => {
  const [nodeModules, devFolder] = normalize(dirname(path)).split(/\/|\\/g)

  return [nodeModules, devFolder].join('/')
}
