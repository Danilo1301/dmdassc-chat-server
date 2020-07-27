Server = class {
  static start(io)
  {
    this.io = io;

    io.on("connection", socket => this.onSocketConnection(socket));
  }

  static onSocketConnection(socket)
  {
    var user;
    socket.on("data", function(packet) {
      var data = packet.data

      if(user) {
        return user.onData(packet.id, data);
      }

      if(packet.id == "join") {
        var uid = data.uid;

        user = Chat.getUser(user => user.id == uid);



        if(!uid.startsWith("1:") || user == undefined) {
          uid = "1:" + makeid(20);
          user = Chat.createUser({id: uid});
          console.log("[Server] Setting uid to " + uid);
        }

        console.log(`[Server] New connection id ${socket.id} (uid:${uid})`)

        user.onConnection(socket);
      }

    });


  }
}

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
