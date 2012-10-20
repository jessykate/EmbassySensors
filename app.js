var ninjaBlocks = require('ninja-blocks'),
	_ = require('underscore'),
	util = require('util');
var express = require('express');
var app = express();
app.configure(function(){
  app.use(express.bodyParser());
});
var ninja = ninjaBlocks.app({user_access_token:"1bfeb22a-6259-4561-a772-667cdc2d5b78"});


var guids = {};
var rfsubs = {};

ninja.devices(function(err,devices) {
	// console.log(util.inspect(devices,false, 6, true));

	_.each(devices, function(d, key){
		guids[d.shortName] = key;
		if (d.device_type == 'rf433') {
			// console.log(d.subDevices);
			_.each(d.subDevices,function(sub){
				rfsubs[sub.shortName] = sub.data;
			})
			// rfsubs[]
		}
	})

	// console.log(guids);
 	
 	// ninja.device(guids['RF']).actuate(rfsubs['Power3 On']);
	ninja.device(guids['RF']).subscribe('http://50.57.69.4:3000/rfcallback',true);
 // 	var toggle = function(lampState){
 // 		setTimeout(function(){
	//  		lampState = (lampState == 'Lamp Off') ? 'Lamp On' ? 'Lamp Off';
	//  		ninja.device(guids['RF']).actuate(rfsubs(lampState));
	//  	},1000);
	// }

 	ninja.device(guids['Temp']).last_heartbeat(function(err,beat){
 		console.log('The temperature is'+beat.DA+'C');
 	});

 	// ninja.utils.findSubDevice({ shortName: 'Lamp On' }, deviceSet);

  // ... 
});

var bathroom = {
	shalflife : 20000, // shitting half life
	occupied : [],
	de_occupy : function(roomid, lampid){
		// console.log(roomid,lampid)
	 	ninja.device(guids['RF']).actuate(rfsubs[lampid+' Off']);
		bathroom.occupied[roomid] = false;
	 	console.log('Stopped Poopin in '+roomid);
	},
	reset : {},
	managePoopin : function(roomid, lampid) {
		if (!bathroom.occupied[roomid]) {
			console.log('Poopin Commenced on '+roomid);
		 	ninja.device(guids['RF']).actuate(rfsubs[lampid+' On']);
		} else {
			console.log('still poopin on '+roomid);
			clearTimeout(bathroom.reset[roomid]);
		}
	 	bathroom.reset[roomid] = setTimeout(function(){bathroom.de_occupy(roomid, lampid)}, bathroom.shalflife);
		bathroom.occupied[roomid] = true;
	}
}

app.post('/rfcallback', function(req, res){ 
	// console.log(util.inspect(req.body));

	if (req.body.DA == rfsubs['Emote0']) {
		console.log('Resetting Bathroom Lights');
	 	ninja.device(guids['RF']).actuate(rfsubs['Power1 Off']);
	 	ninja.device(guids['RF']).actuate(rfsubs['Power2 Off']);
	 	ninja.device(guids['RF']).actuate(rfsubs['Power3 Off']);
	}

	if (req.body.DA == rfsubs['motion0']) {
		// console.log('received movement from Ground');
		bathroom.managePoopin('Ground','Power1');
	}

	if (req.body.DA == rfsubs['motion1']) {
		// console.log('received movement from Stairs');
		bathroom.managePoopin('Stairs','Power2');
	}

	if (req.body.DA == rfsubs['motion2']) {
		// console.log('received movement from Table'); 
		bathroom.managePoopin('Table','Power3');
	}

  	res.send(200);
});

app.post('/lampon', function(req, res){
	console.log('lamp on');
 	ninja.device(guids['RF']).actuate(rfsubs['Lamp On']);	
  	res.send(200);
});

app.post('/lampoff', function(req, res){
	console.log('lamp off');
 	ninja.device(guids['RF']).actuate(rfsubs['Lamp Off']);	
  	res.send(200);
});

app.listen(3000);

// 50.57.69.4