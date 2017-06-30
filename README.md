# Edf File parser

Package to parse/process edf file format as detailed on the [specification] (http://www.edfplus.info/specs/edf.html)
**Important: ** This is not and edf+ parser 

## Terminology
Below some terminology found in the source code that will help to understand the implementation faster.
**DataBlock**: The raw byte-encoded data sample as found in the file
**Record**: The decoded samples found on a data block
**SignalProcessor**: Interface for objects that can process/translate a raw set of bytes, representing the digital values,
into the real physical values of a signal
**RecordProcessor**: Interface for objects that can process/translate and entire datablock into its record.

if there is no time for to much reading file **sample/sample.js** will give a quick usage intro. 

## Some Implementation details
**edf.DataBlock**, implementing the stream.Transform interface, should be pipe into a stream reading the edf raw content, it
will parse the header, signals headers, triggering the events header and signals respectivily containing the models, right after
it will begin streaming each datarecord as a block 

**edf.RecordsStream**, also implementing the stream.Transform interface, it is design to take as input each datarecord and translate 
it into a record, which gets push out  the pipe (using object mode)for extra processing. the RecordStream does the transformation with the help 
of an object implementing the  **edf.RecordProcessor** 

**edf.RecordProcessor** object is a composition of multiple **edf.SignalProcessor**, and each signal processor is in charge of 
processing/decoding the data of the signal it represents. The resposability of a RecordProcessor is simply coordinating between
each signal processor and keeping a time log to determine the start time of each data record.

The idea behaind the implementation is that different implementatios of the SignalProcessor can be combine together.

the **edf.utils** namespace contains utility functions that facilitates the interconnection of the different parts of the parser.



