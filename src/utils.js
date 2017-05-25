'use strict';
const processors = require('./processors.js');
const decoders   = require('./decoder.js');
const log = require('util').debuglog('edf')

function createStandardProcessors (headers){


    var list = headers.map( (h) => {
        log(h)
        const decoder = new decoders.Decoder(
            h.DigitalMin, h.DigitalMax,h.PhysicalMin, h.PhysicalMax
        );

        return  new processors.SignalProcessor(
            h,decoder
        );
    })

    return list
}

module.exports = {
    createStandardProcessors    
}