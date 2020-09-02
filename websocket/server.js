const helper = require('./helper');
const https = require('https');
const fs = require('fs');
const moment = require('moment');
const sockets = [];
const httpsOptions = {
    key: fs.readFileSync(''),
    cert: fs.readFileSync(''),
};
const WebSocketServer = require('websocket').server;
const server = https.createServer(httpsOptions, function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.write('Hello World!');
    res.end()
}).listen(3000);
const wsServer = new WebSocketServer({
    httpServer: server
});
wsServer.on('request', function(request) {
    const connection = request.accept(null, request.origin);
    connection.on('message', function(message) {
        try 
        {
            let data = JSON.parse(message.utf8Data);
            if (data.message !== undefined && data.message !== "") {
                //connection.sendUTF(message);
                if (sockets[data.toUserId] !== "" && sockets[data.toUserId] !== undefined) {
                    sockets[data.toUserId].sendUTF(message.utf8Data);
                }
                helper.addUserMessage(data.fromUserId, data.toUserId, data.message);
            } else {               
                if(data.userActive) {
                    connection.id = Math.round(Math.random() * 100000000000000000);
                    sockets.forEach(function(client) {
                        client.sendUTF(message.utf8Data);
                    });
                    helper.loginUser(data.userid, connection.id);
                    sockets[data.userid] = connection;
                }
                else {
                    delete sockets[data.userid];                   
                    helper.logoutUser(data.userid);   
                    sockets.forEach(function(client) {
                        client.sendUTF(data);
                    });
                }
            }
        } catch (error) {
            console.log(error);
        }
    });
    connection.on('close', function(reasonCode, description) {
        try {
            helper.getUserDetailBySocketId(connection.id)
                .then(result => {
                    if (result[0]) {
                        let userid = result[0].id;
                        helper.logoutUser(userid);
                        delete sockets[userid];
                        let data = JSON.stringify({
                            "userid": userid,
                            "isActive": false
                        });
                        sockets.forEach(function(client) {
                            client.sendUTF(data);
                        });
                    }
                }).catch((error) => {
                    console.log(error);
                });
        } catch (error) {
            console.log(error);
        }
    });
});