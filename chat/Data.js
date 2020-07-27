Data = class {
  constructor(target)
  {
    this.target = target;
    this.props = {};
  }

  static getObjectReference(object, settings)
  {
    var tokenPermissions = Chat.token_permissions[settings.token];
    var reference = {};

    if(!tokenPermissions) {
      return reference;
    }

    var makeRef = function(reference, object, k) {
      reference[k] = object[k];

      Object.defineProperty(reference, k, {
        get: function()
        {
          var canGet = tokenPermissions.bypass ? true : object.data.props[k].get;

          if(!canGet) { return }

          if(typeof object[k] == "function") {

            return function() {
              var value = object[k].bind(object).apply(null, arguments);
              if(!value) { return; }
              if(value.data) { value = Data.getObjectReference(value, settings); }
              return value;
            }
          }

          return object[k];
        },
        set: function(val)
        {
          var canSet = tokenPermissions.bypass ? true : object.data.props[k].set;

          if(canSet) { object[k] = val; }
        }
      });
    }

    for (var k in object.data.props) { makeRef(reference, object, k); }

    return reference;
  }

  serialize(showPrivate)
  {
    var json = {};

    for (var k in this.props) {
      if(!this.props[k].private || showPrivate) {
        json[k] = this.target[k];
      }
    }

    return json
  }

  add(prop_name, value, options)
  {
    var propInfo = {get: true, set: false, value: value};

    if(value) { propInfo.value = value; }
    if(options) { Object.assign(propInfo, options); }

    this.props[prop_name] = propInfo;

    if(!this.target[prop_name]) {
      Object.defineProperty(this.target, prop_name, {
        get: function() { return propInfo.value; },
        set: function(val) { propInfo.value = val; }
      });
    }
  }
}

module.exports = Data;
