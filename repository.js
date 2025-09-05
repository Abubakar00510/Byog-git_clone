const fs = require("fs");
const path = require("path");
const Blob = require("./objects/blob");
const { dir } = require("console");

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

gc = ()=>{
  const files = this.loadIndex()
  const values = new Set(Object.values(files));
  const objDir = fs.readdirSync(this.#objects_dir);
  objDir.map(o=>{
    const dirPath = path.join(this.#objects_dir,o);
    const files = fs.readdirSync(dirPath);
    files.map(f=>{
      if(!values.has(o+f)){
        const deleteFilePath = path.join(dirPath,f);
         fs.unlinkSync(deleteFilePath);
         console.log(`Garbage Collected: ${deleteFilePath}`); 
      }
    })
    if(fs.readdirSync(dirPath).length===0){
      fs.rmdirSync(dirPath);
    }
    
  })
  
}
  storeObj =(obj) =>{
    const obj_hash = obj.hash();
    const obj_dir = this.#objects_dir + "/"+ obj_hash.slice(0,2);
    const obj_file = obj_dir + '/' + obj_hash.slice(2);

    if(!fs.existsSync(obj_dir)){
      fs.mkdirSync(obj_dir);
    }  
    if(!fs.existsSync(obj_file)){
      console.log(obj_file);
      
      fs.writeFileSync(obj_file,obj.serialize());
    }
  
    return obj_hash;
  }

  saveIndex = (index)=>{
      fs.writeFileSync(this.#index_file,JSON.stringify(index,null,2)); 
  }

  loadIndex = ()=>{
    if(!fs.existsSync(this.#index_file)){
        return {};
    }
    return JSON.parse(fs.readFileSync(this.#index_file));
  }

  addPath = (...paths) => {
  if (!fs.existsSync(this.#byog_dir)) {
    console.log("initialize repository first");
    return;
  }

  let ignoreFiles = [];
  const ignorePath = path.join(this.#path, ".byogignore");
  if (fs.existsSync(ignorePath)) {
    ignoreFiles = fs.readFileSync(ignorePath, "utf-8")
      .split("\n")
      .map(f => f.trim())
      .filter(f => f.length > 0); 
  }

  paths.forEach((p) => {
    
    const fullPath = path.join(this.#path, p);
    if (!fs.existsSync(fullPath)) {
      console.log(`${p} not found`);
      return;
    }
    const stat = fs.statSync(fullPath);
    if (stat.isFile()) {
      this.addFile(p, ignoreFiles);
    } else if (stat.isDirectory()) {
      this.addDir(p, ignoreFiles);
    } else {
      console.log("something went wrong with provided path");
    }
  });
};

addDir = (dirPath, ignoreFiles) => {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  files.forEach((file) => {
    if (ignoreFiles.includes(file.name)) {
      return; 
    }
    const fullPath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      this.addDir(fullPath, ignoreFiles);
    } else if (file.isFile()) {
      this.addFile(fullPath, ignoreFiles);
    }
  });
};

addFile = (filePath, ignoreFiles) => {
  const fileName = path.basename(filePath);
  if (ignoreFiles.includes(fileName)) {
    return; 
  }

  const content = fs.readFileSync(filePath);
  const blob = new Blob(content);

  const blobHash = this.storeObj(blob);
  let index = this.loadIndex();

  const normalizedPath = filePath.replace(/\\/g, "/");
  index[normalizedPath] = blobHash;

  this.saveIndex(index);
  console.log(`Added: ${filePath}`);
  
};


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
    this.saveIndex({});

    console.log(`Initialized empty Byog repository in ${this.#byog_dir}`);
    return true;
  };
}

module.exports = Repository;