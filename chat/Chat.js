require("./Data.js");
require("./User.js");
require("./Mods.js");
require("./Badge.js");
require("./Channel.js");
require("./Server.js");
require("./Message.js");
require("./Events.js");

Chat = class {
  static users = {};
  static token_permissions = {};
  static channels = {};

  static start(io)
  {
    this.setupServer(io);
    this.loadTokens();

    this.data = new Data(this);
    this.data.add("getChannel");
    this.data.add("getUser");

    this.events = new Events(this);

    this.createChannel("Main Channel", {maxUsers: 100});

    Mods.load();

    setInterval(() => {
      for (var channel_id in this.channels) { this.channels[channel_id].tick(); }
      for (var user_id in this.users) { this.users[user_id].tick(); }
    }, 100);
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

  static getUser(find)
  {
    return findObjectCondition(this.users, find);
  }

  static getChannel(find)
  {
    return findObjectCondition(this.channels, find);
  }
}

function findObjectCondition(list, fn)
{
  for (var k in list) {
    if(fn(list[k])) {
      return list[k];
      break;
    }
  }
  return;
}

function getAvaliableId(obj) {
  var id = 0;
  while (obj[id] != undefined) { id++; }
  return id;
}

module.exports = Chat;
