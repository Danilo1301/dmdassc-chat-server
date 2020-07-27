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
    this.data.add("password", "goodpass", {get: false});
    this.data.add("hasPassword", true);

    this.data.add("sendServerMessage");
    this.data.add("clearChat");

    this.events = new Events(this);
    this.users = [];
    this.messages = [];

    this.clearChat();
  }

  clearChat()
  {
    this.messages = [];
    var aff = this.sendServerMessage("fix-bug");
    aff.visibleTo.nobody = true;
  }

  canUserReceiveMessage(user, message) {
    var perms = message.visibleTo;
    for (var k in perms) { if(user[k] != perms[k]) { return false; } }
    return true;
  }

  tick()
  {
    var userMessages = {};
    var maxMessages = 10;

    for (var i = this.messages.length-1; i >= 0; i--) {
      var message = this.messages[i];

      for (var user of this.users) {
        var canReceive = this.canUserReceiveMessage(user, message);
        if(!userMessages[user.id]) { userMessages[user.id] = []; }
        if(canReceive) { userMessages[user.id].unshift(message); }
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
  }

  createMessage(text)
  {
    var message = new Message();
    this.messages.push(message);
    message.id = this.messages.indexOf(message);
    message.text = text;
    return message;
  }

  sendServerMessage(text)
  {
    return this.createMessage("SERVER: " + text);
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
    this.sendServerMessage(`${user.name} joined`);

    user.onJoinChannel(this, true);
    this.events.trigger("user_join", user.id);
  }

  handleUserLeave(user)
  {
    this.users.splice(this.users.indexOf(user), 1);
    this.usersCount = this.users.length;
    this.sendServerMessage(`${user.name} left`);

    user.onLeaveChannel(this);
    this.events.trigger("user_leave", user.id);
  }
}
