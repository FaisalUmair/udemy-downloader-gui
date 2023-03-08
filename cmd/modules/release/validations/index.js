const semver = require('semver')

const { COLORS } = require('../../../constants')

exports.checkValidations = ({ version, newVersion }) => {
  if (!newVersion) {
    console.log(`${COLORS.RED}No version entered${COLORS.RESET}`)

    return true
  }

  if (!semver.valid(newVersion)) {
    console.log(
      `${COLORS.RED}Version must have a semver format (${COLORS.SOFT_GRAY}x.x.x${COLORS.RESET} example: ${COLORS.GREEN}1.0.1${COLORS.RESET}${COLORS.RED})${COLORS.RESET}`
    )

    return true
  }

  if (semver.ltr(newVersion, version)) {
    console.log(
      `${COLORS.RED}New version is lower than current version${COLORS.RESET}`
    )

    return true
  }

  if (semver.eq(newVersion, version)) {
    console.log(
      `${COLORS.RED}New version is equal to current version${COLORS.RESET}`
    )

    return true
  }
}
