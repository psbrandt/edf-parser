const fs  = require('fs')
const log = require('util').debuglog('edf')

const edf_file = 'S001R01.edf'

const ENCODING      = 'ascii'
const HEADER_LENGTH = 256
const HEADER_STATUS = 0
const SIGNAL_STATUS = 1
const DATA_STATUS   = 2

const signal_header_fields = [
    {
        name: "Label",
        length: 16
    },
    {
        name: "Transducer",
        length: 80
    },
    {
        name: "PhysicalDimensions",
        length: 8
    },
    {
        name: "PhysicalMin",
        length: 8,
        cast: parseFloat
    },
    {
        name: "PhysicalMax",
        length: 8,
        cast: parseFloat
    },
    {
        name: "DigitalMin",
        length: 8,
        cast: parseInt
    },
    {
        name: "DigitalMax",
        length: 8,
        cast: parseInt
    },
    {
        name: "Prefiltering",
        length: 80
    },
    {
        name: "Samples",
        length: 8,
        cast: parseInt
    },
    {
        name: "Reserved",
        length: 32
    },
]



var status = {
    buffer: Buffer.allocUnsafe(HEADER_LENGTH),
    waterMark: 0,
    header: null,
    signals: null,
    block:null,
    stage: HEADER_STATUS,
    error: null
}

reader = fs.createReadStream(edf_file)

reader.on('error',(error) => {
    console.log(`Error: error.`);
})

reader.on('end',() => {
    console.log(`Ending this`);
})

reader.on('data',(chunk) => {

    if(HEADER_STATUS == status.stage){
       const used = read_header(status,chunk);
       if(used && !status.error){
            //we are assuming header.Signals is always > 0
            status.stage = SIGNAL_STATUS
            chunk = chunk.slice(used)
            console.log(status.header)
       }
    }

    if(SIGNAL_STATUS == status.stage){
        const used = read_signal_headers(status,chunk)
        if(used && !status.error){
            status.stage = DATA_STATUS
            chunk = chunk.slice(used)
            console.log(status.signals)
        }
    }

    if(DATA_STATUS == status.stage){
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
})




function read_header(status, data){

    const to_copy = HEADER_LENGTH - status.waterMark

    const copied = data.copy(
        status.buffer,status.waterMark,0,Math.min(to_copy,data.length)
    )

    status.waterMark += copied
    if(HEADER_LENGTH != status.waterMark){
        return false
    }

    header = {}
    result = parse_edf_header(status.buffer,header)
    if (true != result){
        status.error = result
        return false
    }

    status.header = header
    status.waterMark = 0

    return copied
}


function parse_edf_header(buffer,header){
    header.Version = parseInt(buffer.toString(ENCODING,0,8).trimRight())
    header.Patient = buffer.toString(ENCODING,8,88).trimRight()
    header.Id      = buffer.toString(ENCODING,88,168).trimRight()
    //todo: convert to date time
    header.Start   = buffer.toString(ENCODING,168,184).trimRight()
    header.HeaderLength = parseInt(buffer.toString(ENCODING,184,192).trimRight())
    header.Reserved = buffer.toString(ENCODING,192,236).trimRight()
    header.DataRecords = parseInt(buffer.toString(ENCODING,236,244).trimRight())
    //convert to duration
    header.Duration = buffer.toString(ENCODING,244,252).trimRight()
    header.Signals = parseInt(buffer.toString(ENCODING,252).trimRight())
    return true;
}

function read_signal_headers(status,data){

    //initialize
    if (!status.signals){

        //todo: may be find a more functional approarch to
        //initialize the array
        status.signals = []
        for (let i = 0; i < status.header.Signals; i++) {
            status.signals.push({})
        }

        //signal marker
        status.buffer[HEADER_LENGTH - 1] = 0
        //field marker
        status.buffer[HEADER_LENGTH - 2] = 0
    }

    var current_field  = status.buffer[HEADER_LENGTH - 2]
    var current_signal = status.buffer[HEADER_LENGTH - 1]
    var waterMark      = status.waterMark
    var used           = 0

    for (let i = current_field; i < signal_header_fields.length; i++){
        const field   = signal_header_fields[i]
        const signals = status.signals.slice(current_signal)

        const result = parse_signal_header_field(
            field,signals,data.slice(used), status.buffer,waterMark
        )

        used +=field.length * (result.parsed) + result.waterMark

        if (
            result.waterMark != 0 ||
            status.header.Signals != (current_signal + result.parsed)
        ){
            status.waterMark = result.waterMark
            status.buffer[HEADER_LENGTH - 1] = current_signal + result.parsed
            status.buffer[HEADER_LENGTH - 2] = current_field + i;
            return false

        }

        current_signal = 0
    }

    return used

}

function parse_signal_header_field(field,signals,data,scratch_pad,waterMark){

    const {name,length:FIELD_SIZE,cast=null} = field
    const SIGNAL_TOTAL = signals.length
    var buffer = scratch_pad.slice(0,FIELD_SIZE)
    var i = 0
    var read = 0

    while(i < SIGNAL_TOTAL){
        let to_copy = FIELD_SIZE - waterMark

        let copied = data.copy(
            buffer,buffer.waterMark,read, Math.min(read + to_copy,data.length)
        )

        waterMark += copied
        read      += copied

        if(FIELD_SIZE != waterMark){
            break
        }

        let value = buffer.toString(ENCODING).trimRight()
        if(cast){
            value = cast(value)
        }

        signals[i][name] = value
        i++
        waterMark = 0
    }

    return {
        waterMark : waterMark,
        parsed    : i
    }
}


function read_data_block(status, data){
    //initialize
    if(!status.block){
        const block_size = status.signals.reduce((acc, signal) => {
            return acc + signal.Samples*2
        },0)
        log(block_size)
        status.block = Buffer.allocUnsafe(block_size)
    }

    var waterMark = status.waterMark
    const to_copy = status.block.length - waterMark
    const copied  = data.copy(
        status.block, waterMark,0,Math.min(to_copy,data.length)
    )

    waterMark += copied
    status.waterMark = (waterMark == status.block.length)? 0 : waterMark

    return {
        used    : copied,
        parsed  : (status.waterMark == 0)
    }
}

