/*
	dmason  3/2017 - ?/2017
	crstffr (??) 3/2017
	
	V0.0.a

	This is the Prototype Firmware SPI Comm for AudioRouter Project {Chip AD8113}
	Using: 
		Tessel		AD8113
		---------	------
		SCK	 (SPI) 	CLK
		MOSI (SPI)	DATA IN
		MISO (SPI)	Open * ** 
		A1			CE
		A0			UPDATE
		A5			RESET
		A6                      SER/PAR
		
		*  - can connect to DATA IN for validation testing
		** - could use DATA OUT to validate (that will require writing the data 2x to propagate through the AD8113)
	Includes switching the CE and UPDATE lines at the correct times.
	
	16 groups of 5 bits are transfered {most-significant-output-address first}
		{Input to connect to OUTPUT 15, Input to connect to OUTPUT 14, ... Input to connect to OUTPUT 00}
	
	Commands SPISetup(), SPIDataOut(Buffer(hex,hex,)), RESET(1/0) {1 - all outputs off/ 0 - normal operation} 
	
*/

// Import the interface to Tessel hardware
var tessel = require('tessel');
	// pin assignments
const pinUPDATE = tessel.port.A.pin[0];
const pinCE = tessel.port.A.pin[1];
// tessel port A pins 2,3,4 used by SPI 
const pinRESET = tessel.port.A.pin[5];
const pinSER = tessel.port.A.pin[6];

var spiCommChannel;	// does this work  this way ??

const DEFAULT_SWITCH_CONFIG = new Buffer.from([0x0F,0x0E,0x0D,0x0C,0x0B,0x0A,0x09,0x08,0x07,0x06,0x05,0x04,0x03,0x02,0x01,0x00]);	// all input ports are tied to the same coresponding output port with the outputs disabled  0 to 0, 1 to 1 ... 15 to 15


// configruation options
var clockSpeed = 500000;        // 500K
var reverse = true;	        // If the Outputs are backwards then change this to false {error in reading the DataSheet}
var reset = false;		// 

// The two commands below should only be used if TX & RX are connected in HW
// make function *testing* and set these 
var checkWrite = true;	// switch to check values out to console.log
var validate = true;	// validate data written to switch before UPDATE if data fails no UPDATE occures

// set pin defaults		--- add to system setup / system reset??
pinCE.high();		// setup CE pin      (enabled low)
pinUPDATE.high();	// setup UPDATE pin  (enabled low)
pinRESET.high();	// setup RESET pin   (enabled low)
pinSER.low();	// set SerPar pin to low	-- ser(NOT)/Par so ser low for serial coding

function SPIComm() {		// only make one of these -- how to limit it?

	spiCommChannel = new tessel.port.A.SPI({	// Configure SPI interface - speed, clock polarity, chipsSelect Pin {CE}, update Pin

		clockSpeed: clockSpeed, // 100 KHz	--slow	{4 MHz @ 4 MHz works need to speed up CE UPDATE lines)
/*			
			Using OScope validation my tessel is right on at 4MHz, but at 5 Mhz my tessel jumped to 6MHz (BUG?) 
			6MHz is to fast for the AD8113 
 			Recommend using 4MHz plenty fast and has a good margin for safety
 			AD8113 requires 80 clock pulses (+ 50 nS) to set up a change this should allow for change time of 20.05 uS.

			Tessels standard digital pin switching is slow (around 1KHz) compared to the 4MHz clock and SPI data transfer.
			Slowed the clock to 100KHz to get a closer timing to the Digital pins the timings for a 100KHz clock
			(measured timing) SPI comm 1.8mS, UPDATE 1mS, CE 8mS --- the CE time includes the SPI comm and the UPDATE. 
			8 mS = 125 Hz
*/

//	chipSelect = tessel.port.A.pin[1], // as CE ** to use this we need to add UPDATE into the SPI code
//	update = tessel.port.A.pin[0],		// not implemented yet
//			using the chipSelect as CE and an UPDATE inside the SPI code we should be able to run much faster...
		
		cpol: 1            // clock polarity sets to inverted clock ( AD8113 uses a negative edge trigger )
	});
}

var SetDefaultConfig = function() {
	this.SPIDataOutClean(DEFAULT_SWITCH_CONFIG);
}

var SPIDataOut = function(dataIn) {
    
    
	var PortArray = Buffer.from(dataIn); // copy of the array
//        var rxOut;
	if (reverse) {
//	The order of Output Patch Ports for the switch is largest to smallest and the PortArray is small to large so reverse
		PortArray.reverse();
	}
	PortArray = AdjustPortArray(PortArray);
	console.log("data: ");			 // delete me
	pinCE.low();			   // set CE so we can configure switch
	spiCommChannel.transfer(PortArray, function (error, rx) {// add err handling	// tryout 'send' instead of transfer faster?
/*
	I connected the MOSI (tx) and MISO (rx) together and get the correct values back also confirmed with OScope.
	Data writes with SPI configuration appear to meet the AD8113 serial specs DataSheet page 3
*/
	
	if (validate) {	// only use validate if testing with the tx and rx connected
		// validation will slow down the system
		if (rx.equals(PortArray)) {	// only update if validate && rx == tx
			pinUPDATE.low();	// serial data writes are complete set UPDATE to latche into switch
			pinUPDATE.high();	// update finished time between update low and update high is not critical
                        console.log('Validate Confirmed: ');
		}
	} 
	else {		// run the update if validate is false
		pinUPDATE.low();	// serial data writes are complete set UPDATE to latche into switch
		pinUPDATE.high();	// update finished time between update low and update high is not critical
                console.log('here no Validate: ');
	}
	
	pinCE.high();		// serial data and update completed Switch is configured so disable CE now.
	
	if (checkWrite) {	// checkWrite will fail unless testing with the tx and rx connected
		console.log('returned: ', rx);
		console.log('confirm: ', rx.equals(PortArray));	// compare sent to received
	}
    });
}

var SPIDataOutClean = function(dataIn) {
    
    dataIn = AdjustPortArray(dataIn);
	// mostly same as SPIDataOut made for speed
		// uses send(tx only no rx) instead of transfer so:
			// no validation possible & no logging to console
		// no reversing of dataIn so dataIn needs to be in correct order (output Largest to Smallest
		
	pinCE.low();			   // set CE so we can configure switch
	spiCommChannel.send(dataIn, function (error) {// add err handling	// tryout 'send' instead of transfer faster?
	// try the UPDATE toggle inside the send function??
	// also try the CE return to HIGH?
		pinUPDATE.low();	// serial data writes are complete set UPDATE to latche into switch
		pinUPDATE.high();	// update finished time between update low and update high is not critical
                pinCE.high();		// serial data and update completed Switch is configured so disable CE now.
	});
	//pinUPDATE.low();	// serial data writes are complete set UPDATE to latche into switch
	//pinUPDATE.high();	// update finished time between update low and update high is not critical
//	pinCE.high();		// serial data and update completed Switch is configured so disable CE now.
}

var AdjustPortArray = function(array) { // this is ugly... Fix It!
 // convert '16' Hex port configurations to '10' Hex commands for transmitting to xpoint
    var temp="";
    
    for (var item of array.entries()) {     // entries is a pair [index , value]
        console.log(item[1]);
        console.log(('00000'+item[1].toString(2)).slice(-5));
        temp = temp +('00000'+item[1].toString(2)).slice(-5)       // convert to binary *=& pad to 5 positions
    }
    console.log("temp: " + temp);
    var newArray = temp.match(/.{1,8}/g);
    console.log("newArray: " + newArray);

    var newBuff = new Buffer(10);
    for (var items of newArray.entries()) {     // entries is a pair [index , value]
        newBuff[items[0]]=parseInt(items[1],2);
    }
    console.log(newBuff);
    return newBuff;
}


var OutputStandby = function(outHold) {	// disables outputs 'true'/1 ... enables outputs 'false'/0
// must be set to false or 0 to configure the switch
	pinRESET.output(!outHold);	// active low pin
	reset = outHold;			// use this in a check before *DataOut* ??
}

module.exports = {
    SPIComm:            SPIComm,
    SetDefaultConfig:   SetDefaultConfig,
    SPIDataOut:         SPIDataOut,
    SPIDataOutClean:    SPIDataOutClean,
    OutputStandby:      OutputStandby
    
};

