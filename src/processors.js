'use strict';
//signal processors are in charge of process the set of raw bytes from the data block
//and convert them to floats
//the follow a simple interface:
//int function Sample() that return the amount of samples it returns
//int function Process(chunk,out)-> convert the chunks into float and copy them into array out 

const IncompleteSignalData = new Error("Signal data incomplete")
const IncompleteDecode     = new Error("Incomplete data decoding")

var SignalProcessor = class {

    constructor(header, decoder){
        //signal header
        this.header = header
        this.decoder = decoder
    }

    Samples(){
        return this.header.Samples
    }

    Process(chunk, out){

        const toProcess = this.Samples()*2

        if(chunk.length < toProcess){
            throw IncompleteSignalData
        }

        const decoded =  this.decoder.Decode(
            chunk.slice(0,toProcess),out
        )

        if (decoded != toProcess){
            throw IncompleteDecode
        }

        return decoded
    }
}

module.exports = {
    SignalProcessor
}