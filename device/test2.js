// Import the interface to Tessel hardware
var tessel = require('tessel');
var patchFunctions = require('./patch_functions.js');

// testing/checking
console.log("connects defaults: ");
patchFunctions.ConfigDefaultPatches();		// set to startup switch configuration	--choose 1 method(this or below)??
//patchFunctions.SetDefaultConfig();		// set to startup switch configuration this should be faster hardcoded const values

console.log("connect: ");
patchFunctions.PatchDelayed(1, 1, 1);		// output port first, input port 2nd and 1/0 for connect or disconnect
patchFunctions.PatchDelayed(4, 4, 1);
patchFunctions.PatchDelayed(10, 10, 1);
patchFunctions.DoPatches();			// apply the changes to the switch

var myPatches =  Buffer.from(patchFunctions.getPatches());
var myPatches2 = Buffer.from(patchFunctions.PortArray);

console.log("getPatches: " + myPatches[1].toString(16));
console.log("PortArray: " + myPatches2[1].toString(16));

patchFunctions.DisconnectNow(4);
myPatches =  Buffer.from(patchFunctions.getPatches());
console.log("getPatches disconnected #4: " + myPatches);

patchFunctions.PortArray = myPatches;		// load in previously save patch list
patchFunctions.DoPatches();					// apply the changes to the switch

patchFunctions.SetDefaultConfig();			// set to startup

 setInterval(function () {		// looping only for debug/OScope purposes	** remove for production
    //patchFunctions.ConfigDefaultPatches();
    patchFunctions.SetDefaultConfig();
    patchFunctions.DoPatches();
}, 10);		// end of interval loop remove this for production

// console.log("disconnect: ");
// Disconnect(4);
// Disconnect(1);
// Disconnect(10);

