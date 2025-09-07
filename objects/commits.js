const ByogObject = require("./byogObjects");

class Commit extends ByogObject {
  constructor(message, timeStamp, treeHash, parentHashes = []) {
    const content = Commit.serializeCommit({ message, timeStamp, treeHash, parentHashes });
    super("commit", content);

    this.treeHash = treeHash;
    this.message = message;
    this.timeStamp = timeStamp;
    this.parentHashes = Array.isArray(parentHashes) ? parentHashes : [parentHashes];
    this.content = content;
  }

  static serializeCommit({ message, timeStamp, treeHash, parentHashes }) {
    const lines = [`tree ${treeHash}`];

    for (const parent of parentHashes) {
      lines.push(`parent ${parent}`);
    }

    lines.push(`timestamp ${timeStamp} +0000`);
    lines.push(""); 
    lines.push(message);

    return Buffer.from(lines.join("\n"));
  }

  static deserializeCommit(content) {
    const lines = content.toString().split("\n");

    let treeHash = null;
    let parentHashes = [];
    let timestamp = null;
    let message = "";

    lines.forEach((line, i) => {
      if (line.startsWith("tree ")) {
        treeHash = line.slice(5);
      } else if (line.startsWith("parent ")) {
        parentHashes.push(line.slice(7));
      } else if (line.startsWith("timestamp ")) {
        timestamp = parseInt(line.slice(10).split(" ")[0], 10);
      } else if (line === "") {
        message = lines.slice(i + 1).join("\n");
      }
    });

    return { treeHash, parentHashes, timestamp, message };
  }
}

module.exports = Commit;
