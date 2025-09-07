const ByogObject = require("./byogObjects");

class Tree extends ByogObject {


  constructor(entries = []) {
    const content = Tree._serializedEntries(entries);
    super("tree", content);
    this.entries = entries;
    this.content = content;
  }

  static _serializedEntries(entries) {
    let content = Buffer.alloc(0);

    const sorted = [...entries].sort((a, b) => a[1].localeCompare(b[1]));
    
    
    for (const [mode, name, obj_hash] of sorted) {
      content = Buffer.concat([
        content,
        Buffer.from(`${mode} ${name}\0`),
        Buffer.from(obj_hash, "hex"),
      ]);
    }

    return content;
  }

  addEntry(mode, name, obj_hash) {
    this.entries.push([mode, name, obj_hash]);
    this.content = Tree._serializedEntries(this.entries);
  }

  static deserailize(content) {
    const tree = new Tree();
    let i = 0;

    while (i < content.length) {
      const null_idx = content.indexOf(0, i);
      if (null_idx === -1) break;

      const [mode, name] = content.slice(i, null_idx).toString().split(" ", 2);
      const obj_hash = content
        .slice(null_idx + 1, null_idx + 21)
        .toString("hex");

      tree.entries.push([mode, name, obj_hash]);
      i = null_idx + 21;
    }

    tree.content = Tree._serializedEntries(tree.entries);
    return tree;
  }
}

module.exports = Tree;
