class Element {
  constructor(type) {
    this.type = type;
  }

  renderSch(key) {
    return render(`templates/schematics/${this.type}.ejs`, { key });
  }
}
