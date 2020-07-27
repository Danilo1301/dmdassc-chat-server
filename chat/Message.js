Message = class {
  constructor()
  {
    this.data = new Data(this);
    this.data.add("id");
    this.data.add("text", "", {set: true});

    this.visibleTo = {};
  }
}
