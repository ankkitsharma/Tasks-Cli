# Task Tracker CLI

A simple command-line task tracker application built with Node.js and TypeScript. This project is part of the [roadmap.sh](https://roadmap.sh/projects/task-tracker) backend projects roadmap.

## Features

- ✅ Add new tasks
- ✏️ Update existing tasks
- 🗑️ Delete tasks
- 📝 Mark tasks as in-progress or done
- 📋 List all tasks or filter by status
- 💾 Persistent storage using JSON file

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Link the CLI globally:
   ```bash
   bun link
   ```

Now you can use the `task-cli` command from anywhere in your terminal.

## Usage

The CLI supports the following commands:

### Add a new task
```bash
task-cli add "Buy groceries"
```

### Update a task
```bash
task-cli update 1 "Buy groceries and cook dinner"
```

### Delete a task
```bash
task-cli delete 1
```

### Mark task as in-progress
```bash
task-cli mark-in-progress 1
```

### Mark task as done
```bash
task-cli mark-done 1
```

### List all tasks
```bash
task-cli list
```

### List tasks by status
```bash
task-cli list todo
task-cli list in-progress
task-cli list done
```

## Task Properties

Each task has the following properties:
- `id`: Unique identifier (auto-generated)
- `name`: Task description
- `progress`: Status (`todo`, `in-progress`, or `done`)

## Data Storage

Tasks are stored in a `tasks.json` file in the project directory. The file is automatically created when you add your first task.

## Development

Build the TypeScript code:
```bash
npx tsc
```

The compiled JavaScript files will be output to the `dist/` directory.

## Technologies Used

- **Node.js**: Runtime environment
- **TypeScript**: Type-safe JavaScript
- **Commander.js**: Command-line interface framework
- **File System**: JSON-based persistent storage
- **Bun**: Fast JavaScript runtime and package manager

## Project Structure

```
task-tracker/
├── index.ts          # Main application file
├── package.json      # Project dependencies
├── tsconfig.json     # TypeScript configuration
├── tasks.json        # Data storage (created automatically)
└── dist/             # Compiled JavaScript output
```

## About

This is a practice project from [roadmap.sh's backend projects](https://roadmap.sh/projects/task-tracker), designed to help developers learn backend development fundamentals including:

- Command-line interface development
- File system operations
- Data persistence
- TypeScript/Node.js development
- JSON data handling
