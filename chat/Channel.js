let CHANNEL_ERROR = {
  "CHANNEL_FULL": 0,
  "USER_ALREADY_CONNECTED": 1
}

Channel = class {
  constructor()
  {
    this.data = new Data(this);
    this.data.add("id");
    this.data.add("name", "", {set: true});
    this.data.add("usersCount", 0);
    this.data.add("maxUsers", 100, {set: true});
    this.data.add("password", "goodpass", {set: true, private: true});

    this.users = [];
    this.messages = [];

    this.createMessage("channel_message_0_public");
    this.createMessage("channel_message_1_public");
    this.createMessage("channel_message_2_public");
    this.createMessage("channel_message_3_public");
    var pm = this.createMessage("channel_message_4_PRIVATE");
    pm.visibleTo.admin = true;
    this.createMessage("channel_message_5_end_public");
  }

  canUserReceiveMessage(user, message) {
    var perms = message.visibleTo;
    for (var k in perms) {
      if(user[k] != perms[k]) {
        return false;
      }
    }
    return true;
  }

  tick()
  {
    var userMessages = {};
    var maxMessages = 4;

    for (var i = this.messages.length-1; i >= 0; i--) {
      var message = this.messages[i];

      for (var user of this.users) {
        var canReceive = this.canUserReceiveMessage(user, message);

        if(!userMessages[user.id]) {
          userMessages[user.id] = [];
        }

        if(canReceive) {
          userMessages[user.id].unshift(message);
        }
      }
    }



    for (var k in userMessages) {
      var user = Chat.users[k];

      var showMessages = userMessages[k];



      if(showMessages.length > maxMessages) {
        showMessages = showMessages.splice(showMessages.length - maxMessages, maxMessages);
      }


      for(var message of showMessages) {


        if(!user.messagesOnClient.includes(message)) {
          user.messagesOnClient.push(message);

          var after = showMessages[showMessages.indexOf(message)-1]

          user.registerEvent("add_message", {after: after ? after.id : undefined, message: message.data.serialize()});
        }
      }


      for (var message of user.messagesOnClient) {
        if(!showMessages.includes(message)) {
          user.messagesOnClient.splice(user.messagesOnClient.indexOf(message), 1);
          user.registerEvent("remove_message", message.id);
        }
      }

    }

    return

    for (var k in userMessages) {
      var user = Chat.users[k];

      var showMessages = userMessages[k];

      if(showMessages.length > maxMessages) {
        showMessages = showMessages.splice(0, maxMessages);
      }



      for(var ic = (showMessages.length-1); ic >= 0; ic--) {
        var message = showMessages[ic];

        if(!user.messagesOnClient.includes(message.id)) {

          var after = -1;
          var add_to_index = 0;

          console.log(`==== showMessages ====`);
          for (var m of showMessages) {
            console.log(showMessages.indexOf(m), `(${m.id})`, m.text);
          }

          if(showMessages[showMessages.indexOf(message)+1]) {
            after = showMessages[showMessages.indexOf(message)+1].id;
            //add_to_index = (showMessages.length-1-showMessages.indexOf(message)+1);
          }

          console.log(after)

          if(after == -1) {
            user.messagesOnClient.unshift(message.id);
          } else {
            var to_index = showMessages.indexOf(message);
            console.log(`to index ${to_index}`)
            user.messagesOnClient.splice(to_index, 0, message.id);
          }


          //user.messagesOnClient.splice(add_to_index, 0, message.id);

          console.log(`==== messagesOnClient ====`);
          for (var m of user.messagesOnClient) {
            console.log(user.messagesOnClient.indexOf(m), "msg", m);
          }
          console.log(`====  ====`);
          console.log(`====  ====`);
          console.log(`====  ====`);

          user.registerEvent("add_message", {after: after, message: message.data.serialize()});

          if(user.messagesOnClient.length > maxMessages) {
            var msgid = user.messagesOnClient.splice(user.messagesOnClient.length-1, 1)[0];
            user.registerEvent("remove_message", msgid);
          }
        }
      }
    }
  }

  createMessage(text)
  {
    var message = new Message();

    this.messages.push(message);

    message.id = "MESSAGE_" + this.messages.indexOf(message);
    message.text = text;

    return message;
  }

  handleUserJoin(user)
  {
    function reject(errorCode) {
      user.onJoinChannel(this, false, errorCode);
    }

    if(this.users.includes(user) || user.channelId != -1) {
      return reject(CHANNEL_ERROR.USER_ALREADY_CONNECTED);
    }

    if(this.usersCount >= this.maxUsers) {
      return reject(CHANNEL_ERROR.CHANNEL_FULL);
    }

    this.users.push(user);
    this.usersCount = this.users.length;
    user.onJoinChannel(this, true);
    this.createMessage(`${user.name} joined`);
  }

  handleUserLeave(user)
  {
    this.users.splice(this.users.indexOf(user), 1);
    this.usersCount = this.users.length;
    user.onLeaveChannel(this);
    this.createMessage(`${user.name} left`);
  }


}
