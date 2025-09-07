const crypto = require("crypto");
const zlib = require("zlib");

class ByogObject {
    
  constructor(obj_type, content) {
    this.obj_type = obj_type;
    this.content = content;
  }
    
  hash = () => {
    const header = Buffer.from(
      this.obj_type + " " + this.content.length + "\0"
    );

    return crypto
      .createHash("sha1")
      .update(Buffer.concat([header, this.content]))
      .digest("hex");
  };

  serialize = () => {
    const header = Buffer.from(`${this.obj_type} ${this.content.length}\0`);
    return zlib.gzipSync(Buffer.concat([header, this.content]));
  };

  static deserialize = (data) => {
    const decompressed = zlib.gunzipSync(data);

    const null_idx = decompressed.indexOf(0);

    const header = decompressed.slice(0, null_idx).toString();

    const content = decompressed.slice(null_idx + 1).toString();
    const [obj_type, _] = header.split(" ");
    return new ByogObject(obj_type, content);
  };
}

module.exports = ByogObject;