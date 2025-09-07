# BYOG - Build Your Own Git

BYOG is a minimal Git-like version control system built in Node.js to help you understand how Git works internally. This project is designed for learning purposes — by reading and running this project, you can see how commits, blobs, and trees are managed under the hood.

---

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [Commands](#commands)
- [Project Structure](#project-structure)
- [Future Features](#future-features)
- [Learning Outcomes](#learning-outcomes)

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/byog.git
```
## Usage

All BYOG commands are run using:

**Windows:**  
```bash
.\byog byog <command> 
```

**Linux / macOS:**  
```bash
./byog byog <command> 
```

## How It Works

BYOG mimics core Git functionality. Here’s an overview of the main components:

### 1. Repository (`repository.js`)
- The heart of BYOG. Manages:
  - Initialization (`byog init`)
  - Staging files (`addPath`)
  - Creating trees (`createTree`)
  - Committing changes (`commit`)
  - Garbage collection (`gc`)
- Handles branch pointers and HEAD references.

### 2. Objects (`objects/`)
- **Blob (`blob.js`)** → Stores raw file content.
- **Tree (`tree.js`)** → Represents directories and maps file/directory names to hashes.
- **Commit (`commits.js`)** → Stores commit metadata: message, timestamp, tree hash, parent commits.
- **ByogObject (`byogObject.js`)** → Wrapper for serializing/deserializing objects for storage.

### 3. Index (`indexHandler.js`)
- Keeps track of staged files.
- Maps file paths to blob hashes.
- Read/Write operations to persist staging data.

### 4. Logger (`utils/logger.js`)
- Provides colored console output for errors, info, and success messages.

### 5. Object Handling (`objectHandler.js`)
- Low-level file system operations for storing and loading objects.
- Handles hashing and directory creation for objects.

### 6. CLI (`app.js` / `byog.bat`)
- Parses user commands.
- Invokes Repository methods based on commands (`init`, `add`, `commit`, `gc`, `help`).
- Displays outputs to the console.

### Workflow Summary
1. **Add files** → Files are converted to blobs, saved in `.byog/objects`, and indexed.
2. **Commit** → Tree objects are created recursively, commit object is stored, and branch updated.
3. **Garbage Collection** → Removes unreferenced blob objects, keeps commits and trees intact.


## Commands

### Initialize Repository
```bash
.\byog byog init
```
## Output

```text

██████╗ ██╗   ██╗ ██████╗  ██████╗ 
██╔══██╗██║   ██║██╔═══██╗██╔═══██╗
██████╔╝██║   ██║██║   ██║██║   ██║
██╔═══╝ ██║   ██║██║   ██║██║   ██║
██║     ╚██████╔╝╚██████╔╝╚██████╔╝
╚═╝      ╚═════╝  ╚═════╝  ╚═════╝ 

Welcome to BYOG - Build Your Own Git!

Initialized empty Byog repository in C:\Path\To\Repo\.byog
```
### Add Files to Staging
```bash
.\byog byog add file1.txt src/index.js
```

## Output:
```text
ℹ️ Added: file1.txt
ℹ️ Added: src/index.js
```

### Commit Staged Changes
```bash
.\byog byog commit -m "Initial commit"
```
## Output:
```text
Created Commit <commit-hash> on branch master
Commit complete! All staged changes have been saved.
🔹 Exiting BYOG... See you next time! 🔹
```

### Garbage Collection
```bash
.\byog byog gc
```
## Output:
```text
ℹ️ Garbage Collected: C:\Path\To\Repo\.byog\objects\9f\3a...
✅ Garbage collection complete.
```
### Help
```bash
.\byog byog help
```
## Output:
```text
BYOG Available Commands

byog init            → Initialize a new repository
byog add <file>      → Stage files for commit
byog commit -m "msg" → Commit staged changes
byog gc             → Garbage collect loose objects
```

# Project Structure
```text
byog/
├── objects/
│ ├── blob.js
│ ├── tree.js
│ ├── commits.js
│ └── byogObject.js
├── utils/
│ └── logger.js
├── .byogignore
├── app.js
├── byog.bat
├── indexHandler.js
├── objectHandler.js
├── README.md
└── repository.js
```
### Future Features

The BYOG project is continuously evolving. Planned features include:

- `status` → View staged, unstaged, and untracked changes
- `checkout` → Switch branches or revert to specific commits
- `branch` → Create, list, and delete branches
- Enhanced logging and error handling
- More Git-like commands to deepen understanding of version control internals

These features aim to make BYOG a more complete learning tool for developers who want to understand Git from the ground up.

## Learning Outcomes

By exploring BYOG, developers will learn:

- How Git stores objects (blobs, trees, commits)
- How staging and committing works internally
- How branches and HEAD references are managed
- How to implement a basic version control system from scratch
- How to apply Node.js for filesystem-based projects
