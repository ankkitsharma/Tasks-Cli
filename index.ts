#!/usr/bin/env tsx
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "tasks.json");

type TaskStatus = "todo" | "in-progress" | "done";

interface Task {
  id: number;
  name: string;
  progress: TaskStatus;
}

interface TaskFile {
  tasks: Task[];
  nextId: number;
}

class Tasks {
  #tasks: Task[] = [];
  #nextId = 1;

  async load(): Promise<void> {
    try {
      const data = await fs.readFile(DATA_FILE, "utf-8");
      const parsed: TaskFile = JSON.parse(data);
      this.#tasks = parsed.tasks || [];
      this.#nextId = parsed.nextId || 1;
    } catch (err: any) {
      if (err.code !== "ENOENT") throw err; // Ignore if file doesn't exist
    }
  }

  async save(): Promise<void> {
    const data: TaskFile = {
      tasks: this.#tasks,
      nextId: this.#nextId,
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  }

  getTasks(status?: TaskStatus): Task[] {
    if (!status) return this.#tasks;
    return this.#tasks.filter((task) => task.progress === status);
  }

  async addTask(name: string): Promise<Task> {
    const task: Task = { id: this.#nextId++, name, progress: "todo" };
    this.#tasks.push(task);
    await this.save();
    return task;
  }

  async updateTask(id: number, name: string): Promise<Task | null> {
    const task = this.#tasks.find((t) => t.id === id);
    if (!task) return null;
    task.name = name;
    await this.save();
    return task;
  }

  async removeTask(id: number): Promise<boolean> {
    const index = this.#tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.#tasks.splice(index, 1);
    await this.save();
    return true;
  }

  async markStatus(id: number, status: TaskStatus): Promise<Task | null> {
    const task = this.#tasks.find((t) => t.id === id);
    if (!task) return null;
    task.progress = status;
    await this.save();
    return task;
  }
}

// Main CLI logic
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const taskObj = new Tasks();
  await taskObj.load();

  if (args.length === 0) {
    console.log(`Usage: task-cli <command> [...args]
Commands:
  add <taskName>
  update <id> <newTaskName>
  delete <id>
  mark-in-progress <id>
  mark-done <id>
  list [status]
`);
    process.exit(1);
  }

  const command = args[0] as string;

  switch (command) {
    case "add": {
      const name = args.slice(1).join(" ");
      if (!name) {
        console.log("Error: Task name is required.");
        process.exit(1);
      }
      const task = await taskObj.addTask(name);
      console.log(`Task added successfully (ID: ${task.id})`);
      break;
    }

    case "update": {
      const id = Number(args[1]);
      const name = args.slice(2).join(" ");
      if (!id || !name) {
        console.log("Error: Task ID and new name are required.");
        process.exit(1);
      }
      const updated = await taskObj.updateTask(id, name);
      if (!updated) console.log(`Task ${id} not found`);
      else console.log(`Task ${id} updated successfully.`);
      break;
    }

    case "delete": {
      const id = Number(args[1]);
      if (!id) {
        console.log("Error: Task ID is required.");
        process.exit(1);
      }
      const removed = await taskObj.removeTask(id);
      if (!removed) console.log(`Task ${id} not found`);
      else console.log(`Task ${id} deleted successfully.`);
      break;
    }

    case "mark-in-progress": {
      const id = Number(args[1]);
      if (!id) {
        console.log("Error: Task ID is required.");
        process.exit(1);
      }
      const updated = await taskObj.markStatus(id, "in-progress");
      if (!updated) console.log(`Task ${id} not found`);
      else console.log(`Task ${id} marked as in-progress.`);
      break;
    }

    case "mark-done": {
      const id = Number(args[1]);
      if (!id) {
        console.log("Error: Task ID is required.");
        process.exit(1);
      }
      const updated = await taskObj.markStatus(id, "done");
      if (!updated) console.log(`Task ${id} not found`);
      else console.log(`Task ${id} marked as done.`);
      break;
    }

    case "list": {
      const status = args[1] as TaskStatus | undefined;
      if (status && !["todo", "done", "in-progress"].includes(status)) {
        console.log(`Error: Invalid status "${status}".`);
        process.exit(1);
      }
      const tasks = taskObj.getTasks(status);
      if (tasks.length === 0) console.log("No tasks found.");
      else
        tasks.forEach((t) => console.log(`#${t.id} [${t.progress}] ${t.name}`));
      break;
    }

    default:
      console.log(`Unknown command: ${command}`);
  }
}

main().catch((err) => console.error(err));
