'use strict';
const InvalidDigitalRange = new Error("Invalid digital range")
const InvalidInput        = new Error("Invalid length of byte inputs")
const log = require('util').debuglog('edf')

var Decoder = class {
    constructor(digmin, digmax,phymin, phymax){

        const diff = digmax - digmin
        if(!diff){
            throw InvalidDigitalRange
        }

        this.m = (phymax - phymin) / diff
        this.digmax = digmax
        this.phymax = phymax
        
    }

    Decode(source, target){

        const slen = source.length
        const tlen = target.length
        const pmax = this.phymax
        const dmax = this.digmax
        const m    = this.m

        if(slen % 2 != 0){
            throw InvalidInputl
        }

        var s = 0, t = 0, tmp = 0
        while(s < slen && t < tlen){

            tmp = source.readInt16LE(s,true)

            target[t] = pmax + m*(tmp - dmax)
            
            s += 2
            t += 1
        }

        return s;
    }
}

module.exports = {
    Decoder
}