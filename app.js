const Repository = require("./repository");
const { logHeader, logError, logInfo, logSuccess } = require("./utils/logger");

const argv = process.argv.slice(2);
const [command, subcommand, ...args] = argv;

const repo = new Repository();

  const banner = `
  \x1b[33m██████╗ ██╗   ██╗ ██████╗  ██████╗ 
  ██╔══██╗██║   ██║██╔═══██╗██╔═══██╗
  ██████╔╝██║   ██║██║   ██║██║   ██║
  ██╔═══╝ ██║   ██║██║   ██║██║   ██║
  ██║     ╚██████╔╝╚██████╔╝╚██████╔╝
  ╚═╝      ╚═════╝  ╚═════╝  ╚═════╝ \x1b[0m
  `;

if (subcommand === "init") {
  console.log(banner);
  console.log("\x1b[36mWelcome to BYOG - Build Your Own Git!\x1b[0m\n");
}

if (command === "byog") {
  switch (subcommand) {
    case "help":
      logHeader("BYOG Available Commands");
      console.log(`
  \x1b[32mbyog init\x1b[0m           → Initialize a new repository
  \x1b[32mbyog add <file>\x1b[0m    → Stage files for commit
  \x1b[32mbyog commit -m "msg"\x1b[0m → Commit staged changes
  \x1b[32mbyog gc\x1b[0m           → Garbage collect loose objects
      `);
      break;

    case "init":
      if (repo.init()) logSuccess("Repository initialized successfully!");
        process.exit(0)

    case "add":
      if (args.length === 0) {
        logError("Please specify files to add. Example: byog add <file>");
      } else {
        repo.addPath(...args)
      }
      break;

    case "commit":
      if (args[0] === "-m" && args[1]) {
        if(repo.commit(args.slice(1).join(" "))){

          logSuccess("Commit complete! All staged changes have been saved.");
          console.log(
            "\n\x1b[36m🔹 Exiting BYOG... See you next time! 🔹\x1b[0m\n"
          );
          process.exit(0);
        }
      } else {
        logError('Usage: byog commit -m "your message"');
      }
      break;

    case "gc":
      repo.gc();
      break;

    default:
      logError("Unknown command. Try `byog help`.");
  }
} else {
  logError("Unknown command. Did you mean `byog`?");
}
