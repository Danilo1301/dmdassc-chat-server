class MessageSystem {
  static run(user)
  {
    var channel = Chat.channels[user.channelId];


    //console.log(channel.messages);

    var data = {};

    return data;
  }

  static canUserReceiveMessage(user, message)
  {
    return true
  }
}

User = class {
  constructor()
  {
    this.data = new Data(this);
    this.data.add("id", 0);
    this.data.add("channelId", -1);
    this.data.add("name", "User");

    this.data.add("getBadge");
    this.data.add("send");
    this.data.add("joinChannel");

    this.badge = new Badge();
    this.events = [];
    this.socket = null;

    this.admin = false;

    this.messagesOnClient = [];
  }

  getBadge()
  {
    return this.badge;
  }

  send(text)
  {
    if(this.channelId == -1) { return; }

    var message = Chat.channels[this.channelId].createMessage(text);

    console.log(message.data.serialize(true))
    console.log("send", text)
  }




  onJoinChannel(channel, success, error)
  {
    if(success) {
      this.channelId = channel.id;
      this.registerEvent("join_channel_success", {channelId: channel.id});
      return
    }

    this.registerEvent("join_channel_failed", {error: error});
  }

  onLeaveChannel()
  {
    this.channelId = -1;
    this.messagesOnClient = [];
    this.registerEvent("leave_channel_success");
  }

  onConnection(socket)
  {
    this.socket = socket;
    this.registerEvent("connect_success", this.data.serialize());
    Chat.events.trigger("user_join", this.id);
    //this.joinChannel(0);
  }

  registerEvent(id, data)
  {
    this.events.push({id: id, data: data})
  }

  onData(id, data)
  {
    console.log(`[${this.name}]`, id, data)

    if(id == "get_channels_list")
    {
      var channels = [];
      for (var channelId in Chat.channels) {
        channels.push(Chat.channels[channelId].data.serialize());
      }
      this.registerEvent("channels_list", {channels: channels});
    }

    if(id == "join_channel")
    {
      Chat.channels[data.channelId].handleUserJoin(this);
    }

    if(id == "create_channel")
    {
      Chat.createChannel(data.name);
    }

    if(id == "send_message")
    {
      if(typeof data != "string") {
        data = "";
      }
      
      if(data == "admin") {
        this.admin = true;
        return
      }
      this.send(data);
    }

    if(id == "leave_channel")
    {
      Chat.channels[this.channelId].handleUserLeave(this);
    }

  }

  tick()
  {
    if(!this.socket) { return }

    if(this.channelId != -1) {
      MessageSystem.run(this);

      //var channel = Chat.channels[this.channelId];
      //var messages = channel.messages;

      //console.log(messages)
    }


    if(this.events.length > 0) {
      this.socket.emit("data", this.events);
    }

    this.events = [];
  }
}
