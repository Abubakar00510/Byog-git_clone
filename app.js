const fs = require("fs");
const crypto = require("crypto");
const zlib = require("zlib");
const { buffer } = require("stream/consumers");
const { deserialize } = require("v8");

class ByogObject {
    #obj_type;
    #content;
  constructor(obj_type, content) {
    this.#obj_type = obj_type;
    this.#content = content;
  }
   get content() {
        return this.#content;
    }
    
  hash = () => {
    const header = Buffer.from(
      this.#obj_type + " " + this.#content.length + "\0"
    );

    return crypto
      .createHash("sha1")
      .update(Buffer.concat([header, this.#content]))
      .digest("hex");
  };

  serialize = () => {
    const header = Buffer.from(`${this.#obj_type} ${this.#content.length}\0`);
    return zlib.gzipSync(Buffer.concat([header, this.#content]));
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

class Blob extends ByogObject{
    constructor(content){
        super('Blob',content);
    }
   get_content(){
    return this.content;
   }
}

class Repository {
  #path;
  #byog_dir;
  #objects_dir;
  #ref_dir;
  #heads_dir;
  #head_file;
  #index_file;
  constructor() {
    this.#path = process.cwd();
    this.#byog_dir = this.#path + "/.byog";

    this.#objects_dir = this.#byog_dir + "/objects";

    this.#ref_dir = this.#byog_dir + "/refs";
    this.#heads_dir = this.#ref_dir + "/heads";

    this.#head_file = this.#byog_dir + "/HEAD";
    this.#index_file = this.#byog_dir + "/index";
  }

  storeObj =(obj) =>{
    const obj_hash = obj.hash();
    const obj_dir = this.#objects_dir + "/"+ obj_hash.slice(0,2);
    const obj_file = obj_dir + '/' + obj_hash.slice(2);

    if(!fs.existsSync(obj_dir)){
      fs.mkdirSync(obj_dir);
    }  
    if(!fs.existsSync(obj_file)){
      fs.writeFileSync(obj_file,obj.serialize());
    }
  
    return obj_hash;
  }

  addPath = (path) =>{
    const fullPath = this.#path + '/' + path;
    if (!fs.existsSync(fullPath)){
        console.log(`${fullPath} not found`);
        return;
    }
    const stat = fs.statSync(fullPath);
    if (stat.isFile()){
        this.addFile(fullPath);
        console.log('its a file');
        
    }else if (stat.isDirectory()){
        this.addDir(fullPath);
        console.log('its a dir');
        
    }else console.log('something went wrong with provided path');
    
  }

  addFile =(path) =>{
    const content = fs.readFileSync(path);
    const blob = new Blob(content);
    console.log(blob);
    
    const blobHash = this.storeObj(blob);
  }

  init = () => {
    if (fs.existsSync(this.#byog_dir)) {
      console.log("Repository already initialized!");
      return false;
    }
    fs.mkdirSync(this.#byog_dir);

    // then subdirectories
    fs.mkdirSync(this.#objects_dir);
    fs.mkdirSync(this.#ref_dir);
    fs.mkdirSync(this.#heads_dir);

    // create HEAD + index
    fs.writeFileSync(this.#head_file, "ref: refs/heads/master\n");
    fs.writeFileSync(this.#index_file, JSON.stringify({}));

    console.log(`Initialized empty Byog repository in ${this.#byog_dir}`);
    return true;
  };
}

const argv = process.argv.slice(2);
const [command, subcommand, ...args] = argv;

const repo = new Repository();
repo.addFile('hello.txt');
if (command === "byog") {
  switch (subcommand) {
    case "help":
      console.log("byog available commands\nbyog init\nbyog add\nbyog commit");
      break;
    case "init":
      repo.init();
  }
} else {
  console.log("Unkown command");
}


