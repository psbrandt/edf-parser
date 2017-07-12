const assert = require('assert')
const {ParseEdfHeader} = require('../src/main.js').utils

describe("ParseEdfHeader",function(){

    it('Throw exception on invalid buffer', function () {

        const raw = "0       X X X X"
        var header = {}

        assert.throws(
            () => {
              const result = ParseEdfHeader(
                Buffer.from(raw,'ascii'),
                header
              )
            },
            Error, 'Edf header encoded can no be less than 256'
        )
    })

    it("Parsing", function(){

        const expected_header = {
          Version: 0,
          Patient: 'X X X X',
          Id: 'Startdate 12-AUG-2009 X X BCI2000',
          Start: new Date("2009-09-12T20:15:00.000Z"),
          HeaderLength: 16896,
          Reserved: 'EDF+C',
          DataRecords: 61,
          Duration: '1',
          Signals: 65
        }

        const raw = "0       X X X X                                                                         Startdate 12-AUG-2009 X X BCI2000                                               12.08.0916.15.0016896   EDF+C                                       61      1       65  "

        var header   = {}
        const result = ParseEdfHeader(
            Buffer.from(raw,'ascii'),
            header
        )

        assert.equal(true, result, "Parsed")
        assert.deepStrictEqual(expected_header, header,"Successfully parsed")

    })

})