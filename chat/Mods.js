const fs = require("fs");
const vm = require('vm');

Mod = class {
  constructor(id) {
    this.id = id;
  }

  load()
  {
    delete this.errorMessage;

    var self = this;
    return new Promise(function(resolve, reject) {

      var code = fs.readFileSync("./chat/mods/mod_"+self.id, "utf8");

      var context = {setInterval};

      context.log = function() {
        var args = ["[MOD:"+self.id+" LOG]"];
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
        vm.runInNewContext(code, context, {timeout: 1000});
        resolve(self);
      } catch (e) {
        self.errorMessage = `${e}`;
        reject(self)

      }

    });

  }
}

Mods = class {
  static mods = {};

  static load()
  {
    for (var i = 0; i <= 1; i++) {

      this.mods[i] = new Mod(i);

      this.mods[i].load().then((mod)=>{
        console.log(mod.id, true)
      }).catch((mod)=>{
        console.log(mod.id, mod.errorMessage)
      });
    }
  }

  static reloadMods()
  {
    for (var mod_id in this.mods) {
      this.mods[mod_id].load();
    }

  }
}
