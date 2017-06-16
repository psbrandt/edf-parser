const fs = require('fs')
const DataBlocks = require('../src/index.js').DataBlocks
const RecordsStream = require('../src/records.js').RecordsStream
const Transform = require('stream').Transform
const log = require('util').debuglog('edf')
const utils = require('../src/utils.js')

const file = 'S001R01.edf'

var reader = fs.createReadStream(file)
var blocks = new DataBlocks()
var records = new RecordsStream(
  utils.StandardRecordProcessor
)

reader.on('error', (error) => {
  console.log(`Error: ${error}.`)
})

records.on('error', (error) => {
  console.log(`Records Error: ${error}.`)
})

blocks.on('error', (error) => {
  console.log(`block Error: ${error}.`)
})

reader.on('end', () => {
  console.log(`Ending this`)
})

blocks.on('header', (header) => {
  records.setHeader(header)
})

blocks.on('signals', (signals) => {
  records.setSignals(signals)
})

const objectToString = new Transform({
  writableObjectMode: true,
  transform (chunk, encoding, callback) {
    this.push(JSON.stringify(chunk) + '\n')
    callback()
  }
})

reader.pipe(blocks)
      .pipe(records)
      .pipe(objectToString)
      .pipe(process.stdout)

// run as:
// export NODE_DEBUG=edf; node sample.js > /dev/null
