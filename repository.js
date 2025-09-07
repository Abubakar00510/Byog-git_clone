const fs = require("fs");
const path = require("path");
const Blob = require("./objects/blob");
const Tree = require("./objects/tree");
const Commit = require("./objects/commits");
const { logError, logInfo, logSuccess } = require("./utils/logger");
const { saveIndex, loadIndex } = require("./indexHandler");
const { loadObject, storeObj } = require("./objectHandler");

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
    this.#byog_dir = path.join(this.#path, ".byog");
    this.#objects_dir = path.join(this.#byog_dir, "objects");
    this.#ref_dir = path.join(this.#byog_dir, "refs");
    this.#heads_dir = path.join(this.#ref_dir, "heads");
    this.#head_file = path.join(this.#byog_dir, "HEAD");
    this.#index_file = path.join(this.#byog_dir, "index");
  }

  // ===== Initialize Repository =====
 init = () => {
    if (fs.existsSync(this.#byog_dir)) {
      logError("Repository already initialized!");
      return false;
    }

    fs.mkdirSync(this.#byog_dir);
    fs.mkdirSync(this.#objects_dir);
    fs.mkdirSync(this.#ref_dir);
    fs.mkdirSync(this.#heads_dir);

    fs.writeFileSync(this.#head_file, "ref: refs/heads/master\n");
    saveIndex(this.#index_file,{})

    logSuccess(`Initialized empty Byog repository in ${this.#byog_dir}`);
    return true;
  };


   // ===== Add Files / Directories =====
  addPath = (...paths) => {
    if (!fs.existsSync(this.#byog_dir)) {
    logError("Initialize repository first with `byog init`");
    return false;
  }

  let ignoreFiles = [];
  const ignorePath = path.join(this.#path, ".byogignore");
  if (fs.existsSync(ignorePath)) {
    ignoreFiles = fs
      .readFileSync(ignorePath, "utf-8")
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
  }

  let added = false;
  for (const p of paths) {
    const fullPath = path.join(this.#path, p);
    if (!fs.existsSync(fullPath)) {
      logError(`${p} not found`);
      continue; 
    }

    const stat = fs.statSync(fullPath);
    if (stat.isFile()) this.addFile(p, ignoreFiles);
    else if (stat.isDirectory()) this.addDir(p, ignoreFiles);

    added = true;
  }
  return added; 
};

  addDir = (dirPath, ignoreFiles) => {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    files.forEach((file) => {
      if (!ignoreFiles.includes(file.name)) {
        const fullPath = path.join(dirPath, file.name);
        if (file.isDirectory()) this.addDir(fullPath, ignoreFiles);
        else if (file.isFile()) this.addFile(fullPath, ignoreFiles);
      }
    });
  };

  addFile = (filePath, ignoreFiles) => {
    const fileName = path.basename(filePath);
    if (ignoreFiles.includes(fileName)) return;

    const content = fs.readFileSync(filePath);
    const blob = new Blob(content);
    const blobHash = storeObj(blob,this.#objects_dir);

    const index = loadIndex(this.#index_file)
    const normalizedPath = filePath.replace(/\\/g, "/");
    index[normalizedPath] = blobHash;

    saveIndex(this.#index_file,index);
    logInfo(`Added: ${filePath}`);
  };

   // ===== Branch management =====
  get_branch_commit(current_branch) {
    const branchFile = path.join(this.#heads_dir, current_branch);
    if (fs.existsSync(branchFile)) return fs.readFileSync(branchFile).toString().trim();
    return null;
  }

  set_branch_commit(current_branch, commit_hash) {
    const branchFile = path.join(this.#heads_dir, current_branch);
    fs.writeFileSync(branchFile, commit_hash + "\n");
  }

 
  //commit
  commit(message) {
     if (!fs.existsSync(this.#byog_dir)) {
    logError("Initialize repository first with `byog init`");
    return false;
  }
    const treeHash = this.createTree();
    const currentBranch = "master";
    const parentCommit = this.get_branch_commit(currentBranch);
    const parentHashes = parentCommit ? [parentCommit] : [];
    const timestamp = Math.floor(Date.now() / 1000);

    const index = loadIndex(this.#index_file)
    if (!index || Object.keys(index).length === 0) {
      logInfo("Nothing to commit. Staging area is empty.");
      return null;
    }

    if (parentCommit) {
      const parentCommitObj = loadObject(this.#objects_dir,parentCommit);
      const parentCommitData = Commit.deserialize(parentCommitObj.content);
      if (treeHash === parentCommitData.treeHash) {
        logInfo("Nothing to commit. No changes detected.");
        return null;
      }
    }

    const commit = new Commit(message, timestamp, treeHash, parentHashes);
    const commitHash = storeObj(commit,this.#objects_dir);
    this.set_branch_commit(currentBranch, commitHash);
    saveIndex(this.#index_file,{})
    logSuccess(`Created Commit ${commitHash} on branch ${currentBranch}`);
    return commitHash;
  }

   // ===== Tree creation =====
  createTree = () => {
    const index = loadIndex(this.#index_file)
    if (!index || Object.keys(index).length === 0) {
      const tree = new Tree();
      return storeObj(tree,this.#objects_dir);
    }

    let dirs = {};
    let files = {};

    for (const [file_path, hash] of Object.entries(index)) {
      const parts = file_path.split("/");
      if (parts.length === 1) files[parts[0]] = hash;
      else {
        let current = dirs;
        for (const part of parts.slice(0, -1)) {
          if (!current[part]) current[part] = {};
          current = current[part];
        }
        current[parts[parts.length - 1]] = hash;
      }
    }

    const addNode = (entries_obj) => {
      const tree = new Tree();
      for (const [name, hash] of Object.entries(entries_obj)) {
        if (typeof hash === "string") tree.addEntry("100644", name, hash);
        else if (typeof hash === "object") {
          const node_hash = addNode(hash);
          tree.addEntry("40000", name, node_hash);
        }
      }
      return storeObj(tree,this.#objects_dir);
    };

    for (const [dir_name, dir_content] of Object.entries(dirs)) {
      files[dir_name] = dir_content;
    }

    return addNode(files);
  };

   // ===== Garbage Collection =====
  gc = () => {
    if(!fs.existsSync(this.#byog_dir)){
      logInfo('initialize repository first: use byog init')
      process.exit(0)
    }
    const files = loadIndex(this.#index_file)
    const values = new Set(Object.values(files));
    const objDir = fs.readdirSync(this.#objects_dir);

    objDir.forEach((o) => {
      const dirPath = path.join(this.#objects_dir, o);
      const files = fs.readdirSync(dirPath);
      files.forEach((f) => {
        if (!values.has(o + f)) {
          const deleteFilePath = path.join(dirPath, f);
          fs.unlinkSync(deleteFilePath);
          logInfo(`Garbage Collected: ${deleteFilePath}`);
        }
      });
      if (fs.readdirSync(dirPath).length === 0) fs.rmdirSync(dirPath);
    });
    logSuccess("Garbage collection complete.");
  };
}

module.exports = Repository;