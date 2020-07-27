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
    this.data.add("leaveChannel");

    this.messagesOnClient = [];
    this.socket = null;
    this.badge = new Badge();
    this.events = [];
    this.admin = false;
  }

  getBadge()
  {
    return this.badge;
  }

  send(text)
  {
    if(this.channelId == -1) { return; }

    return Chat.channels[this.channelId].createMessage(text);
  }

  onJoinChannel(channel, success, error)
  {
    if(!success) {
      this.registerEvent("join_channel_failed", {error: error});
      return
    }

    this.channelId = channel.id;
    this.registerEvent("join_channel_success", {channelId: channel.id});
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
    Chat.events.trigger("user_connect", this.id);

    this.socket.on("disconnect", this.onDisconnect.bind(this))
  }

  joinChannel(channelId)
  {
    Chat.channels[channelId].handleUserJoin(this);
  }

  leaveChannel()
  {
    if(this.channelId != -1)
    {
      Chat.channels[this.channelId].handleUserLeave(this);
    }
  }

  onDisconnect()
  {
    this.leaveChannel();
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
      this.joinChannel(data.channelId);
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
      if(data == "reload") {
        Mods.reloadMods();
        return
      }
      this.send(this.name + ": " + data);
    }

    if(id == "leave_channel")
    {
      Chat.channels[this.channelId].handleUserLeave(this);
    }
  }

  tick()
  {
    if(!this.socket) { return }

    if(this.events.length > 0) {
      this.socket.emit("data", this.events);
    }

    this.events = [];
  }
}
