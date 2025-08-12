#!/usr/bin/env tsx
import { Command } from "commander";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "tasks.json");
class Tasks {
    #tasks = [];
    #nextId = 1;
    async load() {
        try {
            const data = await fs.readFile(DATA_FILE, "utf-8");
            const parsed = JSON.parse(data);
            this.#tasks = parsed.tasks || [];
            this.#nextId = parsed.nextId || 1;
        }
        catch (err) {
            if (err.code !== "ENOENT")
                throw err;
        }
    }
    async save() {
        const data = { tasks: this.#tasks, nextId: this.#nextId };
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    }
    getTasks(status) {
        return status
            ? this.#tasks.filter((t) => t.progress === status)
            : this.#tasks;
    }
    async addTask(name) {
        const task = { id: this.#nextId++, name, progress: "todo" };
        this.#tasks.push(task);
        await this.save();
        return task;
    }
    async updateTask(id, name) {
        const task = this.#tasks.find((t) => t.id === id);
        if (!task)
            return null;
        task.name = name;
        await this.save();
        return task;
    }
    async removeTask(id) {
        const index = this.#tasks.findIndex((t) => t.id === id);
        if (index === -1)
            return false;
        this.#tasks.splice(index, 1);
        await this.save();
        return true;
    }
    async markStatus(id, status) {
        const task = this.#tasks.find((t) => t.id === id);
        if (!task)
            return null;
        task.progress = status;
        await this.save();
        return task;
    }
}
async function main() {
    const program = new Command();
    const taskObj = new Tasks();
    await taskObj.load();
    program
        .name("task-cli")
        .description("A simple task tracker CLI")
        .version("1.0.0");
    program
        .command("add")
        .argument("<taskName...>", "Name of the task")
        .description("Add a new task")
        .action(async (taskNameParts) => {
        const taskName = taskNameParts.join(" ");
        const task = await taskObj.addTask(taskName);
        console.log(`Task added successfully (ID: ${task.id})`);
    });
    program
        .command("update")
        .argument("<id>", "Task ID")
        .argument("<newName...>", "New task name")
        .description("Update a task name")
        .action(async (id, newNameParts) => {
        const updated = await taskObj.updateTask(Number(id), newNameParts.join(" "));
        if (!updated)
            console.log(`Task ${id} not found`);
        else
            console.log(`Task ${id} updated successfully.`);
    });
    program
        .command("delete")
        .argument("<id>", "Task ID")
        .description("Delete a task")
        .action(async (id) => {
        const removed = await taskObj.removeTask(Number(id));
        if (!removed)
            console.log(`Task ${id} not found`);
        else
            console.log(`Task ${id} deleted successfully.`);
    });
    program
        .command("mark-in-progress")
        .argument("<id>", "Task ID")
        .description("Mark a task as in-progress")
        .action(async (id) => {
        const updated = await taskObj.markStatus(Number(id), "in-progress");
        if (!updated)
            console.log(`Task ${id} not found`);
        else
            console.log(`Task ${id} marked as in-progress.`);
    });
    program
        .command("mark-done")
        .argument("<id>", "Task ID")
        .description("Mark a task as done")
        .action(async (id) => {
        const updated = await taskObj.markStatus(Number(id), "done");
        if (!updated)
            console.log(`Task ${id} not found`);
        else
            console.log(`Task ${id} marked as done.`);
    });
    program
        .command("list")
        .argument("[status]", "Filter by status (todo, done, in-progress)")
        .description("List all tasks")
        .action((status) => {
        if (status && !["todo", "done", "in-progress"].includes(status)) {
            console.log(`Error: Invalid status "${status}".`);
            process.exit(1);
        }
        const tasks = taskObj.getTasks(status);
        if (tasks.length === 0)
            console.log("No tasks found.");
        else
            tasks.forEach((t) => console.log(`#${t.id} [${t.progress}] ${t.name}`));
    });
    await program.parseAsync(process.argv);
}
main().catch((err) => console.error(err));
//# sourceMappingURL=index.js.map