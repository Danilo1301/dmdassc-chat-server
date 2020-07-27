const fs = require("fs");
const vm = require('vm');

Mods = class {
  static mods = ["0"];

  static load()
  {
    this.loadMod(0);
  }

  static loadMod(id) {
    var mod = fs.readFileSync("./chat/mods/mod_"+id+".js", "utf8");

    var context = {setInterval};

    context.log = function() {
      var args = ["[MOD:"+id+" LOG]"];
      for (var a of arguments) {
        args.push(a);
      }
      console.log.apply(null, args);
    };

    context.API = {
      load: function(token) {
        return Data.getObjectReference(Chat, {token: token});
      }
    }

    try {
      vm.runInNewContext(mod, context, {timeout: 1000});
    } catch (e) {
      console.log(e)
    }
  }

}
