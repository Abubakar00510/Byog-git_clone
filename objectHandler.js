const fs = require("fs");
const path = require("path");
const ByogObject = require("./objects/byogObjects");
const { logError } = require("./utils/logger");

const storeObj = (obj,objectsDir) => {
    const obj_hash = obj.hash();
    const obj_dir = path.join(objectsDir, obj_hash.slice(0, 2));
    const obj_file = path.join(obj_dir, obj_hash.slice(2));

    if (!fs.existsSync(obj_dir)) fs.mkdirSync(obj_dir);
    if (!fs.existsSync(obj_file)) fs.writeFileSync(obj_file, obj.serialize());

    return obj_hash;
  };

  const loadObject = (obj_dir,objHash)=>{
    const objDir = path.join(obj_dir, objHash.slice(0, 2));
    const objFile = path.join(objDir, objHash.slice(2));

    if (!fs.existsSync(objFile)) {
      logError(`Object with hash ${objHash} not found`);
      return null;
    }

    return ByogObject.deserialize(fs.readFileSync(objFile));
  }


  module.exports = {loadObject,storeObj}