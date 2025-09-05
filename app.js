const Repository = require("./repository");

const argv = process.argv.slice(2);
const [command, subcommand, ...args] = argv;

const repo = new Repository();
repo.deleteFile();
if (command === "byog") {
  switch (subcommand) {
    case "help":
      console.log("byog available commands\nbyog init\nbyog add\nbyog commit");
      break;
    case "init":
      repo.init();
      break;
    case "add":
      repo.addPath(...args);
      break;
    case "gc":
      repo.gc();
      break;

      default:
        console.log('unkown command try byog help');
        
  }
} else {
  console.log("Unkown command");
}


