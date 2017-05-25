'use strict'
const log = require('util').debuglog('edf')
const Transform = require('stream').Transform
const MissingEdfHeader = new Error('Missing Edf Header')
const SignalAndProcessorMissmatch = new Error('Signals and Processors count missmatch')

const STATUS_NOTSTARTED = 0
const STATUS_STARTED = 1

var DataRecords = class extends Transform {

  constructor (options) {

    options = options || {}
    options.decodeStrings = true
    options.objectMode = false
    options.readableObjectMode = true
    options.writableObjectMode = false

    super(options)

    this.header = options.header || null
    this.processors = options.processors || null
    this.status = STATUS_NOTSTARTED
  }

  setHeader (header) {
    this.header = header
    return this
  }

  setProcessors (processors) {
    this.processors = processors
  }

  _initialize (header, processors) {

    if (header.Signals != processors.length) {
      return SignalAndProcessorMissmatch
    }

    var samples = []
    
    processors.forEach(function (p) {
      samples.push(
        new Array(p.Samples()).fill(0.0)
      )
    })
    
    this.samples = samples
    this.count = 0
    this.start = this.header.Start
    this.status = STATUS_STARTED
  }

  _transform (chunk, encoding, callback) {

    const header = this.header
    const processors = this.processors

        // initialization
    if (STATUS_NOTSTARTED == this.status) {
      this._initialize(
                header, processors
            )
    }

    var samples = this.samples
    var current = 0

    for (let i = 0; i < this.processors.length; i++) {
      current += processors[i].Process(
                chunk.slice(current), samples[i]
            )
    }

    this.count++
        // todo adjust start time
    var out = {
      count: this.count,
      start: this.start,
      duration: header.Duration,
      samples: samples
    }
    //log(out)
    this.push(out)
    callback()
  }
}

module.exports = {
  DataRecords
}
