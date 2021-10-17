const { exec } = require('child_process')

module.exports = (() => {
  /**
   * Scan and get the MAC addresses of the nearby sensors.
   *
   * @param {number} timeoutDuration=10 - Maximum time in seconds assigned to the scan.
   *
   * @example
   * getSensors().then((res) => {
   *     console.log(res) // ['XX:XX:XX:XX:XX:XX', 'XX:XX:XX:XX:XX:XX', ..]
   * }).catch((err) => {
   *     console.error(`Unable to get sensors (error: ${err})`)
   * })
   *
   * @returns {Promise<Array<string>>} - Promise containing an array with the MAC addresses of the detected sensors.
   */
  function getSensors (timeoutDuration = 10) {
    return new Promise((resolve, reject) => {
      const sensorsAddresses = []
      const query = 'echo $(sudo ' +
        'timeout -s SIGINT ' +
        timeoutDuration +
        ' hcitool lescan)'
      exec(query, (err, stdout, stderr) => {
        if (err) {
          reject(err.message)
        } else if (stderr) {
          reject(stderr.slice(0, -1))
        } else {
          // Remove the useless beginning of the string and the last line break
          stdout = stdout.slice(0, -1).substring(12)
          // Split a string into an array of substrings to browse the results
          stdout = stdout.split(' ')
          for (let i = 0; i < stdout.length; i++) {
            if (stdout[i] === 'LYWSD03MMC') sensorsAddresses.push(stdout[i - 1])
          }
          resolve(sensorsAddresses)
        }
      })
    })
  }

  /**
   * Get the data from the specified sensor (temperature, humidity level,
   * battery level) every 20 seconds during 2 minutes. Stops when data are got.
   *
   * @param {string} sensorAddress - MAC address of the sensor to connect.
   * @param {boolean} tempInFahrenheit=false - Temperature output format (Celsius/Fahrenheit).
   * @param {number} timeoutDuration=2 - Maximum time in minutes assigned to the connection.
   *
   * @example
   * // Replace with a valid MAC address of a nearby sensor
   * var sensorAddress = 'XX:XX:XX:XX:XX:XX'
   * getData(sensorAddress).then((res) => {
   *     // {
   *     //     address: 'XX:XX:XX:XX:XX:XX',
   *     //     humidityLevel: XX,
   *     //     temperature: XX,
   *     //     batteryLevel: XX
   *     // }
   *     console.log(res)
   * }).catch(() => {
   *     console.error(`[xiaomi-mijia-lywsd03mmc] Unable to get data (address: ${sensorAddress}, error: ${err})`)
   * })
   *
   * @returns {Promise<Object>} - Promise containing an object with the requested data.
   */
  function getData (sensorAddress, tempInFahrenheit = false, timeoutDuration = 2) {
    return new Promise((resolve, reject) => {
      // Try to get the data every 20 seconds during {timeoutDuration} minute(s)
      for (let timeouts = [], i = 0; i <= timeoutDuration * 3; i++) {
        (function (index) {
          // Keep all timers to delete them later
          timeouts.push(setTimeout(() => {
            // Get the temperature, the humidity level and the battery level
            listenHandle(sensorAddress).then((res) => {
              // Delete all existing timers
              for (let j = 0; j < timeouts.length; j++) {
                clearTimeout(timeouts[j])
              }
              resolve({
                address: sensorAddress,
                humidityLevel: getHumidityLevel(res),
                temperature: getTemperature(res, tempInFahrenheit),
                batteryLevel: getBatteryLevel(res)
              })
            }).catch((err) => {
              // No data received within the allocated time
              if (index === timeoutDuration * 3) {
                reject(err)
              } else {
                console.error(`[xiaomi-mijia-lywsd03mmc] ${err}`)
              }
            })
          }, i * 20000, i))
        })(i)
      }
    })
  }

  /**
   * Listen a handle for a few seconds in order to get the desired
   * data (temperature, humidity level, battery level).
   *
   * @param {string} sensorAddress - MAC address of the sensor to search for.
   *
   * @example
   * // Replace with a valid MAC address of a nearby sensor
   * var sensorAddress = 'XX:XX:XX:XX:XX:XX'
   * // Set to true if you want the temperature in Fahrenheit
   * var tempInFahrenheit = false
   * listenHandle(sensorAddress).then((res) => {
   *     console.log({
   *         'humidityLevel': getHumidityLevel(res),
   *         'temperature': getTemperature(res, tempInFahrenheit),
   *         'batteryLevel': getBatteryLevel(res)
   *     })
   * }).catch((err) => {
   *     console.error(err)
   * })
   *
   * @returns {Promise<string|Buffer>} - Promise with an error (string) or the requested data (Buffer).
   */
  function listenHandle (sensorAddress) {
    return new Promise((resolve, reject) => {
      const query = 'timeout 15 gatttool -b ' +
        sensorAddress +
        ' --char-read' +
        ' -a 0x38' +
        ' --listen' +
        ' | grep --max-count=1 \'Notification handle\''
      exec(query, (err, stdout, stderr) => {
        if (err) {
          reject(err.message.slice(0, -1))
        } else if (stderr) {
          reject(stderr.slice(0, -1))
        } else {
          // Keep only the value and remove the spaces
          stdout = stdout.substr(36, 14).replace(/\s/g, '')
          // Set the data in a buffer
          stdout = Buffer.from(stdout, 'hex')
          resolve(stdout)
        }
      })
    })
  }

  /**
   * Read only the useful part of a buffer and convert the
   * hexadecimal value to a decimal value of the humidity level.
   *
   * @param {Buffer} buf - Buffer that contains the humidity level in hexadecimal value.
   *
   * @example
   * var buf = Buffer.from('460844c00a', 'hex')
   * var humidityLevel = getHumidityLevel(buf)
   * console.log(humidityLevel) // 68
   *
   * @returns {number} - Humidity level in decimal value.
   */
  function getHumidityLevel (buf) {
    return buf.readUInt8(2)
  }

  /**
   * Read only the useful part of a buffer and convert the
   * hexadecimal value to a decimal value of the temperature.
   *
   * @param {Buffer} buf - Buffer that contains the temperature in hexadecimal value.
   * @param {boolean} valueInFahrenheit=false - Temperature output format (Celsius/Fahrenheit).
   * @param {undefined} val - Internal variable of the function.
   *
   * @example
   * var buf = Buffer.from('460844c00a', 'hex')
   * var temperature = getTemperature(buf)
   * console.log(temperature) // 21.2
   *
   * @returns {number} - Temperature in decimal value.
   */
  function getTemperature (buf, valueInFahrenheit = false, val) {
    if (buf[1] === 255) {
      // Temperature is negative
      val = Number((-65536 + buf.readUInt16LE(0)) / 10)
    } else {
      // Temperature is positive
      val = Number((buf.readUInt16LE(0) / 100).toFixed(1))
    }
    return valueInFahrenheit ? Number((val * 1.8 + 32).toFixed(1)) : val
  }

  /**
   * Read only the useful part of a buffer and convert the
   * hexadecimal value to a decimal value of the battery level.
   *
   * @param {Buffer} buf - Buffer that contains the battery level in hexadecimal value.
   *
   * @example
   * var buf = Buffer.from('460844c00a', 'hex')
   * var batteryLevel = getBatteryLevel(buf)
   * console.log(batteryLevel) // 72
   *
   * @returns {number} - Battery level in decimal value.
   */
  function getBatteryLevel (buf) {
    return Math.round(map(buf.readUInt16LE(3), 2100, 3000, 0, 100))
  }

  /**
   * Re-maps a number from one range to another.
   *
   * @param {number} val - Number to map.
   * @param {number} inMin - Lower bound of the value’s current range.
   * @param {number} inMax - Upper bound of the value’s current range.
   * @param {number} outMin - Lower bound of the value’s target range.
   * @param {number} outMax - Upper bound of the value’s target range.
   *
   * @example
   * var mappedValue = map(2500, 2100, 3000, 0, 100)
   * console.log(mappedValue) // 44.4
   *
   * @returns {number} - Mapped value.
   */
  function map (val, inMin, inMax, outMin, outMax) {
    if (val > inMax) {
      return outMax
    } else if (val < inMin) {
      return outMin
    } else {
      return Number(((val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin).toFixed(1))
    }
  }

  return {
    getSensors: getSensors,
    getData: getData
  }
})()
