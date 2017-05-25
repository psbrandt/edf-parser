const fs = require('fs')
const DataBlocks = require('../src/index.js').DataBlocks

const edf_file = 'S001R01.edf'

var reader = fs.createReadStream(edf_file)
var blocks = new DataBlocks()

reader.on('error',(error) => {
    console.log(`Error: ${error}.`);
})

reader.on('end',() => {
    console.log(`Ending this`);
})

reader.pipe(blocks).pipe(process.stdout)

//run as:
//export NODE_DEBUG=edf; node sample.js > /dev/null