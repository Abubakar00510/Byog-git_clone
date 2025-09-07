const fs = require("fs");
const saveIndex = (indexFile, index) => {
  fs.writeFileSync(indexFile, JSON.stringify(index, null, 2));
};
const loadIndex = (indexFile) =>
  fs.existsSync(indexFile) ? JSON.parse(fs.readFileSync(indexFile)) : {};

module.exports = { saveIndex, loadIndex };
