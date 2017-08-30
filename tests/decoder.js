const assert = require('assert')
const {StandardDecoder} = require('../src/main.js')

describe('Decoder', function () {
  it('Throw exception on invalid digital range', function () {
    assert.throws(() => {
      var d = new StandardDecoder(1, 1, 2, 3)
    }, Error, 'Invalid digital range')
  })

  it('Throw exception on invalid physical range', function () {
    assert.throws(() => {
      var d = new StandardDecoder(2, 3, 1, 1)
    }, Error, 'Invalid physical range')
  })

  it('Decoding Invalid Not even input', function () {
    const digital = Buffer.from([240, 255, 200, 255, 201])
    const physical = [-16, -56]

    var out = (new Array(physical.length)).fill(0)

    const decoder = new StandardDecoder(
            -8092, 8092, -8092, 8092
        )

    assert.throws(() => {
      const decoded = decoder.Decode(digital, out)
    }, Error, 'Invalid length of byte inputs')
  })

  it('Decoding', function () {
    const digital = Buffer.from([240, 255, 200, 255, 201, 255, 206, 255, 220, 255, 211, 255, 229, 255, 252, 255, 218, 255, 235, 255, 252, 255, 241, 255, 26, 0, 42, 0, 32, 0, 25, 0, 242, 255, 220, 255, 229, 255, 219, 255, 238, 255, 252, 255, 235, 255, 230, 255, 0, 0, 255, 255, 7, 0, 248, 255, 224, 255, 217, 255, 219, 255, 215, 255, 7, 0, 29, 0, 231, 255, 239, 255, 0, 0, 245, 255, 227, 255, 252, 255, 1, 0, 244, 255, 2, 0, 250, 255, 224, 255, 238, 255, 240, 255, 253, 255, 30, 0, 22, 0, 0, 0, 10, 0, 34, 0, 46, 0, 22, 0, 251, 255, 240, 255, 13, 0, 10, 0, 12, 0, 7, 0, 248, 255, 244, 255, 4, 0, 38, 0, 68, 0, 81, 0, 99, 0, 78, 0, 26, 0, 1, 0, 249, 255, 249, 255, 229, 255, 240, 255, 243, 255, 252, 255, 237, 255, 237, 255, 224, 255, 215, 255, 218, 255, 216, 255, 229, 255, 240, 255, 235, 255, 2, 0, 15, 0, 13, 0, 7, 0, 6, 0, 19, 0, 38, 0, 31, 0, 253, 255, 253, 255, 17, 0, 42, 0, 27, 0, 33, 0, 59, 0, 67, 0, 69, 0, 79, 0, 32, 0, 23, 0, 34, 0, 42, 0, 34, 0, 36, 0, 32, 0, 15, 0, 31, 0, 42, 0, 53, 0, 57, 0, 20, 0, 1, 0, 26, 0, 24, 0, 4, 0, 240, 255, 231, 255, 234, 255, 233, 255, 227, 255, 246, 255, 236, 255, 195, 255, 196, 255, 226, 255, 251, 255, 223, 255, 238, 255, 9, 0, 242, 255, 236, 255, 246, 255, 242, 255, 236, 255, 249, 255, 250, 255, 244, 255, 231, 255, 212, 255, 212, 255, 224, 255, 196, 255, 188, 255, 205, 255, 204, 255, 217, 255, 201, 255, 227, 255, 225, 255, 211, 255, 219, 255, 223, 255, 219, 255, 233, 255])
    const physical = [-16, -56, -55, -50, -36, -45, -27, -4, -38, -21, -4, -15, 26, 42, 32, 25, -14, -36, -27, -37, -18, -4, -21, -26, 0, -1, 7, -8, -32, -39, -37, -41, 7, 29, -25, -17, 0, -11, -29, -4, 1, -12, 2, -6, -32, -18, -16, -3, 30, 22, 0, 10, 34, 46, 22, -5, -16, 13, 10, 12, 7, -8, -12, 4, 38, 68, 81, 99, 78, 26, 1, -7, -7, -27, -16, -13, -4, -19, -19, -32, -41, -38, -40, -27, -16, -21, 2, 15, 13, 7, 6, 19, 38, 31, -3, -3, 17, 42, 27, 33, 59, 67, 69, 79, 32, 23, 34, 42, 34, 36, 32, 15, 31, 42, 53, 57, 20, 1, 26, 24, 4, -16, -25, -22, -23, -29, -10, -20, -61, -60, -30, -5, -33, -18, 9, -14, -20, -10, -14, -20, -7, -6, -12, -25, -44, -44, -32, -60, -68, -51, -52, -39, -55, -29, -31, -45, -37, -33, -37, -23]

    var out = (new Array(physical.length)).fill(0)

    const decoder = new StandardDecoder(
            -8092, 8092, -8092, 8092
        )

    const decoded = decoder.Decode(digital, out)

    assert.equal(decoded, digital.length, 'All digital values decoded')
    assert.deepStrictEqual(out, physical, 'Physical vallues decoded')
  })
})