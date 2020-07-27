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
