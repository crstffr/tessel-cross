/*
	dmason  3/2017 - ?/2017
	crstffr 3/2017
	
	V0.0.a
	
	Prototype functions for AudioRouter
	Uses spi_comm.js SPI Comm Prototype
	The AD8113 is be programmed with the serial DATA IN.
	
	The data format for an input should follow:
		D4	 D3 D2 D1 D0	
		|	{address bits}			(0 - F)
		| enable bit 	(0 - No Connection 1 - Connected )
		example: input 12			--- for more see chart at bottom ---
			connected  		1C (Hex) or 11100 (binary)
			disconnected	0C (Hex) or 01100 (binary)
	
	exports {ConfigDefaultPatches, SetDefaultConfig, OutputStandby, PatchDelay, PatchNow, DisconnectDelayed, DisconnectNow, GetPatches, PortArray}
*/

// Import the interface to Tessel hardware
var tessel = require('tessel');
var spiComm = require('./spi_comm.js');		// our SPI Communication module
spiComm.SPIComm();

const arraySize = 10;		// Array Size is the number of Output Patch Ports

// keep all current connections info
var PortArray = new Buffer.allocUnsafe(arraySize);		// spi comm requires a Buffer array

//spiComm.SPISetup();		// needed?

var ConfigDefaultPatches = function() { 
// 	Set the Outputs equal to the inputs 0,0 1,1 2,2 ... 15,15 and all set as disconected
	for (var i = 0; i < arraySize; i++) {
		PatchDelayed(i, i, 0);
	}
}

var SetDefaultConfig = function() {		// use for power on default switch config
	spiComm.SetDefaultConfig();
}

var SetPortArray = function(buffer) {
	PortArray = buffer;
}

var OutputStandby = function(outHold) {	// a 'true' shuts off all outputs --- a 'false' turns outputs back on 
	spiComm.OutputStandby(outHold);
}

var PatchDelayed = function(outputPort, inputPort, connect) {		// update the PortArray and apply later
//		configure Port connection and set connected
//		to make the patch connect must be '1' 
	inputPort = inputPort | (connect * 0x10 );					// if connect  == 1 then OR to inputPort  
	console.log(outputPort, " : ", inputPort.toString(16));		// delete me
	PortArray[outputPort] = inputPort;
}

var PatchNow = function(outputPort, inputPort, connect) {
	PatchDelayed(outputPort, inputPort, connect);		// setup array
	spiComm.SPIDataOut(PortArray);				// apply now
}

var DisconnectDelayed = function(outputPort) {			// update the PortArray and apply later
	PortArray[outputPort] = PortArray[outputPort] &~ 0x10;	// strip the connect flag bit
	console.log(PortArray[outputPort].toString(16));		// delete me
}

var DisconnectNow = function(outputPort) {
	DisconnectDelayed(outputPort);				// setup array
	spiComm.SPIDataOut(PortArray);			// apply now
}

var DoPatches = function(){					// apply patches to switch
	spiComm.SPIDataOut(PortArray);
}

var GetPatches = function(){
	return PortArray;
}

//module.exports = {
exports.ConfigDefaultPatches = ConfigDefaultPatches;
exports.SetDefaultConfig = SetDefaultConfig;
exports.OutputStandby = OutputStandby;

exports.DoPatches = DoPatches;
exports.PatchNow = PatchNow;
exports.PatchDelayed = PatchDelayed;
exports.DisconnectNow = DisconnectNow;
exports.DisconnectDelayed = DisconnectDelayed;
exports.getPatches = GetPatches;	// current switch port configuration
exports.SetPortArray = SetPortArray;
//}
/*
			Input & Output Patch Port Assignment Chart
			------------------------------------------
						 		|	{Disconnected Output}	|	{Connected Output}		|
Patch Label	|	Decimal Value *	|	Hex	|	Binary			|	Hex	|	Binary			|
-----------	|	-------------	|	---	|	------			|	---	|	------			|
	16		|		15			|	0F	|	(0000)(1111)	|	1F	|	(0001)(1111)	|
	15		|		14			|	0E	|	(0000)(1110)	|	1E	|	(0001)(1110)	|
	14		|		13			|	0D	|	(0000)(1101)	|	1D	|	(0001)(1101)	|
	13		|		12			|	0C	|	(0000)(1100)	|	1C	|	(0001)(1100)	|
	12		|		11			|	0B	|	(0000)(1101)	|	1B	|	(0001)(1101)	|
	11		|		10			|	0A	|	(0000)(1010)	|	1A	|	(0001)(1010)	|
	10		|		 9			|	09	|	(0000)(1001)	|	19	|	(0001)(1001)	|
	9		|		 8			|	08	|	(0000)(1000)	|	18	|	(0001)(1000)	|
	8		|		 7			|	07	|	(0000)(0111)	|	17	|	(0001)(0111)	|
	7		|		 6			|	06	|	(0000)(0110)	|	16	|	(0001)(0110)	|
	6		|		 5			|	05	|	(0000)(0101)	|	15	|	(0001)(0101)	|
	5		|		 4			|	04	|	(0000)(0100)	|	14	|	(0001)(0100)	|
	4		|		 3			|	03	|	(0000)(0011)	|	13	|	(0001)(0011)	|
	3		|		 2			|	02	|	(0000)(0010)	|	12	|	(0001)(0010)	|
	2		|		 1			|	01	|	(0000)(0001)	|	11	|	(0001)(0001)	|
	1		|		 0			|	00	|	(0000)(0000)	|	10	|	(0001)(0000)	|
 
 *- Use these values in the code to make the Patch(es)
 
*/
