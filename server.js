var mongo = require('mongodb').MongoClient,
    client = require('socket.io').listen(8080).sockets;


    mongo.connect('mongodb://127.0.0.1/chat',function(err,db){
    	if (err) throw err;


    	client.on('connection',function(socket){
    		var col = db.collection('messages');
    		sendStatus = function(s){
    			socket.emit('status', s);
    		};

    		//emit envoie de tous les messages 
    		col.find().limit(100).sort({_id: 1}).toArray(function(err, res){
    			if (err) throw err;
    			socket.emit('output', res); 
    		});

    		//attendre pour l'input 
    		socket.on('input',function(data){
    			var name = data.name,
    			    message = data.message,
    			    whitespacePattern = /^\s*$/;

    			    if(whitespacePattern.test(name)||whitespacePattern.test(message)){
    			    	console.log("invalid");
    			    	sendStatus('name and messages is required.');

    			    } else{
    			    	col.insert({name:name, message:message}, function(){

    			    		// envoie des dernier message de tous les  clients
    			    		client.emit('output',[data]);


    			    		sendStatus({
    			    			message: "message sent",
    			    			clear: true
    			    		});
    			    	});

    			   	}

    		});
    	});

    });

   

    // console.log(client);