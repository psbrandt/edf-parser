const fs = require('fs')
const edf = require('../src/main.js')
const Transform = require('stream').Transform

const file = 'S001R01.edf'

var reader = fs.createReadStream(file)
var records = edf(reader)

reader.on('error', (error) => {
  console.log(`Error: ${error}.`)
})

records.on('error', (error) => {
  console.log(`Records Error: ${error}.`)
})

reader.on('end', () => {
  console.log(`Ending this`)
})

const objectToString = new Transform({
  writableObjectMode: true,
  transform (chunk, encoding, callback) {
    this.push(JSON.stringify(chunk) + '\n')
    callback()
  }
})

records.pipe(objectToString)
       .pipe(process.stdout)
