const logHeader = (text) => console.log(`\n\x1b[35m=== ${text} ===\x1b[0m\n`);
const logError = (text) => console.log(`\x1b[31mError:\x1b[0m ${text}`);
const logInfo = (text) => console.log(`\x1b[36m${text}\x1b[0m`);
const logSuccess = (text) => console.log(`\x1b[32m${text}\x1b[0m`);

module.exports = { logHeader, logError, logInfo, logSuccess };
