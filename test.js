var express = require('express'),
    bodyParser = require('body-parser'),
	alexaVerifier = require('alexa-verifier'); 
	server = require('http').createServer(app);
	io = require('socket.io')(server);
    app = express(),
	

app.use(bodyParser.json());
app.use(bodyParser.json({
    verify: function getRawBody(req, res, buf) {
        req.rawBody = buf.toString();
    }
}));



//------------------------------------
//------------------------------------
// WEB
//------------------------------------
//------------------------------------
app.get('/web', function(req,res){
	res.send('Hello World!');
})

//Keep polling alexa message update from client side
io.on('connection', function(client) {  
    console.log('Client connected...');

    client.on('join', function(data) {
        console.log(data);
		client.emit('message', 'Hello from server');
    });

});

//------------------------------------
//------------------------------------
// ALEXA
//------------------------------------
//------------------------------------
app.post('/alexa', requestVerifier, function(req, res) {
		
	//Session Start
	if (req.body.request.type === 'LaunchRequest') {
		res.json({
		  "version": "1.0",
		  "response": {
			"shouldEndSession": true,
			"outputSpeech": {
			  "type": "SSML",
			  "ssml": "<speak>Hmm <break time=\"1s\"/> What day do you want to know about?</speak>"
			}
		  }
		});
	}
  
    //Session End
    else if (req.body.request.type === 'SessionEndedRequest') {
	// Per the documentation, we do NOT send ANY response... I know, awkward.
		console.log('Session ended', req.body.request.reason);
    }
  
   else if (req.body.request.type === 'IntentRequest' &&
           req.body.request.intent.name === 'Forecast') {

		if (!req.body.request.intent.slots.Day ||
			!req.body.request.intent.slots.Day.value) {
		  // Handle this error by producing a response like:
		  // "Hmm, what day do you want to know the forecast for?"
		}
		var day = new Date(req.body.request.intent.slots.Day.value);

		// Do your business logic to get weather data here!
		// Then send a JSON response...

		res.json({
		  "version": "1.0",
		  "response": {
			"shouldEndSession": true,
			"outputSpeech": {
			  "type": "SSML",
			  "ssml": "<speak>Looks like a great day!</speak>"
			}
		  }
		});
	}
});

app.listen(3000);

function requestVerifier(req, res, next) {
    alexaVerifier(
        req.headers.signaturecertchainurl,
        req.headers.signature,
        req.rawBody,
        function verificationCallback(err) {
            if (err) {
                res.status(401).json({ message: 'Verification Failure', error: err });
            } else {
                next();
            }
        }
    );
}