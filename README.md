![Xiaomi Mijia LYWSD03MMC](https://i.postimg.cc/C5VYY82F/gatttool-mijia.jpg)

# Xiaomi Mijia LYWSD03MMC

[![Build Status](https://img.shields.io/travis/com/r-hede/xiaomi-mijia-lywsd03mmc?style=flat-square)](https://app.travis-ci.com/r-hede/xiaomi-mijia-lywsd03mmc)
[![Coverage Status](https://img.shields.io/coveralls/github/r-hede/xiaomi-mijia-lywsd03mmc?style=flat-square)](https://coveralls.io/github/r-hede/xiaomi-mijia-lywsd03mmc)
[![Code style](https://img.shields.io/badge/code_style-standard-397e96.svg?style=flat-square)](https://standardjs.com)
[![Version](https://img.shields.io/github/package-json/v/r-hede/xiaomi-mijia-lywsd03mmc?color=397e96&style=flat-square)](https://github.com/r-hede/xiaomi-mijia-lywsd03mmc/releases/latest)
[![License](https://img.shields.io/github/license/r-hede/xiaomi-mijia-lywsd03mmc?color=397e96&style=flat-square)](LICENSE)

Search and get data from nearby sensors.

Only works with the Xiaomi Mijia Bluetooth temperature and humidity sensor (LYWSD03MMC).

Developed and tested with love on Raspberry Pi 4 and Raspberry Pi Zero W.

The sudo command is not required.

## Installation

```
npm i xiaomi-mijia-lywsd03mmc
```

## Quick Start Example

```js
const lywsd03mmc = require('xiaomi-mijia-lywsd03mmc')

// Get an array with the MAC addresses of the nearby sensors
lywsd03mmc.getSensors().then((res) => {
    res.forEach(sensorAddress => {
        // Get an object with the sensor data
        lywsd03mmc.getData(sensorAddress).then((res) => {
            // {
            //     address: 'XX:XX:XX:XX:XX:XX',
            //     humidityLevel: XX,
            //     temperature: XX,
            //     batteryLevel: XX
            // }
            console.log(res)
        }).catch((err) => {
            console.error(`[xiaomi-mijia-lywsd03mmc] Unable to get data (address: ${sensorAddress}, error: ${err})`)
        })
    })
}).catch((err) => {
    console.error(`[xiaomi-mijia-lywsd03mmc] Unable to get sensors (error: ${err})`)
})
```

## Documentation

<dl>
<dt><a href="#getSensors">getSensors(timeoutDuration)</a> ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code></dt>
<dd><p>Scan and get the MAC addresses of the nearby sensors.</p>
</dd>
<dt><a href="#getData">getData(sensorAddress, tempInFahrenheit, timeoutDuration)</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Get the data from the specified sensor (temperature, humidity level, battery level) every 20 seconds during 2 minutes. Stops when data are got.</p>
</dd>
</dl>

<a name="getSensors"></a>

## getSensors(timeoutDuration) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Scan and get the MAC addresses of the nearby sensors.

**Kind**: global function
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - Promise containing an array with the MAC addresses of the detected sensors.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| timeoutDuration | <code>number</code> | <code>10</code> | Maximum time in seconds assigned to the scan |

**Example**
```js
getSensors().then((res) => {
    console.log(res) // ['XX:XX:XX:XX:XX:XX', 'XX:XX:XX:XX:XX:XX', ..]
}).catch((err) => {
    console.error(`Unable to get sensors (error: ${err})`)
})
```
<a name="getData"></a>

## getData(sensorAddress, tempInFahrenheit, timeoutDuration) ⇒ <code>Promise.&lt;Object&gt;</code>
Get the data from the specified sensor (temperature, humidity level, battery level) every 20 seconds during 2 minutes. Stops when data are got.

**Kind**: global function
**Returns**: <code>Promise.&lt;Object&gt;</code> - Promise containing an object with the requested data.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| sensorAddress | <code>string</code> |  | MAC address of the sensor to connect |
| tempInFahrenheit | <code>boolean</code> | <code>false</code> | Temperature output format (Celsius/Fahrenheit) |
| timeoutDuration | <code>number</code> | <code>2</code> | Maximum time in minutes assigned to the connection |

**Example**
```js
// Replace with a valid MAC address of a nearby sensor
var sensorAddress = 'XX:XX:XX:XX:XX:XX'
getData(sensorAddress).then((res) => {
    // {
    //     address: 'XX:XX:XX:XX:XX:XX',
    //     humidityLevel: XX,
    //     temperature: XX,
    //     batteryLevel: XX
    // }
    console.log(res)
}).catch(() => {
    console.error(`[xiaomi-mijia-lywsd03mmc] Unable to get data (address: ${sensorAddress}, error: ${err})`)
})
```

## Change Log

This project adheres to [Semantic Versioning](https://semver.org).

Every release is documented on the GitHub [Releases](https://github.com/r-hede/xiaomi-mijia-lywsd03mmc/releases) page.

## License

[MIT](LICENSE)