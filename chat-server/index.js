'use strict';

// libraries and imports
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
AWS.config.update({
  region: 'us-east-1'
});

// Initialize the Amazon Cognito credentials provider
//AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
// Provide your Pool Id here
	IdentityPoolId: 'us-east-1:488838d9-ed14-4720-aedf-43eb84b1c77f',
});

const lexruntime = new AWS.LexRuntime();
const sessionAttributes = {};

const uuidv4 = require('uuid/v4');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

const bucketName = 'bookchat1';// + uuidv4()
// application-specific variables
const state = {};
const sockets = {};
const agents = [];

// helper function for initializing state
const initState = function() {
  return {
    name: '',
    messages: [],
    conversationId: uuidv4() // auto-assign conversationId
  };
};

// wraps a string as a text message
// ready to be sent through socket.io
const textMessage = function(text) {
  if (typeof text !== 'string') {
    throw new Error('text parameter needs to be a string');
  }

  return JSON.stringify({
    text: text
  });
};

io.on('connection', function(socket) {

  console.log(`socket ${socket.id} connected ${new Date().toISOString()}`);
  let agentId = '';
  sockets[socket.id] = socket;

  let socketRef = socket;

  socket.on('handshake', function(userObj) {
    console.log(`received handshake for user`, userObj);

    try {
      let user = JSON.parse(userObj);
      let userId = user.userId;
	  // TODO
	  let userName = user.name;
	  
	  let lexUserId = 'chatbot-demo' + Date.now();

      // if a state object does not exist
      // for this user, create a new one
      if (!state[userId]) {
        state[userId] = initState();
        state[userId].name = user.name;
      }

      // event handler for messages from this particular user
      socketRef.on(userId, function(message) {
        console.log(`received message for ${userId}`, message);
        console.log(`user socketRef ${socketRef.id}`);
        console.log(`current agent id ${agentId}`);

        let currentState = state[userId];
        // track the message
        currentState.messages.push(message);

        // TODO: below, you need to handle the incoming message
        // and use Lex to disambiguate the user utterances
		//begin Code
		// if(agents){{
			// agentId = agents[0];
			// console.log(agentId);
		// }
		//agentId = agents[0];
		//console.log(agentId);
		  if (!sessionAttributes[userId]) {
			sessionAttributes[userId] = null;
		  }
		var params = {
			botAlias: '$LATEST',
			botName: 'BookTrip',
			inputText: message,
			userId: lexUserId,
			sessionAttributes: sessionAttributes[userId]
		};
		lexruntime.postText(params, function(err, data) {
			if (err) {
				console.log(err, err.stack);
				//showError('Error:  ' + err.message + ' (see console for details)')
			}
			if (data) {
				// capture the sessionAttributes for the next cycle
				sessionAttributes[userId] = data.sessionAttributes;
				// show response and/or error/dialog status
				let lexResponse = data;
				console.log('message from lex:' + lexResponse.message + '(' + lexResponse.dialogState + ')');
				if (lexResponse.message) {
					//console.log(agentId);
					io.emit(agentId, textMessage('message from lex:' + lexResponse.message + '(' + lexResponse.dialogState + ')'));
					io.emit(userId, textMessage('message from lex:' + lexResponse.message + '(' + lexResponse.dialogState + ')'));
				}
				if (lexResponse.dialogState === 'ReadyForFulfillment' || lexResponse.dialogState === 'Fulfilled') {
					console.log('Ready for fulfillment');
					let keyName = currentState.conversationId + '.json';
					
					s3.createBucket({Bucket: bucketName}, function() {
					  console.log(state[userId]);
					  var params = {Bucket: bucketName, Key: keyName, Body: JSON.stringify(state[userId])};
					  s3.putObject(params, function(err, data) {
						if (err)
						  console.log(err)
						else
						  console.log("Successfully uploaded data to " + bucketName + "/" + keyName);
					  });
					});
					delete sessionAttributes[userId];
					// TODO:  show slot values
				} else {
					console.log('(' + lexResponse.dialogState + ')');
				}
			}
		});
        
        //io.emit(userId, textMessage(`Hi there. I'm under development, but should be functional soon :)`));
      });
    } catch (handshakeError) {
      console.log('user handshake error', handshakeError);
    }
  });

  socket.on('agentHandshake', function(agentObj) {
    console.log(`received handshake for agent`, agentObj);
	
    try {
      let agent = JSON.parse(agentObj);
      agentId = agent.agentId;
	  agents.push(agentId);
	  //let agentName = agent.name;
	  console.log(`try get agent id`, agentId);

      // event handler for messages from this particular user
      socketRef.on(agentId, function(message) {
        console.log(`received message for ${agentId}`, message);
        console.log(`agent socketRef ${socketRef.id}`);
        
      });
    } catch (handshakeError) {
      console.log('agent handshake error', handshakeError);
    }
	
  });

  socket.on('disconnect', function() {
    console.log(`socket ${socket.id} disconnected at ${new Date().toISOString()}`);
    if (sockets[socket.id]) delete sockets[socket.id];
  });

});

// middleware
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

http.listen(port, function() {
  console.log('listening on *:' + port);
});

// serve up agent dashboard
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});
