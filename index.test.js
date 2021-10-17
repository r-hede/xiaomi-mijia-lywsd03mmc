const lywsd03mmc = require('./index')

test('getSensors: should have an array of string, an empty array or a string', () => {
  return lywsd03mmc.getSensors().then((res) => {
    expect(typeof res[0] === 'string' || expect(res).toEqual(expect.any(Array))).toBeTruthy()
  }).catch((err) => {
    expect(err).toEqual(
      expect.any(String)
    )
  })
}, 15000)

test('getData: should have an object or a string', () => {
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
