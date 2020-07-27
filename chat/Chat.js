require("./Data.js");
require("./User.js");
require("./Mods.js");
require("./Badge.js");
require("./Channel.js");
require("./Server.js");
require("./Message.js");

getAvaliableId = function(obj) {
  var id = 0;
  while (obj[id] != undefined) {
    id++;
  }
  return id;
}

Events = class {
  constructor(target)
  {
    var self = this;

    this.target = target;
    this.events = {};

    target.on = function(event, callback)
    {
      if(!self.events[event]) {
        self.events[event] = {callbacks: []}
      }

      self.events[event].callbacks.push(callback);

    }

    target.data.add("on");
  }



  trigger(event, data)
  {

    if(!this.events[event]) { return }
    for (var c of this.events[event].callbacks) {
      c(data);
    }
  }
}

Chat = class {
  static users = {};
  static token_permissions = {};
  static channels = {};

  static start(io)
  {
    this.setupServer(io);
    this.loadTokens();

    this.data = new Data(this);
    this.data.add("getUser");
    this.data.add("getUsers");

    this.events = new Events(this);

    var channel = this.createChannel("Main Channel", {maxUsers: 2});

    Mods.load();

    this.events.trigger("mods_loaded", {mods: 1});

    setInterval(() => {
      for (var channel_id in this.channels) {
        this.channels[channel_id].tick();
      }


      for (var user_id in this.users) {
        var user = this.users[user_id];
        user.tick();
      }

    }, 100)
  }

  static setupServer(io)
  {
    Server.start(io);
  }

  static loadTokens()
  {
    this.token_permissions["super_incredible_admin_api_key_pog"] = {bypass: true};
    this.token_permissions["public_api_key"] = {bypass: false};
  }

  static createUser(options)
  {
    options = options || {};
    var user = new User();
    user.id = options.id ? options.id : getAvaliableId(this.users);
    this.users[user.id] = user;
    return user;
  }

  static createChannel(name, options)
  {
    options = options || {};
    var channel = new Channel();
    channel.name = name;
    channel.maxUsers = options.maxUsers || 100;
    channel.id = getAvaliableId(this.channels);
    this.channels[channel.id] = channel;
    return channel;
  }

  static getUser(id)
  {
    return this.users[id];
  }

  static getUsers()
  {
    var users = [];
    for (var userId in this.users) {
      users.push(userId)
    }
    return users
  }
}

module.exports = Chat;
