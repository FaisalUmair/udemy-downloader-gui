const { execSync } = require('child_process')
const { resolve } = require('path')

function makeOptions(options) {
  return {
    stdio: options?.inherit ? 'inherit' : 'pipe',
    cwd: resolve(),
    encoding: 'utf8',
  }
}

exports.exec = (commands, options) => {
  const outputs = []

  for (const command of commands) {
    const output = execSync(command, makeOptions(options))
    outputs.push(output)
  }

  return outputs
}
