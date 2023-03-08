const { writeFile } = require('fs/promises')
const { resolve } = require('path')

const packageJSON = require('../../../package.json')
const { getDevFolder } = require('../../utils')

async function createPackageJSONDistVersion() {
  const { main, scripts, resources, devDependencies, ...rest } = packageJSON

  const packageJSONDistVersion = {
    main: './main/index.js',
    ...rest,
  }

  try {
    await writeFile(
      resolve(getDevFolder(main), 'package.json'),
      JSON.stringify(packageJSONDistVersion, null, 2)
    )
  } catch ({ message }) {
    console.log(`
    🛑 Something went wrong!\n
      🧐 There was a problem creating the package.json dist version...\n
      👀 Error: ${message}
    `)
  }
}

createPackageJSONDistVersion()
