const lywsd03mmc = require('./index')

describe('getSensors', () => {
  it('should return an array of string, an empty array or a string', () => {
    return lywsd03mmc.getSensors().then((res) => {
      expect(typeof res[0] === 'string' || expect(res).toEqual(expect.any(Array))).toBeTruthy()
    }).catch((err) => {
      expect(err).toEqual(
        expect.any(String)
      )
    })
  }, 15000)
})

describe('getData', () => {
  it('should return an object or a string', () => {
    return lywsd03mmc.getData('XX:XX:XX:XX:XX:XX').then((res) => {
      expect(res).toEqual(
        expect.any(Object)
      )
    }).catch((err) => {
      expect(err).toEqual(
        expect.any(String)
      )
    })
  }, 140000)
})

describe('_getHumidityLevel', () => {
  it('should return the number 68', () => {
    const buf = Buffer.from('460844c00a', 'hex')
    return expect(lywsd03mmc._getHumidityLevel(buf)).toBe(68)
  })
})

describe('_getTemperature', () => {
  it('should return the number 21.2', () => {
    const buf = Buffer.from('460844c00a', 'hex')
    return expect(lywsd03mmc._getTemperature(buf)).toBe(21.2)
  })
  it('should return the number -5.2', () => {
    const buf = Buffer.from('ccff44c00a', 'hex')
    return expect(lywsd03mmc._getTemperature(buf)).toBe(-5.2)
  })
})

describe('_getBatteryLevel', () => {
  it('should return the number 72', () => {
    const buf = Buffer.from('460844c00a', 'hex')
    return expect(lywsd03mmc._getBatteryLevel(buf)).toBe(72)
  })
})

describe('_map', () => {
  it('should return the number 44.4', () => {
    return expect(lywsd03mmc._map(2500, 2100, 3000, 0, 100)).toBe(44.4)
  })
  it('should return the number 100', () => {
    return expect(lywsd03mmc._map(4000, 2100, 3000, 0, 100)).toBe(100)
  })
  it('should return the number 0', () => {
    return expect(lywsd03mmc._map(2000, 2100, 3000, 0, 100)).toBe(0)
  })
})
