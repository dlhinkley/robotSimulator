var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();

// https://github.com/TooTallNate/keypress
/*
 Add the following to line 231 of index.js in keypress code to enable numbers
 else if (s.length === 1 && s >= '0' && s <= '9') {
    // Number
    key.name = s;

  } 
*/
var keypress = require('keypress');

var commandKeyMatrix = {
                        'up': 'k',
                        'left': 'l',
                        'right': 'h',
                        'down': 'j',
                        'space': 's', // slow
                        'x': 'x', // stop
                        'q': 'q', // 0
                        'w': 'w', // 22
                        'e': 'e', // 45
                        'r': 'r', // 67
                        't': 't', // 90 degree
                        'y': 'y', // 112
                        'u': 'u', // 135
                        'i': 'i', // 157
                        'o': 'o', // 180
                        'p': 'p', // ping
                        'c': 'c', // coordinates
};

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

function sendCommand(command) {
    
       // Send command to robot
    btSerial.write(new Buffer(command, 'utf-8'), function(err, bytesWritten) {
    
        if (err) console.log(err);
        //console.log("bytesWritten=",bytesWritten);
    }); 
}
function keyPressEvent(ch, key) {

  //console.log('got "keypress"', key);
  
  if (key && key.ctrl && key.name == 'c') {
    process.stdin.pause();
  }
  else if (key && key.name && commandKeyMatrix.hasOwnProperty(key.name) ) {
      
    sendCommand( commandKeyMatrix[ key.name ]);
      
  }
  else if (key && key.name) {
    sendCommand(key.name);
  }
}

// listen for the "keypress" event
process.stdin.on('keypress', keyPressEvent);
process.stdin.setRawMode(true);
process.stdin.resume();



var received = '';
var rxIn = '';



btSerial.on('found', function(address, name) {

	console.log('address=' + address);
	console.log('name=' + name);
	
	if (name === 'RN42-9699' && address == '00-06-66-65-96-99' ) {
	
        btSerial.findSerialPortChannel(address, function(channel) {
        
            btSerial.connect(address, channel, function() {
            
                console.log('connected');
                // Prepare response for command
                //
                btSerial.on('data', function(buffer) {
                
                    var out = buffer.toString('utf-8');
                    //console.log('data out=' + out);
                    
                    for (var m = 0; m < out.length; m++) {
                        
                        //console.log('data m=' + m + ' char=' + out.charAt(m));
                        
                        if ( out.charAt(m) === '\n' ) {
                            
                            received = rxIn;
                            rxIn = '';
                            console.log('received=' + received);
                        }
                        else {
                            
                            rxIn += out.charAt(m);
                        }
                    }
                });                   
                
            }, function (error) {
                console.log('cannot connect',error);
            });
    
            // close the connection when you're ready
            //btSerial.close();
            
        }, function(error) {
            console.log('found nothing',error);
        });
	}
	else {

		console.log('skipping ' + name);
	}
});


// Starts searching for bluetooth devices. When a device is found a 'found' event will be emitted.
btSerial.inquire();

