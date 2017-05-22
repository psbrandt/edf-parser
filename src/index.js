'use strict';
const Transform = require('stream').Transform


const ENCODING      = 'ascii'
const HEADER_LENGTH = 256
const HEADER_STATUS = 0
const SIGNAL_STATUS = 1
const DATA_STATUS   = 2

function TransformState = function(){
  this.stage = HEADER_STATUS
  this.buffer =  Buffer.allocUnsafe(HEADER_LENGTH),
  this.waterMark = 0
  this.headers = null
  this.signals = null
  this.block = null
  this.error = null

}

var DataBlocks = class extends Transform {
  constructor (options) {
    options.decodeStrings = true
    options.readableObjectMode = false
    options.writableObjectMode = false
    super(options)

    this.state = new TransformState()
  }

  _transform (chunk, encoding, callback) {

    if (HEADER_STATUS == this.state.stage){
      const used = read_header(status,chunk);
      if(used && !status.error){
        //we are assuming header.Signals is always > 0
        status.stage = SIGNAL_STATUS
        chunk = chunk.slice(used)
        console.log(status.header)
      }
    }

    if(SIGNAL_STATUS == this.state.stage){
        const used = read_signal_headers(status,chunk)
        if(used && !status.error){
            status.stage = DATA_STATUS
            chunk = chunk.slice(used)
            console.log(status.signals)
        }
    }

    if(DATA_STATUS == this.state.stage){
        let counter = 0
        while(chunk.length > 0){
            const {used,parsed} = read_data_block(status,chunk);
            chunk = chunk.slice(used)
            if(parsed){
                counter++
                log(`block parsed: ${counter}`)
            }
        }
    }
  }
}

module.exports = {
  DataRecordTransform
}
