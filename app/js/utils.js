function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function toBoolean(value) {
  return isNumeric(value) ? !/^0$/i.test(value) : /^true$/i.test(value);
}

/**
 * This function takes a string parameter property that represents the property by which the array of objects will be sorted.
 * The function returns another function that will be used to sort the array of objects.
 *
 * If the property starts with a hyphen (-), the function will sort the array in descending order.
 * Otherwise, it will sort in ascending order.
 *
 * @param property The name of the property to sort by. Use a minus sign prefix to sort in descending order.
 * @returns `Function` A function that can be passed to the sort() method of an array to sort it by the specified property.
 * @example
 *
 * ```javascript
 *   myArray = [
 *     {name: 'A', age: 18, univerty: 'lorem ipsum dolor sit amet'}
 *     {name: 'C', age: 22, univerty: 'lorem ipsum dolor sit amet'}
 *     {name: 'B', age: 16, univerty: 'lorem ipsum dolor sit amet'}
 *   ]
 *   myArray.sort(Helper.dynamicSort('age'));  // Sorts ascending by age
 *   myArray.sort(Helper.dynamicSort('-age')); // Sorts descending by age
 * ```
 */
function dynamicSort(property) {
  var sortOrder = 1;

  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }

  return function (a, b) {
    if (sortOrder == -1) {
      return b[property].localeCompare(a[property]);
    } else {
      return a[property].localeCompare(b[property]);
    }
  }
}

/**
 * Pads a number with leading zeros to match the number of digits in a given maximum value.
 *
 * @param num The number to be padded with leading zeros.
 * @param max The maximum value for which the number of digits will be used to determine the padding length
 *
 * @returns `string` the input number padded with leading zeros to match the number of digits in the maximum value.
 *
 * @example
 * ```js
 * console.log(zeroPad(2, 9)); // "2"
 * console.log(zeroPad(2, 10)); // "02"
 * ```
 */
function zeroPad(num, max) {
  return num.toString().padStart(Math.floor(Math.log10(max) + 1), '0');
}

function getDownloadSpeed(speedInKB) {
  const BYTES_PER_KB = 1024;
  const UNITS = ['KB/s', 'MB/s', 'GB/s']

  let speed = parseInt(speedInKB) || 0;
  let unitIndex = 0;

  if (speed >= BYTES_PER_KB) {

    // 1Gb = 1024 ** 2
    if (speed >= BYTES_PER_KB ** 2) unitIndex = 2;
    else unitIndex = 1; //mb

    speed = (speed / BYTES_PER_KB ** unitIndex);
  }

  return {
    value: parseFloat(speed.toFixed(2)),
    unit: UNITS[unitIndex]
  }
}
